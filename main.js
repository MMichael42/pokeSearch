console.log('hello world');
let pokemonAPIurlString = "https://api.pokemontcg.io/v1/cards?name=";

let cardContainer = document.getElementById('cardContainer');
let loadMoreDiv = document.getElementById('loadMore');
let searchInput = document.getElementById('input');

let searchString = '';

// let deBouncedAPIcall = debounced(100, searchAPI);

function cardSearch(event) {
  // console.log(event.key);
  // console.log(event.keyCode);

  
  searchString = document.getElementById('input').value;

  if (event.key == 'Enter' && searchString.length > 0) {
    searchString = searchString.split(' ').join('%20');
    console.log('search: ' + searchString);
    searchAPI(pokemonAPIurlString, searchString);
  }
}

function searchAPI(APIendpoint, searchString) {
  let queryString = APIendpoint + searchString;
  // console.log(queryString);
  cardContainer.innerText = "loading...";
  fetch(queryString)
    .then(res => {
      return res.json();
    })
    .then(json => {
      // console.log(json);
      cardContainer.innerHTML = '';
      json.cards.forEach( card => {
        let ele = createCardHTML(card);
        cardContainer.innerHTML += ele;
      });

    })
}   

function createCardHTML(card) {
  let ele = 
  `<div class="card">
    <div class="cardIMGContainer">
      <img class="cardIMG" id="${card.id}" src="${card.imageUrlHiRes}" />
    </div>
  </div>`;

  return ele;
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