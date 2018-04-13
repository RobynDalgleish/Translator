import React from 'react';
import ReactDOM from 'react-dom';
import Content from "./Content";

export class Folder extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showContents: false
        }

        this.showContents = this.showContents.bind(this);
    }

    showContents(e) {

        if (this.state.showContents) {
            this.setState({ showContents: false });
        }
        else {
            this.setState({ showContents: true });
        }
    }

    render(){
        console.log(this.props.chooseFolder);
        return (
            <div id = {this.props.folderName} className= {`folders ${this.props.chooseFolderMode ? 'folder-choose' : null}`} onClick={this.props.chooseFolderMode ? this.props.chooseFolder : this.showContents}>
                <div className="tape">
                    <h2>{this.props.folderName}</h2>
                </div>

                {this.state.showContents 
                    ? <div className="content-container">

                        {this.state.showContents ? this.props.translations.map((trns, i) => {
                            return (
                                <div key={i}>
                                    <Content 
                                        trns={trns}
                                        removeTranslation = {this.props.removeTranslation}
                                    />
                                </div>
                            )
                        }) : null}
                    </div>
                    : null           
                }

            </div>
        );
    }
}