<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loggedUser, setLoggedUser, clearLoggedUser } from '../states/loggedUser.js'
import { authenticateUser } from '../states/apiFunctions.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const emit = defineEmits(['login'])

async function login() {
  if (!email.value || !password.value) {
    error.value = 'Inserisci email e password'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const data = await authenticateUser(email.value, password.value)
    
    // Set user data with all fields from backend response
    setLoggedUser(data)
    
    // Clear form
    email.value = ''
    password.value = ''
    
    // Check if user is base_user
    if (data.userType === 'base_user') {
      // Redirect to profile page
      router.push('/profile')
    } else {
      // For shop_owner, redirect to profile page to manage shops
      router.push('/profile')
    }
    
    emit('login', loggedUser)
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Errore durante il login'
  } finally {
    isLoading.value = false
  }
}

function logout() {
  clearLoggedUser()
  router.push('/login')
}
</script>

<template>
  <div class="login-form">
    <span v-if="loggedUser.token">
      <div class="welcome-message">
        Benvenuto {{ loggedUser.name }} {{ loggedUser.surname }}!
        <br>
        <small>{{ loggedUser.email }}</small>
      </div>
      <button type="button" @click="logout" class="logout-btn">LogOut</button>
    </span>
    
    <form v-else @submit.prevent="login" class="login-form-content">
      <h3>Accedi al tuo account</h3>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email"
          v-model="email" 
          placeholder="Inserisci la tua email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password"
          v-model="password" 
          placeholder="Inserisci la tua password"
          required
        />
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button 
        type="submit" 
        :disabled="isLoading"
        class="login-btn"
      >
        {{ isLoading ? 'Accesso...' : 'Accedi' }}
      </button>
      
      <div class="signup-link">
        <p>Non hai un account? <router-link to="/signup">Registrati qui</router-link></p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.welcome-message {
  text-align: center;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.login-form-content h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #007bff;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.login-btn,
.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.logout-btn {
  background-color: #dc3545;
}

.logout-btn:hover {
  background-color: #c82333;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.signup-link a {
  color: #007bff;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>