import "primeicons/primeicons.css";
import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import i18n from "./i18n";

const pinia = createPinia()
const app = createApp(App)

app
  .use(router)
  .use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark'
        }
    }
    })
  .use(i18n)
  .use(pinia);

app.mount('#app')
export default app;
