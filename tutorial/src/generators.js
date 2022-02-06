//
// https://blog.cjgammon.com/threejs-geometry/
//
import * as THREE from 'three';

export const generators = {};

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
    //console.log(geomObj);
    //console.log(generatedData);
};

generators.plane = function (width, height, segW, segH) {
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
    const normals = [];
    const colors = [];
    const uvs = [];
    const indices = [];
    let offsX = -width * 0.5;
    let offsY = -height * 0.5;
    for (let segY = 0; segY <= segH; segY++) {
        for (let segX = 0; segX <= segW; segX++) {
            let pctX = segX / segW;
            let pctY = segY / segH;
            let posX = offsX + pctX * width;
            let posY = offsY + pctY * height;

            // XY plane
            //vertices.push(posX, posY, 0.0);
            //normals.push(0.0, 0.0, 1.0);

            // XZ plane
            vertices.push(posX, 0.0, posY);
            normals.push(0.0, 1.0, 0.0);

            colors.push(1.0, 1.0, 1.0);
            uvs.push(pctX, pctY);
        }
    }

    let numVtxRow = segW + 1;
    for (let segY = 0; segY < segH - 1; segY++) {
        for (let segX = 0; segX < segW - 1; segX++) {
            let a = (segX + 0) + (segY + 0) * numVtxRow;
            let b = (segX + 1) + (segY + 0) * numVtxRow;
            let c = (segX + 1) + (segY + 1) * numVtxRow;
            let d = (segX + 0) + (segY + 1) * numVtxRow;
            // Clockwise
            indices.push(a, b, c);
            indices.push(a, c, d);
        }
    }
    return {
        vertices: vertices,
        normals: normals,
        colors: colors,
        uv: uvs,
        indices: indices
    };
};