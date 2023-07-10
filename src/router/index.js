import { createRouter, createMemoryHistory  } from 'vue-router'
import Home from '../views/Home.vue'
import Cards from '../views/Cards.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/cards',
    name: 'Cards',
    component: Cards
  },
  {
    path: '/login',
    name: 'Authorization',
    component: () => import(/* webpackChunkName: "authorization" */ '../views/Authorization.vue')
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
