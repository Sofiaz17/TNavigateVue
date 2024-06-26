import { ref, onMounted, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProdName} from '../states/shops.js'
import { seeShops, markers/*, clearMarkers*/ } from '@/states/mapsFunctions.js'


const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const warningMessage = ref('')
const searchSC = ref('')
const categArray = ref([])
const categObj = new Object();

async function clearSearchSC(){
    return searchSC.value = ''
}
async function clearShops(){
    return shops.value = ''
}
async function clearWarning(){
    return warningMessage.value = ''
}


async function loadShops(){
    //clearShops();
    try{
      await fetchShops();
      console.log('shops in map: ' + shops.value);
      console.log('shops.value.cat: ' + shops.value[0].category);
  
      shops.value.sort((a, b) => a.name.localeCompare(b.name));
      seeShops();
      return;
    } catch(error){
        console.log('error: ' + error);
    }
}

async function loadCategories(){
  try{
    await fetchCategories();
    categories.value.sort((a, b) => a.name.localeCompare(b.name));
    return;
  } catch(error){
      console.log('error: ' + error);
    }
}
 
async function searchShopfromCat(category){
  try{
    await fetchShopsCateg(category);
    warningMessage.value = '';
    console.log('searchShopfromCat: ' + shops.value);
    if(shops.value.length === 0){
      warningMessage.value = 'Nessun risultato';
      
    }
      warningMessage.value = '';
      shops.value.sort((a, b) => a.name.localeCompare(b.name));
      shops.value.forEach((shop)=>{
        let keyCat = shop.name;
        console.log('OBJ cat, name: '+ shop.category + ', ' +shop.name);
        categObj[keyCat] = shop.category;
      })

      //console.log('map length: '+ Object.entries(categObj).length);
      console.log('OBJ: ' + JSON.stringify(categObj,null,2));
      
      categArray.value.push(shops.value);
      console.log('SHOPS: ' + shops.value);
      console.log('CATEGARRAY: ' );

      categArray.value.forEach((element) =>{
        console.log('Element: ' );
        element.forEach((shop) => {console.log(shop.name)})});
      seeShops();
      return;
    
  } catch(error){
      console.log('error: ' + error);
    }
}

//checkes whether a user input is a category expressed in enum in Shop Mongoose Schema
async function isCategory(input) {
  try{
    await fetchCategories();
                console.log('input: ' + input);
                console.log('cat.value[1].name: ' + categories.value.name);
    const category = categories.value.find(categ => categ.name.toLowerCase() == input.toLowerCase());
                console.log('CATEGORY EXISTING: ', category);
                console.log('category !== undefined: ', category !== undefined);
    if(category !== undefined){
        return true;
    } else {
        return false;
    }
  } catch(error){
      console.log('error: ' + error);
    }
}

async function searchShopByName(categToSearch){
                console.log('searchShopByName called');
    //controllo di searchSC
  if (searchSC.value == '' && categToSearch==undefined) {
    warningMessage.value = 'Inserisci un nome valido!';
    return;
  }
  warningMessage.value = ''

  if(categToSearch!=undefined){
    searchShopfromCat(categToSearch);
  }
  else {
    let isCat = await isCategory(searchSC.value);
                console.log('iscateg value:'+ isCat);
                console.log('isCategory(userInput)==true: ', isCat==true);
     if(isCat == true){
                console.log('fetch category url');
        searchShopfromCat(searchSC.value.toLowerCase());
    } else {
                console.log('fetch name url');
                console.log('userinput in fetch name: ',capitalizeFirstLetter(searchSC.value));
        try{
          await fetchShopsName(capitalizeFirstLetter(searchSC.value));
                //console.log('shops.value: ' + shops.value[0].name);
                console.log('shops.value.length: ' + shops.value.length);
                
          if(shops.value.length == undefined){
            warningMessage.value = 'Nessun risultato';
            return;
          }
          warningMessage.value = '';
   
          shops.value.sort((a, b) => a.name.localeCompare(b.name));
          seeShops();
          return;
        }catch(error){
                console.log('error: ' + error);
        }
    }
}}

async function searchShopByProduct(categToSearch){
    console.log('searchShopByProduct ENTERED');
    //controllo di searchSC
 if (searchSC.value == '' && categToSearch==undefined) {
    warningMessage.value = 'Inserisci un nome valido!';
    return;
  }
  warningMessage.value = ''
 try{
    console.log('SEARCHBYPROD categtosearch: ' + categToSearch);
    if(categToSearch==undefined){
        categToSearch = await prodCategory();
            console.log('categToSearch value:'+ categToSearch);
            console.log('PROD searchSC.value:'+ searchSC.value);
   } 
    console.log('PROD, products.value.length: ' + products.value.length);
    if(products.value.length === 0){
        warningMessage.value = 'Nessun risultato';
        return;
    }
        warningMessage.value = '';   
        
    searchShopByName(categToSearch);
    
 }catch(error){
    console.log('error: ' + error);
 }

}



async function prodCategory(){
    try{
        await fetchProdName(searchSC.value.toLowerCase());
        console.log('products: ' + products.value);
        console.log('products.value[0]: ' + products.value[0]);
        if(products.value.length === 0){
            warningMessage.value = 'Nessun risultato';
            return;
        }
        warningMessage.value = ''; 
        console.log('products.category: ' + products.category); 

        let prodCats = products.value.map((prod) => prod.category);
        console.log('prodcats: ' + prodCats);
        return prodCats;
      } catch(error){
          console.log('error: ' + error);
        }
    }






//capitalizes first letter of a string
function capitalizeFirstLetter(string) {
    //console.log('CAPITALIZE-> string: ' + string);
    let lowerstring = string.toLowerCase();
    //console.log('CAPITALIZE-> lowerstring: ' + lowerstring);
    let words = lowerstring.split(' ');
    //console.log('CAPITALIZE-> words: ' + words);
    words.forEach(function(word, index, array){
        //console.log('word.charAt(0).toUpperCase() + word.slice(1): ' + word.charAt(0).toUpperCase() + word.slice(1));
        array[index] = word.charAt(0).toUpperCase() + word.slice(1);
       // console.log('CAPITALIZE-> word1: ' + word1); 
    })
    //console.log('CAPITALIZE-> words.join: ' + words.join(' ')); 
    return words.join(' ');
    //return string.charAt(0).toUpperCase() + string.slice(1);
}


export {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByProduct, prodCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops, *//*toggleCategories, *//*shopCount,*/ warningMessage, searchSC}