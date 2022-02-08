import * as THREE from 'three';
import * as dat from "dat.gui";
import gsap from "gsap";

import {
    generators
} from "/src/generators.js";

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

export class AnimatingPlane {
    constructor(scene, width, height, segments) {

        const gui = new dat.GUI();
        this.world = {
            plane: {
                width: 10,
                height: 10,
                segments: 20
            }
        };
        gui.add(this.world.plane, 'width', 1, 50).onChange(() => {
            this.onGuiChanged();
        });
        gui.add(this.world.plane, 'height', 1, 50).onChange(() => {
            this.onGuiChanged();
        });
        gui.add(this.world.plane, 'segments', 1, 230).onChange(() => {
            this.onGuiChanged();
        });

        this.animationTime = 0.0;
        this.scene = scene;
        this.planeGeom = generators.createGeom(generators.plane(10, 10, 1, 1));
        this.planeMat = new THREE.MeshPhongMaterial({
            //color: 0x3388ff,
            //side: THREE.DoubleSide,
            //flatShading: THREE.FlatShading,
            vertexColors: true
        });
        this.planeMesh = new THREE.Mesh(this.planeGeom, this.planeMat);
        scene.add(this.planeMesh);
        this.createPlane(this.world.plane.width, this.world.plane.height, this.world.plane.segments);

        const light = new THREE.DirectionalLight(0xffffff, 1.0);
        light.position.set(0, 1, 1);
        scene.add(light);

        const light2 = new THREE.DirectionalLight(0x444444, 1.0);
        light2.position.set(0, 1, -1);
        scene.add(light2);

        this.raycaster = new THREE.Raycaster();

        this.mouse = {
            x: -1,
            y: -1,
            dx: 0,
            dy: 0
        };
        addEventListener('mousemove', (event) => {
            this.mouse.x = ((event.clientX / innerWidth) * 2.0) - 1.0;
            this.mouse.y = -(((event.clientY / innerHeight) * 2.0) - 1.0);
            this.mouse.dx = event.movementX / innerWidth;
            this.mouse.dy = -event.movementY / innerHeight;
        });
    }

    onGuiChanged() {
        this.createPlane(this.world.plane.width, this.world.plane.height, this.world.plane.segments);
    }

    hoverIntersect(intersect) {
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

    update(camera, deltaTime) {
        this.animationTime += deltaTime;
        this.animatePlane(this.planeMesh, this.animationTime);

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObject(this.planeMesh);
        if (intersects.length > 0) {
            this.hoverIntersect(intersects[0]);
        } else {
            this.hoverIntersect(null);
        }

    }

    generateInitialVtxArray(meshObj) {
        const {
            array
        } = meshObj.geometry.attributes.position;
        const colors = [];
        const randomValues = [];
        const originalValues = [];
        for (let i = 0; i < array.length; i += 3) {
            originalValues[i + 0] = array[i + 0];
            originalValues[i + 1] = array[i + 1];
            originalValues[i + 2] = array[i + 2] + 1.0 * Math.random();
            randomValues.push(Math.PI * 2 * Math.random());
            randomValues.push(Math.PI * 2 * Math.random());
            randomValues.push(1.0 + 0.5 * (Math.random() - 0.5));
            colors.push(oldColorA.r, oldColorA.g, oldColorA.b);
        }
        meshObj.geometry.attributes.position.originalPosition = originalValues;
        meshObj.geometry.attributes.position.randomValues = randomValues;
        meshObj.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

    animatePlane(meshObj, time) {
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

    createPlane(width, height, segments) {
        if (this.planeMesh != null && this.planeMesh != undefined) {
            this.planeMesh.geometry.dispose();

            const genData = generators.plane(width, height, segments, segments);
            this.planeMesh.geometry = generators.createGeom(genData);

            this.generateInitialVtxArray(this.planeMesh);
        }
    }
}