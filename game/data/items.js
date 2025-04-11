// Example static item
const ironClub = {
    id: "iron_club_001",
    name: "Iron Club",
    type: "weapon",
    slot: "weapon",
    rarity: "normal",
    level: 1,
    stats: {
      damage: 5
    }
  };
  
  // Static items dictionary (expand later)
  const itemsCatalog = {
    iron_club_001: ironClub
  };
  
  // Generate new item (basic version)
  function generateItem(baseId) {
    // Clone to avoid reference issues
    return JSON.parse(JSON.stringify(itemsCatalog[baseId]));
  }
  