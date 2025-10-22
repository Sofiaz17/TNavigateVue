<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loggedUser, setLoggedUser, clearLoggedUser } from '../states/loggedUser.js'
import { getCurrentUser, updateProfile, deleteAccount as apiDeleteAccount, validateEmail, validatePassword, createShop, getMyShops, updateShop as apiUpdateShop, deleteShop as apiDeleteShop } from '../states/apiFunctions.js'
import { categories, fetchCategories, fetchShopDetails, shops } from '../states/shops.js'
import { favorites, loadFavorites, removeFromFavorites, isFavorite, isLoading as favoritesLoading, error as favoritesError, syncFavorites } from '../states/favorites.js'
import ViewInformation from './ViewInformation.vue'
const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`

const router = useRouter()

const isEditing = ref(false)
const profileLoading = ref(false)
const profileError = ref('')
const success = ref('')

// Shop owner state
const isShopOwner = ref(false)
const myShops = ref([])
const shopsLoading = ref(false)
const shopsError = ref('')
const showAddShopForm = ref(false)

const categoryOptions = ref([])

// ViewInformation visibility state
const visibleInfo = ref({})
const detailedShops = ref({}) // Store detailed shop data

const openingDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM']

function createEmptyOpeningHours() {
  return openingDays.map(d => ({ day: d, state: 'closed', periods: [] }))
}

// Toggle visibility for ViewInformation component
async function toggleInfoVisibility(shopId, shop) {
  const isVisible = visibleInfo.value[shopId]
  visibleInfo.value[shopId] = !isVisible
  
  // If we're showing the info and don't have detailed data yet, try to get it
  if (!isVisible && !detailedShops.value[shopId]) {
    // First, try to find the shop in the existing shops array
    const existingShop = shops.value.find(s => 
      s.self === shop.self || 
      s._id === shop._id || 
      s.id === shop.id ||
      s.name === shop.name
    )
    
    if (existingShop && existingShop.opening_hours) {
      detailedShops.value[shopId] = existingShop
    } else if (shop.self) {
      // If not found in existing shops, try to fetch from API
      try {
        const detailedShop = await fetchShopDetails(HOST + shop.self)
        detailedShops.value[shopId] = detailedShop
      } catch (error) {
        console.error('Error fetching shop details:', error)
        // Fallback to original shop data if fetch fails
        detailedShops.value[shopId] = shop
      }
    } else {
      // No self URL available, use original shop data
      detailedShops.value[shopId] = shop
    }
  }
}

const newShop = reactive({
  name: '',
  owner: '',
  address: '',
  civico: '',
  cap: '',
  city: '',
  provincia: '',
  coordinatesLat: '',
  coordinatesLng: '',
  category: '',
  information: '',
  opening_hours: createEmptyOpeningHours(),
})

const editingShopId = ref(null)
const editShopData = reactive({
  name: '',
  address: '',
  civico: '',
  cap: '',
  city: '',
  provincia: '',
  coordinatesLat: '',
  coordinatesLng: '',
  category: '',
  information: '',
  opening_hours: createEmptyOpeningHours(),
})

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
    profileLoading.value = true
    profileError.value = ''
    const profileData = await getCurrentUser()
    
    // Update user state with fresh data from backend
    setLoggedUser({ ...profileData, token: loggedUser.token, id: loggedUser.id })
    isShopOwner.value = profileData.userType === 'shop_owner'
    
    // Populate edit form
    editData.name = profileData.name || ''
    editData.surname = profileData.surname || ''
    editData.email = profileData.email || ''
    editData.phone = profileData.phone || ''
    editData.address = profileData.address || ''
  } catch (err) {
    console.error('Error loading profile:', err)
    if (err.message === 'Unauthorized' || err.message.includes('Unauthorized')) {
      clearLoggedUser()
      router.push('/login')
      return
    }
    profileError.value = err.message || 'Errore nel caricamento del profilo'
  } finally {
    profileLoading.value = false
  }
}

async function loadCategories() {
  try {
    await fetchCategories()
    categoryOptions.value = Array.isArray(categories.value) ? categories.value.map(c => c.name) : []
  } catch (e) {
    console.error('Error loading categories', e)
  }
}

async function loadOwnedShops() {
  if (!isShopOwner.value) return
  try {
    shopsLoading.value = true
    shopsError.value = ''
    const list = await getMyShops()
    myShops.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('Error loading shops', e)
    shopsError.value = e.message || 'Errore nel caricamento dei negozi'
  } finally {
    shopsLoading.value = false
  }
}

function resetNewShopForm() {
  newShop.name = ''
  newShop.owner = loggedUser.email || ''
  newShop.address = ''
  newShop.civico = ''
  newShop.cap = ''
  newShop.city = ''
  newShop.provincia = ''
  newShop.coordinatesLat = ''
  newShop.coordinatesLng = ''
  newShop.category = ''
  newShop.information = ''
  newShop.opening_hours = createEmptyOpeningHours()
}

function mapShopPayload(form) {
  const coords = []
  const lat = form.coordinatesLat !== '' ? Number(form.coordinatesLat) : null
  const lng = form.coordinatesLng !== '' ? Number(form.coordinatesLng) : null
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    coords.push(lat, lng)
  }
  return {
    name: form.name?.trim(),
    owner: loggedUser.email,
    address: form.address?.trim(),
    civico: form.civico !== '' ? Number(form.civico) : undefined,
    cap: form.cap !== '' ? Number(form.cap) : undefined,
    city: form.city?.trim(),
    provincia: form.provincia?.trim(),
    coordinates: coords,
    category: form.category || undefined,
    information: form.information?.trim(),
    opening_hours: form.opening_hours.map(d => ({
      day: d.day,
      state: d.state,
      periods: (d.periods || []).map(p => ({
        startHours: Number(p.startHours),
        startMinutes: Number(p.startMinutes),
        endHours: Number(p.endHours),
        endMinutes: Number(p.endMinutes),
      }))
    })),
    dataModified: true,
  }
}

async function submitNewShop() {
  try {
    shopsLoading.value = true
    shopsError.value = ''
    success.value = ''
    
    const payload = mapShopPayload(newShop)
    if (!payload.name) throw new Error('Il nome del negozio è obbligatorio')
    if (!payload.category) throw new Error('La categoria è obbligatoria')
    
    const res = await createShop(payload)
    showAddShopForm.value = false
    resetNewShopForm()
    
    // Refresh the shops list to show the new shop
    await loadOwnedShops()
    
    // Show success message from API response
    success.value = res?.message || 'Negozio creato con successo'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e) {
    console.error('Error creating shop:', e)
    shopsError.value = e.message || 'Errore nella creazione del negozio'
  } finally {
    shopsLoading.value = false
  }
}

function startEditShop(shop) {
  editingShopId.value = shop.self || shop._links?.self?.href?.replace(HOST,'') || shop._id || shop.id || null
  editShopData.name = shop.name || ''
  editShopData.address = shop.address || ''
  editShopData.civico = shop.civico ?? ''
  editShopData.cap = shop.cap ?? ''
  editShopData.city = shop.city || ''
  editShopData.provincia = shop.provincia || ''
  editShopData.coordinatesLat = Array.isArray(shop.coordinates) ? (shop.coordinates[0] ?? '') : ''
  editShopData.coordinatesLng = Array.isArray(shop.coordinates) ? (shop.coordinates[1] ?? '') : ''
  editShopData.category = shop.category || ''
  editShopData.information = shop.information || ''
  editShopData.opening_hours = (shop.opening_hours && shop.opening_hours.length)
    ? shop.opening_hours.map(d => ({ day: d.day, state: d.state, periods: (d.periods||[]).map(p => ({...p})) }))
    : createEmptyOpeningHours()
}

async function saveEditShop(shop) {
  try {
    shopsLoading.value = true
    shopsError.value = ''
    success.value = ''
    
    const payload = mapShopPayload(editShopData)
    const self = shop.self || shop._links?.self?.href?.replace(HOST,'')
    const res = await apiUpdateShop(self, payload)
    
    editingShopId.value = null
    
    // Refresh the shops list to show updated data
    await loadOwnedShops()
    
    // Show success message from API response
    success.value = res?.message || 'Negozio aggiornato con successo'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e) {
    console.error('Error updating shop:', e)
    shopsError.value = e.message || 'Errore nell\'aggiornamento del negozio'
  } finally {
    shopsLoading.value = false
  }
}

async function deleteShop(shop) {
  if (!confirm('Sei sicuro di voler eliminare questo negozio?')) return
  try {
    shopsLoading.value = true
    shopsError.value = ''
    success.value = ''
    
    const self = shop.self || shop._links?.self?.href?.replace(HOST,'')
    const res = await apiDeleteShop(self)
    
    // Refresh the shops list to reflect the deletion
    await loadOwnedShops()
    
    // Show success message from API response
    success.value = res?.message || 'Negozio eliminato con successo'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e) {
    console.error('Error deleting shop:', e)
    shopsError.value = e.message || 'Errore nell\'eliminazione del negozio'
  } finally {
    shopsLoading.value = false
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
  
  profileLoading.value = true
  profileError.value = ''
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
    
    const updatedData = await updateProfile(updateData)
    
    // Backend returns { message, user }
    const updatedUser = updatedData.user || updatedData
    setLoggedUser({ ...loggedUser, ...updatedUser, token: loggedUser.token, id: loggedUser.id })
    
    success.value = 'Profilo aggiornato con successo!'
    isEditing.value = false
    
    // Clear password fields
    editData.currentPassword = ''
    editData.newPassword = ''
    editData.confirmPassword = ''
    
  } catch (err) {
    console.error('Error updating profile:', err)
    if (err.message === 'Unauthorized') {
      clearLoggedUser()
      router.push('/login')
      return
    }
    profileError.value = err.message || 'Errore nell\'aggiornamento del profilo'
  } finally {
    profileLoading.value = false
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
    profileLoading.value = true
    
    const res = await apiDeleteAccount()
    
    clearLoggedUser()
    router.push('/')
    alert(res?.message || 'Account eliminato con successo')
    
  } catch (err) {
    console.error('Error deleting account:', err)
    if (err.message === 'Unauthorized') {
      clearLoggedUser()
      router.push('/login')
      return
    }
    profileError.value = err.message || 'Errore nell\'eliminazione dell\'account'
  } finally {
    profileLoading.value = false
  }
}

// Logout function
function logout() {
  clearLoggedUser()
  router.push('/')
}

// Cancel editing
function cancelEdit() {
  isEditing.value = false
  errors.value = {}
  profileError.value = ''
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

// Remove from favorites function
async function removeFromFavoritesList(shop) {
  try {
    await removeFromFavorites(shop)
  } catch (error) {
    console.error('Error removing from favorites:', error)
  }
}

// Sync favorites with backend
async function refreshFavorites() {
  try {
    await syncFavorites()
  } catch (error) {
    console.error('Error syncing favorites:', error)
  }
}

onMounted(() => {
  loadProfile()
  // After profile loaded, these may run; also run optimistically
  loadCategories()
  setTimeout(loadOwnedShops, 300)
  
  // Load favorites for the logged in user
  if (loggedUser.token) {
    loadFavorites()
  }
})
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Il Mio Profilo</h1>
      <div class="header-actions">
        <button 
          v-if="!isEditing" 
          @click="isEditing = true" 
          class="edit-btn"
        >
          Modifica Profilo
        </button>
        <button 
          @click="logout"
          class="logout-btn"
        >
          Logout
        </button>
      </div>
    </div>

    <div v-if="profileLoading" class="loading">
      Caricamento...
    </div>

    <div v-else-if="profileError" class="error-message">
      {{ profileError }}
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

      <!-- Favorites Section -->
      <div class="favorites-section">
        <div class="favorites-header">
          <h3>I miei negozi preferiti</h3>
          <button 
            @click="refreshFavorites" 
            class="sync-btn"
            :disabled="favoritesLoading.favorites"
            title="Sincronizza con il server"
          >
            {{ favoritesLoading.favorites ? 'Sincronizzazione...' : 'Sincronizza' }}
          </button>
        </div>
        
        <div v-if="favoritesError.favorites" class="error-message">
          <p> Errore nel caricamento dei preferiti: {{ favoritesError.favorites }}</p>
          <p>I dati mostrati provengono dalla cache locale.</p>
        </div>
        
        <div v-if="favoritesLoading.favorites" class="loading">
          Caricamento preferiti...
        </div>
        
        <div v-else-if="favorites.length === 0" class="no-favorites-message">
          <p>Non hai ancora aggiunto nessun negozio ai preferiti.</p>
          <p>Visita la sezione <router-link to="/shops">Indice negozi</router-link> per iniziare a esplorare!</p>
        </div>
        
        <div v-else class="favorites-list">
          <div class="favorite-card" v-for="shop in favorites" :key="shop.self || shop._id || shop.id">
            <div class="favorite-header">
              <h4>{{ shop.name }}</h4>
              <button 
                @click="removeFromFavoritesList(shop)" 
                class="remove-favorite-btn"
                :disabled="favoritesLoading.remove"
                :title="favoritesLoading.remove ? 'Rimozione in corso...' : 'Rimuovi dai preferiti'"
              >
                {{ favoritesLoading.remove ? '⏳' : '⭐' }}
              </button>
            </div>
            <div class="favorite-body">
              <div><strong>Categoria:</strong> {{ shop.category }}</div>
              <div><strong>Indirizzo:</strong> {{ shop.address }} {{ shop.civico }}, {{ shop.cap }} {{ shop.city }} ({{ shop.provincia }})</div>
              <div v-if="shop.information"><strong>Info:</strong> {{ shop.information }}</div>
              <div class="favorite-actions">
                <button 
                  :class="visibleInfo[shop.self || shop._id || shop.id] ? null : 'collapsed'"
                  :aria-expanded="visibleInfo[shop.self || shop._id || shop.id] ? 'true' : 'false'"
                  aria-controls="collapse-info"
                  @click="toggleInfoVisibility(shop.self || shop._id || shop.id, shop)"
                  class="view-details-btn">
                  Visualizza dettagli
                </button>
                <div v-if="visibleInfo[shop.self || shop._id || shop.id]" class="shop-info-collapse">
                  <ViewInformation 
                    v-if="(detailedShops[shop.self || shop._id || shop.id] || shop) && typeof (detailedShops[shop.self || shop._id || shop.id] || shop) === 'object'" 
                    :shop="detailedShops[shop.self || shop._id || shop.id] || shop" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isShopOwner" class="shops-section">
        <h3>I miei negozi</h3>
        <div class="shop-actions">
          <button class="add-shop-btn" @click="() => { showAddShopForm = !showAddShopForm; if (showAddShopForm) resetNewShopForm() }">
            {{ showAddShopForm ? 'Chiudi' : 'Aggiungi il tuo shop' }}
          </button>
        </div>

        <div v-if="shopsError" class="error-message">{{ shopsError }}</div>
        <div v-if="shopsLoading" class="loading">Caricamento negozi...</div>

        <form v-if="showAddShopForm" class="shop-form" @submit.prevent="submitNewShop">
          <div class="form-row">
            <div class="form-group">
              <label>Nome *</label>
              <input type="text" v-model="newShop.name" placeholder="Nome negozio">
            </div>
            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="newShop.category">
                <option value="" disabled>Seleziona categoria</option>
                <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Indirizzo</label>
              <input type="text" v-model="newShop.address" placeholder="Via/Piazza">
            </div>
            <div class="form-group">
              <label>Civico</label>
              <input type="number" v-model="newShop.civico" min="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>CAP</label>
              <input type="number" v-model="newShop.cap" min="0">
            </div>
            <div class="form-group">
              <label>Città</label>
              <input type="text" v-model="newShop.city">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Provincia</label>
              <input type="text" v-model="newShop.provincia">
            </div>
            <div class="form-group">
              <label>Coordinate (lat, lng)</label>
              <div class="coords">
                <input type="number" step="any" v-model="newShop.coordinatesLat" placeholder="Lat">
                <input type="number" step="any" v-model="newShop.coordinatesLng" placeholder="Lng">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Informazioni</label>
            <input type="text" v-model="newShop.information" placeholder="Descrizione breve">
          </div>

          <div class="opening-hours">
            <h4>Orari di apertura</h4>
            <div class="day-row" v-for="(d, idx) in newShop.opening_hours" :key="d.day">
              <div class="day-label">{{ d.day }}</div>
              <select v-model="d.state">
                <option value="open">Aperto</option>
                <option value="closed">Chiuso</option>
              </select>
              <div class="periods" v-if="d.state === 'open'">
                <div class="period" v-for="(p, pIdx) in d.periods" :key="pIdx">
                  <input type="number" min="0" max="23" v-model="p.startHours" placeholder="HH">
                  <input type="number" min="0" max="59" v-model="p.startMinutes" placeholder="MM">
                  <span>-</span>
                  <input type="number" min="0" max="23" v-model="p.endHours" placeholder="HH">
                  <input type="number" min="0" max="59" v-model="p.endMinutes" placeholder="MM">
                  <button type="button" class="small danger" @click="d.periods.splice(pIdx,1)">Rimuovi</button>
                </div>
                <button type="button" class="small" @click="d.periods.push({ startHours: 9, startMinutes: 0, endHours: 18, endMinutes: 0 })">Aggiungi fascia</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="shopsLoading">{{ shopsLoading ? 'Salvataggio...' : 'Crea Negozio' }}</button>
            <button type="button" class="cancel-btn" @click="showAddShopForm=false">Annulla</button>
          </div>
        </form>

        <div v-if="!shopsLoading && myShops.length === 0" class="no-shops-message">
          <p>Nessun negozio trovato. Aggiungi il tuo primo negozio!</p>
        </div>

        <div class="shops-list" v-if="myShops.length">
          <div class="shop-card" v-for="shop in myShops" :key="shop.self || shop._id">
            <div class="shop-header">
              <h4>{{ shop.name }}</h4>
              <div class="shop-actions-inline">
                <button class="small" @click="startEditShop(shop)">Modifica</button>
                <button class="small danger" @click="deleteShop(shop)">Elimina</button>
              </div>
            </div>
            <div class="shop-body" v-if="editingShopId === (shop.self || shop._links?.self?.href?.replace(HOST,'') || shop._id)">
              <div class="form-row">
                <div class="form-group">
                  <label>Nome</label>
                  <input type="text" v-model="editShopData.name">
                </div>
                <div class="form-group">
                  <label>Categoria</label>
                  <select v-model="editShopData.category">
                    <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Indirizzo</label><input type="text" v-model="editShopData.address"></div>
                <div class="form-group"><label>Civico</label><input type="number" v-model="editShopData.civico"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>CAP</label><input type="number" v-model="editShopData.cap"></div>
                <div class="form-group"><label>Città</label><input type="text" v-model="editShopData.city"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Provincia</label><input type="text" v-model="editShopData.provincia"></div>
                <div class="form-group">
                  <label>Coordinate (lat, lng)</label>
                  <div class="coords">
                    <input type="number" step="any" v-model="editShopData.coordinatesLat" placeholder="Lat">
                    <input type="number" step="any" v-model="editShopData.coordinatesLng" placeholder="Lng">
                  </div>
                </div>
              </div>
              <div class="form-group"><label>Informazioni</label><input type="text" v-model="editShopData.information"></div>

              <div class="opening-hours">
                <h4>Orari di apertura</h4>
                <div class="day-row" v-for="(d, idx) in editShopData.opening_hours" :key="d.day">
                  <div class="day-label">{{ d.day }}</div>
                  <select v-model="d.state">
                    <option value="open">Aperto</option>
                    <option value="closed">Chiuso</option>
                  </select>
                  <div class="periods" v-if="d.state === 'open'">
                    <div class="period" v-for="(p, pIdx) in d.periods" :key="pIdx">
                      <input type="number" min="0" max="23" v-model="p.startHours" placeholder="HH">
                      <input type="number" min="0" max="59" v-model="p.startMinutes" placeholder="MM">
                      <span>-</span>
                      <input type="number" min="0" max="23" v-model="p.endHours" placeholder="HH">
                      <input type="number" min="0" max="59" v-model="p.endMinutes" placeholder="MM">
                      <button type="button" class="small danger" @click="d.periods.splice(pIdx,1)">Rimuovi</button>
                    </div>
                    <button type="button" class="small" @click="d.periods.push({ startHours: 9, startMinutes: 0, endHours: 18, endMinutes: 0 })">Aggiungi fascia</button>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button class="save-btn" type="button" @click="saveEditShop(shop)">Salva</button>
                <button class="cancel-btn" type="button" @click="editingShopId=null">Annulla</button>
              </div>
            </div>
            <div class="shop-body" v-else>
              <div><strong>Categoria:</strong> {{ shop.category }}</div>
              <div><strong>Indirizzo:</strong> {{ shop.address }} {{ shop.civico }}, {{ shop.cap }} {{ shop.city }} ({{ shop.provincia }})</div>
              <div v-if="shop.information"><strong>Info:</strong> {{ shop.information }}</div>
            </div>
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
          :disabled="profileLoading"
          class="save-btn"
        >
          {{ profileLoading ? 'Salvataggio...' : 'Salva Modifiche' }}
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
        :disabled="profileLoading"
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
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

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c82333;
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
  
  .header-actions {
    justify-content: center;
  }
}

/* No shops message */
.no-shops-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.no-shops-message p {
  margin: 0;
  font-size: 1.1rem;
}

/* Button consistency styles */

/* Style for "Aggiungi il tuo shop" and "Chiudi" buttons to match "Modifica Profilo" */
.add-shop-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.add-shop-btn:hover {
  background-color: #0056b3;
}

/* Style for "Modifica" button to match "Modifica Profilo" */
.small {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  margin-right: 0.5rem;
}

.small:hover {
  background-color: #0056b3;
}

/* Style for "Elimina" button to match "Logout" and "Elimina Account" */
.small.danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.small.danger:hover {
  background-color: #c82333;
}

/* Favorites section styles */
.favorites-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.favorites-header h3 {
  color: #333;
  margin: 0;
}

.sync-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.sync-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.sync-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.no-favorites-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.no-favorites-message p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.no-favorites-message a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.no-favorites-message a:hover {
  text-decoration: underline;
}

.favorites-list {
  display: grid;
  gap: 1rem;
}

.favorite-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
  transition: box-shadow 0.2s ease;
}

.favorite-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.favorite-header h4 {
  color: #333;
  margin: 0;
  font-size: 1.2rem;
}

.remove-favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #ffd700;
  text-shadow: 0 0 3px rgba(255, 215, 0, 0.5);
}

.remove-favorite-btn:hover:not(:disabled) {
  transform: scale(1.1);
  background-color: rgba(255, 215, 0, 0.1);
}

.remove-favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.favorite-body {
  color: #555;
}

.favorite-body > div {
  margin-bottom: 0.5rem;
}

.favorite-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.view-details-btn {
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  display: inline-block;
}

.view-details-btn:hover {
  background-color: #0056b3;
  text-decoration: none;
  color: white;
}

.shop-info-collapse {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
  background-color: #f8f9fa;
}
</style>
