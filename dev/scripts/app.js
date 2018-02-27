import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Folders from './components/Folders';
import languageNames from './components/langs';

// info for saving to firebase
var config = {
  apiKey: "AIzaSyCCStLXTpOaxuVW1lWi8AVofesMj0pwiRk",
  authDomain: "translator-23683.firebaseapp.com",
  databaseURL: "https://translator-23683.firebaseio.com",
  projectId: "translator-23683",
  storageBucket: "",
  messagingSenderId: "981013989526"
};
firebase.initializeApp(config);

// Google API URL and key
const apiURL = 'https://translation.googleapis.com/language/translate/v2';
const key = 'AIzaSyBGEE0q0ZAn4wYnw1m_r4oQ-5NOxCQOIpA';

class App extends React.Component {
  constructor() {
    super();
    this.state = {

      targetLanguages : [],
      languageToTranslateTo: 'Choose language...',
      currentTranslation: '',
      userInput: '',
      optionsVisible: null,
      chosenFolder: '',
      showSave: false,
      showFolder: false,
      folders: {  
        basics: [],
        practical: [],
        social: [],
        safeTravel: [],
        food: [],
        other: []
      }
    };

    this.setUserInput = this.setUserInput.bind(this);
    this.getTranslation = this.getTranslation.bind(this);
    this.setLanguageToTranslateTo = this.setLanguageToTranslateTo.bind(this);
    this.showSaveOptions = this.showSaveOptions.bind(this);
    this.selectionChoice = this.selectionChoice.bind(this);
    this.saveInChosenFolder = this.saveInChosenFolder.bind(this);
    this.getSavedTranslations = this.getSavedTranslations.bind(this);
  }

  // on load, make a call to the api to get supported languages 
  componentDidMount() {
    axios.get(`${apiURL}/languages`, {
      params: {
      key: key,
      model: 'base'
      }
    })
      // push an item to the front of the array containing "Choose language...". make it fit the same structure as "language: ru" so that we can set the default state, and make every language ossible to select
      .then((res) => {
        // set target languages to be the structure of the data coming back from the API
        let languages = res.data.data.languages
        languages.unshift({ language: "Choose language..." })
        this.setState({
          // make that data structure a state
          targetLanguages: languages
        });
      });
    // call the function that gets saved data from firebase
    this.getSavedTranslations()
  }

    // ask firebase for my saved translations
  getSavedTranslations() {
    const dbref = firebase.database().ref('/translations');

    // arrays that the switch statement can push to in order to eventually become a state
    
    dbref.on('value', (snapshot) => {
      let tempFolders = {
        basics: [],
        practical: [],
        social: [],
        safeTravel: [],
        food: [],
        other: []
      }

      const data = snapshot.val();

      for (let key in data) {
        // Here we use the value stored in the key variable to access the object stored at that location, then we add a new property to thet object called key, and assign it the value of 'key'
        let saved = {
          translation: data[key].translation,
          key: key,
          folderName: data[key].folderName,
          chosenLanguageToTranslateTo: data[key].chosenLanguageToTranslateTo,
          originalInputedText: data[key].originalInputedText,
        }

        // This takes the folderName, and checks to see if it matches the specified "case". If it does, it pushes to the specified temp folder, and breaks out of the switch statement
        switch (saved.folderName) {
          case "basics":
            tempFolders.basics.push(saved)
            break;
          case "practical":
            tempFolders.practical.push(saved)
            break;
          case "social":
            tempFolders.social.push(saved)
            break;
          case "safeTravel":
            tempFolders.safeTravel.push(saved)
            break;
          case "food":
            tempFolders.food.push(saved)
            break;
          case "other":
            tempFolders.other.push(saved)
            break;
        }
      }

      // creates a tempFolders state
      this.setState({
        folders: tempFolders
      })

    });
  }

  // posting to API to get translation
  getTranslation(){
    // if languageToTranslateTo is not "Choose language", then...
    if (this.state.languageToTranslateTo !== "Choose language...") {
      // if userInput is not an empty string, then...
      // we can do this because we are tracking the user's text input
      if (this.state.userInput !== "") {
        axios.post(`${apiURL}?key=${key}`, {
          q: this.state.userInput,
          target: this.state.languageToTranslateTo,
          format: "text",
          model: "nmt"
        })

          .then((res) => {
            this.setState({
              currentTranslation: res.data.data.translations[0].translatedText,
              showSave: true
            })
          });   
      } else {
        alert("Enter text to translate.")
      }
    } else {
      alert("Please, choose a language.")
    }
  }

  setUserInput(e){
    this.setState({
      // tracks inputs, aka gets the value of each current state of the text as the user types
      userInput : e.target.value
    })
  }

  setLanguageToTranslateTo(e){ 
    // all of the options in the select element
    let languageOptions = e.target.options;
    // the currently selected option in the select element
    let currentlySelectedIndex = e.target.selectedIndex;
    // the value of the currently selected element in the select element.
    let newLangToTranslateTo = languageOptions[currentlySelectedIndex].value;
    this.setState({
      languageToTranslateTo: newLangToTranslateTo
    });
  }

  
  // passing parameter
  showSaveOptions(translation) {
    this.setState({
      // using parameter (this.state.currentTranslation)
      currentlySavingTranslation: translation,
      // makes radio buttons for folder options appear
      showFolder: true
    })
  }

  selectionChoice(e){
    this.setState({
      // track user's input (grab the value of the selection, and name it 'chosenFolder')
      chosenFolder: e.target.value
    })
  }

  saveInChosenFolder(){
    // if the value of the chosen folder is not an empty string, then...
    if (this.state.chosenFolder !== "") {
      
      // save translation to firebase in translations "folder"
      // in the future, sort the translations into folders here, and then push to firebase
      const dbref = firebase.database().ref('/translations');

      // data to add to that "folder" or "path"
      const translationToAdd = {
        originalInputedText: this.state.userInput,
        chosenLanguageToTranslateTo: this.state.languageToTranslateTo,
        // below passed from 'showSaveOptions'
        translation: this.state.currentlySavingTranslation,
        folderName: this.state.chosenFolder
      };

      // command to initiate above two things
      dbref.push(translationToAdd);

      this.setState({
        // reset the view to no pending translation to save visible, and...
        showSave: false,
        // no folder options visible, and...
        showFolder: false,
        // the user text input to nothing, and...
        userInput: '',
        // the language choices to 'choose language'
        languageToTranslateTo: 'Choose language...'
      })

    } else {
      // if chosenFolder is an empty string then alert "please choose folder"
      alert("please choose folder")
    }    
  }

  render() {
    return (
      <main>
        <select onChange={this.setLanguageToTranslateTo} name="" id="lang-input" value={this.state.languageToTranslateTo}>
            {
              this.state.targetLanguages.map((lng, index) => {
                return <option key={index} value={lng.language}>{languageNames[lng.language] !== undefined ? languageNames[lng.language] : lng.language}</option>
              })
          }
          </select>
          <input onChange = {this.setUserInput} type="text" name="" id="" value={this.state.userInput}/>
          <button onClick = {this.getTranslation}>translate</button>
          { this.state.showSave &&
            <div>
              <p>{this.state.currentTranslation}</p>
              {
                this.state.currentTranslation !== ''
                  ? <button onClick={() => this.showSaveOptions(this.state.currentTranslation)}>Save Me</button>
                  : null
              }
            </div>
          }

          <Folders folders={this.state.folders} />
          {/* if showFolder is true, then */}
          { this.state.showFolder &&
            // .optionsVisible has a class that is display: block
            <div className={`${this.state.optionsVisible}`}>
              <h2>Choose a folder</h2>
              {/* initiate selectionChoice function with event parameter*/}
              <div onChange={this.selectionChoice}>
                <input type="radio" name="folderChoice" id="basics" value="basics" required />
                <label className="" htmlFor="basics">basics</label>

                <input type="radio" name="folderChoice" id="practical" value="practical" required />
                <label className="" htmlFor="practical">practical</label>

                <input type="radio" name="folderChoice" id="social" value="social" required />
                <label className="" htmlFor="social">social</label>

                <input type="radio" name="folderChoice" id="safeTravel" value="safeTravel" required />
                <label className="" htmlFor="safeTravel">safe travel</label>

                <input type="radio" name="folderChoice" id="food" value="food" required />
                <label className="" htmlFor="food">food</label>

                <input type="radio" name="folderChoice" id="other" value="other" required />
                <label className="" htmlFor="other">other</label>
              </div>
              <button onClick={this.saveInChosenFolder}>That's the one!</button>
            </div>
          }
          
      </main>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
