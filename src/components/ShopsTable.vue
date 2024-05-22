<script setup>
import { ref, onMounted, /*watch*/ } from 'vue'
import { shops, /*categories, products, */fetchShops/*, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName*/} from '../states/shops.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`
//const API_URL = HOST+`/api/v1`
//const SHOPS_URL = API_URL+'/shops'
//const CATEG_URL = API_URL+'/shopCategories'
//const PRODUCT_URL = API_URL+ '/products'

//const title = ref('')
const warningMessage = ref('')

//const input = ref('')



onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
})

async function loadShops(){
  await fetchShops();

  
    console.log('shops in map: ' + shops.value);
    shops.value.sort((a, b) => a.name.localeCompare(b.name));
    //return;
  }
  // console.log('fetch shops: ' + fetchShops());
  // fetchShops()
  //   .then( function(data){
  //     return 
      
  //     }
  //   )
//     .catch( err => console.error(err) );
// }

// function loadCategory() {
//     console.log("load category called");
    
//     const ul = document.getElementById('results'); 
//    // console.log(Shop);
//     ul.textContent = '';
  
//     //console.log('enumValues: ');
//    // console.log(Shop.schema.path('category'));


//    /// var categEnum = Shop.schema.path('category').enumValues;
    

//     // fetch('../api/v1/shops')
//     fetch('../api/v1/shopCategories')
//     .then((resp) => resp.json()) // Transform the data into json
//     .then(function(data) { // Here you get the data to modify as you please
//        // console.log('Enum values:', data);
//        // console.log(data);
//        // Sort the data array alphabetically based on the category names
//         //const categories = new Set(data.map(x => x.category));
//         console.log('CatData: ' + data);
        
//         //return categories.forEach(function(category) { // Map through the results and for each run the code below
//         return data.map(function(category) {  
//             // let bookId = book.self.substring(book.self.lastIndexOf('/') + 1);
//             console.log('CatCategoryName: ' + category.name);
//             let li = document.createElement('li');
//             let span = document.createElement('span');
//             // span.innerHTML = `<a href="${book.self}">${book.title}</a>`;
//             let a = document.createElement('a');
//            // a.href = category.self
//             a.textContent = category.name;
//             // span.innerHTML += `<button type="button" onclick="takeBook('${book.self}')">Take the book</button>`
//             let button = document.createElement('button');
//             button.type = 'button'
//             button.onclick = ()=>searchShopfromCat(category.name);
//             button.textContent = 'Visualizza negozi';

//             let button2 = document.createElement('button');
//             button2.type = 'button'
//             button2.onclick = ()=>searchProdfromCat(category.name);
//             button2.textContent = 'Visualizza prodotti';
            
//             // Append all our elements
//             span.appendChild(a);
//             span.appendChild(button);
//             span.appendChild(button2);
//             li.appendChild(span);
//             ul.appendChild(li);
//        })
//    })

//    .catch( error => console.error(error) );// If there is any error you will catch them here
    
// }


// //shows shops belonging to a specific category
// function searchShopfromCat(category) {
//     const ul = document.getElementById('results'); 
//     // console.log(Shop);
//      ul.textContent = '';
//     fetch('../api/v1/shops?category=' + category)
//     .then((resp) => resp.json()) // Transform the data into json
//     .then(function(data) { // 
//         console.log("searchShopfromCat called");
//         //const shopOfCateg = await Shop.find({data.category: category.name });
//         console.log('Data: ' + data);
        
//         return data.map(function(shop){
//             let li = document.createElement('li');
//             let span = document.createElement('span');
//          // span.innerHTML = `<a href="${book.self}">${book.title}</a>`;
//             let a = document.createElement('a');
//        // a.href = category.self
//             a.addEventListener('click', function(event) {
//         // Prevent the default behavior of following the link
//             event.preventDefault();
//                 viewInformation(shop.name);
//             });
//             a.textContent = shop.name + ', ' + shop.address;
//         // span.innerHTML += `<button type="button" onclick="takeBook('${book.self}')">Take the book</button>`
//         // Append all our elements
//             span.appendChild(a);
//             li.appendChild(span);
//             ul.appendChild(li);
//     })
// })
// }

// watch(loggedUser, (_loggedUser, _prevLoggedUser) => {
//   warningMessage.value = ''
// })

// function loadShops(){
//     const shops = fetchShops().catch( err => console.error(err) );

// }

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

</script>



<template>
  <form>
    <span>Insert a new shop</span>
    <br />
  <!-- <input v-model="name" /> -->
  <!--  <button type="button" @click="createBookButton">Create book {{title}}</button> -->
    <br />
    <span style="color: red"> {{warningMessage}} </span>
  </form>
  <h1>Shops:</h1>
  <button @click="loadShops()">Elenco negozi</button>
  <ul>
    <li v-for="shop in shops.value" :key="shop.self">
     
      <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
      
     <!-- <button @click="deleteBookButton(book)">DELETE</button> -->
    </li>
  </ul>
</template>
