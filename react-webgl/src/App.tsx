import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import 'flexlayout-react/style/light.css';
import './App.css';
import FlexLayout from "flexlayout-react";

import gameView from './GameView';

function App() {

  const json: Object = {"global":{"tabEnableClose":false},"layout":{"type":"row","id":"#1","children":[{"type":"row","id":"#11","weight":52.035421809916365,"children":[{"type":"tabset","id":"#2","weight":50,"children":[{"type":"tab","id":"#3","name":"Game","component":"game"}]},{"type":"tabset","id":"#10","weight":50,"children":[{"type":"scene","id":"#5","name":"Free","component":"scene"}],"active":true}]},{"type":"tabset","id":"#4","weight":15.006455383295808,"children":[{"type":"scene","id":"#6","name":"Scene","component":"scene"}]},{"type":"tabset","id":"#17","weight":14.951201405728252,"children":[{"type":"tab","id":"#8","name":"Folders","component":"text"}]},{"type":"tabset","id":"#14","weight":18.006921401059575,"children":[{"type":"tab","id":"#7","name":"Object","component":"text"}]}]},"borders":[{"type":"border","size":100,"location":"bottom","children":[]}]};

  const [model, setModel]: Array<any> = useState(FlexLayout.Model.fromJson(json));

  function resetMode(){
    setModel(FlexLayout.Model.fromJson(json))
  }
  
  function saveModel(){
    const myJson: string = model.toJson()
    console.log(JSON.stringify(myJson))
    localStorage.setItem('model',JSON.stringify(myJson));
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
    if(component === 'scene'){
      return(<h1>scee</h1>)
    }
    if (component === "game"){
      return (
        <div>
          {gameView(null)}
        </div>);
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-main">
          <div className="App-top">
            <button onClick={saveModel}>Save layout</button>
            <button onClick={resetMode}>reset</button>
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
