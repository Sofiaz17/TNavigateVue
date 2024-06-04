<script setup>
  import { defineProps, onUpdated } from 'vue'
  import { ref, defineExpose, onMounted, watch, computed, onBeforeUnmount } from 'vue'
  import { markers, myMarker, endingPoint, geocode } from '@/states/mapsFunctions'
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
  //const map = ref(null);
    // onMounted() {
    //   this.$refs.mapRef.$mapPromise.then((mapObject) => {
    //     console.log('map is loaded now', mapObject);
    //   });
    //   this.geolocate();
    // };
    onMounted( () =>{
      reinitializeMap();
     
        console.log('gmap onmounted');
       
      mapRef.value.$mapPromise.then((mapObject) => {
        console.log('map is loaded now', mapObject);
        console.log('marker.setMap:' + mapObject.markers);
        
      });
      clearMarkers();
   
      //initMap();
      //geolocate();
      //this.geolocate();
    });

  function clearMarkers(){
    // for (let i = 0; i < markers.value.length; i++) {
    //   markers.value[i].setMap(null);
    // }
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

async function getDestinationCoordinates() {
  try {
    console.log('GETCOORD: ' + endingPoint.value);
    let result = await new Promise((resolve, reject) => {
      geocode(endingPoint.value, resolve, reject);
    });
    console.log('RESULT: '+ result);
    return result;
  } catch (error) {
    console.log('error: ' + error);
  }
}



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
      (error) => {
        console.error('Error getting geolocation:', error);
        reject(error);
      }
    );
  });
}


// async function geolocate() {
  
//   navigator.geolocation.getCurrentPosition(position => {
//     console.log('in geolocate');
//     console.log('position.coords.latitude: ' +position.coords.latitude);
//     console.log('position.coords.longitude: ' +position.coords.longitude);

//     center.value = {lat: position.coords.latitude, lng: position.coords.longitude}
//     console.log('GEOLOCATE new center: '+ center.value.lat +' ,' + center.value.lng);


//   myMarker.value.push({position: center.value});
//    // center.value = {lat: position.coords.latitude, lng: position.coords.longitude}
//   //reinitializeMap();
//     //this.center.setMap(this.center);
//     // this.center.lat = position.coords.latitude;
//     // this.center.lng = position.coords.longitude 
//   });

// }
function reinitializeMap() {
          console.log('reinitializeMap');
          clearMarkers();
      mapRef.value.$mapPromise.then((map) => {
        mapRef.value.map = map;
        map.setCenter(center.value);
          //this.map = map;
          //console.log('map initialized: ', map);

    //     markers.value.push({
    //       //position: center.value
    //     });
    //  // markers.value.forEach((marker)=>addMarker(marker.position))

    //     myMarker.value.push({
    //       //position: center.value
    //     })
        // Initialize or update markers
        // this.updateMapMarkers();
      }).catch((error) => {
          console.error('Error initializing map:', error);
        });
      }
    
//const myMap = mapRef.value.map;
  
// function addMarker(currentPosition){
//   markers.value.push(
//   new google.maps.Marker({
//     position: currentPosition,
//     myMap,
//     title: "Hello World!",
//   }))

// }

  //  async function getRoute() {

  //     await geolocate();
  //     console.log('GET ROUTE: start' + center.value.lat + ' ,' + center.value.lng )
  //     // POST request using fetch with error handling
  //     const requestOptions = {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 
  //                  'X-Goog-Api-Key': import.meta.env.VITE_API_KEY,  
  //                  'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'},
  //       body: JSON.stringify(
  //         {
  //             "origin":{
  //               "location":{
  //                 "latLng":{
  //                   "latitude": center.value.lat,
  //                   "longitude": center.value.lng
  //                 }
  //               }
  //             },
  //             "destination":{
  //               "location":{
  //                 "latLng":{
  //                   "latitude": 46.0663851,
  //                   "longitude": 11.1544449 //coop povo
  //                 }
  //               }
  //             },
  //             "travelMode": "DRIVE",
  //             "routingPreference": "TRAFFIC_AWARE",
  //             "departureTime":  new Date().toISOString(),
  //             "computeAlternativeRoutes": false,
  //             // "routeModifiers": {
  //             //   "avoidTolls": false,
  //             //   "avoidHighways": false,
  //             //   "avoidFerries": false
  //             // },
  //            // "languageCode": "en-US",
  //             //"units": "IMPERIAL"
  //           })
  //     };
  //     fetch('https://routes.googleapis.com/directions/v2:computeRoutes', requestOptions)
  //       .then(async response => {
  //         const data = await response.json();
    
  //         // check for error response
  //         if (!response.ok) {
  //           // get error message from body or default to response status
  //           const error = (data && data.message) || response.status;
  //           return Promise.reject(error);
  //         }
  
  //         if (data.routes && data.routes[0] && data.routes[0].polyline) {
  //           //this.drawPolyline(data.routes[0].polyline.encodedPolyline);
  //            drawPolyline(data.routes[0].polyline.encodedPolyline);
  //         }
    
  //         console.log('RESPONSE: ' + data.value);
  //         console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
  //       })
  //       .catch(error => {
  //         console.error('There was an error!', error);
  //       });
  //   }

    function drawPolyline(encodedPolyline) {
    //console.log('GOOGLE.MAPS: '+ JSON.stringify(google.maps,null,2));
      const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
      if (polyline) {
        polyline.setMap(null);
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

  async function getRoute() {
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
              latitude: endingPoint.value.split(' / ')[2].split(',')[0],
              longitude:  endingPoint.value.split(' / ')[2].split(',')[1]
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: new Date().toISOString(),
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
      drawPolyline(data.routes[0].polyline.encodedPolyline);
    }

    console.log('RESPONSE: ' + data.value);
    console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('There was an error!', error);
  }
}

      
// const drawPolyline = (encodedPolyline) => {
//   console.log('GOOGLE.MAPS: '+ JSON.stringify(google.maps,null,2));
//   const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
//   // if (polyline) {
//   //   mapRef.value.polyline.setMap(null);
//   // }
//   polyline = new google.maps.Polyline({
//     path: path,
//     geodesic: true,
//     strokeColor: '#FF0000',
//     strokeOpacity: 1.0,
//     strokeWeight: 2
//   });
//   polyline.setMap(mapRef.value);
// };

    // data() {
    //   return {
    //     infoWindowIndex: null
    //   };
    // },
    // setup(){
    //   geolocate;
    // },
//     watch: {
//       center:{
//         handler(){
//           this.reinitializeMap();
//         }
//       },
//       markers: {
//         handler() {
//           this.updateMapMarkers();
//         },
//         deep: true
//       }
//     },
//     methods: {
//       getRoute() {
//       // POST request using fetch with error handling
//       const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 
//                    'X-Goog-Api-Key': import.meta.env.VITE_API_KEY,  
//                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'},
//         body: JSON.stringify(
//           {
//               "origin":{
//                 "location":{
//                   "latLng":{
//                     "latitude": 46.067546,
//                     "longitude": 11.121488
//                   }
//                 }
//               },
//               "destination":{
//                 "location":{
//                   "latLng":{
//                     "latitude": 46.0663851,
//                     "longitude": 11.1544449
//                   }
//                 }
//               },
//               "travelMode": "DRIVE",
//               "routingPreference": "TRAFFIC_AWARE",
//               "departureTime": "2024-05-29T18:41:23.045123456Z",
//               "computeAlternativeRoutes": false,
//               // "routeModifiers": {
//               //   "avoidTolls": false,
//               //   "avoidHighways": false,
//               //   "avoidFerries": false
//               // },
//              // "languageCode": "en-US",
//               //"units": "IMPERIAL"
//             })
//       };
//       fetch('https://routes.googleapis.com/directions/v2:computeRoutes', requestOptions)
//         .then(async response => {
//           const data = await response.json();
    
//           // check for error response
//           if (!response.ok) {
//             // get error message from body or default to response status
//             const error = (data && data.message) || response.status;
//             return Promise.reject(error);
//           }
  
//           if (data.routes && data.routes[0] && data.routes[0].polyline) {
//             this.drawPolyline(data.routes[0].polyline.encodedPolyline);
//           }
    
//           console.log('RESPONSE: ' + data.value);
//           console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
//         })
//         .catch(error => {
//           console.error('There was an error!', error);
//         });
//     },
  
//     drawPolyline(encodedPolyline) {
//       console.log('GOOGLE.MAPS: '+ JSON.stringify(google.maps,null,2));
//         const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
//         if (this.polyline) {
//           this.polyline.setMap(null);
//         }
//         this.polyline = new google.maps.Polyline({
//           path: path,
//           geodesic: true,
//           strokeColor: '#FF0000',
//           strokeOpacity: 1.0,
//           strokeWeight: 2
//         });
//         this.polyline.setMap(this.map);
//       },
//       reinitializeMap() {
//         console.log('reinitializeMap');
//         this.$refs.mapRef.$mapPromise.then((map) => {
//           this.map = map;
//           console.log('map initialized: ', map);
  
//           // Initialize or update markers
//          // this.updateMapMarkers();
//         }).catch((error) => {
//           console.error('Error initializing map:', error);
//         });
//       },
//       openInfoWindow(index) {
//         this.infoWindowIndex = index;
//       },
//       updateMapMarkers() {
//         console.log('updateMapMarkers');
//         if (this.map) {
//           // Clear existing markers
//           this.clearMarkers();
  
//           // Add new markers to the map
//           this.markers.forEach((marker, index) => {
//             const newMarker = new google.maps.Marker({
//               position: marker.position,
//               map: this.map,
//               clickable: true,
//               draggable: false
//             });
  
//             // Store marker reference for future use
//             this.$refs[`marker${index}`] = newMarker;
  
//             newMarker.addListener('click', () => {
//               this.openInfoWindow(index);
//             });
//           });
//         }
//       },
//       clearMarkers() {
//         console.log('clearMarkers');
//         this.markers.forEach((marker, index) => {
//           const refMarker = this.$refs[`marker${index}`];
//           //console.log('refMarker: ' + JSON.stringify(refMarker));
//           if (refMarker) {
//             refMarker.setMap(null);
//             this.$refs[`marker${index}`] = null;
//           }
//         });
//       },
//       geolocate() {
//       navigator.geolocation.getCurrentPosition(position => {
//       console.log('in geolocate');
//       console.log('position.coords.latitude: ' +position.coords.latitude);
//       console.log('position.coords.longitude: ' +position.coords.longitude);
//       this.center = {lat: position.coords.latitude, lng: position.coords.longitude}
//       this.center.setMap(this.center);
//         // this.center.lat = position.coords.latitude;
//         // this.center.lng = position.coords.longitude
      
//     });
//   }
//     //   geolocate() {
//     //     navigator.geolocation.getCurrentPosition(position => {
//     //       this.$refs.center = {
//     //         lat: position.coords.latitude,
//     //         lng: position.coords.longitude,
//     //       };
//     //     });
//     // }
//   }
//   }
//const geol = {geolocate}
//defineExpose({geolocate})
//export {geolocate}

onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
  clearMarkers();
 });
  </script>

<template>
  <div>
    <form @submit.prevent="getRoute">
      <div>
        <label for="start-point">Partenza: <i>la tua posizione</i></label>
      </div>
      <div>
        <label for="end-point">Destinazione: <em> {{ endingPoint }} </em></label>
        <!-- <input id="end-point" v-model="endPoint" type="text" required /> -->
      </div>
      <!-- <button @click='getRoute()'> Calcola percorso </button> -->
      <button type="submit">Calcola percorso</button>
    </form>
  <GMapMap
    ref="mapRef"
    :center="mycenter"
    :zoom="zoom"
    map-type-id="roadmap"
    style="width: 450px; height: 450px"
    :options="mapOptions"
  >
 
  <button @click='geolocate()'> Geolocate </button>
  <button @click='reinitializeMap()'> InitMap </button>

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
  
  <style scoped>
  /* Add any necessary styling here */
  </style>
  