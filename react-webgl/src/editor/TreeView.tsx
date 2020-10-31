import React, { FC, useEffect, useState, useRef } from 'react';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Classes, Icon, Intent, ITreeNode, Position, Tooltip, Tree } from "@blueprintjs/core";
import * as PropTypes from 'prop-types'

export const TreeView: FC<any> = props =>{

    const [nodes, setNodes]: Array<any> = useState([]);

    return (
        <div>
            <Tree
                contents={props.nodeTree}
                onNodeClick={props.handleNodeClick}
                className={Classes.ELEVATION_0}
            />
        </div>
    )
}

TreeView.propTypes = {
    nodeTree: PropTypes.array.isRequired,
    handleNodeClick: PropTypes.func.isRequired,
}

export default TreeView