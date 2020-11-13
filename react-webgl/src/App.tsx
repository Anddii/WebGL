import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import 'flexlayout-react/style/light.css';
import './App.css';
import FlexLayout from "flexlayout-react";
import { Popover, Menu, Button, Position, ButtonGroup } from "@blueprintjs/core";

import GameView from './editor/GameView';
import SceneView from './editor/SceneView';
import HierarchyView from './editor/HierarchyView';
import ObjectView from './editor/ObjectView';
import { saveScene as saveSceneReq } from './editor/Scene';

function App() {

  const json: Object = {"global":{"tabEnableClose":false},"layout":{"type":"row","id":"#1","children":[{"type":"row","id":"#11","weight":52.035421809916365,"children":[{"type":"tabset","id":"#2","weight":50,"children":[{"type":"tab","id":"#3","name":"Game","component":"game"}]},{"type":"tabset","id":"#10","weight":50,"children":[{"type":"tab","id":"#5","name":"Scene","component":"scene"}],"active":true}]},{"type":"tabset","id":"#4","weight":15.006455383295808,"children":[{"type":"tab","id":"#6","name":"Hierarchy","component":"hierarchy"}]},{"type":"tabset","id":"#17","weight":14.951201405728252,"children":[{"type":"tab","id":"#8","name":"Folders","component":"text"}]},{"type":"tabset","id":"#14","weight":18.006921401059575,"children":[{"type":"tab","id":"#7","name":"Object","component":"object"}]}]},"borders":[{"type":"border","size":100,"location":"bottom","children":[]}]};

  const [model, setModel] = useState<any>(FlexLayout.Model.fromJson(json))
  const [wengine, setWengine] = useState<any>(null)

  const [selectedItem, setSelectedItem] = useState<number>(0)
  const [playing, setPlaying] = useState<boolean>(false)

  function resetModel(){
    setModel(FlexLayout.Model.fromJson(json))
  }
  
  function saveModel(){
    const myJson: string = model.toJson()
    localStorage.setItem('model',JSON.stringify(myJson));
  }

  function saveScene(){
    saveSceneReq('http://localhost:8081/setscene', wengine.sceneStart)
  }

  useEffect(() => {
    const model: string | null = localStorage.getItem('model');
    if(model){
      let myModel: Object = JSON.parse(model)
      setModel(FlexLayout.Model.fromJson(myModel))
    }
  }, []);

  const factory = (node:any) => {
    const component: string = node.getComponent();
    if (component === "text") {
        return (<div className="panel">Panel {node.getName()}</div>);
    }
    if (component === "game"){
      return (
        <div>
          {<GameView setWengine= {setWengine}/>}
        </div>);
    }
    if (component === "scene"){
      return (
        <div>
          {wengine && 
          <SceneView 
            wengine={wengine} 
            sceneItems={wengine.scene}
          />}
        </div>);
    }
    if(component === 'hierarchy'){
      return(
      <div>
        {wengine && <HierarchyView
          sceneItems={wengine.scene}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />}
      </div>)
    }
    if (component==='object'){
      return(
        <div>{wengine &&
          <ObjectView
            updateScene={updateScene} 
            sceneItems={wengine.sceneStart}
            materials={wengine.materials}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />}
        </div>)
    }
  }

  const updateScene = () => {
    if(wengine){
      wengine.resetScene()
      setPlaying(false)
    }
  }
  
  const buttonPlay=()=>{
    wengine.playing = !playing
    setPlaying(!playing)
  }

  const buttonStop=()=>{
    wengine.playing = false
    wengine.resetScene()
    setPlaying(false)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-main">
          <div className="App-top">
            <ButtonGroup minimal={true}>
              <Popover content={<Menu>...</Menu>} position={Position.BOTTOM}>
                <Button rightIcon="chevron-down" text="Menu" />
              </Popover>
              <Popover content={
              <Menu>
                <ButtonGroup alignText={'left'} fill={true} vertical={true} minimal={true}>
                  <Button onClick={saveModel} text="Save Layout" />
                  <Button onClick={resetModel} text="Reset Layout" />
                </ButtonGroup>
              </Menu>} position={Position.BOTTOM}>
                <Button rightIcon="chevron-down" text="Layout" />
              </Popover>
              <Popover content={
                <Menu>
                  <ButtonGroup alignText={'left'} fill={true} vertical={true} minimal={true}>
                    <Button onClick={saveScene} text="Save Scene" />
                  </ButtonGroup>
                </Menu>} position={Position.BOTTOM}>
                  <Button rightIcon="chevron-down" text="Scene" />
              </Popover>
            </ButtonGroup>
          </div>
          <div className="App-media">
            <ButtonGroup className='Top-controlls'>
                  <Button onClick={buttonPlay} icon={playing==false?'play':'pause'}></Button>
                  <Button onClick={buttonStop} icon='stop'></Button>
            </ButtonGroup>
          </div>
          <div className="App-flex">
            <FlexLayout.Layout model={model} factory={factory}/>
          </div>
        </div>
        
      </header>
    </div>
  );
}

export default App;
