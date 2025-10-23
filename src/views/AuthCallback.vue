<template>
  <div class="callback">
    <p>Please wait, authenticating...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setLoggedUser } from '../states/loggedUser.js';
import { getCurrentUser } from '../states/apiFunctions.js';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const token = route.query.token;

  if (token) {
    localStorage.setItem('token', token);
    
    try {
      // Fetch user details with the new token
      const user = await getCurrentUser();
      
      // Update the loggedUser state
      setLoggedUser(user);
      
      // Redirect to profile page
      router.push('/profile');
    } catch (error) {
      console.error('Failed to fetch user after Google auth:', error);
      router.push('/login?message=Authentication failed. Please try again.');
    }
  } else {
    // Handle error: no token
    router.push('/login?message=Authentication failed. No token received.');
  }
});
</script>

<style scoped>
.callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
}
</style>
