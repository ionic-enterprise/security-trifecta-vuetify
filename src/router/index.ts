// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'TastingNotes',
        component: () => import(/* webpackChunkName: "home" */ '@/views/TastingNotesPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/layouts/stand-alone/StandAlone.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */ '@/views/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/logout',
    component: () => import('@/layouts/stand-alone/StandAlone.vue'),
    children: [
      {
        path: '',
        name: 'Logout',
        component: () => import(/* webpackChunkName: "login" */ '@/views/LogoutPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
