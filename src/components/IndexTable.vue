<script setup>
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat,/* toggleShops, *//*toggleCategories, *//*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted, watch } from 'vue'
import { shops, categories, products, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg, fetchProd, fetchProdName} from '../states/shops.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, clearMarkers } from '@/states/mapsFunctions.js'

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const visible1 = ref([false])
const visible = ref(false)


onMounted( () => {
  //fetchShops() // fetch on init
  console.log('onMounted: called');
  clearShops();
  clearSearchSC();
  clearWarning();
  clearMarkers();
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


  <h1>Negozi:</h1>
  <div>
    <BCard>
    <BButton
      :class="visible ? null : 'collapsed'"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-controls="collapse-4"
      @click="toggleShops()"
    >
    Elenco negozi
    </BButton>
    <BCollapse id="collapse-4" v-model="visible" class="mt-2">
      <ul>
        <li v-for="(shop,index) in shops.value" :key="shop.self">
          <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
          <BButton
            :class="visible1[index] ? null : 'collapsed'"
            :aria-expanded="visible1[index] ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="toggleVisibility(index)">
              Informazioni
          </BButton>
        
          <BCollapse id="collapse-4" v-model="visible1[index]" class="mt-2">
              <ViewInformation v-if="shop" :shop="shop" />
          </BCollapse>
        </li>
      </ul>
    </BCollapse>
    </BCard>
  </div>
  <div>
    <GMap :markers="markers" />
  </div>
</template>