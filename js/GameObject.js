import Transform from "./Transform.js"

export class GameObject{
    transform;
    mesh;

    constructor(mesh, position, rotation, scale){
        this.transform = new Transform(position, rotation, scale);
        this.mesh = mesh
    }
}

export default GameObject