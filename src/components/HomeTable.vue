<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops,*//* toggleCategories, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { /*getRoute,*/ seeShops, markers, setEndingPoint, /*, clearMarkers */endingPoint, clearEndingPoint} from '@/states/mapsFunctions.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'

const mapRef = ref(null);

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

//export
const visible = ref([false])
//const markers = ref([]);


onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called' );
  markers.value.forEach((marker)=>console.log('MARKERS: '+marker.position));
  clearShops();
  clearSearchSC();
  clearWarning();
  clearEndingPoint();
  
 // clearMarkers();
  //reinitializeMap();
  console.log('MARKERS: ' + markers.value.position);


});



// const toggleVisibility = (index) => {
//   //getRoute();
//   visible.value[index] = !visible.value[index]
//   // startingPoint = 
//   //console.log('this.$refs:' + this.$refs['Gmap']);
//   //console.log('MARKERS: ' + markers.value);
//  // mapRef.value.geolocate();
// }

const toggleVisibility= (index)  => {
//   //getRoute();
  visible.value[index] = !visible.value[index]
//   //console.log('this.$refs:' + this.$refs['Gmap']);
//   //console.log('MARKERS: ' + markers.value);
//  // mapRef.value.geolocate();
}




</script>


<template>

  <!-- <br/>
  <h1>Cerca negozio per nome o per categoria:</h1>
  <br/>
  <input type="text" v-model="searchSC" placeholder="Cerca negozio o categoria" @keyup.enter="searchShopByName()"/>
  <button @click="searchShopByName()">Cerca</button>
  <br/>
  <span style="color: red"> {{warningMessage}} </span>
  <br/> -->
  <!-- <button @click="control()">control</button> -->
    <!-- <BListGroup >
     <BListGroupItem v-for="(shop, index) in shops.value" :key="shop.self" v-if="shops.value.length !== undefined " >
        <li >
          <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
         
          <BButton
            :class="visible[index] ? null : 'collapsed'"
            :aria-expanded="visible[index] ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="toggleVisibility(index)">
              Informazioni
          </BButton>
        
          <BCollapse id="collapse-4" v-model="visible[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
     </BListGroupItem>
    </BListGroup>

  <div>
    <GMap  />
  
  </div>
     -->

  

<div class="container">
  <div class="left-column">
    <h1>Cerca negozio per nome o per categoria:</h1>
    <div class="search-bar">
      <input type="text" v-model="searchSC" placeholder="Cerca negozio o categoria" @keyup.enter="searchShopByName()" />
      <button @click="searchShopByName()">Cerca</button>
    </div>
    <span style="color: red">{{warningMessage}}</span>
    <BListGroup class="b-list-group">
      <BListGroupItem
        v-for="(shop, index) in shops.value" :key="shop.self"
        v-if="shops.value.length !== undefined"
        class="b-list-group-item"
      >
        <li>
          <a :href="HOST + shop.self">{{shop.name}}</a> - {{ shop.address }}
          <BButton
            :class="visible[index] ? null : 'collapsed'"
            :aria-expanded="visible[index] ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="toggleVisibility(index)"
            class="b-button"
          >
            Informazioni
          </BButton>
          <BButton
            @click="setEndingPoint(shop)">
              Seleziona come destinazione</BButton>
          <BCollapse id="collapse-4" v-model="visible[index]" class="b-collapse mt-2">
            <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
      </BListGroupItem>
    </BListGroup>
  </div>

  <div class="right-column">
    <GMap />
  </div>
</div>

</template>

<style>
/* Assuming you have a navbar */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #f8f9fa; /* Adjust this color to match your navbar */
  z-index: 1000; /* Ensure it stays on top */
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Container for the search and map section */
.container {
  display: flex;
  justify-content: space-between;
  margin-top: 70px; /* Adjust based on your navbar height */
  padding: 20px;
}

.left-column {
  width: 45%;
  padding: 2%;
}

.right-column {
  width: 45%;
  padding: 2%;
}
  /* 

/* Search section */
.search-section {
  flex: 1;
  max-width: 400px; /* Adjust based on preference */
}

/* Map section */
.map-section {
  flex: 2;
  margin-left: 20px; /* Space between search and map */
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
}

.search-bar button {
  padding: 10px 20px;
  font-size: 16px;
  margin-left: 10px;
  border: none;
  background-color: #03c9db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar button:hover {
  background-color: #0056b3;
}

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
  color: #007bff;
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
  background-color: #0056b3;
}

.b-button:hover {
  background-color: #0056b3;
}

/* Collapse content */
.b-collapse {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
}

</style>