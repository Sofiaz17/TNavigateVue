<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  shop: {
    type: Object,
    required: true
  }
})
</script>

<template>
    <div v-if="shop">
      <h3>Orari di apertura</h3>
      <ul>
        <li v-for="day in shop.opening_hours" :key="day.day">
          <strong>{{ day.day }}:</strong>
          <ul>
            <li v-if="day.state=='closed'">
                chiuso    
            </li>
          </ul>
          <ul v-for="period in day.periods" :key="period.startHours">
           
            <li >
              {{ period.startHours }}:{{ period.startMinutes.toString().padStart(2, '0') }} - 
              {{ period.endHours }}:{{ period.endMinutes.toString().padStart(2, '0') }}
            </li>
           
          </ul>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </template>
  

  
  <style scoped>
  /* Add any specific styles for this component */
  </style>
  