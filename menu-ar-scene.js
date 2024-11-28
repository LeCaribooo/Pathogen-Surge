import * as THREE from "three";
import { GUI } from "dat.gui";
import { Text } from "troika-three-text";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { BaseScene } from "./base-scene.js";

export class MenuArScene extends BaseScene {
  constructor(sceneManager) {
    super(sceneManager);
    this.bodyParts = null;
    this.contentText = null;
    this.labelText = null;
    this.selectedObject = null;
    this.lastTapTime = 0;
    this.onDoubleTap = this.onDoubleTap.bind(this);
  }

  async init() {
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0.4, 0);
    this.camera.lookAt(0, 0, -1.4);

    const gui = new GUI();
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(this.camera.position, "y", 0, 10);
    cameraFolder.add(this.camera.position, "z", -10, 10);
    cameraFolder.open();

    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    await this.setupModels();
    this.setupTexts();
    this.setupBodyParts();
    console.log(this.sceneManager);
    window.addEventListener("touchstart", this.onDoubleTap, true);
  }

  update() {
    this.updateRay();
    this.updateTexts();
  }

  async cleanup() {
    window.removeEventListener("touchstart", this.onDoubleTap, true);
    return super.cleanup();
  }

  // My own functions
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

  async setupModels() {
    const loader = new GLTFLoader();

    const models = await Promise.all([
      this.loadModel(
        loader,
        (import.meta.env.DEV ? "Pathogen-Surge/" : "") +
        "assets/models/angiology.glb"
      ),
      this.loadModel(
        loader,
        (import.meta.env.DEV ? "Pathogen-Surge/" : "") +
        "assets/models/arthrology.glb"
      ),
    ]);

    this.angiologyModel = models[0];
    this.arthrologyModel = models[1];

    this.angiologyModel.position.set(0, -1, -1.4);
    this.arthrologyModel.position.set(0, -1, -1.4);

    this.scene.add(this.angiologyModel);
    this.scene.add(this.arthrologyModel);
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
    head.position.set(0, 0.6, -1.4);
    head.name = "Head";
    const headLight = new THREE.PointLight(0xff0000, 2, 0.3);
    headLight.position.set(0, 0.7, -1.4);
    headLight.visible = false;
    this.scene.add(headLight);
    head.userData.light = headLight;
    bodyParts.add(head);

    const chest = new THREE.Mesh(boxGeometry, boxMaterial);
    chest.scale.set(0.3, 0.4, 0.3);
    chest.position.set(0, 0.2, -1.4);
    chest.name = "Chest";
    const chestLight = new THREE.PointLight(0xff0000, 2, 0.25);
    chestLight.position.set(0, 0.2, -1.4);
    chestLight.visible = false;
    this.scene.add(chestLight);
    chest.userData.light = chestLight;
    bodyParts.add(chest);

    const legs = new THREE.Mesh(boxGeometry, boxMaterial);
    legs.scale.set(0.3, 0.75, 0.3);
    legs.position.set(0, -0.5, -1.4);
    legs.name = "Legs";
    const legsLight = new THREE.PointLight(0xff0000, 2, 0.6);
    legsLight.position.set(0, -0.5, -1.4);
    legsLight.visible = false;
    this.scene.add(legsLight);
    legs.userData.light = legsLight;
    bodyParts.add(legs);

    const arm1 = new THREE.Mesh(boxGeometry, boxMaterial);
    const posX = 0.25,
      posY = 0.1,
      posZ = -1.4;
    const scaleX = 0.15,
      scaleY = 0.6,
      scaleZ = 0.3;
    arm1.position.set(posX, posY, posZ);
    arm1.scale.set(scaleX, scaleY, scaleZ);
    arm1.name = "Left Arm";
    const arm1Light = new THREE.PointLight(0xff0000, 2, 0.4);
    arm1Light.position.set(posX, posY, posZ);
    arm1Light.visible = false;
    this.scene.add(arm1Light);
    arm1.userData.light = arm1Light;
    bodyParts.add(arm1);

    const arm2 = new THREE.Mesh(boxGeometry, boxMaterial);
    arm2.position.set(-posX, posY, posZ);
    arm2.scale.set(scaleX, scaleY, scaleZ);
    arm2.name = "Right Arm";
    const arm2Light = new THREE.PointLight(0xff0000, 2, 0.4);
    arm2Light.position.set(-posX, posY, posZ);
    arm2Light.visible = false;
    this.scene.add(arm2Light);
    arm2.userData.light = arm2Light;
    bodyParts.add(arm2);

    this.scene.add(bodyParts);
    this.bodyParts = bodyParts;
  }

  setupTexts() {
    const labelText = new Text();
    this.scene.add(labelText);
    labelText.text =
      "Choose wich body part to contaminate\n\nDouble tap to validate";
    labelText.color = 0xffffff;
    labelText.fontSize = 0.05;
    labelText.position.set(-0.5, 0.5, -1);
    labelText.maxWidth = 0.3;
    labelText.sync();
    this.labelText = labelText;

    const contentText = new Text();
    this.scene.add(contentText);
    contentText.text = "";
    contentText.color = 0xffffff;
    contentText.fontSize = 0.05;
    contentText.position.set(0.25, 0.45, -1);
    contentText.maxWidth = 0.3;
    contentText.sync();
    this.contentText = contentText;
  }

  updateTexts() {
    this.contentText.lookAt(this.camera.position);
    this.labelText.lookAt(this.camera.position);
  }

  updateRay() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = raycaster.intersectObjects(
      this.bodyParts.children,
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject !== this.selectedObject) {
        if (this.selectedObject) {
          this.selectedObject.userData.light.visible = false;
        }
        this.selectedObject = intersectedObject;
        this.selectedObject.userData.light.visible = true;
        this.contentText.text = this.selectedObject.name;
      }
    }
  }

  async onDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapInterval = currentTime - this.lastTapTime;

    if (tapInterval < 300 && tapInterval > 0) {
      await this.sceneManager.switchScene("gameAr", this.selectedObject.name);
    }

    this.lastTapTime = currentTime;
  }
}
