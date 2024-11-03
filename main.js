import { SceneManager } from "./scene-manager.js";
import { EndScene } from "./end-scene.js";
import { GameScene } from "./game-scene.js";
import { MenuScene } from "./menu-scene.js";
import { GameOverScene } from "./game-over-scene.js";

// Create and initialize the scene manager
const sceneManager = new SceneManager();
sceneManager.initRenderer();

// Register your scenes
sceneManager.addScene("menu", MenuScene);
sceneManager.addScene("game", GameScene);
sceneManager.addScene("end", EndScene);
sceneManager.addScene("game-over", GameOverScene)

// Start with the menu scene
sceneManager.switchScene("menu");
