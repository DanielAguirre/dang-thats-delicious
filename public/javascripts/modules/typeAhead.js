const axios = require('axios');
import dompurify from 'dompurify'

function searchResultsHTML(stores){
  return stores.map(store => {
    return `
      <a href="/strore/${store.slug}" class="searcj__result">
        <strong>${store.name}</strong>
      </a>
    `
  }).join('');
}

function typeAhead(search) {
  if(!search) return;
  const searchInput = search.querySelector('input[name="search"]');

  const searchResults = search.querySelector('.search__results');
  
  searchInput.on('input', function() {
    // if there is no value, quit it 
    if(!this.value) {
      return // stop!
    }

    // show the search results!
    searchResults.style.display = 'block';
    searchResults.innerHTML  = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if(res.data.length) {
          const html = searchResultsHTML(res.data);
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
        }
        // tell them nothing came back 
        searchResults.innerHTML = dompurify.sanitize( `<div class="search__result">NO results for ${this.value} found </div>`);
      })
      .catch(err => {
        console.error(err)
      })
  })

  // handle keyboard inputs
  searchInput.on('keyup', e => {
    // they aren't pressin up, donw on enter, who cares!
    if(![38,40,13].inclueds(e.keycode)){
      return; // skipt it!
    }
    const activeClass= 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search_result');
    let next;
    if(e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if ( e.keyCode === 38 && current ) {
        next = current.previouusElementSibling || items[items.length -1 ];
    } else if (e.keyCode === 38 ) {
        next = items[items-length -1];
    } else if (e.keyCode === 13 && current.href) {
        window.location = current.href;
        return;
    }
    if(current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead
