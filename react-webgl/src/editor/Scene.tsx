export function loadScene(filePath: string){
    return fetch(filePath)
    .then((r: any) => r.text())
    .then((text:string)  => {
        return JSON.parse(text)
    })
}

export function saveScene(filePath: string, data: JSON){
    const putMethod = {
        method: 'POST', // Method itself
        headers: {
         'Content-type': 'application/json; charset=UTF-8' // Indicates the content 
        },
        body: JSON.stringify(data) // We send data in JSON format
    }

    console.log(putMethod.body)
       
    fetch(filePath, putMethod)
}