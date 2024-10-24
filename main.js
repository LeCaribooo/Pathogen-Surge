import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { ambiantSoundPlay } from "./sound.js";

let scene, camera, renderer, player, floor;
let speed = 0.2;
const playerSpeed = 0.15;
let movingLeft = false,
  movingRight = false,
  movingUp = false,
  movingDown = false;
let cubes = [];
let lives = 3;
let livesText;
let hasCollided = false;

const white = 0x99ff99;
const green = 0x00ff00;

init();
console.log(player)
animate();


function init() {
  scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(10);
  scene.add(axesHelper);
  livesText = new Text();
  livesText.text = "Lives: 3";
  livesText.color = 0xffffff;
  livesText.fontSize = 1;

  scene.add(livesText);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Player
  //const loader = new GLTFLoader();
  // Using the Promise to load the model
  loadModel('Pathogen-Surge/assets/models/virus.glb').then((playerModel) => {
  player = playerModel;
  

  // Traverse the model to apply shadows
  player.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  player.position.set(0, 0, 0);
  player.scale.set(0.5, 0.5, 0.5);
  player.rotation.y = Math.PI * 3 / 2;

  scene.add(player);
  console.log(player)

  // Now you can use the player model in the scene
  }).catch((error) => {
    console.error('An error occurred while loading the model', error);
  });

  /*const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0, 0);
  player.rotation.x = Math.PI;
  scene.add(player);*/

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);
  livesText.position.set(-5, 5, 0);
  ambiantSoundPlay(camera);

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
  controls.enableZoom = false;
  controls.enableRotate = false;

  // Resize handler
  window.addEventListener("resize", onWindowResize);

  // Key event listeners for player movement
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}

function loadModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, function (gltf) {
      resolve(gltf.scene); // Resolve with the loaded scene (model)
    }, undefined, function (error) {
      reject(error); // Reject on error
    });
  });
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
  if(player) {
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
    const distanceFromCenter = Math.sqrt(
      player.position.x ** 2 + player.position.y ** 2
    );
    const maxRadius = 6.5; // Radius of the cylinder
    if (distanceFromCenter > maxRadius) {
      const angle = Math.atan2(player.position.y, player.position.x);
      player.position.x = maxRadius * Math.cos(angle);
      player.position.y = maxRadius * Math.sin(angle);
    }
  }
}

function spawnCube() {
  const loader = new GLTFLoader();
  loader.load('Pathogen-Surge/assets/models/globule_rouge.glb', function (gltf) {
    const model = gltf.scene;

    // Create the red material
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // Traverse the model to apply the red material to all meshes
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = redMaterial; // Apply the red material
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Set random position within the cylinder at the beginning of the tube
    const angle = Math.random() * 2 * Math.PI;
    const minRadius = 1; // Minimum radius to avoid spawning models too close to the center
    const maxRadius = 5; // Maximum radius within the cylinder
    const radius = minRadius + Math.random() * (maxRadius - minRadius); // Random radius within the range
    const height = -50; // Spawn at the beginning of the tube

    model.rotation.z = Math.random() * Math.PI;
    model.position.set(radius * Math.sin(angle), radius * Math.cos(angle), height);

    const isLinear = Math.random() > 0.3;
    model.userData.x = isLinear ? 0 : (Math.random() * 2 - 1) * speed;
    model.userData.y = isLinear ? 0 : (Math.random() * 2 - 1) * speed;

    // Optionally scale the model if it's too big or small
    model.scale.set(0.8, 0.8, 0.8);

    scene.add(model);
    cubes.push(model); // Push the model into the cubes array
  }, undefined, function (error) {
    console.error('An error occurred while loading the model', error);
  });
}


function updateCubes() {
  cubes.forEach((cube) => {
    cube.position.x += cube.userData.x;
    cube.position.y += cube.userData.y;
    cube.position.z += speed;

    if (cube.position.z > 50) {
      scene.remove(cube);
      cubes = cubes.filter((c) => c !== cube);
    }

    // Invert userData values if cube goes out of bounds
    const distanceFromCenter = Math.sqrt(
      cube.position.x ** 2 + cube.position.y ** 2
    );
    const maxRadius = 7; // Radius of the cylinder
    if (distanceFromCenter > maxRadius) {
      cube.userData.x = -cube.userData.x;
      cube.userData.y = -cube.userData.y;
    }
  });
}

// Spawn a cube every 0.5 seconds
setInterval(spawnCube, 500);

function destroyObject(object) {
  // Remove the object from the scene
  scene.remove(object);

  // Also remove from the cubes array
  const index = cubes.indexOf(object);
  if (index > -1) {
    cubes.splice(index, 1);
  }

  // Trigger the blood spray effect at the object's position
  createBloodSpray(object.position);
}

function createBloodSpray(position) {
  const particleCount = 50; // Number of blood particles
  const particles = new THREE.Group(); // Group to hold all particles

  // Create a red material for the blood particles
  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // Loop to create individual particles
  for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8); // Small sphere geometry
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    // Randomize initial position slightly
    particle.position.set(
      position.x + (Math.random() - 0.5),
      position.y + (Math.random() - 0.5),
      position.z + (Math.random() - 0.5)
    );

    // Random velocity for the spray effect
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 10, // Random x velocity
      (Math.random() - 0.5) * 10, // Random y velocity
      (Math.random() - 0.5) * 10  // Random z velocity
    );

    particles.add(particle);
  }

  // Add particles to the scene
  scene.add(particles);

  // Animate particles to simulate spray movement
  const sprayDuration = 0.5; // Spray effect lasts 1 second
  const sprayStartTime = performance.now();

  // Add a custom update loop to animate the blood particles
  function updateSpray() {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - sprayStartTime) / 1000; // Convert to seconds

    if (elapsedTime < sprayDuration) {
      // Move each particle based on its velocity
      particles.children.forEach((particle) => {
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.02)); // Move particle
        particle.userData.velocity.multiplyScalar(0.95); // Dampen velocity for realism
      });

      // Continue animating in the next frame
      requestAnimationFrame(updateSpray);
    } else {
      // Remove particles from the scene when the effect is done
      scene.remove(particles);
    }
  }

  // Start the animation loop
  updateSpray();
}

function checkCollisions() {
  if (player){
    const playerBox = new THREE.Box3().setFromObject(player);

    cubes.forEach((cube) => {
      const cubeBox = new THREE.Box3().setFromObject(cube);
      if (!hasCollided && playerBox.intersectsBox(cubeBox)) {
        //TODO: sound pas cool
        hasCollided = true;
        lives--;
        livesText.text = `Lives: ${lives}`;
        destroyObject(cube)
        hasCollided = false;
        /*
        //if (player.material && player.material.color) {
          player.material.transparent = true;
          player.material.opacity = 0.7;  // Adjust the opacity to make it more faded (pale)
          setTimeout(() => {
            //player.material.color.set(green);
            player.material.userData.originalColor = player.material.color.clone();
          }, 100);
          setTimeout(() => {
            //player.material.color.set(white);
            player.material.transparent = true;
            player.material.opacity = 0.7;  // Adjust the opacity to make it more faded (pale)
          }, 200);
          setTimeout(() => {
            //player.material.color.set(green);
            player.material.userData.originalColor = player.material.color.clone();
          }, 300);
          setTimeout(() => {
            //player.material.color.set(white);
            player.material.transparent = true;
            player.material.opacity = 0.7;  // Adjust the opacity to make it more faded (pale)
          }, 400);
          setTimeout(() => {
            //player.material.color.set(green);
            player.material.userData.originalColor = player.material.color.clone();
            hasCollided = false;
          }, 500);
        //}
        //player.material.color.set(white);*/
        

        // if (lives === 0) {
        //   alert("Game over!");
        //   window.location.reload();
        // }
      }
    });
  }
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
