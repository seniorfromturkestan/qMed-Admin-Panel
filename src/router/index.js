import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/Login.vue'

// Лейаут админки
import MainLayout from '../layouts/MainLayout.vue'

// Внутренние страницы /main
import MainPage from '../pages/Main.vue'

import PolyclinicPage from '../pages/PolyclinicPage.vue'
import DepartmentPage from '../pages/DepartmentPage.vue'
import SectorPage from '../pages/SectorPage.vue'

// 403
// import ForbiddenPage from '../pages/Forbidden.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    { path: '/login', name: 'Login', component: LoginPage },

    // { path: '/403', name: 'Forbidden', component: ForbiddenPage },

    {
      path: '/main',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'MainPage',
          component: MainPage,
        },
        {
          path: 'polyclinic/:polyclinicId',
          name: 'PolyclinicPage',
          component: PolyclinicPage,
        },
        {
          path: 'polyclinic/:polyclinicId/department/:departmentId',
          name: 'DepartmentPage',
          component: DepartmentPage,
        },
        {
          path: 'polyclinic/:polyclinicId/department/:departmentId/sector/:sectorId',
          name: 'SectorPage',
          component: SectorPage,
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token =
    localStorage.getItem('accessToken') || localStorage.getItem('token')
  const role = localStorage.getItem('role') // 'super_admin' для доступа к структуре

  const isPublic = to.path === '/login'

  if (!token && !isPublic) {
    return next('/login')
  }

  if (token && to.path === '/login') {
    return next('/main')
  }
  

  if (to.meta && to.meta.requiresSuperAdmin && role !== 'super_admin') {
    return next('/403')
  }

  return next()
})

export default router