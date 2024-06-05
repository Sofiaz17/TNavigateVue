<script setup>
import {clearWarning, clearSearchSC, clearShops, loadShops, loadCategories, isCategory, searchShopByName, capitalizeFirstLetter, searchShopfromCat, /*toggleShops,*//* toggleCategories,*/ /*shopCount, */warningMessage, searchSC} from '../states/searchFunctions.js'
import { ref, onMounted } from 'vue'
import { shops, categories, fetchShops, fetchShopsName, fetchCategories, fetchShopsCateg} from '../states/shops.js'
import ViewInformation from '@/components/ViewInformation.vue'
import GMap from '@/components/GMap.vue'
import { seeShops, markers, setEndingPoint, clearEndingPoint/*, clearMarkers */} from '@/states/mapsFunctions.js'

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
        <ul v-for="(shop, index) in shops.value" :key="shop.self">
          <li v-if="shops.value[0].category == categ.name">
            <a :href="HOST+shop.self">{{shop.name}}</a> - {{ shop.address }}
            <BButton
              :class="visible1[index] ? null : 'collapsed'"
              :aria-expanded="visible1[index] ? 'true' : 'false'"
              aria-controls="collapse-4"
              @click="toggleVisibility(index)">
                Informazioni
            </BButton>
            <BButton
            @click="setEndingPoint(shop)">
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
  
  </div>
  <div>
    <GMap :markers="markers" />
  </div>
  
</template> 