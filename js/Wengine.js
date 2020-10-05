import * as mat4 from './gl-matrix-3.3.0/src/mat4.js'
import * as vec3 from './gl-matrix-3.3.0/src/vec3.js'
import { toRadian } from "./gl-matrix-3.3.0/src/common.js"

import GameObject from "./GameObject.js"
import { loadShaderFiles, initShaderProgram } from "./Initshaders.js"
import  MeshCreator from "./MeshCreator.js"
import {loadTexture} from "./loadTexture.js"

export default class Wengine{
    
    gl
    shaderPrograms = []
    programInfo = []
    buffer
    meshProperties = {}

    mView = mat4.create()
    directionalLight = mat4.create()

    textures = []
    scene = []

    timeLast = 0

    depthTextureExt

    shadowMapFramebuffer
    shadowMapTexture

    constructor(canvasId){
        //Get Canvas and initialize the GL context
       const canvas = document.querySelector(canvasId)

       this.gl = canvas.getContext("webgl")
       // texture = loadTexture(this.gl, './images/logo.jpg')

       if (this.gl === null) {
           alert("Unable to initialize WebGL. Your browser or machine may not support it.")
           return
       }

       this.textures.push(loadTexture(this.gl, './images/logo.jpg'))

       this.depthTextureExt = this.gl.getExtension('WEBGL_depth_texture');

       this.createShaderProgram('../shaders/shader.vs', '../shaders/shader.fs')
       .then((res) => {
            this.shaderPrograms.push(res)
            this.createShaderProgram('../shaders/shadowShader.vs', '../shaders/shadowShader.fs')
            .then((res) => {
                this.shaderPrograms.push(res)
                this.buffer = this.initBuffers()
                this.start()
            })
       })
    }

    start(){
        //Set camera position to [0,0,-10]
        let eye = vec3.create()
        eye = [0,0,-10]
        let lookatPos = vec3.create()
        lookatPos = [0,0,0]
        let upDir = vec3.create()
        upDir=[0,1,0]
        mat4.lookAt(this.mView,eye,lookatPos,upDir)

        let lightPos = vec3.create()
        lightPos = [10,10, 0]
        mat4.lookAt(this.directionalLight, lightPos, lookatPos, upDir)
        
        this.scene.push(new GameObject(null, [0,0,-10]))
        this.scene.push(new GameObject(this.meshProperties['cube'], [0,0,0], [0,20,0], [1,1,1]))
        this.scene.push(new GameObject(this.meshProperties['plane'], [0,-1,0], [90,0,0], [40,40,40]))

        this.createControls()

        requestAnimationFrame(()=>this.update(Date.now()))
    }

    update(timeNow){
        timeNow *= 0.001  // convert to seconds
        const deltaTime = timeNow - this.timeLast
        this.timeLast = timeNow

        if(this.scene[1]){

        }

        this.shadowMapRender();
        this.render()
        requestAnimationFrame(()=>this.update(Date.now()))
    }

    shadowMapRender(){
        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)

        this.gl.cullFace(this.gl.FRONT);

        if(!this.shadowMapFramebuffer || !this.gl || this.programInfo.length <= 0 || !this.buffer){
            console.log('GL not ready')
            return
        }

        //Bind shadowmap buffer (Render Target)
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadowMapFramebuffer);
        this.gl.viewport( 0, 0, 2048, 2048 );
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        // Tell WebGL to use our program when drawing
        this.gl.useProgram(this.programInfo[1].program)

        // Create a perspective matrix
        const zNear = 0.1
        const zFar = 100.0
        const lightProjection = mat4.create()
        mat4.ortho(lightProjection, -10.0, 10.0, -10.0, 10.0, zNear, zFar)
        let lightSpaceMatrix = mat4.create()
        mat4.mul(lightSpaceMatrix, lightProjection, this.directionalLight)

        //pull verticles
        {
            const numComponents = 3  // pull out 3 values per iteration
            const type = this.gl.FLOAT    // the data in the buffer is 32bit floats
            const normalize = false  // don't normalize
            const stride = 0         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
            const offset = 0         // how many bytes inside the buffer to start from
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.position)
            this.gl.vertexAttribPointer(
                this.programInfo[1].attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset)
            this.gl.enableVertexAttribArray(
                this.programInfo[1].attribLocations.vertexPosition)
        }

        this.scene.forEach((gameObject) => {

            if(!gameObject.mesh)
                return
    
            const modelViewMatrix = mat4.create()
            
            //Set gameObject position
            mat4.translate(modelViewMatrix,
                modelViewMatrix,
                [gameObject.transform.position[0], gameObject.transform.position[1], gameObject.transform.position[2]])
                
             //Set gameObject rotation
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[0]) * 1, [1.0, 0.0, 0.0])
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[1]) * 1, [0.0, 1.0, 0.0])
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[2]) * 1, [0.0, 0.0, 1.0])

            //Set gameObject scale
            mat4.scale(modelViewMatrix, modelViewMatrix, gameObject.transform.scale)
              
            // Set the shader uniforms
            this.gl.uniformMatrix4fv(
              this.programInfo[1].uniformLocations.lightSpaceMatrix,
              false,
              lightSpaceMatrix)
            this.gl.uniformMatrix4fv(
              this.programInfo[1].uniformLocations.modelViewMatrix,
              false,
              modelViewMatrix)
                
            {
              let vertexCount = gameObject.mesh.vertexCount
              let offset = gameObject.mesh.offset
              const type = this.gl.UNSIGNED_SHORT
              this.gl.drawElements(4, vertexCount, type, offset)
            }
        })

        this.gl.viewport( 0, 0, 640, 480 );
        this.gl.cullFace(this.gl.BACK);
    }

    render(){
        if(!this.gl || this.programInfo.length <= 0 || !this.buffer){
            console.log('GL not ready')
            return
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.clearColor(0.0, 0.0, 0.5, 1)
        this.gl.clearDepth(1.0)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL)

        // Clear the canvas
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        // Tell WebGL to use our program when drawing
        this.gl.useProgram(this.programInfo[0].program)

        // Create a perspective matrix
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        const zNear = 0.1
        const zFar = 100.0
        const projectionMatrix = mat4.create()

        mat4.perspective(projectionMatrix,
                        toRadian(50),
                        aspect,
                        zNear,
                        zFar)

        // Tell WebGL how to pull out the positions from the position buffer
        {
            const numComponents = 3  // pull out 3 values per iteration
            const type = this.gl.FLOAT    // the data in the buffer is 32bit floats
            const normalize = false  // don't normalize
            const stride = 0         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
            const offset = 0         // how many bytes inside the buffer to start from
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.position)
            this.gl.vertexAttribPointer(
                this.programInfo[0].attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset)
            this.gl.enableVertexAttribArray(
                this.programInfo[0].attribLocations.vertexPosition)
        }

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4
            const type = this.gl.FLOAT
            const normalize = false
            const stride = 0
            const offset = 0
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.color)
            this.gl.vertexAttribPointer(
                this.programInfo[0].attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset)
            this.gl.enableVertexAttribArray(
                this.programInfo[0].attribLocations.vertexColor)
        }

        // Tell WebGL how to pull out the Normals
        {
            const numComponents = 3
            const type = this.gl.FLOAT
            const normalize = false
            const stride = 0
            const offset = 0
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.normals)
            this.gl.vertexAttribPointer(
                this.programInfo[0].attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset)
            this.gl.enableVertexAttribArray(
                this.programInfo[0].attribLocations.vertexNormal)
        }

        // tell webgl how to pull out the texture coordinates from buffer
        {
            const num = 2 // every coordinate composed of 2 values
            const type = this.gl.FLOAT // the data in the buffer is 32 bit float
            const normalize = false // don't normalize
            const stride = 0 // how many bytes to get from one set to the next
            const offset = 0 // how many bytes inside the buffer to start from
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.textureCoord)
            this.gl.vertexAttribPointer(this.programInfo[0].attribLocations.textureCoord, num, type, normalize, stride, offset)
            this.gl.enableVertexAttribArray(this.programInfo[0].attribLocations.textureCoord)
        }

        this.scene.forEach((gameObject) => {

            if(!gameObject.mesh)
                return
    
            const modelViewMatrix = mat4.create()
            
            //Set gameObject position
            mat4.translate(modelViewMatrix,
                modelViewMatrix,
                [gameObject.transform.position[0], gameObject.transform.position[1], gameObject.transform.position[2]])
                
             //Set gameObject rotation
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[0]) * 1, [1.0, 0.0, 0.0])
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[1]) * 1, [0.0, 1.0, 0.0])
            mat4.rotate(modelViewMatrix, modelViewMatrix, toRadian(gameObject.transform.rotation[2]) * 1, [0.0, 0.0, 1.0])

            const normalMatrix = mat4.create()
            mat4.invert(normalMatrix, modelViewMatrix)
            mat4.transpose(normalMatrix, normalMatrix)

            //Set gameObject scale
            mat4.scale(modelViewMatrix, modelViewMatrix, gameObject.transform.scale)

            //Light
            const lightProjection = mat4.create()

            mat4.ortho(lightProjection, -10.0, 10.0, -10.0, 10.0,
                            zNear,
                            zFar)

            let lightSpaceMatrix = mat4.create()
            mat4.mul(lightSpaceMatrix, lightProjection, this.directionalLight)
              
            // Set the shader uniforms
            this.gl.uniformMatrix4fv(
              this.programInfo[0].uniformLocations.uNormalMatrix,
              false,
              normalMatrix)
            this.gl.uniformMatrix4fv(
              this.programInfo[0].uniformLocations.viewMatrix,
              false,
              this.mView)
            this.gl.uniformMatrix4fv(
              this.programInfo[0].uniformLocations.projectionMatrix,
              false,
              projectionMatrix)
            this.gl.uniformMatrix4fv(
              this.programInfo[0].uniformLocations.modelViewMatrix,
              false,
              modelViewMatrix)
            this.gl.uniformMatrix4fv(
                this.programInfo[0].uniformLocations.lightSpaceMatrix,
                false,
                lightSpaceMatrix)
                
            {
              // Tell WebGL we want to affect texture unit 0
              this.gl.activeTexture(this.gl.TEXTURE0)
              // Bind the texture to texture unit 0
              this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0])
              // Tell the shader we bound the texture to texture unit 0
              this.gl.uniform1i(this.programInfo[0].uniformLocations.uSampler, 0)


              this.gl.activeTexture(this.gl.TEXTURE1)
              this.gl.bindTexture(this.gl.TEXTURE_2D, this.shadowMapTexture)
              this.gl.uniform1i(this.programInfo[0].uniformLocations.shadowMap, 1)
              
              //const vertexCount = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE)/2
              let vertexCount = gameObject.mesh.vertexCount
              let offset = gameObject.mesh.offset
              const type = this.gl.UNSIGNED_SHORT
              this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset)
            }
        })
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

        const meshDatas = []
        meshDatas.push(meshCreator.cube(this.meshProperties))
        meshDatas.push(meshCreator.plane(this.meshProperties))

        //Combine multiple mesh datas to one large
        let longMeshData = {
            vertices: [],
            indices: [],
            colors: [],
            normals: [],
            textureCoordinates: []
          }
        
        meshDatas.forEach(meshData => {
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

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, 2048, 2048,
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
            }

            let lookatPos = vec3.create()
            lookatPos = [0,0,0]
           
            let eye = vec3.create()
            eye = this.scene[0].transform.position

            let upDir = vec3.create()
            upDir=[0,1,0]
            mat4.lookAt(this.mView,eye,lookatPos,upDir)
        });
    }
}