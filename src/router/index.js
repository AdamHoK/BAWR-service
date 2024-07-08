import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import BlankLandingPage from '../components/BlankLandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BlankLandingPage
    },
    {
      path: '/19028hjksadjknas12has',
      name: 'main',
      component: Home
    }
  ]
})

export default router
