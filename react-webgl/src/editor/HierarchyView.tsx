import React, { FC, useEffect, useState, useRef } from 'react';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Classes, Icon, Intent, ITreeNode, Position, Tooltip, Tree } from "@blueprintjs/core";
import * as PropTypes from 'prop-types'
import TreeView from './TreeView'

export interface ITreeExampleState {
    nodes: ITreeNode[];
}

export const HierarchyView: FC<any> = props =>{

    const [nodes, setNodes]: Array<any> = useState([]);

    useEffect(() => {
        NodeTree()
    },[props.sceneItems]);

    const NodeTree = ()=> {
        let INITIAL_STATE: Array<any> = []
        props.sceneItems.forEach((item:any, index:number)=>{
            const node:any={
                id: index,
                isSelected: props.selectedItem == index ? true : false,
                icon: "document",
                label: item.name
            }
            INITIAL_STATE.push(node)
        });
        setNodes(INITIAL_STATE)
    }

    const handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            forEachNode(nodes, n => (n.isSelected = false));
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected;
        props.setSelectedItem(nodeData.id)
    };


    const forEachNode=(nodes: any, callback: (node: ITreeNode)=>void)=>{
        if (nodes == null) {
            return;
        }

        for (const node of nodes) {
            callback(node);
            forEachNode(node.childNodes, callback);
        }
    }
    
    return (
        <div>
            {<TreeView 
                nodeTree={nodes}
                handleNodeClick={handleNodeClick}
            />}
        </div>
    )
}

HierarchyView.propTypes = {
    sceneItems: PropTypes.array.isRequired,
    selectedItem: PropTypes.number.isRequired,
    setSelectedItem: PropTypes.func.isRequired
}

export default HierarchyView