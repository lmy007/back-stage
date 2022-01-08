import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/welcome.vue'
import User from '../components/user/user.vue'
import Rights from '../components/Auth/Rights.vue'
import Roles from '../components/Auth/Roles.vue'
import goodCate from '../components/Goods/goodCate.vue'
import goodParams from '../components/Goods/goodParams.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      { path: '/categories', component: goodCate },
      { path: '/params', component: goodParams }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') next()
  const token = sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})
export default router
