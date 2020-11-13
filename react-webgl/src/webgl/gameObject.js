import Transform from "./transform.js"

export class GameObject{
    name = 'GameObject';
    transform;
    mesh;
    material;

    constructor(name, mesh, material, position, rotation, scale){
        this.name = name !== '' ? name : this.name  
        this.transform = new Transform(position, rotation, scale)
        this.mesh = mesh
        this.material = material
    }
}

export default GameObject