import * as THREE from "three";

export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.currentScene = null;
    this.renderer = null;
    this.activeCamera = null;
  }

  // Initialize the renderer (call this once at startup)
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Handle window resizing
    window.addEventListener("resize", () => {
      if (this.activeCamera) {
        this.activeCamera.aspect = window.innerWidth / window.innerHeight;
        this.activeCamera.updateProjectionMatrix();
      }
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Register a new scene
  addScene(name, sceneClass) {
    this.scenes.set(name, sceneClass);
  }

  // Switch to a different scene
  async switchScene(sceneName, ...args) {
    // Cleanup current scene if it exists
    if (this.currentScene) {
      await this.currentScene.cleanup();
    }

    // Create and initialize new scene
    const SceneClass = this.scenes.get(sceneName);
    if (!SceneClass) {
      throw new Error(`Scene ${sceneName} not found`);
    }

    this.currentScene = new SceneClass(this, ...args);
    await this.currentScene.init();
    this.activeCamera = this.currentScene.camera;

    // Start the animation loop
    this.animate();
  }

  // Main animation loop
  animate = () => {
    if (!this.currentScene) return;

    requestAnimationFrame(this.animate);
    this.currentScene.update();
    this.renderer.render(this.currentScene.scene, this.activeCamera);
  };
}
