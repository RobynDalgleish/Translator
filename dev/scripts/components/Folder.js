import React from 'react';
import ReactDOM from 'react-dom';
import languageNames from '../langs';

class Folder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (<div>
            <h2>Original gangsta:</h2>
            <p>{this.props.trns.originalInputedText}</p>
            <h2>Tranlated to:</h2>
            <p>{languageNames[this.props.trns.chosenLanguageToTranslateTo] === undefined 
                ? this.props.trns.chosenLanguageToTranslateTo 
                : languageNames[this.props.trns.chosenLanguageToTranslateTo]}
            </p>
            <h2>Translation:</h2>
            <p>{this.props.trns.translation}</p>
        </div>

        )
    }
}

export default Folder


