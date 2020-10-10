import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import 'flexlayout-react/style/light.css';
import FlexLayout from "flexlayout-react";

import gameView from './GameView';

function App() {

  const json: Object = {
    global: {tabEnableClose:false},
    borders:[
    		{
	        "type": "border",
          "location":"bottom",
          "size": 100,
          "children": []
        },
    ],
    layout: {
        "type": "row",
        "weight": 100,
        "children": [
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Game",
                        "component": "game"
                    }
                ]
            },
            {
                "type": "tabset",
                "weight": 50,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Two",
                        "component": "text"
                    },
                    {
                        "type": "tab",
                        "name": "Three",
                        "component": "text"
                    }
                ]
            }
        ]
    }
  };

  const [model, setModel]: Array<any> = useState(FlexLayout.Model.fromJson(json));

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
    if (component === "game") {
      return (
        <div>
          {gameView(null)}
        </div>);
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <FlexLayout.Layout model={model} factory={factory}/>
      </header>
    </div>
  );
}

export default App;
