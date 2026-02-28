import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true, title: 'AI Agent' }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/skills'
      },
      {
        path: 'skills',
        name: 'AdminSkills',
        component: () => import('@/views/admin/AdminSkills.vue'),
        meta: { title: 'Skill 管理' }
      },
      {
        path: 'skills/:id',
        name: 'AdminSkillDetail',
        component: () => import('@/views/admin/SkillDetail.vue'),
        meta: { title: 'Skill 详情' }
      },
      {
        path: 'simple-skills',
        name: 'AdminSimpleSkills',
        component: () => import('@/views/admin/SimpleSkills.vue'),
        meta: { title: 'Skill 快速上传' }
      },
      {
        path: 'mcp',
        name: 'AdminMcp',
        component: () => import('@/views/admin/AdminMcp.vue'),
        meta: { title: 'MCP 配置' }
      },
      {
        path: 'agents',
        name: 'AdminAgents',
        component: () => import('@/views/admin/AdminAgents.vue'),
        meta: { title: '代理配置' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI Agent Platform`
  }

  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Chat' })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Chat' })
  } else {
    next()
  }
})

export default router
