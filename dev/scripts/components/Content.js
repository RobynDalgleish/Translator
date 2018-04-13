import React from 'react';
import ReactDOM from 'react-dom';
import languageNames from './langs';

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    

    render() {
        return (<div className="content">
            <div className="content-top">
                <button onClick = {() => {this.props.removeTranslation(this.props.trns.folderName, this.props.trns.key)}} >X</button>
            </div>
            <h4>original text:</h4>
            <p>{this.props.trns.originalInputedText}</p>
            <h4>translate into:</h4>
            <p>{languageNames[this.props.trns.chosenLanguageToTranslateTo] === undefined 
                ? this.props.trns.chosenLanguageToTranslateTo 
                : languageNames[this.props.trns.chosenLanguageToTranslateTo]}
            </p>
            <h4>translated text:</h4>
            <p>{this.props.trns.translation}</p>
        </div>

        )
    }
}

export default Content;
