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
  // clear out the set selection when the search value is 0 characters long
  if (searchBar.value.length === 0) { 
    setReset();
  }

  let userInput = searchBar.value;

  // good to go, send off userInput and selectedSetCode to the API:
  if (userInput !== "") { // search if the string isn't empty
    // submit to search
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
              <img class="thumbnailIMG" id="${card.id}" src="images/loading.gif" />
            </div>
          </div>`
        ;
        searchResultsDiv.innerHTML += output;

        let newImg = new Image();
        newImg.cardData = {}
        newImg.cardData.cardID = card.id;
        newImg.src = card.imageUrl;
      
        newImg.onload = function () {
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
        setReset();
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
    setReset();
  }
  searchAPI(userInput, selectedSetCode);
}

function setReset() {
  console.log('set reset');
  selectedSetCode = '';
  setSelected = false;
}

function clear(div, input) {
  console.log('clearing out the div and input given');
  if (div !== "") {
    div.innerHTML = "";
  }
  input = "";
  selectedSetCode = "";
  setSelected = false;
} // end of clear func

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