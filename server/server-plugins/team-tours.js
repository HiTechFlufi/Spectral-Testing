/****************************
 * Team Tours
 * By Volco (Arr⟦ay⟧s)
 * If you steal this then
 * you mega hyper ultra gay
 * Closed source repos only
*****************************/

'use strict';

class TeamTours extends Rooms.RoomGame {
	constructor(room, format, teamAmount) {
		super(room);

		if (room.ttNum) {
			room.ttNum++;
		} else {
			room.ttNum = 1;
		}
		this.format = toID(format);

		this.id = room.roomid;
		this.room = room;
		this.title = Dex.getFormat(format).name + ' Team Tour';
		this.teams = [];
		this.players = [];
		this.playerTable = Object.create(null);
		this.playerPool = [];
		this.scout = true;
		this.modjoin = false;
		this.isStarted = false;

		this.availableMatches = null;
		this.pendingChallenges = null;
		this.disqualifiedTeams = null;
		this.challenges = null;
		this.teamPlayerCap = 3;
		this.teamCap = parseInt(teamAmount);
		this.playerCap = teamAmount * 7;
		this.isInProgress = false;
		this.remaining = 0;
		this.teamLock = false;
		this.size = 0;

		this.finished = false;
		this.isEnded = false;
		this.winners = [];
		this.lastDisplay = false;
		this.matches = [];
		this.setMatches;
		this.haveBattled = [];
	}

	buildDisplay() {
		let display = `<center><div class="infobox"><font size="5">${this.title}</font><br />`;
		if (!this.isStarted && !this.isEnded) {
			if (this.playerPool.length > 0) display += `Joined Users: ${Chat.toListString(this.playerPool.map(u => {return Server.nameColor(u, true, true); }))}<br />`;
			display += `<br /><strong> Please note if a team does not have enough players, the last few people will be removed so every team is full. </strong><br />`;
			display += `<br /><button name="send" value="/tt join">Join</button> | <button name="send" value="/tt leave">Leave</button><br />`;;
		} else if (this.isStarted && !this.isEnded && !this.isInProgress) {
			this.setMatches = this.getMatches();
			this.setMatches.challenges.forEach((p2, p1) => {
				let oppTeam = 'noMatch';
				let playerTeam = 'noMatch';
				for (let u in this.teams) {
					if (this.teams[u].players.indexOf(p2[0]) !== -1) oppTeam = this.teams[u].name;
					if (this.teams[u].players.indexOf(p1) !== -1) playerTeam = this.teams[u].name;
				}
				if (display.indexOf(playerTeam) === -1) display += `Team ${playerTeam} ${(oppTeam ? ` vs Team ${oppTeam}` : ' has proceeded to the next round!')}<br />`;
				if (p2[0]) {
					Users.get(p1).sendTo(this.room, `|c|~${Config.serverName} Server|/html ${Server.nameColor(Users.get(p1).name, true, true)} press this button to challenge your opponent <button class="button" name="parseCommand" value="/challenge ${p2[0]}, ${this.format}">Challenge!</button>`);
					Users.get(p1).opponent = p2[0];
				}
			});
			display += '<button class="button" name="send" value="/teamtours matches">Check the Matchups</button>';
			this.isInProgress = true;
		} else if (this.isEnded && !this.finished) {
			display += 'This team tournament has ended!';
		} else if (this.finished) {
			for (let u in this.teams) {
				if (this.teams[u]) {
					display += `Congratulations to ${this.teams[u].name} for winning the team tour!`;
					break;
				}
			}
		}
		this.lastDisplay = display;
		this.room.add(`|uhtml|teamTour-${this.room.ttNum}|${display}`).update();
		if (this.finished) this.giveRewards();
	}

	start(stuff) {
		if (this.isStarted) {
			return stuff.sendReply('The Team Tour already began!');
		}
		if (this.teamPlayerCap * 4 > this.playerPool.length) {
			return stuff.sendReply('Not enough players!');
		}
		this.availableMatches = new Map();
		this.pendingChallenges = new Map();
		this.disqualifiedTeams = new Map();

		let overflow = this.playerPool % this.teamPlayerCap;
		let poolLength = this.playerPool.length;
		if (overflow !== 0) {
			this.playerPool.splice(poolLength - overflow, overflow);
		}
		for (let u in this.players) {
			if (this.playerPool.indexOf(u) === -1) this.removePlayer(Users.get(u));
		}
		this.createTeams();

		for (let n in this.teams) {
			if (this.teams[n].players.length < this.teamPlayerCap) {
				this.teams.splice(n, 1);
				break;
			}
		}
		let team = this.teams;
		if (team.length < 4) {
			this.buildDisplay();
			return this.room.add('|raw|<b>There were teams without enough players in the tour that were eliminated during the start process.<br />The tour no longer has enough teams!<br />Please get more teams then restart!</b>');
		}
		for (let u in team) {
			for (let i in team[u].players) {
				this.availableMatches.set(team[u].players[i], new Map());
				this.pendingChallenges.set(team[u].players[i], null);
				this.disqualifiedTeams.set(team[u].players[i], false);
				Users.get(toID(team[u].players[i])).ttRoom = this.id;
			}
			this.size += team[u].players.length;
		}
		this.isStarted = true;
		this.buildDisplay();
	}

	createTeams() {
		let players = Dex.shuffle(this.playerPool);
		let teamNum = 0;

		for (let u in players) {
			if (!this.teams[teamNum]) {
				this.teams[teamNum] = {id: 'team'+ (teamNum + 1), name: 'Team #' + (teamNum + 1), players: [players[u]], invites: [], wins: 0, busy: false, captain: players[u], hasWon: false};
				continue;
			}
			if (this.teams[teamNum].players.length !== this.teamPlayerCap) {
				this.teams[teamNum].players.push(players[u]);
				if (this.teams[teamNum].players.length === this.teamPlayerCap) {
					teamNum++;
				}
			}
		}
	}

	disqualifyTeam(team, stuff) {
		if (!this.isStarted) return false;
		if (stuff) {
			if (!team) {
				return stuff.sendReply('No team selected.');
			}
			let notFound = true;
			for (let u in this.teams) {
				if (this.teams[u] && this.teams[u].id === team) {
					for (let i in this.teams[u].players) {
						this.removePlayer(Users.get(this.teams[u].players[i]));
					}
					delete this.teams[u];
					notFound = false;
					break;
				}
			}
			if (notFound) {
				stuff.sendReply(`${team} is not a team in the Team Tournament.`);
				return false;
			} else {
				this.room.add(`${team} has been disqulified from the Team Tournament.`).update();
				this.buildDisplay();
				return true;
			}
		} else {
			// should never happen
			if (!team) {
				return this.room.add(`|html|No team was parsed for the elimination process after match winning. This is an error please report it to an admin!<br/> <strong><span class="notice message-error">Err Code: onDisqualifyTeam(): Line 181 <em>"No Team"</em></span></strong>`).update();
			}
			let notFound = true;
			for (let u in this.teams) {
				if (this.teams[u] && this.teams[u].id === team) {
					this.teams.splice(u, 1);
					notFound = false;
					break;
				}
			}
			if (notFound) {
				return this.room.add(`|html|${team} was not found in the Team Tournament. This is an error please report it to an admin!<br/> <strong><span class="notice message-error">Err Code: onDisqualifyTeam(): Line 191 <em>"Not Found"</em></span></strong>`).update();
			} else {
				return true;
			}
		}
	}

	end() {
		if (this.isStarted) {
			Rooms.rooms.forEach(room => {
				if (room && room.battle && room.ttBattle && !room.battle.ended) {
					delete room.ttBattle;
					room.addRaw(`<div class="broadcast-red"><b>The team tour was forcefully ended.</b><br />You can finish playing, but this battle is no longer considered a team tour battle.</div>`).update();
				}
			});
		}
		for (let i in this.teams) {
			delete this.teams[i];
		}
		this.isEnded = true;
		this.buildDisplay();
	}

	getMatches() {
		let matches = [];
		this.challenges = new Map();
		let teamA = [];
		let teamB = [];
		for (let u in this.teams) {
			for (let i in this.teams[u].players) {
				if (Server.isEven(u) || u === 0) {
					teamA.push([this.teams[u].players[i]]);
				}
				if (Server.isOdd(u)) {
					teamB.push([this.teams[u].players[i]]);
				}
			}
		}
		for (let a in teamA) {
			for (let b in teamB) {
				if (teamA[a] && teamA[a][b] && teamB[a] && teamB[a][b]) {
					matches.push([teamA[a][b], teamB[a][b]]);
				} else {
					matches.push([teamA[a][b]]);
				}
			}
		}
		let oldAvailableMatches = new Map();
		for (let u in this.teams) {
			for (let i in this.teams[u].players) {
				this.challenges.set(this.teams[u].players[i], []);

				let oldAvailableMatch = false;
				let availableMatches = this.availableMatches.get(this.teams[u].players[i]);
				if (availableMatches && availableMatches.size) {
					oldAvailableMatch = true;
					availableMatches.clear();
				}
				oldAvailableMatches.set(this.teams[u].players[i], oldAvailableMatch);
			}
		}
		matches.forEach(match => {
			if (this.challenges.get(match[0])) this.challenges.get(match[0]).push(match[1]);
			if (this.challenges.get(match[1])) this.challenges.get(match[1]).push(match[0]);

			if (this.availableMatches.get(match[0])) this.availableMatches.get(match[0]).set(match[1], true);
			if (this.availableMatches.get(match[1])) this.availableMatches.get(match[1]).set(match[0], true);
		});

		this.availableMatches.forEach((availableMatches, team) => {
			if (oldAvailableMatches.get(team)) return;
		});
		this.matches.push(this.challenges);
		return {
			challenges: this.challenges,
		};
	}

	addUser(user, stuff) {
		const gameCount = user.games.size;
		if (gameCount > 4) {
			stuff.errorReply("Due to high load, you are limited to 4 games at the same time.");
			return;
		}

		for (const otherPlayer of this.players) {
			if (!otherPlayer) continue;
			const otherUser = Users.get(otherPlayer.id);
			if (otherUser && otherUser.latestIp === user.latestIp) {
				stuff.sendReply('You have already joined this game on another alt.');
				return;
			}
		}
		const player = this.addPlayer(user);
		if (!player) return false;
		this.playerPool.push(user.id);
		return true;
	}


	subMember(subOut, subIn, stuff) {
		if (!subOut || !subIn) {
			return stuff.sendReply('Missing the sub out user or the sub in user');
		}
		let alreadyIn = false;
		let busy = false;
		for (let team of this.teams) {
			if (team.players.indexOf(subIn) !== -1) {
				alreadyIn = true;
				break;
			}
			if (team.players.indexOf(subOut) !== -1 && team.players.indexOf(subIn) === -1) {
				if (team.busy) {
					busy = true;
					break;
				}
				this.players[Users.get(subOut).id].destroy();
				this.addPlayer(Users.get(subIn));
				team.players.splice(team.players.indexOf(subOut), 1);
				team.players.push(subIn);
				Users.get(subIn).opponent = Users.get(subOut).opponent;
				delete Users.get(subOut).opponent;
				Users.get(Users.get(subIn).opponent).opponent = subIn;
				break;
			}
		}
		if (busy) stuff.errorReply('The players teams are mid-battle!');

		if (alreadyIn) {
			stuff.errorReply(`${subIn} is already in the Team Tournament!`);
		} else {
			return this.room.add(`|html|${Server.nameColor(subIn, true, true)} has subbed for ${Server.nameColor(subOut, true, true)} in this Team Tour.`).update();
		}
	}

	onBattleWin(room, winnerid) {
		room.tour = null;
		room.parent = null;

		let from = room.p1;
		let to = room.p2;
		let winner = winnerid;
		let loserTeamName = 'notNamed';
		for (let u in this.teams) {
			if (from.id === winnerid) {
				if (this.teams[u].players.indexOf(to.id) !== -1) {
					loserTeamName = this.teams[u].name;
					break;
				}
			} else if (to.id === winnerid) {
				if (this.teams[u].players.indexOf(from.id) !== -1) {
					loserTeamName = this.teams[u].name;
					break;
				}
			}
		}

		let win = false;
		for (let u in this.teams) {
			if (this.teams[u] && this.teams[u].players.indexOf(winner) !== -1) {
				if (this.teams[u].hasWon) break;
				this.teams[u].wins++;
				if (this.teams[u].players.length === this.teams[u].wins || (this.teams[u].players.length / 2) + 0.5 === this.teams[u].wins) {
					this.teams[u].busy = false;
					win = true;
					this.room.add(`${this.teams[u].name} has won all their matches for this round of the Team Tournament.`).update();
					this.teams[u].hasWon = true;
				}
				break;
			}
		}
		if (win) {
			for (let u in this.teams) {
				if (this.teams[u]) {
					if (winner === from.id && this.teams[u].name === loserTeamName && this.teams[u].players.indexOf(winner) === -1) {
						this.disqualifyTeam(this.teams[u].id);
						break;
					} else if (winner === to.id && this.teams[u].name === loserTeamName && this.teams[u].players.indexOf(winner) === -1) {
						this.disqualifyTeam(this.teams[u].id);
						break;
					}
				}
			}
		}
		if (from.id === winner) {
			this.room.add(`|html|${Server.nameColor(from.name, true, true)} has won the match against ${Server.nameColor(to.name, true, true)} in the Team Tournament.`).update();
		} else {
			this.room.add(`|html|${Server.nameColor(to.name, true, true)} has won the match against ${Server.nameColor(from.name, true, true)} in the Team Tournament.`).update();
		}

		this.haveBattled.push(from.id, to.id);
		this.winners.push(winner);
		if (win) this.remaining++;

		if (this.teams.length === 1) {
			this.finished = true;
			this.buildDisplay();
		}

		if (this.teams.length !== 1 && this.remaining === this.teams.length) {
			this.isInProgress = false;
			for (let u in this.teams) {
				this.teams[u].wins = 0;
				this.teams[u].hasWon = false;
			}
			this.winners = [];
			this.haveBattled = [];
			this.remaining = 0;
			this.buildDisplay();
		}
	}

	/* finish later, bug with ``this.remaining``
	forceMatchWin(winner) {
		if (this.winners.includes(winner)) return;
		let loser = Users.get(winner).opponent;
		let loserTeamName = 'notNamed';
		for (let u in this.teams) {
			if (this.teams[u].players.indexOf(loser) !== -1) {
				loserTeamName = this.teams[u].name;
				break;
			}
		}

		let win = false;
		for (let u in this.teams) {
			if (this.teams[u] && this.teams[u].players.indexOf(winner) !== -1) {
				this.teams[u].wins++;
				if (this.teams[u].players.length === this.teams[u].wins || (this.teams[u].players.length / 2) + 0.5 === this.teams[u].wins) {
					this.teams[u].busy = false;
					win = true;
					this.room.add(`${this.teams[u].name} has won all their matches for this round of the team tournament.`).update();
				}
				break;
			}
		}

		if (win) {
			for (let u in this.teams) {
				if (this.teams[u]) {
					if (this.teams[u].name === loserTeamName && this.teams[u].players.indexOf(winner) === -1) {
						this.disqualifyTeam(this.teams[u].id);
						break;
					}
				}
			}
			this.remaining++;
		}

		this.room.add(`${Users.get(winner).name} has forcibly won the match against ${loser} in the Team Tournament.`).update();

		this.winners.push(winner);

		if (this.teams.length === 1) {
			this.finished = true;
			this.buildDisplay();
		}

		if (this.teams.length !== 1 && this.remaining === this.teams.length || this.teams.length !== 1 && this.remaining * 2 === this.teams.length) {
			this.isInProgress = false;
			for (let u in this.teams) {
				this.teams[u].wins = 0;
			}
			this.winners = [];
			this.remaining = 0;
			this.buildDisplay();
		}
	}*/

	giveRewards() {
		let name;
		for (let u in this.teams) {
			name = this.teams[u].name;
			for (let i in this.teams[u].players) {
				Economy.writeMoney(toID(i), this.size * 3);
				Economy.logTransaction(`${i} has won ${(this.size * 3)} ${moneyPlural} for winning the Team Tours in ${this.room.title}.`);
			}
			break;
		}
		this.room.add(`The winning Team, ${name}, has also received ${(this.size * 3)} ${moneyPlural} each for winning the Team Tournament!`);

		deleteTeamTour(this.id);
	}
}

function createTeamTour(room, format, teamAmount, stuff) {
	if (room.type !== 'chat') {
		stuff.errorReply("Tournaments can only be created in chat rooms.");
		return false;
	}
	if (getTeamTour(room.roomid, stuff)) {
		stuff.errorReply("There is already a team tour in this room!");
		return false;
	}
	if (room.game) {
		stuff.errorReply(`You cannot have a tournament until the current room activity is over: ${room.game.title}`);
		return false;
	}
	if (Rooms.global.lockdown) {
		stuff.errorReply("The server is restarting soon, so a tournament cannot be created.");
		return false;
	}
	format = Dex.getFormat(format);
	if (format.effectType !== 'Format' || !format.tournamentShow) {
		stuff.errorReply(`${format.id} is not a valid tournament format.`);
		stuff.errorReply(`Valid formats: ${Chat.toListString(Object.values(Dex.formats).filter(f => f.tournamentShow).map(format => format.name))}`);
		return false;
	}
	if (teamAmount < 4) {
		stuff.errorReply("You cannot have less than 4 teams.");
		return false;
	}
	room.game = room.teamTours = new TeamTours(room, format, teamAmount);
	return room.game;
}

function deleteTeamTour(id, stuff) {
	if (stuff) {
		let room = Rooms.get(id);
		if (!room) {
			stuff.errorReply(`${id} doesn't exist.`);
			return false;
		}
		let TT = room.teamTours;
		TT.end();
		for (let u in room.game.players) {
			delete Users.get(toID(room.game.players[u])).ttRoom;
			room.game.players[u].destroy();
		}
		delete room.teamTours;
		if (room) delete room.game;
		if (Server.ttTeamLock) delete Server.ttTeamLock;
		return true;
	} else {
		let room = Rooms.get(id);
		for (let u in room.game.players) {
			if (Users.get(toID(room.game.players[u]))) delete Users.get(toID(room.game.players[u])).ttRoom;
			room.game.players[u].destroy();
		}
		delete room.teamTours;
		delete room.game;
		if (Server.ttTeamLock) delete Server.ttTeamLock;
	}
}

function getTeamTourRoom(user) {
	let output = false;
	if (!Users.get(toID(user))) return false;
	let room = Rooms.get(Users.get(toID(user)).ttRoom);
	if (!room) return false;
	if (room.teamTours) {
		for (let u in room.teamTours.teams) {
			if (room.teamTours && room.teamTours.teams[u].players.indexOf(toID(user)) !== -1) {
				output = room;
			}
		}
	}
	return output;
}
Server.getTeamTourRoom = getTeamTourRoom;

function getTeamTour(id) {
	if (Rooms.get(id) && Rooms.get(id).teamTours) {
		return Rooms.get(id).teamTours;
	}
}

function findTeamMatchUp(p1, p2) {
	if (!Users.get(toID(p1)) || !Users.get(toID(p2))) return false;
	if (Users.get(toID(p1)).opponent === toID(p2) && Users.get(toID(p2)).opponent === toID(p1)) return true;
	return false;
}
Server.findTeamMatchUp = findTeamMatchUp;

exports.commands = {
	teamtours: 'teamtour',
	teamtournament: 'teamtour',
	tt: 'teamtour',
	ttour: 'teamtour',
	teamtour: {
		display(target, room, user) {
			if (!this.can('broadcast', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!this.runBroadcast()) return;
			this.room.add(`|uhtml|teamTour-${room.teamTours.ttNum}|${room.teamTours.lastDisplay}`);
		},

		create: 'new',
		new(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			let [format, amount] = target.split(',').map(p => p.trim());
			if (!format) return this.errorReply(`Please specify the format.`);
			if (!amount) amount = 16;
			if (!Number(amount)) return this.errorReply('Please specify a max number of teams. (leaving this blank will make the default 16 teams)');
			let create = createTeamTour(room, format, amount, this);
			if (create) {
				room.teamTours.buildDisplay();
				for (let u in room.users) {
					if (Users.get(u).connected) Users.get(u).sendTo(room, `|notify|${room.title} new Team Tour!|`);
				}
			}
		},

		end(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (deleteTeamTour(room.roomid, this)) {
				this.privateModAction(`(${user.name} forcibly ended the Team Tournament.)`);
			}
		},

		begin: 'start',
		start(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			room.teamTours.start(this);
		},

		dq: 'disqualify',
		disqualify(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!target) return this.errorReply('/teamtour disqualify (team).');
			room.teamTours.disqualifyTeam(toID(target), this);
		},

		join(target, room, user) {
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!user.named) return this.errorReply('Please log in first.');
			if (room.teamTours.isStarted) return this.sendReply('The Team Tour has already started.');
			if (room.teamTours.addUser(user, this)) {
				room.teamTours.buildDisplay();
				return room.add(`|html|${Server.nameColor(user.name, true, true)} has joined the team tournament.`).update();
			}
		},

		leave(target, room, user) {
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!room.teamTours.isStarted) {
				let player = room.game.playerTable[user.id];
				const playerIndex = room.game.players.indexOf(player);
				if (playerIndex !== -1) {
					if (playerIndex < 0) return false;
					if (user.id) delete room.game.playerTable[player.id];
					room.game.players.splice(playerIndex, 1);
					let index = room.teamTours.playerPool.indexOf(user.id);
					room.teamTours.playerPool.splice(index, 1);
					player.destroy();
					room.game.playerCount--;
					room.teamTours.buildDisplay();
					return room.add(`|html|${Server.nameColor(user.id, true, true)} has left the Team Tournament.`).update();
				} else {
					return this.sendReply('You are not in the team tour.');
				}
			} else {
				return this.sendReply('Please have a room staff sub you out for another member in this tour!');
			}
		},

		sub: 'submember',
		submember(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!room.teamTours.isStarted) return this.errorReply('This command only works if the Team Tour is started.');
			if (!target) return this.errorReply('/teamtour submember (sub out), (sub in)');
			let [subOut, subIn] = target.split(',').map(p => { return p.trim(); });
			subOut = toID(subOut);
			subIn = Users.get(toID(subIn));
			if (!subOut) return this.errorReply('You need both a user to sub out!');
			if (!subIn || !subIn.connected) return this.errorReply(`${subin} is not online!`);
			room.teamTours.subMember(subOut, subIn.id, this);
		},

		scout(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (Dex.getFormat(room.teamTours.format).team) return this.errorReply(`You cannot disable scouting for random tiers.`);
			if (!target) return this.errorReply('/teamtour scout on/off');
			if (this.meansNo(toID(target))) {
				if (!room.teamTours.scout) return this.errorReply(`It's already disabled!`);
				room.teamTours.scout = false;
				room.add('Scouting is not allowed in the Team Tour!');
			} else if (this.meansYes(toID(target))) {
				if (room.teamTours.scout) return this.errorReply(`It's already enabled!`);
				room.teamTours.scout = true;
				room.add('Scouting is allowed in the Team Tour!');
			} else {
				return this.errorReply("Must be a yes or no value.");
			}
		},

		modjoin(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (room.teamTours.isStarted) return this.errorReply('This command only works if the Team Tour is not started.');
			if (!target) return this.errorReply('/teamtour modjoin on/off');
			if (this.meansNo(toID(target))) {
				if (!room.teamTours.modjoin) return this.errorReply(`It's already disabled!`);
				room.teamTours.modjoin = false;
				room.add('Modjoining is not allowed in the Team Tour!');
			} else if (this.meansYes(toID(target))) {
				if (room.teamTours.modjoin) return this.errorReply(`It's already enabled!`);
				room.teamTours.modjoin = true;
				room.add('Modjoining is allowed in the Team Tour!');
			} else {
				return this.errorReply("Must be a yes or no value.");
			}
		},

		tl: 'teamlock',
		teamlock(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (room.teamTours.isStarted) return this.errorReply('This command only works if the Team Tour is not started.');
			if (Dex.getFormat(room.teamTours.format).team) return this.errorReply(`You cannot teamlock random tiers.`);
			if (!target) return this.errorReply('/teamtour teamlock on/off');
			if (this.meansNo(toID(target))) {
				if (!room.teamTours.teamLock) return this.errorReply(`It's already disabled!`);
				room.teamTours.teamLock = false;
				room.add('Team switching is allowed in the Team Tour!');
			} else if (this.meansYes(toID(target))) {
				if (room.teamTours.teamLock) return this.errorReply(`It's already enabled!`);
				room.teamTours.teamLock = true;
				room.add('Team switching is not allowed in the Team Tour!');
			} else {
				return this.errorReply("Must be a yes or no value.");
			}
		},

		matches(target, room, user) {
			if (!this.runBroadcast()) return;
			if (!room.teamTours) return this.errorReply('There is no Team Tour in this room!');
			if (!room.teamTours.isStarted) return this.errorReply('This command only works if the Team Tour is started.');
			let display = '';
			room.teamTours.setMatches.challenges.forEach((team1, team2) => {
				let team1Name = 'noMatch';
				let team2Name = 'noMatch';
				for (let u in room.teamTours.teams) {
					if (room.teamTours.teams[u].players.indexOf(team1[0]) !== -1) team1Name = room.teamTours.teams[u].name;
					if (room.teamTours.teams[u].players.indexOf(team2) !== -1) team2Name = room.teamTours.teams[u].name;
				}
				if (display.indexOf(team1[0]) === -1) display += `${team1Name}: ${Server.nameColor(team1[0], true)} ${(team2 ? ` vs ${team2Name}: ${Server.nameColor(team2, true)}` : ' has proceeded to the next round!')}<br />`;
			});
			return this.sendReplyBox(display);
		},

		/* finish later
		gw: 'battlewin',
		givewin: 'battlewin',
		bw: 'battlewin',
		battlewin(target, room, user) {

			room.teamTours.forceMatchWin(winner);
		},*/

		'': 'help',
		help(target, room, user) {
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(`<center><strong><font size="7">TEAM TOURS!</font></strong><br />All commands require Room Operator, unless otherwise specified.</center><br />` +
			`<ul><li>/teamtour create (format), (team limit) - Creates a new Team Tour. If no limit is specified the default is 16.</li><br />` +
			`<li>/teamtour display - Pushes down the Team Tour display. Requires Room Voice.</li><br />` +
			`<li>/teamtour join - Joins the Team Tour.</li><br />` +
			`<li>/teamtour leave - Leaves the Team Tour.</li><br />` +
			`<li>/teamtour start - Starts the Team Tour.</li><br />` +
			`<li>/teamtour end - Ends the Team Tour.</li><br />` +
			`<li>/teamtour disqualify (team) - Eliminates a team from the Team Tour.</li><br />` +
			`<li>/teamtour submember (sub out), (sub in) - Subs a member who's already in the tour out for a user not in the tour.</li><br />` +
			`<li>/teamtour scout on/off - sets scouting rules for battles.</li><br />` +
			`<li>/teamtour playerlimit (number) - sets a limit of players per team.</li><br />` +
			`<li>/teamtour modjoin on/off - sets modjoin rules for battles.</li><br />` +
			`<li>/teamtour teamlock on/off - sets teamlock for battles.</li></ul>`);
		},
	},
};
