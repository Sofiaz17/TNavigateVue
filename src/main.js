import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createBootstrap } from 'bootstrap-vue-next'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import VueGoogleMaps from '@fawmi/vue-google-maps';
const app = createApp(App)

app.use(VueGoogleMaps, {
  load: {
    key: import.meta.env.VITE_API_KEY
  }, 
});



// Make BootstrapVue available throughout the project
app.use(createBootstrap({components: true, directives: true}))

app.use(router)

// app.config.errorHandler = (err) => {
//     console.log("app error: " + err);
// }
app.config.errorHandler = (err, instance, info) => {
console.error('Error: ' + err +', Info: ' + info +', Instance: ' + + (instance?.type?.name || 'Unknown'));
};

app.mount('#app')