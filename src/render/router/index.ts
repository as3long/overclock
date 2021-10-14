import { createRouter , createWebHashHistory} from 'vue-router'

const routes =  [
  {
    path: '/',
    component: () => import('../components/overclock/Overclock.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: 'nope'
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  // @ts-ignore
  routes,
});

export default router
