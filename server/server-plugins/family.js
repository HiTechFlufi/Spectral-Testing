/**************************************
 * Family Plug-in for PS              *
 * Spectral is a weird place          *
 * We adopt people for no reason      *
 * Anyways behold families            *
 * Made by: RaginInfernape and flufi  *
 **************************************/

"use strict";

const FS = require("../../.lib-dist/fs").FS;

let families = FS("config/chat-plugins/families.json").readIfExistsSync();

if (families !== "") {
	families = JSON.parse(families);
} else {
	families = {};
}

function write() {
	FS("config/chat-plugins/families.json").writeUpdate(() => (
		JSON.stringify(families)
	));
	let data = "{\n";
	for (let u in families) {
		data += '\t"' + u + '": ' + JSON.stringify(families[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	FS("config/chat-plugins/families.json").writeUpdate(() => (
		data
	));
}

exports.commands = {
	family: {
		initialize: "init",
		init(target, room, user) {
			if (families[user.id]) return this.errorReply(`You already have initialized your family list.`);
			families[user.id] = {
				mothers: [],
				fathers: [],
				daughters: [],
				sons: [],
				pendingAdoptions: [],
				husbands: [],
				wives: [],
				pendingSpouses: [],
				boyfriends: [],
				girlfriends: [],
				pendingDates: [],
			};
			write();
			this.sendReply(`Initialized your family tree data.`);
		},

		adopt(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let adopteeId = toID(target);
			if (families[user.id].sons.includes(adopteeId) || families[user.id].daughters.includes(adopteeId)) return this.errorReply(`${target} is already adopted by you.`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`To aide this command, please specify your gender using /gender.`);
			if (families[user.id].pendingAdoptions.includes(adopteeId)) return this.errorReply(`You are already trying to adopt ${target}.`);
			families[user.id].pendingAdoptions.push(adopteeId);
			write();
			if (Users.get(adopteeId) && Users.get(adopteeId).connected) {
				let message = `/html has attempted to adopt you. <br /><button name="send" value="/family acceptadoption ${user.id}">Click to accept</button> | <button name="send" value="/family declineadoption ${user.id}">Click to decline</button>`;
				Users.get(adopteeId).send(`|pm|${user.getIdentity()}|${Users.get(adopteeId).getIdentity()}|${message}`);
			}
			this.sendReply(`You have offered to adopt ${target}.`);
		},

		acceptadoption(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let adopter = toID(target);
			if (!families[adopter].pendingAdoptions.includes(user.id)) return this.errorReply(`There is not a pending adoption from ${target}.`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`To aide this command, please specify your gender using /gender.`);
			let parentProfile = Db.profile.get(adopter, {data: {title: {}, music: {}}});
			if (!parentProfile.gender) return this.errorReply(`To aide this command, please tell ${target} to enable their gender using /gender then retry.`);
			if (profile.gender === "M") {
				families[adopter].sons.push(user.id);
			} else {
				families[adopter].daughters.push(user.id);
			}
			if (parentProfile.gender === "M") {
				families[user.id].fathers.push(adopter);
			} else {
				families[user.id].mothers.push(adopter);
			}
			families[adopter].pendingAdoptions.splice(user.id);
			write();
			if (Users.get(adopter) && Users.get(adopter).connected) {
				Users.get(adopter).send(`|pm|${user.getIdentity()}|${Users.get(adopter).getIdentity()}| has accepted your adoption request.`);
			}
			return this.sendReply(`You have been adopted into ${target}'s family!`);
		},

		"refuseadoption": "declineadoption",
		declineadoption(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (!families[targetId].pendingAdoptions.includes(user.id)) return this.errorReply(`There is not a pending adoption from ${target}.`);
			families[targetId].pendingAdoptions.splice(user.id);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has denied your adoption request.`);
			}
			return this.sendReply(`You have declined ${target}'s request to adopt you.`);
		},

		disownchild: "disownparent",
		disownparent(target, room, user, connection, cmd) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (cmd === "disownparent") {
				if (families[user.id].fathers.includes(targetId)) {
					// Lazily check if it's in the sons/daughters array as the user's profile gender may have changed (aka avoid crash)
					if (families[targetId].sons.includes(user.id)) families[targetId].sons.splice(user.id);
					if (families[targetId].daughters.includes(user.id)) families[targetId].daughters.splice(user.id);
					families[user.id].fathers.splice(targetId);
				} else if (families[user.id].mothers.includes(targetId)) {
					// Lazily check if it's in the sons/daughters array as the user's profile gender may have changed (aka avoid crash)
					if (families[targetId].sons.includes(user.id)) families[targetId].sons.splice(user.id);
					if (families[targetId].daughters.includes(user.id)) families[targetId].daughters.splice(user.id);
					families[user.id].mothers.splice(targetId);
				} else {
					return this.errorReply(`It appears ${target} is not your parent.`);
				}
				write();
				this.sendReply(`You have disowned ${target} as your parent.`);
			} else {
				if (families[user.id].sons.includes(targetId)) {
					// Lazily check if it's in the fathers/mothers array as the user's profile gender may have changed (aka avoid crash)
					if (families[targetId].fathers.includes(user.id)) families[targetId].fathers.splice(user.id);
					if (families[targetId].mothers.includes(user.id)) families[targetId].mothers.splice(user.id);
					families[user.id].sons.splice(targetId);
				} else if (families[user.id].daughters.includes(targetId)) {
					// Lazily check if it's in the fathers/mothers array as the user's profile gender may have changed (aka avoid crash)
					if (families[targetId].fathers.includes(user.id)) families[targetId].fathers.splice(user.id);
					if (families[targetId].mothers.includes(user.id)) families[targetId].mothers.splice(user.id);
					families[user.id].daughters.splice(targetId);
				} else {
					return this.errorReply(`It appears ${target} is not your child.`);
				}
				write();
				this.sendReply(`You have disowned ${target} as your child.`);
			}
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has disowned you.`);
			}
		},

		propose: "marry",
		marry(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`You do not have your gender set.`);
			let targetId = toID(target);
			if (families[user.id].husbands.includes(targetId) || families[user.id].wives.includes(targetId)) return this.errorReply(`You are already married to ${target}.`);
			families[user.id].pendingSpouses.push(targetId);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				let message = `/html has proposed to you. <br /><button name="send" value="/family acceptmarriage ${user.id}">Click to accept</button> | <button name="send" value="/family declinemarriage ${user.id}">Click to decline</button>`;
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}|${message}`);
			}
			this.sendReply(`You have asked ${target} to marry you.`);
		},

		acceptmarriage(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (!families[targetId].pendingSpouses.includes(user.id)) return this.errorReply(`There is not a pending proposal from ${target}.`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			let spouseProfile = Db.profile.get(targetId, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`You do not have your gender set.`);
			if (!spouseProfile.gender) return this.errorReply(`${target} does not have their gender set.`);

			if (profile.gender === "M") {
				families[targetId].husbands.push(user.id);
			} else {
				families[targetId].wives.push(user.id);
			}

			if (spouseProfile.gender === "M") {
				families[user.id].husbands.push(targetId);
			} else {
				families[user.id].wives.push(targetId);
			}
			families[targetId].pendingSpouses.splice(user.id);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has accepted your proposal!  Congratulations!!!`);
			}
			this.sendReply(`You have accepted ${target}'s marriage proposal.`);
		},

		"refusemarriage": "declinemarriage",
		declinemarriage(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (!families[targetId].pendingSpouses.includes(user.id)) return this.errorReply(`There is not a pending proposal from ${target}.`);
			families[targetId].pendingSpouses.splice(user.id);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has denied your proposal.`);
			}
			return this.sendReply(`You have turned down ${target}'s proposal.`);
		},

		divorce(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (families[user.id].husbands.includes(targetId)) {
				// Lazily check if it's in the husbands/wives array as the user's profile gender may have changed (aka avoid crash)
				if (families[targetId].husbands.includes(user.id)) families[targetId].husbands.splice(user.id);
				if (families[targetId].wives.includes(user.id)) families[targetId].wives.splice(user.id);
				families[user.id].husbands.splice(targetId);
			} else if (families[user.id].wives.includes(targetId)) {
				// Lazily check if it's in the husbands/wives array as the user's profile gender may have changed (aka avoid crash)
				if (families[targetId].husbands.includes(user.id)) families[targetId].husbands.splice(user.id);
				if (families[targetId].wives.includes(user.id)) families[targetId].wives.splice(user.id);
				families[user.id].wives.splice(targetId);
			} else {
				return this.errorReply(`It appears ${target} is not your spouse.`);
			}
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has divorced you.`);
			}
			this.sendReply(`You have divorced ${target}.`);
		},

		date(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`You do not have your gender set.`);
			let targetId = toID(target);
			families[user.id].pendingDates.push(targetId);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				let message = `/html has asked you out on a date. <br /><button name="send" value="/family acceptdate ${user.id}">Click to accept</button> | <button name="send" value="/family declinedate ${user.id}">Click to decline</button>`;
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}|${message}`);
			}
			this.sendReply(`You have asked ${target} to go on a date with you.`);
		},

		acceptdate(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (!families[targetId].pendingDates.includes(user.id)) return this.errorReply(`There is not a pending date proposal from ${target}.`);
			let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
			let spouseProfile = Db.profile.get(targetId, {data: {title: {}, music: {}}});
			if (!profile.gender) return this.errorReply(`You do not have your gender set.`);
			if (!spouseProfile.gender) return this.errorReply(`${target} does not have their gender set.`);

			if (profile.gender === "M") {
				families[targetId].boyfriends.push(user.id);
			} else {
				families[targetId].girlfriends.push(user.id);
			}

			if (spouseProfile.gender === "M") {
				families[user.id].boyfriends.push(targetId);
			} else {
				families[user.id].girlfriends.push(targetId);
			}
			families[targetId].pendingDates.splice(user.id);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has agreed to go on a date with you!`);
			}
			this.sendReply(`You have agreed to go on a date with ${target}.`);
		},

		"refusedate": "declinedate",
		declinedate(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (!families[targetId].pendingDates.includes(user.id)) return this.errorReply(`There is not a pending date proposal from ${target}.`);
			families[targetId].pendingDates.splice(user.id);
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has denied your request to go on a date.`);
			}
			return this.sendReply(`You have turned down ${target}'s date request.`);
		},

		breakup(target, room, user) {
			if (!target) return this.parse(`/familyhelp`);
			if (!families[user.id]) this.parse(`/family init`);
			let targetId = toID(target);
			if (families[user.id].boyfriends.includes(targetId)) {
				// Lazily check if it's in the boyfriends/girlfriends array as the user's profile gender may have changed (aka avoid crash)
				if (families[targetId].boyfriends.includes(user.id)) families[targetId].boyfriends.splice(user.id);
				if (families[targetId].girlfriends.includes(user.id)) families[targetId].girlfriends.splice(user.id);
				families[user.id].boyfriends.splice(targetId);
			} else if (families[user.id].girlfriends.includes(targetId)) {
				// Lazily check if it's in the boyfriends/girlfriends array as the user's profile gender may have changed (aka avoid crash)
				if (families[targetId].boyfriends.includes(user.id)) families[targetId].boyfriends.splice(user.id);
				if (families[targetId].girlfriends.includes(user.id)) families[targetId].girlfriends.splice(user.id);
				families[user.id].girlfriends.splice(targetId);
			} else {
				return this.errorReply(`It appears ${target} is not your date.`);
			}
			write();
			if (Users.get(targetId) && Users.get(targetId).connected) {
				Users.get(targetId).send(`|pm|${user.getIdentity()}|${Users.get(targetId).getIdentity()}| has broken up with you.`);
			}
			this.sendReply(`You have broken up with ${target}.`);
		},

		list: "tree",
		tree(target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) target = user.name;
			let targetId = toID(target);
			let familyInfo = families[targetId];
			if (!familyInfo) return this.errorReply(`This user does not have a family tree.`);
			let display = `<h3 style="text-align: center">${Server.nameColor(target, true, true)}'${targetId.endsWith("s") ? `` : `s`} Family Tree:</h3>`;
			if (familyInfo.fathers.length > 0) display += `&nbsp;<strong>Fathers:</strong> ${Chat.toListString(familyInfo.fathers.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.mothers.length > 0) display += `&nbsp;<strong>Mothers:</strong> ${Chat.toListString(familyInfo.mothers.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.sons.length > 0) display += `&nbsp;<strong>Sons:</strong> ${Chat.toListString(familyInfo.sons.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.daughters.length > 0) display += `&nbsp;<strong>Daughters:</strong> ${Chat.toListString(familyInfo.daughters.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.husbands.length > 0) display += `&nbsp;<strong>Husbands:</strong> ${Chat.toListString(familyInfo.husbands.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.wives.length > 0) display += `&nbsp;<strong>Wives:</strong> ${Chat.toListString(familyInfo.wives.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.boyfriends.length > 0) display += `&nbsp;<strong>Boyfriends:</strong> ${Chat.toListString(familyInfo.boyfriends.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			if (familyInfo.girlfriends.length > 0) display += `&nbsp;<strong>Girlfriends:</strong> ${Chat.toListString(familyInfo.girlfriends.map(p => { return Server.nameColor(p, true, true); }))}<br />`;
			this.sendReplyBox(display);
		},

		"": "help",
		help() {
			this.parse(`/familyhelp`);
		},
	},

	familyhelp: [
		`/family init - Starts your family tree.
		/family adopt [user] - Sends a request to adopt [user].
		/family acceptadoption [user] - Accepts an adoption request from [user].
		/family declineadoption [user] - Declines an adoption request from [user].
		/family disownparent [user] - Removes [user] as your parent.
		/family disownchild [user] - Removes [user] as your child.
		/family marry [user] - Asks [user] to marry you.
		/family acceptmarriage [user] - Accepts the marriage proposal from [user].
		/family declinemarriage [user] - Declines the marriage proposal from [user].
		/family divorce [user] - Removes [user] as your spouse.
		/family date [user] - Asks [user] to be your date.
		/family acceptdate [user] - Accepts a date request from [user].
		/family declinedate [user] - Declines the date request from [user].
		/family breakup [user] - Removes [user] as your date.
		/family tree [user] - Views [user]'s family tree; defaults to yourself if no [user].
		/family help - Displays this help command.`,
	],
};
