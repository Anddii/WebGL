import React, { FC, useEffect, useState, useRef } from 'react';
import { SketchExample } from './SketchExample';
import { NumericInput, Label, Divider} from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import './ObjectView.css';
import * as PropTypes from 'prop-types'

export const ObjectView: FC<any> = props =>{

    const [update, setUpdate] = useState<number>(0);

    useEffect(()=>{
        props.updateScene()
    },[update])

    function onValueChangedTransform(index: number, valueAsNumber: number){
        let tempSceneItems = props.sceneItems
        tempSceneItems[props.selectedItem].transform.position[index] = valueAsNumber

        setUpdate(update+1)
    }

    function onValueChangedRotation(index: number, valueAsNumber: number){
        let tempSceneItems = props.sceneItems
        tempSceneItems[props.selectedItem].transform.rotation[index] = valueAsNumber

        setUpdate(update+1)
    }

    function onValueChangedScale(index: number, valueAsNumber: number){
        let tempSceneItems = props.sceneItems
        tempSceneItems[props.selectedItem].transform.scale[index] = valueAsNumber

        setUpdate(update+1)
    }
    
    return (
        <div>
            {props.sceneItems[props.selectedItem] && props.sceneItems[props.selectedItem].transform && 
            <div>
                <Label>Position</Label>
                <div className='input-position'>
                    <label>X</label><NumericInput onValueChange={(e)=>onValueChangedTransform(0,e)} value={props.sceneItems[props.selectedItem].transform.position[0]}/>
                    <label>Y</label><NumericInput onValueChange={(e)=>onValueChangedTransform(1,e)} value={props.sceneItems[props.selectedItem].transform.position[1]}/>
                    <label>Z</label><NumericInput onValueChange={(e)=>onValueChangedTransform(2,e)} value={props.sceneItems[props.selectedItem].transform.position[2]}/>
                </div>
                <Label>Rotation</Label>
                <div className='input-position'>
                    <label>X</label><NumericInput onValueChange={(e)=>onValueChangedRotation(0,e)} value={props.sceneItems[props.selectedItem].transform.rotation[0]}/>
                    <label>Y</label><NumericInput onValueChange={(e)=>onValueChangedRotation(1,e)} value={props.sceneItems[props.selectedItem].transform.rotation[1]}/>
                    <label>Z</label><NumericInput onValueChange={(e)=>onValueChangedRotation(2,e)} value={props.sceneItems[props.selectedItem].transform.rotation[2]}/>
                </div>
                <Label>Scale</Label>
                <div className='input-position'>
                    <label>X</label><NumericInput onValueChange={(e)=>onValueChangedScale(0,e)} value={props.sceneItems[props.selectedItem].transform.scale[0]}/>
                    <label>Y</label><NumericInput onValueChange={(e)=>onValueChangedScale(1,e)} value={props.sceneItems[props.selectedItem].transform.scale[1]}/>
                    <label>Z</label><NumericInput onValueChange={(e)=>onValueChangedScale(2,e)} value={props.sceneItems[props.selectedItem].transform.scale[2]}/>
                </div>
                <Divider/>
                {props.sceneItems[props.selectedItem].material &&
                    <div>
                        <Label>Material</Label>
                        <div>
                            <SketchExample
                            selectedItem={props.sceneItems[props.selectedItem]}
                            materials={props.materials}/>
                        </div>
                    </div>
                }
            </div>}
        </div>
    )
}

ObjectView.propTypes = {
    updateScene: PropTypes.func.isRequired,
    sceneItems: PropTypes.array,
    materials: PropTypes.array,
    selectedItem: PropTypes.number,
    setSelectedItem: PropTypes.func.isRequired
}

export default ObjectView