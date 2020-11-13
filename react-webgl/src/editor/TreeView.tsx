import React, { FC } from 'react';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Classes, Tree } from "@blueprintjs/core";
import * as PropTypes from 'prop-types'

export const TreeView: FC<any> = props =>{

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