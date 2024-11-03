import { BaseScene } from "./base-scene.js";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { SoundManager } from "./sound-manager.js";
import { distance } from "three/webgpu";

export class GameScene extends BaseScene {
  constructor(sceneManager, bodyPart) {
    super(sceneManager);
    this.bodyPart = bodyPart;

    // Game entities
    this.player = null;
    this.vessel = null;
    this.bloodCells = [];
    this.livesText = null;

    // Game state
    this.info = {
      "Head": {
        speed: 0.2,
        playerSpeed: 0.15,
        lives: 3,
        distance: 1000,
      },
      "Legs": {
        speed: 0.3,
        playerSpeed: 0.2,
        lives: 2,
        distance: 700,
      },
      "Chest": {
        speed: 0.4,
        playerSpeed: 0.25,
        lives: 3,
        distance: 600,
      },
      "Left Arm": {
        speed: 0.5,
        playerSpeed: 0.3,
        lives: 3,
        distance: 600,
      },
      "Right Arm": {
        speed: 0.4,
        playerSpeed: 0.35,
        lives: 2,
        distance: 600,
      },
    };
    this.lives = this.info[this.bodyPart].lives;
    this.hasCollided = false;
    this.isPaused = false;
    this.distance = 0;

    // Movement state
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;

    // Interval ID for blood cell spawning
    this.intervalId = null;

    // Sound management
    this.soundManager = null;
  }

  async init() {
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 10);

    // Initialize sound manager
    this.soundManager = new SoundManager(this.camera, () => this.isPaused);

    // Lives text setup
    this.livesText = new Text();
    this.livesText.text = `Lives: ${this.lives}`;
    this.livesText.color = 0xffffff;
    this.livesText.fontSize = 1;
    this.livesText.position.set(-5, 5, 0);
    this.scene.add(this.livesText);

    // Lighting setup
    const light = new THREE.PointLight(0xffffff, 140);
    light.position.set(0, 0, -15);
    light.lookAt(0, 0, 0);
    this.scene.add(light);

    const light2 = new THREE.PointLight(0xffffff, 140);
    light2.position.set(0, 0, 15);
    light2.lookAt(0, 0, 0);
    this.scene.add(light2);

    // Load models
    await Promise.all([this.loadPlayer(), this.loadVessel()]);

    // Setup controls
    this.setupControls();

    // Setup event listeners
    this.setupEventListeners();

    // Start spawning blood cells
    this.intervalId = setInterval(() => this.spawnBloodCell(), 500);

    // Start ambient sound
    this.soundManager.playAmbientSound();
  }

  async loadPlayer() {
    const loader = new GLTFLoader();
    try {
      const gltf = await this.loadModel(
        loader,
        "Pathogen-Surge/assets/models/virus.glb"
      );
      this.player = gltf;

      this.player.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.player.position.set(0, 0, 0);
      this.player.scale.set(0.5, 0.5, 0.5);
      this.player.rotation.y = (Math.PI * 3) / 2;

      this.scene.add(this.player);
    } catch (error) {
      console.error("Error loading player model:", error);
    }
  }

  async loadVessel() {
    const loader = new GLTFLoader();
    try {
      const gltf = await this.loadModel(
        loader,
        "Pathogen-Surge/assets/models/blood_vessel.glb"
      );
      this.vessel = gltf;

      this.vessel.traverse((child) => {
        if (child.isMesh) {
          const redMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
          });
          child.material = redMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.vessel.position.set(0, 0, 0);
      this.vessel.scale.set(15, 15, 15);

      this.scene.add(this.vessel);
    } catch (error) {
      console.error("Error loading vessel model:", error);
    }
  }

  loadModel(loader, path) {
    return new Promise((resolve, reject) => {
      loader.load(path, (gltf) => resolve(gltf.scene), undefined, reject);
    });
  }

  setupControls() {
    this.controls = new OrbitControls(
      this.camera,
      this.sceneManager.renderer.domElement
    );
    this.controls.enableKeys = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  setupEventListeners() {
    // Player movement
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    // Pause menu
    document.addEventListener("keydown", (event) => {
      if (event.key === "p") {
        this.isPaused ? this.resumeGame() : this.pauseGame();
      }
    });

    // Visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(this.intervalId);
      } else {
        this.intervalId = setInterval(() => this.spawnBloodCell(), 500);
      }
    });

    // Setup pause menu buttons
    document
      .getElementById("resumeButton")
      .addEventListener("click", () => this.resumeGame());
    document
      .getElementById("restartButton")
      .addEventListener("click", () => this.restartGame());
    document
      .getElementById("exitButton")
      .addEventListener("click", () => this.exitGame());
  }

  onKeyDown(event) {
    if (event.key === "ArrowLeft") this.movingLeft = true;
    if (event.key === "ArrowRight") this.movingRight = true;
    if (event.key === "ArrowUp") this.movingUp = true;
    if (event.key === "ArrowDown") this.movingDown = true;
  }

  onKeyUp(event) {
    if (event.key === "ArrowLeft") this.movingLeft = false;
    if (event.key === "ArrowRight") this.movingRight = false;
    if (event.key === "ArrowUp") this.movingUp = false;
    if (event.key === "ArrowDown") this.movingDown = false;
  }

  pauseGame() {
    this.isPaused = true;
    document.getElementById("pauseMenu").style.display = "flex";
    this.soundManager.handlePause();
  }

  resumeGame() {
    this.isPaused = false;
    document.getElementById("pauseMenu").style.display = "none";
    this.soundManager.handleResume();
  }

  restartGame() {
    this.lives = 3;
    this.isPaused = false;
    this.resumeGame();
  }

  exitGame() {
    this.isPaused = false;
    this.soundManager.handlePause();
    document.getElementById("pauseMenu").style.display = "none";
    this.sceneManager.switchScene("menu");
  }

  updatePlayerMovement() {
    if (this.player) {
      this.distance += this.info[this.bodyPart].playerSpeed;
      if (this.movingLeft) this.player.position.x -= this.info[this.bodyPart].playerSpeed;
      if (this.movingRight) this.player.position.x += this.info[this.bodyPart].playerSpeed;
      if (this.movingUp) this.player.position.y += this.info[this.bodyPart].playerSpeed;
      if (this.movingDown) this.player.position.y -= this.info[this.bodyPart].playerSpeed;

      // Clamp player position
      const distanceFromCenter = Math.sqrt(
        this.player.position.x ** 2 + this.player.position.y ** 2
      );
      const maxRadius = 6.5;

      if (distanceFromCenter > maxRadius) {
        const angle = Math.atan2(
          this.player.position.y,
          this.player.position.x
        );
        this.player.position.x = maxRadius * Math.cos(angle);
        this.player.position.y = maxRadius * Math.sin(angle);
      }
    }
  }

  async spawnBloodCell() {
    if (!this.isPaused) {
      const loader = new GLTFLoader();
      try {
        const bloodCellModel = await this.loadModel(
          loader,
          "Pathogen-Surge/assets/models/globule_rouge.glb"
        );
        const bloodCell = bloodCellModel;

        const redMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

        bloodCell.traverse((child) => {
          if (child.isMesh) {
            child.material = redMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Position setup
        const angle = Math.random() * 2 * Math.PI;
        const minRadius = 1;
        const maxRadius = 6;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const height = -50;

        bloodCell.rotation.z = Math.random() * Math.PI;
        bloodCell.position.set(
          radius * Math.sin(angle),
          radius * Math.cos(angle),
          height
        );

        // Movement behavior
        const isLinear = Math.random() > 0.3;
        bloodCell.userData.x = isLinear
          ? 0
          : (Math.random() * 2 - 1) * this.info[this.bodyPart].speed;
        bloodCell.userData.y = isLinear
          ? 0
          : (Math.random() * 2 - 1) * this.info[this.bodyPart].speed;
        bloodCell.userData.isFollowingPlayer = Math.random() < 0.1;

        bloodCell.scale.set(0.8, 0.8, 0.8);

        this.scene.add(bloodCell);
        this.bloodCells.push(bloodCell);
      } catch (error) {
        console.error("Error loading blood cell model:", error);
      }
    }
  }

  updateBloodCells() {
    this.bloodCells.forEach((bloodCell) => {
      if (bloodCell.userData.isFollowingPlayer) {
        const directionToPlayer = new THREE.Vector3();
        directionToPlayer.subVectors(this.player.position, bloodCell.position);
        directionToPlayer.z = 0;
        directionToPlayer.normalize();

        const followSpeed = 0.05;
        bloodCell.position.x += directionToPlayer.x * followSpeed;
        bloodCell.position.y += directionToPlayer.y * followSpeed;
        bloodCell.position.z += this.speed;
      } else {
        bloodCell.position.x += bloodCell.userData.x;
        bloodCell.position.y += bloodCell.userData.y;
        bloodCell.position.z += this.info[this.bodyPart].speed;
      }

      bloodCell.rotation.x += Math.random() * 0.02;
      bloodCell.rotation.y += Math.random() * 0.02;
      bloodCell.rotation.z += Math.random() * 0.02;

      if (bloodCell.position.z > 50) {
        this.scene.remove(bloodCell);
        this.bloodCells = this.bloodCells.filter((c) => c !== bloodCell);
      }

      const distanceFromCenter = Math.sqrt(
        bloodCell.position.x ** 2 + bloodCell.position.y ** 2
      );
      const maxRadius = 7;
      if (distanceFromCenter > maxRadius) {
        bloodCell.userData.x = -bloodCell.userData.x;
        bloodCell.userData.y = -bloodCell.userData.y;
      }
    });
  }

  destroyBloodCellCollided(bloodCell) {
    this.scene.remove(bloodCell);
    const index = this.bloodCells.indexOf(bloodCell);
    if (index > -1) {
      this.bloodCells.splice(index, 1);
    }
    this.createBloodSpray(bloodCell.position);
  }

  createBloodSpray(position) {
    const particleCount = 50;
    const particles = new THREE.Group();
    const particleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      particle.position.set(
        position.x + (Math.random() - 0.5),
        position.y + (Math.random() - 0.5),
        position.z + (Math.random() - 0.5)
      );

      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );

      particles.add(particle);
    }

    this.scene.add(particles);

    const sprayDuration = 0.5;
    const sprayStartTime = performance.now();

    const updateSpray = () => {
      const currentTime = performance.now();
      const elapsedTime = (currentTime - sprayStartTime) / 1000;

      if (elapsedTime < sprayDuration) {
        particles.children.forEach((particle) => {
          particle.position.add(
            particle.userData.velocity.clone().multiplyScalar(0.02)
          );
          particle.userData.velocity.multiplyScalar(0.95);
        });
        requestAnimationFrame(updateSpray);
      } else {
        this.scene.remove(particles);
      }
    };

    updateSpray();
  }

  checkCollisions() {
    if (this.player) {
      const playerBox = new THREE.Box3().setFromObject(this.player);

      this.bloodCells.forEach((bloodCell) => {
        const bloodCellBox = new THREE.Box3().setFromObject(bloodCell);
        if (!this.hasCollided && playerBox.intersectsBox(bloodCellBox)) {
          this.hasCollided = true;
          this.lives--;
          this.livesText.text = `Lives: ${this.lives}`;
          this.destroyBloodCellCollided(bloodCell);
          this.soundManager.playDestroySound();
          this.hasCollided = false;

          if (this.lives <= 0) {
            // Game over logic here
            this.isPaused = true;
            this.soundManager.handlePause();
            this.sceneManager.switchScene("game-over", this.bodyPart);
          }
        }
      });
    }
  }

  update() {
    if (!this.isPaused) {
      if (this.vessel) {
        this.vessel.position.z += this.info[this.bodyPart].speed;
        if (this.vessel.position.z > 400) {
          this.vessel.position.z = 0;
        }
      }

      this.updatePlayerMovement();
      this.updateBloodCells();
      this.checkCollisions();

      if (this.distance >= this.info[this.bodyPart].distance) {
        this.sceneManager.switchScene("end", this.bodyPart);
      }
    }

    super.update();
  }

  async cleanup() {
    // Remove event listeners
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener;
    return super.cleanup();
  }
}
