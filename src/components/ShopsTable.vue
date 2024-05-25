<script setup>
import {loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat, toggleShops, toggleCategories, /*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted } from 'vue'
import { shops, categories, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg} from '../states/shops.js'


const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

// const warningMessage = ref('')
// const searchSC = ref('')

onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
})

// async function loadShops(){
//   try{
//     await fetchShops();
//     console.log('shops in map: ' + shops.value);
//     shops.value.sort((a, b) => a.name.localeCompare(b.name));
//     console.log('shops.value.cat: ' + shops.value.category);
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
 
// // async function searchShopfromCat(category){
// //   try{
// //     await fetchShopsCateg(category);
// //       shops.value.sort((a, b) => a.name.localeCompare(b.name));
// //       return;
// //   } catch(error){
// //       console.log('error: ' + error);
// //     }
// // }

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


// //capitalizes first letter of a string
// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1);
// }


// const visible = ref(false)

// async function toggleCategories() {
//   if (!visible.value) {
//     await loadCategories();
//   }
//   visible.value = !visible.value;
// }

</script>



 <template>
  <form>
    <span style="color: red"> {{warningMessage}} </span>
  </form>

  <div>
    <BCard>
    <BButton
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4"
      @click="toggleCategories()"
    >
    Elenco categorie
    </BButton>
    <BCollapse id="collapse-4" v-model="visible" class="mt-2">
  
    <BListGroup>
     
      <BListGroupItem v-for="categ in categories.value" :key="categ.self">
        <div @click="searchShopfromCat(categ.name)">{{ categ.name }}</div>
        <ul v-for="shop in shops.value" :key="shop.self">
          <li v-if="shops.value[0].category == categ.name">
            <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
          </li>
        </ul>
      </BListGroupItem>
 
    </BListGroup>
    </BCollapse>
    </BCard>
  
  </div>
  
</template> 
