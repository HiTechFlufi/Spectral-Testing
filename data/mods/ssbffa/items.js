'use strict';

/**@type {{[k: string]: ItemData}} */
let BattleItems = {
	"riotshield": {
		id: "riotshield",
		name: "Riot Shield",
		spritenum: 581,
		fling: {
			basePower: 80,
		},
		onModifySpDPriority: 1,
		onModifySpD(spd) {
			return this.chainModify(1.5);
		},
		num: -1,
		desc: "Holder's Special Defense is 1.5x.",
	},
	"carniviumz": {
		id: "carniviumz",
		name: "Carnivium Z",
		spritenum: 635,
		onTakeItem: false,
		zMove: "Spicy Vines",
		zMoveFrom: "Mild Vines",
		zMoveUser: ["Carnivine"],
		gen: 7,
		desc: "If held by a Carnivine with Mild Vines, it can use Spicy Vines.",
	},
};

exports.BattleItems = BattleItems;
