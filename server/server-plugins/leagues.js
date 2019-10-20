'use strict';

const FS = require("../../.lib-dist/fs").FS;

let leagues = FS("config/chat-plugins/leagues.json").readIfExistsSync();

if (leagues !== "") {
	leagues = JSON.parse(leagues);
} else {
	leagues = {};
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
			
		},

		remove: "delete",
		delete(target, room, user) {
			
		},

		list(target, room, user) {
			
		},

		profile(target, room, user) { // includes member count, lvl stats, mascot, owner [champion], member button to display all members 
			
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

			edit(target, room, user) {
				
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
