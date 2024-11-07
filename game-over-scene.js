import * as THREE from "three";

import { BaseScene } from "./base-scene.js";

export class GameOverScene extends BaseScene {
    constructor(sceneManager, bodyPart) {
        super(sceneManager);
        this.bodyPart = bodyPart;
    }

  // Initialize the scene with "Game Over" text and buttons
  async init() {
    // Camera setup
    this.camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        10
    );
    this.camera.position.z = 1;

    // Set up overlay div for UI elements
    this.createGameOverUI();

    // Load the background texture
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load((import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/picture/game-over-picture.png');

    // Create a large plane with the background texture
    const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const material = new THREE.MeshBasicMaterial({ map: backgroundTexture });
    const background = new THREE.Mesh(geometry, material);
    background.position.z = -1; // Place it behind other elements
    this.scene.add(background);
  }

  // Creates the Game Over UI overlay
  createGameOverUI() {
    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.color = "white";
    overlay.style.zIndex = "1000";

    // Game Over text
    const title = document.createElement("h1");
    title.innerText = "Game Over";
    title.style.color = "#ff4444";
    overlay.appendChild(title);

    // Restart button
    const restartButton = document.createElement("button");
    restartButton.innerText = "Restart";
    restartButton.style.margin = "10px";
    restartButton.onclick = () => this.sceneManager.switchScene("game", this.bodyPart);
    overlay.appendChild(restartButton);

    // Main Menu button
    const mainMenuButton = document.createElement("button");
    mainMenuButton.innerText = "Main Menu";
    mainMenuButton.style.margin = "10px";
    mainMenuButton.onclick = () => this.sceneManager.switchScene("menu");
    overlay.appendChild(mainMenuButton);

    document.body.appendChild(overlay);
  }

  // Clean up the scene and UI elements when switching scenes
  async cleanup() {
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) {
      overlay.remove();
    }
  }

  // Update function (empty here since it's a static screen)
  update() {}
}
