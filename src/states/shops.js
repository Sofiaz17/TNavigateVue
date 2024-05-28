import { reactive } from 'vue'

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
    shops.value = await (await fetch(SHOPS_URL + '?name=' + name)).json()
}

async function fetchCategories(){
    categories.value = await (await fetch(CATEG_URL)).json()
}

async function fetchShopsCateg(category){
    shops.value = await (await fetch(SHOPS_URL + '?category=' + category)).json()
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