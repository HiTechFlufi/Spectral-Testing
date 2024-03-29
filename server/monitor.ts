/**
 * Monitor
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Various utility functions to make sure PS is running healthily.
 *
 * @license MIT
 */
'use strict';

import {exec, ExecException, ExecOptions} from 'child_process';
import {crashlogger} from "../lib/crashlogger";
import {FS} from "../lib/fs";

const MONITOR_CLEAN_TIMEOUT = 2 * 60 * 60 * 1000;

/**
 * This counts the number of times an action has been committed, and tracks the
 * delta of time since the last time it was committed. Actions include
 * connecting to the server, starting a battle, validating a team, and
 * sending/receiving data over a connection's socket.
 */
class TimedCounter extends Map<string, [number, number]> {
	/**
	 * Increments the number of times an action has been committed by one, and
	 * updates the delta of time since it was last committed.
	 *
	 */
	increment(key: string, timeLimit: number): /** [action count, time delta] */ [number, number] {
		const val = this.get(key);
		const now = Date.now();
		if (!val || now > val[1] + timeLimit) {
			this.set(key, [1, Date.now()]);
			return [1, 0];
		} else {
			val[0]++;
			return [val[0], now - val[1]];
		}
	}
}

// Config.loglevel is:
// 0 = everything
// 1 = debug (same as 0 for now)
// 2 = notice (default)
// 3 = warning
// (4 is currently unused)
// 5 = supposedly completely silent, but for now a lot of PS output doesn't respect loglevel
if (('Config' in global) &&
		(typeof Config.loglevel !== 'number' || Config.loglevel < 0 || Config.loglevel > 5)) {
	Config.loglevel = 2;
}

export const Monitor = {
	/*********************************************************
	 * Logging
	 *********************************************************/
	crashlog(error: Error, source = 'The main process', details: {} | null = null) {
		if ((error.stack || '').startsWith('@!!@')) {
			try {
				const stack = (error.stack || '');
				const nlIndex = stack.indexOf('\n');
				[error.name, error.message, source, details] = JSON.parse(stack.slice(4, nlIndex));
				error.stack = stack.slice(nlIndex + 1);
			} catch (e) {}
		}
		const crashType = crashlogger(error, source, details);
		Rooms.global.reportCrash(error, source);
		if (crashType === 'lockdown') {
			Rooms.global.startLockdown(error);
		}
	},

	log(text: string) {
		this.notice(text);
		if (Rooms.get('staff')) {
			Rooms.get('staff').add(`|c|~|${text}`).update();
		}
	},

	adminlog(text: string) {
		this.notice(text);
		if (Rooms.get('upperstaff')) {
			Rooms.get('upperstaff').add(`|c|~|${text}`).update();
		}
	},

	logHTML(text: string) {
		this.notice(text);
		if (Rooms.get('staff')) {
			Rooms.get('staff').add(`|html|${text}`).update();
		}
	},

	debug(text: string) {
		if (Config.loglevel <= 1) console.log(text);
	},

	warn(text: string) {
		if (Config.loglevel <= 3) console.log(text);
	},

	notice(text: string) {
		if (Config.loglevel <= 2) console.log(text);
	},

	/*********************************************************
	 * Resource Monitor
	 *********************************************************/

	clean() {
		this.clearNetworkUse();
		this.battlePreps.clear();
		this.battles.clear();
		this.connections.clear();
		IPTools.dnsblCache.clear();
	},

	connections: new TimedCounter(),
	battles: new TimedCounter(),
	battlePreps: new TimedCounter(),
	groupChats: new TimedCounter(),
	tickets: new TimedCounter(),

	activeIp: null as string | null,
	networkUse: {} as unknown as {[k: string]: number},
	networkCount: {} as unknown as {[k: string]: number},
	hotpatchLock: {} as unknown as {[k: string]: number},
	hotpatchVersions: {} as unknown as {[k: string]: number},

	/**
	 * Counts a connection. Returns true if the connection should be terminated for abuse.
	 */
	countConnection(ip: string, name = '') {
		const [count, duration] = this.connections.increment(ip, 30 * 60 * 1000);
		if (count === 500) {
			this.adminlog(`[ResourceMonitor] IP ${ip} banned for cflooding (${count} times in ${Chat.toDurationString(duration)}${name ? ': ' + name : ''})`);
			return true;
		}

		if (count > 500) {
			if (count % 500 === 0) {
				const c = count / 500;
				if (c === 2 || c === 4 || c === 10 || c === 20 || c % 40 === 0) {
					this.adminlog(`[ResourceMonitor] IP ${ip} still cflooding (${count} times in ${Chat.toDurationString(duration)}${name ? ': ' + name : ''})`);
				}
			}
			return true;
		}

		return false;
	},

	/**
	 * Counts battles created. Returns true if the connection should be
	 * terminated for abuse.
	 */
	countBattle(ip: string, name = '') {
		const [count, duration] = this.battles.increment(ip, 30 * 60 * 1000);
		if (duration < 5 * 60 * 1000 && count % 30 === 0) {
			this.adminlog(`[ResourceMonitor] IP ${ip} has battled ${count} times in the last ${Chat.toDurationString(duration)}${name ? ': ' + name : ''})`);
			return true;
		}

		if (count % 150 === 0) {
			this.adminlog(`[ResourceMonitor] IP ${ip} has battled ${count} times in the last ${Chat.toDurationString(duration)}${name ? ': ' + name : ''}`);
			return true;
		}

		return false;
	},

	/**
	 * Counts team validations. Returns true if too many.
	 */
	countPrepBattle(ip: string, connection: Connection) {
		const count = this.battlePreps.increment(ip, 3 * 60 * 1000)[0];
		if (count <= 12) return false;
		if (count < 120 && Punishments.sharedIps.has(ip)) return false;
		connection.popup('Due to high load, you are limited to 12 battles and team validations every 3 minutes.');
		return true;
	},

	/**
	 * Counts concurrent battles. Returns true if too many.
	 */
	countConcurrentBattle(count: number, connection: Connection) {
		if (count <= 5) return false;
		connection.popup(`Due to high load, you are limited to 5 games at the same time.`);
		return true;
	},
	/**
	 * Counts group chat creation. Returns true if too much.
	 */
	countGroupChat(ip: string) {
		const count = this.groupChats.increment(ip, 60 * 60 * 1000)[0];
		return count > 4;
	},

	/**
	 * Counts ticket creation. Returns true if too much.
	 */
	countTickets(ip: string) {
		const count = this.tickets.increment(ip, 60 * 60 * 1000)[0];
		if (Punishments.sharedIps.has(ip)) {
			return count >= 20;
		} else {
			return count >= 5;
		}
	},

	/**
	 * Counts the data length received by the last connection to send a
	 * message, as well as the data length in the server's response.
	 */
	countNetworkUse(size: number) {
		if (!Config.emergency || typeof this.activeIp !== 'string') return;
		if (this.activeIp in this.networkUse) {
			this.networkUse[this.activeIp] += size;
			this.networkCount[this.activeIp]++;
		} else {
			this.networkUse[this.activeIp] = size;
			this.networkCount[this.activeIp] = 1;
		}
	},

	writeNetworkUse() {
		let buf = '';
		for (const i in this.networkUse) {
			buf += `${this.networkUse[i]}\t${this.networkCount[i]}\t${i}\n`;
		}
		void FS('logs/networkuse.tsv').write(buf);
	},

	clearNetworkUse() {
		if (Config.emergency) {
			this.networkUse = {};
			this.networkCount = {};
		}
	},

	/**
	 * Counts roughly the size of an object to have an idea of the server load.
	 */
	sizeOfObject(object: AnyObject) {
		const objectCache: Set<[] | object> = new Set();
		const stack: any[] = [object];
		let bytes = 0;

		while (stack.length) {
			const value = stack.pop();
			switch (typeof value) {
			case 'boolean':
				bytes += 4;
				break;
			case 'string':
				bytes += value.length * 2;
				break;
			case 'number':
				bytes += 8;
				break;
			case 'object':
				if (!objectCache.has(value)) objectCache.add(value);
				if (Array.isArray(value)) {
					for (const el of value) stack.push(el);
				} else {
					for (const i in value) stack.push(value[i]);
				}
				break;
			}
		}

		return bytes;
	},

	sh(command: string, options: ExecOptions = {}): Promise<[number, string, string]> {
		return new Promise((resolve, reject) => {
			exec(command, options, (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => {
				resolve([error && error.code || 0, '' + stdout, '' + stderr]);
			});
		});
	},

	async version() {
		let hash;
		try {
			await FS('.git/index').copyFile('logs/.gitindex');
			const index = FS('logs/.gitindex');
			const options = {
				cwd: __dirname,
				env: {GIT_INDEX_FILE: index.path},
			};

			let [code, stdout, stderr] = await this.sh(`git add -A`, options);
			if (code || stderr) return;
			[code, stdout, stderr] = await this.sh(`git write-tree`, options);

			if (code || stderr) return;
			hash = stdout.trim();

			await this.sh(`git reset`, options);
			await index.unlinkIfExists();
		} catch (err) {}
		return hash;
	},

	TimedCounter: TimedCounter as new(entries: [any, [number, number]]) => TimedCounter,

	updateServerLock: false,
	cleanInterval: null as NodeJS.Timeout | null,
};

Monitor.cleanInterval = setInterval(() => Monitor.clean(), MONITOR_CLEAN_TIMEOUT);
