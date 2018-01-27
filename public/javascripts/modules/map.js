import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { lat:43.2, lng: -79.8 },
  zoom: 13
}

function loadPlaces(map, lat = 43.2, lng = -79.8) { 
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
  .then(response => {
    const places = response.data;
    if(!places.length) {
      alert('no places found!');
      return;
    }

    // create a bouns
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow(); 
    const markers = places.map(places => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng:placeLng  };
      bounds.extend(position);
      const marker = new google.maps.Market({ map, position });
      marker.place = place;
      return marker;
    });

    // when someone click on a marker, show the details of that place
    markers.forEach(marker => marrker.addListener('click', function() {
      const html = `
        <div class="popup">
          <a href="/stores/${this.place.slug}">
            <img srx="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
          <p>$[this.place.name] - ${thhis.place.location.address}</p>
          </a>
        </div>
      `;
      infoWindow.setContent(this.place.name);
      infoWindow.open(map, this);
    }));
    
    // then zoom then map to fit all the markers perfectl
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
  });
}

function makeMap(mapDiv) {
  if(!mapDiv) return ;
  // make our map
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);  
  autocomple.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  })
}

export default makeMap;

