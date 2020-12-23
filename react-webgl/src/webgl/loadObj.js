export function loadObjFile(filePath){

    let positions = []
    let indices = []
    let normals = []

    return fetch(filePath)
    .then((r) => r.text())
    .then(text  => {
        let lines = text.split('\n');
        for(let line = 0; line < lines.length; line++){
            const lineSplit = (lines[line]).split(" ")
            if(lineSplit[0] === 'v'){
                positions.push(lineSplit[1])
                positions.push(lineSplit[2])
                positions.push(lineSplit[3])
            }
            if(lineSplit[0] === 'vn'){
                normals.push(lineSplit[1])
                normals.push(lineSplit[2])
                normals.push(lineSplit[3])
            }
            if(lineSplit[0] === 'f'){
                indices.push(lineSplit[1].split("/")[0]-1)
                indices.push(lineSplit[2].split("/")[0]-1)
                indices.push(lineSplit[3].split("/")[0]-1)
            }
        }



        const colors = [];
        for(var i = 0; i<positions.length/3; i++){
            colors.push(1,1,1,1)
        }
        console.log({
            positions,
            indices,
            colors,
            normals
        })
        return{
            positions: positions,
            indices: indices,
            colors: colors,
            normals: normals
        }
    })
}