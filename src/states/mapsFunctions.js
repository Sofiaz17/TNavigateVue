import { ref, onMounted, computed, toRaw } from 'vue'
import { shops,updateCoordinates, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProdName} from '../states/shops.js'


const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`



const markers = ref([])
const myMarker = ref([])

//  function clearMarkers(){
//     //markers.value.map((marker)=> toRaw(marker).setMap(null));
//     // markers.value.length = 0;
//     console.log('markers before: ' + markers.value);
//     markers.value = [];
//     console.log('markers after: '+ markers.value);
//     console.log('markers.value.length: ' + markers.value.length);
//     //this.$refs.map.$mapObject.clearMarkers(); //or 
//     //this.$refs['map'].$mapObject.clearMarkers();
//     return; 
// }
// async function clearMarkers() {
//     console.log('clearMarkers');
//     markers.value.forEach((marker, index) => {
//       const refMarker = this.$refs[`marker${index}`];
//       if (refMarker) {
//         refMarker.setMap(null);
//         this.$refs[`marker${index}`] = null;
//       }})}


async function seeShops(){
  
    try{
        while(markers.value.length > 0){
            //console.log('POPPING: '  + 'length: ' + markers.value.length + ': '+markers.value);
            markers.value.pop();
        }
        
        // await fetchShops();
        const shopsSelf = [];
        const geocodePromises = shops.value.map((shop) =>{
            console.log('SHOP.ID: '+ shop.self)
            shopsSelf.push(shop.self);
            console.log('shopsIds: ' + shopsSelf);
            return new Promise((resolve,reject) => {
                geocode(shop.address, resolve, reject);
            });
        });
        const results = await Promise.all(geocodePromises);

        results.forEach(function (result){
           //console.log('Geocoding completed:', result.address_components);
           //console.log('Geocoding completed:', result.geometry.location.lat(), ' ', result.geometry.location.lng());
           console.log('Geocoding completed:', result);
           let position = {
             lat: result.geometry.location.lat(),
             lng: result.geometry.location.lng()
            };
            
            markers.value.push({
                position: position
            });

            markers.value.forEach((marker)=>console.log('MARKER: '+marker.position));
            shopsSelf.forEach((self) =>{

            console.log('ARRAYSELF: '+ self );
                updateCoordinates([result.geometry.location.lat(), result.geometry.location.lng()], self)}
            )
             
           // markers.value[index].position.lng =  result.geometry.location.lng();
            
        })
      } catch(error){
          console.log('error: ' + error);
      }
}  

function geocode(request, resolve, reject) {
    console.log('geocoder entered');
    console.log('request: ', request);
    const geocoder = new google.maps.Geocoder(); 
    // Geocode the request
    geocoder.geocode({ 'address': request }, function(results, status) {
        if (status == 'OK') {
           // console.log('Geocoding successful, ', results[0].geometry.location.lat.scopes[0].e);
           console.log('Geocoding successful, ', results[0].geometry.location.lat()); 
           // Resolve the promise with the geocoding results
            resolve(results[0]);
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
            // Reject the promise with the error status
            reject(status);
        }
    });
}


 
// function getRoute() {
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
//                   "latitude": 46.067546,
//                   "longitude": 11.121488
//                 }
//               }
//             },
//             "destination":{
//               "location":{
//                 "latLng":{
//                   "latitude": 46.0663851,
//                   "longitude": 11.1544449
//                 }
//               }
//             },
//             "travelMode": "DRIVE",
//             "routingPreference": "TRAFFIC_AWARE",
//             //"departureTime": "2023-10-15T15:01:23.045123456Z",
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
  
//         console.log('RESPONSE: ' + data.value);
//         console.log('Formatted RESPONSE:', JSON.stringify(data, null, 2));
//       })
//       .catch(error => {
//         console.error('There was an error!', error);
//       });
//   }


export {seeShops, markers, myMarker,/* clearMarkers,*/ /*getRoute*/}