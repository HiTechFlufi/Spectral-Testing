'use strict';

/** @typedef {{[name: string]: SSBSet}} SSBSets */
/**
 * @typedef {Object} SSBSet
 * @property {string} species
 * @property {string | string[]} ability
 * @property {string | string[]} item
 * @property {GenderName} gender
 * @property {(string | string[])[]} moves
 * @property {string} signatureMove
 * @property {{hp?: number, atk?: number, def?: number, spa?: number, spd?: number, spe?: number}=} evs
 * @property {{hp?: number, atk?: number, def?: number, spa?: number, spd?: number, spe?: number}=} ivs
 * @property {string | string[]} nature
 * @property {number=} level
 * @property {boolean=} shiny
 */

const RandomTeams = require('../../random-teams');

class RandomSSSBTeams extends RandomTeams {
	randomSSSBTeam(side) {
		let userid = toID(side.name);
		/* alts start */
		if (userid === 'arrays') userid = 'volco';
		/* alts ends */
		/** @type {PokemonSet[]} */
		let team = [];
		/** @type {SSBSets} */
		let sets = {
			// Breaking Gods
			"☢RaginInfernape": {
				species: "Infernape",
				item: "Life Orb",
				ability: "Raging Spirit",
				shiny: true,
				gender: "M",
				moves: ["Mach Punch", "Knock Off", "Ice Punch"],
				baseSignatureMove: "fireydestruction",
				signatureMove: "Firey Destruction",
				evs: {
					atk: 252,
					spe: 252,
					def: 4,
				},
				nature: "Jolly",
			},
			// Fixing Gods
			"⚔Volco": {
				species: "Volcanion",
				item: "Leftovers",
				ability: "Emergency Actions",
				gender: "M",
				shiny: true,
				moves: [["Ice Beam", "Earth Power"], "Giga Drain", "Steam Eruption"],
				baseSignatureMove: "volcanicflares",
				signatureMove: "Volcanic Flares",
				evs: {
					hp: 76,
					spa: 212,
					spe: 220,
				},
				ivs: {
					atk: 0,
				},
				nature: "Modest",
			},
			// Administrators
			"~flufi": {
				species: "Gallade-Mega",
				item: "Soul Orb",
				ability: "Heart of Steel",
				gender: "M",
				moves: ["Cross Chop", "Psycho Cut", "Blaze Kick"],
				baseSignatureMove: "16years",
				signatureMove: "16 Years",
				evs: {
					atk: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Jolly",
			},
			"~Roughskull": {
				species: "Skuntank",
				item: "Crown of TMS",
				ability: "Venom Shock",
				gender: "M",
				moves: ["Sucker Punch", "Strength Sap", "Thousand Waves"],
				baseSignatureMove: "radiationstench",
				signatureMove: "Radiation Stench",
				evs: {
					atk: 252,
					hp: 252,
					spd: 4,
				},
				nature: "Adamant",
			},
			"~Tactician Loki": {
				species: "Liepard",
				item: "Thokk",
				ability: "Chaos Heart",
				shiny: true,
				gender: "F",
				moves: ["Me First", "Ice Beam", "Spiky Shield"],
				baseSignatureMove: "bloomingchaos",
				signatureMove: "Blooming Chaos",
				evs: {
					spa: 252,
					spe: 252,
					def: 4,
				},
				nature: "Timid",
			},
			// Leaders
			"&AlfaStorm": {
				species: "Yveltal",
				item: "Life Orb",
				ability: "Dark Aura",
				gender: "M",
				moves: ["Oblivion Wing", "Ice Beam", "Earth Power"],
				baseSignatureMove: "doomstrike",
				signatureMove: "Doom Strike",
				evs: {
					def: 4,
					spa: 252,
					spe: 252,
				},
				nature: "Modest",
			},
			"&Chandie": {
				species: "Marshadow",
				item: "Void Heart",
				ability: "Shade Seeker",
				moves: ["Close Combat", "Spectral Thief", "Ice Punch"],
				baseSignatureMove: "sharpshadow",
				signatureMove: "Sharp Shadow",
				evs: {
					atk: 252,
					def: 4,
					spe: 252,
				},
				nature: "Adamant",
			},
			// Moderators
			"@Back At My Day": {
				species: "Zapdos",
				item: "Leftovers",
				ability: "Peal of Thunder",
				shiny: true,
				gender: "M",
				moves: ["Oblivion Wing", "Earth Power", "Secret Sword"],
				baseSignatureMove: "bigthunder",
				signatureMove: "Big Thunder",
				evs: {
					hp: 248,
					def: 104,
					spd: 156,
				},
				nature: "Bold",
			},
			"@Horrific17": {
				species: "Arcanine",
				item: "Arcanium Z",
				ability: "Reverse Card",
				gender: "M",
				moves: ["Wild Charge", "Extreme Speed", "Play Rough"],
				baseSignatureMove: "meteorcharge",
				signatureMove: "Meteor Charge",
				evs: {
					atk: 252,
					spe: 252,
					def: 4,
				},
				nature: "Jolly",
			},
			// Bots
			"*Auroura": {
				species: "Oricorio-Sensu",
				item: "Ghoulish Rag",
				ability: "Unholy Preservation",
				gender: "N",
				moves: ["Shadow Ball", "Roost", "Teeter Dance"],
				baseSignatureMove: "inescapablecurse",
				signatureMove: "Inescapable Curse",
				evs: {
					hp: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Timid",
			},
			"*HiTechFlufi": {
				species: "Metang",
				item: "Titanium Core",
				ability: "Adaptation",
				moves: ["Meteor Mash", "Earthquake", "Power Swap"],
				baseSignatureMove: "crippledencryption",
				signatureMove: "Crippled Encryption",
				evs: {
					hp: 252,
					def: 96,
					spd: 156,
				},
				nature: "Careful",
			},
			"*Spectral Bot": {
				species: "Magearna",
				item: "Flowers and Souls",
				ability: "Spectral's Thief",
				gender: "N",
				moves: ["Play Rough", "Sunsteel Strike", "Drain Punch"],
				baseSignatureMove: "angelicspectral",
				signatureMove: "Angelic Spectral",
				evs: {
					atk: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Jolly",
			},
			// Drivers
			"%Lady✨Kakizaki": {
				species: "Suicune",
				item: "Dumplings",
				ability: "Chaotic Aura",
				gender: "F",
				moves: ["Calm Mind", "Substitute", "Extrasensory"],
				baseSignatureMove: "yandereblitz",
				signatureMove: "Yandere Blitz",
				evs: {
					hp: 252,
					spa: 252,
					spd: 4,
				},
				nature: "Modest",
			},
			"%Renfur⚡⚡": {
				species: "Flygon",
				item: "Focus Sash",
				ability: "Desert Spirit",
				shiny: true,
				gender: "M",
				moves: ["Earth Power", "Flamethrower", "Draco Meteor"],
				baseSignatureMove: "desertdragon",
				signatureMove: "Desert Dragon",
				evs: {
					spa: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Modest",
			},
			"%shademaura ⌐⚡_": {
				species: "Regigigas",
				item: "Pixie Plate",
				ability: "Slow Pixilate",
				gender: "M",
				moves: ["Fake Out", "Extreme Speed", "Bonemerang"],
				baseSignatureMove: "sarcasmovertext",
				signatureMove: "Sarcasm Over Text",
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: "Jolly",
			},
			// Operators
			// Voices
			"+Revival Clair": {
				species: "Garchomp",
				item: "Focus Sash",
				ability: "Tough Skin",
				gender: "F",
				moves: ["Earthquake", "Outrage", "Stone Edge"],
				baseSignatureMove: "dragonblitz",
				signatureMove: "Dragon Blitz",
				evs: {
					atk: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Jolly",
			},
			"+Revival Rawk": {
				species: "Tapu Fini",
				item: "Leftovers",
				ability: "The Lurkening",
				gender: "M",
				moves: ["Defog", "Nature's Madness", "Scald"],
				baseSignatureMove: "thenappening",
				signatureMove: "The Nappening",
				evs: {
					hp: 252,
					def: 252,
					spd: 4,
				},
				nature: "Bold",
			},
			"+shade lynn skye": {
				species: "Shaymin-Sky",
				item: "Expert Metronome",
				ability: "Serene Tailwind",
				gender: "F",
				shiny: true,
				moves: ["Tail Glow", "Moonblast", "Searing Shot"],
				baseSignatureMove: "leafhurricane",
				signatureMove: "Leaf Hurricane",
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: "Modest",
			},
			"+xFloatz": {
				species: "Scizor-Mega",
				item: "Leftovers",
				ability: "XFZ",
				gender: "M",
				moves: ["Rest", "Toxic", "Iron Head"],
				signatureMove: "Cosmic Power",
				evs: {
					hp: 252,
					def: 40,
					spd: 216,
				},
				nature: "Impish",
			},
			"+SunDraco4680": {
				species: "Zoroark",
				item: "Leftovers",
				ability: "Dragonic Soul",
				gender: "M",
				shiny: true,
				moves: ["Nasty Plot", "Dark Pulse", "Sludge Bomb"],
				signatureMove: "Ein Sol",
				evs: {
					spa: 252,
					spd: 4,
					spe: 252,
				},
				nature: "Timid",
			},
		};
		let pool = this.dex.shuffle(Object.keys(sets));
		/** @type {{[type: string]: number}} */
		let typePool = {};
		let i = 0;
		while (team.length < 6) {
			if (i === 1) {
				for (let mon in sets) {
					let monIds = pool.slice(0, 6).map(function (p) {
						return toID(p);
					});
					if (toID(mon.toString()) === userid && monIds.indexOf(userid) === -1) {
						pool[1] = mon;
						break;
					}
				}
			}
			let name = pool[i];
			let ssbSet = sets[name];
			i++;
			// Enforce typing limits
			let types = this.dex.getTemplate(ssbSet.species).types;
			let rejected = false;
			for (let type of types) {
				if (typePool[type] === undefined) typePool[type] = 0;
				if (typePool[type] >= 2) {
					// Reject
					rejected = true;
					break;
				}
			}
			if (rejected) continue;
			// Update type counts
			for (let type of types) {
				typePool[type]++;
			}
			/** @type {PokemonSet} */
			let set = {
				name: name,
				species: ssbSet.species,
				item: Array.isArray(ssbSet.item) ? this.sampleNoReplace(ssbSet.item) : ssbSet.item,
				ability: Array.isArray(ssbSet.ability) ? this.sampleNoReplace(ssbSet.ability) : ssbSet.ability,
				moves: [],
				nature: Array.isArray(ssbSet.nature) ? this.sampleNoReplace(ssbSet.nature) : ssbSet.nature,
				gender: ssbSet.gender,
				evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0},
				ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
				level: ssbSet.level || 100,
				shiny: ssbSet.shiny,
			};
			if (ssbSet.ivs) {
				for (let iv in ssbSet.ivs) {
					// IVs from the set override the default of 31, assume the hardcoded IVs are legal
					// @ts-ignore StatsTable has no index signature
					set.ivs[iv] = ssbSet.ivs[iv];
				}
			}
			if (ssbSet.evs) {
				for (let ev in ssbSet.evs) {
					// EVs from the set override the default of 0, assume the hardcoded EVs are legal
					// @ts-ignore StatsTable has no index signature
					set.evs[ev] = ssbSet.evs[ev];
				}
			} else {
				set.evs = {hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84};
			}
			while (set.moves.length < 3 && ssbSet.moves.length > 0) {
				let move = this.sampleNoReplace(ssbSet.moves);
				if (Array.isArray(move)) move = this.sampleNoReplace(move);
				set.moves.push(move);
			}
			set.moves.push(ssbSet.signatureMove);
			team.push(set);
		}
		return team;
	}
}

module.exports = RandomSSSBTeams;
