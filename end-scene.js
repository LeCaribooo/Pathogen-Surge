import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";

import { BaseScene } from "./base-scene.js";

export class EndScene extends BaseScene {
  constructor(sceneManager, bodyPart) {
    super(sceneManager);
    this.bodyPart = bodyPart;
    this.model = null;
    this.text = null;
    this.info = {
        "Head": {
            model: "brain.glb",
            scale: 0.005,
            text: "The brain is the body's control center, responsible for thoughts, memory, and emotion."
        },
        "Legs": {
            model: "intestine.glb",
            scale: 1,
            text: "The intestines are responsible for absorbing nutrients from food."
        },
        "Chest": {
            model: "lungs.glb",
            scale: 4,
            text: "The lungs are responsible for breathing, which brings oxygen into the body."
        },
        "Left Arm": {
            model: "heart.glb",
            scale: 0.9,
            text: "The heart pumps blood throughout the body, delivering oxygen and nutrients."
        },
        "Right Arm": {
            model: "liver.glb",
            scale: 0.01,
            text: "The liver processes nutrients and filters out harmful substances."
        }
    }
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
    await this.setupModels();
    this.setupText();
    // this.setupEventListeners();
  }

  update() {
    // Rotate the model
    if (this.model) {
      this.model.rotation.y += 0.01;
    }
    return super.update();
  }

  async setupModels() {
    const loader = new GLTFLoader();

    // Load models
    this.model = await this.loadModel(
      loader,
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + `assets/models/${this.info[this.bodyPart].model}`
    );
    this.model.scale.set(
        this.info[this.bodyPart].scale,
        this.info[this.bodyPart].scale,
        this.info[this.bodyPart].scale
        );

    this.scene.add(this.model);
  }

  loadModel(loader, path) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(0, 1, 0);
          resolve(model);
        },
        undefined,
        reject
      );
    });
  }

  setupText() {
    const text = new Text();
    this.scene.add(text);
    text.text = this.info[this.bodyPart].text;
    text.color = 0xffffff;
    text.fontSize = 0.2;
    text.position.set(0.5, 2, 0);
    text.maxWidth = 1.5;
    text.sync();
    this.text = text;
  }

  async cleanup() {
    return super.cleanup();
  }
}
