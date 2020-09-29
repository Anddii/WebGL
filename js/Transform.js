import * as vec3 from './gl-matrix-3.3.0/src/vec3.js';

export class Transform{
    position;
    rotation;
    scale;

    constructor(position){
        this.position = vec3.create();
        this.position = position != null ? position : [0,0,0];
        this.rotation = vec3.create();
        this.scale = vec3.create();
    }
}

export default Transform