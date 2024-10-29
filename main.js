import { SceneManager } from "./scene-manager.js";
import { MenuScene } from "./menu-scene.js";
import { GameScene } from "./game-scene.js";

// Create and initialize the scene manager
const sceneManager = new SceneManager();
sceneManager.initRenderer();

// Register your scenes
sceneManager.addScene("menu", MenuScene);
sceneManager.addScene("game", GameScene);

// Start with the menu scene
sceneManager.switchScene("menu");
