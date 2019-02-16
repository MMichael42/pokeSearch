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
    // remove focus from search input: 
    searchInput.blur();
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
      console.log('number of cards returned: ' + json.cards.length);
      if (json.cards.length === 0) {
        // no cards returned from search
        cardContainer.innerText = "No cards found"
      } else {
        // sorting of this array would go here if it's possible
        createCardGallery(json.cards);
      }
    });
}   

function createCardHTML(card) {
  console.log(card);
  let ele = 
  `<div class="card" id="${card.id}">
    <div class="cardIMGContainer">
      <img class="cardIMG" src="${card.imageUrlHiRes}" title="${card.name}" />
    </div>
  </div>`;
  
  return ele;
}

function createCardGallery(cardArr) {
  cardContainer.innerHTML = '';
  slider.style.display = "block";
  cardArr.forEach( card => {
    let ele = createCardHTML(card);
    cardContainer.innerHTML += ele;
  });
  // get all the cards in a node list for size manipulation later
  cardDivs = document.querySelectorAll('.card');

  changeCardSize(cardDivs);
};

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
      yearDiv.innerHTML = `<div class="setYear" id="year${currentSetYear}">${currentSetYear}</div>`;
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
  searchInput.value = '';

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

function changeCardSize(nodeList) {
  if (!nodeList) {
    console.log('empty node list!');
    slider.value = 2;
    return;
  }
  nodeList.forEach( card => {
    let val = parseInt(slider.value);

    switch (val) {
      case 0:
        card.style.maxWidth = "100px";
        card.style.margin = "5px";
        window.scrollTo(0,0);
        break;
      case 1:
        card.style.maxWidth = "200px";
        card.style.margin = "5px";
        // window.scrollTo(0,0);
        break;
      case 2:
        card.style.maxWidth = "300px";
        card.style.margin = "5px";
        // cardContainer.scrollIntoView();
        break;
      case 3:
        card.style.maxWidth = "400px";
        card.style.margin = "7px";
        break;
      case 4:
        card.style.maxWidth = "600px";
        card.style.margin = "7px";
        break;
      default:
        break;
    }
  })
}

slider.oninput = function(event) {
  cardDivs = document.querySelectorAll('.card');
  changeCardSize(cardDivs);
}

document.onkeypress = function(event) {

  // go to top of screen on 'w' press
  if (event.key == 'w' && searchInput !== document.activeElement) {
    window.scrollTo(0, 0);
  }
  // go to set selection on 's' press
  if (event.key == 's' && searchInput !== document.activeElement) {
    setContainer.scrollIntoView();
  }
  // below: key presses to change card size (1-5);
  if (event.key == '1' && searchInput !== document.activeElement) {
    slider.value = 0;
    changeCardSize(cardDivs);
  }
  if (event.key == '2' && searchInput !== document.activeElement) {
    slider.value = 1;
    changeCardSize(cardDivs);
  }
  if (event.key == '3' && searchInput !== document.activeElement) {
    slider.value = 2;
    changeCardSize(cardDivs);
  }
  if (event.key == '4' && searchInput !== document.activeElement) {
    slider.value = 3;
    changeCardSize(cardDivs);
  }
  if (event.key == '5' && searchInput !== document.activeElement) {
    slider.value = 4;
    changeCardSize(cardDivs);
  }
}

window.onload = function() {
  console.log('window load');
  slider.style.display = "none";
  getSets(setsAPIString).then(data => {
    buildSetList(data.sets);
  });
}