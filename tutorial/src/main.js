import * as THREE from 'three';

import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';

import {
  FontLoader
}
from 'three/examples/jsm/loaders/FontLoader.js';

import {
  TextGeometry
}
from 'three/examples/jsm/geometries/TextGeometry.js';

import * as dat from "dat.gui";

import gsap from "gsap";

import {
  generators
} from "/src/generators.js";

import {
  AnimatingPlane
}
from '/src/animatingPlane.js';

import {
  FloatingBubbles
}
from '/src/floatingBubbles.js';

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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75.0, innerWidth / innerHeight, 0.1, 5000.0);
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

scene.background = new THREE.Color(0x104070);

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


const loader = new FontLoader();
loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
  const matLite = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide
  });

  const message = 'Hello';
  const shapes = font.generateShapes(message, 1);
  const geometry = new THREE.ShapeGeometry(shapes);
  geometry.computeBoundingBox();

  const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
  geometry.translate(xMid, 0, 0);

  // make shape ( N.B. edge view not visible )
  const text = new THREE.Mesh(geometry, matLite);
  text.position.z = 0;
  scene.add(text);
});

camera.position.z = 5;
//camera.position.y = 2;

const floatingBubbles = new FloatingBubbles(scene);
//const animatingPlane = new AnimatingPlane(scene, 10, 10, 20);
const clock = new THREE.Clock();

function animate(timestamp) {
  let deltaTime = clock.getDelta();

  floatingBubbles.update(camera, deltaTime);
  //animatingPlane.update(camera, deltaTime);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);