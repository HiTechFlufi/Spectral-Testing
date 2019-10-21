"use strict";

exports.BattleMovedex = {
	// DEFAULT CUSTOM MOVES
	// Normal
	stretch: {
		category: "Status",
		accuracy: 100,
		id: "stretch",
		name: "Stretch",
		isNonstandard: true,
		flags: {
			snatch: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Wrap", source);
		},
		pp: 10,
		boosts: {
			atk: 1,
			spa: 1,
			spe: 1,
		},
		zMoveEffect: 'heal',
		target: "self",
		type: "Normal",
		desc: "Raises the user's Attack, Special Attack and Speed by 1.",
		shortDesc: "+1 Atk, SpA, and Spe.",
	},

	// Fire
	flametower: {
		category: "Special",
		accuracy: 100,
		basePower: 80,
		id: "flametower",
		name: "Flame Tower",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Fire Spin", target);
		},
		pp: 15,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		volatileStatus: 'partiallytrapped',
		secondary: {
			chance: 50,
			status: 'brn',
		},
		zMovePower: 140,
		target: "normal",
		type: "Fire",
		desc: "Traps the target for 4-5 turns and 50% chance to burn the target.",
		shortDesc: "Traps target; 50% chance to burn.",
	},

	// Water
	rainspear: {
		category: "Special",
		accuracy: 100,
		basePower: 50,
		id: "rainspear",
		name: "Rain Spear",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Icicle Spear", target);
		},
		pp: 15,
		priority: 1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		weather: 'raindance',
		secondary: {
			chance: 20,
			volatileStatus: 'flinch',
		},
		zMovePower: 110,
		target: "normal",
		type: "Water",
		desc: "Summons Rain Dance and has 20% chance to flinch the target.",
		shortDesc: "Sets Rain Dance; 20% chance to flinch.",
	},

	// Grass
	healingherbs: {
		category: "Status",
		accuracy: 100,
		id: "healingherbs",
		name: "Healing Herbs",
		isNonstandard: true,
		flags: {
			mirror: 1,
			snatch: 1,
			heal: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Recover", source);
		},
		onHit(target, pokemon, move) {
			this.useMove('Aromatherapy', pokemon);
		},
		heal: [1, 2],
		pp: 5,
		priority: 0,
		target: "self",
		type: "Grass",
		zMoveEffect: 'heal',
		desc: "Cures the user's party of all status conditions and heals the user by 50% of its max HP.",
		shortDesc: "Heals 1/2 of max HP; uses Aromatherapy.",
	},

	// Electric
	electrodrive: {
		category: "Special",
		accuracy: 100,
		basePower: 0,
		id: "electrodrive",
		name: "Electro Drive",
		isNonstandard: true,
		basePowerCallback(pokemon, target) {
			let ratio = (pokemon.getStat('spe') / target.getStat('spe'));
			this.debug([40, 60, 80, 120, 150][(Math.floor(ratio) > 4 ? 4 : Math.floor(ratio))] + ' bp');
			if (ratio >= 4) {
				return 150;
			}
			if (ratio >= 3) {
				return 120;
			}
			if (ratio >= 2) {
				return 80;
			}
			if (ratio >= 1) {
				return 60;
			}
			return 40;
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Electro Ball", target);
		},
		flags: {
			bullet: 1,
			protect: 1,
			mirror: 1,
		},
		self: {
			boosts: {
				spe: 1,
			},
		},
		zMovePower: 120,
		pp: 10,
		priority: 0,
		target: "normal",
		type: "Electric",
		desc: "More power the faster the user is than the target and raises the user's speed by 1.",
		shortDesc: "More power faster user is; raises Spe by 1.",
	},

	//Ice
	hailstorm: {
		category: "Status",
		accuracy: 100,
		id: "hailstorm",
		name: "Hailstorm",
		isNonstandard: true,
		flags: {
			protect: 1,
			mirror: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", source);
		},
		onHit(target, pokemon, move) {
			this.useMove('Blizzard', pokemon);
		},
		pp: 10,
		weather: 'hail',
		priority: 0,
		target: "normal",
		type: "Ice",
		zMoveEffect: 'heal',
		desc: "Summons Hail and uses Blizzard.",
	},

	// Fighting
	beatdown: {
		category: "Physical",
		basePower: 200,
		accuracy: 80,
		id: "beatdown",
		name: "Beat Down",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dynamic Punch", target);
		},
		flags: {
			recharge: 1,
			protect: 1,
			mirror: 1,
		},
		self: {
			volatileStatus: 'mustrecharge',
		},
		secondary: {
			chance: 50,
			status: 'par',
		},
		pp: 5,
		priority: -1,
		target: "normal",
		type: "Fighting",
		zMovePower: 250,
		desc: "50% chance to paralyze the target. User must recharge next turn, if this move is successful.",
		shortDesc: "50% chance to par; must recharge.",
	},

	// Poison
	nuclearwaste: {
		category: "Status",
		accuracy: 95,
		id: "nuclearwaste",
		name: "Nuclear Waste",
		isNonstandard: true,
		flags: {
			protect: 1,
			reflectable: 1,
			snatch: 1,
		},
		status: 'tox',
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Toxic", target);
			this.add('-anim', target, "Fire Blast", target);
		},
		boosts: {
			atk: -1,
		},
		pp: 20,
		priority: 0,
		target: "normal",
		type: "Poison",
		zMoveEffect: 'heal',
		desc: "Badly poisons the target and lowers the foe's attack by 1.",
		shortDesc: "Badly poisons target; lowers Atk by 1.",
	},

	// Ground
	terratremor: {
		category: "Physical",
		accuracy: 75,
		basePower: 140,
		id: "terratremor",
		name: "Terratremor",
		isNonstandard: true,
		flags: {
			protect: 1,
			mirror: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Precipice Blades", target);
		},
		pp: 5,
		priority: 0,
		secondary: {
			chance: 15,
			volatileStatus: 'flinch',
		},
		target: "normal",
		type: "Ground",
		zMovePower: 190,
		desc: "15% chance to flinch the target.",
	},

	// Flying
	ventilation: {
		category: "Status",
		accuracy: 100,
		id: "ventilation",
		name: "Ventilation",
		isNonstandard: true,
		flags: {
			protect: 1,
			reflectable: 1,
			mirror: 1,
			authentic: 1,
			snatch: 1,
		},
		priority: 0,
		pp: 15,
		onHit(target, source, move) {
			if (!target.volatiles['substitute'] || move.infiltrates) {
				this.boost({
					evasion: -1,
				});
				let removeTarget = {
					reflect: 1,
					lightscreen: 1,
					safeguard: 1,
					mist: 1,
				};
				let removeAll = {
					spikes: 1,
					toxicspikes: 1,
					stealthrock: 1,
					stickyweb: 1,
				};
				for (let targetCondition in removeTarget) {
					if (target.side.removeSideCondition(targetCondition)) {
						if (!removeAll[targetCondition]) continue;
						this.add('-sideend', target.side, this.dex.getEffect(targetCondition).name, '[from] move: Ventilation', '[of] ' + target);
					}
				}
				for (let sideCondition in removeAll) {
					if (source.side.removeSideCondition(sideCondition)) {
						this.add('-sideend', source.side, this.dex.getEffect(sideCondition).name, '[from] move: Ventilation', '[of] ' + source);
					}
				}
				this.clearWeather();
			}
		},
		target: "normal",
		type: "Flying",
		zMoveEffect: 'heal',
		desc: "Clears user and target side's hazards and removes weather. This move infiltrates substitutes.",
		shortDesc: "Removes hazards, and weather.",
	},

	// Psychic
	psychicshield: {
		category: "Status",
		accuracy: 100,
		id: "psychicshield",
		name: "Psychic Shield",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Protect", source);
		},
		onHit(target, pokemon, move) {
			this.useMove('Light Screen', pokemon);
			this.useMove('Reflect', pokemon);
		},
		flags: {
			snatch: 1,
		},
		pp: 5,
		target: "self",
		type: "Psychic",
		zMoveEffect: 'heal',
		desc: "Sets Light Screen and Reflect.",
	},

	// Bug
	swarmcharge: {
		category: "Physical",
		basePower: 100,
		accuracy: 90,
		id: "swarmcharge",
		name: "Swarm Charge",
		isNonstandard: true,
		flags: {
			protect: 1,
			mirror: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Attack Order", target);
		},
		secondary: {
			chance: 30,
			self: {
				boosts: {
					atk: 1,
					spe: 1,
				},
			},
		},
		pp: 10,
		target: "normal",
		type: "Bug",
		zMovePower: 180,
		shortDesc: "30% chance to raise Atk & Spe by 1.",
		desc: "30% chance to raise the user's Attack and Speed by 1.",
	},

	// Rock
	rockcannon: {
		category: "Special",
		basePower: 110,
		accuracy: 100,
		id: "rockcannon",
		name: "Rock Cannon",
		isNonstandard: true,
		flags: {
			protect: 1,
			mirror: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Power Gem", target);
		},
		secondary: {
			chance: 30,
			volatileStatus: 'flinch',
		},
		pp: 10,
		priority: 0,
		target: "normal",
		type: "Rock",
		zMovePower: 195,
		desc: "30% chance to flinch the target.",
	},

	// Ghost
	spook: {
		category: "Special",
		basePower: 80,
		accuracy: 100,
		id: "spook",
		name: "Spook",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Trick-or-Treat", source);
		},
		flags: {
			protect: 1,
			mirror: 1,
		},
		willCrit: true,
		secondary: {
			chance: 30,
			volatileStatus: 'flinch',
		},
		pp: 10,
		priority: 0,
		target: "normal",
		type: "Ghost",
		zMovePower: 160,
		desc: "30% chance to flinch the target and always crits.",
		shortDesc: "30% chance to flinch; always crits.",
	},

	// Dragon
	imperialrampage: {
		category: "Physical",
		basePower: 175,
		accuracy: 100,
		id: "imperialrampage",
		name: "Imperial Rampage",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Outrage", target);
		},
		self: {
			volatileStatus: 'lockedmove',
		},
		onAfterMove(pokemon) {
			if (pokemon.volatiles['lockedmove'] && pokemon.volatiles['lockedmove'].duration === 1) {
				pokemon.removeVolatile('lockedmove');
				this.boost({
					atk: -2,
				});
			}
		},
		pp: 10,
		flags: {
			contact: 1,
			protect: 1,
			mirror: 1,
		},
		priority: 0,
		target: "normal",
		type: "Dragon",
		zMovePower: 220,
		desc: "Lasts 2-3 turns, confuses the user afterwards and lowers the user's Attack by 2.",
		shortDesc: "2-3 turns, confuses user, lowers Atk by 2.",
	},

	// Dark
	shadowrun: {
		category: "Physical",
		basePower: 100,
		accuracy: 95,
		id: "shadowrun",
		name: "Shadow Run",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Shadow Sneak", target);
			this.add('-anim', target, "Knock Off", target);
		},
		onAfterHit(target, source) {
			if (source.hp) {
				let item = target.takeItem();
				if (item) {
					this.add('-enditem', target, item.name, '[from] move: Shadow Run', '[of] ' + source);
				}
			}
		},
		pp: 10,
		flags: {
			contact: 1,
			protect: 1,
			mirror: 1,
		},
		priority: 1,
		target: "normal",
		type: "Dark",
		zMovePower: 180,
		desc: "1.5x damage if foe holds an item. Removes item.",
	},

	// Steel
	magnorang: {
		category: "Physical",
		accuracy: 90,
		basePower: 120,
		id: "magnorang",
		name: "Magnorang",
		isNonstandard: true,
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Magnet Bomb", target);
		},
		onHit(target, source, move) {
			if (target.types.indexOf('Steel') > -1) {
				if (!target.addVolatile('trapped', source, move, 'trapper')) {
					this.add('-fail', target);
				}
			}
		},
		pp: 10,
		flags: {
			protect: 1,
			mirror: 1,
		},
		target: "normal",
		type: "Steel",
		zMovePower: 210,
		desc: "Traps Steel Types from choosing to switch.",
	},

	// Fairy
	majesticdust: {
		category: "Special",
		accuracy: 100,
		basePower: 120,
		id: "majesticdust",
		name: "Majestic Dust",
		isNonstandard: true,
		flags: {
			protect: 1,
			powder: 1,
		},
		onPrepareHit(target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Powder", target);
		},
		secondary: {
			chance: 30,
			status: 'par',
		},
		pp: 10,
		target: "normal",
		zMovePower: 210,
		type: "Fairy",
		desc: "30% chance to paralyze the target.",
	},

	// Shade Churup
	"dragonstrike": {
		id: "dragonstrike",
		name: "Dragon Strike",
		basePower: 120,
		accuracy: 85,
		pp: 5,
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spa: 2,
				},
			},
		},
		category: "Physical",
		isNonstandard: true,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
			contact: 1,
		},
		desc: "Boosts the user's Special Attack by 2 stages.",
		shortDesc: "Boosts Special Attack by 2 stages.",
		onPrepareHit(target, source) {
			this.add('-anim', source, "Outrage", target);
		},
		target: "normal",
		type: "Dragon",
		zMovePower: 200,
	},
	
	// Shade Churup
	"dragonicsmash": {
		id: "dragonicsmash",
		name: "dragonicsmash",
		basePower: 200,
		accuracy: true,
		pp: 1,
		noPPBoosts: true,
		secondary: {
			chance: 100,
			self: {
				boosts: {
					atk: 2,
				},
			},
		},
		desc: "Boosts the user's Attack by 2 stages.",
		shortDesc: "Boosts Attack by 2 stages.",
		category: "Physical",
		isNonstandard: true,
		isZ: "dragoniumz",
		priority: 0,
		flags: {
			contact: 1,
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, "Clangorous Soulblaze", target);
		},
		target: "normal",
		type: "Dragon",
	},
	
	// trees are cool
	"mildvines": {
		id: "mildvines",
		name: "Mild Vines",
		basePower: 75,
		accuracy: 85,
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
			contact: 1,
		},
		secondary: {
			chance: 100,
			onHit(target, source) {
				let result = this.random(2);
				if (result === 0) {
					this.boost({atk: 1});
				} else {
					this.boost({accuracy: 1});
				}
			},
		},
		shortDesc: "Hits twice, boosts either Attack or Accuracy by 1 stage.",
		multihit: 2,
		category: "Physical",
		isNonstandard: true,
		onPrepareHit(target, source) {
			this.add('-anim', source, "Vine Whip", target);
		},
		target: "normal",
		type: "Grass",
		zMovePower: 100,
	},
	
	// trees are cool
	"spicyvines": {
		id: "spicyvines",
		name: "Spicy Vines",
		basePower: 100,
		accuracy: true,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			contact: 1,
		},
		multihit: 2,
		category: "Physical",
		isNonstandard: true,
		onPrepareHit(target, source) {
			this.add('-anim', source, "Fire Lash", target);
		},
		shortDesc: "Hits twice, drains 1/2 of the damage dealt, and ignores immunities.",
		isZ: "carniviumz",
		drain: [1, 2],
		secondary: null,
		target: "normal",
		type: "Grass",
		ignoreImmunities: true,
	},
	
	// Shade Bones
	"waitwtf": {
		id: "waitwtf",
		name: "Wait WTF",
		basePower: 0,
		accuracy: true,
		pp: 10,
		priority: 0,
		flags: {
			mystery: 1,
		},
		onHit(target, pokemon) {
			if (!pokemon.transformInto(target)) {
				return false;
			}
		},
		category: "Status",
		isNonstandard: true,
		onPrepareHit(target, source) {
			this.add('-anim', source, "Transform", target);
		},
		shortDesc: "Transforms into the opponent.",
		secondary: null,
		target: "normal",
		type: "Normal",
		zMoveEffect: 'heal',
	},
	
	// Chonner
	"dragondash": {
		id: "dragondash",
		name: "Dragon Dash",
		basePower: 75,
		accuracy: 100,
		pp: 5,
		priority: 1,
		flags: {
			protect: 1,
			mirror: 1,
			contact: 1,
			heal: 1,
		},
		category: "Special",
		isNonstandard: true,
		onPrepareHit(target, source) {
			this.add('-anim', source, "Extreme Speed", target);
		},
		shortDesc: "Drains 1/2 of the damage dealt.",
		secondary: null,
		drain: [1, 2],
		target: "normal",
		type: "Dragon",
	},
	
	// Satoriiiin
	"sleeplesstrauma": {
		id: "sleeplesstrauma",
		name: "Sleepless Trauma",
		basePower: 80,
		accuracy: 70,
		pp: 15,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
			heal: 1,
		},
		category: "Special",
		isNonstandard: true,
		onPrepareHit(target, source) {
			this.add('-anim', source, "Mind Reader", target);
			this.add('-anim', source, "Psychic", target);
		},
		volatileStatus: 'nightmare',
		effect: {
			noCopy: true,
			onStart(pokemon) {
				if (pokemon.status !== 'slp' && !pokemon.hasAbility('comatose')) {
					return false;
				}
				this.add('-start', pokemon, 'Sleepless Trauma');
			},
			onResidualOrder: 9,
			onResidual(pokemon) {
				this.damage(pokemon.maxhp / 4);
			},
		},
		onModifyMove(move, target) {
			if (target.status !== 'slp' && !target.hasAbility('comatose')) {
				move.drain = [1, 2];
			}
		},
		desc: "Causes the target to have a Nightmare, heals the user's HP by 1/2 damage dealt if they are asleep, and 30% chance to make the target fall asleep.",
		shortDesc: "30% chance to make target sleep, causes opponent to have a Nightmare, and heals by 1/2 of damage if they are asleep.",
		secondary: {
			chance: 30,
			status: 'slp',
		},
		target: "normal",
		type: "Psychic",
	},

	// Shade heir
	"baheirier": {
		num: 164,
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "The user sets up a Substitute, and raises its Special Defense by 2 stages and Defense by 3 stages.",
		shortDesc: "Sets up Substitute, +2 SpD and +3 Def.",
		id: "baheirier",
		isViable: true,
		name: "Ba-heir-ier",
		pp: 10,
		priority: 0,
		flags: {snatch: 1, nonsky: 1},
		volatileStatus: 'substitute',
		boosts: {
			def: 3,
			spd: 2,
		},
		secondary: null,
		target: "self",
		type: "Grass",
	},

	// Revival N
	"theshockingtruth": {
		accuracy: 100,
		basePower: 60,
		category: "Physical",
		desc: "Hits twice. If the first hit breaks the target's substitute, it will take damage for the second hit. Has a 15% chance to flinch the target.",
		shortDesc: "Hits twice. 15% chance to flinch.",
		id: "theshockingtruth",
		isViable: true,
		name: "The Shocking Truth",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1, punch: 1},
		multihit: 2,
		secondary: {
			chance: 15,
			volatileStatus: 'flinch',
		},
		target: "normal",
		type: "Electric",
		zMovePower: 180,
		contestType: "Clever",
	},
};
