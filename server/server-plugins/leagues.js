'use strict';

const FS = require("../../.lib-dist/fs").FS;

let leagues = FS("config/chat-plugins/leagues.json").readIfExistsSync();

if (leagues !== "") {
	leagues = JSON.parse(leagues);
} else {
	leagues = {};
}

function leaguePM(message, league) {
	let pmName = `~League PM [${league.name}]`;
	for (let u in league.members) {
		let curUser = Users.get(league.members[u]);
		if (curUser && curUser.connected) curUser.send(`|pm|${pmName}|${curUser.getIdentity()}|${message}`);
	}
}

function write() {
	FS("config/chat-plugins/leagues.json").writeUpdate(() => (
		JSON.stringify(leagues)
	));
	let data = "{\n";
	for (let u in leagues) {
		data += '\t"' + u + '": ' + JSON.stringify(leagues[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	if (!Object.keys(leagues).length) data = "{}";
	FS("config/chat-plugins/leagues.json").writeUpdate(() => (
		data
	));
}
write();

exports.commands = {
	leagues: {
		add: "create",
		create(target, room, user) {
			if (!this.can("declare")) return;
			let [name, owner] = target.split(",").map(m => m.trim());
			if (leagues[toID(name)]) return this.errorReply(`A league with the name of ${name} already exists.`);
			let ownerUser = Users.get(owner);
			if (!ownerUser || !ownerUser.connected) return this.errorReply(`${owner} is not online.`);
			leagues[toID(name)] = {
				// general stuff
				id: toID(name),
				name: name,
				ranks: {
					owners: { // max this at 2
						name: "Owners",
						roomrank: '#',
						users: [ownerUser.id],
						order: 100
					},
					champion: {
						name: "Champion",
						roomrank: '#',
						users: [],
						order: 90
					},
					headprof: {
						name: "Head Professor",
						roomrank: '#',
						users: [],
						order: 80
					},
					elitefour: {
						name: "Elite Four",
						roomrank: '#',
						users: [],
						order: 70
					},
					professor: {
						name: "Professor",
						roomrank: '(Player)',
						users: [],
						order: 60
					},
					ace: {
						name: "Ace",
						roomrank: '*',
						users: [],
						order: 50
					},
					gymleader: {
						name: "Gym Leader",
						roomrank: '@',
						users: [],
						order: 40
					},
					gymtrainer: {
						name: "Gym Trainer",
						roomrank: '%',
						users: [],
						order: 30
					},
				},
				members: [ownerUser.id],
				// lvls
				lvl: {
					wins: 0,
					ties: 0,
					losses: 0,
					participated: 0
				},
				// profile stuff
				mascot: "",
			};
			write();
			this.sendReply(`The league, ${name}, has been created.`);
		},

		remove: "delete",
		delete(target, room, user) {
			if (!this.can("declare")) return;
			if (!leagues[toID(target)]) return this.errorReply(`A league with the name of ${target} does not exists.`);
			delete leagues[toID(target)];
			write();
			this.sendReply(`The league, ${toID(target)}, has been deleted.`);
		},

		list(target, room, user) {
			
		},

		profile(target, room, user) { // includes member count, lvl stats, mascot, owner [champion], member button to display all members 
			// if (!leagues[league].mascot) url = "//play.pokemonshowdown.com/sprites/gen5/missingno.png";
		},

		mascot(target, room, user) {
			
		},

		ranks: {
			create: "add",
			add(target, room, user) {
				
			},

			remove: "delete",
			delete(target, room, user) {
				
			},

			edit(target, room, user) { // edit roomranking & positioning
				
			},

			set: "setmember",
			setmember(target, room, user) {
				
			},

			roomrank(target, room, user) {
				
			},

			list(target, room, user) {
				
			},

			"": "help",
			help(target, room, user) {
				this.parse("/help league ranks");
			},
		},
		rankshelp: [],

		invite(target, room, user) {
			
		},

		accept(target, room, user) {
			
		},

		decline(target, room, user) {
			
		},

		kick: "remove",
		remove(target, room, user) {
			
		},

		pm(target, room, user) {
			
		},

		"": "help",
		help(target, room, user) {
			this.parse("/help leagues");
		},
	},
	helpleagues: [],

	// figure out whether to make lvls their own file or include them in this file
};
