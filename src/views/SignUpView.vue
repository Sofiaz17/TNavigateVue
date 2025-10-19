<script setup>
import SignUpTable from '@/components/SignUpTable.vue'
</script>

<template>
  <div class="signup-view">
    <h1>Registrazione</h1>
    <SignUpTable />
  </div>
</template>

<style scoped>
.signup-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: var(--color-heading);
  margin-bottom: 2rem;
}
</style>
