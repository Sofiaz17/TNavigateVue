// API functions for user registration and authentication

const HOST = import.meta.env.VITE_API_HOST || `http://localhost:3000`
const API_URL = HOST + `/api/v1`

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
      throw new Error(data.message || 'Authentication failed')
    }

    return data
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

/**
 * Get user profile information
 * @param {string} token - User's authentication token
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(token, userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile')
    }

    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

/**
 * Update user profile information
 * @param {string} token - User's authentication token
 * @param {string} userId - User's ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Update response
 */
export async function updateUserProfile(token, userId, updateData) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user profile')
    }

    return data
  } catch (error) {
    console.error('Update user profile error:', error)
    throw error
  }
}

/**
 * Delete user account
 * @param {string} token - User's authentication token
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Delete response
 */
export async function deleteUserAccount(token, userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to delete account')
    }

    return { success: true }
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
