import React from 'react';
import ReactDOM from 'react-dom';
import Folder from "./Folder"

class Folders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Greetings: [],
            Food: [],
            Directions: [],
            loadReady: false,
        }
    }

    componentWillReceiveProps(NewProps) {


        let folders = NewProps.folders;


        let Greetings = NewProps.folders.Greetings;
        let Food = NewProps.folders.Food; 
        let Directions = NewProps.folders.Directions;

        this.setState({
            Greetings: Greetings, Food: Food, Directions: Directions
        }, function() {
            this.setState({loadReady: true})
        })
    }

    render() {
        return (<div>
            { this.state.loadReady &&
             <div>
                <h2>Greetings:</h2>
                    {this.state.Greetings.map((trns, i) => {
                        return (
                            <div key={i}>
                                <Folder trns={trns} />
                            </div>
                        )  
               })}
                <h2>Food:</h2>
                    {this.state.Food.map((trns, i) => {
                        return (
                            <div key={i}>
                                <Folder trns={trns} />
                            </div>
                        )  
                    })}
                <h2>Directions:</h2>
                    {this.state.Directions.map((trns, i) => {
                        return (
                            <div key={i}>
                                <Folder trns={trns} />
                            </div>
                        )  
                    })}
               </div>
            }     
        </div>
         
        )
    }
}


export default Folders
