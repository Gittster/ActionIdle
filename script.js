// Firebase integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNAnzR11yLJarKVW_Q7SiLijkAFgDFICg",
  authDomain: "actionidle.firebaseapp.com",
  projectId: "actionidle",
  storageBucket: "actionidle.firebasestorage.app",
  messagingSenderId: "885373687920",
  appId: "1:885373687920:web:6fc43e4a7b242517f3bcb5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function setInlineMessage(message, success = true, duration = 3000) {
    let msg = document.getElementById("inlineMessage");
    if (!msg) {
      msg = document.createElement("div");
      msg.id = "inlineMessage";
      msg.className = "mt-2 text-sm";
      document.getElementById("mainMenu").prepend(msg);
    }
    msg.textContent = message;
    msg.className = `mt-2 text-sm ${success ? 'text-green-400' : 'text-red-400'}`;
  
    // Clear any previous timers
    clearTimeout(window._inlineMessageTimeout);
    window._inlineMessageTimeout = setTimeout(() => {
      msg.remove();
    }, duration);
  }
  

async function saveCharacter(characterId, data) {
  await setDoc(doc(db, "characters", characterId), data);
  localStorage.setItem("lastCharacterId", characterId);
  setInlineMessage("Character saved successfully.");
}

async function loadCharacter(characterId) {
  const docSnap = await getDoc(doc(db, "characters", characterId));
  if (docSnap.exists()) {
    localStorage.setItem("lastCharacterId", characterId);
    const data = docSnap.data();
    document.getElementById("currentCharacterName").textContent = data.name;
    document.getElementById("launchGameBtn").disabled = false;
    setInlineMessage("Character loaded: " + data.name);
    return data;
  } else {
    setInlineMessage("Character not found.", false);
    return null;
  }
}

async function deleteCharacter(characterId) {
  await deleteDoc(doc(db, "characters", characterId));
  if (localStorage.getItem("lastCharacterId") === characterId) {
    localStorage.removeItem("lastCharacterId");
    document.getElementById("currentCharacterName").textContent = "None";
    document.getElementById("launchGameBtn").disabled = true;
  }
  setInlineMessage("Character deleted.");
  loadCharacterList();
}

window.createCharacter = async function () {
    const name = document.getElementById("newCharName").value.trim();
    const classType = document.getElementById("charClass").value;
    if (!name) return setInlineMessage("Please enter a name.", false);
  
    const charId = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  
    // Starter weapon object
    const starterWeapon = {
        id: "iron_club_001",
        name: "Iron Club",
        type: "weapon",
        slot: "weapon",
        rarity: "normal",
        level: 1,
        value: 5, // 💰 Sell value
        stats: {
          damage: 5
        }
      };
      
  
    const character = {
      name,
      class: classType,
      level: 1,
      gold: 0,
      equipment: {
        weapon: starterWeapon
      },
      inventory: []
    };
  
    await saveCharacter(charId, character);
    document.getElementById("currentCharacterName").textContent = name;
    document.getElementById("launchGameBtn").disabled = false;
    document.getElementById("newCharName").value = "";
    loadCharacterList();
  };
  

window.manualLoadCharacter = async function() {
  const id = document.getElementById("loadCharId").value.trim();
  if (!id) return setInlineMessage("Please enter a character ID.", false);
  await loadCharacter(id);
}

window.showScreen = function(screenId) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

async function loadCharacterList() {
  const querySnapshot = await getDocs(collection(db, "characters"));
  const list = document.getElementById("characterList");
  list.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-gray-800 p-2 rounded";
    li.innerHTML = `
      <span>${data.name} (${data.class})</span>
      <div>
        <button class="btn text-xs mr-2" onclick="loadCharacter('${docSnap.id}')">Load</button>
        <button class="btn text-xs bg-red-600 hover:bg-red-700" onclick="deleteCharacter('${docSnap.id}')">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

window.launchGame = function () {
    const currentName = document.getElementById("currentCharacterName").textContent;
    if (currentName === "None") {
      setInlineMessage("Please select a character first.", false);
      return;
    }
  
    // Load the game screen or start the game loop here
    showScreen("town"); // or whatever your next screen is
  };
  

window.onload = async () => {
  const lastId = localStorage.getItem("lastCharacterId");
  if (lastId) await loadCharacter(lastId);
  loadCharacterList();
}



window.loadCharacter = loadCharacter;
window.deleteCharacter = deleteCharacter;

window.launchGame = function () {
    const currentName = document.getElementById("currentCharacterName").textContent;
    if (currentName === "None") {
      setInlineMessage("Please select a character first.", false);
      return;
    }
  
    document.getElementById("mainMenu").classList.add("hidden");
    showScreen("town");
  };
  
  window.returnToMainMenu = function () {
    showScreen("mainMenu");
    document.getElementById("mainMenu").classList.remove("hidden");
  };
  function renderCharacterScreen(character) {
    // Equipment
    const equipment = character.equipment || {};
    const equipmentSlots = ["helmet", "chest", "gloves", "boots", "amulet", "ring1", "ring2", "belt", "weapon", "offhand"];
    const equipmentDiv = document.getElementById("equipmentSlots");
    equipmentDiv.innerHTML = "";
  
    equipmentSlots.forEach(slot => {
        const item = equipment[slot];
        const row = document.createElement("div");
        row.className = "flex items-center justify-between bg-gray-700 p-2 rounded";
      
        const label = document.createElement("span");
        label.textContent = item ? `${slot}: ${item.name}` : `${slot}: (empty)`;
      
        row.appendChild(label);
      
        if (item && slot === "weapon") {
          const unequipBtn = document.createElement("button");
          unequipBtn.textContent = "Unequip";
          unequipBtn.className = "item-btn btn-sell text-xs ml-4";
          unequipBtn.onclick = () => unequipItemFromSlot(slot);
          row.appendChild(unequipBtn);
        }
      
        row.onmouseover = (e) => {
          if (item) showTooltip(formatItemTooltip(item), e.pageX, e.pageY);
        };
        row.onmouseout = hideTooltip;
      
        equipmentDiv.appendChild(row);
      });
      
      
  
    // Inventory
    const inventory = character.inventory || [];
    const invList = document.getElementById("inventoryList");
    invList.innerHTML = "";
  
    inventory.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "bg-gray-700 p-2 rounded text-sm flex justify-between items-center";
      
        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.name;
        nameSpan.onmouseover = (e) => showTooltip(formatItemTooltip(item), e.pageX, e.pageY);
        nameSpan.onmouseout = hideTooltip;

      
        const buttonGroup = document.createElement("div");
        buttonGroup.className = "flex gap-2";
      
        const equipBtn = document.createElement("button");
        equipBtn.textContent = "Equip";
        equipBtn.className = "item-btn btn-equip text-xs px-3 py-1";
        equipBtn.onclick = () => equipItemToSlot(item, index);
        equipBtn.onmouseover = (e) => showTooltip(formatItemTooltip(item), e.pageX, e.pageY);
        equipBtn.onmouseout = hideTooltip;
      
        const sellBtn = document.createElement("button");
        sellBtn.textContent = "Sell";
        sellBtn.className = "item-btn btn-sell text-xs px-3 py-1";
        sellBtn.onclick = () => {
          const confirmArea = document.createElement("div");
          confirmArea.className = "text-xs text-gray-300 mt-1";
          confirmArea.innerHTML = `Sell for ${item.value || 0} gold? <button class="text-yellow-400 underline ml-2" onclick="confirmSellItem(${index})">Yes</button>`;
          li.appendChild(confirmArea);
          sellBtn.disabled = true;
        };
        sellBtn.onmouseover = (e) => showTooltip(`Sell for ${item.value || 0} gold`, e.pageX, e.pageY);
        sellBtn.onmouseout = hideTooltip;
      
        buttonGroup.appendChild(equipBtn);
        buttonGroup.appendChild(sellBtn);
      
        li.appendChild(nameSpan);
        li.appendChild(buttonGroup);
        invList.appendChild(li);
      });
      
      renderStatsSummary(character);
      
  }

  window.confirmSellItem = async function (index) {
    const characterId = localStorage.getItem("lastCharacterId");
    const docSnap = await getDoc(doc(db, "characters", characterId));
    if (!docSnap.exists()) return;
  
    const character = docSnap.data();
    const item = character.inventory[index];
    if (!item) return;
  
    // Add gold (could scale with item value)
    character.gold = (character.gold || 0) + (item.value || 0);
  
    // Remove item from inventory
    character.inventory.splice(index, 1);
  
    await saveCharacter(characterId, character);
    renderCharacterScreen(character);
  };
  
  
  function unequipItemFromSlot(slot) {
    const characterId = localStorage.getItem("lastCharacterId");
    getDoc(doc(db, "characters", characterId)).then((docSnap) => {
      if (!docSnap.exists()) return;
      const character = docSnap.data();
      const item = character.equipment[slot];
      if (!item) return;
  
      if (!character.inventory) character.inventory = [];
      character.inventory.push(item);
      character.equipment[slot] = null;
  
      saveCharacter(characterId, character).then(() => renderCharacterScreen(character));
    });
  }

  function formatItemTooltip(item) {
    let lines = [`${item.name} (${item.rarity})`];
    for (const [stat, value] of Object.entries(item.stats || {})) {
      lines.push(`${stat}: +${value}`);
    }
    if (item.value) lines.push(`Sell value: ${item.value} gold`);
    return lines.join('\n');
  }
  
  function equipItemToSlot(item, index) {
    const characterId = localStorage.getItem("lastCharacterId");
    getDoc(doc(db, "characters", characterId)).then((docSnap) => {
      if (!docSnap.exists()) return;
      const character = docSnap.data();
      const slot = item.slot;
  
      if (!character.equipment) character.equipment = {};
      if (!character.inventory) character.inventory = [];
  
      const currentlyEquipped = character.equipment[slot];
      if (currentlyEquipped) character.inventory.push(currentlyEquipped);
  
      character.equipment[slot] = item;
      character.inventory.splice(index, 1);
  
      saveCharacter(characterId, character).then(() => renderCharacterScreen(character));
    });
  }
  window.loadAndShowCharacter = async function () {
    const characterId = localStorage.getItem("lastCharacterId");
    if (!characterId) {
      setInlineMessage("No character selected.", false);
      return;
    }
  
    const docSnap = await getDoc(doc(db, "characters", characterId));
    if (docSnap.exists()) {
      const character = docSnap.data();
      renderCharacterScreen(character);
      showScreen("character");
    } else {
      setInlineMessage("Failed to load character.", false);
    }
  };
  const tooltip = document.getElementById("tooltip");

function showTooltip(text, x, y) {
  tooltip.style.display = "block";
  tooltip.textContent = text;
  tooltip.style.left = x + 15 + "px";
  tooltip.style.top = y + 15 + "px";
}

function hideTooltip() {
  tooltip.style.display = "none";
}

function renderStatsSummary(character) {
    const statsEl = document.getElementById("statsSummary");
    statsEl.innerHTML = "";
  
    // Start with base stats (could come from class later)
    let finalStats = {
      damage: 0,
      strength: 0,
      critChance: 0
    };
  
    // Aggregate stats from equipped items
    Object.values(character.equipment || {}).forEach(item => {
      if (!item || !item.stats) return;
      for (const [key, value] of Object.entries(item.stats)) {
        finalStats[key] = (finalStats[key] || 0) + value;
      }
    });
  
    // Display all non-zero stats
    for (const [stat, value] of Object.entries(finalStats)) {
      if (value !== 0) {
        const li = document.createElement("li");
        li.textContent = `${stat}: ${value}`;
        statsEl.appendChild(li);
      }
    }
  }