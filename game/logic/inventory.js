// Equip an item to the character
function equipItem(character, item) {
    const slot = item.slot;
    if (!character.equipment) character.equipment = {};
    character.equipment[slot] = item;
  }
  
  // Unequip item
  function unequipItem(character, slot) {
    if (character.equipment && character.equipment[slot]) {
      character.equipment[slot] = null;
    }
  }
  
  // Add item to inventory
  function addItemToInventory(character, item) {
    if (!character.inventory) character.inventory = [];
    character.inventory.push(item);
  }
  