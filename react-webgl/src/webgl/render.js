import * as mat4 from './gl-matrix-3.3.0/src/mat4.js'
import { toRadian } from "./gl-matrix-3.3.0/src/common.js"

export function shadowMapRender(wEngine){
    wEngine.gl.enable(wEngine.gl.CULL_FACE)
    wEngine.gl.enable(wEngine.gl.DEPTH_TEST)

    wEngine.gl.cullFace(wEngine.gl.FRONT);

    if(!wEngine.shadowMapFramebuffer || !wEngine.gl || wEngine.programInfo.length <= 0 || !wEngine.buffer){
        console.log('GL not ready')
        return
    }

    //Bind shadowmap buffer (Render Target)
    wEngine.gl.bindFramebuffer(wEngine.gl.FRAMEBUFFER, wEngine.shadowMapFramebuffer);
    wEngine.gl.viewport( 0, 0, 2024, 2024 );
    wEngine.gl.clear(wEngine.gl.DEPTH_BUFFER_BIT);

    // Tell WebGL to use our program when drawing
    wEngine.gl.useProgram(wEngine.programInfo[1].program)

    // Create a perspective matrix
    const zNear = 1
    const zFar = 10
    const lightProjection = mat4.create()
    mat4.ortho(lightProjection, -50.0, 50.0, -50.0, 50.0, -50, 200)
    let lightSpaceMatrix = mat4.create()
    mat4.mul(lightSpaceMatrix, lightProjection, wEngine.directionalLight)

    //pull verticles
    {
        const numComponents = 3  // pull out 3 values per iteration
        const type = wEngine.gl.FLOAT    // the data in the buffer is 32bit floats
        const normalize = false  // don't normalize
        const stride = 0         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
        const offset = 0         // how many bytes inside the buffer to start from
        wEngine.gl.bindBuffer(wEngine.gl.ARRAY_BUFFER, wEngine.buffer.position)
        wEngine.gl.vertexAttribPointer(
            wEngine.programInfo[1].attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        wEngine.gl.enableVertexAttribArray(
            wEngine.programInfo[1].attribLocations.vertexPosition)
    }

    wEngine.scene.forEach((gameObject) => {

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
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[1].uniformLocations.lightSpaceMatrix,
          false,
          lightSpaceMatrix)
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[1].uniformLocations.modelViewMatrix,
          false,
          modelViewMatrix)
            
        {
          let vertexCount = gameObject.mesh.vertexCount
          let offset = gameObject.mesh.offset
          const type = wEngine.gl.UNSIGNED_SHORT
          wEngine.gl.drawElements(4, vertexCount, type, offset)
        }
    })

    wEngine.textures[2]=(wEngine.shadowMapTexture)
    wEngine.gl.viewport( 0, 0, wEngine.canvas.width,  wEngine.canvas.height );
    wEngine.gl.cullFace(wEngine.gl.BACK);
}


export function render(wEngine){
    if(!wEngine.gl || wEngine.programInfo.length <= 0 || !wEngine.buffer){
        console.log('GL not ready')
        return
    }

    wEngine.gl.bindFramebuffer(wEngine.gl.FRAMEBUFFER, null);

    wEngine.gl.clearColor(0.3, 0.4, 0.6, 1)
    wEngine.gl.clearDepth(1.0)
    wEngine.gl.enable(wEngine.gl.DEPTH_TEST)
    wEngine.gl.depthFunc(wEngine.gl.LEQUAL)

    // Clear the canvas
    wEngine.gl.clear(wEngine.gl.COLOR_BUFFER_BIT | wEngine.gl.DEPTH_BUFFER_BIT)

    // Tell WebGL to use our program when drawing
    wEngine.gl.useProgram(wEngine.programInfo[0].program)

    // Create a perspective matrix
    const aspect = wEngine.gl.canvas.clientWidth / wEngine.gl.canvas.clientHeight
    const zNear = 1.0
    const zFar = 100
    const projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix,
                    toRadian(50),
                    aspect,
                    zNear,
                    zFar)

    // Tell WebGL how to pull out the positions from the position buffer
    {
        const numComponents = 3  // pull out 3 values per iteration
        const type = wEngine.gl.FLOAT    // the data in the buffer is 32bit floats
        const normalize = false  // don't normalize
        const stride = 0         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
        const offset = 0         // how many bytes inside the buffer to start from
        wEngine.gl.bindBuffer(wEngine.gl.ARRAY_BUFFER, wEngine.buffer.position)
        wEngine.gl.vertexAttribPointer(
            wEngine.programInfo[0].attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        wEngine.gl.enableVertexAttribArray(
            wEngine.programInfo[0].attribLocations.vertexPosition)
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4
        const type = wEngine.gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        wEngine.gl.bindBuffer(wEngine.gl.ARRAY_BUFFER, wEngine.buffer.color)
        wEngine.gl.vertexAttribPointer(
            wEngine.programInfo[0].attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        wEngine.gl.enableVertexAttribArray(
            wEngine.programInfo[0].attribLocations.vertexColor)
    }

    // Tell WebGL how to pull out the Normals
    {
        const numComponents = 3
        const type = wEngine.gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        wEngine.gl.bindBuffer(wEngine.gl.ARRAY_BUFFER, wEngine.buffer.normals)
        wEngine.gl.vertexAttribPointer(
            wEngine.programInfo[0].attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        wEngine.gl.enableVertexAttribArray(
            wEngine.programInfo[0].attribLocations.vertexNormal)
    }

    // tell webgl how to pull out the texture coordinates from buffer
    {
        const num = 2 // every coordinate composed of 2 values
        const type = wEngine.gl.FLOAT // the data in the buffer is 32 bit float
        const normalize = false // don't normalize
        const stride = 0 // how many bytes to get from one set to the next
        const offset = 0 // how many bytes inside the buffer to start from
        wEngine.gl.bindBuffer(wEngine.gl.ARRAY_BUFFER, wEngine.buffer.textureCoord)
        wEngine.gl.vertexAttribPointer(wEngine.programInfo[0].attribLocations.textureCoord, num, type, normalize, stride, offset)
        wEngine.gl.enableVertexAttribArray(wEngine.programInfo[0].attribLocations.textureCoord)
    }

    wEngine.scene.forEach((gameObject, index) => {

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
        mat4.ortho(lightProjection, -50.0, 50.0, -50.0, 50.0,
                        -50,
                        200)

        let lightSpaceMatrix = mat4.create()
        mat4.mul(lightSpaceMatrix, lightProjection, wEngine.directionalLight)
          
        // Set the shader uniforms
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[0].uniformLocations.uNormalMatrix,
          false,
          normalMatrix)
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[0].uniformLocations.viewMatrix,
          false,
          wEngine.mView)
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[0].uniformLocations.projectionMatrix,
          false,
          projectionMatrix)
        wEngine.gl.uniformMatrix4fv(
          wEngine.programInfo[0].uniformLocations.modelViewMatrix,
          false,
          modelViewMatrix)
        wEngine.gl.uniformMatrix4fv(
            wEngine.programInfo[0].uniformLocations.lightSpaceMatrix,
            false,
            lightSpaceMatrix)
        
        wEngine.gl.uniform3fv(
            wEngine.programInfo[0].uniformLocations.lightPosition,
            wEngine.lightPosition)
            
        wEngine.gl.uniform3fv(
            wEngine.programInfo[0].uniformLocations.cameraPosition,
            wEngine.cameraPosition)
            
        {
            // console.log(gameObject.material)

            // Tell WebGL we want to affect texture unit 0
            wEngine.gl.activeTexture(wEngine.gl.TEXTURE0)
            // Bind the texture to texture unit 0
            wEngine.gl.bindTexture(wEngine.gl.TEXTURE_2D, wEngine.textures[gameObject.material.texture])
            // Tell the shader we bound the texture to texture unit 0
            wEngine.gl.uniform1i(wEngine.programInfo[0].uniformLocations.uSampler, 0)

            wEngine.gl.activeTexture(wEngine.gl.TEXTURE1)
            wEngine.gl.bindTexture(wEngine.gl.TEXTURE_2D, wEngine.shadowMapTexture)
            wEngine.gl.uniform1i(wEngine.programInfo[0].uniformLocations.shadowMap, 1)
            
            let vertexCount = gameObject.mesh.vertexCount
            let offset = gameObject.mesh.offset
            const type = wEngine.gl.UNSIGNED_SHORT
            wEngine.gl.drawElements(wEngine.gl.TRIANGLES, vertexCount, type, offset)
        }
    })
}