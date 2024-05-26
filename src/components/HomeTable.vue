<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import {loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops,*//* toggleCategories, */warningMessage, searchSC} from '../states/searchFunctions.js'
import ViewInformation from '@/components/ViewInformation.vue'
const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`


const visible = ref([false])

onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
});

const toggleVisibility = (index) => {
  visible.value[index] = !visible.value[index]
}

</script>


<template>

  <br/>
  <h1>Cerca negozio per nome o per categoria:</h1>
  <br/>
  <input type="text" v-model="searchSC" placeholder="Cerca negozio o categoria" @keyup.enter="searchShopByName()"/>
  <button @click="searchShopByName()">Cerca</button>
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
        
          <BCollapse id="collapse-4" v-model="visible[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
     </BListGroupItem>
    </BListGroup>
    
</template>
