// uat.js or User Agent Tracking, is to deal with user // agents in an attempt to log a user's computer details to catch evading users. 
// studies show that 1 in every 1500 computers have a unique UserAgent.
// By managing this data, it is possible to identify evading users.

// Credits: origin.psim.us

'use strict';

// Time (in hours) the server tracks locked userAgents
// set to true to disable cleaning.
// the higher the userbase, the lower this number is
// faulty issues are only more probable when user count is above 1.5k users.
let LOCKED_USER_AGENT_TRACKING_TIME = 24;

// Time (in hours) past the lock where the server WILL auto shadow ban the evading user.
// set to true if you to always auto shadowban
let MAX_AUTO_SHADOWBAN_TIME = 2;

let lockedUserAgents = {};

let avoidUAs = ["^Mozilla\\5\\0 \\Windows NT (10|6)\\[0-9]\\ WOW64\\AppleWebKit\\537\\36"];
let avoidUARegex;

function loadAvoidUA() {
	avoidUARegex = new RegExp("(" + avoidUAs.join("|") + ")", "i");
}
loadAvoidUA();
function checkAvoid(UA) {
	return avoidUARegex.test(UA);
}

function cleanUserAgents() {
	if (LOCKED_USER_AGENT_TRACKING_TIME === true) return;
	let now = Date.now();
	for (let ua in lockedUserAgents) {
		if (now - lockedUserAgents[ua].time >= 3600000 * LOCKED_USER_AGENT_TRACKING_TIME) {
			// delete it
			delete lockedUserAgents[ua];
		}
	}
}

let lockUserAgent = function (user, reason) {
	lockedUserAgents[user.userAgent] = {
		time: Date.now(),
		userid: user.id,
	};
};

let unlockUserAgent = function (user) {
	for (let ua in lockedUserAgents) {
		if (lockedUserAgents[ua].userid === user) {
			// delete it, no longer locked
			delete lockedUserAgents[ua];
		}
	}
};

let checkEvade = function (user) {
	cleanUserAgents();
	// no need to keep on spamming up staff room
	if (user.caughtEvading || user.locked) return false;
	let agent = user.userAgent;
	if (!agent || checkAvoid(agent)) return false; // it's a blacklisted one for being so damn common. also prevent potential fuckups/crashes with bots
	if (agent in lockedUserAgents) {
		// get the time of lock
		let time = lockedUserAgents[agent].time;
		if (MAX_AUTO_SHADOWBAN_TIME === true || Date.now() - time <= MAX_AUTO_SHADOWBAN_TIME * 3600000) {
			Monitor.log("[SecretEvaderMonitor] " + user.name + " was automatically shadow banned - evading alt of " + lockedUserAgents[agent].userid + ".");
			Rooms.get("upperstaff").add(`[SecretEvaderMonitor] ${user.name} was automatically shadow banned - evading alt of ${lockedUserAgents[agent].userid}.`).update();
			Users.ShadowBan.addUser(user);
			// update the times
			lockUserAgent(user);
		} else {
			// just warn staff room & Upper Staff
			Monitor.log(`[SecretEvaderMonitor] ${user.name} suspected of being evading alt of ${lockedUserAgents[agent].userid}.`);
			Rooms.get("upperstaff").add(`[SecretEvaderMonitor] ${user.name} suspected of being evading alt of ${lockedUserAgents[agent].userid}.`).update();
		}
		// mark user as caught
		user.caughtEvading = true;
	}
};

module.exports = {
	lock: lockUserAgent,
	unlock: unlockUserAgent,
	check: checkEvade,
	lockedUserAgents: lockedUserAgents,
	time: LOCKED_USER_AGENT_TRACKING_TIME,
	load: loadAvoidUA,
};
