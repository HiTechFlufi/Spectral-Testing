"use strict";

/**@type {{[k: string]: MoveData}} */
let BattleMovedex = {
	// Heracross
	"onethousandstings": {
		id: "onethousandstings",
		name: "One Thousand Stings",
		basePower: 18,
		accuracy: 100,
		category: "Physical",
		shortDesc: "Hits 3 to 8 times.",
		desc: "Hits 3 to 8 times.",
		pp: 10,
		secondary: null,
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Poison Sting', target);
		},
		flags: {protect: 1, mirror: 1, contact: 1},
		multihit: [3, 8],
		priority: 0,
		target: "normal",
		type: "Bug",
	},
	// Camerupt
	"abrasivecombustion": {
		id: "abrasivecombustion",
		name: "Abrasive Combustion",
		basePower: 130,
		accuracy: 70,
		category: "Special",
		shortDesc: "Cannot be resisted. Hits neutrally on resistant types.",
		desc: "Cannot be resisted. Damage is dealt neutrally on types that resist the move's type.",
		pp: 10,
		secondary: null,
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Searing Shot', target);
		},
		flags: {protect: 1, mirror: 1},
		priority: 0,
		target: "normal",
		type: "Fire",
	},
	// Stakataka
	"barriercrush": {
		id: "barriercrush",
		name: "Barrier Crush",
		basePower: 150,
		accuracy: 100,
		category: "Physical",
		shortDesc: "Lowers the user's defense by 1. Goes last.",
		desc: "Lowers the user's defense by 1. Goes last.",
		pp: 5,
		secondary: null,
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Bounce', target);
		},
		flags: {protect: 1, mirror: 1, contact: 1},
		self: {
			boosts: {
				def: -1,
			},
		},
		priority: -7,
		target: "normal",
		type: "Steel",
	},
	// Rotom-Wash
	"douseanddip": {
		accuracy: 90,
		basePower: 60,
		category: "Special",
		desc: "If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members, or if the target switched out using an Eject Button or through the effect of the Emergency Exit or Wimp Out Abilities. The target's typing is changed to Water.",
		shortDesc: "User switches out after damaging the target. Changes target's type to water.",
		id: "douseanddip",
		isViable: true,
		name: "Douse & Dip",
		pp: 20,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onHit(target) {
			if (target.getTypes().join() === 'Water' || !target.setType('Water')) {
				// Soak should animate even when it fails.
				// Returning false would suppress the animation.
				this.add('-fail', target);
				return null;
			}
			this.add('-start', target, 'typechange', 'Water');
		},
		selfSwitch: true,
		secondary: null,
		target: "normal",
		type: "Water",
		zMovePower: 120,
		contestType: "Cool",
	},
	// Blastoise
	"hydraulicmaelstrom": {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		shortDesc: "Traps and damages the target for 4-5 turns.",
		id: "hydraulicmaelstrom",
		isViable: true,
		name: "Hydraulic Maelstrom",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		volatileStatus: 'partiallytrapped',
		secondary: null,
		target: "normal",
		type: "Water",
		zMovePower: 160,
		contestType: "Cool",
	},
};

exports.BattleMovedex = BattleMovedex;
