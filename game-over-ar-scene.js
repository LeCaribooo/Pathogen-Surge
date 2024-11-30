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
    //this.setupButtons();
    this.setupText();
    window.addEventListener("click", this.onSelect.bind(this));
    // this.setupEventListeners();
  }

  update() {
    // Rotate the model
    // if (this.model) {
    //   this.model.rotation.y += 0.005;
    // }
    // this.updateButtonsPosition();
    return super.update();
  }

  createButton3D(text, position, onClick) {
    // Créer la géométrie et le matériau du bouton
    const geometry = new THREE.PlaneGeometry(0.3, 0.15); // Taille du bouton
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const button = new THREE.Mesh(geometry, material);
  
    // Positionner le bouton
    button.position.set(position.x, position.y, position.z);
  
    // Ajouter le texte au bouton
    const textMesh = new Text();
    textMesh.text = text;
    textMesh.fontSize = 0.05; // Taille du texte
    textMesh.color = 0x00000; // Couleur du texte
    textMesh.position.set(-0.1, -0.02, 0.01); // Positionner le texte au centre du bouton
    textMesh.sync();
  
    // Ajouter le texte comme enfant du bouton
    button.add(textMesh);
  
    // Ajouter l'action onClick au bouton
    button.userData.onClick = onClick;
  
    return button;
  }

  onSelect(event) {
    // Convertir les coordonnées de la souris en coordonnées normalisées
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    // Mettre à jour le raycaster
    raycaster.setFromCamera(mouse, camera);
  
    // Vérifier les intersections avec les objets de la scène
    const intersects = raycaster.intersectObjects(scene.children);
    for (let intersect of intersects) {
      if (intersect.object.userData.onClick) {
        intersect.object.userData.onClick(); // Exécuter l'action associée
      }
    }
  }
  
  restartGame() {
    this.sceneManager.switchScene("gameAr", this.bodyPart);
  }

  exitGame() {
    this.sceneManager.switchScene("menuAr");
  }

  setupButtons() {
    const buttonGroup = new THREE.Group();
    const restartButton = this.createButton3D("Restart", new THREE.Vector3(0, 0, -2), this.restartGame.bind(this));
    const exitButton = this.createButton3D("Exit", new THREE.Vector3(0, -1, -2), this.exit.bind(this));
    buttonGroup.add(restartButton);
    buttonGroup.add(exitButton);

    // Ajouter le groupe à la scène
    this.scene.add(buttonGroup);
    this.pauseButtonGroup = buttonGroup;
  }

  // updateButtonsPosition() {
  //   if (!this.camera || !this.buttonContainer) return;
  
  //   // Position du texte/boutons en face de la caméra
  //   const vector = new THREE.Vector3(0, 1, -2); // Position relative à la caméra
  //   vector.applyMatrix4(this.camera.matrixWorld); // Transformation en coordonnées mondiales
  
  //   // Projet sur l'écran
  //   vector.project(this.camera);
  
  //   const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  //   const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  
  //   // Mise à jour de la position des boutons
  //   this.buttonContainer.style.left = `${x}px`;
  //   this.buttonContainer.style.top = `${y}px`;
  // }

  setupText() {
    const text = new Text();
    this.scene.add(text);
    text.text = "Game Over";
    text.color = 0xff4444;
    text.fontSize = 0.3;
    text.position.set(0, 0, -2);
    // text.maxWidth = 1;
    text.sync();
    this.text = text;
  }

  async cleanup() {
    if (this.pauseButtonGroup) {
      this.scene.remove(this.pauseButtonGroup);
      this.pauseButtonGroup = null;
    }
    return super.cleanup();
  }
}
