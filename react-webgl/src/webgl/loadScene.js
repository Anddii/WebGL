export function loadScene(filePath){
    return fetch(filePath)
    .then((r) => r.text())
    .then((text)  => {
        return JSON.parse(text)
    })
}