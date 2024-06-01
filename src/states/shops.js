import { reactive, warn } from 'vue'
import { warningMessage } from './searchFunctions'
import { seeShops } from './mapsFunctions'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`
const API_URL = HOST+`/api/v1`
const SHOPS_URL = API_URL+'/shops'
const CATEG_URL = API_URL+'/shopCategories'
const PRODUCT_URL = API_URL+ '/products'

const shops = reactive([])
const categories = reactive([])
const products = reactive([])

console.log('HOST_URL: ' + HOST);

async function fetchShops() { 
    shops.value = await (await fetch(SHOPS_URL)).json()
}

async function fetchShopsName(name){
    // let response = await fetch(SHOPS_URL + '?name=' + name);
    // if(!response.ok){
    //     console.error('Error: ', response.statusText);
    //     throw new Error('fetch was not ok');
    // }
    // shops.value = await response.json();
    // console.log('AAAAAAAAARESPONSE: ' + shops.value);
    // return data;
    shops.value = await (await fetch(SHOPS_URL + '?name=' + name)).json()
    // return shops.value;
    // //shops.value = await (await fetch(SHOPS_URL)).json()
    // shops.value = await response.json();
    // return response.status;
}

async function fetchCategories(){
    categories.value = await (await fetch(CATEG_URL)).json()
}

async function fetchShopsCateg(category){
   // shops.value = await (await fetch(SHOPS_URL + '?category=' + category)).json()
    let response = await fetch(SHOPS_URL + '?category=' + category);
    if(!response.ok){
        console.error('Error: ', response.statusText);
        warningMessage.value = 'Nessun negozio in questa categoria';
        while(shops.value.length > 0){
            //console.log('POPPING: '  + 'length: ' + markers.value.length + ': '+markers.value);
            shops.value.pop();
        }
        seeShops();
        throw new Error('fetch was not ok');
    }
    warningMessage.value = '';
    shops.value = await response.json();
    console.log('RESPONSE: ' + shops.value);
    //shops.value = await (await fetch(SHOPS_URL + '?name=' + name)).json()
    // return shops.value;
    // //shops.value = await (await fetch(SHOPS_URL)).json()
    // shops.value = await response.json();
    // return response.status;
}

async function fetchProd(){
    products.value = await (await fetch(PRODUCT_URL)).json()
}

async function fetchProdName(prodName){
    products.value = await (await fetch(PRODUCT_URL + '?name=' + prodName)).json()
}

async function updateCoordinates(coordinates, self) {
    console.log('updating coordinates');
    let response = await fetch(HOST+self, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { coordinates: coordinates } ),
    })
};


export { shops, categories, products, updateCoordinates, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName}