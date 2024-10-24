import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";

let scene, renderer, camera;
let angiologyModel, arthrologyModel;

init();
animate();

function init() {
  scene = new THREE.Scene();

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 1);

  // Lighting
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  const loader = new GLTFLoader();
  loader.load(
    "Pathogen-Surge/assets/models/arthrology.glb",
    (gltf) => {
      arthrologyModel = gltf.scene;
      arthrologyModel.position.set(0, 0, 0);
      scene.add(arthrologyModel);
    },
    undefined,
    (error) => {
      console.error("An error happened while loading the GLB model:", error);
    }
  );

  loader.load(
    "Pathogen-Surge/assets/models/angiology.glb",
    (gltf) => {
      angiologyModel = gltf.scene;
      angiologyModel.position.set(0, 0, 0);
      scene.add(angiologyModel);
    },
    undefined,
    (error) => {
      console.error("An error happened while loading the GLB model:", error);
    }
  );

  // lets create four simple boxes
  // one for head, one for chest, one for legs and one for arms
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const head = new THREE.Mesh(boxGeometry, boxMaterial);
  head.scale.set(0.25, 0.25, 0.25);
  head.position.set(0, 1.6, 0);
  head.name = "head";
  scene.add(head);

  const chest = new THREE.Mesh(boxGeometry, boxMaterial);
  chest.scale.set(0.3, 0.4, 0.3);
  chest.position.set(0, 1.2, 0);
  chest.name = "chest";
  scene.add(chest);

  const legs = new THREE.Mesh(boxGeometry, boxMaterial);
  legs.scale.set(0.3, 0.75, 0.3);
  legs.position.set(0, 0.5, 0);
  legs.name = "legs";
  scene.add(legs);

  const arms = new THREE.Group();
  arms.name = "arms";

  const arm1 = new THREE.Mesh(boxGeometry, boxMaterial);
  const posX = 0.25,
    posY = 1.1,
    posZ = 0;
  const scaleX = 0.15,
    scaleY = 0.6,
    scaleZ = 0.3;
  arm1.position.set(posX, posY, posZ);
  arm1.scale.set(scaleX, scaleY, scaleZ);
  arms.add(arm1);

  const arm2 = new THREE.Mesh(boxGeometry, boxMaterial);
  arm2.position.set(-posX, posY, posZ);
  arm2.scale.set(scaleX, scaleY, scaleZ);
  arms.add(arm2);

  scene.add(arms);

  // adds a text that show the name of the body part when the mouse is over it

  const text = new Text();
  text.text = "Head";
  text.color = 0xffffff;
  text.fontSize = 0.2;
  text.position.set(0, 1.6, 0);
  scene.add(text);

  // Resize handler
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

function onMouseMove(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const chosenNames = ["head", "chest", "legs", "arms"];
    if (chosenNames.includes(intersectedObject.name)) {
      console.log(intersectedObject);
    }
  }
}
