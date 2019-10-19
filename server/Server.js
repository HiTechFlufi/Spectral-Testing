"use strict";

let https = require("https");
const Autolinker = require("autolinker");

exports.Server = {
	nameColor: function (name, bold, userGroup) {
		let userGroupSymbol = `${Users.usergroups[toID(name)] ? `<strong><font color=#948A88>${Users.usergroups[toID(name)].substr(0, 1)}</font></strong>` : ``}`;
		return `${(userGroup ? userGroupSymbol : ``)}${(bold ? `<strong>` : ``)}<font color=${Server.hashColor(name)}>${(Users.get(name) && Users.get(name).connected && Users.getExact(name) ? Chat.escapeHTML(Users.getExact(name).name) : Chat.escapeHTML(name))}</font>${(bold ? `</strong>` : ``)}`;
	},

	// usage: Server.nameColor(user.name, true) for bold OR Server.nameColor(user.name, false) for non-bolded.

	pmAll: function (message, pmName) {
		pmName = (pmName ? pmName : `~${Config.serverName} Server`);
		Users.users.forEach(curUser => {
			curUser.send(`|pm|${pmName}|${curUser.getIdentity()}|${message}`);
		});
	},

	// format: Server.pmAll("message", "person")
	//
	// usage: Server.pmAll("Event in Lobby in 5 minutes!", "~Server")
	//
	// this makes a PM from ~Server stating the message.

	pmStaff: function (message, pmName, from) {
		pmName = (pmName ? pmName : `~${Config.serverName} Server [Staff PM]`);
		from = (from ? ` (PM from ${from})` : ``);
		Users.users.forEach(curUser => {
			if (!curUser.isStaff) return;
			curUser.send(`|pm|${pmName}|${curUser.getIdentity()}|${message}`);
		});
	},

	// format: Server.pmStaff("message", "person")
	//
	// usage: Server.pmStaff("Hey, Staff Meeting time", "~Server")
	//
	// this makes a PM from ~Server stating the message.

	messageSeniorStaff: function (message, pmName, from) {
		pmName = (pmName ? pmName : `~${Config.serverName} Server [Upper Staff PM]`);
		from = (from ? ` (PM from ${from})` : ``);
		Users.users.forEach(curUser => {
			if (Config.special.indexOf(curUser.id) !== -1 || curUser.group === "~" || curUser.group === "&") {
				curUser.send(`|pm|${pmName}|${curUser.getIdentity()}|${message}${from}`);
			}
		});
	},

	// format: Server.messageSeniorStaff("message", "person")
	//
	// usage: Server.messageSeniorStaff("Mystifi is a confirmed user and they were banned from a public room. Assess the situation immediately.", "~Server")
	//
	// this makes a PM from ~Server stating the message.

	devPM: function (user, message) {
		let developers = Db.devs.keys();
		for (const name of developers) {
			const u = Users.get(name);
			if (!(u && u.connected) || (u.id !== name)) continue;
			u.send(`|pm|${user}|${u.group}${u.name}|/raw ${message}\n<small style="font-style="italic">You can message DEV chat by using /devmsg [msg].</small>`);
		}
	},

	// Format: Server.devPM("person", "message")
	// Usage: Server.devPM("~Insist", "Hey, dev meeting in 10 minutes!");
	// This makes a PM from Insist stating the message.

	parseMessage: function (message) {
		if (message.substr(0, 5) === "/html") {
			message = message.substr(5);
			message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
			message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<strong>$1</strong>'); // bold
			message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
			message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
			message = Autolinker.link(message.replace(/&#x2f;/g, '/'), {stripPrefix: false, phone: false, twitter: false});
			return message;
		}
		message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<strong>$1</strong>'); // bold
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
		message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
		return message;
	},

	randomString: function (length) {
		return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	},

	reloadCSS: function () {
		const cssPath = ' '; // This should be the server id if Config.serverid doesn't exist. Ex: 'serverid'
		let req = https.get('https://play.pokemonshowdown.com/customcss.php?server=' + (Config.serverid || cssPath), () => {});
		req.end();
	},

	//Daily Rewards System for PS by Lord Haji
	giveDailyReward: function (user) {
		if (!user) return false;
		let reward = 0, time = Date.now();
		for (let ip in user.ips) {
			let cur = Db.DailyBonus.get(ip);
			if (!cur) {
				cur = [1, Date.now()];
				Db.DailyBonus.set(ip, cur);
			}
			if (cur[0] < reward || !reward) reward = cur[0];
			if (cur[1] < time) time = cur[1];
		}
		if (Date.now() - time < 86400000) return;
		reward++;
		if (reward > 7 || Date.now() - time > 172800000) reward = 1;
		// Loop again to set the ips values
		for (let ip in user.ips) {
			Db.DailyBonus.set(ip, [reward, Date.now()]);
		}
		Economy.writeMoney(user.id, reward);
		user.send(`|popup||wide||html|<center><u><strong><font size="3">${Config.serverName} Daily Bonus</font></strong></u><br />You have been awarded ${reward} ${reward === 1 ? moneyName : moneyPlural}.<br />${showDailyRewardAni(reward)}<br />Because you have connected to the server for the ${(reward === 1 ? "first time" : `past ${reward} days`)}.</center>`);
	},

	isEven: function (n) {
		return n % 2 === 0;
	},

	isOdd: function (n) {
		return Math.abs(n % 2) === 1;
	},

	// Pets AI info - a bit copied from the randomTeams file and some used from Wavelength's SGgame com file
	makeCOM: function () {
		if (Users.get('petsai')) return false;
		let user = new Users.User({user: false, send: function () {}, inRooms: new Set(), worker: {send: function () {}}, socketid: false, ip: '127.0.0.1', protocal: '', autojoin: '', isCOM: true});
		user.connected = true;
		user.avatar = 167;
		user.forceRename('Pets AI', true);
		return user;
	},

	decideCOM: function (battle, side) {
		// Only works within a battle process
		if (!battle || !side) return false;
		if (battle.ended) return false;
		switch (battle[side].requestState) {
		case 'move':
			if (battle[side].active[0].volatiles['mustrecharge'] || battle[side].active[0].volatiles['lockedmove'] || battle[side].active[0].volatiles['bide'] || battle[side].active[0].volatiles['twoturnmove'] || battle[side].active[0].volatiles['rollout'] || battle[side].active[0].volatiles['iceball'] || battle[side].active[0].volatiles['uproar']) return battle[side].choose('default');
			let moves = battle[side].pokemon[0].moves.slice(0);
			let best = {slot: 0, effectiveness: -3, noPP: 0};
			for (let j = 0; j < battle[side].pokemon[0].baseMoveSlots.length; j++) {
				if (battle[side].pokemon[0].baseMoveSlots[j].pp <= 0) best.noPP++;
			}
			if (best.noPP === moves.length) {
				// Struggle
				battle[side].choose('move 1');
				return true;
			}
			for (let i = 0; i < moves.length; i++) {
				let m = battle.dex.getMove(moves[i]);
				if (m.category === 'Status') continue;
				if (m.disabled) continue;
				let eff = battle.dex.getEffectiveness(m.type, battle[(side === 'p1' ? 'p2' : 'p1')].active[0].types);
				if (eff > best.effectiveness) {
					best.slot = (i + 1);
					best.effectiveness = eff;
				} else if (eff === best.effectiveness && battle.random(2) === 1) {
					best.slot = (i + 1);
				}
			}
			if (!best.slot) battle[side].choose('default');
			battle[side].choose('move ' + best.slot);
			break;
		case 'switch':
			// TODO
			battle[side].choose('default');
			break;
		case 'teampreview':
			battle[side].choose('team ' + (Math.floor(Math.random() * battle[side].team.length) + 1).toString());
			break;
		default:
			battle[side].choose('default');
		}
	},

	randomPetsAiTeam: function (size, format, userid) {
		let pokemonLeft = 0;
		let pokemon = [];
		let isUber = false;
		let isLc = false;
		let isRandom = false;
		let isMonotype = format === 'gen7petsmonotypebattle';
		let typePool = Object.keys(Dex.data.TypeChart);
		let type = typePool[random(typePool.length)];
		let banlist = ['Aegislash-Blade', 'Arceus', 'Deoxys-Base', 'Deoxys-Attack', 'Deoxys-Defense', 'Deoxys-Speed', 'Dialga', 'Giratina', 'Giratina-Origin', 'Groudon', 'Groudon-Primal', 'Ho-Oh', 'Kyogre', 'Kyogre-Primal', 'Kyurem-White',
			'Lugia', 'Lunala', 'Marshadow', 'Metagross-Mega', 'Mewtwo', 'Mewtwo-Mega-X', 'Mewtwo-Mega-Y', 'Naganadel', 'Necrozma-Dawn-Wings', 'Necrozma-Dusk-Mane', 'Necrozma-Ultra', 'Palkia', 'Rayquaza', 'Rayquaza-Mega', 'Reshiram', 'Shaymin-Sky', 'Solgaleo', 'Xerneas', 'Yveltal', 'Zekrom', 'Zygarde-Complete',
		];
	
		if (Dex.getFormat(format).name.indexOf('Uber') !== -1) isUber = true;
		if (Dex.getFormat(format).name.indexOf('LC') !== -1) isLc = true;
		if (Dex.getFormat(format).name.indexOf('Random') !== -1) isRandom = true;
	
		let pokemonPool = [];
		for (let id in Dex.data.FormatsData) {
			let template = Dex.getTemplate(id);
			if (banlist.indexOf(template.species) !== -1 && !isUber && !isRandom) continue;
	
			if (!isRandom && !template.isNonstandard) {
				// @ts-ignore
				if (isMonotype) {
					let types = template.types;
					if (types.indexOf(type) < 0) continue;
					if (template.tier === 'LC' || template.tier === 'LC Uber' || template.tier === 'NFE') continue;
					pokemonPool.push(id);
				}
				if (!isMonotype && isUber && template.tier === 'Uber' || !isMonotype && isLc && template.tier === 'LC') {
					pokemonPool.push(id);
					// @ts-ignore
				} else if (!isMonotype && !isLc && !isUber && template.tier !== 'LC Uber' && template.tier !== 'NFE' && template.tier !== 'LC') {
					pokemonPool.push(id);
				}
			} else {
				if (!template.isNonstandard) {
					// @ts-ignore
					if (template.tier !== 'LC' && template.tier !== 'LC Uber' && template.tier !== 'NFE' && template.tier !== 'Uber' && template.tier !== 'AG') pokemonPool.push(id);
				}
			}
		}
	
		let megaCount = 0;
		let baseFormes = {};
	
		while (pokemonPool.length && pokemonLeft < size) {
			let template = Dex.getTemplate(sampleNoReplace(pokemonPool));
			if (!template.exists) continue;
	
			let set = template;
			if (!set) continue;
			if (set.baseSpecies === 'Pikachu') continue;
			if (set.species.indexOf('Arceus') !== -1) set.species = 'Arceus';
			if (set.species.indexOf('Silvally') !== -1) set.species = 'Silvally';
			if (set.species === "Ditto" || set.species === 'Pichu-Spiky-eared') continue;
			let isMegaSet = set.isMega;
			if (isMegaSet && megaCount === 1) continue;
			if (isMegaSet) megaCount++;
			if (set.baseSpecies !== set.species && set.learnset) set.learnset = Object.assign(set.learnset, Dex.getTemplate(toID(set.baseSpecies)).learnset);
			if (!set.learnset && set.baseSpecies !== set.species) set.learnset = Dex.getTemplate(toID(set.baseSpecies)).learnset;
			if (!set.learnset) continue;
			let movePool = Object.keys(set.learnset);
			let moves = [];
			movePool = Dex.shuffle(movePool);
			// Choose next 4 moves from learnset/viable moves and add them to moves list:
			while (moves.length < 4 && movePool.length) {
				let moveid = sampleNoReplace(movePool);
				if (moveid === 'frustration') continue;
				// @ts-ignore
				if (Dex.getMove(moveid).category === 'Status' || !Dex.getMove(moveid).isViable) continue;
				if (moveid.substr(0, 11) === 'hiddenpower' && moves.includes('hiddenpower')) continue;
				if (Dex.getMove(moveid).category === 'Physical' && set.baseStats.spa > set.baseStats.atk || Dex.getMove(moveid).category === 'Special' && set.baseStats.atk > set.baseStats.spa) continue;
				moves.push(moveid);
			}
			if (!moves.length) continue;
			let evs = {hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20};
			if (!Db.petladder.get(userid, {})) {
				Db.petladder.set(userid, {});
			}
			let pl = Db.petladder.get(userid, {});
	
			if (pl[Dex.getFormat(format).id] >= 20) evs = {hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20};
			if (pl[Dex.getFormat(format).id] >= 40) evs = {hp: 40, atk: 40, def: 40, spa: 40, spd: 40, spe: 40};
			if (pl[Dex.getFormat(format).id] >= 60) evs = {hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80};
			if (pl[Dex.getFormat(format).id] >= 80) evs = {hp: 140, atk: 140, def: 140, spa: 140, spd: 140, spe: 140};
			if (pl[Dex.getFormat(format).id] >= 100) evs = {hp: 200, atk: 200, def: 200, spa: 200, spd: 200, spe: 200};
			if (pl[Dex.getFormat(format).id] >= 120) evs = {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255};
			let ability;
			if (!pl[Dex.getFormat(format).id] || pl[Dex.getFormat(format).id] < 80 || Dex.getFormat(format).id === 'gen7petsrandombattle') {
				ability = 'No Ability';
			}

			let mon = {
				name: set.name,
				species: set.species,
				moves: moves,
				ability: ability,
				evs: evs,
				ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
				item: false,
				level: 100,
				shiny: false,
			};
			// @ts-ignore
			if (pokemon.indexOf(mon) === -1 && pokemon.indexOf(mon.species) === -1) pokemon.push(mon);
	
			pokemonLeft++;
	
			baseFormes[template.baseSpecies] = 1;
		}
		// @ts-ignore
		pokemon = Dex.packTeam(pokemon);
		return pokemon;
	},
};

function showDailyRewardAni(streak) {
	let output = ``;
	for (let i = 1; i <= streak; i++) {
		output += `<img src="https://www.mukuru.com/media/img/icons/new_order.png" width="16" height="16" />`;
	}
	return output;
}

// ripped from random teams
const PRNG = require('../.sim-dist/prng').PRNG;
let prng = new PRNG();

function random(m, n) {
	return prng.next(m, n);
}

function fastPop(list, index) {
	let length = list.length;
	let element = list[index];
	list[index] = list[length - 1];
	list.pop();
	return element;
}

function sampleNoReplace(list) {
	let length = list.length;
	let index = random(length);
	return fastPop(list, index);
}
