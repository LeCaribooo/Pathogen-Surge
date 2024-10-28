import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { ambiantSoundPlay, destroySound } from "./sound.js";

// Main entities's global variable
let scene, camera, renderer, player, vessel;

// Speed of the obstacles
let speed = 0.2;

// Player speed
const playerSpeed = 0.15;

// The player is moving or not
let movingLeft = false,
  movingRight = false,
  movingUp = false,
  movingDown = false;

// List of all obstacles
let bloodCells = [];

// Counter of the player's life point
let lives = 3;

// Text to show life point to the player
let livesText;

// Boolean to determine is a collision has been trigerred
let hasCollided = false;

// Boolean to determine if the game is on pause
export let isPaused = false;

init();
animate();

// Function launched at the beginning to set up the game
function init() {
  scene = new THREE.Scene();

  // Lives settings
  livesText = new Text();
  livesText.text = `Lives: ${lives}`;
  livesText.color = 0xffffff;
  livesText.fontSize = 1;

  scene.add(livesText);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Player Load  
  loadModel("Pathogen-Surge/assets/models/virus.glb")
    .then((playerModel) => {
      player = playerModel;

      // Traverse the model to apply shadows
      player.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Player settings
      player.position.set(0, 0, 0);
      player.scale.set(0.5, 0.5, 0.5);
      player.rotation.y = (Math.PI * 3) / 2;

      scene.add(player);
    })
    .catch((error) => {
      console.error("An error occurred while loading the player model", error);
    });

  // Camera settings
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);
  livesText.position.set(-5, 5, 0);

  // Launch the ambiant sound loop
  ambiantSoundPlay(camera);

  // Blood vessel load
  loadModel("Pathogen-Surge/assets/models/blood_vessel.glb")
    .then((vesselModel) => {
      vessel = vesselModel;

      // Traverse the model to apply shadows and material
      vessel.traverse((child) => {
        if (child.isMesh) {

          // Using LambertMaterial to have a better use of shadows
          const redMaterial = new THREE.MeshLambertMaterial({
            color: 0xff0000,
          });
          child.material = redMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Blood vessel settings
      vessel.position.set(0, 0, 0);
      vessel.scale.set(15, 15, 15);

      scene.add(vessel);
    })
    .catch((error) => {
      console.error("An error occurred while loading the blood vessel model", error);
    });

  // Lighting settings
  const light = new THREE.PointLight(0xffffff, 140);
  light.position.set(0, 0, -15);
  light.lookAt(0, 0, 0);
  scene.add(light);

  const light2 = new THREE.PointLight(0xffffff, 140);
  light2.position.set(0, 0, 15);
  light2.lookAt(0, 0, 0);
  scene.add(light2);

  // Controls settings
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

// Pause, Resume, Restart and Exit functions
function pauseGame() {
  isPaused = true;
  document.getElementById("pauseMenu").style.display = "flex";
}

function resumeGame() {
  isPaused = false;
  document.getElementById("pauseMenu").style.display = "none";
}

function restartGame() {
  lives = 3;
  isPaused = false;
  resumeGame();
}

function exitGame() {
  //TODO
  isPaused = false;
  window.location.href = "index.html"; // Example redirect
}

// Add event listeners to the pause menu buttons
document.getElementById("resumeButton").addEventListener("click", resumeGame);
document.getElementById("restartButton").addEventListener("click", restartGame);
document.getElementById("exitButton").addEventListener("click", exitGame);

// Listen for the "p" key to toggle the pause menu
window.addEventListener("keydown", (event) => {
  if (event.key === "p") {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }
});

// Function use the Promise to load the model given in parameter
function loadModel(path) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      path,
      function (gltf) {
        resolve(gltf.scene);
      },
      undefined,
      function (error) {
        reject(error);
      }
    );
  });
}

// Window Resize function
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Player control logic functions
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

// Player movement update function
function updatePlayerMovement() {
  if (player) {
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

    // Clamp player position within the blood vessel
    const distanceFromCenter = Math.sqrt(
      player.position.x ** 2 + player.position.y ** 2
    );

    const maxRadius = 6.5; // Radius of the blood vessel

    if (distanceFromCenter > maxRadius) {
      const angle = Math.atan2(player.position.y, player.position.x);
      player.position.x = maxRadius * Math.cos(angle);
      player.position.y = maxRadius * Math.sin(angle);
    }
  }
}

// Function to spawn the blood cells
function spawnBloodCell() {
  if (!isPaused) {
    loadModel("Pathogen-Surge/assets/models/globule_rouge.glb")
    .then((bloodCellModel) => {
        const bloodCell = bloodCellModel.scene;

        // Create the lambert red material to have a better use of shadows
        const redMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

        // Traverse the model to use shadows and apply the material to all meshes
        bloodCell.traverse((child) => {
          if (child.isMesh) {
            child.material = redMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Set random position within the cylinder at the beginning of the tube
        const angle = Math.random() * 2 * Math.PI;
        const minRadius = 1; // Minimum radius to avoid spawning models too close to the center
        const maxRadius = 6; // Maximum radius within the cylinder
        const radius = minRadius + Math.random() * (maxRadius - minRadius); // Random radius within the range
        const height = -50; // Spawn at the beginning of the tube

        bloodCell.rotation.z = Math.random() * Math.PI;
        bloodCell.position.set(
          radius * Math.sin(angle),
          radius * Math.cos(angle),
          height
        );

        // 30% chance to make a rebound blood cell appear
        const isLinear = Math.random() > 0.3;
        bloodCell.userData.x = isLinear ? 0 : (Math.random() * 2 - 1) * speed;
        bloodCell.userData.y = isLinear ? 0 : (Math.random() * 2 - 1) * speed;

        // 10% chance to make a following blood cell appear
        const isFollowingPlayer = Math.random() < 0.1;
        bloodCell.userData.isFollowingPlayer = isFollowingPlayer;

        // bloodCell Settings
        bloodCell.scale.set(0.8, 0.8, 0.8);

        scene.add(bloodCell);
        bloodCells.push(bloodCell); // Push the bloodCell into the bloodCells array
      },
      undefined,
      function (error) {
        console.error("An error occurred while loading the blood cell model", error);
      }
    );
  }
}

// Function to update the blood cells into the blood vessel
function updateBloodCells() {
  bloodCells.forEach((bloodCell) => {
    // Update the following blood cells position
    if (bloodCell.userData.isFollowingPlayer) {
      const directionToPlayer = new THREE.Vector3();
      directionToPlayer.subVectors(player.position, bloodCell.position);
      directionToPlayer.z = 0; // Ignore the z component to restrict movement to x and y axes
      directionToPlayer.normalize();

      // Move the bloodCell towards the player on x and y axes
      const followSpeed = 0.05;
      bloodCell.position.x += directionToPlayer.x * followSpeed;
      bloodCell.position.y += directionToPlayer.y * followSpeed;

      // Continue independent movement on the z axis
      bloodCell.position.z += speed;
    } else {
      // Update all other blood cells position
      bloodCell.position.x += bloodCell.userData.x;
      bloodCell.position.y += bloodCell.userData.y;
      bloodCell.position.z += speed;
    }

    // Update all blood cells rotation
    bloodCell.rotation.x += Math.random() * 0.02;
    bloodCell.rotation.y += Math.random() * 0.02;
    bloodCell.rotation.z += Math.random() * 0.02;

    // Remove blood cells when they are not on the screen anymore
    if (bloodCell.position.z > 50) {
      scene.remove(bloodCell);
      bloodCells = bloodCells.filter((c) => c !== bloodCell);
    }

    // Manage rebound to the rebound blood cells
    const distanceFromCenter = Math.sqrt(
      bloodCell.position.x ** 2 + bloodCell.position.y ** 2
    );
    const maxRadius = 7; // Radius of the cylinder
    if (distanceFromCenter > maxRadius) {
      bloodCell.userData.x = -bloodCell.userData.x;
      bloodCell.userData.y = -bloodCell.userData.y;
    }
  });
}

// Listen for visibility change events on the document
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // If the page is not visible, stop the interval
    clearInterval(intervalId);
  } else {
    // If the page becomes visible again, start the interval
    // Spawn a bloodCell every 0.5 seconds
    intervalId = setInterval(spawnBloodCell, 500);
  }
});

// Spawn a bloodCell every 0.5 seconds
let intervalId = setInterval(spawnBloodCell, 500);

// Function to remove a blood cell when it collides with the player 
function destroyBloodCellCollided(bloodCell) {

  // Remove the bloodCell from the scene
  scene.remove(bloodCell);

  // Also remove from the bloodCells array
  const index = bloodCells.indexOf(bloodCell);
  if (index > -1) {
    bloodCells.splice(index, 1);
  }

  // Trigger the blood spray effect at the blood cell's position
  createBloodSpray(bloodCell.position);
}

// Function to create a blood spray at the given position
function createBloodSpray(position) {

  const particleCount = 50; // Number of blood particles
  const particles = new THREE.Group(); // Group to hold all particles

  // Create a lambert red material for the blood particles
  const particleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

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
      (Math.random() - 0.5) * 10 // Random z velocity
    );

    particles.add(particle);
  }

  // Add particles to the scene
  scene.add(particles);

  // Animate particles to simulate spray movement
  const sprayDuration = 0.5; // Spray effect lasts 0.5 second
  const sprayStartTime = performance.now();

  // Update loop to animate the blood particles
  function updateSpray() {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - sprayStartTime) / 1000; // Convert to seconds

    if (elapsedTime < sprayDuration) {
      // Move each particle based on its velocity
      particles.children.forEach((particle) => {
        particle.position.add(
          particle.userData.velocity.clone().multiplyScalar(0.02)
        ); // Move particle
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

// Function to check if a blood cell collide the player
function checkCollisions() {
  if (player) {
    // Player box collider
    const playerBox = new THREE.Box3().setFromObject(player);

    bloodCells.forEach((bloodCell) => {
      const bloodCellBox = new THREE.Box3().setFromObject(bloodCell);
      if (!hasCollided && playerBox.intersectsBox(bloodCellBox)) { // Collision trigerred
        hasCollided = true;
        lives--;
        livesText.text = `Lives: ${lives}`;
        destroyBloodCellCollided(bloodCell);
        destroySound(camera);
        hasCollided = false;
        // TODO: Game over
      }
    });
  }
}

// Function to update all elements in the scene
function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    if (vessel) {
      vessel.position.z += speed;
      if (vessel.position.z > 400) {
        vessel.position.z = 0;
      }
    }

    // Update player movement
    updatePlayerMovement();

    // Update bloodCells movement
    updateBloodCells();

    // Check for collisions
    checkCollisions();

    renderer.render(scene, camera);
  }
}
