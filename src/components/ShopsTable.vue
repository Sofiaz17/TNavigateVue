<script setup>
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat, /*toggleShops,*//* toggleCategories,*/ /*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted } from 'vue'
import { shops, categories, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg} from '../states/shops.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, setEndingPoint, clearWaypoints, clearEndingPoint/*, clearMarkers */} from '@/states/mapsFunctions.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`



const visible1 = ref([false])
const visible = ref(false)

onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
  clearShops();
  clearSearchSC();
  clearWarning();
  clearEndingPoint();
  clearWaypoints();
 // clearMarkers();  //not working
})

const toggleVisibility = (index) => {
  visible1.value[index] = !visible1.value[index]
}

async function toggleCategories() {
  if (!visible.value) {
    await loadCategories();
  }
  visible.value = !visible.value;
}

</script>


<template>
  <form>
    <span style="color: red"> {{warningMessage}} </span>
  </form>

  <div class="containerwhite" style="padding-bottom: 4em;">
    <div class="left-column">
  <div class="categories-list">
    <BCard>
    <BButton
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4"
      @click="toggleCategories()"
      class="b-button"
    >
    Elenco categorie
    </BButton>
    <BCollapse id="collapse-4" v-model="visible" class="mt-2">
  
    <BListGroup>
     
      <BListGroupItem v-for="categ in categories.value" :key="categ.self"  class="category-item">
        <div @click="searchShopfromCat(categ.name)">{{ categ.name }}</div>
        <ul v-for="(shop, index) in shops.value" :key="shop.self">
          <li v-if="shops.value[0].category == categ.name">
            <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }} <br>
            <BButton
              :class="visible1[index] ? null : 'collapsed'"
              :aria-expanded="visible1[index] ? 'true' : 'false'"
              aria-controls="collapse-4"
              @click="toggleVisibility(index)"
              class="b-button">
                Informazioni
            </BButton>
            <BButton
            @click="setEndingPoint(shop)" style="margin-left: 10px;">
              Seleziona come destinazione</BButton>
          <BCollapse id="collapse-4" v-model="visible1[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
          </li>
        </ul>
      </BListGroupItem>
 
    </BListGroup>
    </BCollapse>
    </BCard>
  
  </div></div>
  <div>
    <GMap :markers="markers" />
  </div>
  </div>

</template> 

<style scoped>
@import '/src/assets/style.css';

/* Styling the list group */
.b-list-group {
  list-style-type: none;
  padding: 0;
}

.b-list-group-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.b-list-group-item li {
  display: flex;
  flex-direction: column;
}

.b-list-group-item a {
  color: #0092D1;
  text-decoration: none;
}

.b-list-group-item a:hover {
  text-decoration: underline;
} 

/* Collapse button */
.b-button {
  margin-top: 10px;
  padding: 8px 12px;
  font-size: 14px;
  border: none;
  background-color: #006890 !important;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.b-button.collapsed {
  background-color: #006890 !important;
}

.b-button:hover {
  background-color: #84B824 !important; 
}

.b-collapse {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
}

.categories-list {
  margin-bottom: 20px;
}

.category-item {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.category-item:hover {
  background-color: #f0f0f0;
}
</style>