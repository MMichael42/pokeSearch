console.log('hello world');
let baseURL = "https://api.pokemontcg.io/v1/";
let pokemonAPIurlString = "https://api.pokemontcg.io/v1/cards?name=";
let setsAPIString = "https://api.pokemontcg.io/v1/sets";

let cardContainer = document.getElementById('cardContainer');
let loadMoreDiv = document.getElementById('loadMore');
let searchInput = document.getElementById('input');
let setContainer = document.getElementById('setContainer');
let slider = document.getElementById('myRange');

let searchString = '';
let cardDivs;

let sliderValues = [100, 200, 300, 400, 500]

function cardSearch(event) {
  searchString = document.getElementById('input').value;

  if (event.key == 'Enter' && searchString.length > 0) {
    searchString = searchString.split(' ').join('%20');
    console.log('search: ' + searchString);
    searchAPI(pokemonAPIurlString, searchString);
  }
}

function searchAPI(APIendpoint, searchString) {
  window.scrollTo(0,0);
  let queryString = APIendpoint + searchString;
  // console.log(queryString);
  cardContainer.innerText = "loading...";
  fetch(queryString)
    .then(res => {
      return res.json();
    })
    .then(json => {
      console.log(json);
      createCardGallery(json.cards);
    });
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
  // get all the cards in a node list for size manipulation later
  cardDivs = document.querySelectorAll('.card');

  changeCardSize(cardDivs);
};

  // now that we've loaded some new cards, reset the image size slider to the middle position
  // slider.value = 2;

async function getSets(url) {
  const res = await fetch(url);
  const data = await res.json();
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

    setButton.innerHTML = 
    `<button class="set" onclick="loadSet('${set.code}', ${set.totalCards})">${set.name}<img class="setSymbol" src="${set.symbolUrl}"/></button>`;

    setContainer.appendChild(setButton.firstChild);
  });
}

async function loadSet(setCode, count) {
  console.log("set: " + setCode + ", count: " + count);
  window.scrollTo(0,0);

  cardContainer.innerText = "loading...";

  const res = await fetch(baseURL + "cards?setCode=" + setCode + '&pageSize=' + count);
  const data = await res.json();
  console.log(data);

  let cardArr = [...data.cards].sort((a, b) => {
    let compare = 0;
    let numA = parseInt(a.number);
    let numB = parseInt(b.number);

    if (numA > numB) compare = 1;
    if (numA < numB) compare = -1;
    
    return compare;
  });

  createCardGallery(cardArr);
}

slider.oninput = function(event) {
  cardDivs = document.querySelectorAll('.card');
  changeCardSize(cardDivs);
}

function changeCardSize(nodeList) {
  nodeList.forEach( card => {
    let val = parseInt(slider.value);

    switch (val) {
      case 0:
        card.style.maxWidth = "100px";
        break;
      case 1:
        card.style.maxWidth = "200px";
        break;
      case 2:
        card.style.maxWidth = "300px";
        break;
      case 3:
        card.style.maxWidth = "400px";
        break;
      case 4:
        card.style.maxWidth = "500px";
        break;
      default:
        break;
    }
  })
}

window.onload = function() {
  console.log('window load');
  getSets(setsAPIString).then(data => {
    buildSetList(data.sets);
  });
}

document.onkeypress = function(event) {
  if (event.key == 'w' && searchInput !== document.activeElement) {
    window.scrollTo(0, 0);
  }
  if (event.key == 's' && searchInput !== document.activeElement) {
    setContainer.scrollIntoView();
  }
}