//TODO: Name and Level of Weapons/Armor
//TODO: Merge pulls before putting on token.
//TODO: Actually display in chat if needed
//TODO: Separate settings into different GUIs.
//TODO: Treasure isn't properly filtering by cost

const thisMacro = this;

const selectedTokens = canvas.tokens.controlled;
const CompendiumID = "pf2e.equipment-srd";
const PlatinumID = "JuNPeK5Qm1w6wpb4";
const GoldID = "B6B7tBWJSqOBz5zz";
const SilverID = "5Ew82vBF9YfaiY9f";
const CopperID = "lzJ8AVhRcbFul5fh";

let settings = this.getFlag('world','PF2ETreasureGenSettings');
if (settings === undefined || settings===null)
	settings = {
	clearInventory:true,
	insertInventory:true,
	mergeInventory:true,
	useSelectedTokenLevel:true,
	showInChat:false,
	ignorePCTokens:true,
	quantity:1,
	lvlPlusOne:1,
	lvlPlusZero:1,
	lvlMinusOne:1,
	levelplus:2,
	levelminus:1,
	noTreasure:1,
	money:1,
	item:1,
	consumable:3,
	permanent:2,
	perm_weapon:1,
	perm_weapon_generic:1,
	perm_armor:1,
	perm_armor_generic:1,
	perm_other:1,
	weaponmaterial:20,
	weaponpotency:95,
	weaponstriking:75,
	weaponproperty:60,
	armormaterial:20,
	armorpotency:90,
	armorresilient:70,
	armorproperty:55,
	moneyDivisor:10,
	pcCount:4,
	moneyflux:10,
	cashOnly:75,
	common:10,
	uncommon:4,
	rare:1,
	unique:1,
	simple:4,
	martial:2,
	advanced:1,
	heavy:4,
	medium:2,
	light:1,
	source:{},
}

let runes = {
	weapon:{
		striking:[],
		potency:[],
		property:[]
	},
	armor:{
		resilient:[],
		potency:[],
		property:[]
	}
};		

const materialLevel	 = [
{material: 'abysium' , source: GetSourceKey('Pathfinder Lost Omens: The Grand Bazaar'), rarity: 'rare', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'adamantine', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'uncommon', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'coldIron', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'common', level:{low:2,standard:7,high:15},use:['weapon','armor','shield']},
{material: 'darkwood', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'uncommon', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'djezet', source: GetSourceKey('Pathfinder Lost Omens: The Grand Bazaar'), rarity: 'rare', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'dragonhide', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'uncommon', level:{standard:8,high:16},use:['armor','shield']},
{material: 'grisantian-pelt', source: GetSourceKey('Pathfinder Lost Omens: Monsters of Myth'), rarity: 'rare', level:{standard:12,high:18},use:['armor']},
{material: 'inubrix', source: GetSourceKey('Pathfinder Lost Omens: The Grand Bazaar'), rarity: 'rare', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'mithral', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'uncommon', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'noqual', source: GetSourceKey('Pathfinder Lost Omens: The Grand Bazaar'), rarity: 'rare', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'orichalcum', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'rare', level:{high:17},use:['weapon','armor','shield']},
{material: 'peachwood', source: GetSourceKey('Pathfinder Book of the Dead'), rarity: 'uncommon', level:{standard:8,high:16},use:['weapon']},
{material: 'siccatite', source: GetSourceKey('Pathfinder Lost Omens: The Grand Bazaar'), rarity: 'rare', level:{standard:8,high:16},use:['weapon','armor','shield']},
{material: 'silver', source: GetSourceKey('Pathfinder Core Rulebook'), rarity: 'common', level:{low:2,standard:7,high:15},use:['weapon','armor','shield']},
{material: 'sovereignSteel', source: GetSourceKey('Pathfinder Lost Omens: Legends'), rarity: 'rare', level:{standard:9,high:17},use:['weapon','armor','shield']},
{material: 'warpglass', source: GetSourceKey('Pathfinder Lost Omens: Legends'), rarity: 'rare', level:{high:17},use:['weapon']},
];

const wealthByLevel = {
	1: {party:40,     pc:10},
	2: {party:70,     pc:18},
	3: {party:120,    pc:30},
	4: {party:200,    pc:50},
	5: {party:320,    pc:80},
	6: {party:500,    pc:125},
	7: {party:720,    pc:180},
	8: {party:1000,   pc:250},
	9: {party:1400,   pc:350},
	10: {party:2000,  pc:500},
	11: {party:2800,  pc:700},
	12: {party:4000,  pc:1000},
	13: {party:6000,  pc:1500},
	14: {party:9000,  pc:2250},
	15: {party:13000, pc:3250},
	16: {party:20000, pc:5000},
	17: {party:30000, pc:7500},
	18: {party:48000, pc:12000},
	19: {party:80000, pc:20000},
	20: {party:140000,pc:35000},	
}

const pack = game.packs.get(CompendiumID);
const docs = await pack.getDocuments();
let typearray = docs.map(i => i.type);
typearray = [...new Set(typearray)];
console.log(typearray);

//console.log(docs);
let srcarray = docs.map(i => i.data.data.source.value);
srcarray = [...new Set(srcarray)];
srcarray = srcarray.filter(x=>x!=="");
srcarray.sort();
let srcObjects = srcarray.map(i => ({display:i,key:GetSourceKey(i)}));

let srcWeightings = "<table><caption>Source Weightings (Multiplicative)</caption>";

srcObjects.forEach((item)=>{
	if (item === "")
		return;
	srcWeightings += '<tr><td width="75%"><label for="' + item.key + '">' + item.display + '</label></td><td width="25%"><input class="treasureSource" type="number" name="' + item.key + '" id="' + item.key + '" min="0" max="100"></td></tr>'
});
srcWeightings += "</table>";

let weightMappings = {rarity:{common:1,uncommon:1,rare:1,unique:1},weapon:{simple:1,martial:1,advanced:1},armor:{light:1,medium:1,heavy:1},source:{}};

const formContent = `
<div style="flex-wrap:nowrap;display:flex;">
<div style="height:750px;overflow:scroll;float:left;">

<input class="treasureOptionCheck ignorePCCheck" type="checkbox" id="ignorePCTokens" name="ignorePCTokens"><label for="ignorePCTokens">Ignore PC Tokens</label><br>
<input class="treasureOptionCheck" type="checkbox" id="clearInventory" name="clearInventory"><label for="clearInventory">Clear Selected Tokens Inventory?</label><br>
<input class="treasureOptionCheck" type="checkbox" id="insertInventory" name="insertInventory"><label for="insertInventory">Insert into Selected Tokens Inventory?</label><br>
<input class="treasureOptionCheck" type="checkbox" id="mergeInventory" name="mergeInventory"><label for="mergeInventory">Merge Inventory?</label><br><br>
<input class="treasureOptionCheck useSelectedTokenCheck" type="checkbox" id="useSelectedTokenLevel" name="useSelectedTokenLevel"><label for="useSelectedTokenLevel">Use Selected Token's Level?</label><br>
<input class="treasureOptionCheck" type="checkbox" id="showInChat" name="showInChat"><label for="showInChat">Show Result in Chatbox?</label><br><br>

<div><label for="quantity">Rolls Per Token</label><input class="treasureOption" type="number" name="quantity" id="quantity" min="1" max="30"><br></div>

<div id="treasurelvl">
<label for="level">Treasure Level</label> <input type="number" name="level" id="level" min="-1" max="30" value="`+GetFilteredTokensMaxLevel()+`"><br>
</div>

<h3>Weights (Hard)</h3>
<div><table><caption>Treasure Level compared to Defined Level</caption><tr><td width="33%"><label for="lvlPlusOne">Level + 1</label><input class="treasureOption"  type="number" name="lvlPlusOne" id="lvlPlusOne" min="0" max="100"></td>
<td width="33%"><label for="lvlPlusZero">Level</label><input class="treasureOption"  type="number" name="lvlPlusZero" id="lvlPlusZero" min="0" max="100"></td>
<td width="33%"><label for="lvlMinusOne">Level - 1</label><input class="treasureOption"  type="number" name="lvlMinusOne" id="lvlMinusOne" min="0" max="100"></td></tr></table>
<table><tr>
<td><label for="levelplus">% Level Up</label> <input class="treasureOption"  type="number" name="levelplus" id="levelplus" min="0" max="100"><br></td>
<td><label for="levelminus">% Level Down</label> <input class="treasureOption"  type="number" name="levelminus" id="levelminus" min="0" max="100"></td></tr></table></div>

<div style="display:flex">
<table><caption>Type of Treasure</caption><tr><td width="33%"><label for="noTreasure">No Treasure</label><input class="treasureOption"  type="number" name="noTreasure" id="noTreasure" min="0" max="100"></td>
<td width="33%"><label for="money">Money</label><input class="treasureOption"  type="number" name="money" id="money" min="0" max="100"></td>
<td width="33%"><label for="item">Item</label><input class="treasureOption"  type="number" name="item" id="item" min="0" max="100"></td></tr></table></div>

<div style="display:flex">
<table><caption>Item Type</caption><tr><td width="25%"><label for="consumable">Consumable</label><input class="treasureOption"  type="number" name="consumable" id="consumable" min="0" max="100"></td>
<td width="25%"><label for="permanent">Permanent</label><input class="treasureOption"  type="number" name="permanent" id="permanent" min="0" max="100"></td>
</tr></table></div>

<div>
<table><caption>Permanent Item Relative Weights</caption>
<tr>
<td width="50%"><label for="perm_weapon">Specific Weapon</label><input class="treasureOption"  type="number" name="perm_weapon" id="perm_weapon" min="0" max="100"></td>
<td width="50%"><label for="perm_weapon_generic">Generic Weapon</label><input class="treasureOption"  type="number" name="perm_weapon_generic" id="perm_weapon_generic" min="0" max="100"></td></tr>
<tr><td width="50%"><label for="perm_armor">Specific Armor</label><input class="treasureOption"  type="number" name="perm_armor" id="perm_armor" min="0" max="100"></td>
<td width="50%"><label for="perm_armor_generic">Generic Armor</label><input class="treasureOption"  type="number" name="perm_armor_generic" id="perm_armor_generic" min="0" max="100"></td></tr>
<tr><td colspan="2"><label for="perm_other">Other Permanent</label><input class="treasureOption"  type="number" name="perm_other" id="perm_other" min="0" max="100"></td>
</tr></table>
<table><caption>Percentage Chances</caption><tr>
<td><label for="weaponmaterial">Special Material</label> <input class="treasureOption"  type="number" name="weaponmaterial" id="weaponmaterial" min="0" max="100"></td>
<td><label for="weaponpotency">Weapon Potency</label> <input class="treasureOption"  type="number" name="weaponpotency" id="weaponpotency" min="0" max="100"></td>
<td><label for="weaponstriking">Striking</label> <input class="treasureOption"  type="number" name="weaponstriking" id="weaponstriking" min="0" max="100"></td>
<td><label for="weaponproperty">Weapon Property</label> <input class="treasureOption"  type="number" name="weaponproperty" id="weaponproperty" min="0" max="100"></td>
</tr><tr>
<td><label for="armormaterial">Special Material</label> <input class="treasureOption"  type="number" name="armormaterial" id="armormaterial" min="0" max="100"></td>
<td><label for="armorpotency">Armor Potency</label> <input class="treasureOption"  type="number" name="armorpotency" id="armorpotency" min="0" max="100"></td>
<td><label for="armorresilient">Resilient</label> <input class="treasureOption"  type="number" name="armorresilient" id="armorresilient" min="0" max="100"></td>
<td><label for="armorproperty">Armor Property</label> <input class="treasureOption"  type="number" name="armorproperty" id="armorproperty" min="0" max="100"></td>
</tr></table></div>

<div>
<table><caption>Wealth Options</caption><tr>
<td><label for="moneyDivisor">Divisor</label><input class="treasureOption"  type="number" name="moneyDivisor" id="moneyDivisor" min="1" max="100"></td>
<td><label for="pcCount">Number of PCs</label><input class="treasureOption"  type="number" name="pcCount" id="pcCount" min="1" max="100"></td>
<td><label for="moneyflux">Flux Percentage</label><input class="treasureOption"  type="number" name="moneyflux" id="moneyflux" min="1" max="100"></td>
<td><label for="cashOnly">Cash-Only Percentage</label><input class="treasureOption"  type="number" name="cashOnly" id="cashOnly" min="1" max="100"></td>
</tr></table>
</div>
<hr>
<h3>Weights (Multiplicative)</h3>
<div style="display:flex">
<table><caption>Rarities</caption><tr><td width="25%"><label for="common">Common</label><input class="treasureOption"  type="number" name="common" id="common" min="0" max="100"></td>
<td width="25%"><label for="uncommon">Uncommon</label><input class="treasureOption"  type="number" name="uncommon" id="uncommon" min="0" max="100"></td>
<td width="25%"><label for="rare">Rare</label><input class="treasureOption"  type="number" name="rare" id="rare" min="0" max="100"></td>
<td width="25%"><label for="unique">Unique</label><input class="treasureOption"  type="number" name="unique" id="unique" min="0" max="100"></td></tr></table></div>

<div style="display:flex">
<table><caption>Weapon Complexity</caption><tr><td width="25%"><label for="simple">Simple Weapons</label><input class="treasureOption"  type="number" name="simple" id="simple" min="0" max="100"></td>
<td width="25%"><label for="martial">Martial Weapons</label><input class="treasureOption"  type="number" name="martial" id="martial" min="0" max="100"></td>
<td width="25%"><label for="advanced">Advanced Weapons</label><input class="treasureOption"  type="number" name="advanced" id="advanced" min="0" max="100"></td></tr></table></div>

<div style="display:flex">
<table><caption>Armor Type</caption><tr><td width="25%"><label for="light">Light Armor</label><input class="treasureOption"  type="number" name="light" id="light" min="0" max="100"></td>
<td width="25%"><label for="medium">Medium Armor</label><input class="treasureOption"  type="number" name="medium" id="medium" min="0" max="100"></td>
<td width="25%"><label for="heavy">Heavy Armor</label><input class="treasureOption"  type="number" name="heavy" id="heavy" min="0" max="100"></td></tr></table></div>
</div>
<div style="height:750px;overflow:scroll;float:right;" id="sourceList">
`+ srcWeightings +`
</div>
</div>
`;

let dialogOptions = { width: 850, height: 850 };

let d = new Dialog({
 title: "Treasure Generation Options",
 content: formContent,
 buttons: {
  generate: {
   icon: '<i class="fas fa-check"></i>',
   label: "Generate Treasure",
  callback: html => {console.log("Generating");GenerateAllTreasure(html);}
  },
  cancel: {
   icon: '<i class="fas fa-times"></i>',
   label: "Cancel",
   callback: () => {}
  }
 },
 default: "generate",
 render: handleUpdates
// render: html => GetAllDefaultValues(html,srcarray)
// close: html => console.log("This always is logged no matter which option is chosen")
},dialogOptions);
d.render(true);

async function handleUpdates(html)
{
	//console.log("handling updates");
	//console.log(html.find('.treasureOptionCheck'));
	html.find('.treasureOptionCheck').prop("checked",function(){return GetOption(this);});
	html.find('.treasureOption').val(function(){return GetOption(this);});
	html.find('.treasureSource').val(function(){return GetOption(this, true);});
	html.find('.treasureOptionCheck').on("change",function(){UpdateOption(this,"check")});
	html.find('.treasureOption').on("change",function(){UpdateOption(this,"option")});
	html.find('.treasureSource').on("change",function(){UpdateOption(this,"source")});
	html.find('.ignorePCCheck').on("change",function(){UpdateTreasureLevel()});
	html.find('.useSelectedTokenCheck').on("change",function(){ToggleTreasureLevel()});
	
	ToggleTreasureLevel();
	UpdateTreasureLevel();
}

async function ChooseOption(optionList)
{
	let totalWeight = 0;
	optionList.forEach(opt=>
	{
		totalWeight += opt.weight;
		opt.maxRoll=totalWeight;
	});
	
	let r = new Roll("1d"+totalWeight,{async:true});
	await r.roll({async:true});
	console.log(r);
	console.log(optionList);
	for (let i = 0; i < optionList.length; i++)
	{
		if (r.total <= optionList[i].maxRoll)
			return optionList[i].text;
	}

	return "No result found.";
}

async function GenerateAllTreasure(html)
{
	//UpdateAllWeights(html);
	
	var addToInventory = settings.insertInventory; // As of 2 June 22, this value isn't used yet.
	var baseItemLevel = html.find('[name=level]')[0].value; // This value isn't saved in settings, so get from html
	var chanceToIncreaseLevel = settings.levelplus;
	var chanceToDecreaseLevel = settings.levelminus;
	
	var numberOfTreasureRolls = settings.quantity;
	let actors = GetFilteredTokenActors();
	for (let a = 0; a < actors.length; a++)
	{
		if (settings.clearInventory)
		{	console.log(actors[a]);
			ClearTokenInventory(actors[a]);
		}
		let tokenItemLevel = baseItemLevel;
		if (settings.useSelectedTokenLevel)
			tokenItemLevel = actors[a].data.data.details.level.value;
		
		console.log(numberOfTreasureRolls + " rolls to make.");
		let items = [];
		for (let i = 0; i < numberOfTreasureRolls; i++)
		{
			let iLevel = await GetItemLevel(tokenItemLevel, chanceToIncreaseLevel, chanceToDecreaseLevel);

			let treasureTypeOptions = [{text:"No Treasure",weight:settings.noTreasure},
									{text:"Item",weight:settings.item},
									{text:"Money",weight:settings.money}];
			let ttype = await ChooseOption(treasureTypeOptions);

			console.log("Draw from Treasure Type Table resulted in " + ttype);
			
			if (ttype === "No Treasure")
				{
					LogToChat("Pull " + (i+1) + " of " + numberOfTreasureRolls + " resulted in no treasure.");
					continue;
				}
			else if (ttype ==="Item")
			{
				let itemTypeOptions = [{text:"consumable",weight:settings.consumable},
					{text:"permanent",weight:settings.permanent}];
				let itype = await ChooseOption(itemTypeOptions);
				
				LogToChat("Draw from Item Type Table resulted in " + itype);
				if (itype === "consumable")
				{
					LogToChat("Pulling a consumable item");
					let itemDrawn = await PullConsumableItem(iLevel);
					items.push(...itemDrawn);
				}
				else if (itype === "permanent")
				{
					let permanentTypeOptions = [{text:"perm_other",weight:settings.perm_other},
						{text:"perm_weapon",weight:settings.perm_weapon},
						{text:"perm_weapon_generic",weight:settings.perm_weapon_generic},
						{text:"perm_armor",weight:settings.perm_armor},
						{text:"perm_armor_generic",weight:settings.perm_armor_generic}];
					let ptype = await ChooseOption(permanentTypeOptions);
										
					LogToChat("Draw from Permanent Type Table resulted in " + ptype);
					if (ptype === "perm_armor" || ptype==="perm_armor_generic")
					{
						LogToChat("Pulling armor");
						let probabilities = 
							{
							generic:ptype==="perm_armor_generic"?100:0,
							precious:settings.armormaterial,
							potency:settings.armorpotency,
							resilient:settings.armorresilient,
							property:settings.armorproperty,
							};
						let itemDrawn = await PullArmor(iLevel, probabilities);
						items.push(...itemDrawn);
					}
					else if (ptype === "perm_weapon" || ptype==="perm_weapon_generic")
					{
						LogToChat("Pulling weapon");
						let probabilities = 
							{
							generic:ptype==="perm_weapon_generic"?100:0,
							precious:settings.weaponmaterial,
							potency:settings.weaponpotency,
							striking:settings.weaponstriking,
							property:settings.weaponproperty,
							};
						let itemDrawn = await PullWeapon(iLevel, probabilities);
						items.push(...itemDrawn);
					}
					else if (ptype === "perm_other")
					{
						LogToChat("Pulling permanent item");
						let itemDrawn = await PullPermanentItem(iLevel);
						items.push(...itemDrawn);
					}
					else
					{
						LogToChat("Unexpected Permanent Type: " + ptype);
					}					
				}
				else
				{
					LogToChat("Unexpected Item Type: " + itype);
				}
			}
			else if (ttype ==="Money")
			{
				LogToChat("Pulling money");
				let options = {
						pcs:settings.pcCount,
						flux:settings.moneyflux,
						cashOnly:settings.cashOnly,
						divisor:settings.moneyDivisor,
					};
					let itemsDrawn = await PullMoney(iLevel, options);
					await items.push(...itemsDrawn);
					
			}
			else
			{
				LogToChat("Unexpected Treasure Type: " + ttype);
			}
		}
		
		LogToChat(items);
	}
}

async function GetItemLevel(baseLevel, chanceToIncrease, chanceToDecrease)
{
	let finalLevel = baseLevel;
	let levelText = await DrawTextFromTable("Treasure Level");
	if (levelText==="lvlPlusOne")
	{
		finalLevel++;
	}
	else if (levelText==="lvlMinusOne")
		finalLevel--;
	else if (levelText==="lvlPlusZero")
		{//Do Nothing
		}
	else
		{
			LogToChat("Unexpected Item Level Value: " + levelText);
		}
	let direction = 0;
	do {
		let r = new Roll("1d100",{async:true});
		await r.roll({async:true});
		if (r.total <= chanceToDecrease && direction !== 1 && finalLevel !== 0)
		{
			finalLevel--;
			direction = -1;
			if (finalLevel === 0)
				direction = 2;
		}
		else if (r.total > 100-chanceToIncrease && direction !== -1 && finalLevel < 30)
		{
			finalLevel++;
			direction = 1;
			if (finalLevel === 30)
				direction = 2;
		}
		else
			direction = 2;
		
	} while (direction < 2);
	
	finalLevel = Math.max(finalLevel, 0);
	LogToChat("Final Item Level is " + finalLevel);
	return finalLevel;
}

async function CalculateWeaponWeight(rarity, source, weaponType)
{
	return CalculateItemWeight(rarity,source,weaponType);
}

async function CalculateArmorWeight(rarity, source, armorType)
{
	return CalculateItemWeight(rarity,source,"",armorType);
}

function CalculateItemWeight(rarity, source, weaponType="", armorType="")
{
	//console.log(settings);
	
	let rweight = rarity===""?1:settings[rarity];
	let sweight = (source===undefined||source==="")?1:settings.source[GetSourceKey(source)];
	let wweight = weaponType === ""?1:settings[weaponType];
	let aweight = armorType === ""?1:settings[armorType];
	let weight = rweight*sweight*wweight*aweight;
	//console.log ("Rarity " + rweight + ", Source " +source+":"+ sweight + ", Weapon " + wweight + ", Armor " + aweight + ", Total: " + weight);
	if (isNaN(weight))
		weight = 1;
	return weight;
}

async function PrepareItemsTable(level, filterCB)
{
	await ClearTable("Items");
	
	let table=game.tables.find(t => t.name==="Items");
		
	let entries=docs.filter(filterCB(level));
	let weightedEntries = entries.map(e=>({img:e.img, collection:e.compendium.collection, resultId:e.id, text:e.data.name, rarity:e.rarity, source:e.data.data.source.value, weight:CalculateItemWeight(e.rarity, e.data.data.source.value),type:2,range:[1,1]}));

	let filteredEntries = weightedEntries.filter(f=>f.weight!==0);
	
	await table.createEmbeddedDocuments('TableResult',filteredEntries);
	await table.normalize();
	return table;
}

async function PrepareMaterialTable(level, usage)
{
	await ClearTable("Materials");
	let table = game.tables.find(t=>t.name==="Materials");
	let materials = materialLevel.filter(e=>e.use.includes(usage) && (e.level?.high <= level || e.level?.standard <= level || e.level?.low <= level));
	let entries = materials.map(e=>({type:0,range:[1,1],text:e.material,weight:CalculateItemWeight(e.rarity, e.source)}));
	let filteredEntries = entries.filter(f=>f.weight!==0);
	await table.createEmbeddedDocuments('TableResult',filteredEntries);
	await table.normalize();
	return table;
}

async function PrepareMaterialQualityTable(material, level)
{
	await ClearTable("Material Quality");
	let table = game.tables.find(t=>t.name==="Material Quality");
	let materialData = materialLevel.filter(e=>e.material===material);
	let weight = 1;
	if (materialData[0].level.hasOwnProperty('low') !== null && materialData[0].level.low <= level)
	{
		await table.createEmbeddedDocuments('TableResult', [{text:'low',weight:weight,type:0,range:[1,1]}]);
		weight *=2;
	}
	if (materialData[0].level.hasOwnProperty('standard') && materialData[0].level.standard <= level)
	{
		await table.createEmbeddedDocuments('TableResult', [{text:'standard',weight:weight,type:0,range:[1,1]}]);
		weight *=2;
	}
	if (materialData[0].level.hasOwnProperty('high') && materialData[0].level.high <= level)
	{
		await table.createEmbeddedDocuments('TableResult', [{text:'high',weight:weight,type:0,range:[1,1]}]);
	}
	
	await table.normalize();
	return table;
		
}

async function PreparePotencyRunesTable(level,type)
{
	await ClearTable("Runes");
	let table = game.tables.find(t=>t.name==="Runes");
	let availableRunes = runes[type].potency.filter(e=>e.level <= level);
	let entries = availableRunes.map(e=>({type:0,range:[1,1],text:e.rune,weight:Math.floor(Math.pow(2,e.rune-1))}));
	await table.createEmbeddedDocuments('TableResult',entries);
	await table.normalize();
	return table;
}

async function PrepareStrikingRunesTable(level)
{
	await ClearTable("Runes");
	let table = game.tables.find(t=>t.name==="Runes");
	let availableRunes = runes.weapon.striking.filter(e=>e.level <= level);
	let entries = availableRunes.map(e=>({type:0,range:[1,1],text:e.rune,weight:(e.rune.includes("major")?4:e.rune.includes("greater")?2:1)}));
	await table.createEmbeddedDocuments('TableResult',entries);
	await table.normalize();
	return table;
}

async function PrepareResilientRunesTable(level)
{
	await ClearTable("Runes");
	let table = game.tables.find(t=>t.name==="Runes");
	let availableRunes = runes.armor.resilient.filter(e=>e.level <= level);
	let entries = availableRunes.map(e=>({type:0,range:[1,1],text:e.rune,weight:(e.rune.includes("true")?8:e.rune.includes("major")?4:e.rune.includes("greater")?2:1)}));
	await table.createEmbeddedDocuments('TableResult',entries);
	await table.normalize();
	return table;
}

async function PreparePropertyRunesTable(level,type)
{
	await ClearTable("Runes");
	let table = game.tables.find(t=>t.name==="Runes");
	let availableRunes = runes[type].property.filter(e=>e.level <= level);
	let entries = availableRunes.map(e=>({type:0,range:[1,1],text:e.rune,weight:CalculateItemWeight(e.rarity, e.source)}));
	let filteredEntries = entries.filter(f=>f.weight!==0);
	await table.createEmbeddedDocuments('TableResult',filteredEntries);
	await table.normalize();
	return table;
}

async function PullConsumableItem(level, showInChat=false)
{
	let table = await PrepareItemsTable(level, ConsumableFilterCallback);		
	let drawResult = await table.draw({displayChat:showInChat});
	let item = await GetCompendiumObjectFromDraw(drawResult);
	return [item];
}

function ConsumableFilterCallback(level)
{
	return function(value) {
		let rv = true;
		if (value.type !== "consumable")
		{
			if (value.type === "weapon" && value.data.data.group === "bomb")
			{			
			}
			else
			{
				rv = false;
			}
		}
		if (parseInt(value.level) !== parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

async function PullPermanentItem(level, showInChat=false)
{
	let table = await PrepareItemsTable(level, PermanentItemCallback);		
	let drawResult = await table.draw({displayChat:showInChat});
	let item = await GetCompendiumObjectFromDraw(drawResult);
	return [item];
}

function PermanentItemCallback(level)
{
		return function(value) {
		let rv = true;
		if (value.type !== "equipment" && value.type!=="backpack" && value.type!=="kit")
		{
			rv = false;
		}
		if (parseInt(value.level) !== parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

function GetItemsCompendiumName(name)
{
	// start by capitalizing the first letter no matter what.
	let finalName = name.charAt(0).toUpperCase() + name.slice(1);
	let finalNameHyphen = name.charAt(0).toUpperCase() + name.slice(1);
	let postfix = "";
	if (name.startsWith("true"))
	{
		finalName = name.substring(4);
		postfix = " (True)";
	}
	else if (name.startsWith("major"))
	{
		finalName = name.substring(5);
		postfix = " (Major)";
	}
	else if (name.startsWith("greater"))
	{
		finalName = name.substring(7);
		postfix = " (Greater)"
	}
	else if (name.startsWith("lesser"))
	{
		finalName = name.substring(6);
		postfix = " (Lesser)"
	}
	else if (name.startsWith("moderate"))
	{
		finalName = name.substring(8);
		postfix = " (Moderate)"
	}
	
	if (finalName.startsWith("Acid"))
	{
		finalName = "Energy-" + finalName.substring(4);
	}
	else if (finalName.startsWith("Cold"))
	{
		finalName = "Energy-" + finalName.substring(4);
	}
	else if (finalName.startsWith("Fire"))
	{
		finalName = "Energy-" + finalName.substring(4);
	}
	else if (finalName.startsWith("Electricity"))
	{
		finalName = "Energy-" + finalName.substring(11);
	}
	
	finalName = finalName.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	finalNameHyphen = finalNameHyphen.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
	
	finalName = finalName + postfix;
	finalNameHyphen = finalNameHyphen + postfix;
	let eqs = docs.filter((a)=>a.name===finalName||a.name===finalNameHyphen);
	if (eqs.length >0)
		return eqs[0].name;
	else
		return finalName;
}

function GetVisibleName(name)
{
	let finalName = name.charAt(0).toUpperCase() + name.slice(1);
	finalName = finalName.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	return finalName;
}

function LoadArmorRuneData()
{
	LoadArmorPotencyRuneData();
	LoadArmorResilientRuneData();
	LoadArmorPropertyRuneData();
	//console.log(runes);
}

function LoadWeaponRuneData()
{
	LoadWeaponPotencyRuneData();
	LoadWeaponStrikingRuneData();
	LoadWeaponPropertyRuneData();
	//runes.weapon.property = CONFIG.PF2E.runes.weapon.property;
	//console.log(runes);
}

function LoadWeaponStrikingRuneData()
{
	//TODO Update this function to use CONFIG.PF2E definition when it exists as more than just a list of names.
	let runeNames = ["striking","greaterStriking","majorStriking"];
	
	runeNames.forEach((a)=>{
		let eq = docs.filter(d=>d.name===GetItemsCompendiumName(a));
		runes.weapon.striking.push({
			rune:a,
			level:eq[0].level,
			equipmentID:eq[0].id,
			source:eq[0].data.data.source.value,
			rarity:eq[0].rarity,
			itemName:GetVisibleName(a)
		});
	});		
}

function LoadWeaponPotencyRuneData()
{
	//TODO Update this function to use CONFIG.PF2E definition when it exists as more than just a list of names.
	//runes.weapon.potency.push({rune:0,level:0,equipmentID:'',source:"Pathfinder Core Rulebook",rarity:"common",itemName:""});
	
	for (let i = 1; i <= 3; i++)
	{
		let potencyRune = docs.filter(a=>a.name==="Weapon Potency (+"+i+")");
		
		runes.weapon.potency.push(
			{
				rune:i.toString(),
				level:potencyRune[0].level,
				equipmentID:potencyRune[0].id, 
				source:potencyRune[0].data.data.source.value,
				rarity:potencyRune[0].rarity,
				itemName:"+"+i
			});
	}	
}

function LoadWeaponPropertyRuneData()
{
	let runeList = Object.keys(CONFIG.PF2E.runes.weapon.property);
	let properties = [];
	runeList.forEach((a)=>{
		let cName = GetItemsCompendiumName(a);
		let propertyRune = docs.filter(e=>e.name===cName);
		
		properties.push({
			equipmentID:propertyRune[0].id,
			itemName:GetVisibleName(a),
			level:propertyRune[0].level,
			rarity:propertyRune[0].rarity,
			rune: a,
			source:propertyRune[0].data.data.source.value});
	});
	runes.weapon.property = properties;
	//console.log(runeList);
}

function LoadArmorPotencyRuneData()
{
	//TODO Update this function to use CONFIG.PF2E definition when it exists as more than just a list of names.
	
	for (let i = 1; i <= 3; i++)
	{
		let potencyRune = docs.filter(a=>a.name==="Armor Potency (+"+i+")");
		
		runes.armor.potency.push(
			{
				rune:i.toString(),
				level:potencyRune[0].level,
				equipmentID:potencyRune[0].id, 
				source:potencyRune[0].data.data.source.value,
				rarity:potencyRune[0].rarity,
				itemName:"+"+i
			});
	}	
}

function LoadArmorResilientRuneData()
{
	//TODO Update this function to use CONFIG.PF2E definition when it exists as more than just a list of names.
	let runeNames = ["resilient","greaterResilient","majorResilient"];
	
	runeNames.forEach((a)=>{
		let eq = docs.filter(d=>d.name===GetItemsCompendiumName(a));
		runes.armor.resilient.push({
			rune:a,
			level:eq[0].level,
			equipmentID:eq[0].id,
			source:eq[0].data.data.source.value,
			rarity:eq[0].rarity,
			itemName:GetVisibleName(a)
		});
	});		
}

function LoadArmorPropertyRuneData()
{
	let runeList = Object.keys(CONFIG.PF2E.armorPropertyRunes);
	// This section updates a couple of keys that are incorrect in the PF2E data
	runeList = runeList.filter(a=>a!=="dread");
	runeList.push("lesserDread");
	runeList.push("moderateDread");
	runeList.push("greaterDread");
	console.log(runeList);
	let properties = [];
	runeList.forEach((a)=>{
		let cName = GetItemsCompendiumName(a);
		console.log(cName);
		let propertyRune = docs.filter(e=>e.name===cName);
		properties.push({
			equipmentID:propertyRune[0].id,
			itemName:GetVisibleName(a),
			level:propertyRune[0].level,
			rarity:propertyRune[0].rarity,
			rune: a,
			source:propertyRune[0].data.data.source.value});
	});
	runes.armor.property = properties;
	//console.log(runeList);
}

async function PullWeapon(level, probabilities, showInChat=false)
{
	var table;
	let doSimple = false;
	let r = new Roll("1d100",{async:true});
	await r.roll({async:true});
	if (r.total <= probabilities.generic)
	{
		doSimple = true;
	}
	else
	{
		table = await PrepareItemsTable(level, SpecificWeaponCallback);		
		if (table.data.results?.length === 0)
			doSimple = true;
		else
		{
			let drawResult = await table.draw({displayChat:showInChat});
			let item = await GetCompendiumObjectFromDraw(drawResult);
			return [item];
		}
	}
		
	if (doSimple)
	{
		let numberOfPropertyRunesPossible = 0;
		let weaponLevel = 0;
		
		// Get special material list, if needed.
		LoadWeaponRuneData();
		
		table = await PrepareItemsTable(level, MundaneWeaponCallback);
		// Draw base weapon
		let drawResult = await table.draw({displayChat:showInChat});
		let result = drawResult.results[0];
		let weapon = await GetCompendiumObject(result.data.resultId);
		weaponLevel = weapon.level;
		//console.log(weapon);
		
		
		// Add special materials?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.precious)
		{
			let materialTable = await PrepareMaterialTable(level, "weapon");
			if (materialTable.data.results.size > 0)
			{
				let materialDrawResult = await materialTable.draw({displayChat:showInChat});
				let material = materialDrawResult.results[0].data.text;
				if (material === "orichalcum")
					numberOfPropertyRunesPossible ++;
				// No need for dragonhide separation for weapons.
				
				let qualityTable = await PrepareMaterialQualityTable(material, level);
				let qualityDrawResult = await qualityTable.draw({displayChat:showInChat});
				let quality = qualityDrawResult.results[0].data.text;
				weapon.data.preciousMaterial.value = material;
				weapon.data.preciousMaterialGrade.value = quality;
				let finalPreciousLevelArray = materialLevel.filter(e=>e.material===material);
				let finalPreciousLevel = finalPreciousLevelArray[0].level[quality];
				weaponLevel = Math.max(weaponLevel,finalPreciousLevel);
			}
		}
		
		// Add potency runes?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.potency)
		{
			let potencyTable = await PreparePotencyRunesTable(level,"weapon");
			if (potencyTable.data.results.size > 0)
			{
				let potencyDrawResult = await potencyTable.draw({displayChat:showInChat});
				let potency = potencyDrawResult.results[0].data.text;
				numberOfPropertyRunesPossible += parseInt(potency);
				weapon.data.potencyRune.value=potency;
				let potencyLevel = runes.weapon.potency.filter(e=>e.rune===potency);
				weaponLevel = Math.max(weaponLevel, potencyLevel[0].level);
			}
		}
		
		// Add striking runes?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.striking)
		{
			let strikingTable = await PrepareStrikingRunesTable(level);
			if (strikingTable.data.results.size > 0)
			{
				let strikingDrawResult = await strikingTable.draw({displayChat:showInChat});
				let striking = strikingDrawResult.results[0].data.text;
				weapon.data.strikingRune.value=striking;
				let strikingLevel = runes.weapon.striking.filter(e=>e.rune===striking);
				weaponLevel = Math.max(weaponLevel, strikingLevel[0].level);
			}
		}
		// Add property runes?
		let nextPropertyRune = 1;
		for (let i = 0; i < numberOfPropertyRunesPossible; i++)
		{
			r = await r.reroll({async:true}); // A new d100
			if (r.total <= probabilities.property)
			{
				let propertyTable = await PreparePropertyRunesTable(level,"weapon");
				if (propertyTable.data.results.size > 0)
				{
					let propertyDrawResult = await propertyTable.draw({displayChat:showInChat});
					let property = propertyDrawResult.results[0].data.text;
					weapon.data['propertyRune'+(nextPropertyRune++)].value=property;
					let propertyLevel = runes.weapon.property.filter(e=>e.rune===property);
					weaponLevel = Math.max(weaponLevel, propertyLevel[0].level);
				}
			}
		}
		//console.log(weapon);
		return [weapon];
	}
}

async function PullArmor(level, probabilities, showInChat=false)
{
	var table;
	let doSimple = false;
	let r = new Roll("1d100",{async:true});
	await r.roll({async:true});
	if (r.total <= probabilities.generic)
	{
		doSimple = true;
	}
	else
	{
		table = await PrepareItemsTable(level, SpecificArmorCallback);		
		if (table.data.results?.length === 0)
			doSimple = true;
		else
		{
			let drawResult = await table.draw({displayChat:showInChat});
			let item = await GetCompendiumObjectFromDraw(drawResult);		
			return [item];
		}
	}
		
	if (doSimple)
	{
		let numberOfPropertyRunesPossible = 0;
		let armorLevel = 0;
		
		// Get special material list, if needed.
		LoadArmorRuneData();
		
		table = await PrepareItemsTable(level, MundaneArmorCallback);
		// Draw base armor
		let drawResult = await table.draw({displayChat:showInChat});
		let result = drawResult.results[0];
		let armor = await GetCompendiumObject(result.data.resultId);
		armorLevel = armor.level;
		//console.log(armor);
		
		
		// Add special materials?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.precious)
		{
			let materialTable = await PrepareMaterialTable(level, "armor");
			if (materialTable.data.results.size > 0)
			{
				let materialDrawResult = await materialTable.draw({displayChat:showInChat});
				let material = materialDrawResult.results[0].data.text;
				if (material === "orichalcum")
					numberOfPropertyRunesPossible ++;
				// TODO Dragonhide color
				
				let qualityTable = await PrepareMaterialQualityTable(material, level);
				let qualityDrawResult = await qualityTable.draw({displayChat:showInChat});
				let quality = qualityDrawResult.results[0].data.text;
				armor.data.preciousMaterial.value = material;
				armor.data.preciousMaterialGrade.value = quality;
				let finalPreciousLevelArray = materialLevel.filter(e=>e.material===material);
				let finalPreciousLevel = finalPreciousLevelArray[0].level[quality];
				armorLevel = Math.max(armorLevel,finalPreciousLevel);
			}
		}
		
		// Add potency runes?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.potency)
		{
			let potencyTable = await PreparePotencyRunesTable(level,"armor");
			if (potencyTable.data.results.size > 0)
			{
				let potencyDrawResult = await potencyTable.draw({displayChat:showInChat});
				let potency = potencyDrawResult.results[0].data.text;
				numberOfPropertyRunesPossible += parseInt(potency);
				armor.data.potencyRune.value=potency;
				let potencyLevel = runes.armor.potency.filter(e=>e.rune===potency);
				armorLevel = Math.max(armorLevel, potencyLevel[0].level);
			}
		}
		
		// Add resilient runes?
		r = await r.reroll({async:true}); // A new d100
		if (r.total <= probabilities.resilient)
		{
			let resilientTable = await PrepareResilientRunesTable(level);
			if (resilientTable.data.results.size > 0)
			{
				let resilientDrawResult = await resilientTable.draw({displayChat:showInChat});
				let resilient = resilientDrawResult.results[0].data.text;
				armor.data.resiliencyRune.value=resilient;
				let resilientLevel = runes.armor.resilient.filter(e=>e.rune===resilient);
				armorLevel = Math.max(armorLevel, resilientLevel[0].level);
			}
		}
		// Add property runes?
		let nextPropertyRune = 1;
		for (let i = 0; i < numberOfPropertyRunesPossible; i++)
		{
			r = await r.reroll({async:true}); // A new d100
			if (r.total <= probabilities.property)
			{
				let propertyTable = await PreparePropertyRunesTable(level,"armor");
				if (propertyTable.data.results.size > 0)
				{
					let propertyDrawResult = await propertyTable.draw({displayChat:showInChat});
					let property = propertyDrawResult.results[0].data.text;
					armor.data['propertyRune'+(nextPropertyRune++)].value=property;
					let propertyLevel = runes.armor.property.filter(e=>e.rune===property);
					armorLevel = Math.max(armorLevel, propertyLevel[0].level);
				}
			}
		}
		//console.log(weapon);
		return [armor];
	}
}

function SpecificWeaponCallback(level)
{
		return function(value) {
		let rv = true;
		if (value.type !== "weapon")
		{
			rv = false;
		}
		else if (value.data.data.group == "bomb")
		{
			// Bombs fall under consumables.
			rv = false;
		}
		if (rv && value.isMagical === false)
			rv = false;
		
		if (rv && parseInt(value.level) !== parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

function MundaneWeaponCallback(level)
{
	return function(value) {
		let rv = true;
		if (value.type !== "weapon" || value.name==="Fist")
		{
			rv = false;
		}
		else if (value.data.data.group == "bomb")
		{
			// Bombs fall under consumables.
			rv = false;
		}
		if (rv && value.isMagical === true)
		{
			rv = false;
		}
		
		if (rv && parseInt(value.level) > parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

function SpecificArmorCallback(level)
{
		return function(value) {
		let rv = true;
		if (value.type !== "armor" && value.type !== "shield")
		{
			rv = false;
		}
		if (rv && value.isMagical === false)
			rv = false;
		
		if (rv && parseInt(value.level) !== parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

function MundaneArmorCallback(level)
{
	return function(value) {
		let rv = true;
		if (rv && value.type !== "armor" && value.type !== "shield")
		{
			rv = false;
		}
		if (rv && value.isMagical === true)
		{
			rv = false;
		}
		if (rv && (value.data.data.preciousMaterial.value!==null && value.data.data.preciousMaterial.value !== ''))
		{
			rv = false;
		}
		
		if (rv && parseInt(value.level) > parseInt(level))
		{
			rv = false;
		}
		return (rv);
	}
}

function GetPriceInCopper(price)
{
	let total = price.value.cp + (10 * price.value.sp) + (100 * price.value.gp) + (1000 * price.value.pp);
	return (Math.floor(total / price.per));
}

function TreasureCallback(minworth,maxworth)
{
	return function(value) {
		let rv = true;		
		let price = GetPriceInCopper (value.price);
		if (value.type !== "treasure" && false === value.data.data.traits.value.includes("precious"))
		{
			rv  = false;
		}
		if (rv && (price <= maxworth) && (price >= minworth))
		{
			rv = false;
		}
		
		return rv;
	}
}

async function GetCashTotal(totalValue)
{
	let platinum = 0;
	let gold = 0;
	let silver = 0;
	let copper = 0;
	let rv = [];
	let remainingWorth = totalValue;
	let maxPlatinum = Math.floor(remainingWorth / 1000);
	if (maxPlatinum > 0)
	{
		let r = new Roll("1d"+(maxPlatinum+1)+"-1",{});
		r=r.roll({async:false});
		platinum = r.total;
		remainingWorth -= (platinum * 1000);
		if (platinum > 0)
		{
			let pp = await GetCompendiumObject(PlatinumID);
			pp.quantity = platinum;
			rv.push(pp);
		}
	}

	let maxGold = Math.floor(remainingWorth / 100);
	if (maxGold > 0)
	{
		let r = new Roll("1d"+(maxGold+1)+"-1",{});
		r=r.roll({async:false});
		gold = r.total;
		remainingWorth -= (gold * 100);
		if (gold > 0)
		{
			let gp = await GetCompendiumObject(GoldID);
			gp.quantity = gold;
			rv.push(gp);
		}		
	}

	let maxSilver = Math.floor(remainingWorth / 10);
	if (maxSilver > 0)
	{
		let r = new Roll("1d"+(maxSilver+1)+"-1",{});
		r=r.roll({async:false});
		silver = r.total;
		remainingWorth -= (silver * 10);
		if (silver > 0)
		{
			let sp = await GetCompendiumObject(SilverID);
			sp.quantity = silver;
			rv.push(sp);
		}		
	}
	
	copper = remainingWorth;
	if (copper > 0)
		{
			let cp = await GetCompendiumObject(CopperID);
			cp.quantity = copper;
			rv.push(cp);
		}
	return rv;
}

async function PullMoney(level, options={}, showInChat=false)
{
	await ClearTable("Money");
	let table = game.tables.find(t=>t.name==="Money");
	let pcCount = options.pcs;
	let moneyFlux = options.flux;
	let actualLevel = clamp(level,1,20); // Limit to the values wealth by level is defined for
	// 100 * because table is stored as gp
	let averageWorth = 100 * (wealthByLevel[level].party + (wealthByLevel[level].pc * (pcCount - 4)));
	averageWorth /= options.divisor;
	
	// Check for cash-only pull
	let r = new Roll("1d100",{async:true});
	await r.roll({async:true});
	if (r.total <= options.cashOnly)
	{
		console.log("Pulling cash!");
		let f = new Roll("1d" + (moneyFlux * 2), {async:true});
		console.log(f.formula);
		await f.roll({async:true});
		let multiplier = (f.total - moneyFlux) / 100;
		let value = averageWorth * (1 + multiplier);
		let money = await GetCashTotal(value);
		return money;
	}
	else
	{
		console.log("Pulling treasure item!");
		let maxWorth = averageWorth * (1 + (moneyFlux / 100));
		let minWorth = averageWorth * (1 - (moneyFlux / 100));
		
		let entries=docs.filter(TreasureCallback(minWorth,maxWorth));
			
		let weightedEntries = entries.map(e=>({img:e.img, collection:e.compendium.collection, resultId:e.id, text:e.data.name, rarity:e.rarity, source:e.data.data.source.value, weight:CalculateItemWeight(e.rarity, e.data.data.source.value),type:2,range:[1,1]}));

		let filteredEntries = weightedEntries.filter(f=>f.weight!==0);
		
		await table.createEmbeddedDocuments('TableResult',filteredEntries);
		await table.normalize();
		
		let drawResult = await table.draw({displayChat:showInChat});
		let item = await GetCompendiumObjectFromDraw(drawResult);
		return [item];
	}
}

async function ClearTable(tableName)
{
	let table=game.tables.find(t => t.name===tableName);
	await table.deleteEmbeddedDocuments('TableResult', table.data.results.map(i=>i.id));
}

async function DrawTextFromTable(tableName, showInChat=false)
{
	let table = game.tables.find(t => t.name===tableName);
	let result = await table.draw({displayChat:showInChat});
	console.log(result);
	let ttext = result.results[0].data.text;
	return ttext;
}

async function GetCompendiumObject(docID)
{
	let itemToMove = await pack.getDocument(docID);
	let itemObject = await itemToMove.toObject();
	return itemObject;
}

async function GetCompendiumObjectFromDraw(drawResult)
{
	return GetCompendiumObject(drawResult.results[0].data.resultId);
}

function ItemExistsOnCharacter(actor, docID)
{
	let itemArray = actor.items;
	let sourceFilter = "Compendium." + CompendiumID + "." + docID;
	let matchingItems = itemArray.filter(tsk=> tsk.sourceId === sourceFilter);
	return matchingItems;
}

async function AddItemToCharacter(actor, docID, quantity, merge=true)
{
	let existingItems = ItemExistsOnCharacter(actor, docID);
	
	if (merge && existingItems.length > 0)
	{
		let itemObject = existingItems[0];
		let newQuantity = itemObject.quantity + quantity;
		await actor.updateEmbeddedDocuments('Item',[{_id:itemObject.id, 'data.quantity':newQuantity}]);
	}
	else
	{
		let itemToMove = await pack.getDocument(docID);
		let itemObject = await itemToMove.toObject();
		itemObject.data.quantity = quantity;
		await actor.createEmbeddedDocuments('Item',[itemObject]);
	}
}

async function ClearTokenInventory(actor)
{
	await actor.deleteEmbeddedDocuments('Item', actor.items.filter(value=> (value.data.type === "weapon" || value.data.type === "treasure" || value.data.type === "armor" || value.data.type === "equipment" || value.data.type === "consumable" || value.data.type === "backpack")).map(i=>i.id));
}

function LogToChat(str, toChat=false, toConsole=true)
{
	if (toChat)
	{
		ChatMessage.create({
			content: str,
		});
	}
	if (toConsole)
		console.log(str);
}

async function UpdateAllWeights(html)
{
	UpdateWeights(html, "Treasure Type");
	UpdateWeights(html, "Armor Type");
	UpdateWeights(html, "Weapon Complexity");
	UpdateWeights(html, "Treasure Level");
	UpdateWeights(html, "Permanent Type");
	UpdateWeights(html, "Item Type");
	UpdateWeights(html, "Rarities",false);
	UpdateWeights(html, "Source",false);
	
	weightMappings.rarity.common=settings.common;
	weightMappings.rarity.uncommon=settings.uncommon;
	weightMappings.rarity.rare=settings.rare;
	weightMappings.rarity.unique=settings.unique;
	
	weightMappings.weapon.simple=settings.simple;
	weightMappings.weapon.martial=settings.martial;
	weightMappings.weapon.advanced=settings.advanced;
	
	weightMappings.armor.light=settings.light;
	weightMappings.armor.medium=settings.medium;
	weightMappings.armor.heavy=settings.heavy;
	
	console.log(weightMappings);
}

function GetOption(selectObject, isSource = false)
{
	var optionName = selectObject.id;
	if (isSource)
	{
		if (settings.source.hasOwnProperty(optionName))
		{
			return settings.source[optionName];
		}
		else
		{
			UpdateOption(selectObject, "source", 1);
			return 1;
		}
	}
	if (settings.hasOwnProperty(optionName))
	{
		return settings[optionName];
	}
	else
	{
		UpdateOption(selectObject,false,1);
		return 1;
	}
}

async function UpdateOption(selectObject, type="option", overrideValue=null)
{
	var value;
	if (type==="option" || type==="source")
		value = parseInt(selectObject.value);
	else if (type==="check")
		value = selectObject.checked;

	if (overrideValue !== null)
		value = overrideValue;

	var optionName = selectObject.id;
	
	if (type==="source")
	{
		settings.source[optionName] = value;
	}
	else
	{
		settings[optionName] = value;
	}
	
	let temp = await thisMacro.setFlag('world','PF2ETreasureGenSettings',settings);
}

function ToggleTreasureLevel()
{
	treasureLevelBox = document.getElementById('level');
	treasureLevelBox.disabled=settings.useSelectedTokenLevel;
}

function UpdateTreasureLevel()
{
	treasureLevelBox = document.getElementById('level');
	treasureLevelBox.value = GetFilteredTokensMaxLevel();
}

function GetSourceKey(source)
{
	return source.replace(/[^a-zA-Z1-9_$]/g, "")
}

function GetFilteredTokens()
{
	let finalTokens;
	if (settings.ignorePCTokens)
		finalTokens = selectedTokens.filter(t => t.actor.hasPlayerOwner===false)
	else
		finalTokens = selectedTokens;
	
	return finalTokens;
}

function GetFilteredTokenActors()
{
	let tokenList = GetFilteredTokens();
	let actors = tokenList.flatMap((token) => token.actor ?? []);
	
	return actors;
}

function GetFilteredTokensMaxLevel()
{
	let defaultLevel = 1;
	let actors = GetFilteredTokenActors();
	if (actors.length !== 0)
	{
		actors.forEach(actor=> defaultLevel = Math.max(defaultLevel, actor.data.data.details.level.value));
	}

	return defaultLevel;
}