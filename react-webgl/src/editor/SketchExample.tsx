import React, { FC, useEffect, useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { NumericInput, Label, Divider} from "@blueprintjs/core";
import '@blueprintjs/core/lib/css/blueprint.css';
import './ObjectView.css';
import * as PropTypes from 'prop-types'

export const SketchExample: FC<any> = props =>{

    const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
    const [color, setColor] = useState<any>();

    useEffect(()=>{
        
    },[])

    const handleClick = () => {
        const tempColor = props.materials[props.selectedItem.material].color
        setColor(
            {
                'r': tempColor.r*255,
                'g': tempColor.g*255,
                'b': tempColor.b*255,
            }
        )
        setDisplayColorPicker(!displayColorPicker)
    };
    
    const handleClose = () => {
        setDisplayColorPicker(false)
    };
    
    const handleChange = (color: any) => {
        const tempColor = color.rgb
        setColor(tempColor)
        props.materials[props.selectedItem.material].color=
        {
            'r': tempColor.r/255,
            'g': tempColor.g/255,
            'b': tempColor.b/255,
        }
    };
    
    return (
        <div>
            <div>
                <button onClick={ handleClick }>asd</button>
                {displayColorPicker && props.selectedItem && <SketchPicker color={color} onChange={ handleChange } />}
            </div>
        </div>
    )
}

SketchExample.propTypes = {
    selectedItem: PropTypes.object,
    materials: PropTypes.array,
}

export default SketchExample