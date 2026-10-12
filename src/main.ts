import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { useDarkMode } from './composables/useDarkMode'

useDarkMode()

createApp(App).use(router).mount('#app')
