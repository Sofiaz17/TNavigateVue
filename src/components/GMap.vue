<template>
  <GMapMap
    :ref="Gmap"
    :center="center"
    :zoom="zoom"
    map-type-id="roadmap"
    style="width: 450px; height: 450px"
    :options="mapOptions"
  >
  <GMapMarker
      v-for="(marker, index) in markers"
      :key="index"
      :ref="`marker${index}`"
      :position="marker.position"
      :clickable="true"
      :draggable="false"
      @click="openInfoWindow(index)"
    />
    <!-- <GMapInfoWindow
        v-if="infoWindowIndex === index"
        :position="marker.position"
        :content="marker.info"
        @closeclick="closeInfoWindow"
      /> -->
  </GMapMap>
</template>

<script>

export default {
  name: 'GMap',
  // components: {
  //   GMapMap: () => import('@fawmi/vue-google-maps/component/Map'),
  //   GMapAdvancedMarkerElement: () => import('@fawmi/vue-google-maps/components/Marker'),
  //   GMapInfoWindow: () => import('@fawmi/vue-google-maps/components/InfoWindow')
  //   // GMapAdvancedMarkerElement,
  //   // GMapInfoWindow
  // },
  props: {
    center: {
      type: Object,
      default: () => ({ lat: 46.067546, lng: 11.121488 })
    },
    zoom: {
      type: Number,
      default: 15
    },
    mapOptions: {
      type: Object,
      default: () => ({
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
      })
    },
    markers: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return{
      infoWindowIndex: null
    };
  },
  watch: {
    markers: {
      handler(newMarkers) {
        this.updateMapMarkers(newMarkers);
      },
      deep: true
    }
  },
  methods: {
    openInfoWindow(index) {
      this.infoWindowIndex = null;
    },
    updateMapMarkers(newMarkers) {
      // Clear existing markers on the map
      if (this.$refs.gmap && this.$refs.gmap.$mapObject) {
        this.$refs.gmap.$mapObject.clear();
        // Add new markers to the map
        newMarkers.forEach(marker => {
          this.$refs.gmap.$mapObject.addMarker({
            position: marker.position,
            clickable: true,
            draggable: false
          });
        });
      }
    }
  }
}

// //console.log('this.$refs[map].$mapObject: ' + self.$refs.gmap.$mapObject);
// self.$nextTick(() => {
//     this.$refs.gmap.$mapCreated.then(() => {
//       console.log('this.$refs[map].$mapObject: ' + self.$refs.gmap.$mapObject);
//     })
// })
</script>

<style scoped>
/* Add any necessary styling here */
</style>




<!-- 
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  markers: {
    type: Object,
    required: true
  }
})
</script>

<template>
    <GMapMap>
    <GMapMarker
      :key="index"
      v-for="(m, index) in markers"
    />
  </GMapMap>
   

  <GMapMarker
        :key="markerDetails.id"
        :position="markerDetails.position"
        :clickable="true"
        :draggable="false"
        @click="openMarker(markerDetails.id)"
      >-->
        <!-- InfoWindow to display the searched location details -->
          <!-- <GMapInfoWindow
            v-if="locationDetails.address != ''"
            :closeclick="true"
            @closeclick="openMarker(null)"
            :opened="openedMarkerID === markerDetails.id"
            :options="{
              pixelOffset: {
                width: 10,
                height: 0
              },
              maxWidth: 320,
              maxHeight: 320
            }"

          >
            <div class="location-details">
                <p> Added Info </p>
            </div>
          </GMapInfoWindow>
      </GMapMarker>   
  </template>
  

  
  <style scoped>
  /* Add any specific styles for this component */
  </style>
   --> 