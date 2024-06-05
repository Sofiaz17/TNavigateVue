<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, searchShopByProduct, prodCategory, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops,*//* toggleCategories, */warningMessage, searchSC} from '../states/searchFunctions.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, setEndingPoint, setMultipleEndingPoints, clearEndingPoint/*, clearMarkers */} from '@/states/mapsFunctions.js'

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
});

const toggleVisibility = (index) => {
  visible.value[index] = !visible.value[index]
}

</script>


<template>

  <br/>
  <h1>Cerca negozio per prodotto:</h1>
  <br/>
  <input type="text" v-model="searchSC" placeholder="Cerca prodotto" @keyup.enter="searchShopByProduct()"/>
  <button @click="searchShopByProduct()">Cerca</button>
  <br/>
  <span style="color: red"> {{warningMessage}} </span>
  <br/>
  <!-- <button @click="control()">control</button> -->
    <BListGroup >
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
          <BButton @click="createRouteRequest()">MEGAROUTEEE</BButton>
          <BButton
            @click="setMultipleEndingPoints(shop)">
              Seleziona come destinazione</BButton>
          <BCollapse id="collapse-4" v-model="visible[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
     </BListGroupItem>
    </BListGroup>

    <BCard>
      <BListGroupItem v-for="(categ, index) in categories.value" :key="categ.self">
        <h2>{{ categ.name }}</h2>
        <ul v-for="(prod, index) in products.value" :key="prod.self"  >
          <li v-if="prod.category==categ.name">
            <a :href="HOST+prod.self">{{prod.name}}</a>
            <BButton @click="searchShopByProduct(prod.category)"> Trova negozi! </BButton>
          </li>
        </ul>
        
      </BListGroupItem>
     
    </BCard>
    
    <div>
    <GMap :markers="markers" />
  </div>
</template>