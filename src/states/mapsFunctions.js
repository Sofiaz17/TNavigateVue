import { ref, onMounted, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProdName} from '../states/shops.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const markers = ref([])
async function clearMarkers(){
    markers.value.length = 0;
    console.log('markers.value.length: ' + markers.value.length);
    //this.$refs.map.$mapObject.clearMarkers(); //or 
    //this.$refs['map'].$mapObject.clearMarkers();
    return; 
}


async function seeShops(){
  
    try{
        // await fetchShops();
        const geocodePromises = shops.value.map((shop) =>{
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
// function seeShops() {
//     console.log('seeShops called');
   
//     fetch('../api/v1/shops')
//         .then((resp) => resp.json()) // Transform the data into json
//         .then(function(data) { 
//             // Create an array to store promises
//             const geocodePromises = [];
//             // Iterate over each shop data and create a promise for geocoding
//             data.forEach(function(shop) {
//                 // Create a promise for each geocoding request
//                 const promise = new Promise((resolve, reject) => {
//                     geocode(shop.address, resolve, reject);
//                 });
//                 // Push the promise to the array
//                 geocodePromises.push(promise);
//             });
//             // Wait for all geocoding promises to resolve
//             return Promise.all(geocodePromises);
//         })
//         .then(function(results) {
//             console.log('Results:', results);
          
//             results.forEach(function (result){
//                 console.log('Geocoding completed:', result.address_components);
//                 console.log('Geocoding completed:', result.geometry.location.lat(), ' ', result.geometry.location.lng());
             

//                 new google.maps.Marker({
//                     position: {lat: result.geometry.location.lat(), lng: result.geometry.location.lng()},
//                     map,
//                     title: "Hello World!",
//                   })}
//             )
//             // This code will execute after all geocoding requests are complete
//              })
//             // Do something with the geocoding results
//         .catch(function(error) {
//             console.error(error);
//         });
// }

export {seeShops, markers, clearMarkers}