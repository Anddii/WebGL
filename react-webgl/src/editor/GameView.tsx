import React, { FC, useEffect, useState, useRef } from 'react';
import Wengine from '../webgl/wengine.js';
import './GameView.css';
import * as PropTypes from 'prop-types'

export const GameView: FC<any> = props =>{

    const canvas = useRef(null);
    const [wengine, setWengine] = useState<any>(null);
    
    useEffect(() => {
        if(!wengine){
            const wengine = new Wengine('#webgl')
            props.setWengine(wengine.getWengine())
            setWengine(wengine.getWengine())
        }

        if(canvas.current){
            const instance: any | null = canvas.current;
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

GameView.propTypes = {
    setWengine: PropTypes.func.isRequired,
}

export default GameView