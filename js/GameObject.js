import Transform from "./Transform.js"

export class GameObject{
    transform;
    mesh;

    constructor(){
        this.transform = new Transform();
    }
}

export default GameObject