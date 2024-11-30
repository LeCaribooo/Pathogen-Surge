import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";

import { BaseScene } from "./base-scene.js";

export class GameOverArScene extends BaseScene {
  constructor(sceneManager, bodyPart) {
    super(sceneManager);
    this.bodyPart = bodyPart;
    this.text = null;
  }

  async init() {
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 2);
    this.camera.lookAt(0, 1, 0);

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 2, 0);
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Initialize your existing menu setup here
    await this.setupButtons();
    this.setupText();
    // this.setupEventListeners();
  }

  update() {
    // Rotate the model
    // if (this.model) {
    //   this.model.rotation.y += 0.005;
    // }
    this.updateButtonsPosition();
    return super.update();
  }
  

  setupButtons() {
    // Créer un conteneur pour les boutons
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.style.position = 'absolute';
    this.buttonContainer.style.display = 'flex';
    this.buttonContainer.style.flexDirection = 'column';
    this.buttonContainer.style.zIndex = '9999';
    this.buttonContainer.style.alignItems = 'center';
    this.buttonContainer.style.gap = '10px';
    this.buttonContainer.style.pointerEvents = 'auto'; // Pour permettre les clics

    // Bouton Restart
    const restartButton = document.createElement('button');
    restartButton.innerText = 'Restart';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '16px';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
      this.sceneManager.switchScene("game", this.bodyPart);
    };

    // Bouton Menu
    const menuButton = document.createElement('button');
    menuButton.innerText = 'Menu';
    menuButton.style.padding = '10px 20px';
    menuButton.style.fontSize = '16px';
    menuButton.style.cursor = 'pointer';
    menuButton.onclick = () => {
      this.sceneManager.switchScene("menu");
    };

    // Ajouter les boutons au conteneur
    this.buttonContainer.appendChild(restartButton);
    this.buttonContainer.appendChild(menuButton);

    // Ajouter le conteneur au document
    document.body.appendChild(this.buttonContainer);
  }

  updateButtonsPosition() {
    if (!this.camera || !this.buttonContainer) return;
  
    // Position du texte/boutons en face de la caméra
    const vector = new THREE.Vector3(0, 1, -2); // Position relative à la caméra
    vector.applyMatrix4(this.camera.matrixWorld); // Transformation en coordonnées mondiales
  
    // Projet sur l'écran
    vector.project(this.camera);
  
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  
    // Mise à jour de la position des boutons
    this.buttonContainer.style.left = `${x}px`;
    this.buttonContainer.style.top = `${y}px`;
  }

  setupText() {
    const text = new Text();
    this.scene.add(text);
    text.text = "Game Over";
    text.color = 0xff4444;
    text.fontSize = 0.1;
    text.position.set(0.25, 0, -1.5);
    text.maxWidth = 1;
    text.sync();
    this.text = text;
  }

  async cleanup() {
    document.body.removeChild(this.buttonContainer);
    return super.cleanup();
  }
}
