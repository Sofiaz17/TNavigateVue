import { ref, onMounted, computed } from 'vue'
import { shops, categories, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg} from '../states/shops.js'


const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const warningMessage = ref('')
const searchSC = ref('')



async function loadShops(){
    try{
      await fetchShops();
      console.log('shops in map: ' + shops.value);
      console.log('shops.value.cat: ' + shops.value[0].category);
  
      shops.value.sort((a, b) => a.name.localeCompare(b.name));
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
    console.log('searchShopfromCat: ' + shops);
    if(shops.value.length === 0){
      warningMessage.value = 'Nessun risultato';
    }
      warningMessage.value = '';
      shops.value.sort((a, b) => a.name.localeCompare(b.name));
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

async function searchShopByName(){
                console.log('searchShopByName called');
    //controllo di searchSC
  if (searchSC.value == '') {
    warningMessage.value = 'Inserisci un nome valido!';
    return;
  }
  warningMessage.value = ''
  
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
                console.log('shops.value.length: ' + shops.value.length);
          if(shops.value.length == undefined){
            warningMessage.value = 'Nessun risultato';
            return;
          }
          warningMessage.value = '';
                console.log('ciao');
            
               
                  
          shops.value.sort((a, b) => a.name.localeCompare(b.name));
          return;
        }catch(error){
                console.log('error: ' + error);
        }
    }
}


// const shopCount = computed(() => {
//   return shops.value.length;
// });

//capitalizes first letter of a string
function capitalizeFirstLetter(string) {
    console.log('CAPITALIZE-> string: ' + string);
    let lowerstring = string.toLowerCase();
    console.log('CAPITALIZE-> lowerstring: ' + lowerstring);
    let words = lowerstring.split(' ');
    console.log('CAPITALIZE-> words: ' + words);
    words.forEach(function(word, index, array){
        console.log('word.charAt(0).toUpperCase() + word.slice(1): ' + word.charAt(0).toUpperCase() + word.slice(1));
        array[index] = word.charAt(0).toUpperCase() + word.slice(1);
       // console.log('CAPITALIZE-> word1: ' + word1); 
    })
    console.log('CAPITALIZE-> words.join: ' + words.join(' ')); 
    return words.join(' ');
    //return string.charAt(0).toUpperCase() + string.slice(1);
}

async function viewInformation(shop){
    
}  

export {loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops, *//*toggleCategories, *//*shopCount,*/ warningMessage, searchSC}