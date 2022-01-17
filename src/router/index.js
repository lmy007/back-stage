import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/welcome.vue'
// import User from '../components/user/user.vue'
// import Rights from '../components/Auth/Rights.vue'
// import Roles from '../components/Auth/Roles.vue'
// import goodCate from '../components/Goods/goodCate.vue'
// import goodParams from '../components/Goods/goodParams.vue'
// import goodList from '../components/Goods/goodList.vue'
// import goodAdd from '../components/Goods/goodAdd.vue'
// import order from '../components/Order/order.vue'
// import report from '../components/report/report.vue'

const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/welcome.vue')
const User = () => import(/* webpackChunkName:"user_rights_roles" */ '../components/user/user.vue')
const Rights = () => import(/* webpackChunkName:"user_rights_roles" */ '../components/Auth/Rights.vue')
const Roles = () => import(/* webpackChunkName:"user_rights_roles" */ '../components/Auth/Roles.vue')
const goodCate = () => import(/* webpackChunkName:"cate_params" */ '..//components/Goods/goodCate.vue')
const goodParams = () => import(/* webpackChunkName:"cate_params" */ '..//components/Goods/goodParams.vue')
const goodList = () => import(/* webpackChunkName:"goodList_goodAdd" */ '..//components/Goods/goodList.vue')
const goodAdd = () => import(/* webpackChunkName:"goodList_goodAdd" */ '..//components/Goods/goodAdd.vue')
const order = () => import(/* webpackChunkName:"order_report" */ '..//components/Order/order.vue')
const report = () => import(/* webpackChunkName:"order_report" */ '..//components/report/report.vue')

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
      { path: '/params', component: goodParams },
      { path: '/goods', component: goodList },
      { path: '/goods/add', component: goodAdd },
      { path: '/orders', component: order },
      { path: '/reports', component: report }
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
