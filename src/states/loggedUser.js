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
    
    // Persist token in localStorage for router guard
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
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
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
}

// Initialize from localStorage on app start
function initializeFromStorage() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
        // You might want to validate the token with the backend here
        // For now, we'll just set the token
        loggedUser.token = token;
        loggedUser.id = userId;
    }
}

// Call initialization
initializeFromStorage();

export { loggedUser, setLoggedUser, clearLoggedUser } 