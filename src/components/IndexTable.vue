<script setup>
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops, *//*toggleCategories, *//*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted, watch } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, setEndingPoint, clearWaypoints, clearEndingPoint, /*, clearMarkers */} from '@/states/mapsFunctions.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const visible1 = ref([false])
const visible = ref(false)


onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
  clearShops();
  clearSearchSC();
  clearWarning();
//  clearMarkers();
  clearEndingPoint()
  clearWaypoints();
});

const toggleVisibility = (index) => {
  visible1.value[index] = !visible1.value[index]
}



async function toggleShops() {
  if (!visible.value) {
    await loadShops();
  }
  visible.value = !visible.value;
}

</script>



<template>
  <form>
    <br />
    <span style="color: red"> {{warningMessage}} </span>
  </form>


  <div class="containerwhite" style="padding-bottom: 4em;">
    <div class="left-column">
      <h2 class="headerh2">Negozi:</h2>
  <div>
    <BCard>
    <BButton
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4"
      @click="toggleShops()"
      class="b-button"
    >
    Elenco negozi
    </BButton>
    <BCollapse id="collapse-4" v-model="visible" class="b-collapse mt-2">
      <ul>
        <li v-for="(shop,index) in shops.value" :key="shop.self">
          <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }} <br>
          <BButton
            :class="visible1[index] ? null : 'collapsed'"
            :aria-expanded="visible1[index] ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="toggleVisibility(index)"
            class="b-button"
            >
              Informazioni
          </BButton> 
          <BButton
            @click="setEndingPoint(shop)"
            class="b-button">
              Seleziona come destinazione</BButton>
          <BCollapse id="collapse-4" v-model="visible1[index]" class="b-collapse">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
      </ul>
    </BCollapse>
    </BCard>
  </div>
  </div>

  <div class="right-column">
    <GMap :markers="markers" />
  </div>
  </div>
</template>

<style>
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
  background-color: #03c9db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.b-button.collapsed {
  background-color: #006890;
}

.b-button:hover {
  background-color: #84B824;
}

.b-collapse {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
} 
</style>