import * as THREE from 'three';
import { InputManager } from '../core/InputManager';
import { GAME_CONFIG, LANE_POSITIONS } from './config';
import type { HudSnapshot, LaneIndex } from '../types';

export type ObstacleEntity = {
  mesh: THREE.Object3D;
  lane: LaneIndex;
  z: number;
  type: string;
  hasTriggered: boolean;
};

export type CollectibleEntity = {
  mesh: THREE.Object3D;
  lane: LaneIndex;
  z: number;
  kind: string;
  collected: boolean;
};

export type SafeZoneEntity = {
  mesh: THREE.Object3D;
  lane: LaneIndex;
  z: number;
  active: boolean;
};

export class RunnerGame {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private world = new THREE.Group();
  private roadSegments: THREE.Mesh[] = [];
  private obstacles: ObstacleEntity[] = [];
  private collectibles: CollectibleEntity[] = [];
  private safeZones: SafeZoneEntity[] = [];
  private player: THREE.Group;
  private playerY = 0;
  private verticalVelocity = 0;
  private slideTimer = 0;
  private groundY = 1;
  private currentLane: LaneIndex = 1;
  private targetLane: LaneIndex = 1;
  private destroyed = false;
  private timer = 0;
  private speed = GAME_CONFIG.baseSpeed;
  private score = 0;
  private distance = 0;
  private collectiblesCount = 0;
  private stamina = GAME_CONFIG.staminaMax;
  private chasePressure = 0;
  private powerUp = 'None';
  private nextSpawn = 0;
  private lastHudSent = 0;
  private onHudUpdate: ((snapshot: HudSnapshot) => void) | null = null;
  private onGameOver: (() => void) | null = null;

  constructor(container: HTMLElement, private readonly characterColor: string) {
    this.scene.background = new THREE.Color('#0a1220');
    this.scene.fog = new THREE.Fog('#0a1220', 25, 110);

    this.camera.position.set(0, 6, 12);
    this.camera.lookAt(0, 1.5, 0);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight('#f1f4ff', 1.7);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight('#f5d6a8', 1.5);
    sun.position.set(10, 18, 10);
    sun.castShadow = true;
    this.scene.add(sun);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(150, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#182742', side: THREE.BackSide }),
    );
    this.scene.add(sky);

    const groundGroup = new THREE.Group();
    for (let i = 0; i < 10; i += 1) {
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.5, GAME_CONFIG.worldSegmentLength),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#2a2f39' : '#303744' }),
      );
      segment.position.set(0, -0.7, i * GAME_CONFIG.worldSegmentLength - 20);
      segment.receiveShadow = true;
      groundGroup.add(segment);
      this.roadSegments.push(segment);
    }
    this.world.add(groundGroup);

    for (let i = 0; i < 3; i += 1) {
      const laneMarker = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.15, 6),
        new THREE.MeshStandardMaterial({ color: '#f5efe5' }),
      );
      laneMarker.position.set((i - 1) * 5.8, 0.1, -15);
      this.world.add(laneMarker);
    }

    this.player = this.createPlayer();
    this.player.position.set(0, this.groundY + 0.2, 0);
    this.scene.add(this.player);
    this.scene.add(this.world);

    window.addEventListener('resize', () => this.resize(container));
    this.resize(container);
  }

  bindInput(input: InputManager): void {
    input.on('left', () => this.moveLane(-1));
    input.on('right', () => this.moveLane(1));
    input.on('jump', () => this.jump());
    input.on('slide', () => this.slide());
  }

  setOnHudUpdate(callback: (snapshot: HudSnapshot) => void): void {
    this.onHudUpdate = callback;
  }

  setOnGameOver(callback: () => void): void {
    this.onGameOver = callback;
  }

  start(): void {
    const tick = (time: number) => {
      if (this.destroyed) return;
      const seconds = Math.min((time - (this.timer || time)) / 1000, 0.033);
      this.timer = time;
      this.update(seconds);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  destroy(): void {
    this.destroyed = true;
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  private createPlayer(): THREE.Group {
    const player = new THREE.Group();

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.9, 0.8),
      new THREE.MeshStandardMaterial({ color: this.characterColor, roughness: 0.5 }),
    );
    torso.position.y = 1.8;
    torso.castShadow = true;
    player.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 24, 24),
      new THREE.MeshStandardMaterial({ color: '#f2d5b0', roughness: 0.9 }),
    );
    head.position.y = 3.0;
    head.castShadow = true;
    player.add(head);

    const leg1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 1.3, 0.3),
      new THREE.MeshStandardMaterial({ color: '#182b3d' }),
    );
    leg1.position.set(-0.24, 0.7, 0);
    leg1.castShadow = true;
    player.add(leg1);

    const leg2 = leg1.clone();
    leg2.position.x = 0.24;
    player.add(leg2);

    return player;
  }

  private moveLane(delta: number): void {
    if (this.destroyed) return;
    const next = Math.max(0, Math.min(2, this.currentLane + delta));
    this.targetLane = next as LaneIndex;
  }

  private jump(): void {
    if (this.playerY <= 0.01) {
      this.verticalVelocity = GAME_CONFIG.jumpVelocity;
      this.playerY = 0.01;
    }
  }

  private slide(): void {
    if (this.playerY <= 0.01) {
      this.slideTimer = GAME_CONFIG.slideDuration;
      this.player.scale.y = 0.7;
      this.player.position.y = 1.1;
    }
  }

  private update(dt: number): void {
    this.timer += dt * 1000;
    this.speed = Math.min(GAME_CONFIG.maxSpeed, GAME_CONFIG.baseSpeed + this.distance * 0.012);
    this.distance += this.speed * dt;
    this.score += dt * 20;
    this.chasePressure = Math.max(0, this.chasePressure - GAME_CONFIG.chasePressureDecay * dt * 60);
    this.stamina = Math.min(GAME_CONFIG.staminaMax, this.stamina + dt * 0.8);

    this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, LANE_POSITIONS[this.targetLane], 0.12);
    this.currentLane = this.targetLane;

    if (this.playerY > 0 || this.verticalVelocity > 0) {
      this.verticalVelocity -= GAME_CONFIG.gravity * dt;
      this.playerY += this.verticalVelocity * dt;
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.verticalVelocity = 0;
      }
    }

    this.player.position.y = this.groundY + this.playerY + 0.2;

    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      this.player.scale.y = 0.7;
      this.player.position.y = this.groundY + Math.max(0, this.playerY) + 0.18;
    } else {
      this.player.scale.y = 1;
    }

    for (const segment of this.roadSegments) {
      segment.position.z += this.speed * dt;
      if (segment.position.z > GAME_CONFIG.worldSegmentLength * 2) {
        segment.position.z -= GAME_CONFIG.worldSegmentLength * 10;
      }
    }

    this.spawnWorldObjects();
    this.tickObstacles(dt);
    this.tickCollectibles(dt);
    this.tickSafeZones(dt);

    const now = performance.now();
    if (now - this.lastHudSent > 100) {
      this.lastHudSent = now;
      this.onHudUpdate?.({
        score: Math.round(this.score),
        distance: Math.round(this.distance),
        collectibles: this.collectiblesCount,
        stamina: Math.round(this.stamina),
        chasePressure: Math.round(this.chasePressure),
        powerUp: this.powerUp,
        speed: Math.round(this.speed),
      });
    }
  }

  private spawnWorldObjects(): void {
    if (this.distance < this.nextSpawn) return;
    const lane = Math.floor(Math.random() * 3) as LaneIndex;
    const obstacleTypes = ['barricade', 'barrier', 'cone', 'overhead', 'debris'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const mesh = this.buildObstacle(type);
    mesh.position.set(LANE_POSITIONS[lane], 0.7, -60);
    this.obstacles.push({ mesh, lane, z: -60, type, hasTriggered: false });
    this.scene.add(mesh);

    const collectibleRoll = Math.random();
    if (collectibleRoll > 0.28) {
      const collectibleLane = Math.floor(Math.random() * 3) as LaneIndex;
      const collectibleType = ['marigold', 'magnet', 'shield', 'multiplier', 'stamina'][Math.floor(Math.random() * 5)];
      const item = this.buildCollectible(collectibleType);
      item.position.set(LANE_POSITIONS[collectibleLane], 1.8, -45);
      this.collectibles.push({ mesh: item, lane: collectibleLane, z: -45, kind: collectibleType, collected: false });
      this.scene.add(item);
    }

    const safeLane = Math.floor(Math.random() * 3) as LaneIndex;
    const safeZone = this.buildSafeZone();
    safeZone.position.set(LANE_POSITIONS[safeLane], 0.6, -80);
    this.safeZones.push({ mesh: safeZone, lane: safeLane, z: -80, active: false });
    this.scene.add(safeZone);

    this.nextSpawn = this.distance + 18 + Math.random() * 12;
  }

  private tickObstacles(dt: number): void {
    for (const obstacle of this.obstacles) {
      obstacle.z += this.speed * dt;
      obstacle.mesh.position.z = obstacle.z;

      const playerX = this.player.position.x;
      const dx = Math.abs(playerX - LANE_POSITIONS[obstacle.lane]);
      const dz = Math.abs(obstacle.z - 0);

      if (dz < 1.4 && dx < 1.3 && !obstacle.hasTriggered) {
        obstacle.hasTriggered = true;
        const isJumpClear = this.playerY > 1.4 && obstacle.type !== 'overhead';
        const isSlideClear = this.slideTimer > 0.05 && obstacle.type === 'overhead';
        if (!isJumpClear && !isSlideClear) {
          this.chasePressure = Math.min(100, this.chasePressure + 22);
          this.stamina = Math.max(0, this.stamina - 18);
          if (this.chasePressure >= 100 || this.stamina <= 0) {
            this.onGameOver?.();
          }
        }
      }

      if (obstacle.z > 30) {
        this.scene.remove(obstacle.mesh);
      }
    }
    this.obstacles = this.obstacles.filter((item) => item.z <= 30);
  }

  private tickCollectibles(dt: number): void {
    for (const item of this.collectibles) {
      item.z += this.speed * dt;
      item.mesh.position.z = item.z;
      item.mesh.rotation.y += dt * 4;

      const dx = Math.abs(this.player.position.x - LANE_POSITIONS[item.lane]);
      const dz = Math.abs(item.z - 0);

      if (!item.collected && dz < 1.6 && dx < 1.5) {
        item.collected = true;
        this.collectiblesCount += 1;
        this.score += 80;
        this.stamina = Math.min(GAME_CONFIG.staminaMax, this.stamina + 10);
        this.powerUp = item.kind;
        if (item.kind === 'shield') this.chasePressure = Math.max(0, this.chasePressure - 12);
        if (item.kind === 'stamina') this.stamina = GAME_CONFIG.staminaMax;
      }

      if (item.collected || item.z > 30) {
        this.scene.remove(item.mesh);
      }
    }
    this.collectibles = this.collectibles.filter((item) => !item.collected && item.z <= 30);
  }

  private tickSafeZones(dt: number): void {
    for (const zone of this.safeZones) {
      zone.z += this.speed * dt;
      zone.mesh.position.z = zone.z;
      zone.mesh.rotation.y += dt * 2;

      const dx = Math.abs(this.player.position.x - LANE_POSITIONS[zone.lane]);
      const dz = Math.abs(zone.z - 0);
      if (!zone.active && dz < 1.8 && dx < 1.8) {
        zone.active = true;
        this.stamina = Math.min(GAME_CONFIG.staminaMax, this.stamina + GAME_CONFIG.safeZoneRestore);
        this.chasePressure = Math.max(0, this.chasePressure - 32);
        this.score += 150;
      }

      if (zone.z > 30) {
        this.scene.remove(zone.mesh);
      }
    }
    this.safeZones = this.safeZones.filter((zone) => !zone.active && zone.z <= 30);
  }

  private buildObstacle(type: string): THREE.Object3D {
    const object = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({ color: type === 'overhead' ? '#d7b470' : '#d96d4b', roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, type === 'overhead' ? 1.3 : 1.8, 1.6), material);
    body.castShadow = true;
    object.add(body);

    if (type === 'cone') {
      body.scale.set(0.7, 1.5, 0.7);
      body.position.y = 0.8;
    }

    if (type === 'overhead') {
      body.position.y = 2.2;
      body.scale.set(2.1, 0.9, 1.2);
    }

    if (type === 'barricade') {
      body.scale.set(1.5, 1.4, 1.2);
      body.position.y = 0.9;
    }

    return object;
  }

  private buildCollectible(kind: string): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.8, 0),
      new THREE.MeshStandardMaterial({
        color: kind === 'magnet' ? '#5ee7ff' : kind === 'shield' ? '#8dd7ff' : kind === 'multiplier' ? '#ffd665' : kind === 'stamina' ? '#8af0ae' : '#f6b85b',
        emissive: kind === 'magnet' ? '#1d4a65' : '#16283c',
      }),
    );
    mesh.castShadow = true;
    return mesh;
  }

  private buildSafeZone(): THREE.Object3D {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: '#4cc3b0', emissive: '#0d2d2b' }),
    );
    frame.position.y = 0.2;
    group.add(frame);

    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ color: '#f3e9d9' }),
    );
    line.position.y = 1.3;
    group.add(line);
    return group;
  }
}
