import * as mat4 from './gl-matrix-3.3.0/src/mat4.js'
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js'

import GameObject from "./gameObject.js"
import Material from "./material.js"
import { loadShaderFiles, initShaderProgram } from "./initshaders.js"
import  MeshCreator from "./meshCreator.js"
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
    directionalLight = mat4.create()

    lightPosition = vec3.create()
    cameraPosition = vec3.create()

    materials = []
    textures = []
    scene = []

    timeLast = 0

    depthTextureExt

    shadowMapFramebuffer
    shadowMapTexture

    constructor(canvasId){
        
        //Get Canvas and initialize the GL context
        this.canvas = document.querySelector(canvasId)

        this.gl = this.canvas.getContext("webgl")

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.")
            return
        }
        
       this.textures.push(createEmptyTexture(this.gl))
       this.textures.push(loadTexture(this.gl, './images/ground.jpg'))
       
       this.materials['normal']=new Material(0,[0,0,0])
       this.materials['ground']=new Material(1,[0,0,0])
       this.materials['shadow']=new Material(2,[0,0,0])

       this.depthTextureExt = this.gl.getExtension('WEBGL_depth_texture');

       this.createShaderProgram('/shaders/shader.vs', '../shaders/shader.fs')
       .then((res) => {
            this.shaderPrograms.push(res)
            this.createShaderProgram('../shaders/shadowShader.vs', '../shaders/shadowShader.fs')
            .then((res) => {
                this.shaderPrograms.push(res)
                this.initBuffers()
                .then((res)=>{
                    this.buffer = res
                    this.start()
                })
            })
       })
    }

    start(){
        //Set camera position to [0,0,-10]
        let eye = vec3.create()
        eye = [0,3,-10]
        this.cameraPosition=eye
        let lookatPos = vec3.create()
        lookatPos = [0,0,0]
        let upDir = vec3.create()
        upDir=[0,1,0]
        mat4.lookAt(this.mView,eye,lookatPos,upDir)

        let lightPos = vec3.create()
        lightPos = [20,10, 0]
        this.lightPosition = lightPos
        mat4.lookAt(this.directionalLight, lightPos, lookatPos, upDir)

        this.scene.push(new GameObject(null, null, [0,3,-10]))    //Camera
        this.scene.push(new GameObject(this.meshProperties['teapot'], this.materials['normal'], [0,0.7,0], [0,0,0], [0.2,0.2,0.2]))
        // this.scene.push(new GameObject(this.meshProperties['plane'], this.materials['shadow'], [0,0,-9.9], [0,0,0], [0.2,0.2,0.2]))
        this.scene.push(new GameObject(this.meshProperties['plane'], this.materials['ground'], [0,-1,0], [90,0,0], [20,20,20]))

        this.createControls()

        requestAnimationFrame(()=>this.update(Date.now()))
    }

    update(timeNow){
        timeNow *= 0.001  // convert to seconds
        const deltaTime = timeNow - this.timeLast
        this.timeLast = timeNow

        if(this.scene[1]){
            //this.scene[1].transform.position[2] = -20;
            // this.scene[1].transform.position[0] = Math.sin(-timeNow*5);
            this.scene[1].transform.rotation[1] -= deltaTime*23;
            // gameObjects[1].transform.rotation[1] -= deltaTime;
        }

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

    initBuffers(){
        const meshCreator = new MeshCreator()
        
        const promisePlane =  meshCreator.plane(this.meshProperties)
        const promiseObj = meshCreator.objFile(this.meshProperties, './obj/teapot.obj')

        return Promise.all([promisePlane, promiseObj]).then((values) => {
            //Combine multiple mesh datas to one large
            let longMeshData = {
                vertices: [],
                indices: [],
                colors: [],
                normals: [],
                textureCoordinates: []
            }
            
            values.forEach(meshData => {
                meshData.indices = meshData.indices.map(function(item){
                    return item+longMeshData.vertices.length/3
                })
                longMeshData.vertices = longMeshData.vertices.concat(meshData.vertices)
                longMeshData.indices = longMeshData.indices.concat(meshData.indices)
                longMeshData.colors = longMeshData.colors.concat(meshData.colors)
                longMeshData.normals = longMeshData.normals.concat(meshData.normals)
                longMeshData.textureCoordinates = longMeshData.textureCoordinates.concat(meshData.textureCoordinates)
            })

            //Pass positions to the buffer
            const positionBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Float32Array(longMeshData.vertices),
                this.gl.STATIC_DRAW)
            
            //Indices
            const indexBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(longMeshData.indices), this.gl.STATIC_DRAW)
            
            //Color
            const colorBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longMeshData.colors), this.gl.STATIC_DRAW)
            
            //Normals
            const normalBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longMeshData.normals), this.gl.STATIC_DRAW)
            
            //UV
            const textureCoordBuffer = this.gl.createBuffer()
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer)
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(longMeshData.textureCoordinates), this.gl.STATIC_DRAW)

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
        });
    }

    createControls(){
        document.addEventListener('keydown', (event) => {
            console.log(event.key)
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
            let lookatPos = vec3.create()
            lookatPos = [0,0,0]

            let upDir = vec3.create()
            upDir=[0,1,0]

            let lightPos = vec3.create()
            lightPos = this.lightPosition
            this.lightPosition = lightPos
            mat4.lookAt(this.directionalLight, lightPos, lookatPos, upDir)
           
            let eye = vec3.create()
            eye = this.scene[0].transform.position
            this.cameraPosition=eye

            mat4.lookAt(this.mView,eye,lookatPos,upDir)
        });
    }
}
export default Wengine;