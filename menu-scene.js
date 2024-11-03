import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";

import { BaseScene } from "./base-scene.js";

export class MenuScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this.angiologyModel = null;
    this.arthrologyModel = null;
    this.bodyParts = null;
    this.text = null;
    this.selectedObject = null;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.launchGame = this.launchGame.bind(this);
  }

  async init() {
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 1.5);
    this.camera.lookAt(0, 1, 0);

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    // Initialize your existing menu setup here
    await this.setupModels();
    this.setupBodyParts();
    this.setupText();
    this.setupEventListeners();
  }

  async setupModels() {
    const loader = new GLTFLoader();

    // Load models
    this.angiologyModel = await this.loadModel(
      loader,
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/models/angiology.glb'
    );
    this.arthrologyModel = await this.loadModel(
      loader,
      (import.meta.env.DEV ? 'Pathogen-Surge/' : '') + 'assets/models/arthrology.glb'
    );

    this.scene.add(this.angiologyModel);
    this.scene.add(this.arthrologyModel);
  }

  loadModel(loader, path) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(0, 0, 0);
          resolve(model);
        },
        undefined,
        reject
      );
    });
  }

  setupEventListeners() {
    window.addEventListener("mousemove", this.onMouseMove, true);
    window.addEventListener("click", this.launchGame, true);
  }

  setupBodyParts() {
    const bodyParts = new THREE.Group();

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
    });
    const head = new THREE.Mesh(boxGeometry, boxMaterial);
    head.scale.set(0.25, 0.25, 0.25);
    head.position.set(0, 1.6, 0);
    head.name = "Head";
    const headLight = new THREE.PointLight(0xff0000, 1, 100);
    headLight.position.set(0, 1.6, 0);
    headLight.visible = false;
    this.scene.add(headLight);
    head.userData.light = headLight;
    bodyParts.add(head);

    const chest = new THREE.Mesh(boxGeometry, boxMaterial);
    chest.scale.set(0.3, 0.4, 0.3);
    chest.position.set(0, 1.2, 0);
    chest.name = "Chest";
    const chestLight = new THREE.PointLight(0xff0000, 1, 100);
    chestLight.position.set(0, 1.2, 0);
    chestLight.visible = false;
    this.scene.add(chestLight);
    chest.userData.light = chestLight;
    bodyParts.add(chest);

    const legs = new THREE.Mesh(boxGeometry, boxMaterial);
    legs.scale.set(0.3, 0.75, 0.3);
    legs.position.set(0, 0.5, 0);
    legs.name = "Legs";
    const legsLight = new THREE.PointLight(0xff0000, 1, 100);
    legsLight.position.set(0, 0.5, 0);
    legsLight.visible = false;
    this.scene.add(legsLight);
    legs.userData.light = legsLight;
    bodyParts.add(legs);

    const arm1 = new THREE.Mesh(boxGeometry, boxMaterial);
    const posX = 0.25,
      posY = 1.1,
      posZ = 0;
    const scaleX = 0.15,
      scaleY = 0.6,
      scaleZ = 0.3;
    arm1.position.set(posX, posY, posZ);
    arm1.scale.set(scaleX, scaleY, scaleZ);
    arm1.name = "Left Arm";
    const arm1Light = new THREE.PointLight(0xff0000, 1, 100);
    arm1Light.position.set(posX, posY, posZ);
    arm1Light.visible = false;
    this.scene.add(arm1Light);
    arm1.userData.light = arm1Light;
    bodyParts.add(arm1);

    const arm2 = new THREE.Mesh(boxGeometry, boxMaterial);
    arm2.position.set(-posX, posY, posZ);
    arm2.scale.set(scaleX, scaleY, scaleZ);
    arm2.name = "Right Arm";
    const arm2Light = new THREE.PointLight(0xff0000, 1, 100);
    arm2Light.position.set(-posX, posY, posZ);
    arm2Light.visible = false;
    this.scene.add(arm2Light);
    arm2.userData.light = arm2Light;
    bodyParts.add(arm2);

    this.scene.add(bodyParts);
    this.bodyParts = bodyParts;
  }

  launchGame() {
    if (!this.selectedObject) return;
    this.sceneManager.switchScene("game", this.selectedObject.name);
  }

  setupText() {
    const text = new Text();
    this.scene.add(text);
    text.text = "Choose wich body part to contaminate";
    text.color = 0xffffff;
    text.fontSize = 0.2;
    text.position.set(0.5, 2, 0);
    text.maxWidth = 1;
    text.sync();
    this.text = text;
  }

  onMouseMove(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(
      this.bodyParts.children,
      true
    );
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject !== this.selectedObject) {
        console.log(intersectedObject.name);
        if (this.selectedObject) {
          this.selectedObject.userData.light.visible = false;
        }
        this.selectedObject = intersectedObject;
        this.selectedObject.userData.light.visible = true;
        this.text.text = this.selectedObject.name;
      }
    }
  }

  async cleanup() {
    // Remove event listeners
    window.removeEventListener("mousemove", this.onMouseMove, true);
    window.removeEventListener("click", this.launchGame, true);

    return super.cleanup();
  }
}
