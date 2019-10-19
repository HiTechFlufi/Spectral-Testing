'use strict';

const RandomTeams = require('../../random-teams');

class RandomPetsTeams extends RandomTeams {
	randomPetsTeam() {
		let pokemonLeft = 0;
		let pokemon = [];

		let pokemonPool = [];
		for (let id in this.dex.data.FormatsData) {
			let template = this.dex.getTemplate(id);

			if (!template.isNonstandard && template.randomBattleMoves) {
				pokemonPool.push(id);
			}
		}
		let baseFormes = {};
		let megaCount = 0;

		while (pokemonPool.length && pokemonLeft < 6) {
			let template = this.dex.getTemplate(this.sampleNoReplace(pokemonPool));
			if (!template.exists) continue;
			if (template.tier === 'LC' || template.tier === 'LC Uber' || template.tier === 'NFE' || template.tier === 'Uber' || template.tier === 'AG') continue;

			// Limit to one of each species (Species Clause)
			if (baseFormes[template.baseSpecies]) continue;

			let set = template;

			if (!set) continue;
			if (set.baseSpecies === 'Pikachu') continue;
			if (set.species.indexOf('Arceus') !== -1) set.species = 'Arceus';
			if (set.species.indexOf('Silvally') !== -1) set.species = 'Silvally';
			if (set.species === "Ditto" || set.species === 'Pichu-Spiky-eared') continue;
			let isMegaSet = set.isMega;
			if (isMegaSet && megaCount === 1) continue;
			if (isMegaSet) megaCount++;
			if (set.item) delete set.item;
			if (set.baseSpecies !== set.species && set.learnset) set.learnset = Object.assign(set.learnset, this.dex.getTemplate(toID(set.baseSpecies)).learnset);
			if (!set.learnset && set.baseSpecies !== set.species) set.learnset = this.dex.getTemplate(toID(set.baseSpecies)).learnset;
			if (!set.learnset) continue;
			let movePool = Object.keys(set.learnset);
			set.moves = [];
			movePool = this.dex.shuffle(movePool);
			// Choose next 4 moves from learnset/viable moves and add them to moves list:
			while (set.moves.length < 4 && movePool.length) {
				let moveid = this.sampleNoReplace(movePool);
				if (moveid === 'frustration') continue;
				if (this.dex.getMove(moveid).category === 'Status' || !this.dex.getMove(moveid).isViable) continue;
				if (moveid.substr(0, 11) === 'hiddenpower' && set.moves.includes('hiddenpower')) continue;
				if (this.dex.getMove(moveid).category === 'Physical' && set.baseStats.spa > set.baseStats.atk || this.dex.getMove(moveid).category === 'Special' && set.baseStats.atk > set.baseStats.spa) continue;
				set.moves.push(moveid);
			}
			if (!set.moves.length) continue;
			set.evs = {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255};
			set.level = 100;
			set.ability = 'No Ability';

			pokemon.push(set);

			pokemonLeft++;

			baseFormes[template.baseSpecies] = 1;
		}
		return pokemon;
	}
}
module.exports = RandomPetsTeams;
