// Shadowrun 6e Application JavaScript
// Author: MiniMax Agent

// Global variables and constants
let currentSection = 'dice-calculator';
let skillCounter = 0;
let specCounter = 0;
let currentTurn = 0;
let initiativeList = [];

// Character data structure
let currentCharacter = {
    name: '',
    attributes: {
        strength: 3,
        agility: 3,
        reaction: 3,
        body: 3,
        charisma: 3,
        intuition: 3,
        logic: 3,
        willpower: 3
    },
    edge: 1,
    skills: [],
    specializations: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupDiceCalculator();
    setupCharacterCreator();
    setupInitiativeTracker();
    setupCharacterList();
    loadSavedCharacters();
    console.log('Shadowrun 6e Application initialized successfully');
}

// Navigation System
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            switchSection(targetSection);
        });
    });
}

function switchSection(sectionId) {
    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Update content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    currentSection = sectionId;
    
    // Special handling for character list
    if (sectionId === 'character-list') {
        loadSavedCharacters();
    }
}

// Dice Calculator
function setupDiceCalculator() {
    const rollButton = document.getElementById('roll-dice');
    const clearButton = document.getElementById('clear-dice');
    
    rollButton.addEventListener('click', rollDice);
    clearButton.addEventListener('click', clearDice);
}

function rollDice() {
    const dicePool = parseInt(document.getElementById('dice-pool').value);
    const threshold = parseInt(document.getElementById('threshold').value) || null;
    const useEdge = document.getElementById('edge-use').checked;
    
    if (dicePool < 1 || dicePool > 50) {
        alert('Pool de dados deve estar entre 1 e 50');
        return;
    }
    
    // Roll dice
    let dice = [];
    for (let i = 0; i < dicePool; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Apply edge if selected
    if (useEdge) {
        dice = applyEdge(dice);
    }
    
    // Calculate results
    const result = calculateSuccesses(dice, threshold);
    
    // Display results
    displayDiceResults(dice, result, useEdge);
}

function applyEdge(dice) {
    return dice.map(value => {
        if (value <= 2) {
            return Math.floor(Math.random() * 6) + 1;
        }
        return value;
    });
}

function calculateSuccesses(dice, threshold) {
    const successThreshold = threshold || 5;
    const successes = dice.filter(d => d >= successThreshold).length;
    const ones = dice.filter(d => d === 1).length;
    const glitchThreshold = Math.ceil(dice.length / 2);
    
    let glitch = false;
    let criticalGlitch = false;
    
    if (ones >= glitchThreshold && successes === 0) {
        glitch = true;
        if (ones === dice.length) {
            criticalGlitch = true;
        }
    }
    
    return {
        successes,
        glitch,
        criticalGlitch,
        glitchThreshold,
        totalDice: dice.length
    };
}

function displayDiceResults(dice, result, usedEdge) {
    const resultsPanel = document.getElementById('dice-results');
    const diceValues = document.getElementById('dice-values');
    const successCount = document.getElementById('success-count');
    const glitchWarning = document.getElementById('glitch-warning');
    const criticalGlitchWarning = document.getElementById('critical-glitch-warning');
    const rollTime = document.getElementById('roll-time');
    const poolCount = document.getElementById('pool-count');
    
    // Update time
    const now = new Date();
    rollTime.textContent = now.toLocaleTimeString('pt-BR');
    
    // Update pool count
    poolCount.textContent = result.totalDice;
    
    // Clear previous dice
    diceValues.innerHTML = '';
    
    // Display individual dice
    dice.forEach((value, index) => {
        const diceElement = document.createElement('div');
        diceElement.className = 'dice-value';
        diceElement.textContent = value;
        
        if (value >= 5) {
            diceElement.classList.add('success');
        }
        if (value === 1) {
            diceElement.classList.add('one');
        }
        
        diceValues.appendChild(diceElement);
    });
    
    // Update success count
    successCount.textContent = result.successes;
    
    // Show/hide glitch warnings
    if (result.criticalGlitch) {
        criticalGlitchWarning.style.display = 'flex';
        glitchWarning.style.display = 'none';
    } else if (result.glitch) {
        criticalGlitchWarning.style.display = 'none';
        glitchWarning.style.display = 'flex';
    } else {
        criticalGlitchWarning.style.display = 'none';
        glitchWarning.style.display = 'none';
    }
    
    // Add edge indicator if used
    if (usedEdge) {
        const edgeIndicator = document.createElement('div');
        edgeIndicator.className = 'edge-indicator';
        edgeIndicator.textContent = 'Edge Used';
        edgeIndicator.style.cssText = 'color: #ffff00; font-size: 0.8em; text-align: center; margin-top: 10px;';
        diceValues.parentNode.appendChild(edgeIndicator);
    }
    
    // Show results panel
    resultsPanel.style.display = 'block';
    resultsPanel.scrollIntoView({ behavior: 'smooth' });
}

function clearDice() {
    document.getElementById('dice-results').style.display = 'none';
    document.getElementById('dice-pool').value = 5;
    document.getElementById('threshold').value = '';
    document.getElementById('edge-use').checked = false;
}

// Character Creator
function setupCharacterCreator() {
    // Attribute inputs
    const attrInputs = document.querySelectorAll('.attr-input');
    attrInputs.forEach(input => {
        input.addEventListener('change', updateCharacterFromForm);
    });
    
    // Edge controls
    const edgeButtons = document.querySelectorAll('.edge-btn');
    edgeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            adjustEdge(action);
        });
    });
    
    // Skills
    const addSkillButton = document.getElementById('add-skill');
    addSkillButton.addEventListener('click', addSkill);
    
    // Specializations
    const addSpecButton = document.getElementById('add-specialization');
    addSpecButton.addEventListener('click', addSpecialization);
    
    // Character actions
    document.getElementById('save-character').addEventListener('click', saveCharacter);
    document.getElementById('load-character').addEventListener('click', loadCharacter);
    document.getElementById('new-character').addEventListener('click', newCharacter);
    
    // Character name
    document.getElementById('character-name').addEventListener('input', updateCharacterFromForm);
    
    // Load current character
    updateFormFromCharacter();
}

function updateCharacterFromForm() {
    const name = document.getElementById('character-name').value;
    currentCharacter.name = name;
    
    // Update attributes
    const attrInputs = document.querySelectorAll('.attr-input');
    attrInputs.forEach(input => {
        const attr = input.getAttribute('data-attr');
        const value = parseInt(input.value) || 0;
        currentCharacter.attributes[attr] = Math.max(1, Math.min(6, value));
    });
}

function updateFormFromCharacter() {
    document.getElementById('character-name').value = currentCharacter.name;
    
    const attrInputs = document.querySelectorAll('.attr-input');
    attrInputs.forEach(input => {
        const attr = input.getAttribute('data-attr');
        input.value = currentCharacter.attributes[attr] || 3;
    });
    
    document.getElementById('edge-value').textContent = currentCharacter.edge;
    
    // Update skills
    updateSkillsDisplay();
    updateSpecializationsDisplay();
}

function adjustEdge(action) {
    if (action === 'increase' && currentCharacter.edge < 7) {
        currentCharacter.edge++;
    } else if (action === 'decrease' && currentCharacter.edge > 0) {
        currentCharacter.edge--;
    }
    
    document.getElementById('edge-value').textContent = currentCharacter.edge;
}

function addSkill() {
    const container = document.querySelector('.skills-container');
    const newSkill = document.createElement('div');
    newSkill.className = 'skill-row';
    newSkill.innerHTML = `
        <input type="text" class="skill-name" placeholder="Nome da perícia" data-skill="${skillCounter}">
        <input type="number" class="skill-rating" placeholder="Rating" min="0" max="12" value="0" data-skill="${skillCounter}">
        <button class="remove-skill" data-skill="${skillCounter}">✖</button>
    `;
    
    container.appendChild(newSkill);
    
    // Add event listeners
    const skillInputs = newSkill.querySelectorAll('input');
    skillInputs.forEach(input => {
        input.addEventListener('input', updateSkillsFromForm);
    });
    
    const removeButton = newSkill.querySelector('.remove-skill');
    removeButton.addEventListener('click', function() {
        removeSkill(parseInt(this.getAttribute('data-skill')));
    });
    
    skillCounter++;
    updateSkillsFromForm();
}

function updateSkillsFromForm() {
    currentCharacter.skills = [];
    const skillRows = document.querySelectorAll('.skill-row');
    
    skillRows.forEach(row => {
        const name = row.querySelector('.skill-name').value.trim();
        const rating = parseInt(row.querySelector('.skill-rating').value) || 0;
        
        if (name) {
            currentCharacter.skills.push({
                name: name,
                rating: Math.max(0, Math.min(12, rating))
            });
        }
    });
}

function removeSkill(skillIndex) {
    const skillRows = document.querySelectorAll('.skill-row');
    if (skillRows[skillIndex]) {
        skillRows[skillIndex].remove();
        updateSkillsFromForm();
    }
}

function updateSkillsDisplay() {
    const container = document.querySelector('.skills-container');
    container.innerHTML = '';
    
    currentCharacter.skills.forEach((skill, index) => {
        const skillRow = document.createElement('div');
        skillRow.className = 'skill-row';
        skillRow.innerHTML = `
            <input type="text" class="skill-name" placeholder="Nome da perícia" data-skill="${index}" value="${skill.name}">
            <input type="number" class="skill-rating" placeholder="Rating" min="0" max="12" value="${skill.rating}" data-skill="${index}">
            <button class="remove-skill" data-skill="${index}">✖</button>
        `;
        
        container.appendChild(skillRow);
        
        // Add event listeners
        const inputs = skillRow.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', updateSkillsFromForm);
        });
        
        const removeButton = skillRow.querySelector('.remove-skill');
        removeButton.addEventListener('click', function() {
            removeSkill(index);
        });
    });
    
    skillCounter = currentCharacter.skills.length;
}

function addSpecialization() {
    const container = document.querySelector('.specializations-container');
    const newSpec = document.createElement('div');
    newSpec.className = 'spec-row';
    newSpec.innerHTML = `
        <input type="text" class="spec-name" placeholder="Perícia" data-spec="${specCounter}">
        <input type="text" class="spec-area" placeholder="Área de especialização" data-spec="${specCounter}">
        <button class="remove-spec" data-spec="${specCounter}">✖</button>
    `;
    
    container.appendChild(newSpec);
    
    // Add event listeners
    const specInputs = newSpec.querySelectorAll('input');
    specInputs.forEach(input => {
        input.addEventListener('input', updateSpecializationsFromForm);
    });
    
    const removeButton = newSpec.querySelector('.remove-spec');
    removeButton.addEventListener('click', function() {
        removeSpecialization(parseInt(this.getAttribute('data-spec')));
    });
    
    specCounter++;
    updateSpecializationsFromForm();
}

function updateSpecializationsFromForm() {
    currentCharacter.specializations = [];
    const specRows = document.querySelectorAll('.spec-row');
    
    specRows.forEach(row => {
        const skill = row.querySelector('.spec-name').value.trim();
        const area = row.querySelector('.spec-area').value.trim();
        
        if (skill && area) {
            currentCharacter.specializations.push({
                skill: skill,
                area: area
            });
        }
    });
}

function removeSpecialization(specIndex) {
    const specRows = document.querySelectorAll('.spec-row');
    if (specRows[specIndex]) {
        specRows[specIndex].remove();
        updateSpecializationsFromForm();
    }
}

function updateSpecializationsDisplay() {
    const container = document.querySelector('.specializations-container');
    container.innerHTML = '';
    
    currentCharacter.specializations.forEach((spec, index) => {
        const specRow = document.createElement('div');
        specRow.className = 'spec-row';
        specRow.innerHTML = `
            <input type="text" class="spec-name" placeholder="Perícia" data-spec="${index}" value="${spec.skill}">
            <input type="text" class="spec-area" placeholder="Área de especialização" data-spec="${index}" value="${spec.area}">
            <button class="remove-spec" data-spec="${index}">✖</button>
        `;
        
        container.appendChild(specRow);
        
        // Add event listeners
        const inputs = specRow.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', updateSpecializationsFromForm);
        });
        
        const removeButton = specRow.querySelector('.remove-spec');
        removeButton.addEventListener('click', function() {
            removeSpecialization(index);
        });
    });
    
    specCounter = currentCharacter.specializations.length;
}

function saveCharacter() {
    updateCharacterFromForm();
    
    if (!currentCharacter.name.trim()) {
        alert('Por favor, insira um nome para o personagem');
        return;
    }
    
    // Validate attributes
    const attrValues = Object.values(currentCharacter.attributes);
    const minAttr = Math.min(...attrValues);
    const maxAttr = Math.max(...attrValues);
    
    if (minAttr < 1 || maxAttr > 6) {
        alert('Todos os atributos devem estar entre 1 e 6');
        return;
    }
    
    // Save to localStorage
    const savedCharacters = getSavedCharacters();
    const existingIndex = savedCharacters.findIndex(c => c.name === currentCharacter.name);
    
    if (existingIndex >= 0) {
        if (!confirm('Personagem com este nome já existe. Deseja sobrescrever?')) {
            return;
        }
        savedCharacters[existingIndex] = currentCharacter;
    } else {
        savedCharacters.push(currentCharacter);
    }
    
    localStorage.setItem('shadowrun_characters', JSON.stringify(savedCharacters));
    
    alert('Personagem salvo com sucesso!');
    loadSavedCharacters();
}

function loadCharacter() {
    updateCharacterFromForm();
    
    if (!currentCharacter.name.trim()) {
        alert('Por favor, insira um nome para carregar o personagem');
        return;
    }
    
    const savedCharacters = getSavedCharacters();
    const character = savedCharacters.find(c => c.name === currentCharacter.name);
    
    if (character) {
        currentCharacter = character;
        updateFormFromCharacter();
        alert('Personagem carregado com sucesso!');
    } else {
        alert('Personagem não encontrado');
    }
}

function newCharacter() {
    if (confirm('Deseja criar um novo personagem? Todas as alterações não salvas serão perdidas.')) {
        currentCharacter = {
            name: '',
            attributes: {
                strength: 3,
                agility: 3,
                reaction: 3,
                body: 3,
                charisma: 3,
                intuition: 3,
                logic: 3,
                willpower: 3
            },
            edge: 1,
            skills: [],
            specializations: []
        };
        
        updateFormFromCharacter();
        skillCounter = 0;
        specCounter = 0;
    }
}

function getSavedCharacters() {
    const saved = localStorage.getItem('shadowrun_characters');
    return saved ? JSON.parse(saved) : [];
}

// Initiative Tracker
function setupInitiativeTracker() {
    document.getElementById('add-initiative').addEventListener('click', addInitiative);
    document.getElementById('sort-initiative').addEventListener('click', sortInitiative);
    document.getElementById('clear-initiative').addEventListener('click', clearInitiative);
    document.getElementById('next-turn').addEventListener('click', nextTurn);
}

function addInitiative() {
    const name = document.getElementById('init-name').value.trim();
    const value = parseInt(document.getElementById('init-value').value);
    
    if (!name) {
        alert('Por favor, insira um nome');
        return;
    }
    
    if (isNaN(value)) {
        alert('Por favor, insira um valor de iniciativa válido');
        return;
    }
    
    const initiative = {
        id: Date.now(),
        name: name,
        value: value,
        edge: 0
    };
    
    initiativeList.push(initiative);
    displayInitiativeList();
    updateTurnCounter();
    
    // Clear inputs
    document.getElementById('init-name').value = '';
    document.getElementById('init-value').value = '';
}

function displayInitiativeList() {
    const container = document.getElementById('initiative-list');
    container.innerHTML = '';
    
    initiativeList.forEach((initiative, index) => {
        const item = document.createElement('div');
        item.className = 'initiative-item';
        if (index === currentTurn) {
            item.classList.add('current-turn');
        }
        
        item.innerHTML = `
            <div class="initiative-name">${initiative.name}</div>
            <div class="initiative-value">${initiative.value}</div>
            <button class="edge-btn" onclick="adjustInitiativeEdge(${index}, 'increase')">+</button>
            <button class="remove-initiative" onclick="removeInitiative(${index})">Remover</button>
        `;
        
        container.appendChild(item);
    });
}

function adjustInitiativeEdge(index, action) {
    if (action === 'increase') {
        initiativeList[index].edge++;
    } else if (action === 'decrease' && initiativeList[index].edge > 0) {
        initiativeList[index].edge--;
    }
    
    displayInitiativeList();
}

function removeInitiative(index) {
    if (confirm('Remover este personagem da iniciativa?')) {
        initiativeList.splice(index, 1);
        
        // Adjust current turn if necessary
        if (currentTurn >= initiativeList.length && currentTurn > 0) {
            currentTurn = 0;
        }
        
        displayInitiativeList();
        updateTurnCounter();
    }
}

function sortInitiative() {
    initiativeList.sort((a, b) => b.value - a.value);
    currentTurn = 0;
    displayInitiativeList();
    updateTurnCounter();
}

function clearInitiative() {
    if (confirm('Limpar toda a lista de iniciativa?')) {
        initiativeList = [];
        currentTurn = 0;
        displayInitiativeList();
        updateTurnCounter();
    }
}

function nextTurn() {
    if (initiativeList.length === 0) {
        alert('Nenhum personagem na iniciativa');
        return;
    }
    
    currentTurn = (currentTurn + 1) % initiativeList.length;
    displayInitiativeList();
    updateTurnCounter();
}

function updateTurnCounter() {
    document.getElementById('current-turn').textContent = initiativeList.length > 0 ? (currentTurn + 1) : '-';
    document.getElementById('total-turns').textContent = initiativeList.length;
}

// Character List Management
function setupCharacterList() {
    document.getElementById('clear-all-characters').addEventListener('click', clearAllCharacters);
}

function loadSavedCharacters() {
    const characters = getSavedCharacters();
    const container = document.getElementById('saved-characters');
    container.innerHTML = '';
    
    if (characters.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhum personagem salvo</p>';
        return;
    }
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        // Calculate total skills rating
        const totalSkillRating = character.skills.reduce((sum, skill) => sum + (skill.rating || 0), 0);
        
        card.innerHTML = `
            <div class="character-name">${character.name}</div>
            <div class="character-stats">
                <div class="stat-row">
                    <span class="stat-label">Edge:</span>
                    <span class="stat-value">${character.edge}/7</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Perícias:</span>
                    <span class="stat-value">${character.skills.length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Rating Total:</span>
                    <span class="stat-value">${totalSkillRating}</span>
                </div>
            </div>
            <div class="character-actions">
                <button class="cyber-btn small" onclick="loadCharacterToForm('${character.name}')">Carregar</button>
                <button class="cyber-btn small danger" onclick="deleteCharacter('${character.name}')">Excluir</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function loadCharacterToForm(characterName) {
    const characters = getSavedCharacters();
    const character = characters.find(c => c.name === characterName);
    
    if (character) {
        switchSection('character-creator');
        currentCharacter = character;
        updateFormFromCharacter();
        alert(`Personagem "${characterName}" carregado para edição`);
    }
}

function deleteCharacter(characterName) {
    if (confirm(`Excluir personagem "${characterName}"?`)) {
        const characters = getSavedCharacters();
        const filteredCharacters = characters.filter(c => c.name !== characterName);
        localStorage.setItem('shadowrun_characters', JSON.stringify(filteredCharacters));
        loadSavedCharacters();
        alert(`Personagem "${characterName}" excluído`);
    }
}

function clearAllCharacters() {
    if (confirm('ATENÇÃO: Isso excluirá TODOS os personagens salvos. Esta ação não pode ser desfeita. Continuar?')) {
        localStorage.removeItem('shadowrun_characters');
        loadSavedCharacters();
        alert('Todos os personagens foram excluídos');
    }
}

// Utility Functions
function formatDateTime(date) {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save character
    if (e.ctrlKey && e.key === 's' && currentSection === 'character-creator') {
        e.preventDefault();
        saveCharacter();
    }
    
    // Enter to roll dice
    if (e.key === 'Enter' && currentSection === 'dice-calculator') {
        e.preventDefault();
        rollDice();
    }
    
    // Arrow keys for navigation
    if (e.altKey) {
        const sections = ['dice-calculator', 'character-creator', 'initiative-tracker', 'character-list'];
        const currentIndex = sections.indexOf(currentSection);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            switchSection(sections[currentIndex - 1]);
        } else if (e.key === 'ArrowRight' && currentIndex < sections.length - 1) {
            switchSection(sections[currentIndex + 1]);
        }
    }
});

// Export functions for global access
window.adjustInitiativeEdge = adjustInitiativeEdge;
window.loadCharacterToForm = loadCharacterToForm;
window.deleteCharacter = deleteCharacter;

// Console information
console.log('%cShadowrun 6e Digital Table', 'color: #00ff00; font-size: 20px; font-weight: bold;');
console.log('%cApplication loaded successfully!', 'color: #00ff00;');
console.log('%cKeyboard shortcuts:', 'color: #ff0000; font-weight: bold;');
console.log('- Ctrl+S: Save character');
console.log('- Enter: Roll dice (in dice calculator)');
console.log('- Alt+Left/Right: Navigate sections');
console.log('%cDeveloped by MiniMax Agent', 'color: #666; font-size: 12px;');