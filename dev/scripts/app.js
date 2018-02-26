import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

var config = {
  apiKey: "AIzaSyCCStLXTpOaxuVW1lWi8AVofesMj0pwiRk",
  authDomain: "translator-23683.firebaseapp.com",
  databaseURL: "https://translator-23683.firebaseio.com",
  projectId: "translator-23683",
  storageBucket: "",
  messagingSenderId: "981013989526"
};
firebase.initializeApp(config);

const apiURL = 'https://translation.googleapis.com/language/translate/v2';
const key = 'AIzaSyCPkSIK_OMBmFr2M7N674sE3utUtTvSa10';

let languageNames = {
  af : 'Afrikaans',
  sq :'Albanian',
  am : 'Amharic',
  ar : 'Arabic',
  hy : 'Armenian',
  az : 'Azeerbaijani',
  eu : 'Basque',
  be : 'Belarusian',
  bn : 'Bengali',
  bs : 'Bosnian',
  bg : 'Bulgarian',
  ca : 'Catalan',
  ceb : 'Cebuano',
  zh : 'Chinese (Simplified)',
  'zh-TW' : 'Chinese (Traditional)',
  co : 'Corsican',
  hr : 'Croatian',
  cs : 'Czech',
  da : 'Danish',
  nl : 'Dutch',
  en : 'English',
  eo : 'Esperanto',
  et : 'Estonian',
  fi : 'Finnish',
  fr : 'French',
  fy : 'Frisian',
};

const Translation = (props) => {
  return (
    <div>
      <p>{props.data.name}</p>
    </div>
  )
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {

      targetLanguages : [],
      languageToTranslateTo: 'Choose language...',
      currentTranslation: '',
      translations: [],
      userInput: '',
      optionsVisible: null,
      chosenFolder: '',
      showSave: false,
      showFolder: false,
      folders: {
        Directions: [],
        Greetings: [],
        Food: []
      }
    };
    this.setUserInput = this.setUserInput.bind(this);
    this.getTranslation = this.getTranslation.bind(this);
    this.setLanguageToTranslateTo = this.setLanguageToTranslateTo.bind(this);
    this.showSaveOptions = this.showSaveOptions.bind(this);
    this.selectionChoice = this.selectionChoice.bind(this);
    this.saveInChosenFolder = this.saveInChosenFolder.bind(this);
    this.getSavedTranslations = this.getSavedTranslations.bind(this);
    this.sortFolder = this.sortFolder.bind(this);
  }

  getSavedTranslations() {
    // ask firebase for my saved translations
    const dbref = firebase.database().ref('/translations');

    let tempFolders = {
      Directions: [],
      Greetings: [],
      Food: []
    }

    dbref.on('value', (snapshot) => {
      // console.log('hey');

      const data = snapshot.val();
      const state = [];

      for (let key in data) {
        // Here we use the value stored in the key variable to access the object stored at that location, then we add a new property to thet object called key (confusing right?) and assign it the value of 'key'
        let saved = {
          translation: data[key].translation,
          key: key,
          folderName: data[key].folderName,
          chosenLanguageToTranslateTo: data[key].chosenLanguageToTranslateTo,
          originalInputedText: data[key].originalInputedText,
        }

        switch (saved.folderName) {
          case "Directions":
            tempFolders.Directions.push(saved)
            break;
          case "Greetings":
            tempFolders.Greetings.push(saved)
            break;
          case "Food":
            tempFolders.Food.push(saved)
            break;
        }

        state.push(saved);
      }

      this.setState({
        translations: state,
        folders: tempFolders
      })
    });
  }

  componentDidMount() {
    axios.get(`${apiURL}/languages`, {
      params: {
      key: key,
      model: 'base'
      }
    })
      .then((res) => {
        let languages = res.data.data.languages
        languages.unshift({ language: 'Choose language...' })
        this.setState({
          targetLanguages: languages
        });
      });

    this.getSavedTranslations()
  }

  getTranslation(){
    if (this.state.languageToTranslateTo !== "Choose language...") {
      if (this.state.userInput !== "") {
        axios.post(`${apiURL}?key=${key}`, {
          q: this.state.userInput,
          target: this.state.languageToTranslateTo,
          format: "text",
          model: "nmt"
        })
          .then((res) => {
            const newState = Array.from(this.state.translations);
            const newestTranslation = {
              originalText: this.state.userInput,
              targetLanguage: this.state.languageToTranslateTo,
              translation: res.data.data.translations[0].translatedText,
              new: true
            }
            newState.unshift(newestTranslation);
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
    //let lang = e.target.options[e.target.selectedIndex].value;
    this.setState({
      languageToTranslateTo: newLangToTranslateTo
    });
  }

  showSaveOptions(translation) {
    this.setState({
      optionsVisible: 'visible',
      currentlySavingTranslation: translation,
      showFolder: true
    })
  }

  selectionChoice(e){
    this.setState({
      chosenFolder: e.target.value
    })
  }

  saveInChosenFolder(){
    if (this.state.chosenFolder !== "") {
      
      // save translation to firebase
      const dbref = firebase.database().ref('/translations');

      const translationToAdd = {
        originalInputedText: this.state.userInput,
        chosenLanguageToTranslateTo: this.state.languageToTranslateTo,
        translation: this.state.currentlySavingTranslation,
        folderName: this.state.chosenFolder
      };

      dbref.push(translationToAdd);

      // this.sortFolder();

      // reset
      this.setState({
        showSave: false,
        showFolder: false,
        userInput: '',
        // chosenLanguageToTranslateTo: 'Choose language...'
      })

    } else {
      alert("please choose folder")
    }    

    
  }

  sortFolder() {

    let Greetings = []
    let Food = []
    let Directions = []
    let folders = this.state.folders;

    this.state.translations.map((trns) => {
      switch (trns.folderName) {
        case "Greetings":
          Greetings.push(trns)        
          break;
        case "Directions":
          Directions.push(trns)
          break;
        case "Food":
          Food.push(trns)
          break;
      }
    })

    folders.push(
      { Greetings: Greetings}, 
      { Food: Food },
      { Directions: Directions },
    )

    this.setState(folders: folders)
  }



  render() {
    console.log(this.state.folders)
    return (
      <main>
        <select onChange={this.setLanguageToTranslateTo} name="" id="lang-input" value={this.state.chosenLanguageToTranslateTo}>
            {
              this.state.targetLanguages.map((lng, index) => {
                return <option key={index} value={lng.language}>{languageNames[lng.language] !== undefined ? languageNames[lng.language] : lng.language}</option>
              })
          }
          </select>
          <input onChange = {this.setUserInput} type="text" name="" id="" value={this.state.userInput}/>
          <button onClick = {this.getTranslation} >translate</button>
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

          <h3>Directions</h3>
          {
            this.state.folders.Directions.map((trns) => {
              return (
                <div key={trns.key ? trns.key : trns.translation}> 
                  <h2>Original text:</h2>
                  <p>{trns.originalInputedText}</p>
                  <h2>Tranlated to:</h2>
                  <p>{trns.chosenLanguageToTranslateTo}</p>
                  <h2>Translation:</h2>
                  <p>{trns.translation}</p>
                </div>

              )
            })
          }


        <h3>Greetings</h3>
        {
          this.state.folders.Greetings.map((trns) => {
            return (
              <div key={trns.key ? trns.key : trns.translation}>
                <h2>Original text:</h2>
                <p>{trns.originalInputedText}</p>
                <h2>Tranlated to:</h2>
                <p>{trns.chosenLanguageToTranslateTo}</p>
                <h2>Translation:</h2>
                <p>{trns.translation}</p>
              </div>

            )
          })
        }


        <h3>Food</h3>
        {
          this.state.folders.Food.map((trns) => {
            return (
              <div key={trns.key ? trns.key : trns.translation}>
                <h2>Original text:</h2>
                <p>{trns.originalInputedText}</p>
                <h2>Tranlated to:</h2>
                <p>{trns.chosenLanguageToTranslateTo}</p>
                <h2>Translation:</h2>
                <p>{trns.translation}</p>
              </div>

            )
          })
        }
        

          { this.state.showFolder &&
            <div className={`options ${this.state.optionsVisible}`}>
            <h2>Choose a folder</h2>
            <div onChange={this.selectionChoice}>
                <input type="radio" name="folderChoice" id="greetings" value="Greetings" required />
                <label className="" htmlFor="greetings">Greetings</label>
              <input type="radio" name="folderChoice" id="directions" value="Directions" required />
                <label className="" htmlFor="directions">Directions</label>
              <input type="radio" name="folderChoice" id="food" value="Food" required />
                <label className="" htmlFor="food">Food</label>
              </div>
              <button onClick={this.saveInChosenFolder}>That's the one!</button>
            </div>
          }
          
      </main>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
