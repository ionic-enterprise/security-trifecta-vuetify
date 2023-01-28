// Composables
import { useSessionVault } from '@/composables/session-vault';
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Start',
        component: () => import(/* webpackChunkName: "home" */ '@/views/StartPage.vue'),
      },
      {
        path: 'home',
        name: 'TastingNotes',
        component: () => import(/* webpackChunkName: "home" */ '@/tasting-notes/TastingNotesPage.vue'),
        meta: { requiresAuth: true },
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
        component: () => import(/* webpackChunkName: "auth" */ '@/auth/LoginPage.vue'),
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
        component: () => import(/* webpackChunkName: "auth" */ '@/auth/LogoutPage.vue'),
      },
    ],
  },
];

const checkAuthStatus = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (to.matched.some((r) => r.meta.requiresAuth)) {
    const { getSession } = useSessionVault();
    const session = await getSession();
    if (!session) {
      return next('/login');
    }
  }
  next();
};

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(checkAuthStatus);

export default router;
