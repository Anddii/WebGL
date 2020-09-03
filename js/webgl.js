import { loadShaderFiles, initShaderProgram } from "./initshaders.js";
import * as mat4 from './gl-matrix-3.3.0/src/mat4.js';
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';

const vs = '../shaders/shader.vs'
const fs = '../shaders/shader.fs'

var squareRotation = 0.0;

function midPoint(v1, v2){
  let midPoint = [0.5*(v1[0]+v2[0]), 0.5*(v1[1]+v2[1]), 0.5*(v1[2]+v2[2])]
  return midPoint
}

function subDivide(verticles, indices){
  const newVerticles = []
  const newIndices = []
  // FROM: https://github.com/d3dcoder/d3d12book/blob/master/Common/GeometryGenerator.cpp
  //       v1
  //       *
  //      / \
  //     /   \
  //  m0*-----*m1
  //   / \   / \
  //  /   \ /   \
  // *-----*-----*
  // v0    m2     v2
  var numTris = indices.length/3;
  for(var i = 0; i < numTris; ++i)
	{
    let v0 = verticles[indices[i*3+0]];
		let v1 = verticles[indices[i*3+1]];
    let v2 = verticles[indices[i*3+2]];
    
    let m0 = midPoint(v0, v1);
    let m1 = midPoint(v1, v2);
    let m2 = midPoint(v0, v2);

    newVerticles.push(v0)
    newVerticles.push(v1)
    newVerticles.push(v2)

    newVerticles.push(m0)
    newVerticles.push(m1)
    newVerticles.push(m2)
    
    newIndices.push(i*6+0);
		newIndices.push(i*6+3);
		newIndices.push(i*6+5);

		newIndices.push(i*6+3);
		newIndices.push(i*6+4);
		newIndices.push(i*6+5);

		newIndices.push(i*6+5);
		newIndices.push(i*6+4);
		newIndices.push(i*6+2);

		newIndices.push(i*6+3);
		newIndices.push(i*6+1);
		newIndices.push(i*6+4);
  }
  return [newVerticles, newIndices]
}

function initBuffersSphere(gl) {
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
  
  for(let i = 0; i<1; i++){
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

  //Pass positions to the buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);
  
  //Pass indices
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const colors = [];
  for(var i = 0; i<positions.length/3; i++){
    colors.push(1,1,0,1)
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer
  };
}

function initBuffers(gl) {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();
  // Select the positionBuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
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
  ];

  // Now pass the list of positions into WebGL
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positions),
                gl.STATIC_DRAW);
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const colors = [
    1.0,  1.0,  1.0,  1.0,
    1.0,  0.0,  0.0,  1.0,
    0.0,  1.0,  0.0,  1.0,
    0.0,  0.0,  1.0,  1.0,
    1.0,  1.0,  0.0,  1.0,
    1.0,  0.0,  1.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    0,  3,  4,      4,  3,  5,    // left
    6,  2,  1,      7,  6,  1,    // rigth
    4,  1,  0,      1,  4,  7,    // bottom
    3,  2,  5,      6,  5,  2     // top
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer
  };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // gl.enable(gl.CULL_FACE);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point
  const modelViewMatrix = mat4.create();

  // Now move the drawing position
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation * 2.7, [0.5, 0.0, 0.0]);
  
  squareRotation += deltaTime;

  // Tell WebGL how to pull out the positions from the position buffer
  {
    const numComponents = 3;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE)/2;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

var then = 0;
let gl;
let programInfo;
let buffer;
// Draw the scene repeatedly
function update(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  if(gl && programInfo && buffer)
    drawScene(gl, programInfo, buffer, deltaTime);

  requestAnimationFrame(update);
}

function main() {
  //Get Canvas and initialize the GL context
  const canvas = document.querySelector("#glCanvas");
  gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  let vsShader;
  let fsShader;
  let shaderProgram;
  
  loadShaderFiles(vs)
  .then(res => {
    vsShader=res
    loadShaderFiles(fs)
    .then(res =>{
      fsShader=res
      shaderProgram = initShaderProgram(gl, vsShader, fsShader)
      programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
      };
      buffer = initBuffersSphere(gl);
      //drawScene(gl, programInfo, buffer)
    })
  })
}
  
window.onload = main;
requestAnimationFrame(update);