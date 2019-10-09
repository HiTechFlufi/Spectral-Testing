"use strict";

/**@type {{[k: string]: ModdedAbilityData}} */
let BattleAbilities = {
	"hazardsson": {
		id: "hazardsson",
		name: "Hazards Son",
		desc: "(Tries to) set up a variety of hazards upon entry.",
		onStart(pokemon) {
			this.useMove("spikes", pokemon);
			this.useMove("spikes", pokemon);
			this.useMove("spikes", pokemon);
			this.useMove("stealthrock", pokemon);
			this.useMove("leechseed", pokemon);
			this.useMove("toxicspikes", pokemon);
			this.useMove("toxicspikes", pokemon);
			this.useMove("stickyweb", pokemon);
		},
	},
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
		desc: "Taunts the foe and boosts SpA/Acc/Spe by 1 stage.",
		shortDesc: "Taunt, +1 SpA/Acc/Spe",
		onStart(pokemon) {
			this.useMove("taunt", pokemon);
			this.boost({spa: 1});
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
};

exports.BattleAbilities = BattleAbilities;
