console.log('hello world');
let baseURL = "https://api.pokemontcg.io/v1/";
let pokemonAPIurlString = "https://api.pokemontcg.io/v1/cards?name=";
let setsAPIString = "https://api.pokemontcg.io/v1/sets";

let cardContainer = document.getElementById('cardContainer');
let loadMoreDiv = document.getElementById('loadMore');
let searchInput = document.getElementById('input');
let setContainer = document.getElementById('setContainer');

let searchString = '';

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
      // cardContainer.innerHTML = '';
      // json.cards.forEach( card => {
      //   let ele = createCardHTML(card);
      //   cardContainer.innerHTML += ele;
      // });
      createCardGallery(json.cards);
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

function createCardGallery(cardArr) {
  cardContainer.innerHTML = '';
  cardArr.forEach( card => {
    let ele = createCardHTML(card);
    cardContainer.innerHTML += ele;
  });
}

async function getSets(url) {
  const res = await fetch(url);
  const data = await res.json();
  // console.log(data);
  return data;
}

function buildSetList(setsArr) {
  let setYear = 0;

  setsArr.forEach( set => {
    let currentSetYear = parseInt(set.releaseDate.substr(set.releaseDate.length - 4));
    let setButton = document.createElement('div');

    if (currentSetYear !== setYear) {
      let yearDiv = document.createElement('div');
      yearDiv.innerHTML = `<div class="setYear">${currentSetYear}</div>`;
      setContainer.appendChild(yearDiv.firstChild); 
      setYear = currentSetYear;
    }

    setButton.innerHTML = `<button class="set" onclick="loadSet('${set.code}', ${set.totalCards})">${set.name}<img class="setSymbol" src="${set.symbolUrl}"/></button>`;
    setContainer.appendChild(setButton.firstChild);
  });
}

async function loadSet(setCode, count) {
  console.log("set: " + setCode + ", count: " + count);
  window.scrollTo(0,0);
  cardContainer.innerText = "loading...";
  const res = await fetch(baseURL + "cards?setCode=" + setCode);
  const data = await res.json();
  console.log(data);
  createCardGallery(data.cards);
}

window.onload = function() {
  console.log('window load');
  getSets(setsAPIString).then(data => {
    console.log(data.sets[0]);
    buildSetList(data.sets);
  });
}