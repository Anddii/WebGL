import {subDivide} from "./subdivide.js"
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';
import * as vec4 from './gl-matrix-3.3.0/src/vec4.js';


export function cube(subDivisions){
  let positions =[
    [-1,-1,1], [1,-1,1],
    [-1,1,1], [1,1,1],
    [ 1,1,-1], [-1,1,-1],
    [1,-1,-1], [-1,-1,-1]
  ]
  let indices = [
    0,1,2, 3,2,1,
    3,4,5, 2,3,5,
    6,1,0, 7,6,0,
    5,4,7, 7,4,6,
    6,4,3, 1,6,3,
    0,2,7, 7,2,5
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

  const textureCoordinates = [
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ]

  return{
      vertices: positions,
      indices: indices,
      colors: colors,
      normals: normals,
      textureCoordinates: textureCoordinates
  }
}

export function triangle(){
  let positions =[
    [-10, -10, 0], [10, -10, 0],[0, 10, 0]
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

export function plane(){
  let positions =[
    [-1, -1, 0], [1, -1, 0],
    [-1, 1, 0], [1, 1, 0]
  ]
  let indices = [0,1,2, 3,2,1];

  positions = [].concat.apply([], positions);
  const colors = [];
  const normals = [];
  for(var i = 0; i<positions.length/3; i++){
    let normal = vec4.create();
    normal[0] = 0
    normal[1] = 0
    normal[2] = 1
    colors.push(1,1,1,1)
    vec3.normalize(normal, normal)
    normal.forEach(element => {
      normals.push(element)
    });
  }

  const textureCoordinates = [
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ]

  return{
      vertices: positions,
      indices: indices,
      colors: colors,
      normals: normals,
      textureCoordinates: textureCoordinates
  }
}

export function geoSphere(subDivisions){
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