"use strict";

/**@type {{[k: string]: MoveData}} */
let BattleMovedex = {
	// RaginInfernape
	"fireydestruction": {
		id: "fireydestruction",
		name: "Firey Destruction",
		basePower: 100,
		accuracy: true,
		category: "Physical",
		shortDesc: "50% chance to burn.",
		desc: "50% chance to burn the opponent.",
		pp: 15,
		secondary: {
			chance: 50,
			status: "brn",
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Fiery Dance', target);
			this.add('-anim', source, 'Flare Blitz', target);
			this.add(`c|☢RaginInfernape|!git gud nerd`);
			let gitGud =
				 `${Config.serverName}'s Github's:<br />` +
				 `- Language: JavaScript (Node.js)<br />` +
				`- <a href="https://github.com/Zarel/Pokemon-Showdown">Main's source code</a><br />` +
				`- <a href="https://github.com/Zarel/Pokemon-Showdown-Client">Client source code</a><br />` +
				`- <a href="https://github.com/Zarel/Pokemon-Showdown-Dex">Dex source code</a>`;
			this.add(`raw|${gitGud}`);
		},
		flags: {protect: 1, mirror: 1, contact: 1, defrost: 1},
		priority: 0,
		target: "normal",
		type: "Fire",
	},

	// Volco
	"volcanicflares": {
		id: "volcanicflares",
		name: "Volcanic Flares",
		basePower: 130,
		accuracy: 95,
		category: "Special",
		shortDesc: "30% to burn the foe or self-boost SpA by 1 stage.",
		desc: "Has 30% chance of burning the foe or boost the user's SpD by 1 stage.",
		pp: 10,
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Eruption', target);
			this.add('-anim', source, 'Rock Tomb', target);
			this.add('-anim', source, 'Blue Flare', target);
		},
		onHit(target, source) {
			let rand = this.random(100);
			if (rand <= 30) {
				let effect = this.random(2);
				if (effect === 1) {
					target.trySetStatus('brn');
				} else {
					this.boost({spd: 1}, source);
				}
			}
		},
		secondary: false,
		flags: {protect: 1, mirror: 1},
		priority: 0,
		target: "normal",
		type: "Fire",
	},

	// Back At My Day
	"bigthunder": {
		id: "bigthunder",
		name: "Big Thunder",
		basePower: 120,
		accuracy: true,
		category: "Special",
		shortDesc: "50% chance to target self or foe.",
		desc: "50% chance to target user or the opponent.",
		pp: 10,
		onModifyMove(move, target, pokemon) {
			let newTarget = Math.floor(Math.random() * 100);
			if (newTarget > 50) {
				move.target = "normal";
			} else {
				move.target = "self";
			}
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Thunder', target);
			this.add(`c|@Back At My Day|Who's gonna get hit?`);
		},
		secondary: null,
		flags: {protect: 1, mirror: 1},
		priority: 0,
		type: "Electric",
	},

	// Chandie
	"sharpshadow": {
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		desc: "If this move is successful and the user has not fainted, the user switches out even if it is trapped and is replaced immediately by a selected party member. The user does not switch out if there are no unfainted party members, or if the target switched out using an Eject Button or through the effect of the Emergency Exit or Wimp Out Abilities.",
		shortDesc: "User switches out after damaging the target.",
		id: "sharpshadow",
		name: "Sharp Shadow",
		pp: 20,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		selfSwitch: true,
		secondary: null,
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Sucker Punch', target);
		},
		target: "normal",
		type: "Ghost",
		zMovePower: 100,
		contestType: "Cool",
	},

	// Chandie
	"embracethevoid": {
		id: "embracethevoid",
		name: "Embrace the Void",
		shortDesc: "Summons Magic Room. Switches out opponent.",
		basePower: 120,
		accuracy: true,
		isZ: "voidheart",
		pp: 1,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Black Hole Eclipse', target);
			this.add('-anim', target, 'Dark Void', target);
		},
		pseudoWeather: "magicroom",
		secondary: null,
		target: "normal",
		forceSwitch: true,
		category: "Physical",
		type: "Ghost",
	},

	// Horrific17
	"meteorcharge": {
		id: "meteorcharge",
		name: "Meteor Charge",
		desc: "Sets the weather to Sunny Day, and deals 1/3rd of the user's maximum health in recoil.",
		shortDesc: "Weather becomes sunny, 1/3 recoil of max HP.",
		basePower: 100,
		accuracy: 100,
		pp: 5,
		priority: 0,
		recoil: [1, 3],
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Flare Blitz', target);
			this.add(`c|@Horrific17|Pick a God and pray!`);
		},
		flags: {protect: 1, mirror: 1, contact: 1, defrost: 1},
		weather: "sunnyday",
		category: "Physical",
		type: "Fire",
		secondary: null,
		target: "normal",
	},

	// Horrific17
	"eternalflames": {
		id: "eternalflames",
		name: "Eternal Flames",
		shortDesc: "Burns and traps the target.",
		basePower: 150,
		accuracy: true,
		isZ: "arcaniumz",
		pp: 1,
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Extreme Evoboost', source);
			this.add('-anim', source, 'Flare Blitz', target);
			this.add('-anim', source, 'Magma Storm', target);
			this.add(`c|@Horrific17|See you in the Eternal Flames.`);
		},
		priority: 0,
		secondary: null,
		category: "Physical",
		type: "Fire",
		volatileStatus: "partiallytrapped",
		status: "brn",
		target: "normal",
	},

	// flufi
	"16years": {
		id: "16years",
		name: "16 Years",
		shortDesc: "Only works at 1 HP, user faints after usage.",
		basePower: 180,
		onPrepareHit(target, source) {
			if (source.hp !== 1) {
				this.hint(`This move may be only used once the user has 1 HP.`);
				return false;
			}
			this.add('-anim', source, 'Hex', source);
			this.add('-anim', source, 'Spectral Thief', source);
			this.add('-anim', source, 'Hyper Beam', target);
		},
		accuracy: true,
		pp: 5,
		priority: 0,
		secondary: null,
		selfdestruct: "ifHit",
		category: "Physical",
		type: "Dark",
		target: "normal",
	},

	// AlfaStorm
	"doomstrike": {
		id: "doomstrike",
		name: "Doom Strike",
		desc: "User switches out after damaging the target.",
		shortDesc: "Switches out after damaging.",
		basePower: 90,
		accuracy: 100,
		pp: 10,
		onPrepareHit(target, source) {
			this.add('-anim', target, 'Shadow Strike', target);
			this.add('-anim', target, 'U-Turn', target);
		},
		priority: 0,
		selfSwitch: true,
		secondary: null,
		category: "Special",
		type: "Dark",
		target: "normal",
	},

	// Roughskull
	"radiationstench": {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "Power doubles if the target is poisoned, and has a 30% chance to cause the target to flinch. Super effective against Steel Types.",
		shortDesc: "Power doubles if the target is poisoned. 30% chance to flinch. Super effective against Steel.",
		id: "radiationstench",
		name: "Radiation Stench",
		pp: 10,
		priority: 0,
		volatileStatus: 'gastroacid',
		flags: {protect: 1, mirror: 1},
		onBasePower(basePower, pokemon, target) {
			if (target.status === 'psn' || target.status === 'tox') {
				return this.chainModify(2);
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (move.type !== 'Poison') return;
			if (!target) return; // avoid crashing when called from a chat plugin
			// ignore effectiveness if the target is Steel type and immune to Poison
			if (!target.runImmunity('Poison')) {
				if (target.hasType('Steel')) return 0;
			}
		},
		ignoreImmunity: {'Poison': true},
		secondary: {
			chance: 20,
			volatileStatus: 'flinch',
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Acid Downpour', target);
		},
		target: "normal",
		type: "Poison",
		zMovePower: 200,
		contestType: "Beautiful",
	},

	// Tactician Loki
	"bloomingchaos": {
		id: "bloomingchaos",
		name: "Blooming Chaos",
		basePower: 90,
		accuracy: true,
		desc: "Casts Heart Swap, then casts Topsy Turvy on opponent, 30% to cause burn to opponent, 30% chance to badly poison opponent, 10% chance to cause Confusion on caster and opponent, 10% chance to cause opponent to fall in love, 10% chance for opponent to flinch, 10% chance to freeze opponent.",
		shortDesc: "A variety of curses begin.",
		pp: 20,
		priority: 2,
		category: "Special",
		onHit(target, source) {
			let targetBoosts = {};
			let sourceBoosts = {};

			for (let i in target.boosts) {
				// @ts-ignore
				targetBoosts[i] = target.boosts[i];
				// @ts-ignore
				sourceBoosts[i] = source.boosts[i];
			}

			target.setBoost(sourceBoosts);
			source.setBoost(targetBoosts);

			this.add('-swapboost', source, target, '[from] move: Blooming Chaos');

			let success = false;
			for (let i in target.boosts) {
				// @ts-ignore
				if (target.boosts[i] === 0) continue;
				// @ts-ignore
				target.boosts[i] = -target.boosts[i];
				success = true;
			}
			if (!success) return false;
			this.add('-invertboost', target, '[from] move: Blooming Chaos');
		},
		secondaries: [
			{
				chance: 30,
				status: "brn",
			}, {
				chance: 30,
				status: "tox",
			}, {
				chance: 10,
				volatileStatus: "confusion",
			}, {
				chance: 10,
				volatileStatus: "attract",
			}, {
				chance: 10,
				status: "frz",
			}, {
				chance: 10,
				volatileStatus: "flinch",
			},
		],
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Black Hole Eclipse', target);
			this.add(`c|~Tactician Loki|I love sending people into a tizzy.`);
		},
		flags: {reflectable: 1, protect: 1, mirror: 1},
		target: "normal",
		type: "Dark",
	},

	// Revival Clair
	"dragonblitz": {
		id: "dragonblitz",
		name: "Dragon Blitz",
		basePower: 80,
		accuracy: 100,
		desc: "Nearly always goes first and has 33% chance of boosting Attack by 1 stage, and does neutral damage towards Fairies.",
		shortDesc: "33% chance of boosting Atk by 1 stage, neutral damage to Fairy types.",
		pp: 5,
		priority: 2,
		category: "Physical",
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Dragon Rush', target);
			this.add(`c|+Revival Clair|Good game, too easy.`);
		},
		onEffectiveness(typeMod, target, type, move) {
			if (move.type !== 'Dragon') return;
			if (!target) return; // avoid crashing when called from a chat plugin
			// ignore effectiveness if the target is Fairy type and immune to Dragon
			if (!target.runImmunity('Dragon')) {
				if (target.hasType('Fairy')) return 0;
			}
		},
		flags: {protect: 1, mirror: 1, contact: 1},
		ignoreImmunity: {'Dragon': true},
		secondary: {
			chance: 33,
			self: {
				boosts: {
					atk: 1,
				},
			},
		},
		target: "normal",
		type: "Dragon",
	},

	// Spectral Bot
	"angelicspectral": {
		isNonstandard: true,
		accuracy: 100,
		category: "Physical",
		id: "angelicspectral",
		desc: "Transforms into Marshadow if Magearna or vice versa.",
		name: "Angelic Spectral",
		pp: 10,
		priority: 1,
		basePower: 110,
		onHit(target, pokemon, move) {
			if (pokemon.baseTemplate.baseSpecies === 'Magearna' && !pokemon.transformed) {
				move.willChangeForme = true;
			}
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (move.willChangeForme) {
				pokemon.formeChange(pokemon.template.speciesid === 'marshadow' ? 'Magearna' : 'Marshadow', this.effect, false, '[msg]');
			}
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Boomburst', source);
		},
		flags: {
			protect: 1,
			distance: 1,
		},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},

	// Auroura
	"inescapablecurse": {
		id: "inescapablecurse",
		name: "Inescapable Curse",
		basePower: 40,
		accuracy: 100,
		desc: "Traps, taunts, and curses the target.",
		shortDesc: "Traps, taunts, and curses the target.",
		pp: 10,
		priority: 0,
		category: "Special",
		flags: {protect: 1, mirror: 1},
		secondaries: [
			{
				chance: 100,
				volatileStatus: "curse",
			}, {
				chance: 100,
				volatileStatus: "torment",
			}, {
				chance: 100,
				volatileStatus: "embargo",
			},
		],
		volatileStatus: 'taunt',
		effect: {
			duration: 5,
			onStart(target) {
				if (target.activeTurns && !this.willMove(target)) {
					this.effectData.duration++;
				}
				this.add('-start', target, 'move: Inescapable Curse');
			},
			onResidualOrder: 12,
			onEnd(target) {
				this.add('-end', target, 'move: Inescapable Curse');
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (this.dex.getMove(moveSlot.id).category === 'Status') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onBeforeMovePriority: 5,
			onBeforeMove(attacker, defender, move) {
				if (!move.isZ && move.category === 'Status') {
					this.add('cant', attacker, 'move: Inescapable Curse', move);
					return false;
				}
			},
			onStart(pokemon, source) {
				this.add('-start', pokemon, 'Inescapable Curse', '[of] ' + source);
			},
			onResidualOrder: 10,
			onResidual(pokemon) {
				this.damage(pokemon.maxhp / 4);
			},
		},
		onHit(target, source, move) {
			return target.addVolatile('trapped', source, move, 'trapper');
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Curse', target);
		},
		target: "normal",
		type: "Ghost",
	},

	// HiTechFlufi
	"crippledencryption": {
		id: "crippledencryption",
		name: "Crippled Encryption",
		basePower: 0,
		accuracy: true,
		desc: "Lowers the target's highest stat by 1, confuses the target, and traps the target for 5 turns.",
		shortDesc: "Lowers highest stat by 1, confuses, traps for 4-5 turns.",
		pp: 10,
		priority: 0,
		category: "Status",
		flags: {protect: 1, mirror: 1, reflectable: 1},
		volatileStatus: 'confusion',
		secondary: {
			chance: 100,
			onHit(target, source, move) {
				target.addVolatile('trapped', source, move, 'trapper');
			},
		},
		onHit(target, source, move) {
			let statName = 'atk';
			let bestStat = 0;
			/** @type {StatNameExceptHP} */
			let s;
			for (s in target.storedStats) {
				if (target.storedStats[s] > bestStat) {
					statName = s;
					bestStat = target.storedStats[s];
				}
			}
			this.boost({[statName]: -1}, target);
		},
		onPrepareHit(target, source, move) {
			this.add('-anim', source, 'Block', target);
			this.add('-anim', source, 'Tri Attack', target);
			this.add('-anim', source, 'Hex', target);
		},
		target: "normal",
		type: "Steel",
	},

	// Renfur⚡⚡
	"desertdragon": {
		id: "desertdragon",
		name: "Desert Dragon",
		basePower: 90,
		accuracy: 100,
		desc: "User switches out after damaging the target and doubles allies' speed for 4 turns. Hits adjacent Pokemon.",
		shortDesc: "Switches out after damaging, doubles allies' speed for 4 turns and hits adjacent Pokemon.",
		pp: 10,
		priority: 0,
		selfSwitch: true,
		category: "Special",
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Boomburst', target);
			this.add(`c|%Renfur⚡⚡|This move ain't even that broke Obama`);
		},
		flags: {protect: 1, mirror: 1, sound: 1, authentic: 1},
		self: {
			sideCondition: 'tailwind',
			effect: {
				duration: 4,
				onStart(side) {
					this.add('-sidestart', side, 'move: Desert Dragon');
				},
				onModifySpe(spe, pokemon) {
					return this.chainModify(2);
				},
				onResidualOrder: 21,
				onResidualSubOrder: 4,
				onEnd(side) {
					this.add('-sideend', side, 'move: Desert Dragon');
				},
			},
		},
		secondary: null,
		target: "allAdjacent",
		type: "Bug",
	},
	
	// shademaura ⌐⚡_
	"sarcasmovertext": {
		id: "sarcasmovertext",
		name: "Sarcasm Over Text",
		basePower: 100,
		accuracy: 100,
		desc: "Hits adjacent Pokemon and has 100% chance to Taunt.",
		shortDesc: "Hits adjacent Pokemon and always Taunts.",
		pp: 5,
		priority: 0,
		category: "Physical",
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Earthquake', target);
			this.add(`c|%shademaura ⌐⚡_|Oh ur SSB is so good`);
		},
		flags: {protect: 1, mirror: 1},
		volatileStatus: 'taunt',
		secondary: null,
		target: "allAdjacent",
		type: "Poison",
	},
	
	// Lady Kakizaki
	"yandereblitz": {
		id: "yandereblitz",
		name: "Yandere Blitz",
		basePower: 100,
		accuracy: 100,
		desc: "20% chance to burn, 20% chance to freeze, 50% chance to confuse and heals 1/8 of damage dealt.",
		shortdesc: "20% burn, 20% freeze, 50% confuse, heals 1/8 of damage dealt.",
		pp: 10,
		priority: 0,
		category: "Special",
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Tri Attack', target);
			this.add(`c|%Lady Kakizaki|LoVE MEeeeEE!!!!!!!!!!!`);
		},
		flags: {protect: 1, mirror: 1},
		secondaries: [
			{
				chance: 20,
				status: 'brn',
			}, {
				chance: 20,
				status: 'frz',
			}, {
				chance: 50,
				volatileStatus: 'confusion',
			},
		],
		drain: [1, 8],
		target: "normal",
		type: "Ice",
	},

	// Revival Rawk
	"thenappening": {
		id: "thenappening",
		name: "The Nappening",
		basePower: 0,
		accuracy: 100,
		desc: "User falls asleep to restore HP and remove status. Will wake up on the next turn.  Makes oppponent fall asleep as well (no guaranteed wake up time).",
		shortDesc: "User sleeps for a turn to restore HP and status. Foe sleeps as well.",
		pp: 10,
		priority: 0,
		category: "Status",
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Rest', source);
			this.add(`-- Revival Rawk is now nap.`);
		},
		status: "slp",
		flags: {snatch: 1, heal: 1},
		self: {
			onTryMove(pokemon) {
				if (pokemon.hp < pokemon.maxhp && pokemon.status !== 'slp' && !pokemon.hasAbility('comatose')) return;
				this.add('-fail', pokemon);
				return null;
			},
			onHit(target, source, move) {
				if (!target.setStatus('slp', source, move)) return false;
				target.statusData.time = 2;
				target.statusData.startTime = 2;
				this.heal(target.maxhp); // Aesthetic only as the healing happens after you fall asleep in-game
			},
		},
		secondary: null,
		target: "normal",
		type: "Psychic",
	},

	// shade lynn skye
	"leafhurricane": {
		accuracy: 100,
		basePower: 90,
		category: "Special",
		desc: "Effects of Reflect, Light Screen, Aurora Veil, Safeguard, Mist, Spikes, Toxic Spikes, Stealth Rock, and Sticky Web end for the user's side, the user has a 30% chance to make the target flinch or become confused.",
		shortDesc: "Clears the user's side's hazards, 30% chance to flinch or confuse.",
		id: "leafhurricane",
		isViable: true,
		name: "Leaf Hurricane",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1, authentic: 1},
		onHit(target, source, move) {
			let success = false;
			let removeTarget = ['reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb'];
			let removeAll = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb'];
			for (const sideCondition of removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.getEffect(sideCondition).name, '[from] move: Leaf Hurricane', '[of] ' + source);
					success = true;
				}
			}
			return success;
		},
		secondaries: [
			{
				chance: 30,
				status: 'confusion',
			}, {
				chance: 30,
				status: 'flinch',
			},
		],
		target: "normal",
		type: "Flying",
		contestType: "Cool",
	},
};

exports.BattleMovedex = BattleMovedex;
