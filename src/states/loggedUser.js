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
}

export { loggedUser, setLoggedUser, clearLoggedUser } 