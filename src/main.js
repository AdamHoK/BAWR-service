import "primeicons/primeicons.css";
import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Badge from 'primevue/badge';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Popover from 'primevue/popover';

const app = createApp(App);

app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark'
        }
    }
});

app.component('Button', Button);
app.component('InputText', InputText);
app.component('FloatLabel', FloatLabel);
app.component('Badge', Badge);
app.component('Card', Card);
app.component('Dialog', Dialog);
app.component('Popover', Popover);

app.mount('#app')
