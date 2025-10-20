// Favorites state management for user's favorite shops

import { reactive } from 'vue'
import { loggedUser } from './loggedUser.js'

const favorites = reactive([])

// Load favorites from localStorage
function loadFavorites() {
  if (!loggedUser.id) {
    favorites.length = 0
    return
  }
  
  const storedFavorites = localStorage.getItem(`favorites_${loggedUser.id}`)
  if (storedFavorites) {
    try {
      const parsedFavorites = JSON.parse(storedFavorites)
      favorites.length = 0
      favorites.push(...parsedFavorites)
    } catch (error) {
      console.error('Error parsing favorites from localStorage:', error)
      favorites.length = 0
    }
  } else {
    favorites.length = 0
  }
}

// Save favorites to localStorage
function saveFavorites() {
  if (!loggedUser.id) return
  
  localStorage.setItem(`favorites_${loggedUser.id}`, JSON.stringify(favorites))
}

// Add shop to favorites
function addToFavorites(shop) {
  if (!loggedUser.id || !loggedUser.token) {
    throw new Error('User not logged in')
  }
  
  // Check if shop is already in favorites
  const existingIndex = favorites.findIndex(fav => fav.self === shop.self || fav._id === shop._id || fav.id === shop.id)
  if (existingIndex !== -1) {
    return false // Already in favorites
  }
  
  // Add shop to favorites
  favorites.push(shop)
  saveFavorites()
  return true
}

// Remove shop from favorites
function removeFromFavorites(shop) {
  if (!loggedUser.id || !loggedUser.token) {
    throw new Error('User not logged in')
  }
  
  const index = favorites.findIndex(fav => fav.self === shop.self || fav._id === shop._id || fav.id === shop.id)
  if (index !== -1) {
    favorites.splice(index, 1)
    saveFavorites()
    return true
  }
  return false
}

// Check if shop is in favorites
function isFavorite(shop) {
  if (!loggedUser.id) return false
  
  return favorites.some(fav => fav.self === shop.self || fav._id === shop._id || fav.id === shop.id)
}

// Clear all favorites (useful for logout)
function clearFavorites() {
  favorites.length = 0
}

// Get all favorites
function getFavorites() {
  return [...favorites]
}

export { 
  favorites, 
  loadFavorites, 
  saveFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite, 
  clearFavorites, 
  getFavorites 
}
