// Favorites state management for user's favorite shops with backend integration

import { reactive } from 'vue'
import { loggedUser } from './loggedUser.js'
import { getFavorites, addFavorite, removeFavorite, isShopFavorited } from './apiFunctions.js'

const favorites = reactive([])
const isLoading = reactive({ favorites: false, add: false, remove: false })
const error = reactive({ favorites: null, add: null, remove: null })

// Load favorites from backend with localStorage fallback
async function loadFavorites() {
  if (!loggedUser.id || !loggedUser.token) {
    favorites.length = 0
    return
  }
  
  isLoading.favorites = true
  error.favorites = null
  
  try {
    // Try to load from backend first
    const backendFavorites = await getFavorites()
    favorites.length = 0
    favorites.push(...backendFavorites)
    
    // Update localStorage with backend data
    localStorage.setItem(`favorites_${loggedUser.id}`, JSON.stringify(backendFavorites))
    
  } catch (backendError) {
    console.warn('Backend favorites unavailable, falling back to localStorage:', backendError)
    error.favorites = backendError.message
    
    // Fallback to localStorage
    const storedFavorites = localStorage.getItem(`favorites_${loggedUser.id}`)
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites)
        favorites.length = 0
        favorites.push(...parsedFavorites)
      } catch (parseError) {
        console.error('Error parsing favorites from localStorage:', parseError)
        favorites.length = 0
      }
    } else {
      favorites.length = 0
    }
  } finally {
    isLoading.favorites = false
  }
}

// Save favorites to localStorage
function saveFavorites() {
  if (!loggedUser.id) return
  
  localStorage.setItem(`favorites_${loggedUser.id}`, JSON.stringify(favorites))
}

// Add shop to favorites with backend sync
async function addToFavorites(shop) {
  if (!loggedUser.id || !loggedUser.token) {
    throw new Error('User not logged in')
  }
  
  let shopId;
  let shopObject = shop;
  
  // Check if 'shop' is an object with an 'id' or '_id', otherwise assume 'shop' is the ID string itself
  if (typeof shop === 'object' && shop !== null) {
    // It's a shop object, extract the ID
    shopId = shop.self || shop._id || shop.id || shop._links?.self?.href || shop.href
    shopObject = shop
  } else if (typeof shop === 'string' && shop.length === 24) {
    // It's a MongoDB ObjectId string
    shopId = shop
    shopObject = { id: shop, _id: shop, self: shop } // Create a minimal shop object for local storage
  } else {
    console.warn('Could not determine shop ID, using localStorage only. Received:', shop)
    console.warn('Shop type:', typeof shop, 'Length:', shop?.length)
    
    // Fallback: add to local state only without backend sync
    favorites.push(shopObject)
    saveFavorites()
    return true
  }
  
  // Check if shop is already in favorites
  const existingIndex = favorites.findIndex(fav => 
    fav.self === shopObject.self || 
    fav._id === shopObject._id || 
    fav.id === shopObject.id ||
    (shopId && (fav.self === shopId || fav._id === shopId || fav.id === shopId))
  )
  if (existingIndex !== -1) {
    return false // Already in favorites
  }
  
  if (!shopId) {
    console.warn('Shop ID not found, using localStorage only. Shop structure:', shop)
    console.warn('Available shop properties:', Object.keys(shop))
    
    // Fallback: add to local state only without backend sync
    favorites.push(shopObject)
    saveFavorites()
    return true
  }
  
  isLoading.add = true
  error.add = null
  
  try {
    // Try to add to backend first
    await addFavorite(shopId)
    console.log(`Shop ${shopId} successfully added to backend favorites.`)
    
    // Add to local state
    favorites.push(shopObject)
    saveFavorites()
    return true
    
  } catch (backendError) {
    console.warn('Backend add favorite failed, using localStorage only:', backendError)
    error.add = backendError.message
    
    // Fallback: add to local state only
    favorites.push(shopObject)
    saveFavorites()
    return true
    
  } finally {
    isLoading.add = false
  }
}

// Remove shop from favorites with backend sync
async function removeFromFavorites(shop) {
  if (!loggedUser.id || !loggedUser.token) {
    throw new Error('User not logged in')
  }
  
  let shopId;
  let shopObject = shop;
  
  // Check if 'shop' is an object with an 'id' or '_id', otherwise assume 'shop' is the ID string itself
  if (typeof shop === 'object' && shop !== null) {
    // It's a shop object, extract the ID
    shopId = shop.self || shop._id || shop.id || shop._links?.self?.href || shop.href
    shopObject = shop
  } else if (typeof shop === 'string' && shop.length === 24) {
    // It's a MongoDB ObjectId string
    shopId = shop
    shopObject = { id: shop, _id: shop, self: shop } // Create a minimal shop object for local storage
  } else {
    console.warn('Could not determine shop ID, using localStorage only. Received:', shop)
    console.warn('Shop type:', typeof shop, 'Length:', shop?.length)
    
    // Fallback: remove from local state only without backend sync
    const index = favorites.findIndex(fav => 
      fav.self === shopObject.self || 
      fav._id === shopObject._id || 
      fav.id === shopObject.id ||
      (shopId && (fav.self === shopId || fav._id === shopId || fav.id === shopId))
    )
    if (index !== -1) {
      favorites.splice(index, 1)
      saveFavorites()
    }
    return true
  }
  
  const index = favorites.findIndex(fav => 
    fav.self === shopObject.self || 
    fav._id === shopObject._id || 
    fav.id === shopObject.id ||
    (shopId && (fav.self === shopId || fav._id === shopId || fav.id === shopId))
  )
  if (index === -1) {
    return false
  }
  
  if (!shopId) {
    console.warn('Shop ID not found, using localStorage only. Shop structure:', shop)
    console.warn('Available shop properties:', Object.keys(shop))
    
    // Fallback: remove from local state only without backend sync
    favorites.splice(index, 1)
    saveFavorites()
    return true
  }
  
  isLoading.remove = true
  error.remove = null
  
  try {
    // Try to remove from backend first
    await removeFavorite(shopId)
    console.log(`Shop ${shopId} successfully removed from backend favorites.`)
    
    // Remove from local state
    favorites.splice(index, 1)
    saveFavorites()
    return true
    
  } catch (backendError) {
    console.warn('Backend remove favorite failed, using localStorage only:', backendError)
    error.remove = backendError.message
    
    // Fallback: remove from local state only
    favorites.splice(index, 1)
    saveFavorites()
    return true
    
  } finally {
    isLoading.remove = false
  }
}

// Check if shop is in favorites (local check)
function isFavorite(shop) {
  if (!loggedUser.id) return false
  
  // Handle both object and string inputs
  if (typeof shop === 'string' && shop.length === 24) {
    // It's a MongoDB ObjectId string
    return favorites.some(fav => 
      fav.self === shop || fav._id === shop || fav.id === shop
    )
  } else if (typeof shop === 'object' && shop !== null) {
    // It's a shop object
    return favorites.some(fav => 
      fav.self === shop.self || fav._id === shop._id || fav.id === shop.id
    )
  }
  
  return false
}

// Check if shop is in favorites with backend verification
async function isFavoriteWithBackend(shop) {
  if (!loggedUser.id || !loggedUser.token) return false
  
  let shopId;
  
  // Handle both object and string inputs
  if (typeof shop === 'string' && shop.length === 24) {
    // It's a MongoDB ObjectId string
    shopId = shop
  } else if (typeof shop === 'object' && shop !== null) {
    // It's a shop object, extract the ID
    shopId = shop.self || shop._id || shop.id || shop._links?.self?.href || shop.href
  } else {
    return false
  }
  
  if (!shopId) return false
  
  try {
    return await isShopFavorited(shopId)
  } catch (error) {
    console.warn('Backend favorite check failed, using local state:', error)
    return isFavorite(shop)
  }
}

// Clear all favorites (useful for logout)
function clearFavorites() {
  favorites.length = 0
}

// Get all favorites
function getFavoritesList() {
  return [...favorites]
}

// Sync favorites with backend (useful for manual refresh)
async function syncFavorites() {
  await loadFavorites()
}

export { 
  favorites, 
  isLoading,
  error,
  loadFavorites, 
  saveFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite,
  isFavoriteWithBackend,
  clearFavorites, 
  getFavoritesList,
  syncFavorites
}
