import Transform from "./Transform.js"

export class GameObject{
    transform;
    mesh;

    constructor(mesh, position){
        this.transform = new Transform(position);
        this.mesh = mesh
    }
}

export default GameObject