// API functions for user registration and authentication

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`
const API_URL = HOST + `/api/v1`
const SHOPS_URL = API_URL + `/shops`

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.userType - 'base_user' or 'shop_owner'
 * @param {string} userData.name - User's first name
 * @param {string} userData.surname - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.phone - User's phone number (optional)
 * @param {string} userData.address - User's address (optional)
 * @returns {Promise<Object>} Registration response
 */
// In apiFunctions.js, modify the registerUser function:
export async function registerUser(userData) {
  try {
    console.log('Sending registration data:', userData) // Add this line
    
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()
    console.log('Backend response:', data) // Add this line

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

/**
 * Authenticate user login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication response
 */
export async function authenticateUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/authentications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

// Helper to handle 401 globally for profile endpoints
function handleAuthErrors(response, data) {
  if (response.status === 401) {
    // Clear all user data from localStorage
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userType')
      localStorage.removeItem('userName')
      localStorage.removeItem('userSurname')
      localStorage.removeItem('userPhone')
      localStorage.removeItem('userAddress')
      window.dispatchEvent(new CustomEvent('localStorageChanged'))
    } catch (_) {}
    throw new Error(data?.message || 'Unauthorized - Please login again')
  }
  
  // Handle other HTTP errors with actual API messages
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }
}

/**
 * Get current user information using the new /users/me endpoint
 * @returns {Promise<Object>} User profile data
 */
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Get current user error:', error)
    throw error
  }
}

/**
 * Get user profile information (legacy function for backward compatibility)
 * @returns {Promise<Object>} User profile data
 */
export async function getProfile() {
  return getCurrentUser()
}

/**
 * Update user profile information
 * @param {string} token - User's authentication token
 * @param {string} userId - User's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Update response
 */
export async function updateProfile(updateData) {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data // expected: { message, user }
  } catch (error) {
    console.error('Update profile error:', error)
    throw error
  }
}

/**
 * Delete user account
 * @param {string} token - User's authentication token
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Delete response
 */
export async function deleteAccount() {
  try {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data // { message: "Account deleted successfully" }
  } catch (error) {
    console.error('Delete account error:', error)
    throw error
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' }
  }
  
  return { isValid: true, message: 'Password is valid' }
}

/**
 * Validate user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateUserRegistration(userData) {
  const errors = {}
  
  if (!userData.userType) {
    errors.userType = 'User type is required'
  } else if (!['base_user', 'shop_owner'].includes(userData.userType)) {
    errors.userType = 'Invalid user type'
  }
  
  if (!userData.name || userData.name.trim().length === 0) {
    errors.name = 'Name is required'
  }
  
  if (!userData.surname || userData.surname.trim().length === 0) {
    errors.surname = 'Surname is required'
  }
  
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required'
  } else if (!validateEmail(userData.email)) {
    errors.email = 'Invalid email format'
  }
  
  if (!userData.password) {
    errors.password = 'Password is required'
  } else {
    const passwordValidation = validatePassword(userData.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}


// Shop owner: shops management

/**
 * Create a new shop (shop_owner only)
 * @param {Object} shopData - New shop data
 * @returns {Promise<Object>} Created shop payload
 */
export async function createShop(shopData) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${SHOPS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shopData)
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Create shop error:', error)
    throw error
  }
}

/**
 * Get shops owned by the current shop owner
 * Uses owner email as filter (owner is a String in schema)
 * @returns {Promise<Array>} Shops list
 */
export async function getMyShops() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Get current user info to get the email
    const userInfo = await getCurrentUser()
    const ownerEmail = userInfo.email
    
    if (!ownerEmail) {
      throw new Error('User email not found')
    }

    // Use proper URL encoding for the owner query
    const query = `?owner=${encodeURIComponent(ownerEmail)}`
    const response = await fetch(`${SHOPS_URL}${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return Array.isArray(data) ? data : (data.items || [])
  } catch (error) {
    console.error('Get my shops error:', error)
    throw error
  }
}

/**
 * Update a shop by its self link
 * @param {string} shopSelf - The HAL self path of the shop (e.g., /api/v1/shops/:id)
 * @param {Object} updateData - Partial shop data to update
 * @returns {Promise<Object>} Updated shop
 */
export async function updateShop(shopSelf, updateData) {
  try {
    if (!shopSelf) throw new Error('shopSelf is required')
    const token = localStorage.getItem('token')
    const response = await fetch(`${HOST}${shopSelf}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Update shop error:', error)
    throw error
  }
}

/**
 * Delete a shop by its self link
 * @param {string} shopSelf - The HAL self path of the shop
 * @returns {Promise<Object>} Delete response
 */
export async function deleteShop(shopSelf) {
  try {
    if (!shopSelf) throw new Error('shopSelf is required')
    const token = localStorage.getItem('token')
    const response = await fetch(`${HOST}${shopSelf}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Delete shop error:', error)
    throw error
  }
}

// ===== FAVORITES API FUNCTIONS =====

/**
 * Get user's favorite shops from backend
 * @returns {Promise<Array>} Array of favorite shops
 */
export async function getFavorites() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    const response = await fetch(`${API_URL}/users/me/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data.favorites || []
  } catch (error) {
    console.error('Get favorites error:', error)
    throw error
  }
}

/**
 * Add shop to user's favorites
 * @param {string} shopId - Shop ID to add to favorites
 * @returns {Promise<Object>} API response
 */
export async function addFavorite(shopId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    const response = await fetch(`${API_URL}/users/me/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shop_id: shopId })
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Add favorite error:', error)
    throw error
  }
}

/**
 * Remove shop from user's favorites
 * @param {string} shopId - Shop ID to remove from favorites
 * @returns {Promise<Object>} API response
 */
export async function removeFavorite(shopId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    const response = await fetch(`${API_URL}/users/me/favorites/${shopId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    handleAuthErrors(response, data)
    return data
  } catch (error) {
    console.error('Remove favorite error:', error)
    throw error
  }
}

/**
 * Check if shop is in user's favorites
 * @param {string} shopId - Shop ID to check
 * @returns {Promise<boolean>} Whether shop is favorited
 */
export async function isShopFavorited(shopId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false
    }
    
    const response = await fetch(`${API_URL}/users/me/favorites/${shopId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 404) {
      return false
    }
    
    const data = await response.json()
    handleAuthErrors(response, data)
    return true
  } catch (error) {
    console.error('Check favorite error:', error)
    return false
  }
}
