<script setup>
  import { defineProps, onUpdated } from 'vue'
  import { ref, defineExpose, onMounted, watch, computed, onBeforeUnmount } from 'vue'
  import { markers, myMarker, endingPoint, waypoints, routeDuration, clearRouteDuration, geocode, setEndingPoint } from '@/states/mapsFunctions'
  import { clearWarning, warningMessage } from '@/states/searchFunctions'
  import myPin from '@/components/icons/myPin.png'

  watch(markers, (oldMarkers, newMarkers) =>{
    console.log('WATCHING...');
    clearMarkers();
  } )


  const props = defineProps({
      mycenter: {
        type: Object,
        default: () => ({ lat: 46.067546, lng: 11.121488 })
      },
      zoom: {
        type: Number,
        default: 13
      },
      mapOptions: {
        type: Object,
        default: () => ({
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          rotateControl: true,
          fullscreenControl: true
        })
      },
      markers: {
        type: Array,
        default: () => []
      }
    });

  const center = ref(props.mycenter);
  const mapRef = ref(null);
  let polyline = null;
  
    onMounted( () =>{
      clearWarning();
      reinitializeMap();
  
        console.log('gmap onmounted');
       
      mapRef.value.$mapPromise.then((mapObject) => {
        console.log('map is loaded now', mapObject);
        console.log('marker.setMap:' + mapObject.markers);
        
      });
      clearMarkers();
      clearRouteDuration();
   
      
    });

  //clears map from markers
  function clearMarkers(){
   
    console.log('WAYPOINTS IN CLEAR: ' + waypoints.value.length);
    if(waypoints.value.length==0){
      if(markers.value.length!=0){
      markers.value = [];
      console.log('markers before: ' + markers.value);
      //markers.value.forEach((marker)=> marker.setMap(null))
      //this.markers.map((marker) => toRaw(marker).setMap(null))
      markers.value.length = 0;
      console.log('markers after: '+ markers.value);
      console.log('markers.value.length: ' + markers.value.length);
      //this.$refs.map.$mapObject.clearMarkers(); //or 
      //this.$refs['map'].$mapObject.clearMarkers();
      return; 
      }
    }
}


//gets user position
async function geolocate() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('in geolocate');
        console.log('position.coords.latitude: ' + position.coords.latitude);
        console.log('position.coords.longitude: ' + position.coords.longitude);

        center.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(
          'GEOLOCATE new center: ' + center.value.lat + ' ,' + center.value.lng
        );

        myMarker.value.push({ position: center.value });
        resolve();
      },
      // (error) => {
      //   console.error('Error getting geolocation:', error);
      //   reject(error);
        error => {
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            console.error("User denied the request for Geolocation.");
                            warningMessage.value = 'Permesso per la geolocalizzazione non attivo';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.error("Location information is unavailable.");
                            warningMessage.value = 'Informazioni sulla location non disponibili';
                            break;
                        case error.TIMEOUT:
                            console.error("The request to get user location timed out.");
                            warningMessage.value = 'Il permesso per la geolocalizzazione è scaduto';
                            break;
                        case error.UNKNOWN_ERROR:
                            console.error("An unknown error occurred.");
                            warningMessage.value = 'Errore. Ritenta.';
                            break;
                    }
                    reject(error);
                }
      
    );
  });
}

//reinitializes map with a new center
function reinitializeMap() {
          console.log('reinitializeMap');
          clearMarkers();
      mapRef.value.$mapPromise.then((map) => {
        mapRef.value.map = map;
        map.setCenter(center.value);

      }).catch((error) => {
          console.error('Error initializing map:', error);
        });
      }

    //draws path line on map
    function drawPolyline(encodedPolyline, data) {
      console.log('drawpolyline called');
    //console.log('GOOGLE.MAPS: '+ JSON.stringify(google.maps,null,2));
      const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
      if (!data.routes[0].legs) {
        if (polyline) {
          polyline.setMap(null);
        }
      }
  
      polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      polyline.setMap(mapRef.value.map);
    }

    //gets CEST time from ISO
  function getCESTISOString() {
      let currentDate = new Date();
  
    // Get the time zone offset in minutes and convert it to milliseconds
    let offset = currentDate.getTimezoneOffset() * 60000;
  
    // Adjust for CEST (UTC+2 during daylight saving time)
    let cestOffset = 2 * 60 * 60000; // 2 hours in milliseconds

    // Create a new date object with the adjusted time
    let cestDate = new Date(currentDate.getTime() + offset + cestOffset);
    console.log('CEST: ' +cestDate.toISOString().replace('Z', '+02:00'))

    return cestDate.toISOString().replace('Z', '-02:00');
}


  //POST request to get route
  async function getRoute() {
  try {
    await geolocate();
    console.log(
      'GET ROUTE: start: ' + center.value.lat + ', ' + center.value.lng
    );
    console.log(
      'GET ROUTE: end: ' + parseFloat(endingPoint.value.split(' / ')[2].split(',')[0]) + ', ' + parseFloat(endingPoint.value.split(' / ')[2].split(',')[1])
    );
    console.log(
      'GET ROUTE: date: ' +new Date().toISOString()
    );
 

//console.log(getCESTISOString());


    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_API_KEY,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: center.value.lat,
              longitude: center.value.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: parseFloat(endingPoint.value.split(' / ')[2].split(',')[0]),
              longitude:  parseFloat(endingPoint.value.split(' / ')[2].split(',')[1])
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: getCESTISOString(),
        computeAlternativeRoutes: false,
      }),
    };
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      requestOptions
    );
    const data = await response.json();

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }

    if (data.routes && data.routes[0] && data.routes[0].polyline) {
     
      let date = new Date(durationToNumber(data.routes[0].duration));
      console.log('dATE:'+durationToNumber(data.routes[0].duration));
      console.log('SINGLE ROUTE DURATION: '+ date.toLocaleTimeString('it-IT'));

      routeDuration.value.push(date.toLocaleTimeString('it-IT'));
      
      drawPolyline(data.routes[0].polyline.encodedPolyline,data);
    }

    console.log('RESPONSE: ' + data.value);
    console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('There was an error!', error);
  }
}

function durationToNumber(str) {
  // Check if the string is valid and ends with 's'
  if (str.length > 0 && str[str.length - 1] === 's') {
    // Remove the last character 's'
    const newStr = str.slice(0, -1);
    return parseFloat(newStr);
    // Get the Unicode number of the first character
    const firstCharUnicode = newStr.charCodeAt(0);
    return {
      firstCharUnicode,
      newStr
    };
  } }

  // function getWaypointsCoord(){
  //   waypoints.value.forEach((point)=>{
  //     parseFloat(point.split(' / ')[2].split(',')[0])
      
  //   })
  // }
  //gets coordinates of waypoints
  function getWaypointsCoord() {
  return waypoints.value.map((point) => {
    const coords = point.split(' / ')[2].split(',');
    return {
      location: {
        latLng: {
          latitude: parseFloat(coords[0]),
          longitude: parseFloat(coords[1])
        }
      }
    };
  });
}

//gets coordinates of destination
function getDestination() {
  const lastWaypoint = waypoints.value[waypoints.value.length - 1];
  const coords = lastWaypoint.split(' / ')[2].split(',');
  return {
    location: {
      latLng: {
        latitude: parseFloat(coords[0]),
        longitude: parseFloat(coords[1])
      }
    }
  };
}

//POST request for route with waypoints
async function getMultipointRoute() {
  try {
    await geolocate();
    console.log(
      'GET ROUTE: start' + center.value.lat + ' ,' + center.value.lng
    );
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': import.meta.env.VITE_API_KEY,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.legs,routes.legs.polyline.encodedPolyline',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: center.value.lat,
              longitude: center.value.lng
            },
          },
        },
        destination: getDestination(),
        intermediates: getWaypointsCoord(),
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: getCESTISOString(),
        computeAlternativeRoutes: false,
      }),
    };
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      requestOptions
    );
    const data = await response.json();

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }

   
    
    if (data.routes && data.routes[0] && data.routes[0].legs) {
      console.log('ROUTE:', data.routes[0].legs.length);
      console.log('ROUTE:', data.routes[0].legs);
      data.routes[0].legs.forEach((leg) => {
        console.log('LEG DURATION: ' + leg.localizedValues.duration.text);
        routeDuration.value.push(leg.localizedValues.duration.text);
        if (leg.polyline && leg.polyline.encodedPolyline) {
          drawPolyline(leg.polyline.encodedPolyline,data);
        }
      });
    }


    // console.log('RESPONSE: ' + data.value);
    // console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('There was an error!', error);
  }
}



onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
  clearMarkers();
 });
  </script>

<template>
  <div>
    
     <form @submit.prevent="getRoute" v-if="waypoints.length==0">
      <div>
        <label for="start-point">Partenza: <i>la tua posizione</i></label>
      </div>
      <div>
        <label for="end-point">Destinazione: <em> {{ endingPoint }} </em> Durata: {{ routeDuration[0] }}</label>
       
      </div>
     
      <button type="submit" class="b-button">Calcola percorso</button>
    </form>
   <form @submit.prevent="getMultipointRoute" v-else>
      <div>
        <label for="start-point">Partenza: <i>la tua posizione</i></label>
      </div>
      <div  v-for="(point, index) in waypoints">
        <label v-if="index == waypoints.length-1" for="end-point">
            Destinazione: <em> {{ waypoints[waypoints.length-1] }} </em>
              <br><em>Durata: {{ routeDuration[index] }}</em>
        </label>
        <label v-else for="way-point">Waypoint {{ index }}: <em> {{ point }} </em> Durata: {{ routeDuration[index] }}</label>
      </div>
      <!-- <div>
        <label for="end-point">Destinazione: <em> {{ waypoints[waypoints.length-1] }} </em></label>
       
      </div> -->
    
      <button type="submit" class="b-button">Calcola percorso</button>
    </form>
    <button @click='getMultipointRoute()' class="b-button"> Multipoint route </button>
  <GMapMap
    ref="mapRef"
    :center="mycenter"
    :zoom="zoom"
    map-type-id="roadmap"
    style="width: 450px; height: 450px"
    :options="mapOptions"
  >
 
  <!-- <button @click='geolocate()'> Geolocate </button>
  <button @click='reinitializeMap()'> InitMap </button> -->
 

  <GMapMarker
      v-for="(myMarker, index) in myMarker"
      :key="index"
      :ref="`myMarker${index}`"
      :position="myMarker.position"
      :clickable="true"
      :draggable="false"
      :icon= "{
        url: myPin,
        scaledSize: { width: 40, height: 40 } // Adjust width and height as needed
      }"
      @click="openInfoWindow(myIndex)"
    />
    <GMapMarker
      v-for="(marker, index) in markers"
      :key="index"
      :ref="`marker${index}`"
      :position="marker.position"
      :clickable="true"
      :draggable="false"
     
      @click="openInfoWindow(index)"
    />
    
  </GMapMap>

</div>
</template>
  
  <style>
 @import '/src/assets/style.css'; 

.b-button {
  margin-top: 10px;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  background-color: #006890 !important;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.b-button.collapsed {
  background-color: #006890 !important;
}

.b-button:hover {
  background-color: #84B824 !important; 
}

.b-collapse {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
}
</style>