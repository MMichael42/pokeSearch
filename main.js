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
  let dropDownEle = document.getElementById('setDropdown');

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

  let headers = {} // to store the response headers
  
  fetch(fullURL)
    .then( response => {
      for (let head of response.headers) { headers[head[0]] = head[1]; }
      console.log(headers);
      return response.json();
    })
    .then( json => {
      let cards = json.cards;
      let setArr = [];
      
      createCardHTML(cards, setDict, searchResultsDiv);

      
      if (!setSelected) {
        cards.forEach( card => {
          if (!setArr.includes(card.set)) {
            setArr.push(card.set);
          }
        });
        setArr.sort();
        let dropDownSetItem = '';
        setArr.forEach( setName => {
          dropDownSetItem += 
            `<option class="dropOption" value="${setDict[setName]}">${setName}</option>`;
        })
        dropDownList.innerHTML = '<option class="dropOption" value="" selected>All Sets</option>' + dropDownSetItem;
      }
      
      if (searchBar.value === "") {
        setReset();
        clear(searchResultsDiv, pokemonName);
        // clear(dropDownList, pokemonName);
      }
    });
}

function setSelect(value) {
  setSelected = true;
  console.log(value);
  let selectedList = document.getElementById('setDropdown');
  let selectedText = selectedList.options[selectedList.selectedIndex].text;
  let userInput = searchBar.value;
  selectedSetCode = value;

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
  console.log('clearing out the div and input given: ' + div);
  if (div !== "") {
    div.innerHTML = "";
  }
  input = "";
  selectedSetCode = "";
  setSelected = false;
} // end of clear func


function createCardHTML(cardsArr, setObj, htmlEle) {
  cardsArr.forEach( card => {
    let output =
      `<div class="cardContainer">
        <div class="thumbnail">
          <img class="thumbnailIMG" id="${card.id}" src="images/loading.gif" />
        </div>
      </div>`
    ;
    htmlEle.innerHTML += output;
    createCardImg(card);

    // if the current set isn't in the set object, add it
    if (!setObj.hasOwnProperty(card.set)) {
      setObj[card.set] = card.setCode;
    }
  });
}

function createCardImg(card) {
  let newImg = new Image();
  newImg.cardData = {}
  newImg.cardData.cardID = card.id;
  newImg.src = card.imageUrl;

  newImg.onload = function () {
    let ele = document.getElementById(this.cardData.cardID);
    if (ele) { ele.src = this.src; } // if the element is still on screen, add the image in
    // it might not be on screen because of the search term changing faster than images can be pulled from the server, I think.
  }
}


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