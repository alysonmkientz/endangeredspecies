//message Alex if you get stuck

'use strict';

const apiKeyRedList = 'fad7bc5f74b1c731a9f836125d8b5d75424ffcc87a94090bab7f2bf98a2ae289';

const countryUrl = 'https://apiv3.iucnredlist.org/api/v3/country/getspecies/';

const apiKeyImages = 'ac174b2351mshff2ea7af587e710p1e2734jsn5e7be2ee07f0';

const imageUrl = 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI?autoCorrect=true&pageNumber=1&pageSize=1&safeSearch=false&q='

//display ya species but only 10 random ones >->
//this is where get images promisese will go

function resolvePromises(promises) {
  Promise.all(promises).then(result => {
    console.log('resolve the promises', result)
    prependImages(result);
  });
}

function prependImages(results) {
  results.forEach(species => {
    console.log('image???', species.image.value[0])
    if(species.image.value[0]){
      $(`.${species.location}`)
      .prepend(`<img src=${species.image.value[0].url} alt="Species Image">`);
    }
    else{
      $(`.${species.location}`)
      .prepend(`<p>No image for this species</p>
      <img src="https://www.simplystamps.com/media/catalog/product/cache/5/image/600x600/9df78eab33525d08d6e5fb8d27136e95/1/9/190_SAD_FACE.png" alt="Sad face">`);
    }
  });
}

function getRandomSelect(responseJson){
  var speciesNames = [];
  var speciesList = responseJson.result.slice();
  for(let i = 0; i < 8; i ++){
    var index = Math.floor(Math.random() * speciesList.length);
    var species = speciesList[index].scientific_name
    speciesList.splice(index, 1);
    speciesNames.push(species);
  }
  displaySpecies(speciesNames);
}

function displaySpecies(speciesNames) {
  var promiseCollection = [];
  $('.results').empty();
  speciesNames.forEach((species, i) => {
    var constructedClass = 'imagetarget' + i;
    $('.results').append(
      `<li class="${constructedClass} result-li">
      <a href='https://en.wikipedia.org/wiki/${species}'>${species}</a>
      </li>
    `);

    var promise = new Promise((resolve, reject) => {
      const url = imageUrl + encodeURIComponent(species);
      fetch(url, {
        headers: {
          'X-RapidApi-Key': apiKeyImages
        }
      })
        .then(imageResult => {
          if (imageResult.ok) {
            return imageResult.json()
          }
          throw new Error(imageResult.statusText)
        })
        .then(image => {
          resolve({
            image: image,
            location: constructedClass
          });
        })
        .catch(error => {
          $('body').append(`${error}`)
          console.log(error)
        });
    });
    promiseCollection.push(promise);
  });
  resolvePromises(promiseCollection);
}


function getSpecies(country) {
  const url = countryUrl + country + '?token=' + apiKeyRedList;
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText)
    })
    .then(responseJson => {
      getRandomSelect(responseJson);
    })
    .catch(error => {
      $('body').append(`${error}`)
      console.log(error)
    });
}

function listenForSubmit() {
  $('form').submit(event => {
    console.log('heard submit')
    event.preventDefault();
    console.log('Done been submitted');
    const countryCode = $('#countrySelect').val();
    getSpecies(countryCode);
  });
}

$(function () {
  console.log('Animuhls!');
  listenForSubmit();
});