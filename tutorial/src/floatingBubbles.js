import * as THREE from 'three';

export class FloatingBubbles {
    constructor(scene) {
        this.dummy = new THREE.Object3D();

        const geometry = new THREE.CircleGeometry(1, 6);
        const material = new THREE.MeshNormalMaterial();
        this.count = 100;
        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(this.mesh);

        this.numAlive = 0;
        this.createRate = this.count / 7; //25;
        this.createCount = 0;
        this.particles = [];
        for (let i = 0; i < this.count; ++i) {
            this.particles.push({
                x: 0.0,
                y: 0.0,
                z: 0.0,
                vx: 0.0,
                vy: 0.0,
                vz: 0.0,
                scale: 0.0,
                time: 5.0,
                life: 5.0
            });
        }
    }

    update(camera, deltaTime) {
        if (this.mesh) {

            const width = 10.0;
            this.createCount += this.createRate * deltaTime;
            for (let i = 0; i < this.count && this.createCount > 0; ++i) {
                let p = this.particles[i];
                if (p.time >= p.life) {
                    p.x = (Math.random() * 2.0 - 1.0) * width;
                    p.y = -5.0;
                    p.z = 0.0;
                    p.vx = (Math.random() * 2.0 - 1.0) * 0.6;
                    p.vy = 2.0;
                    p.vz = 0.0;
                    p.scale = 1.0;
                    p.time = 0.0;
                    p.life = 5.0 + 2.0 * (Math.random() * 2.0 - 1.0);
                    this.createCount -= 1.0;
                }
            }

            for (let i = 0; i < this.count; ++i) {
                let p = this.particles[i];
                const lifePct = Math.min(p.time / p.life, 1.0);
                p.time += deltaTime;
                p.scale = 1.0 - lifePct;
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.z += p.vz * deltaTime;
                this.dummy.scale.set(p.scale, p.scale, p.scale);
                this.dummy.position.set(p.x, p.y, p.z);
                this.dummy.rotation.set(0.0, 0.0, lifePct * Math.PI * 2 * -p.vx);
                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(i++, this.dummy.matrix);
            }
            this.mesh.instanceMatrix.needsUpdate = true;
        }
    }
}