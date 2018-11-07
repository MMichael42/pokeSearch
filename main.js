let searchBar = document.getElementById('searchBar');
let dropDown = document.getElementById('setDropdownWrap');
let dropDownList = document.getElementById('setDropdown');
let searchResultsDiv = document.getElementById('searchResults');
let pokemonAPIurlString = "https://api.pokemontcg.io/v1/";
let userInput = "";
let selectedSetCode = "";
let setDict = {};
let setSelected = false;

function searchPokes(event) {
  let key = event.data;
  let inputType = event.inputType;

  if (inputType != "insertText" && inputType != "deleteContentBackward") {
    // do nothing
    return;
  } else if (inputType == "deleteContentBackward" && userInput != "") {
    // backspace and search string is not empty, delete last character
    userInput = userInput.slice(0, -1);
    // since we're changing the pokemon's name we're searching, reset the setCode stuff so searhAPI re runs the set selecting code
    selectedSetCode = "";
    setSelected = false;
  } else if (inputType == "insertText") {
    // add to string
    userInput += key;
  }

  // we're empty searching, so also clear out everything, reset the setSelected state
  if (searchBar.value == "") {
    userInput = "";
    selectedSetCode = "";
    setSelected = false;
  }

  // good to go, send off userInput to the API:
  if (userInput != "") { // search if the string isn't empty
    // submit to search
    searchAPI(userInput, selectedSetCode);
    // and show the set dropdown list
    dropDown.style.display = "block";
  } else if (userInput == "") {
    dropDown.style.display = "none";
    clearDiv(searchResultsDiv);
  }
} //  end of searchPokes func

function clearDiv(div) {
  console.log('empty out the div');
  div.innerHTML = "";
} // enf of clearDiv func


function searchAPI(pokemonName, setCode) {
  if (pokemonName == "") { // after we load results of last search, see if the search String is currently "", if so clear out div.
    console.log("empty search string from inside searchAPI");
    clearDiv(searchResultsDiv);
    clearDiv(dropDownList);
    return;
  }
  fetch(pokemonAPIurlString + 'cards?name=' + pokemonName + '&setCode=' + setCode)
    .then( response => {
      return response.json();
    })
    .then( json => {
      let cards = json.cards;
      let output = ''; // empty variable to stuff all the html in
      let setArr = []; // array for the card set names, we can probably refactor this out, just use setDict
      
      cards.forEach( card => {
        output += 
          `<div id="cardContainer">
            <div id="thumbnail">
              <img id="thumbnalIMG" src=${card.imageUrl} />
            </div>
          </div>`;

        if (!setArr.includes(card.set)) {
          setArr.push(card.set);
          setDict[card.set] = card.setCode;
        }
      });
  
      searchResultsDiv.innerHTML = output;

      if (!setSelected) {
        // sort the card set array, then loop through it to add the list to the dropdown menu
        setArr.sort();
        let dropDownSetItem = '';
        setArr.forEach( (set, index) => {
          dropDownSetItem += 
            `<option class="dropOption" value="${index}">${set}</option>`;
        });
        dropDownList.innerHTML = '<option value="" selected>All Sets</option>' + dropDownSetItem;
      }
      if (searchBar.value == "") { 
        clearDiv(searchResultsDiv);
        clearDiv(dropDownList);
      }
    });
}

function setSelect() {
  setSelected = true;
  let selectedList = document.getElementById('setDropdown');
  let selectedText = selectedList.options[selectedList.selectedIndex].text;
  selectedSetCode = setDict[selectedText];

  // if the user has selected all sets, clear out the set code and reset the setSelected state
  if (selectedText === 'All Sets') {
    selectedSetCode = '';
    setSelected = false;
  }
  searchAPI(userInput, selectedSetCode);
}

