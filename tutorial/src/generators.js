//
// https://blog.cjgammon.com/threejs-geometry/
//
import * as THREE from 'three';

import {
    PerlinNoise
} from "/src/perlin.js";

import {
    SimplexNoise
} from "/src/simplex.js";

export const generators = {};

const noise = new SimplexNoise();
//const noise = new PerlinNoise();

generators.createGeom = function (generatedData) {
    const geom = new THREE.BufferGeometry();
    this.apply(generatedData, geom);
    return geom;
}

generators.apply = function (generatedData, geomObj) {
    geomObj.setAttribute('position', new THREE.Float32BufferAttribute(generatedData.vertices, 3));
    geomObj.setAttribute('normal', new THREE.Float32BufferAttribute(generatedData.normals, 3));
    geomObj.setAttribute('color', new THREE.Float32BufferAttribute(generatedData.colors, 3));
    geomObj.setAttribute('uv', new THREE.Float32BufferAttribute(generatedData.uv, 2));
    geomObj.setIndex(generatedData.indices);
};

function vec3_new(v, idx) {
    return {
        x: v[idx * 3],
        y: v[idx * 3 + 1],
        z: v[idx * 3 + 2]
    };
}

function vec3_xyz(x, y, z) {
    return {
        x: x,
        y: y,
        z: z
    };
}

function vec3_len(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

function vec3_norm(a) {
    const l = vec3_len(a);
    return {
        x: a.x / l,
        y: a.y / l,
        z: a.z / l
    };
}

function vec3_sub(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
}

function vec3_add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}

function vec3_add3(a, b, c) {
    return {
        x: a.x + b.x + c.x,
        y: a.y + b.y + c.y,
        z: a.z + b.z + c.z
    };
}

function vec3_cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: -(a.x * b.z - a.z * b.x),
        z: a.x * b.y - a.y * b.x
    };
}

function face_nrm(v, a, b, c) {
    const pa = vec3_new(v, a);
    const pb = vec3_new(v, b);
    const pc = vec3_new(v, c);
    const ab = vec3_sub(pb, pa);
    const ac = vec3_sub(pc, pa);
    const cross = vec3_cross(ab, ac);
    const nrm = vec3_norm(cross);
    return nrm;
}

generators.plane = function (width, height, segW, segH) {

    segW = Math.max(Math.floor(segW), 1);
    segH = Math.max(Math.floor(segH), 1);

    //
    // segW = 3
    // segH = 2
    //
    // +---+---+---+
    // |   |   |   |
    // +---+---+---+
    // |   |   |   |
    // +---+---+---+
    //
    // numVtxRow = segW + 1
    // numVtxY = segH + 1
    // numVtx = numVtxX * numVtxY
    //
    // numSegments = segW * segH
    // numTriangles = numSegments * 2
    // numTriIdx = numTriangles * 3
    //
    const vertices = [];
    const vtxNorm = new Map();
    const normals = [];
    const colors = [];
    const uvs = [];
    const indices = [];
    const offsX = -width * 0.5;
    const offsY = -height * 0.5;
    const numVtxRow = segW + 1;
    for (let segY = 0; segY <= segH; segY++) {
        for (let segX = 0; segX <= segW; segX++) {
            const pctX = segX / segW;
            const pctY = segY / segH;
            const posX = offsX + pctX * width;
            const posY = offsY + pctY * height;

            // XY plane
            //vertices.push(posX, posY, 0.0);
            //normals.push(0.0, 0.0, 1.0);

            // XZ plane
            const posH = 0.2 * noise.noise2d(posX, posY);
            vertices.push(posX, posH, posY);
            normals.push(0.0, 1.0, 0.0);

            colors.push(1.0, 1.0, 1.0);
            uvs.push(pctX, pctY);

            const vtxIdx = segX + segY * numVtxRow;
            vtxNorm.set(vtxIdx, vec3_xyz(0, 0, 0));
        }
    }

    for (let segY = 0; segY < segH; segY++) {
        for (let segX = 0; segX < segW; segX++) {
            const a = (segX + 0) + (segY + 0) * numVtxRow;
            const b = (segX + 1) + (segY + 0) * numVtxRow;
            const c = (segX + 1) + (segY + 1) * numVtxRow;
            const d = (segX + 0) + (segY + 1) * numVtxRow;

            // Clockwise
            indices.push(a, c, b);
            indices.push(a, d, c);

            // Vertex normals
            const nfa = face_nrm(vertices, a, c, b);
            const nfb = face_nrm(vertices, a, d, c);

            //console.log("idx", a, vtxNorm.get(a));
            const na = vec3_add3(vtxNorm.get(a), nfa, nfb);
            const nb = vec3_add(vtxNorm.get(b), nfa);
            const nc = vec3_add3(vtxNorm.get(c), nfa, nfb);
            const nd = vec3_add(vtxNorm.get(d), nfb);

            vtxNorm.set(a, na);
            vtxNorm.set(b, nb);
            vtxNorm.set(c, nc);
            vtxNorm.set(d, nd);
        }
    }

    for (let i = 0; i < vertices.length / 3; i++) {
        const normal = vec3_norm(vtxNorm.get(i));
        const idx = i * 3;
        normals[idx + 0] = normal.x;
        normals[idx + 1] = normal.y;
        normals[idx + 2] = normal.z;
    }

    return {
        vertices: vertices,
        normals: normals,
        colors: colors,
        uv: uvs,
        indices: indices
    };
};