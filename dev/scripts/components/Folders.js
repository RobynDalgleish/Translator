import React from 'react';
import ReactDOM from 'react-dom';
import Content from "./Content";
import {Folder} from './Folder';

class Folders extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadReady: false,
            showContents: false
        }
    }

    componentWillReceiveProps(NewProps) {

        this.setState({
            // basics: basics, 
            // practical: practical, 
            // social: social,
            // safeTravel: safeTravel,
            // food: food,
            // other: other
        }, function() {
            this.setState({loadReady: true})
        })
    }

    render() {
        return (<div>
            { this.state.loadReady &&
                <div className="foldersWrap">
                {Object.keys(this.props.folders).map((folderName)=>{
                    return (
                        <Folder chooseFolderMode = {this.props.chooseFolderMode} chooseFolder = {this.props.chooseFolder} folderName = {folderName} translations = {this.props.folders[folderName]}/>
                    );
                })}
                {this.props.currentUser ?
                <div className="folders">
                    <div className="tape">
                        {this.props.currentUser !== null ? <input id="folder-create-input" onKeyDown={(e) => { if (e.keyCode === 13) this.props.addFolder(e) }} type="text" /> : null}
                    </div>
                </div> : null
                }
            </div>
            }     
        </div>
         
        )
    }
}


export default Folders
