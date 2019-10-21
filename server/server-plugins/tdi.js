/************************
 * Total Drama Showdown *
 * Created by: Insist   *
 *   Idea by: Mewth		*
 ************************/

"use strict";

const timer = 60; // defaults to 60 minutes

class TDI {
	constructor(room, host) {
		this.players = [];
		this.room = room;
		room.tdiNumber = room.tdiNumber ? room.tdiNumber++ : 1;
		this.tdiNumber = room.tdiNumber;
		this.state = "signups";
		this.prizeMoney = 0;
		this.host = host;
		this.room.add(`|uhtml|tdi-${this.tdiNumber}|<div class="broadcast-green"><center><p style="font-size: 14pt">Do you wanna be famous?</p><br /><p style="font-size: 10pt><strong>A new Total Drama Island season is casting!</strong></p><br /><p style="font-size: 9pt"><button name="send" value="/tdi join">Yeah!</button><br /></p><small><p>Every user that joins raises the prize money by 20 ${moneyPlural}.<br />Disclaimer: Seasons of Total Drama Island may take upwards of an hour to complete.</div>`, true);
		this.timer = setTimeout(() => {
			if (this.players.length < 2 || room.tdi.players.length % 2 !== 0) {
				this.room.add(`|uhtmlchange|tdi-${this.tdiNumber}|<div class="broadcast-red"><p style="text-align: center; font-size: 14pt>This season of Total Drama Island has been cancelled.</p></div>`);
				return this.end();
			}
			this.start();
		}, 1000 * 60 * timer);
	}

	onConnect(user, connection) {
	  user.sendTo(this.room, `|uhtml|tdi-${this.tdiNumber}|<div class="broadcast-green"><center><p style="font-size: 14pt">Do you wanna be famous?</p><br /><p style="font-size: 10pt><strong>A new Total Drama Island season is casting!</strong></p><br /><p style="font-size: 9pt"><button name="send" value="/tdi join">Yeah!</button><br /></p><small><p>Every user that joins raises the prize money by 20 ${moneyPlural}.<br />Disclaimer: Seasons of Total Drama Island may take upwards of an hour to complete.</div>`);
  }

	join(user) {
		if (this.state !== "signups") return user.sendTo(this.room, `Sorry, the season of Total Drama Island going on in this room is already airing.`);
		if (this.players.includes(user.id)) return user.sendTo(this.room, `You have already joined this season of Total Drama Island.`);
		if (this.host === user.id) return user.sendTo(this.room, `You are the host, so you cannot join the game too.  Sorry!`);
		this.players.push(user.id);
		this.room.add(`|html|${Server.nameColor(user.name, true)} has joined the cast of this season of Total Drama Island.`);
	}

	leave(user) {
		if (!this.players.includes(user.id)) return user.sendTo(this.room, `You have not joined this season of Total Drama Island yet.`);
		if (this.state !== "signups") {
			this.eliminate(user);
		} else {
			this.room.add(`|html|${Server.nameColor(user.name, true)} has left this season of Total Drama Island.`);
			this.players.splice(this.players.indexOf(user.id), 1);
		}
	}

	start() {
		this.room.add(`|uhtmlchange|tdi-${this.tdiNumber}|<div><strong><p style= 14pt>A new season of Total Drama Island has begun airing.</p></strong></div>`);
		this.state = "started";
		this.prizeMoney = this.players.length * 20;
		this.room.add(`The prize money has been locked in at a total of ${this.prizeMoney} ${moneyPlural}.`);
		this.room.add(`|html|Everyone please welcome your host for this season ${Server.nameColor(this.host, true, true)}!`);
		this.decideTeams();
	}

	decideTeams() {
		let contestants = Dex.shuffle(this.players.slice());
		let team1 = [];
		let team2 = [];
		for (let i = 0; i < contestants.length; i++) {
			if (i % 2 === 0) {
				team1.push(contestants[i]);
				this.team1 = team1;
			} else {
				team2.push(contestants[i]);
				this.team2 = team2;
			}
		}
		this.room.add(`|html|${Chat.toListString((team1.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))} are our first team of contestants :D`);
		this.room.add(`|html|${Chat.toListString((team2.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))} are our second team of contestants :D`);
		this.room.add(`|html|<center><strong>Good luck!</strong></center>`);
		this.room.add(`|html|<i>Chat amongst your team, and assign a Captain for your team.  Captains, make a groupchat using /makegroupchat and make sure to invite ${Server.nameColor(this.host, true, true)} to your chat, as well as your team.</i>`);
		this.giveChallenge();
	}

	giveChallenge() {
		let challenges = ["Uno", "Tournament of Team 1's choice", "Tournament of Team 2's choice", "Ambush", "Hangman", "Pass The Bomb", "Guess Who", "Blackjack"];
		let challenge = challenges[Math.floor(Math.random() * challenges.length)];
		this.room.add(`<h3>Hello contestants, your challenge for this round is ${challenge}.  Good luck!</h3>`);
	}

	eliminate(target) {
		target = toID(target);
		if (!this.players.includes(target)) return false;
		this.room.add(`|html|${Server.nameColor(target, true)} has been casted off this season of Total Drama Island.`);
		if (this.team1.includes(target)) {
			this.team1.splice(this.team1.indexOf(target), 1);
			this.players.splice(this.players.indexOf(target), 1);
		} else if (this.team2.includes(target)) {
			this.team2.splice(this.team2.indexOf(target), 1);
			this.players.splice(this.players.indexOf(target), 1);
		} else {
			this.players.splice(this.players.indexOf(target), 1); // Should never happen
		}
		if (this.players.length === 1) {
			return this.win();
		}
		this.giveChallenge();
		clearTimeout(this.timer);
	}

	win() {
		let winner = this.players[0];
		Economy.writeMoney(winner, this.prizeMoney);
		Economy.logTransaction(`${Users.get(winner).name} has won a season of Total Drama Island worth ${this.prizeMoney}.`);
		this.room.add(`|html|${Server.nameColor(Users.get(winner).name, true)} has won this season of Total Drama Island and got the ${this.prizeMoney} prize! Thank you all for playing!`);
		this.end();
	}

	end() {
		clearTimeout(this.timer);
		this.room.add(`|uhtmlchange|tdi-${this.tdiNumber}|This season of Total Drama Island has ended.`);
		delete this.room.tdi;
	}
}

exports.commands = {
	totaldramashowdown: "tdi",
	totaldramaisland: "tdi",
	tds: "tdi",
	tdi: {
		create: "new",
		make: "new",
		new(target, room, user) {
			if (!this.can("ban", null, room)) return false;
			if (!this.canTalk()) return this.errorReply("You cannot use this while unable to speak.");
			if (room.roomid !== "totaldramaisland") return this.errorReply("This command only works in Total Drama Island.");
			if (room.tdi) return this.errorReply("There is an ongoing season of Total Drama Island in here.");
			if (!target) return this.errorReply(`Specify who will be hosting this season of Total Drama Island.`);
			room.tdi = new TDI(room, toID(target));
		},

		j: "join",
		join(target, room, user) {
			if (!this.canTalk()) return this.errorReply("You cannot join a season of Total Drama Island while unable to speak.");
			if (!user.registered) return this.errorReply("You cannot join a season of Total Drama Island on unregistered accounts.");
			if (!room.tdi) return this.errorReply(`There is not a season of Total Drama Island airing right now.`);
			if (room.tdi.players.length === 12) return this.errorReply(`The ongoing season of Total Drama Island is currently at its player cap.`);
			room.tdi.join(user);
		},

		l: "leave",
		leave(target, room, user) {
			if (!room.tdi) return this.errorReply(`There is not a season of Total Drama Island airing right now.`);
			room.tdi.leave(user);
		},

		begin: "start",
		proceed: "start",
		start(target, room, user) {
			if (!room.tdi || room.tdi.state !== "signups") return this.errorReply("There is not a Total Drama Island season ready to start.");
			if (!this.can("ban", null, room) && room.tdi.host !== user.id) return false;
			if (room.tdi.players.length < 2 || room.tdi.players.length > 16 || room.tdi.players.length % 2 !== 0) return this.errorReply(`We must have an even amount of contestants between the range of 2-16 to begin airing.`);
			room.tdi.start();
			this.privateModAction(`(${user.name} has started the season of Total Drama Island early.)`);
		},

		remove: "disqualify",
		dq: "disqualify",
		elim: "disqualify",
		eliminate: "disqualify",
		disqualify(target, room, user) {
			if (!room.tdi || room.tdi.state === "signups") return this.errorReply("A season of Total Drama Island must be airing to use this command.");
			if (!this.can("ban", null, room) && room.tdi.host !== user.id) return false;
			target = toID(target);
			if (!target) return this.errorReply("This command requires a target.");
			room.tdi.eliminate(target);
		},

		stop: "end",
		cancel: "end",
		end(target, room, user) {
			if (!room.tdi) return this.errorReply("There is not an ongoing Total Drama Island season right now.");
			if (!this.can("ban", null, room) && room.tdi.host !== user.id) return false;
			room.tdi.end();
			this.privateModAction(`(${user.name} has cancelled the season of Total Drama Island.)`);
		},

		checkplayers: "players",
		list: "players",
		viewplayers: "players",
		players(target, room, user) {
			if (!this.runBroadcast()) return;
			if (!room.tdi) return this.errorReply("There is not an ongoing Total Drama Island season currently.");
			return this.sendReplyBox(`There is currently ${this.room.tdi.players.length} player${this.room.tdi.players.length > 1 ? "s" : ""} in this season of Total Drama Island.<br /> Players: ${Chat.toListString((this.room.tdi.players.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))}.<br /><strong>The host is ${Server.nameColor(room.tdi.host, true, true)}</strong>`);
		},

		forceadd: "sub",
		revive: "sub",
		sub(target, room, user) {
			if (!room.tdi || room.tdi.state === "signups") return this.errorReply(``);
			if (!this.can("ban", null, room) && room.tdi.host !== user.id) return false;
			let [subin, team] = target.split(",").map(p => p.trim());
			if (!(subin && team)) return this.parse(`/tdihelp`);
			subin = toID(subin), team = toID(team);
			if (!Users.get(subin) || !Users.get(subin).connected) return this.errorReply(`${subin} does not appear to be online.`);
			if (!["team1", "team2"].includes(team)) return this.errorReply(`${team} should be Team 1 or Team 2.`);
			room.tdi.players.push(subin);
			if (team === "team1") {
				room.tdi.team1.push(subin);
			} else {
				room.tdi.team2.push(subin);
			}
			room.add(`|html|${Server.nameColor(subin, true)} has been added to into the game joining ${team === "team1" ? "Team 1" : "Team 2"}.`);
			Users.get(subin).popup(`|html|${Server.nameColor(user.name, true, true)} has added you into the ongoing season of Total Drama Island.`);
		},

		as: "autostart",
		timer: "autostart",
		autostart(target, room, user) {
			if (!room.tdi) return this.errorReply("There is not an ongoing Total Drama Island session right now.");
			if (!this.can("minigame", null, room) && room.tdi.host !== user.id) return;
			if (!target || isNaN(target)) return this.errorReply(`You must specify a numerical number of minutes for the season to autostart.`); 
			if (target < 5 || target > 60) return this.errorReply("The amount must be a number between 5 and 60.");

			room.tdi.timer = target;
			this.addModAction(`${user.name} has set the TDI automatic start timer to ${target} minutes.`);
			this.modlog("TDI TIMER", null, `${target} minutes`);
		},

		mv: "mustvote",
		mustvote(target, room, user) {
			if (!room.tdi || room.tdi.state === "signups") return this.errorReply("A season of Total Drama Island must be airing to use this command.");
			if (!this.can("ban", null, room) && room.tdi.host !== user.id) return false;
			target = toID(target);
			let teams = ["team1", "team2"];
			if (!target || !teams.includes(target)) return this.errorReply(`This command accepts the following arguments: Team 1 or Team 2.`);
			// Make a poll of all of the team's members
			if (target === "team1") {
				if (room.tdi.team1.length > 1) {
					room.add(`Sorry Team 1, but you must vote to cast a teammate off.`);
					let poll = `Team 1 please vote to cast off one of your teammates!,`;
					poll += room.tdi.team1.join(", ");
					this.parse(`/poll create ${poll}`);
				} else {
					room.tdi.eliminate(room.tdi.team1); // If the user is the last of their team, just eliminate them.
				}
			}
			if (target === "team2") {
				if (room.tdi.team2.length > 1) {
					room.add(`Sorry Team 2, but you must vote to cast a teammate off.`);
					let poll = `Team 2 please vote to cast off one of your teammates!,`;
					poll += room.tdi.team2.join(", ");
					this.parse(`/poll create ${poll}`);
				} else {
					room.tdi.eliminate(room.tdi.team2); // If the user is the last of their team, just eliminate them.
				}
			}
		},

		prizemoney: "prize",
		pot: "prize",
		jackpot: "prize",
		prize(target, room, user) {
			if (!room.tdi) return this.errorReply(`There must be an ongoing season of Total Drama Island to check the pot.`);
			if (!this.runBroadcast()) return;
			let pot = this.room.tdi.players.length * 20;
			return this.sendReplyBox(`<strong>The current prize money for this season of Total Drama Island is ${room.tdi.state === "signups" ? pot : room.tdi.prizeMoney} ${moneyPlural}${(room.tdi.state === "signups" ? ", and may continue to rise/fall." : ".")}</strong>`);
		},

		host: "teams",
		"team2": "teams",
		"team1": "teams",
		team: "teams",
		teams(target, room, user, connection, cmd) {
			if (!room.tdi || room.tdi.state === "signups") return this.errorReply(`There must be a started season of Total Drama Island to check the teams.`);
			if (!this.runBroadcast()) return;
			if (cmd === "team1") {
				return this.sendReplyBox(`Team 1 has the following members: ${Chat.toListString((room.tdi.team1.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))}.`);
			} else if (cmd === "team2") {
				return this.sendReplyBox(`Team 2 has the following members: ${Chat.toListString((room.tdi.team2.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))}.`);
			} else if (cmd === "host") {
				return this.sendReplyBox(`The host for this season of Total Drama Island is ${Server.nameColor(room.tdi.host, true, true)}.`);
			} else {
				return this.sendReplyBox(`Team 1 has the following members: ${Chat.toListString((room.tdi.team1.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))}.<br />Team 2 has the following members: ${Chat.toListString((room.tdi.team2.map(u => { return Server.nameColor(Users.get(u).name, true, true); })))}.<br /><strong>Host:</strong> ${Server.nameColor(room.tdi.host, true, true)}.`);
			}
		},

		skipchallenge(target, room, user) {
			if (!room.tdi || room.tdi.state === "signups") return this.errorReply(`There must be a started season of Total Drama Island to skip challenges.`);
			if (!this.can("minigame", null, room) & room.tdi.host !== user.id) return false;
			room.tdi.giveChallenge();
		},

		"": "help",
		help() {
			this.parse(`/tdihelp`);
		},
	},

	tdihelp: [
		`/tdi new [host] - Creates a Total Drama Island game. Requires Room Moderator or higher in the Total Drama Island room.
		/tdi start - Starts the Total Drama Island game. Requires Host, Room Moderator or higher in the Total Drama Island room.
		/tdi autostart [amount of minutes until start] - Sets the auto-start timer. Requires Host, Room Voice or higher in the Total Drama Island room.
		/tdi dq [user] - Disqualifies a user from the session of Total Drama Island. Requires Host, Room Moderator or higher in the Total Drama Island room.
		/tdi mv [team1|team2] - Requires the specified team to vote to cast out one of their teammates. Requires Host, Room Moderator or higher in the Total Drama Island.
		/tdi forceadd [user], [team1|team2] - Forcibly adds [user] into [team] as a player.  Requires Host, Room Moderator or higher in the Total Drama Island room.
		/tdi end - Ends the season of Total Drama Island. Requires Host, Room Moderator or higher in the Total Drama Island room.
		/tdi join - Joins the season of Total Drama Island. Must be non-muted/locked and registered.
		/tdi leave - Leaves a season of Total Drama Island.
		/tdi players - Lists the players in the season of Total Drama Island.
		/tdi prize - Shows the current prize money for this season of Total Drama Island.
		/tdi team1 - Shows Team 1 of this season of Total Drama Island.
		/tdi team2 - Shows Team 2 of this season of Total Drama Island.
		/tdi host - Shows the host for this season of Total Drama Island.
		/tdi teams - Shows both Team 1 and Team 2 of this season of Total Drama Island.
		/tdi skipchallenge - Displays a different randomized challenge.  Requires Host, Room Voice or higher in the Total Drama Island room.
		/tdi help - Displays this help command.`,
	],
};
