import { loadShaderFiles, initShaderProgram } from "./initshaders.js";
import * as mat4 from './gl-matrix-3.3.0/src/mat4.js';
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';
import {loadTexture} from "./loadTexture.js"
import GameObject from "./GameObject.js"
import  meshCreator from "./meshCreator.js";
import { toRadian } from "./gl-matrix-3.3.0/src/common.js";

const vs = '../shaders/shader.vs'
const fs = '../shaders/shader.fs'

let gameObjects = []
let meshProperties = {}

let mView;
mView = mat4.create();

let eye = vec3.create();
eye = [0,0,0]
let lookatPos = vec3.create();
lookatPos = [0,0,-10]
let upDir = vec3.create();
upDir=[0,1,0]
mat4.lookAt(mView,eye,lookatPos,upDir)

function initBuffersSphere(gl) {

  const meshCreat = new meshCreator();

  const allData = []
  allData.push(meshCreat.cube(meshProperties))
  allData.push(meshCreat.plane(meshProperties))

  for(let i = 0; i < 100; i++){
    gameObjects.push(new GameObject(meshProperties['cube'],[Math.random() * (10 - -10) + -5,Math.random() * (10 - -10) + -5,Math.random() * (-50 - -10) + -10]))
  }

  let cubeBuffer = {
    vertices: [],
    indices: [],
    colors: [],
    normals: [],
    textureCoordinates: []
  };

  allData.forEach(element => {
    console.log(cubeBuffer.vertices.length/3)
    element.indices = element.indices.map(function(item){
      return item+cubeBuffer.vertices.length/3;
    })
    cubeBuffer.vertices = cubeBuffer.vertices.concat(element.vertices)
    cubeBuffer.indices = cubeBuffer.indices.concat(element.indices)
    cubeBuffer.colors = cubeBuffer.colors.concat(element.colors)
    cubeBuffer.normals = cubeBuffer.normals.concat(element.normals)
    cubeBuffer.textureCoordinates = cubeBuffer.textureCoordinates.concat(element.textureCoordinates)
  });

  console.log(cubeBuffer)

  //Pass positions to the buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(cubeBuffer.vertices),
    gl.STATIC_DRAW);
  
  //Indices
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeBuffer.indices), gl.STATIC_DRAW);
  
  //Color
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeBuffer.colors), gl.STATIC_DRAW);
  
  //Normals
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeBuffer.normals), gl.STATIC_DRAW);
  
  //UV
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeBuffer.textureCoordinates), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    textureCoord: textureCoordBuffer,
  };
}

function drawScene(gl, programInfo, buffers, texture) {
  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   toRadian(50),
                   aspect,
                   zNear,
                   zFar);

  // Tell WebGL how to pull out the positions from the position buffer
  {
    const numComponents = 3;  // pull out 3 values per iteration
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

  // Tell WebGL how to pull out the Normals
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  // tell webgl how to pull out the texture coordinates from buffer
  {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  }

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the drawing position to the "identity" point
  
  gameObjects.forEach((gameObject, index) => {
    
    const modelViewMatrix = mat4.create();
    // Now move the drawing position
    mat4.translate(modelViewMatrix,
      modelViewMatrix,
      [gameObject.transform.position[0], gameObject.transform.position[1], gameObject.transform.position[2]]);
      
    mat4.rotate(modelViewMatrix, modelViewMatrix, gameObject.transform.rotation[0] * 1, [1.0, 0.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, gameObject.transform.rotation[1] * 1, [0.0, 1.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, gameObject.transform.rotation[2] * 1, [0.0, 0.0, 1.0]);
    
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
      
      // Set the shader uniforms
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.uNormalMatrix,
      false,
      normalMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.viewMatrix,
      false,
      mView);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
        
    {
      // Tell WebGL we want to affect texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      // Bind the texture to texture unit 0
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Tell the shader we bound the texture to texture unit 0
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
      
      //const vertexCount = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE)/2;
      let vertexCount = gameObject.mesh.vertexCount;
      let offset = gameObject.mesh.offset;
      const type = gl.UNSIGNED_SHORT;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  });
}

var then = 0;
let gl;
let programInfo;
let buffer;
let texture; 

// Draw the scene repeatedly
function update(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  if(gameObjects[0]){
    gameObjects[0].transform.position[0] = Math.sin(now)*3;
    gameObjects[0].transform.rotation[1] += deltaTime;
    // gameObjects[0].transform.rotation[2] += deltaTime;
  }

  if(gameObjects[1]){
    gameObjects[1].transform.position[0] = Math.sin(-now);
    gameObjects[1].transform.rotation[0] -= deltaTime;
    // gameObjects[1].transform.rotation[1] -= deltaTime;
  }

  if(gl && programInfo && buffer)
    drawScene(gl, programInfo, buffer, texture, deltaTime);

  requestAnimationFrame(update);
}

function main() {
  //Get Canvas and initialize the GL context
  const canvas = document.querySelector("#glCanvas");
  // canvas.width  = window.innerWidth;
  // canvas.height = window.innerHeight;
  gl = canvas.getContext("webgl");
  texture = loadTexture(gl, './images/logo.jpg');

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
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            uNormalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        },
      };
      buffer = initBuffersSphere(gl);
    })
  })
}

document.addEventListener('keydown', function(event) {
  switch (event.key) {
    case "d":
      mat4.translate(mView,mView,[-0.1,0,0.0])
      break;
    case "a":
      mat4.translate(mView,mView,[0.1,0,0.0])
      break;
    case "w":
      mat4.translate(mView,mView,[0,0,0.1])
      break;
    case "s":
      mat4.translate(mView,mView,[0,0,-0.1])
      break;
    case "e":
      mat4.rotateY(mView,mView,-0.1)
      break;
  }
});
  
window.onload = main;
requestAnimationFrame(update);