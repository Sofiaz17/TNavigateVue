<script setup>
import { RouterLink, RouterView } from 'vue-router'
//import HelloWorld from '@/components/HelloWorld.vue'
//import Login from '@/components/Login.vue'

//import { ref, onMounted } from 'vue'

</script>


<template>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>
<body>

  <header class="headerhome">
    
    <div class="headertext">
        <a>
            <img alt="TNavigate logo" src="./assets/TNavigate_logo_noBkgr.png" style="width: 20%; margin-bottom: 2em;">
        </a>
    </div>
    <!-- <img alt="TNavigate logo" class="logo" src="./assets/TNavigate_logo_noBkgr.png" width="250" height="125" /> -->

    <div class="topnav" id="barrapulsanti">

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/shops">Negozi</RouterLink>
        <RouterLink to="/products">Lista della spesa</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/signup">Registrati</RouterLink>
        <RouterLink to="/index">Indice negozi</RouterLink>
      </nav>
    </div>
  </header>
 
  <main>
    <RouterView />
    <!-- <TheWelcome /> -->
  </main> 
</body>

  <footer></footer>
</template>


<style scoped>
/* @import '@/assets/base.css'; */
@import './assets/style.css';

/* #app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: rgb(63, 189, 0);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(129, 88%, 16%, 0.13);
  }
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: space-evenly;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
