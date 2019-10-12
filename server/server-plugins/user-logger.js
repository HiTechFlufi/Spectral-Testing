'use strict';
let _ = require('lodash');

Server.record = function (user, ips) {
	if (toID(user).indexOf("guest") === 0) return false;
	if (Db.userips.get(toID(user), {})[Object.keys(ips)[Object.keys(ips).length - 1]]) {
		Db.userips.get(toID(user))[Object.keys(ips)[Object.keys(ips).length - 1]] = Date.now();
		// no need to run any further than this. it covers the latest ip that's already included.
		return;
	}
	let now = Date.now();
	let ipList = {};
	for (let ip in ips) {
		ipList[ip] = now;
	}
	for (let oldIp in Db.userips.get(toID(user), {})) {
		ipList[oldIp] = Db.userips.get(toID(user), {})[oldIp];
	}
	Db.userips.set(toID(user), ipList);
};

function clean() {
	let users = Db.userips.keys();
	for (let u in users) {
		for (let ip in Db.userips.get(users[u], {})) {
			if (Db.userips.get(users[u])[ip] && Db.userips.get(users[u])[ip] + 10368000000 <= Date.now()) {
				delete Db.userips.get(users[u])[ip];
			}
		}
		if (!Object.keys(Db.userips.get(users[u], {})).length) {
			Db.userips.remove(users[u]);
		}
	}
}
clean();

exports.commands = {
	checkips: function (target, room, user) {
		if (!this.can('root')) return Server.UCMD(this);
		if (!target) return this.errorReply("Needs a target!");
		if (!Db.userips.get(toID(target))) return this.sendReplyBox(toID(target) + " has no recored ips!");
		let recoredIps = Db.userips.get(toID(target), {});

		return this.sendReplyBox("User " + toID(target) + " Ips: " + Object.keys(recoredIps).join(", "));
	},

	cau: "checkallusers",
	checkallusers: function (target, room, user) {
		if (!this.can('root')) return Server.UCMD(this);
		let users = Db.userips.keys();
		if (!users.length) return this.sendReplyBox("No recorded users yet!");
		return this.sendReplyBox(users.join(", "));
	},

	cmi: "checkmergedips",
	checkmergedips: function (target, room, user) {
		if (!this.can('root')) return Server.UCMD(this);
		if (!target) return this.errorReply("Needs a target!");
		let results = [];
		let sharedips = [];
		let users = Db.userips.keys();
		for (let u in users) {
			for (let i in Db.userips.get(users[u], {})) {
				if (toID(target) !== users[u] && _.has(Db.userips.get(toID(target)), i) && !results.includes(users[u])) results.push(users[u]);
				if (_.has(Db.userips.get(toID(target)), i) && toID(target) !== users[u] && !sharedips.includes(i)) sharedips.push(i);
			}
		}
		return user.popup("|html|Alts with same ip as user " + toID(target) + ": " + results.join(", ") + "<br />All shared IPS: " + sharedips.join(", "));
	},
};
