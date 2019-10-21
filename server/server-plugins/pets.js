'use strict';

const uuid = require('uuid');
let allPets = [];
randGenMons = [];

// All mythicals & legendaries + banned from random gen
let specialMons = [
	// gen 1 & 2
	'articuno', 'zapdos', 'moltres', 'mewtwo', 'mew', 'raikou', 'entei', 'suicune', 'lugia', 'hooh', 'celebi',
	// gen 3
	'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys', 'deoxysattack', 'deoxysdefense', 'deoxysspeed',
	// gen 4
	'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'giratinaorigin', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'shayminsky',
	'arceus', 'arceusbug', 'arceusdark', 'arceusdragon', 'arceuselectric', 'arceusfairy', 'arceusfighting', 'arceusfire', 'arceusflying', 'arceusghost', 'arceusgrass',
	'arceusground', 'arceusice', 'arceuspoison', 'arceuspsychic', 'arceusrock', 'arceussteel', 'arceuswater',
	//gen 5
	'victini', 'cobalion', 'terrakion', 'virizion', 'tornadus', 'tornadustherian', 'thundurus', 'thundurustherian', 'reshiram',  'zekrom', 'landorus', 'kyurem', 'kyuremblack', 'kyuremwhite',
	'keldeo', 'meloetta', 'meloettapriouette', 'genesect', 'genesectburn', 'genesectchill', 'genesectdouse', 'genesectshock',
	// gen 6
	'xerneas', 'yveltal', 'zygarde', 'zygarde10', 'zygardecomplete', 'diancie', 'hoopa', 'hoopaunbound', 'volcanion',
	// gen 7
	'typenull', 'silvally', 'tapukoko', 'tapulele', 'tapubulu', 'tapufini', 'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana',
	'guzzlord', 'magearna', 'magearnaoriginal', 'necrozma', 'necrozmadawnwings', 'necrozmaduskmane', 'necrozmaultra', 'marshadow', 'poipole', 'naganadel', 'stakataka', 'blacephalon', 'zeraora',
	// letsgo [crap] + gen 8
	'meltan', 'melmetal', 'zacian', 'zamazenta'
	// banned from random gen
];

let monPool = Object.keys(Dex.data.Pokedex);

const CacheDB = require('../cache-db');

if (!global.PetDb) {
	global.PetDb = new CacheDB();
	PetDb.load('config/chat-plugins/petusers').setTimer(60000);
}

function load() {
	for (let u = 0; u < monPool.length; u++) {
		let mon = Dex.data.Pokedex[monPool[u]];
		let monId = toID(mon.species);
		if (monId.indexOf("pokestar") !== -1) continue;
		allPets.push(monId);
		if (Dex.getTemplate(monId).battleOnly === true || Dex.getTemplate(monId).eventOnly === true || specialMons.indexOf(monId) !== -1 || Dex.getTemplate(monId).prevo.length || Dex.getTemplate(monId).tier === 'CAP' || Dex.getTemplate(monId).tier === 'CAP LC') continue;
		randGenMons.push(monId);
	}
}
load();

function addMon(user, mon, shiny) {
	let id = uuid.v1(); 
	let newPet = {};
	let userid = toID(user);
	newPet = {id: id, species: Dex.getTemplate(mon).species, shiny: (shiny ? true : false), originalOwner: userid, dateObtained: new Date()};

	PetDb.set(userid, PetDb.get(userid, []).concat([newPet]));
}
Server.addMon = addMon;

function randMon(user) {
	// how to be lazy as fuck 101
	let idx = Math.ceil(Math.random() * randGenMons.length - 1);
	addMon(user, randGenMons[idx]);
}
Server.randMon = randMon;

/*function takeMon(userid, monId) {
	userid = toID(userid);
	let userPets = PetDb.get(userid, []);
	let idx = -1;
	for (let i = 0; i < userPets.length; i++) {
		let pet = userPets[i];
		if (pet.id === monId) {
			idx = i;
			break;
		}
	}
	if (idx === -1) return false;
	userPets.splice(idx, 1);
	PetDb.set(userid, userPets);
	return true;
}
Server.takeMon = takeMon;*/

function evolveMon(userid, monId, evolveTo) {
	userid = toID(userid);
	let candy = Db.petCandy.get(userid);
	let pet = getPet(userid, monId);
	let pokemon = Dex.getTemplate(toID(pet.species));
	let reqCandy = getEvoDetails(pokemon).reqCandy;

	if (candy < reqCandy) return;
	pet.species = Dex.getTemplate(evolveTo).species;
	Db.petCandy.set(userid, (Db.petCandy.get(userid, 0) - reqCandy));
	// finish evolution stuff
	let userPets = PetDb.get(userid, []);
	let idx = -1;
	for (let i = 0; i < userPets.length; i++) {
		let pet = userPets[i];
		if (pet.id === monId) {
			idx = i;
			break;
		}
	}
	if (idx === -1) return false;
	userPets[idx] = pet;
	PetDb.set(userid, userPets);
}

function getEvoDetails(pokemon) {
	let details = {evos: [], reqCandy: 0};
	for (const evoName of pokemon.evos) {
		const evo = Dex.getTemplate(evoName);
		switch (evo.evoType) {
		case 'levelExtra':
			details.evos.push(evo.name);
			details.reqCandy = 15;
			break;
		case 'levelFriendship':
			details.evos.push(evo.name);
			details.reqCandy = 10;
			break;
		case 'levelHold':
			details.evos.push(evo.name);
			details.reqCandy = 20;
			break;
		case 'stone':
			details.evos.push(evo.name);
			details.reqCandy = 25;
			break;
		case 'levelMove':
			details.evos.push(evo.name);
			details.reqCandy = 20;
			break;
		case 'trade':
			details.evos.push(evo.name);
			details.reqCandy = 25;
			break;
		default:
			details.evos.push(evo.name);
			details.reqCandy = Math.ceil(evo.evoLevel / 2);
		}
	}
	if (details.evos.length >= 1 && details.reqCandy > 0) return details;
	return false;
}

function petsMenu(userid) {
	const pets =  PetDb.get(toID(userid), []);
	let petsMap = pets.map(pet => {
		return `<button style="color: transparent ; background-color: transparent ; border-color: transparent ; cursor: default; border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset;" name="send" value="/pets details viewmon ${pet.id}">${getSprite(toID(pet.species)).img}</button> `;
	});
	return `<div style="overflow-y: scroll;">Evolution Candies: ${Db.petCandy.get(toID(userid), 0)}<br />Pokédollars: ${Db.petCash.get(toID(userid), 0)}<br /><strong>Want more Pokédollars? Then build a team of your pets in the teambuilder and ladder against the AI in the pets battle tiers!</strong><br />* The random battles do not use pets you own<br />Pets: <br />${petsMap.join("")}</div>`;
}

function detailsMenu(userid, monId) {
	userid = toID(userid);
	let pet = getPet(userid, monId);
	let profile = Db.profile.get(userid, {data: {title: {}, music: {}}});
	let display = `<br /><br /><button name="send" value="/pets">Back</button><br /><br /><center><strong><em><font size=7>${pet.species}</font></em></strong><br />${getSprite(toID(pet.species)).img}<br /><br />Evolution Candies: ${Db.petCandy.get(toID(userid), 0)}<br /><br /><br />`;
	// display += (profile && profile.pet && profile.pet.species === toID(pet.species) ? `<button name="send" value="/pets details select">Remove Pet from Profile</button><br />` : `<button name="send" value="/pets details select ${monId}">Set as Profile Pet</button><br />`);
	let evoDetails = getEvoDetails(Dex.getTemplate(toID(pet.species)));
	display += (evoDetails.reqCandy ? `Amount of Evolution Candies required to evolve: ${evoDetails.reqCandy}<br />` : "");
	if (evoDetails.reqCandy <= Db.petCandy.get(userid, 0)) {
		display += 'Evolve: <br /><br />';
		for (let u = 0; u < evoDetails.evos.length; u++) {
			display += `<button style="color: transparent ; background-color: transparent ; border-color: transparent ; cursor: default;" name="send" value="/pets details evolve ${monId}, ${evoDetails.evos[u]}">${getSprite(toID(evoDetails.evos[u])).img}</button> ${(u + 1 === evoDetails.evos.length ? "" : ((u + 1) % 4 === 0 ? "<br />" : ""))}`;
		}
	}
	display += `<br />${(userid !== pet.originalOwner ? `Original Owner: ${pet.originalOwner} <br />` : ``)} Date Obtained: ${pet.dateObtained}</center>`;
	return display;
}

function getPet(userid, monId) {
	userid = toID(userid);
	let idx = - 1;
	
	for (let u = 0; u < PetDb.get(userid).length; u++) {
		if (PetDb.get(userid)[u].id === monId) {
			idx = u;
			break;
		}
	}
	
	return (idx !== -1 ? PetDb.get(userid)[idx] : false);
}
Server.getPet = getPet;

// shamelessly ripped from main's wifi plugin and adjusted for pets
function toPokemonId(str) {
	return str.toLowerCase().replace(/é/g, 'e').replace(/[a-z0-9 -/]/g, '');
}

function getSprite(monName) {
	let mon = toID(monName);
	let output = '';
	let spriteid = mon;
	if (!Dex.data.Pokedex[mon].baseSpecies && (Dex.data.Pokedex[mon].species.includes(' '))) {
		mon = toPokemonId(Dex.data.Pokedex[mon].species);
	}
	let regexp = new RegExp(`\\b${mon}\\b`);

	if (regexp.test(mon)) {
		mon = Dex.getTemplate(mon).baseSpecies;
	}

	if (/alola?/.test(toID(monName))) {
		spriteid = spriteid.replace('alola', '-alola');
	}
	
	if (/mega?/.test(toID(monName))) {
		spriteid = spriteid.replace('alola', '-mega');
	}

	if (/megax?/.test(toID(monName))) {
		spriteid = spriteid.replace('megax', '-megax');
	}

	if (/megay?/.test(toID(monName))) {
		spriteid = spriteid.replace('megay', '-megay');
	}

	if (/primal?/.test(toID(monName))) {
		spriteid = spriteid.replace('primal', '-primal');
	}
	
	if (toID(monName).includes("pumpkaboo") && toID(monName).length !== 9) {
		spriteid = spriteid.replace("pumpkaboo", "pumpkaboo-");
	}

	if (toID(monName).includes("wormadam") && toID(monName).length !== 8) {
		spriteid = spriteid.replace("wormadam", "wormadam-");
	}

	if (toID(monName).includes("rotom") && toID(monName).length !== 5) {
		spriteid = spriteid.replace("rotom", "rotom-");
	}

	if (toID(monName) === 'floetteeternal') {
		spriteid = 'floette-eternal';
	}

	let shiny = (toID(monName).includes("shiny") ? '-shiny' : '');
	if (Dex.getTemplate(toID(monName)).tier === 'CAP' || Dex.getTemplate(toID(monName)).tier === 'CAP LC') {
		output += `<img src="//play.pokemonshowdown.com/sprites/gen5${shiny}/${spriteid}.png">`;
	} else {
		output += `<img src="//play.pokemonshowdown.com/sprites/xyani${shiny}/${spriteid}.gif">`;
	}

	return {img: output, sprite: spriteid};
}
Server.getSprite = getSprite;

exports.commands = {
	pet: "pets",
	pets: {
		/* not a super important starting feature
		search(target, room, user) {

		},
		searchhelp: [],*/

		/* Figure this out later, might be difficult to do in the chat page menu
		transfer(target, room, user) {

		},
		transferhelp: []
		*/

		"": "showcase",
		showcase(target, room, user) {
			// broadcasted version displays in chat only while no target and unbroadcasted opens the chat page
			let targetId = toID(target);
			if (targetId === 'constructor') return false; // fuck you
			if (target || !target && this.broadcasting) {
				if (!target) targetId = user.id;
				const pets =  PetDb.get(targetId, []);
				let petsMap = pets.map(pet => {
					return `<span style="border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset;">${getSprite(toID(pet.species)).img}</span> `;
				});
				this.sendReplyBox('<div style="max-height: 300px; overflow-y: scroll;">' + petsMap.join('') + '</div><br><center><b>' + Server.nameColor(targetId, true) + ' has ' + pets.length + ' Pets.');
			} else {
				if (!Object.keys(PetDb.get(user.id, [])).length) {
					randMon(user.id);
					Db.petladder.set(user.id, {});
					Db.petCash.set(user.id, 3000);
				}
				user.send(`>view-pets\n|init|html\n|title|Pets\n|pagehtml|${petsMenu(user)}`);
			}
		},

		details: {
			viewmon(target, room, user) {
				if (!PetDb.get(user.id)) return;
				if (!getPet(user.id, target)) return;
				return user.send(`>view-pets\n|init|html\n|title|Pets\n|pagehtml|${detailsMenu(user.id, target)}`);
			},

			evolve(target, room, user) {
				if (!PetDb.get(user.id)) return;
				let [monId, evolveTo] = target.split(",").map(p => p.trim());
				if (!monId || !evolveTo) return;
				if (!getPet(user.id, monId)) return;
				evolveMon(user.id, monId, evolveTo);
				return user.send(`>view-pets\n|init|html\n|title|Pets\n|pagehtml|${detailsMenu(user.id, monId)}`);
			},

			/*select(target, room, user) {
				let profile = Db.profile.get(user.id, {data: {title: {}, music: {}}});
				if (!target) {
					let monId = profile.pet.monId;
					delete profile.pet;
					Db.profile.set(user.id, profile);
					return user.send(`>view-pets\n|init|html\n|title|Pets\n|pagehtml|${detailsMenu(user.id, monId)}`);
				}
				if (!PetDb.get(user.id)) return;
				let pet = getPet(user.id, target);
				if (!pet) return;
				profile.pet = {species: toID(pet.species), monId: target};
				Db.profile.set(user.id, profile);
				return user.send(`>view-pets\n|init|html\n|title|Pets\n|pagehtml|${detailsMenu(user.id, target)}`);
			},*/

			/* add later
			confirmrelease: "release",
			release(target, room, user, connection, cmd) {
				
			},*/
		},

		// shop commands
		shop: {
			"": "open",
			open(target, room, user) {
				if (!this.runBroadcast()) return;
				let display = `<center><strong>PETS SHOP</strong><br /><table style=""><tr><th>Item</th><th>Description</th><th>Price</th></tr>`;
				let keys = Db.petShop.keys();
				for (let u in keys) {
					let item = Db.petShop.get(keys[u]);
					display += `<tr><td>${item.title}</td><td>${item.desc}</td><td><button style="" name="send" value="/pets shop buy ${toID(item.title)}">${item.price} Pokédollars</button></td</tr>`;
				}
				display += `</table></center>`;
				return this.sendReplyBox(display);
			},

			buy(target, room, user) {
				if (!Db.petShop.has(toID(target))) return this.errorReply("That is not an item in the pet shop");
				let item = Db.petShop.get(toID(target));

				if (Db.petCash.get(user.id, 0) < item.price) return this.errorReply("You do not have enough Pokédollars.");

				Db.petCash.set(user.id, Db.petCash.get(user.id) - item.price);

				if (item.type === 'pet') {
					for (let u = 0; u < item.gen; u++) {
						randMon(user.id);
					}
				} else {
					Db.petCandy.set(user.id, Db.petCandy.get(user.id, 0) + item.gen);
				}
				return this.sendReplyBox(`You now have ${item.gen} new ${item.type === 'pet' ? 'pet(s)' : 'candies'}.`);
			},

			add(target, room, user) {
				if (!this.can("declare")) return;
				let [title, type, desc, price, gen] = target.split(",").map(p => p.trim());
				if (!title || !type || !desc || !price || !gen) return this.parse("/help pets shop add");
				if (Db.petShop.has(toID(title))) return this.errorReply("This item is already in the shop");
				if (title.length > 20) return this.errorReply("Item title must be 20 characters or less");
				if (!['candy', 'pet'].includes(toID(type))) return this.errorReply("Allowed types are `candy` or `pets`");
				if (desc.length > 100) return this.errorReply("The description must be 100 characters or less");
				if (parseInt(price) < 1) return this.errorReply("Price must be greater than or equal to 1");
				if (parseInt(gen) < 1) return this.errorReply("The generate count must be at least 1");
				Db.petShop.set(toID(title), {title: title, type: type, desc: desc, gen: parseInt(gen), price: parseInt(price)});
				return this.sendReply(`${title} has been added to the pet shop.`);
			},
			addhelp: ["/pets shop add (title), (type), (description), (price), (generate count) - Adds an item to the shop with the specified title, description, and price. Generate Count is how many pets this item gives when bought. Requires &, ~"],

			remove(target, room, user) { 
				if (!this.can("declare")) return;
				target = toID(target);
				if (!Db.petShop.has(target)) return this.errorReply("This item is not in the shop");
				Db.petShop.remove(target);
				return this.sendReply(`${target} has been removed from the shop.`);
			},
			removehelp: ["/pets shop remove (title) - removes specified item from the pets shop. Requires &, ~"],
		},

		// staff commands
		giveevocandy: "givecandy",
		givecandy(target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse("/help pets gencandy");
			let [targetId, amount] = target.split(",").map(p => p.trim());
			targetId = toID(targetId);
			amount = parseInt(amount);
			if (targetId.length > 18) return this.errorReply("Usernames are 18 characters or less.");
			if (amount < 1) return this.errorReply("Amount must be greater than or equal to 1.");

			let newAmount = Db.petCandy.get(targetId) + amount;
			Db.petCandy.set(targetId, newAmount);
			this.sendReply(`${targetId} now has ${newAmount} Evolution Candies.`);
		},
		givecandyhelp: ["/pets givecandy [user], [amount] - Gives the specified user the specified number of evolution candies. Requires @, &, ~."],

		give: "gen",
		spawn: "gen",
		gen(target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse("/help pets gen");
			let [targetId, pet, shiny] = target.split(",").map(p => p.trim());
			targetId = toID(targetId);
			pet = toID(pet);

			if (!targetId || !pet) return this.errorReply("/help pets gen");
			if (targetId.length > 18) return this.errorReply("Usernames are 18 characters or less.");
			if (allPets.indexOf(pet) === -1) return this.sendReply(`${pet}: pet not found.`);
			
			addMon(targetId, pet, shiny);
			user.popup(`You have successfully given ${Dex.getTemplate(pet).species} to ${targetId}.`);
			if (Users.get(targetId)) Users.get(targetId).popup(`|html||modal|<center><strong>You have been given the pet ${Dex.getTemplate(pet).species}.</strong><br />${getSprite(pet).img}</center>`);
			this.privateModAction(`${user.name} gave the pet "${Dex.getTemplate(pet).species}" to ${targetId}.`);
		},
		genhelp: ["/pets gen [user], [pokemon], [shiny (optional)] - Gives the specificed user a new specificed pet. Requires &, ~"],

		/* has to come out later, the ids make this annoying
		remove: "take",
		take(target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.errorReply("/pets take [user], [pet ID]");
			let [targetId, pet] = target.split(",").map(p => p.trim());
			targetId = toID(targetId);
			pet = toID(pet);

			if (!targetId || !pet) return this.parse("/help pets take");
			if (targetId.length > 18) return this.errorReply("Usernames are 18 characters or less.");
			if (allPets.indexOf(pet) === -1) return this.sendReply(`${pet}: pet not found.`);

			takeMon(targetId, pet);
			user.popup(`You have successfully taken ${Dex.getTemplate(pet).species} from ${targetId}.`);
			
			if (Users.get(targetId)) Users.get(targetId).popup(`|modal|<center><strong>Your pet ${Dex.getTemplate(pet).species} has been removed by an Upper Staff member.</strong></center>`);
			this.privateModAction(`${user.name} took the card "${Dex.getTemplate(pet).species}" from ${targetId}.`);
		},
		takehelp: ["/pets take [user], [pokemon] - Takes pet away from the specified user. Requires &, ~"],*/
	},
};
