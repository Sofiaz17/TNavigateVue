<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loggedUser, setLoggedUser, clearLoggedUser } from '../states/loggedUser.js'
import { getUserProfile, updateUserProfile, validateEmail, validatePassword } from '../states/apiFunctions.js'

const router = useRouter()

const isEditing = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Form data for editing
const editData = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
  address: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation errors
const errors = ref({})

// Load user profile data
async function loadProfile() {
  if (!loggedUser.token || !loggedUser.id) {
    router.push('/login')
    return
  }

  try {
    isLoading.value = true
    const profileData = await getUserProfile(loggedUser.token, loggedUser.id)
    
    // Update logged user with fresh data
    setLoggedUser(profileData)
    
    // Populate edit form
    editData.name = profileData.name || ''
    editData.surname = profileData.surname || ''
    editData.email = profileData.email || ''
    editData.phone = profileData.phone || ''
    editData.address = profileData.address || ''
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = 'Errore nel caricamento del profilo'
  } finally {
    isLoading.value = false
  }
}

// Validate form
function validateForm() {
  errors.value = {}
  
  if (!editData.name.trim()) {
    errors.value.name = 'Il nome è obbligatorio'
  }
  
  if (!editData.surname.trim()) {
    errors.value.surname = 'Il cognome è obbligatorio'
  }
  
  if (!editData.email.trim()) {
    errors.value.email = 'L\'email è obbligatoria'
  } else if (!validateEmail(editData.email)) {
    errors.value.email = 'Formato email non valido'
  }
  
  // Password validation (only if changing password)
  if (editData.newPassword) {
    if (!editData.currentPassword) {
      errors.value.currentPassword = 'Inserisci la password corrente'
    }
    
    if (editData.newPassword !== editData.confirmPassword) {
      errors.value.confirmPassword = 'Le password non coincidono'
    }
    
    const passwordValidation = validatePassword(editData.newPassword)
    if (!passwordValidation.isValid) {
      errors.value.newPassword = passwordValidation.message
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Save profile changes
async function saveProfile() {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  try {
    const updateData = {
      name: editData.name.trim(),
      surname: editData.surname.trim(),
      email: editData.email.trim(),
      phone: editData.phone.trim(),
      address: editData.address.trim()
    }
    
    // Add password change if provided
    if (editData.newPassword) {
      updateData.currentPassword = editData.currentPassword
      updateData.newPassword = editData.newPassword
    }
    
    const updatedData = await updateUserProfile(loggedUser.token, loggedUser.id, updateData)
    
    // Update logged user with new data
    setLoggedUser(updatedData)
    
    success.value = 'Profilo aggiornato con successo!'
    isEditing.value = false
    
    // Clear password fields
    editData.currentPassword = ''
    editData.newPassword = ''
    editData.confirmPassword = ''
    
  } catch (err) {
    console.error('Error updating profile:', err)
    error.value = err.message || 'Errore nell\'aggiornamento del profilo'
  } finally {
    isLoading.value = false
  }
}

// Delete account
async function deleteAccount() {
  if (!confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.')) {
    return
  }
  
  if (!confirm('Confermi definitivamente l\'eliminazione del tuo account?')) {
    return
  }
  
  try {
    isLoading.value = true
    
    // Call delete account API (you'll need to implement this in apiFunctions.js)
    const response = await fetch(`${import.meta.env.VITE_API_HOST || 'http://localhost:8080'}/api/v1/users/${loggedUser.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${loggedUser.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Errore nell\'eliminazione dell\'account')
    }
    
    // Clear user data and redirect
    clearLoggedUser()
    router.push('/')
    alert('Account eliminato con successo')
    
  } catch (err) {
    console.error('Error deleting account:', err)
    error.value = err.message || 'Errore nell\'eliminazione dell\'account'
  } finally {
    isLoading.value = false
  }
}

// Cancel editing
function cancelEdit() {
  isEditing.value = false
  errors.value = {}
  error.value = ''
  success.value = ''
  
  // Reset form data
  editData.name = loggedUser.name || ''
  editData.surname = loggedUser.surname || ''
  editData.email = loggedUser.email || ''
  editData.phone = loggedUser.phone || ''
  editData.address = loggedUser.address || ''
  editData.currentPassword = ''
  editData.newPassword = ''
  editData.confirmPassword = ''
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Il Mio Profilo</h1>
      <button 
        v-if="!isEditing" 
        @click="isEditing = true" 
        class="edit-btn"
      >
        Modifica Profilo
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      Caricamento...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="success" class="success-message">
      {{ success }}
    </div>

    <div v-if="!isEditing" class="profile-info">
      <div class="info-section">
        <h3>Informazioni Personali</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Nome:</label>
            <span>{{ loggedUser.name || 'Non specificato' }}</span>
          </div>
          <div class="info-item">
            <label>Cognome:</label>
            <span>{{ loggedUser.surname || 'Non specificato' }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ loggedUser.email || 'Non specificato' }}</span>
          </div>
          <div class="info-item">
            <label>Telefono:</label>
            <span>{{ loggedUser.phone || 'Non specificato' }}</span>
          </div>
          <div class="info-item">
            <label>Indirizzo:</label>
            <span>{{ loggedUser.address || 'Non specificato' }}</span>
          </div>
          <div class="info-item">
            <label>Tipo Utente:</label>
            <span>{{ loggedUser.userType === 'base_user' ? 'Utente Base' : 'Proprietario Negozio' }}</span>
          </div>
        </div>
      </div>
    </div>

    <form v-else @submit.prevent="saveProfile" class="edit-form">
      <h3>Modifica Profilo</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="editName">Nome *</label>
          <input 
            type="text" 
            id="editName"
            v-model="editData.name"
            :class="{ error: errors.name }"
            placeholder="Inserisci il tuo nome"
          >
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        
        <div class="form-group">
          <label for="editSurname">Cognome *</label>
          <input 
            type="text" 
            id="editSurname"
            v-model="editData.surname"
            :class="{ error: errors.surname }"
            placeholder="Inserisci il tuo cognome"
          >
          <span v-if="errors.surname" class="error-message">{{ errors.surname }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="editEmail">Email *</label>
        <input 
          type="email" 
          id="editEmail"
          v-model="editData.email"
          :class="{ error: errors.email }"
          placeholder="Inserisci la tua email"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="editPhone">Telefono</label>
        <input 
          type="tel" 
          id="editPhone"
          v-model="editData.phone"
          placeholder="Inserisci il tuo numero di telefono"
        >
      </div>

      <div class="form-group">
        <label for="editAddress">Indirizzo</label>
        <input 
          type="text" 
          id="editAddress"
          v-model="editData.address"
          placeholder="Inserisci il tuo indirizzo"
        >
      </div>

      <div class="password-section">
        <h4>Cambia Password (opzionale)</h4>
        
        <div class="form-group">
          <label for="currentPassword">Password Corrente</label>
          <input 
            type="password" 
            id="currentPassword"
            v-model="editData.currentPassword"
            :class="{ error: errors.currentPassword }"
            placeholder="Inserisci la password corrente"
          >
          <span v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</span>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="newPassword">Nuova Password</label>
            <input 
              type="password" 
              id="newPassword"
              v-model="editData.newPassword"
              :class="{ error: errors.newPassword }"
              placeholder="Inserisci la nuova password"
            >
            <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Conferma Nuova Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              v-model="editData.confirmPassword"
              :class="{ error: errors.confirmPassword }"
              placeholder="Conferma la nuova password"
            >
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isLoading"
          class="save-btn"
        >
          {{ isLoading ? 'Salvataggio...' : 'Salva Modifiche' }}
        </button>
        
        <button 
          type="button" 
          @click="cancelEdit"
          class="cancel-btn"
        >
          Annulla
        </button>
      </div>
    </form>

    <div class="danger-zone">
      <h3>Zona Pericolosa</h3>
      <p>Elimina definitivamente il tuo account. Questa azione non può essere annullata.</p>
      <button 
        @click="deleteAccount"
        :disabled="isLoading"
        class="delete-btn"
      >
        Elimina Account
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.profile-header h1 {
  color: #333;
  margin: 0;
}

.edit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.profile-info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.info-item span {
  color: #333;
  font-size: 1rem;
}

.edit-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.edit-form h3 {
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.password-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.password-section h4 {
  color: #333;
  margin-bottom: 1rem;
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

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn {
  background-color: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #218838;
}

.save-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #545b62;
}

.danger-zone {
  background: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
}

.danger-zone h3 {
  color: #c53030;
  margin-bottom: 1rem;
}

.danger-zone p {
  color: #666;
  margin-bottom: 1.5rem;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.delete-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
