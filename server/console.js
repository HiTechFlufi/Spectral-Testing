'use strict';

class Console {
	constructor(user, css, html, bottom, muted, sound) {
		this.title = 'Game Console';
		this.userid = user.id;
		this.muted = !!muted;
		this.sound = sound || null;
		this.curScreen = [null, null, null];
		this.prevScreen = [null, null, null];
		this.screenCSS = css || 'background-color: #000; font-size: 12px';
		let defaultInfo = `<div style="display: inline-block; color: white; font-family: monospace;">#####################<br />## PS Game Console ##<br />#####################<br /><br />This is the default screen. You probably meant to launch a game.<br />General Options:<br /><br />`;
		for (let game in Server.gameList) {
			if (!Server.gameList[game].startCommand) continue;
			defaultInfo += `<button name="send" value="/console forcestart ${game}" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>${(Server.gameList[game].name ? Server.gameList[game].name : game)}</u></button>`;
		}
		defaultInfo += `<br /><button name="send" value="/console kill" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>Shutdown</u></button></div>`;
		this.defaultHTML = html || defaultInfo;
		this.defaultBottomHTML = bottom || `<center><!--mutebutton--><button name="send" value="/console sound" class="button">${(this.muted ? 'Unmute' : 'Mute')}</button><!--endmute--> <button class="button" name="send" value="/console kill">Power</button></center>`;
	}

	init() {
		Users.get(this.userid).send(`>view-gameconsole\n|init|html\n|title|${this.title}\n|pagehtml|${this.buildConsole()}`);
	}

	update(css, html, bottom) {
		Users.get(this.userid).send(`>view-gameconsole\n|pagehtml|${this.buildConsole(css, html, bottom)}`);
		this.prevScreen = this.curScreen;
		this.curScreen = [(css || null), (html || null), (bottom || null)];
	}

	buildConsole(css, html, bottom) {
		return `<div class="infobox" style="height: 500px; font-size: 0"><audio autoplay loop ${(this.muted ? 'muted' : '')} src="${(this.sound || '')}"></audio><button style="border: none; color: black; background-color: #999; width:100%; height: 7%; display: block" name="send" value="/console up">&#8593;</button><button style="border: none; color:black; background-color: #999; width: 7%; height: 65%; display: inline-block; float: left" name="send" value="/console left">&#8592;</button><div style="width:86%; height: 65%; display: inline-block; position: relative; font-size: 9pt; ${(css ? css : this.screenCSS)}">${(html ? html : this.defaultHTML)}</div><button style="border: none; color: black; background-color: #999; width: 7%; height: 65%; display: inline-block; float: right" name="send" value="/console right">&#8594;</button><button style="border: none; color: black; background-color: #999; width: 100%; height: 7%; display: block" name="send" value="/console down">&#8595;</button><div style="border: 0.45em solid #6688AA; width: 97.7%; height: 18%; font-size: 14px">${(bottom ? bottom : this.defaultBottomHTML)}</div></div>`;
	}

	toggleSound() {
		this.muted = !this.muted;
		if (this.defaultBottomHTML && this.defaultBottomHTML.indexOf("<!--mutebutton-->") > -1 && this.defaultBottomHTML.indexOf("<!--endmute-->") > -1) {
			this.defaultBottomHTML = this.defaultBottomHTML.split("<!--mutebutton-->")[0] + '<!--mutebutton--><button name="send" value="/console sound" class="button">' + (this.muted ? 'Unmute' : 'Mute') + '</button><!--endmute-->' + this.defaultBottomHTML.split("<!--endmute-->")[1];
		}
		if (this.curScreen[2] && this.curScreen[2].indexOf("<!--mutebutton-->") > -1 && this.curScreen[2].indexOf("<!--endmute-->") > -1) {
			this.curScreen[2] = this.curScreen[2].split("<!--mutebutton-->")[0] + '<!--mutebutton--><button name="send" value="/console sound" class="button">' + (this.muted ? 'Unmute' : 'Mute') + '</button><!--endmute-->' + this.curScreen[2].split("<!--endmute-->")[1];
		}
		if (this.prevScreen[2] && this.prevScreen[2].indexOf("<!--mutebutton-->") > -1 && this.prevScreen[2].indexOf("<!--endmute-->") > -1) {
			this.prevScreen[2] = this.prevScreen[2].split("<!--mutebutton-->")[0] + '<!--mutebutton--><button name="send" value="/console sound" class="button">' + (this.muted ? 'Unmute' : 'Mute') + '</button><!--endmute-->' + this.prevScreen[2].split("<!--endmute-->")[1];
		}
		this.update(this.curScreen[0], this.curScreen[1], this.curScreen[2]);
	}

	// Overwrite these to use them.
	up(data) {}

	down(data) {}

	left(data) {}

	right(data) {}

	onRename(user, oldid, joining, isForceRenamed) {}

	onKill() {}
}

exports.commands = {
	console: {
		up(target, room, user) {
			if (!user.console) return;
			user.console.up(target);
		},

		down(target, room, user) {
			if (!user.console) return;
			user.console.down(target);
		},

		left(target, room, user) {
			if (!user.console) return;
			user.console.left(target);
		},

		right(target, room, user) {
			if (!user.console) return;
			user.console.right(target);
		},

		sound(target, room, user) {
			if (!user.console) return;
			user.console.toggleSound();
		},

		forcestart: 'start',
		start(target, room, user, connection, cmd, message) {
			if (user.console && cmd !== 'forcestart') return;
			if (cmd === 'forcestart') this.parse('/console kill');
			if (!target || Object.keys(Server.gameList).indexOf(toID(target)) === -1) {
				user.console = new Console(user);
				return user.console.init();
			}
			return this.parse(Server.gameList[toID(target)].startCommand);
		},

		kill(target, room, user) {
			if (!user.console) return;
			user.send(`>view-gameconsole\n|deinit`);
			user.console.onKill();
			delete user.console;
		},
	},
};
exports.Console = Console;
