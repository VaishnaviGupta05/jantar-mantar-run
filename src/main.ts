import './styles.css';
import * as THREE from 'three';
import { EventBus } from './core/EventBus';
import { GameStateManager } from './core/GameState';
import { InputManager } from './core/InputManager';
import { SaveSystem } from './core/SaveSystem';
import { AudioManager } from './core/AudioManager';
import { CHARACTER_DEFS } from './game/config';
import { RunnerGame } from './game/RunnerGame';
import type { CharacterDef, HudSnapshot } from './types';

const app = document.querySelector('#app');
if (!app) throw new Error('App root not found.');

const save = SaveSystem.load();
const eventBus = new EventBus();
const state = new GameStateManager();
const input = new InputManager();
const audio = new AudioManager();
let currentGame: RunnerGame | null = null;

app.innerHTML = `
  <div class="ui-layer">
    <div id="menu-screen" class="screen visible">
      <div class="panel hero">
        <div class="hero-copy">
          <div class="brand-row"><span class="logo-mark">JM</span><span>Jantar Mantar</span></div>
          <h1>Run the City.</h1>
          <p class="subtitle">A premium endless runner set in the energy and rhythm of Indian urban streets — where marigold tokens, chase pressure, and sharp reflexes decide every run.</p>
          <div class="pill-row">
            <span class="pill">3-lane runner</span>
            <span class="pill">Chase pressure</span>
            <span class="pill">Reporter safe zones</span>
          </div>
          <div class="action-row">
            <button id="play-btn" class="primary-btn">Play Now</button>
            <button id="character-btn" class="secondary-btn">Characters</button>
            <button id="settings-btn" class="ghost-btn">Settings</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="preview-card">
            <div class="preview-skyline"></div>
            <div class="preview-road"></div>
            <div class="preview-player"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="character-screen" class="screen">
      <div class="panel">
        <div class="screen-header">
          <h2>Choose Runner</h2>
          <button id="back-menu-btn" class="ghost-btn">Back</button>
        </div>
        <div id="character-grid" class="character-card-grid"></div>
      </div>
    </div>

    <div id="results-screen" class="screen">
      <div class="panel">
        <div class="screen-header">
          <h2>Run Results</h2>
        </div>
        <div class="grid">
          <div class="reward-grid">
            <div class="reward-card"><h3>Final Score</h3><p id="result-score">0</p></div>
            <div class="reward-card"><h3>Distance</h3><p id="result-distance">0m</p></div>
            <div class="reward-card"><h3>Collectibles</h3><p id="result-collectibles">0</p></div>
          </div>
          <div class="action-row">
            <button id="retry-btn" class="primary-btn">Retry</button>
            <button id="results-menu-btn" class="secondary-btn">Main Menu</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="hud" class="hud">
    <div class="hud-top">
      <div class="score-box">
        <div class="metric"><span class="metric-label">Score</span><span id="hud-score" class="metric-value">0</span></div>
        <div class="metric"><span class="metric-label">Distance</span><span id="hud-distance" class="metric-value">0m</span></div>
        <div class="metric"><span class="metric-label">Tokens</span><span id="hud-collectibles" class="metric-value">0</span></div>
      </div>
      <div class="chase-box">
        <div class="mini-row"><span>Chase Pressure</span><span id="hud-pressure">0%</span></div>
        <div class="bar"><span id="hud-pressure-bar" class="bar-fill"></span></div>
      </div>
    </div>
    <div class="hud-bottom">
      <div class="hud-badge">Stamina <strong id="hud-stamina">100%</strong></div>
      <div class="hud-badge">Power <strong id="hud-power">None</strong></div>
      <div class="hud-badge">Speed <strong id="hud-speed">20</strong></div>
    </div>
  </div>
`;

const menuScreen = document.getElementById('menu-screen');
const characterScreen = document.getElementById('character-screen');
const resultsScreen = document.getElementById('results-screen');
const hud = document.getElementById('hud');
const playBtn = document.getElementById('play-btn');
const characterBtn = document.getElementById('character-btn');
const settingsBtn = document.getElementById('settings-btn');
const backMenuBtn = document.getElementById('back-menu-btn');
const retryBtn = document.getElementById('retry-btn');
const resultsMenuBtn = document.getElementById('results-menu-btn');
const characterGrid = document.getElementById('character-grid');

function setScreen(screen: 'menu' | 'character' | 'results'): void {
  const screens = [menuScreen, characterScreen, resultsScreen];
  screens.forEach((element) => element?.classList.remove('visible'));
  if (screen === 'menu') menuScreen?.classList.add('visible');
  if (screen === 'character') characterScreen?.classList.add('visible');
  if (screen === 'results') resultsScreen?.classList.add('visible');
  hud?.classList.toggle('visible', screen === 'menu' ? false : false);
}

function updateCharacterSelection(): void {
  if (!characterGrid) return;
  characterGrid.innerHTML = CHARACTER_DEFS.map((char) => {
    const isSelected = save.selectedCharacter === char.id;
    const isUnlocked = char.unlocked || save.unlockedCharacters.includes(char.id);
    return `
      <button class="character-card ${isSelected ? 'selected' : ''} ${isUnlocked ? '' : 'locked'}" data-character="${char.id}">
        <div class="character-box"><div class="character-body" style="background: linear-gradient(180deg, ${char.color}, #d97b46);"></div></div>
        <h3>${char.name}</h3>
        <p>${char.description}</p>
        <div class="mini-row">
          <span>${isUnlocked ? 'Unlocked' : `Unlock ${char.unlockCost} coins`}</span>
          <span>${isSelected ? 'Selected' : 'Select'}</span>
        </div>
      </button>
    `;
  }).join('');

  characterGrid.querySelectorAll<HTMLButtonElement>('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.character;
      if (!id) return;
      const template = CHARACTER_DEFS.find((entry) => entry.id === id);
      if (!template) return;
      const isUnlocked = template.unlocked || save.unlockedCharacters.includes(id);
      if (!isUnlocked) {
        if (save.currency >= template.unlockCost) {
          save.currency -= template.unlockCost;
          save.unlockedCharacters.push(id);
          SaveSystem.save(save);
        }
      }
      save.selectedCharacter = id;
      SaveSystem.save(save);
      updateCharacterSelection();
    });
  });
}

function startRun(): void {
  state.resetRun();
  setScreen('menu');
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.inset = '0';
  container.style.zIndex = '1';
  app.appendChild(container);

  const characterColor = CHARACTER_DEFS.find((character) => character.id === save.selectedCharacter)?.color ?? '#f6c76f';
  currentGame = new RunnerGame(container, characterColor);
  currentGame.bindInput(input);
  currentGame.setOnHudUpdate((snapshot: HudSnapshot) => {
    document.getElementById('hud-score')!.textContent = String(snapshot.score);
    document.getElementById('hud-distance')!.textContent = `${snapshot.distance}m`;
    document.getElementById('hud-collectibles')!.textContent = String(snapshot.collectibles);
    document.getElementById('hud-stamina')!.textContent = `${snapshot.stamina}%`;
    document.getElementById('hud-pressure')!.textContent = `${snapshot.chasePressure}%`;
    document.getElementById('hud-pressure-bar')!.style.width = `${snapshot.chasePressure}%`;
    document.getElementById('hud-power')!.textContent = snapshot.powerUp;
    document.getElementById('hud-speed')!.textContent = String(snapshot.speed);
  });
  currentGame.setOnGameOver(() => {
    const snapshot = state.getSnapshot();
    document.getElementById('result-score')!.textContent = String(Math.round(snapshot.score || 0));
    document.getElementById('result-distance')!.textContent = `${Math.round(snapshot.distance || 0)}m`;
    document.getElementById('result-collectibles')!.textContent = String(snapshot.collectibles || 0);
    setScreen('results');
    if (currentGame) {
      currentGame.destroy();
      currentGame = null;
    }
  });
  currentGame.start();
  hud?.classList.add('visible');
  eventBus.emit('game:start');
}

playBtn?.addEventListener('click', startRun);
characterBtn?.addEventListener('click', () => {
  setScreen('character');
  updateCharacterSelection();
});
settingsBtn?.addEventListener('click', () => {
  const quality = save.settings.quality;
  const rate = save.settings.music;
  audio.init();
  audio.setEnabled(rate > 0);
  alert(`Settings loaded — quality: ${quality}, music: ${rate}`);
});
backMenuBtn?.addEventListener('click', () => setScreen('menu'));
retryBtn?.addEventListener('click', startRun);
resultsMenuBtn?.addEventListener('click', () => {
  setScreen('menu');
  hud?.classList.remove('visible');
});

updateCharacterSelection();
setScreen('menu');
