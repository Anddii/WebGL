import * as mat4 from './gl-matrix-3.3.0/src/mat4.js'
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js'

import GameObject from "./gameObject.js"
import Material from "./material.js"
import { loadShaderFiles, initShaderProgram } from "./initshaders.js"
import  MeshCreator from "./meshCreator.js"
import {loadTexture, createEmptyTexture} from "./loadTexture.js"

import {shadowMapRender, render} from "./render.js"

import {loadScene} from './loadScene.js'

class Wengine{
    
    gl
    canvas
    shaderPrograms = []
    programInfo = []
    buffer
    meshProperties = {}

    longBufferData = {}

    mView = mat4.create()
    directionalLight = mat4.create()

    lightPosition = vec3.create()
    cameraPosition = vec3.create()

    materials = []
    textures = []
    
    sceneStart = []
    scene = []

    timeLast = 0

    depthTextureExt

    shadowMapFramebuffer
    shadowMapTexture

    playing = false

    constructor(canvasId){
        
        //Get Canvas and initialize the GL context
        this.canvas = document.querySelector(canvasId)

        this.gl = this.canvas.getContext("webgl")

        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.")
            return
        }


        loadScene('/scenes/scene.json')
        .then((resp)=>{
            this.sceneStart=resp
            this.scene=resp
        })

        this.textures.push(createEmptyTexture(this.gl))
        this.textures.push(loadTexture(this.gl, './images/ground.jpg'))

        loadScene('/materials/materials.json')
        .then((resp)=>{
            console.log(resp)
            for(const material in resp){
                const key = Object.keys(resp[material])[0]
                this.materials[key]= new Material(resp[material][key].texture,resp[material][key].color)
            }
        })
        
        // this.materials['normal']=new Material(0,{r:1,g:1,b:1,a:1})
        // this.materials['ground']=new Material(1,{r:1,g:1,b:1,a:1})
        // this.materials['shadow']=new Material(2,{r:1,g:1,b:1,a:1})

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

        this.createControls()

        this.timeLast = Date.now() * 0.001
        requestAnimationFrame(()=>this.update(Date.now()))
    }

    update(timeNow){

        timeNow *= 0.001  // convert to seconds
        const deltaTime = timeNow - this.timeLast
        this.timeLast = timeNow

        const upDir = [0,1,0]
        const lookatPos = [0,0,0]
        const eye = this.scene[0].transform.position
        this.cameraPosition=eye

        this.lightPosition = this.scene[1].transform.position
        mat4.lookAt(this.mView,eye,lookatPos,upDir)
        mat4.lookAt(this.directionalLight, this.lightPosition, lookatPos, upDir)

        if(this.playing){
            if(this.scene[2]){
                this.scene[2].transform.rotation[1] += deltaTime*32
            }
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

    initBuffers(){
        const meshCreator = new MeshCreator()
        
        const promisePlane =  meshCreator.plane(this.meshProperties)
        const promiseObj = meshCreator.objFile(this.meshProperties, './obj/teapot2.obj')

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

            this.longBufferData = longMeshData

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

    }

    resetScene(){
        this.scene = JSON.parse(JSON.stringify(this.sceneStart));
    }

    getScene(){
        return this.scene
    }

    setScene(scene){
        this.sceneStart = scene
        this.scene = scene
    }
    
    getWengine(){
        return this
    }

    setPlaying(playing){
        this.playing = playing
    }
}
export default Wengine;