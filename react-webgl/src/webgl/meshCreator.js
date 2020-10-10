import {subDivide} from "./subdivide.js"
import {loadObjFile} from "./loadObj.js"
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';
import * as vec4 from './gl-matrix-3.3.0/src/vec4.js';

export default class MeshCreator{
  offset = 0;

  objFile(meshProperties, filePath){

    return new Promise((resolve, reject)=>{
      loadObjFile(filePath)
      .then((res)=>{
        meshProperties['teapot'] = {
          offset: this.offset,
          vertexCount: res.indices.length,
        }
        this.offset = res.positions.length;

        resolve({
          vertices: res.positions,
          indices: res.indices,
          colors: res.colors,
          normals: res.normals,
          // textureCoordinates: textureCoordinates
        })
      })
    })
  }

  cube(meshProperties){

    const positions = [
      // Front face
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      
      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,
      
      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,
      
      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
      
      // Right face
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      
      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ];
    const indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ];

    const normals = [
      // Front
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,

      // Back
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,

      // Top
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,

      // Bottom
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,

      // Right
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,

      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ];

    const colors = [];
    for(var i = 0; i<positions.length/3; i++){
      colors.push(1,1,1,1)
    }

    const textureCoordinates = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
    ];

    meshProperties['cube'] = {
      offset: this.offset,
      vertexCount: indices.length,
    }

    this.offset = positions.length;

    return{
        vertices: positions,
        indices: indices,
        colors: colors,
        normals: normals,
        textureCoordinates: textureCoordinates
    }
  }

  triangle(){
    let positions =[
      [-1, -1, 0], [1, -1, 0],[0, 1, 0]
    ]
    let indices = [0,1,2];
    positions = [].concat.apply([], positions);

    const textureCoordinates = []
    const colors = [];
    const normals = [];
    return{
      vertices: positions,
      indices: indices,
      colors: colors,
      normals: normals,
      textureCoordinates: textureCoordinates
    }
  }

  plane(meshProperties){
    return new Promise((resolve, reject)=>{
      let positions =[
        [-1, -1, 0], [1, -1, 0],
        [-1, 1, 0], [1, 1, 0]
      ]
      let indices = [2,1,0, 1,2,3];

      positions = [].concat.apply([], positions);
      const colors = [];
      const normals = [
        0.0,  0.0,  -1.0,
        0.0,  0.0,  -1.0,
        0.0,  0.0,  -1.0,
        0.0,  0.0,  -1.0,
      ];
      for(var i = 0; i<positions.length/3; i++){
        colors.push(1,1,1,1)
      }

      const textureCoordinates = [
        1.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        0.0,  0.0,
      ]

      meshProperties['plane'] = {
        offset: this.offset,
        vertexCount: indices.length,
      }

      this.offset = positions.length;
      resolve({
        vertices: positions,
        indices: indices,
        colors: colors,
        normals: normals,
        textureCoordinates: textureCoordinates
      })
    })

  }

  geoSphere(subDivisions){
    const X = 0.525731;
    const Z = 0.850651;
    let positions =[
        [-X, 0, Z], [X, 0, Z],
        [-X, 0, -Z], [X, 0, -Z],
        [0, Z, X], [0, Z, -X],
        [0, -Z, X], [0, -Z, -X],
        [Z, X, 0], [-Z, X, 0],
        [Z, -X, 0], [-Z, -X, 0]
    ]
    let indices =
    [
      1,4,0, 4,9,0, 4,5,9, 8,5,4, 1,8,4,
      1,10,8, 10,3,8, 8,3,5, 3,2,5, 3,7,2,
      3,10,7, 10,6,7, 6,11,7, 6,0,11, 6,1,0,
      10,1,6, 11,0,9, 2,11,9, 5,2,9, 11,2,7
    ];
    for(let i = 0; i<subDivisions; i++){
      const values = subDivide(positions, indices)
      positions = values[0]
      indices = values[1]
    }
    
    positions = [].concat.apply([], positions);
    for(var i = 0; i < positions.length/3; i++){
      let vec = vec3.create();
      vec[0] = positions[i*3+0]
      vec[1] = positions[i*3+1]
      vec[2] = positions[i*3+2]
      let n = vec3.normalize(vec, vec)
      positions[i*3+0] = n[0]
      positions[i*3+1] = n[1]
      positions[i*3+2] = n[2]
    }
    const colors = [];
    const normals = [];
    for(var i = 0; i<positions.length/3; i++){
      let normal = vec4.create();
      normal[0] = positions[i*3+0]
      normal[1] = positions[i*3+1]
      normal[2] = positions[i*3+2]
      colors.push(1,1,1,1)
      vec3.normalize(normal, normal)
      normal.forEach(element => {
        normals.push(element)
      });
    }

    return{
        vertices: positions,
        indices: indices,
        colors: colors,
        normals: normals
    }
  }
}