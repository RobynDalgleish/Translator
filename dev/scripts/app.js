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
      folders: { },
      showSave: false,
      showFolder: false,
      currentUser : null,
      currentUserName : null,
      chooseFolderMode : false
    };

    this.setUserInput = this.setUserInput.bind(this);
    this.getTranslation = this.getTranslation.bind(this);
    this.setLanguageToTranslateTo = this.setLanguageToTranslateTo.bind(this);
    this.showSaveOptions = this.showSaveOptions.bind(this);
    this.selectionChoice = this.selectionChoice.bind(this);
    this.saveInChosenFolder = this.saveInChosenFolder.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.chooseFolder = this.chooseFolder.bind(this);
    this.removeTranslation = this.removeTranslation.bind(this);
  }

  signIn(){
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt : 'select_account'
    })

    firebase.auth().signInWithPopup(provider).then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;

      // Get the signed-in user info.
      const user = result.user;
    }).catch(function (error) {
      // Error handling goes in here.
      console.log(error)
    });   
  }

  signOut(){
    firebase.auth().signOut().then(function (success){
    }, function(error){
      console.log(error);
    })
  }

  componentWillUnmount(){
    this.signOut();
  }

  removeTranslation(folderName, translationId){
    console.log(folderName, translationId);

    let foldersCopy = this.state.folders;
    let folderToEdit = foldersCopy[folderName].filter((translation)=>{
      return (translation.key !== translationId);
    })

    foldersCopy[folderName] = folderToEdit; 

    this.setState({
      folders : foldersCopy
    })

    let translationRef;
    // grabs a firebase reference to translation at 
    if(this.state.currentUser !== null){
      translationRef = firebase.database().ref(`/users/${this.state.currentUser}/translations/${translationId}`);

      // removes translation from database
    }

    else{
      translationRef = firebase.database().ref(`/public/translations/${translationId}`)
    }
    translationRef.remove();

  }

  // on load, make a call to the api to get supported languages 
  componentDidMount() {
  
    firebase.auth().onAuthStateChanged((user)=>{
      // when the user changes/logs in/logs out, this function gets called
      let path;
      //if a user signs in
      if(user){
        // set app state to current user
        this.setState({
          currentUser : user.uid,
          currentUserName : user.displayName
        })

        // set up db update callback
        path = `/users/${this.state.currentUser}`;
      }

      else{
        path = '/public';
        this.setState({
          currentUser: null, 
        });
      }

      let dbref = firebase.database().ref(path);

      dbref.on('value', (snapshot) => {
        const data = snapshot.val().translations;

        let userFolderNames = snapshot.val().customFolders;
        let userFolders = {};

        for(let userFolderName of userFolderNames){
          userFolders[userFolderName] = [];
        }

        for (let key in data) {
          // Here we use the value stored in the key variable to access the object stored at that location, then we add a new property to thet object called key, and assign it the value of 'key'

          let saved = {
            translation: data[key].translation,
            key: key,
            folderName: data[key].folderName,
            chosenLanguageToTranslateTo: data[key].chosenLanguageToTranslateTo,
            originalInputedText: data[key].originalInputedText,
          }

          userFolders[saved.folderName].push(saved);
        }
        this.setState({ folders: userFolders });
      });

    });
 
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
      chooseFolderMode : true
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
      let path;

      if(this.state.currentUser !== null){
        path = `/users/${this.state.currentUser}/translations`;
      }

      else{
        path = `/public/translations`;
      }
      
      const dbref = firebase.database().ref(path);

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
      // if keyDown/onClick that is not on folder, exit choose folder, prompt save me
    }    
  }

  chooseFolder(e){
    if(this.state.chooseFolderMode){
      this.setState({chosenFolder : e.target.id},()=>{
        this.saveInChosenFolder();
        this.setState({chooseFolderMode : false});
      })
    }
    
  }

  addFolder(e){
    let newFolderName = e.target.value;
    console.log(e.target.value);
    e.target.value = '';

    let path;
    if(!this.state.folders[newFolderName]){
      let foldersState = this.state.folders;
      foldersState[newFolderName] = [];
      this.setState({folders : foldersState},()=>{
        console.log(this.state);
      });

      if (this.state.currentUser !== null) {
        path = `/users/${this.state.currentUser}/customFolders`;
      }

      else {
        path = `/public/customFolders`;
      }

      let dbref = firebase.database().ref(path);
      let folderNames = Object.keys(this.state.folders);
      console.log(folderNames);
      dbref.set(folderNames);
    }
  }

  render() {
    return (
      <main className = 'main-container'>
        <div className= {`choose-folder-overlay ${this.state.chooseFolderMode ? 'choose-folder-overlay-show' : null}`}>
          <h4>Choose a folder...</h4>
        </div>
        <div className="user-login">
          <button onClick = {this.state.currentUser !== null ? this.signOut : this.signIn}>{this.state.currentUser !== null ? `Sign Out ${this.state.currentUserName}` : 'Sign In'}</button>
        </div>
        <div className="input_container">
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
        </div>

          <Folders 
            currentUser = {this.state.currentUser} 
            addFolder = {this.addFolder.bind(this)} 
            chooseFolderMode = {this.state.chooseFolderMode} 
            chooseFolder = {this.chooseFolder} 
            folders={this.state.folders} 
            removeTranslation= {this.removeTranslation}
          />
          {/* if showFolder is true, then */}
          { this.state.showFolder &&
            // .optionsVisible has a class that is display: block
            <div className={`${this.state.optionsVisible}`}>
              <h2>Choose a folder</h2>
            </div>
          }        
      </main>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
