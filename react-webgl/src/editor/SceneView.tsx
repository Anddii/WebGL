import React, { FC, useEffect, useState, useRef } from 'react';
import Wengine from '../webgl/engineRenderer.js';
import './GameView.css';
import * as PropTypes from 'prop-types'

export const SceneView: FC<any> = props =>{

    const canvas = useRef(null);

    const [wengine, setWengine]: Array<any> = useState();
    
    useEffect(() => {
        if(canvas.current){
            const instance: any | null = canvas.current;
            instance.width=instance.clientWidth
            instance.height=instance.clientHeight
        }
    });

    useEffect(() => {
        if(!wengine)
            return
        wengine.setPlaying(props.wengine.playing, props.wengine)
    },[props.wengine.playing]);

    useEffect(() => {
        if(!wengine && props.wengine.longBufferData.vertices){
            const wengine = new Wengine('#scenewebgl', props.wengine)
            setWengine(wengine)
        }
    },[props.wengine.longBufferData]);
    
    return (
        <div>
            <canvas ref={canvas} width="640" height="480" id='scenewebgl'></canvas>
        </div>
    )
}

SceneView.propTypes = {
    wengine: PropTypes.object.isRequired,
    sceneItems: PropTypes.array,
}

export default SceneView