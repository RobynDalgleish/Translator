import React from 'react';
import ReactDOM from 'react-dom';
import Content from "./Content"

class Folders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            basics: [],
            practical: [],
            social: [],
            safeTravel: [],
            food: [],
            other: [],
            loadReady: false,
            showContents: false
        }
        this.showContents = this.showContents.bind(this);
    }

    componentWillReceiveProps(NewProps) {

        let folders = NewProps.folders;

        let basics = NewProps.folders.basics;
        let practical = NewProps.folders.practical; 
        let social = NewProps.folders.social;
        let safeTravel = NewProps.folders.safeTravel;
        let food = NewProps.folders.food;
        let other = NewProps.folders.other;

        this.setState({
            basics: basics, 
            practical: practical, 
            social: social,
            safeTravel: safeTravel,
            food: food,
            other: other
        }, function() {
            this.setState({loadReady: true})
        })
    }

    showContents() {
        console.log(this.state.showContents)
        console.log(this.state)
        this.state.showContents = false ? this.setState({showContents: true}) : null;
    }

    render() {
        return (<div>
            { this.state.loadReady &&
                <div className="foldersWrap">
                <button className="folders" onClick={this.showContents}>
                    <div className="tape">
                        <h2>basics</h2>
                    </div>
                    <div className= "content-container">
                        {this.state.basics.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )  
                        })}
                    </div>
                </button>
                <button className="folders">
                    <div className="tape">
                        <h2>practical</h2>
                    </div>
                    <div className="content-container">
                        {this.state.practical.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )  
                        })}
                    </div>
                </button>
                <button className="folders">
                    <div className="tape">
                        <h2>social</h2>
                    </div>
                    <div className="content-container">
                        {this.state.social.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )  
                        })}
                    </div>
                </button>
                <button className="folders">
                    <div className="tape">
                        <h2>safe travel</h2>
                    </div>
                    <div className="content-container">
                        {this.state.safeTravel.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )
                        })}
                    </div>
                    
                </button>
                <button className="folders">
                    <div className="tape">
                        <h2>food</h2>
                    </div>
                    <div className="content-container">
                        {this.state.food.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )
                        })}
                    </div>
                </button>
                <button className="folders">
                    <div className="tape">
                        <h2>other</h2>
                    </div>
                    <div className="content-container">
                        {this.state.other.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content trns={trns} />
                                </div>
                            )
                        })}
                    </div>
                </button>
            </div>
            }     
        </div>
         
        )
    }
}


export default Folders
