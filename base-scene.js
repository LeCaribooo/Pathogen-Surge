import * as THREE from "three";

export class BaseScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = new THREE.Scene();
    this.camera = null;
    this.controls = null;
  }

  // Initialize the scene (override this)
  async init() {
    throw new Error("init() must be implemented by child class");
  }

  // Update loop (override this)
  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  // Cleanup when switching scenes (override this)
  async cleanup() {
    // Dispose of geometries, materials, textures, etc.
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Remove event listeners
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
