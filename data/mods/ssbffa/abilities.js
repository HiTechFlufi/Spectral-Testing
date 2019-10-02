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
};

exports.BattleAbilities = BattleAbilities;
