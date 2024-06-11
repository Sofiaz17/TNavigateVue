import { ref, onMounted, computed, toRaw } from 'vue'
import { shops,updateCoordinates, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProdName} from '../states/shops.js'



const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`



const markers = ref([])
const myMarker = ref([])
const endingPoint = ref('');
const waypoints = ref([])
const routeDuration = ref([''])

async function clearEndingPoint(){
    return endingPoint.value = ''
}


async function clearWaypoints(){
  while (waypoints.value.length > 0) {
    waypoints.value.pop();
  }
}

async function clearRouteDuration(){
  while (routeDuration.value.length > 0) {
    routeDuration.value.pop();
  }
}


//visualizes shops on map
async function seeShops() {
    try {
        // Clear existing markers
        if(waypoints.value.length==0){
        while (markers.value.length > 0) {
            markers.value.pop();
        }
      }

        const shopsSelf = [];
        const geocodePromises = shops.value.map((shop) => {
            shopsSelf.push(shop.self);
            return new Promise((resolve, reject) => {
                geocode(shop.address, resolve, reject);
            });
        });

        const results = await Promise.all(geocodePromises);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const shopSelf = shopsSelf[i];

            console.log('Geocoding completed:', result);
            const position = {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
            };

            markers.value.push({
                position: position
            });

            console.log('COORD BEFORE:', position.lat, position.lng);

            await updateCoordinates([position.lat, position.lng], shopSelf);

            console.log('Updated coordinates for shop:', shopSelf);
        }

        markers.value.forEach((marker) => console.log('MARKER:', marker.position));

    } catch (error) {
        console.log('Error:', error);
    }
}
  
//gets coordinates from address
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


  
  function setEndingPoint(shop){
    endingPoint.value = shop.name + ' / ' + shop.address + ' / ' + shop.coordinates;
  
    console.log('SETendP: ' + endingPoint.value);
    const lat = endingPoint.value.split(' / ')[2].split(',')[0];
    const lng = endingPoint.value.split(' / ')[2].split(',')[1];
    console.log('LAT, LNG: '+ lat + ' , '+ lng);
    return { latitude: lat, longitude: lng };
}

function setWaypoints(shop){
  waypoints.value.push(shop.name + ' / ' + shop.address + ' / ' + shop.coordinates);

  waypoints.value.forEach((point)=>
    console.log('SetWypoint: ' + point)
  )
  
}


export {seeShops, geocode, clearWaypoints, clearRouteDuration, setEndingPoint, clearEndingPoint,setWaypoints, routeDuration, waypoints, markers, myMarker,endingPoint/* clearMarkers,*/ /*getRoute*/}