let searchBar = document.getElementById('searchBar');
let dropDown = document.getElementById('setDropdownWrap');
let dropDownList = document.getElementById('setDropdown');
let searchResultsDiv = document.getElementById('searchResults');

let pokemonAPIurlString = "https://api.pokemontcg.io/v1/";
let selectedSetCode = "";
let setDict = {};
let setSelected = false;

let deBouncedAPIcall = debounced(200, searchAPI);

function searchPokes(event) {
  let userInput = searchBar.value;
  let inputType = event.inputType;

  if (inputType === "deleteContentBackward" && userInput !== "") {
    // since we're changing the pokemon's name we're searching, reset the setCode stuff so searhAPI re runs the set selecting code
    selectedSetCode = "";
    setSelected = false;
  }

  // good to go, send off userInput and selectedSetCode to the API:
  if (userInput !== "") { // search if the string isn't empty
    // submit to search
    // searchAPI(userInput, selectedSetCode);
    deBouncedAPIcall(userInput, selectedSetCode);
    // and show the set dropdown list
    dropDown.style.display = "block";
  } else if (userInput === "") {
    dropDown.style.display = "none";
    clear(searchResultsDiv, userInput);
  }
} //  end of searchPokes func

function searchAPI(pokemonName, setCode) {
  // we're searching again, so clear out the images on screen
  searchResultsDiv.innerHTML = '' // there is probably a more optimized way to do this

  let fullURL = pokemonAPIurlString + 'cards?name=' + pokemonName + '&setCode=' + setCode;
  console.log(fullURL);
  if (pokemonName === "") { // after we load results of last search, see if the search String is currently "", if so clear out div.
    console.log("empty search string from inside searchAPI");
    clear(searchResultsDiv, pokemonName);
    clear(dropDownList, pokemonName);
    selectedSetCode = '';
    return;
  }
  
  fetch(fullURL)
    .then( response => {
      return response.json();
    })
    .then( json => {
      let cards = json.cards;
      let setArr = []; // array for the card set names, we can probably refactor this out, just use setDict
      cards.forEach( card => {
        // console.log(card);
        let output =
          `<div class="cardContainer">
            <div class="thumbnail">
              <img class="thumbnailIMG" id="${card.id}" src="" />
            </div>
          </div>`
        ;
        searchResultsDiv.innerHTML += output;

        let newImg = new Image();
        newImg.cardData = {}
        newImg.cardData.cardID = card.id;
        newImg.src = card.imageUrl;
      
        newImg.onload = function () {
          // console.log(this.cardData);
          let ele = document.getElementById(this.cardData.cardID);
          if (ele) { ele.src = this.src; } // if the element is still on screen, add the image in
          // it might not be on screen because of the search term changing faster than images can be pulled from the server, I think.
        }
        
        // if the set array doesn't already include this set, then add it
        // and add the set code to the setDict
        if (!setArr.includes(card.set)) {
          setArr.push(card.set);
          setDict[card.set] = card.setCode;
        }
      });
      // console.log(searchResultsDiv.innerHTML);
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
      if (searchBar.value === "") {
        setSelected = false; 
        clear(searchResultsDiv, pokemonName);
        clear(dropDownList, pokemonName);
      }
    });
}

function setSelect() {
  let selectedList = document.getElementById('setDropdown');
  let selectedText = selectedList.options[selectedList.selectedIndex].text;
  let userInput = searchBar.value;
  setSelected = true;
  selectedSetCode = setDict[selectedText];

  // if the user has selected all sets, clear out the set code and reset the setSelected state
  if (selectedText === 'All Sets') {
    selectedSetCode = '';
    setSelected = false;
  }
  searchAPI(userInput, selectedSetCode);
}

function clear(div, input) {
  console.log('clearing out the div and input given');
  if (div !== "") {
    div.innerHTML = "";
  }
  input = "";
  selectedSetCode = "";
  setSelected = false;
} // enf of clear func

// debounce function I pulled off of google
function debounced(delay, fn) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}