import * as THREE from 'three';

import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

import * as dat from "dat.gui";

import gsap from "gsap";

import {
  generators
} from "/src/generators.js";

(function () {
  var script = document.createElement('script');
  script.onload = function () {
    var stats = new Stats();
    // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = '//mrdoob.github.io/stats.js/build/stats.min.js';
  document.head.appendChild(script);
})();

const oldColorA = {
  r: 0.2,
  g: 0.5,
  b: 1.0
};

const hoverColor = {
  r: 0.6,
  g: 0.8,
  b: 1.0
};

const gui = new dat.GUI();
const world = {
  plane: {
    width: 10,
    height: 10,
    segments: 10
  }
};
gui.add(world.plane, 'width', 1, 50).onChange(createPlane);
gui.add(world.plane, 'height', 1, 50).onChange(createPlane);
gui.add(world.plane, 'segments', 1, 50).onChange(createPlane);

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75.0, innerWidth / innerHeight, 0.1, 5000.0);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const planeGeom = generators.createGeom(generators.plane(10, 10, 20, 20));
const planeMat = new THREE.MeshPhongMaterial({
  //color:0x3388ff,
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
});
const planeMesh = new THREE.Mesh(planeGeom, planeMat);
scene.add(planeMesh);
createPlane();

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(0, 1, 1);
scene.add(light);

const light2 = new THREE.DirectionalLight(0x444444, 1.0);
light2.position.set(0, 1, -1);
scene.add(light2);

camera.position.z = 5;
camera.position.y = 2;

const mouse = {
  x: -1,
  y: -1,
  dx: 0,
  dy: 0
};
addEventListener('mousemove', (event) => {
  mouse.x = ((event.clientX / innerWidth) * 2.0) - 1.0;
  mouse.y = -(((event.clientY / innerHeight) * 2.0) - 1.0);
  mouse.dx = event.movementX / innerWidth;
  mouse.dy = -event.movementY / innerHeight;
});

function hoverIntersect(intersect) {
  if (intersect != null) {
    const colorAttribute = intersect.object.geometry.getAttribute("color");
    const hoverColorA = {
      ...hoverColor
    };
    gsap.to(hoverColorA, {
      r: oldColorA.r,
      g: oldColorA.g,
      b: oldColorA.b,
      duration: 1,
      onUpdate: () => {
        colorAttribute.setXYZ(intersect.face.a, hoverColorA.r, hoverColorA.g, hoverColorA.b);
        colorAttribute.setXYZ(intersect.face.b, hoverColorA.r, hoverColorA.g, hoverColorA.b);
        colorAttribute.setXYZ(intersect.face.c, hoverColorA.r, hoverColorA.g, hoverColorA.b);
        colorAttribute.needsUpdate = true;
      }
    });
  }
}

requestAnimationFrame(animate);

let animationTime = 0.0;
const clock = new THREE.Clock();

function animate(timestamp) {
  let deltaTime = clock.getDelta();
  animationTime += deltaTime;

  animatePlane(planeMesh, animationTime);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    hoverIntersect(intersects[0]);
  } else {
    hoverIntersect(null);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function generateInitialVtxArray(meshObj) {
  const {
    array
  } = meshObj.geometry.attributes.position;
  const randomValues = [];
  for (let i = 0; i < array.length; i += 3) {
    array[i + 2] = array[i + 2] + 1.0 * Math.random();
    randomValues.push(Math.PI * 2 * Math.random());
    randomValues.push(Math.PI * 2 * Math.random());
    randomValues.push(1.0 + 0.5 * (Math.random() - 0.5));
  }
  meshObj.geometry.attributes.position.originalPosition = {
    ...meshObj.geometry.attributes.position.array
  };
  meshObj.geometry.attributes.position.randomValues = randomValues;
  meshObj.geometry.attributes.position.needsUpdate = true;
}

function animatePlane(meshObj, time) {
  const {
    array,
    originalPosition,
    randomValues
  } = meshObj.geometry.attributes.position;

  if (originalPosition !== undefined) {
    for (let i = 0; i < array.length; i += 3) {
      array[i + 0] = originalPosition[i + 0] + 0.2 * Math.cos(time * randomValues[i + 2] + randomValues[i + 0]);
      array[i + 1] = originalPosition[i + 1] + 0.2 * Math.sin(time * randomValues[i + 2] + randomValues[i + 1]);
    }
    meshObj.geometry.attributes.position.needsUpdate = true;
  }
}

function generatePlane(meshObj) {
  animatePlane(meshObj, 0.0);
  const colors = [];
  for (let i = 0; i < meshObj.geometry.attributes.position.count; i += 1) {
    colors.push(oldColorA.r, oldColorA.g, oldColorA.b);
  }
  meshObj.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

function createPlane() {
  if (planeMesh != null && planeMesh != undefined) {
    planeMesh.geometry.dispose();

    const genData = generators.plane(world.plane.width, world.plane.height, world.plane.segments, world.plane.segments);
    planeMesh.geometry = generators.createGeom(genData);
    generators.apply(genData, planeMesh.geometry);

    generateInitialVtxArray(planeMesh);
    generatePlane(planeMesh);
  }
}