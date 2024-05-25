<script setup>
import {loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat, toggleShops, toggleCategories, /*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted, watch } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`
//const API_URL = HOST+`/api/v1`
//const SHOPS_URL = API_URL+'/shops'
//const CATEG_URL = API_URL+'/shopCategories'
//const PRODUCT_URL = API_URL+ '/products'

//const title = ref('')
// const warningMessage = ref('')
// const searchSC = ref('')

//const input = ref('')



onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
})

// async function loadShops(){
//   try{
//     await fetchShops();
//     console.log('shops in map: ' + shops.value);
//     console.log('shops.value.cat: ' + shops.value[0].category);

//     shops.value.sort((a, b) => a.name.localeCompare(b.name));
//     return;
//   } catch(error){
//       console.log('error: ' + error);
//     }
// }

// async function loadCategories(){
//   try{
//     await fetchCategories();
//     categories.value.sort((a, b) => a.name.localeCompare(b.name));
//     return;
//   } catch(error){
//       console.log('error: ' + error);
//     }
// }
 
// async function searchShopfromCat(category){
//   try{
//     await fetchShopsCateg(category);
//       shops.value.sort((a, b) => a.name.localeCompare(b.name));
//       return;
//   } catch(error){
//       console.log('error: ' + error);
//     }
// }

// // //checkes whether a user input is a category expressed in enum in Shop Mongoose Schema
// async function isCategory(input) {
//   try{
//     await fetchCategories();
//     const category = categories.value.find(categories.value.toLowerCase() == input);
//     console.log('CATEGORY EXISTING: ', category);
//                 console.log('category !== undefined: ', category !== undefined);
//     if(category !== undefined){
//             return true;
//         } else {
//             return false;
//         }
//   } catch(error){
//       console.log('error: ' + error);
//     }
// }

// async function searchShopByName(){
//     //let fetchUrl;
//     //controllo di searchSC
//     let isCat = await isCategory(searchSC);
//                  console.log('iscateg value:'+ isCat);
//                  console.log('isCategory(userInput)==true: ', isCat==true);
//      if(isCat==true){
//         console.log('fetch category url');
//         searchShopfromCat(searchSC);
//     } else {
//         console.log('fetch name url');
//         console.log('userinput in fetch name: ',capitalizeFirstLetter(userInput));
//         try{
//           await fetchShopsName(searchSC);
//           shops.value.sort((a, b) => a.name.localeCompare(b.name));
//           return;
//         } catch(error){
//             console.log('error: ' + error);
//           }
//     }
// }

// //takes user-input and searches shop by name or by category, displaying the results
// async function searchShopByName(userInput) {           //called 4 times before fetching
//                 console.log("searchShopByName called");

//     const ul = document.getElementById('results'); 

//     ul.textContent = '';
//     let fetchUrl;
//     if(userInput === undefined)
//         userInput = document.getElementById('shopName').value.toLowerCase();
//                 console.log('userInput: ' + userInput);
//     let isCat = await isCategory(userInput);
//                 console.log('iscateg value:'+ isCat);
//                 console.log('isCategory(userInput)==true: ', isCat==true);
//     if(isCat==true){
//                 console.log('fetch category url');
//         fetchUrl = '../api/v1/shops?category=' + userInput;
//     } else {
//                 console.log('fetch name url');
//                 console.log('userinput in fetch name: ',capitalizeFirstLetter(userInput));
//         fetchUrl = '../api/v1/shops?name=' + capitalizeFirstLetter(userInput);
//     }

//     fetch(fetchUrl)
//     .then((resp) => resp.json()) // Transform the data into json
//     .then(function(data) { // Here you get the data to modify as you please
//                 console.log('enter func data Searchbyname');
//         // console.log(data);
//         // Sort the data array alphabetically based on the category names
//         data.sort((a, b) => a.name.localeCompare(b.name));
//                 console.log('before map data: ', data);
        
//         return data.map(function(shop) { // Map through the results and for each run the code below
//                 console.log('enter return');
//                 console.log('fetched data: ', shop);
//                 // let bookId = book.self.substring(book.self.lastIndexOf('/') + 1);
            
//             let li = document.createElement('li');
//             let span = document.createElement('span');
//             // span.innerHTML = `<a href="${book.self}">${book.title}</a>`;
//             let a = document.createElement('a');
//             //a.href = shop.self
//             a.addEventListener('click', function(event) {
//                 // Prevent the default behavior of following the link
//                 event.preventDefault();
//                 viewInformation(shop.name);
//             });
//             a.textContent = shop.name+ ', ' + shop.address;
//             // span.innerHTML += `<button type="button" onclick="takeBook('${book.self}')">Take the book</button>`
//              //let button = document.createElement('button');
//             // button.type = 'button'
//             // button.onclick = ()=>takeShop(category.self)
//             // button.textContent = 'Take the category';
            
//             // Append all our elements
//             span.appendChild(a);
//           //  span.appendChild(button);
//             li.appendChild(span);
//             ul.appendChild(li);
//         })
//     })
//     .catch( error => console.error(error) );// If there is any error you will catch them here
    
// }

// //capitalizes first letter of a string
// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1);
// }




// watch(loggedUser, (_loggedUser, _prevLoggedUser) => {
//   warningMessage.value = ''
// })



// function createBookButton() {
//   if (title.value=='') {
//     warningMessage.value = 'Please specify a valid title!'
//     return;
//   }
//   warningMessage.value = ''
//   createBook(title.value).catch( err => console.error(err) );
// };

// function deleteBookButton(book) {
//   deleteBook(book).catch( err => console.error(err) );
// };

// function takeBook(book) {
//   if (!loggedUser.token) {
//     warningMessage.value = 'Please login to take a book!'
//     return;
//   }
//   warningMessage.value = ''

//   fetch(LENDINGS_URL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'x-access-token': loggedUser.token
//         },
//         body: JSON.stringify( { student: loggedUser.self, book: book.self } ),
//     })
//     .then((resp) => {
//         return;
//     })
//     .catch( error => console.error(error) ); // If there is any error you will catch them here
// };
// const visible = ref(false)

// async function toggleShops() {
//   if (!visible.value) {
//     await loadShops();
//   }
//   visible.value = !visible.value;
// }

</script>



<template>
  <form>
    <br />
    <span style="color: red"> {{warningMessage}} </span>
  </form>


  <h1>Negozi:</h1>
  <div>
    <BCard>
    <BButton
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4"
      @click="toggleShops()"
    >
    Elenco negozi
    </BButton>
    <BCollapse id="collapse-4" v-model="visible" class="mt-2">
      <ul>
        <li v-for="shop in shops.value" :key="shop.self">
          <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
        </li>
      </ul>
    </BCollapse>
    </BCard>
  </div>
</template>
