import React, { FC, useEffect, useState, useRef } from 'react';
import Wengine from './webgl/wengine.js';
import './GameView.css';

export const GameView: FC<any> = props =>{

    const canvas = useRef(null);

    const [model, setModel]: Array<any> = useState();
    const [canvasSize, setCanvasSize]: Array<Object> = useState({});

    useEffect(() => {
        if(!model)
            setModel(new Wengine('#webgl'))

        if(canvas.current){
            const instance: any | null = canvas.current;
            console.log(instance.clientWidth)
            console.log(instance.clientHeight)
            instance.width=instance.clientWidth
            instance.height=instance.clientHeight

        }
    });
    
    return (
        <div>
            <canvas ref={canvas} width="640" height="480" id='webgl'></canvas>
        </div>
    )
}

export default GameView