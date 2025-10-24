<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, validateUserRegistration, backendUrl } from '../states/apiFunctions.js'

const router = useRouter()

// Form data
const formData = reactive({
  userType: '',
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: ''
})

// Form validation
const errors = ref({})
const isSubmitting = ref(false)

// User type options
const userTypes = [
  { value: 'base_user', label: 'Utente Base' },
  { value: 'shop_owner', label: 'Proprietario Negozio' }
]

// Validation functions
function validateForm() {
  const validation = validateUserRegistration(formData)
  
  // Add confirm password validation
  if (formData.password !== formData.confirmPassword) {
    validation.errors.confirmPassword = 'Le password non coincidono'
  }
  
  errors.value = validation.errors
  return validation.isValid && !validation.errors.confirmPassword
}

// Submit form
async function submitForm() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const registrationData = {
      userType: formData.userType,
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      address: formData.address.trim()
    }
    
    await registerUser(registrationData)
    alert('Registrazione completata con successo! Ora puoi effettuare il login.')
    router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
    alert(`Errore durante la registrazione: ${error.message || 'Errore sconosciuto'}`)
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
function resetForm() {
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  errors.value = {}
}
</script>

<template>
  <div class="signup-form">
    <form @submit.prevent="submitForm">
      <!-- User Type Selection -->
      <div class="form-group">
        <label for="userType">Tipo di utente *</label>
        <div class="user-type-selection">
          <div 
            v-for="type in userTypes" 
            :key="type.value"
            class="user-type-option"
            :class="{ active: formData.userType === type.value }"
            @click="formData.userType = type.value"
          >
            <input 
              type="radio" 
              :id="type.value"
              :value="type.value"
              v-model="formData.userType"
              style="display: none;"
            >
            <label :for="type.value" class="user-type-label">
              {{ type.label }}
            </label>
          </div>
        </div>
        <span v-if="errors.userType" class="error-message">{{ errors.userType }}</span>
      </div>

      <!-- Name and Surname -->
      <div class="form-row">
        <div class="form-group">
          <label for="name">Nome *</label>
          <input 
            type="text" 
            id="name"
            v-model="formData.name"
            :class="{ error: errors.name }"
            placeholder="Inserisci il tuo nome"
          >
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        
        <div class="form-group">
          <label for="surname">Cognome *</label>
          <input 
            type="text" 
            id="surname"
            v-model="formData.surname"
            :class="{ error: errors.surname }"
            placeholder="Inserisci il tuo cognome"
          >
          <span v-if="errors.surname" class="error-message">{{ errors.surname }}</span>
        </div>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">Email *</label>
        <input 
          type="email" 
          id="email"
          v-model="formData.email"
          :class="{ error: errors.email }"
          placeholder="Inserisci la tua email"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <!-- Password Fields -->
      <div class="form-row">
        <div class="form-group">
          <label for="password">Password *</label>
          <input 
            type="password" 
            id="password"
            v-model="formData.password"
            :class="{ error: errors.password }"
            placeholder="Inserisci la password"
          >
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Conferma Password *</label>
          <input 
            type="password" 
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :class="{ error: errors.confirmPassword }"
            placeholder="Conferma la password"
          >
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>
      </div>

      <!-- Optional Fields -->
      <div class="form-group">
        <label for="phone">Telefono</label>
        <input 
          type="tel" 
          id="phone"
          v-model="formData.phone"
          placeholder="Inserisci il tuo numero di telefono"
        >
      </div>

      <div class="form-group">
        <label for="address">Indirizzo</label>
        <input 
          type="text" 
          id="address"
          v-model="formData.address"
          placeholder="Inserisci il tuo indirizzo"
        >
      </div>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="submit-btn"
        >
          {{ isSubmitting ? 'Registrazione...' : 'Registrati' }}
        </button>
        
        <button 
          type="button" 
          @click="resetForm"
          class="reset-btn"
        >
          Reset
        </button>
      </div>

      <!-- Login Link -->
      <div class="login-link">
        <p>Hai già un account? <router-link to="/login">Accedi qui</router-link></p>
      </div>
    </form>

    <div class="divider">
      <span>oppure</span>
    </div>

    <div class="google-signup">
      <a :href="`${backendUrl}/api/v1/authentications/google/signup/base_user`" class="google-signup-btn">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" class="google-logo"/>
        Registrati come Utente Base con Google
      </a>
      <a :href="`${backendUrl}/api/v1/authentications/google/signup/shop_owner`" class="google-signup-btn">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" class="google-logo"/>
        Registrati come Proprietario Negozio con Google
      </a>
    </div>
  </div>
</template>

<style scoped>
.signup-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #6c757d;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.divider:not(:empty)::before {
  margin-right: .5em;
}

.divider:not(:empty)::after {
  margin-left: .5em;
}

.google-signup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.google-signup-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  background-color: white;
  color: #444;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-signup-btn:hover {
  background-color: #f5f5f5;
}

.google-logo {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.user-type-selection {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.user-type-option {
  flex: 1;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.user-type-option:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.user-type-option.active {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.user-type-label {
  cursor: pointer;
  font-weight: 500;
  margin: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="tel"]:focus {
  outline: none;
  border-color: #007bff;
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn,
.reset-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: #006890;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #84B824;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn:hover {
  background-color: #545b62;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ddd;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .user-type-selection {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
