import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/Login.vue'

// Лейаут админки
import MainLayout from '../layouts/MainLayout.vue'

// // Внутренние страницы /main
import MainPage from '../pages/Main.vue'

// // Структура и персонал
// import PolyclinicListPage from '../pages/Structure/PolyclinicListPage.vue'
// import PolyclinicPatientsPage from '../pages/Structure/PolyclinicPatientsPage.vue'
// import PolyclinicDepartmentPage from '../pages/Structure/PolyclinicDepartmentPage.vue'

import PolyclinicPage from '../pages/PolyclinicPage.vue'
import DepartmentPage from '../pages/DepartmentPage.vue'
import SectorPage from '../pages/SectorPage.vue'

// // Профиль
// import ProfilePage from '../pages/Profile.vue'

// // 403 и 404
// import ForbiddenPage from '../pages/Forbidden.vue'
// import NotFoundPage from '../pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },

    { path: '/login', name: 'Login', component: LoginPage },

    {
        path: '/main',
        component: MainLayout,   // ← внешний layout
        children: [
          {
            path: '',
            name: 'MainPage',
            component: MainPage, // ← это твой Main.vue
          },
          {
            path: 'polyclinic/:id',
            name: 'PolyclinicPage',
            component: PolyclinicPage,
          },
          {
            path: 'polyclinic/:id/department/:id',
            name: 'DepartmentPage',
            component: DepartmentPage,
          },
          {
            path: 'department/:id/sector/:id',
            name: 'SectorPage',
            component: SectorPage,
          }
        ],
      }
    

    //     // ===== Структура и персонал (только для super_admin) =====
        
    //     {
    //       path: 'polyclinic/patients',
    //       name: 'PolyclinicPatients',
    //       component: PolyclinicPatientsPage,
    //       meta: { requiresSuperAdmin: true },
    //     },
    //     {
    //       path: 'polyclinic/department',
    //       name: 'PolyclinicDepartment',
    //       component: PolyclinicDepartmentPage,
    //       meta: { requiresSuperAdmin: true },
    //     },

    //     // Профиль текущего пользователя
    //     {
    //       path: 'profile',
    //       name: 'Profile',
    //       component: ProfilePage,
    //     },
    //   ],
    // },

    // { path: '/403', name: 'Forbidden', component: ForbiddenPage },

    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage },
  ],
})

router.beforeEach((to, _from, next) => {
  const token =
    localStorage.getItem('accessToken') || localStorage.getItem('token')
//   const role = localStorage.getItem('role') // 'super_admin' для доступа к структуре

  const isPublic = to.path === '/login'

  // Нет токена и страница не публичная → на логин
  if (!token && !isPublic) {
    return next('/login')
  }

  // Есть токен и идём на /login → кидаем на /main
  if (token && to.path === '/login') {
    return next('/main')
  }

//   // Проверка роли super_admin для маршрутов структуры и персонала
//   if (to.meta && to.meta.requiresSuperAdmin && role !== 'super_admin') {
//     return next('/403')
//   }

  return next()
})

export default router
