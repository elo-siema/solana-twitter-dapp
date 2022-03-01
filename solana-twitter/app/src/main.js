// css
import './main.css';

// routing
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

// app
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(router).mount('#app')