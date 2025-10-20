// https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-reactivity-api

import { reactive } from 'vue'

const loggedUser = reactive({
    token: undefined,
    email: undefined,
    id: undefined,
    self: undefined,
    userType: undefined,
    name: undefined,
    surname: undefined,
    phone: undefined,
    address: undefined
})

function setLoggedUser (data) {
    loggedUser.token = data.token;
    loggedUser.email = data.email;
    loggedUser.id = data.id;
    loggedUser.self = data.self;
    loggedUser.userType = data.userType;
    loggedUser.name = data.name;
    loggedUser.surname = data.surname;
    loggedUser.phone = data.phone;
    loggedUser.address = data.address;
    
    // Persist all user data in localStorage for session restoration
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userEmail', data.email || '');
        localStorage.setItem('userType', data.userType || '');
        localStorage.setItem('userName', data.name || '');
        localStorage.setItem('userSurname', data.surname || '');
        localStorage.setItem('userPhone', data.phone || '');
        localStorage.setItem('userAddress', data.address || '');
        
        // Dispatch custom event to notify App.vue of localStorage change
        window.dispatchEvent(new CustomEvent('localStorageChanged'));
    }
}

function clearLoggedUser () {
    loggedUser.token = undefined;
    loggedUser.email = undefined;
    loggedUser.id = undefined;
    loggedUser.self = undefined;
    loggedUser.userType = undefined;
    loggedUser.name = undefined;
    loggedUser.surname = undefined;
    loggedUser.phone = undefined;
    loggedUser.address = undefined;
    
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userSurname');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAddress');
    
    // Dispatch custom event to notify App.vue of localStorage change
    window.dispatchEvent(new CustomEvent('localStorageChanged'));
}

// Initialize from localStorage on app start
function initializeFromStorage() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');
    const name = localStorage.getItem('userName');
    const surname = localStorage.getItem('userSurname');
    const phone = localStorage.getItem('userPhone');
    const address = localStorage.getItem('userAddress');
    
    if (token && userId) {
        // Restore all user data from localStorage
        loggedUser.token = token;
        loggedUser.id = userId;
        loggedUser.email = email || undefined;
        loggedUser.userType = userType || undefined;
        loggedUser.name = name || undefined;
        loggedUser.surname = surname || undefined;
        loggedUser.phone = phone || undefined;
        loggedUser.address = address || undefined;
    }
}

// Validate token and restore session
async function validateAndRestoreSession() {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }

    try {
        // Import getCurrentUser dynamically to avoid circular dependency
        const { getCurrentUser } = await import('./apiFunctions.js');
        const userData = await getCurrentUser();
        
        // Update loggedUser with fresh data from backend
        setLoggedUser({ ...userData, token });
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        // Clear invalid session
        clearLoggedUser();
        return false;
    }
}

// Call initialization
initializeFromStorage();

export { loggedUser, setLoggedUser, clearLoggedUser, validateAndRestoreSession } 