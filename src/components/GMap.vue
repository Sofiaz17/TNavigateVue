<template>
    <GMapMap
      ref="mapRef"
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
    </GMapMap>
  </template>
  
  <script>
  export default {
    name: 'GMap',
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
    data() {
      return {
        infoWindowIndex: null
      };
    }
    // mounted() {
    //   this.reinitializeMap();
    // },
    // watch: {
    //   markers: {
    //     handler() {
    //       this.updateMapMarkers();
    //     },
    //     deep: true
    //   }
    // },
    // methods: {
    //   openInfoWindow(index) {
    //     this.infoWindowIndex = index;
    //   },
    //   updateMapMarkers() {
    //     console.log('updateMapMarkers');
    //     if (this.map) {
    //       // Clear existing markers
    //       this.clearMarkers();
  
    //       // Add new markers to the map
    //       this.markers.forEach((marker, index) => {
    //         const newMarker = new google.maps.Marker({
    //           position: marker.position,
    //           map: this.map,
    //           clickable: true,
    //           draggable: false
    //         });
  
    //         // Store marker reference for future use
    //         this.$refs[`marker${index}`] = newMarker;
  
    //         newMarker.addListener('click', () => {
    //           this.openInfoWindow(index);
    //         });
    //       });
    //     }
    //   },
    //   clearMarkers() {
    //     console.log('clearMarkers');
    //     this.markers.forEach((marker, index) => {
    //       const refMarker = this.$refs[`marker${index}`];
    //       //console.log('refMarker: ' + JSON.stringify(refMarker));
    //       if (refMarker) {
    //         refMarker.setMap(null);
    //         this.$refs[`marker${index}`] = null;
    //       }
    //     });
    //   },
    //   reinitializeMap() {
    //     console.log('reinitializeMap');
    //     this.$refs.mapRef.$mapPromise.then((map) => {
    //       this.map = map;
    //       console.log('map initialized: ', map);
  
    //       // Initialize or update markers
    //       this.updateMapMarkers();
    //     }).catch((error) => {
    //       console.error('Error initializing map:', error);
    //     });
    //   }
    // }
  };
  </script>
  
  <style scoped>
  /* Add any necessary styling here */
  </style>
  