import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';

export class Transform{
    position;
    rotation;
    scale;

    constructor(position, rotation, scale){
        this.position = vec3.create();
        this.position = position != null ? position : [0,0,0];

        this.rotation = vec3.create();
        this.rotation = rotation != null ? rotation : [0,0,0];

        this.scale = vec3.create();
        this.scale = scale != null ? scale : [1,1,1];
    }
}

export default Transform