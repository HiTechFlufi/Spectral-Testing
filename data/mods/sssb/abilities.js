'use strict';

/**@type {{[k: string]: ModdedAbilityData}} */
let BattleAbilities = {
	// RaginInfernape
	"ragingspirit": {
		id: "ragingspirit",
		name: "Raging Spirit",
		desc: "Any moves that have 75 or less base power get boosted by 1.5x, the user cannot fall asleep, the user is unaffected by priority moves from the foe, uses Topsy Turvy on entry on the foe, and ignore's the foes evasion.",
		shortDesc: "Moves that have <= 75 BP get 1.5x damage, cannot fall asleep, isn't affected by priority moves, uses Topsy Turvy on entry, and ignores evasion.",
		onBasePowerPriority: 8,
		onBasePower(basePower, attacker, defender, move) {
			if (basePower <= 75) {
				this.debug('Raging Spirit boost');
				return this.chainModify(1.5);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Raging Spirit');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if (!effect || !effect.status) return false;
			this.add('-immune', target, '[from] ability: Raging Spirit');
			return false;
		},
		onFoeTryMove(target, source, effect) {
			if ((source.side === this.effectData.target.side || effect.id === 'perishsong') && effect.priority > 0.1 && effect.target !== 'foeSide') {
				this.attrLastMove('[still]');
				this.add('cant', this.effectData.target, 'ability: Raging Spirit', effect, '[of] ' + target);
				return false;
			}
		},
		onStart(pokemon) {
			this.useMove("topsyturvy", pokemon);
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
	},

	// Volco
	"emergencyactions": {
		id: "emergencyactions",
		name: "Emergency Actions",
		desc: "Grants a silent speed boost of 1.5x.",
		shortDesc: "Silent 1.5x Spe",
		onStart(pokemon) {
			this.add('-message', pokemon.name + "'s Emergency Actions has multiplied their speed by 1.5x (silently).");
		},
		onModifySpe(spe) {
			return this.chainModify(1.5);
		},
	},

	// flufi
	"heartofsteel": {
		id: "heartofsteel",
		name: "Heart of Steel",
		desc: "If the user is hit with an attack that would knock it out, they will survive the hit with 1 HP and receive +1 to Atk and Spe.",
		shortDesc: "If hit with an attack that would K.O, survives on 1 HP and raises Spe/Atk by 1.",
		onDamagePriority: -100,
		onDamage(damage, target, source, effect) {
			if (damage >= target.hp && effect && effect.effectType === 'Move' && target.hp !== 1) {
				this.boost({atk: 1}, target, target, null, true);
				this.boost({spe: 1}, target, target, null, true);
				this.add('-ability', target, 'Heart of Steel');
				return target.hp - 1;
			}
		},
	},

	// Back At My Day
	"pealofthunder": {
		id: "pealofthunder",
		name: "Peal of Thunder",
		desc: "Immune to Electric attacks and if hit by one, recover 25% of max HP and boost Defense and Special Defense by 1 stage.",
		shortDesc: "Electric immunity, 25% of max HP recovery and +1 Def/SpD if hit by an Electric attack.",
		onTryHit(target, source, move) {
			if (move.type === 'Electric') {
				if (!this.heal(target.maxhp / 4)) {
					this.add('-immune', target, '[from] ability: Peal of Thunder');
				}
				if (!this.boost({def: 1, spd: 1})) {
					this.add('-immune', target, '[from] ability: Peal of Thunder');
				}
				return null;
			}
		},
	},

	// Horrific17
	"reversecard": {
		id: "reversecard",
		name: "Reverse Card",
		desc: "Sets up Magic Room, and when the user's health drops below 25% of its maximum HP the user's Attack raises two stages, and Extreme Speed's base power raises to 120.",
		shortDesc: "Sets up Magic Room & user's Atk +2 when max HP < 25%, Extreme Speed now gets 120 BP.",
		onStart(pokemon) {
			this.useMove("magicroom", pokemon);
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				this.add("c|@Horrific17|I will not die here!");
				return this.chainModify(2);
			}
		},
		onModifyMove(move) {
			if (move.id === 'extremespeed') {
				move.basePower = 120;
			}
		},
	},

	// Chandie
	"shadeseeker": {
		id: "shadeseeker",
		name: "Shade Seeker",
		desc: "The user ignores target's stat changes, and Spectral Thief get +1 priority if the user or target have any stat boosts.",
		shortDesc: "Ignores target's stat changes, Spectral Thief get +1 priority if user/target have stat boosts.",
		onAnyModifyBoost(boosts, target, move) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onModifyPriority(priority, pokemon, target, move) {
			let changed = false;
			for (let stats in pokemon.boosts) {
				for (const target of pokemon.side.foe.active) {
					if (pokemon.boosts[stats] > 0 || target.boosts[stats] > 0) {
						changed = true;
						break;
					}
				}
				if (changed) break;
			}
			if (changed && move && move.id === 'spectralthief') {
				move.shadeSeekerBoosted = true;
				return priority + 1;
			}
		},
	},

	// Roughskull
	"venomshock": {
		id: "venomshock",
		name: "Venom Shock",
		desc: "Every move the user uses has a 30% chance to badly poison or paralyze the target.",
		shortDesc: "Every move has a 30% chance to toxicate or paralyze target.",
		onModifyMove(move) {
			if (!move || move.target === 'self') return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 30,
				status: 'tox',
				ability: this.getAbility('venomshock'),
			});
			move.secondaries.push({
				chance: 30,
				status: 'par',
				ability: this.getAbility('venomshock'),
			});
		},
	},

	// Lady Kakizaki
	"chaoticaura": {
		id: "chaoticaura",
		name: "Chaotic Aura",
		desc: "Status moves are given +1 priority, and every turn at the end the user raises one stat up by two stages and lowers one stat by one stage.",
		shortDesc: "Status moves are given +1 priority, every turn +2 random stat & -1 random stat.",
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual(pokemon) {
			let stats = [];
			let boost = {};
			for (let statPlus in pokemon.boosts) {
				// @ts-ignore
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? this.sample(stats) : "";
			// @ts-ignore
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			for (let statMinus in pokemon.boosts) {
				// @ts-ignore
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : "";
			// @ts-ignore
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost);
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.chaoticAuraBoosted = true;
				return priority + 1;
			}
		},
	},

	// Tactician Loki
	"chaosheart": {
		id: "chaoticaura",
		name: "Chaotic Aura",
		desc: "Status moves are given +1 priority, and every turn at the end the user raises one stat up by two stages and lowers one stat by one stage.  When the user switches in, the active foe, if any, drops 3 stages of their Attack and Special Attack.",
		shortDesc: "Status moves are given +1 priority, every turn +2 random stat & -1 random stat, and when switched in foe's Atk and SpA drop 3 stages.",
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual(pokemon) {
			let stats = [];
			let boost = {};
			for (let statPlus in pokemon.boosts) {
				// @ts-ignore
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? this.sample(stats) : "";
			// @ts-ignore
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			for (let statMinus in pokemon.boosts) {
				// @ts-ignore
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : "";
			// @ts-ignore
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost);
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.chaosHeartBoosted = true;
				return priority + 1;
			}
		},
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.side.foe.active) {
				if (!target || !this.isAdjacent(target, pokemon)) continue;
				if (!activated) {
					this.add('-ability', pokemon, 'Chaos Heart', 'boost');
					activated = true;
				}
				this.boost({atk: -3, spa: -3}, target, pokemon);
			}
		},
	},

	// Revival Clair
	"toughskin": {
		id: "toughskin",
		name: "Tough Skin",
		desc: "Neutral damage from Ice attacks.",
		shortDesc: "1x damage from Ice.",
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ice') {
				this.debug('Tough Skin weaken');
				return this.chainModify(0.25);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ice') {
				this.debug('Tough Skin weaken');
				return this.chainModify(0.25);
			}
		},
	},

	// Spectral Bot
	"spectralsthief": {
		id: "spectralsthief",
		name: "Spectral's Thief",
		desc: "Before every move, the user checks if the user has any positive boosts, if so, the user steals said stats.",
		shortDesc: "The user steals the target's boosts, if any, before every move.",
		onBeforeMovePriority: 12,
		onModifyMove(move) {
			move.stealsBoosts = true;
		},
	},

	// Revival xFloatz
	"xfz": {
		id: "xfz",
		name: "XFZ",
		desc: "Status moves gain +1 priority.",
		shortDesc: "+1 priority on Status.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.xfzBoosted = true;
				return priority + 1;
			}
		},
	},
	
	// Renfur⚡⚡
	"desertspirit": {
		id: "desertspirit",
		name: "Desert Spirit",
		desc: "User becomes Bug/Dragon Type and gains +1 priority on Bug/Dragon Type moves when at 25% HP or lower.",
		shortDesc: "Become Bug/Dragon and +1 priority on Bug/Dragon attacks when at 25% HP or lower.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.type === 'Bug' || move.type === 'Dragon' && pokemon.hp <= pokemon.maxhp / 4) return priority + 1;
		},
		onStart: function (pokemon) {
			this.add("-start", pokemon, "typechange", "Bug/Dragon");
			pokemon.types = ["Bug", "Dragon"];
		},
	},
	
	// shademaura ⌐⚡_
	"slowpixilate": {
		id: "slowpixilate",
		name: "Slow Pixilate",
		desc: "User becomes Fairy/Poison Type, has halved Attack and Speed for 2 turns and turns Normal attacks into Fairy attacks with 1.2x Power.",
		shortDesc: "Become Fairy/Poison, half Atk/Spe for 2 turns and Normal moves become Fairy moves with 1.2x BP.",
		onStart(pokemon) {
			pokemon.addVolatile('slowpixilate');
			this.add("-start", pokemon, "typechange", "Fairy/Poison");
			pokemon.types = ["Fairy", "Poison"];
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['slowpixilate'];
			this.add('-end', pokemon, 'Slow Pixilate', '[silent]');
		},
		effect: {
			duration: 2,
			onStart(target) {
				this.add('-start', target, 'ability: Slow Pixilate');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				return this.chainModify(0.5);
			},
			onModifySpe(spe, pokemon) {
				return this.chainModify(0.5);
			},
			onEnd(target) {
				this.add('-end', target, 'Slow Pixilate');
			},
		},
		onModifyMovePriority: -1,
		onModifyMove(move, pokemon) {
			if (move.type === 'Normal' && !['judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'weatherball'].includes(move.id) && !(move.isZ && move.category !== 'Status')) {
				move.type = 'Fairy';
				move.slowpixilateBoosted = true;
			}
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, pokemon, target, move) {
			if (move.slowpixilateBoosted) return this.chainModify([0x1333, 0x1000]);
		},
	},

	// HiTechFlufi
	"adaptation": {
		id: "adaptation",
		name: "Adaptation",
		desc: "May paralyse or burn foe or reduce foe's SpA/SpD/Spe by 1 stage or heal 1/3 of max HP on switch-in. Status moves have +1 priority.",
		shortDesc: "Paralyse or burn foe or reduce foe's SpA/SpD/Spe by 1 stage or heal 1/3 of max HP on switch-in; Status has +1 priority.",
		onSwitchInPriority: 8,
		onSwitchIn(pokemon, target, source) {
			// Paralyze or Burn
			for (const source of pokemon.side.foe.active) {
				if (!source || source.fainted) continue;
				let speed = source.getStat('spe');
				let attack = source.getStat('atk');
				if (speed >= 300 && attack >= 350) {
					if (speed > attack) {
						source.trySetStatus('par', source);
					} else if (attack > speed) {
						source.trySetStatus('brn', source);
					} else {
						source.trySetStatus('par', source);
					}
				} else if (speed >= 300) {
					source.trySetStatus('par', source);
				} else if (attack >= 350) {
					source.trySetStatus('brn', source);
				}
			}
			// Stat Lowering
			for (const target of pokemon.side.foe.active) {
				if (!target || target.fainted) continue;
				let spattack = target.getStat('spa');
				let defense = target.getStat('def');
				let spdefense = target.getStat('spd');
				if (spdefense >= 300) {
					this.boost({spd: -1}, target, pokemon);
				}
				if (defense >= 300) {
					this.boost({def: -1}, target, pokemon);
				}
				if (spattack >= 350) {
					this.boost({spa: -1}, target, pokemon);
				}
			}
			// Healing
			if (pokemon.hp <= pokemon.maxhp / 3) {
				this.heal(pokemon.maxhp / 3);
			}
		},
		// Priority to Status
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.adaptationBoosted = true;
				return priority + 1;
			}
		},
	},

	// Revival Rawk
	"thelurkening": {
		id: "thelurkening",
		name: "The Lurkening",
		desc: "This Pokemon ignores other Pokemon's Attack, Special Attack, and accuracy stat stages when taking damage, and ignores other Pokemon's Defense, Special Defense, and evasiveness stat stages when dealing damage. Also silently raises Defense and Special Defense by 1.5x.",
		shortDesc: "User ignores foe's stat changes while boosting Def and SpDef.",
		onModifySpD() {
			return this.chainModify(1.5);
		},
		onModifyDef() {
			return this.chainModify(1.5);
		},
		onAnyModifyBoost(boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
	},

	// Auroura
	"unholypreservation": {
		id: "unholypreservation",
		name: "Unholy Preservation",
		desc: "This Pokemon ignores other Pokemon's Attack, Special Attack, and accuracy stat stages when taking damage, and ignores other Pokemon's Defense, Special Defense, and evasiveness stat stages when dealing damage. Also silently raises Defense and Special Defense by 1.5x.",
		shortDesc: "User ignores stat changes, non-attack damage, stat drops. Ignores immunities to ghost.",
		// Ignore stat changes
		onAnyModifyBoost(boosts, target) {
			let source = this.effectData.target;
			if (source === target) return;
			if (source === this.activePokemon && target === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (target === this.activePokemon && source === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		// Ignore indirect damage
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		// Immunity to stat changes
		onBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			for (let i in boost) {
				// @ts-ignore
				if (boost[i] < 0) {
					// @ts-ignore
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(/** @type {ActiveMove} */(effect)).secondaries) {
				this.add("-fail", target, "unboost", "[from] ability: Unholy Preservation", "[of] " + target);
			}
		},
		// Ignore Normal-type Ghost immunity
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Ghost'] = true;
			}
		},
	},
};

exports.BattleAbilities = BattleAbilities;
