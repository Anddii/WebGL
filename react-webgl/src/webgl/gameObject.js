import Transform from "./transform.js"

export class GameObject{
    transform;
    mesh;
    material;

    constructor(mesh, material, position, rotation, scale){
        this.transform = new Transform(position, rotation, scale);
        this.mesh = mesh
        this.material = material
    }
}

export default GameObject