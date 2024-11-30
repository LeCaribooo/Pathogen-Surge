import { SceneManager } from "./scene-manager.js";
import { EndScene } from "./end-scene.js";
import { GameScene } from "./game-scene.js";
import { MenuScene } from "./menu-scene.js";
import { GameOverScene } from "./game-over-scene.js";
import { MenuArScene } from "./menu-ar-scene.js";
import { GameArScene } from "./game-ar-scene.js";
import { EndArScene } from "./end-ar-scene.js";
import { GameOverArScene } from "./game-over-ar-scene.js";

// Create and initialize the scene manager
const sceneManager = new SceneManager();
sceneManager.initRenderer();

// Register your scenes
sceneManager.addScene("menuAr", MenuArScene);
sceneManager.addScene("menu", MenuScene);
sceneManager.addScene("gameAr", GameArScene);
sceneManager.addScene("game", GameScene);
sceneManager.addScene("endAr", EndArScene);
sceneManager.addScene("end", EndScene);
sceneManager.addScene("game-over", GameOverScene);
sceneManager.addScene("game-overAr", GameOverArScene);

// Start with the menu scene
sceneManager.switchScene("menuAr");
