<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, searchShopByProduct, prodCategory, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops,*//* toggleCategories, */warningMessage, searchSC} from '../states/searchFunctions.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, setWaypoints,setEndingPoint, clearWaypoints, clearEndingPoint/*, clearMarkers */} from '@/states/mapsFunctions.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`


const visible = ref([false])

onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
  clearShops();
  clearSearchSC();
  clearWarning();
  clearEndingPoint();
  fetchProd();
  fetchCategories();
  clearWaypoints();
});

const toggleVisibility = (index) => {
  visible.value[index] = !visible.value[index]
}

</script>


<template>

<div class="containerwhite" style="padding-bottom: 4em;">
    <div class="left-column">
      <h2 class="headerh2">Cerca un prodotto!</h2>
      <h3 class="headerh3">Compariranno i negozi in cui puoi comprarlo</h3> 
      <div class="search-bar">
  <input type="text" v-model="searchSC" placeholder="Cerca prodotto" @keyup.enter="searchShopByProduct()"/>
  <button @click="searchShopByProduct()">Cerca</button>
  </div>
  <br/>
  <span style="color: red"> {{warningMessage}} </span>
  <br/>
  <!-- <button @click="control()">control</button> -->
    <BListGroup class="b-list-group">
     <BListGroupItem v-for="(shop, index) in shops.value" :key="shop.self" v-if="shops.value.length !== undefined " class="b-list-group-item">
        <li >
          <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }} <br>
         
          <BButton
            :class="visible[index] ? null : 'collapsed'"
            :aria-expanded="visible[index] ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="toggleVisibility(index)"
            class="b-button">
              Informazioni
          </BButton> <br>
          <BButton
            @click="setWaypoints(shop)"
            class="b-button">
              Seleziona come waypoint</BButton> <br>
              
          <BCollapse id="collapse-4" v-model="visible[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
     </BListGroupItem>
    </BListGroup>

    <BCard>
      <BListGroupItem v-for="(categ, index) in categories.value" :key="categ.self">
        <h2 style="text-align: left;">{{ categ.name }} </h2>
        <ul v-for="(prod, index) in products.value" :key="prod.self"  >
          <li v-if="prod.category==categ.name">
            <a :href="HOST+prod.self">{{prod.name}}</a>
            <BButton @click="searchShopByProduct(prod.category)" style="margin-left:10px;" class="b-button"> Trova negozi! </BButton>
          </li>
        </ul>
        
      </BListGroupItem>
     
    </BCard>
    </div>

    <div class="right-column">
    <GMap :markers="markers"/>
  </div>
  </div>

</template>

<style>
/* @import '/src/assets/style.css'; */
/* Styling the list group */
.search-section {
  flex: 1;
  max-width: 400px; 
}

/* Map section */
.map-section {
  flex: 2;
  margin-left: 20px; 
}

/* Styling the search bar and button */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px; /* Added to provide spacing between input and button */
  box-sizing: border-box;
}

.search-bar button {
  padding: 10px 10px;
  font-size: 16px;
  margin-left: 10px;
  border: none;
  background-color: #006890;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
}

.search-bar button:hover {
  background-color: #84B824;
} 
.button,
.waypoint-button {
  align-items: center;
  background-clip: padding-box;
  background-color: #006890;
  border: 1px solid transparent;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-family: Poppins;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  line-height: 1.25;
  margin: 0;
  min-height: 3rem;
  padding: calc(.875rem - 1px) calc(1.5rem - 1px);
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: auto;
}
.b-list-group {
  list-style-type: none;
  padding: 0;
}

.b-list-group-item {
  margin-bottom: 10px;
  padding: 5px;
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
</style>