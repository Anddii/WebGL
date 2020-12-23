import * as mat4 from './gl-matrix-3.3.0/src/mat4.js'
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js'

import GameObject from "./gameObject.js"
import { loadShaderFiles, initShaderProgram } from "./initshaders.js"

import {loadTexture, createEmptyTexture} from "./loadTexture.js"

import {shadowMapRender, render} from "./render.js"

class Wengine{
    
    gl
    canvas
    shaderPrograms = []
    programInfo = []
    buffer
    meshProperties = {}

    mView = mat4.create()
    cameraPosition = vec3.create()

    directionalLight = mat4.create()
    lightPosition = vec3.create()

    materials = []
    textures = []
    scene = []

    timeLast = 0

    depthTextureExt

    shadowMapFramebuffer
    shadowMapTexture

    playing = false

    constructor(canvasId, wengine){
        
        //Get Canvas and initialize the GL context
        this.canvas = document.querySelector(canvasId)

        this.gl = this.canvas.getContext("webgl")

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.")
            return
        }

        this.depthTextureExt = this.gl.getExtension('WEBGL_depth_texture');

        this.createShaderProgram('/shaders/shader.vs', '../shaders/shader.fs')
       .then((res) => {
            this.shaderPrograms.push(res)
            this.createShaderProgram('../shaders/shadowShader.vs', '../shaders/shadowShader.fs')
            .then((res) => {
                this.shaderPrograms.push(res)
                this.buffer=this.initBuffers(wengine.longBufferData)
                this.start(wengine)
            })
        })
        this.materials = wengine.materials
        this.textures.push(createEmptyTexture(this.gl))
        this.textures.push(loadTexture(this.gl, './images/ground.jpg'))

        

        this.cameraPosition=[0,3,-10]
        const lookatPos = [0,0,0]
        const upDir = [0,1,0]
        mat4.lookAt(this.mView,this.cameraPosition,lookatPos,upDir)

        this.lightPosition = wengine.lightPosition
        mat4.lookAt(this.directionalLight, this.lightPosition, lookatPos, upDir)

    }

    start(wengine){

        this.createControls()
        this.setPlaying(false, wengine)
        requestAnimationFrame(()=>this.update(Date.now()))
    }

    update(timeNow){
        timeNow *= 0.001  // convert to seconds
        const deltaTime = timeNow - this.timeLast
        this.timeLast = timeNow
        
        const eye = this.scene[0].transform.position
        this.cameraPosition=eye

        shadowMapRender(this);
        render(this)
        requestAnimationFrame(()=>this.update(Date.now()))

    }

    createProgram(shaderProgram){
        this.programInfo.push({
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                vertexNormal: this.gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: this.gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                viewMatrix: this.gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                uSampler: this.gl.getUniformLocation(shaderProgram, 'uSampler'),
                uNormalMatrix: this.gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                lightSpaceMatrix: this.gl.getUniformLocation(shaderProgram, 'uLightSpaceMatrix'),
                shadowMap: this.gl.getUniformLocation(shaderProgram, 'uShadowMap'),
                lightPosition: this.gl.getUniformLocation(shaderProgram, 'uLightPosition'),
                cameraPosition: this.gl.getUniformLocation(shaderProgram, 'uCameraPosition'),
                materialColor: this.gl.getUniformLocation(shaderProgram, 'aMaterialColor'),
            },
        })
    }

    createShaderProgram(vs, fs){
        return new Promise((resolve, reject)=>{
            let vsShader
            let fsShader
            let shaderProgram
            loadShaderFiles(vs)
            .then(res => {
                vsShader=res
                loadShaderFiles(fs)
                .then(res =>{
                    fsShader=res
                    shaderProgram = initShaderProgram(this.gl, vsShader, fsShader)
                    this.createProgram(shaderProgram)
                    resolve(shaderProgram)
                })
            })
        })
    }

    initBuffers(longBufferDatas){
        //Combine multiple mesh datas to one large
    
        //Pass positions to the buffer
        const positionBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER,
            new Float32Array(longBufferDatas.vertices),
            this.gl.STATIC_DRAW)
        
        //Indices
        const indexBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(longBufferDatas.indices), this.gl.STATIC_DRAW)
        
        //Color
        const colorBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longBufferDatas.colors), this.gl.STATIC_DRAW)
        
        //Normals
        const normalBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longBufferDatas.normals), this.gl.STATIC_DRAW)
        
        //UV
        const textureCoordBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longBufferDatas.textureCoordinates), this.gl.STATIC_DRAW)

        //Shadows
        this.shadowMapFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadowMapFramebuffer);

        this.shadowMapTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.shadowMapTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, 2024, 2024,
            0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, 
            this.gl.TEXTURE_2D, this.shadowMapTexture, 0);
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        return {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
            normals: normalBuffer,
            textureCoord: textureCoordBuffer,
        }
        
    }

    createControls(){
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case "d":
                    this.scene[0].transform.position[0] -= 1;
                break;
                case "a":
                    this.scene[0].transform.position[0] += 1;
                break;
                case "w":
                    this.scene[0].transform.position[2] += 1;
                break;
                case "s":
                    this.scene[0].transform.position[2] -= 1;
                break;
                case "e":
                    this.scene[0].transform.rotation[1] -= 0.5
                break;
                case "q":
                    this.scene[0].transform.rotation[1] += 0.5
                break;
                case "r":
                    this.scene[0].transform.position[1] += 1
                break;
                case "f":
                    this.scene[0].transform.position[1] -= 1
                break;

                case "ArrowRight":
                    this.lightPosition[0] -= 1;
                break;
                case "ArrowLeft":
                    this.lightPosition[0] += 1;
                break;
            }

            let cameraFront = [0,0,1]
            let lookatPos = vec3.create()
            lookatPos = [0,0,0]

            let upDir = vec3.create()
            upDir=[0,1,0]
           
            let eye = vec3.create()
            eye = this.scene[0].transform.position
            
            vec3.add(lookatPos,eye, cameraFront)
            this.cameraPosition=eye
            console.log(eye+cameraFront)
            mat4.lookAt(this.mView,eye,lookatPos,upDir)
        });
    }

    setPlaying(playing, wengine){
        this.playing = playing
        this.scene = []

        if(!playing){
            this.scene.push(new GameObject('MainCamera',null, null, this.cameraPosition))    //Camera
            for(let i = 1; i<wengine.sceneStart.length; i++){
                this.scene.push(wengine.sceneStart[i])
            }
            
        }else{
            console.log("hih")
            this.scene.push(new GameObject('MainCamera',null, null, this.cameraPosition))    //Camera
            for(let i = 1; i<wengine.scene.length; i++){
                this.scene.push(wengine.scene[i])
            }
        }
    }

    getScene(){
        return this.scene
    }
}
export default Wengine;