import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/User/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Cate from '../components/good/Cate'
import axios from 'axios'
import Params from '../components/good/Params'
import Add from '../components/good/Add'
import GoodList from '../components/good/List'
import Order from '../components/order/Order'
import Report from '../components/report/Report'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/login', component: Login },
    { path: '/', redirect: 'login' },
    { path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [{ path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/reports', component: Report },
        { path: '/orders', component: Order },
        { path: '/goods', component: GoodList },
        { path: '/goods/add', component: Add },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params }]
    }
  ]
})
// router.beforeEach((to, from, next) => {
//   if (to.path === '/login') return next()
//   const tokenStr = window.sessionStorage.getItem('token')
//   if (!tokenStr) return next('/login')
//   next()
// })
