import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, player, floor;
let speed = 0.1;
const playerSpeed = 0.2;
let movingLeft = false,
  movingRight = false,
  movingUp = false,
  movingDown = false;
let cubes = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Player
  const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0, 0);
  player.rotation.x = Math.PI;
  scene.add(player);

  // Floor
  const floorGeometry = new THREE.CylinderGeometry(7, 7, 200, 32, 1, true);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
  });
  floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  //floor.position.y = -0.5;
  scene.add(floor);

  // Lighting
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  controls.enablePan = false;
  // controls.enableZoom = false;

  // Resize handler
  window.addEventListener("resize", onWindowResize);

  // Key event listeners for player movement
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Player control logic

function onKeyDown(event) {
  if (event.key === "ArrowLeft") movingLeft = true;
  if (event.key === "ArrowRight") movingRight = true;
  if (event.key === "ArrowUp") movingUp = true;
  if (event.key === "ArrowDown") movingDown = true;
}

function onKeyUp(event) {
  if (event.key === "ArrowLeft") movingLeft = false;
  if (event.key === "ArrowRight") movingRight = false;
  if (event.key === "ArrowUp") movingUp = false;
  if (event.key === "ArrowDown") movingDown = false;
}

function updatePlayerMovement() {
  if (movingLeft) {
    player.position.x -= playerSpeed;
  }
  if (movingRight) {
    player.position.x += playerSpeed;
  }
  if (movingUp) {
    player.position.y += playerSpeed;
  }
  if (movingDown) {
    player.position.y -= playerSpeed;
  }

  // Clamp player position within the cylinder
  const distanceFromCenter = Math.sqrt(player.position.x ** 2 + player.position.y ** 2);
  const maxRadius = 7; // Radius of the cylinder
  if (distanceFromCenter > maxRadius) {
    const angle = Math.atan2(player.position.y, player.position.x);
    player.position.x = maxRadius * Math.cos(angle);
    player.position.y = maxRadius * Math.sin(angle);
  }
}

function spawnCube() {
  const cubeGeometry = new THREE.CylinderGeometry (1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  // Set random position within the cylinder at the beginning of the tube
  const angle = Math.random() * 2 * Math.PI;
  const minRadius = 1; // Minimum radius to avoid spawning cubes too close to the center
  const maxRadius = 5; // Maximum radius within the cylinder
  const radius = minRadius + Math.random() * (maxRadius - minRadius); // Random radius within the range
  const height = -50; // Spawn at the beginning of the tube

  cube.position.set(radius * Math.sin(angle), radius * Math.cos(angle), height);

  scene.add(cube);

   cubes.push(cube);
}

function updateCubes() {
  cubes.forEach((cube) => {
    cube.position.z += speed;
    if (cube.position.z > 50) {
      scene.remove(cube);
      cubes = cubes.filter((c) => c !== cube);
    }
  });
}

// Spawn a cube every 0.5 seconds
setInterval(spawnCube, 500);
let hasCollided = false;
let lives = 3;
const livesElement = document.getElementById("lives");
const white = 0x88ff88;
const green = 0x00ff00;

function checkCollisions() {
  const playerBox = new THREE.Box3().setFromObject(player);

  cubes.forEach((cube) => {
    const cubeBox = new THREE.Box3().setFromObject(cube);
    if (!hasCollided && playerBox.intersectsBox(cubeBox)) {
      hasCollided = true;
      player.material.color.set(white);
      setTimeout(() => {
        player.material.color.set(green);
      }, 100);
      setTimeout(() => {
        player.material.color.set(white);
      }, 200);
      setTimeout(() => {
        player.material.color.set(green);
      }, 300);
      setTimeout(() => {
        player.material.color.set(white);
      }, 400);

      setTimeout(() => {
        player.material.color.set(green);
        hasCollided = false;
      }, 500);
      lives--;
      livesElement.innerText = `Lives: ${lives}`;

      console.log("Collision detected!");
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Move the floor to simulate movement
  floor.position.z += speed;
  if (floor.position.z > 50) {
    floor.position.z = 0;
  }

  // Update player movement
  updatePlayerMovement();

  // Update cubes movement
  updateCubes();

  // Check for collisions
  checkCollisions();

  renderer.render(scene, camera);
}