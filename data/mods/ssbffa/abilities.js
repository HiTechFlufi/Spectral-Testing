"use strict";

/**@type {{[k: string]: ModdedAbilityData}} */
let BattleAbilities = {
	"fsubs": {
		id: "fsubs",
		name: "F Subs",
		desc: "This Pokemon's Status moves have priority raised by 3 and is immune to priority. Ignores Substitute, screens, Mist and Safeguard. Uses Taunt, Toxic, Gastro Acid, Destiny Bond and Topsy Turvy on switch-in.",
		shortDesc: "+3 priority Status and immune to priority. Ignores Sub, screens, Mist and Safeguard. Uses Taunt, Toxic, Gastro Acid, Destiny Bond and Topsy Turvy on switch-in.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.fsubsBoosted = true;
				return priority + 3;
			}
		},
		onFoeTryMove(target, source, effect) {
			if ((source.side === this.effectData.target.side || effect.id === 'perishsong') && effect.priority > 0.1 && effect.target !== 'foeSide') {
				this.attrLastMove('[still]');
				this.add('cant', this.effectData.target, 'ability: F Subs', effect, '[of] ' + target);
				return false;
			}
		},
		onModifyMove(move) {
			move.infiltrates = true;
		},
		onStart(pokemon) {
			this.useMove("gastroacid", pokemon);
			this.useMove("toxic", pokemon);
			this.useMove("taunt", pokemon);
			this.useMove("destinybond", pokemon);
			this.useMove("topsyturvy", pokemon);
		},
	},

	"warriorsdance": {
		id: "warriorsdance",
		name: "Warrior's Dance",
		desc: "Taunts the foe and boosts Speed/Accuracy by 1 stage.",
		shortDesc: "Taunt, +1 SpA/Acc/Spe",
		onStart(pokemon) {
			this.useMove("taunt", pokemon);
			this.boost({spe: 1});
			this.boost({accuracy: 1});
		},
	},

	"honeypot": {
		id: "honeypot",
		name: "Honey Pot",
		desc: "This Pokemon draws Bug moves to itself to raise Attack by 1; Bug immunity. Sets up Grassy Terrain, Trick Room, Leech Seed and Aqua Ring on switch-in.",
		shortDesc: "Raise Attack by 1 when hit by Bug; Bug immunity. Grassy Terrain, Trick Room, Leech Seed, Aqua Ring on switch-in.",
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Bug') {
				if (!this.boost({atk: 1})) {
					this.add('-immune', target, '[from] ability: Honey Pot');
				}
				return null;
			}
		},
		onStart(pokemon) {
			this.useMove("grassyterrain", pokemon);
			this.useMove("trickroom", pokemon);
			this.useMove("leechseed", pokemon);
			this.useMove("aquaring", pokemon);
		},
	},

	"memeguard": {
		id: "memeguard",
		name: "Meme Guard",
		desc: "Raises the user's Defense by 3 stages on switch-in, this Pokemon can only be damaged by direct attacks and Status moves have their priority raised by 1.",
		shortDesc: "Raise Defense by 3 on switch-in, immune to indirect attacks and +1 priority to Status.",
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onStart(pokemon) {
			this.boost({def: 3});
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				move.memeguardBoosted = true;
				return priority + 1;
			}
		},
	},

	"ghidorahbond": {
		id: "ghidorahbond",
		name: "Ghidorah Bond",
		desc: "This Pokemon's damaging moves hit thrice. The second and third hit have their damage quartered.",
		shortDesc: "Hits thrice, 0.25x damage on second and third.",
		onPrepareHit(source, target, move) {
			if (['iceball', 'rollout'].includes(move.id)) return;
			if (move.category !== 'Status' && !move.selfdestruct && !move.multihit && !move.flags['charge'] && !move.spreadHit && !move.isZ) {
				move.multihit = 3;
				move.multihitType = 'ghidorahbond';
			}
		},
		onBasePowerPriority: 8,
		onBasePower(basePower, pokemon, target, move) {
			if (move.multihitType === 'ghidorahbond' && move.hit > 1) return this.chainModify(0.25);
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'ghidorahbond' && move.id === 'secretpower' && move.hit < 2) {
				// hack to prevent accidentally suppressing King's Rock/Razor Fang
				return secondaries.filter(effect => effect.volatileStatus === 'flinch');
			}
		},
	},

	"regenheirator": {
		id: "regenheirator",
		name: "Regen-heir-ator",
		desc: "If this Pokemon eats an item, it heals the user by 1/3rd of their max HP.  This Pokemon also will not be OHKO'ed.",
		shortDesc: "If the user eats an item, it heals HP by 1/3rd; cannot be OHKO'ed",
		onEatItem(item, pokemon) {
			this.heal(pokemon.maxhp / 3);
		},
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Regen-heir-ator');
				return null;
			}
		},
		onDamagePriority: -100,
		onDamage(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-ability', target, 'Regen-heir-ator');
				return target.hp - 1;
			}
		},
	},

	"kingsblessing": {
		id: "kingsblessing",
		name: "King's Blessing",
		shortDesc: "This Pokemon's Special Defense is doubled, and uses Curse on entry.",
		onModifySpDPriority: 6,
		onModifySpD(spd) {
			return this.chainModify(2);
		},
		onStart(pokemon) {
			this.useMove("curse", pokemon);
		},
	},
	/*
	"battlebond+": {
		id: "battlebond+",
		name: "Battle Bond+",
		desc: "If this Pokemon is a Greninja, it transforms into Ash-Greninja after knocking out a Pokemon. As Ash-Greninja, its Water Shuriken has 20 base power and always hits 3 times, boosts Accuracy by 1 stage.",
		shortDesc: "After KOing a Pokemon: becomes Ash-Greninja, Water Shuriken: 20 power, hits 3x, +1 Accuracy.",
		onSourceFaint(target, source, effect) {
			if (effect && effect.effectType === 'Move' && source.template.speciesid === 'greninja' && source.hp && !source.transformed && source.side.foe.pokemonLeft) {
				this.add('-activate', source, 'ability: Battle Bond+');
				source.formeChange('Greninja-Ash', this.effect, true);
				this.boost({accuracy: 1});
			}
		},
		onModifyMovePriority: -1,
		onModifyMove(move, attacker) {
			if (move.id === 'watershuriken' && attacker.template.species === 'Greninja-Ash') {
				move.multihit = 3;
			}
		},
	},
	*/
	
	"mindread": {
		id: "mindread",
		name: "Mind Read",
		desc: "This Pokemon uses Mean Look, Hypnosis and Mind Reader on switch-in.",
		shortDesc: "Mean Look + Hypnosis + Mind Reader",
		onStart(pokemon) {
			this.useMove("meanlook", pokemon);
			this.useMove("hypnosis", pokemon);
			this.useMove("mindreader", pokemon);
		},
	},
};

exports.BattleAbilities = BattleAbilities;
