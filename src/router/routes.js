const routes = [
  // default page redirector
  {
    path: '/',
    name: 'app',
    redirect: '/dashboard',
  },

  // dashboard
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresActiveMembership: true,
      navGroup: 'dashboard',
      navIcon: 'mdi-view-dashboard',
      navTitle: 'Dashboard',
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardOverviewPage.vue'),
      },
    ],
  },

  // inbox
  {
    path: '/inbox',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresActiveMembership: true,
      navGroup: 'inbox',
      navIcon: 'mdi-inbox',
      navTitle: 'Inbox',
    },
    children: [
      {
        path: '',
        name: 'inbox',
        component: () => import('pages/InboxPage.vue'),
        children: [
          {
            path: '',
            name: 'inbox-overview',
            component: () => import('pages/InboxOverviewPage.vue'),
          },
          {
            path: 'new',
            name: 'inbox-new',
            props: r => ({ type: r.query.type, subject: r.query.subject }),
            component: () => import('pages/ConversationNewPage.vue'),
          },
          {
            path: ':id',
            name: 'inbox-conversation',
            props: r => ({ id: r.params.id }),
            component: () => import('pages/ConversationPage.vue'),
          },
        ],
      },
    ],
  },

  // clients
  {
    path: '/clients',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresActiveMembership: true,
      navGroup: 'clients',
      navIcon: 'mdi-account-box',
      navTitle: 'Clients',
    },
    children: [
      {
        path: '',
        name: 'clients-list',
        component: () => import('pages/ClientsListPage.vue'),
      },
      {
        path: ':id',
        name: 'client-details',
        props: true,
        component: () => import('pages/ClientDetailsPage.vue'),
      },
    ],
  },

  // settings
  {
    path: '/settings',
    component: () => import('layouts/DashboardLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresActiveMembership: true,
      navGroup: 'settings',
      navIcon: 'mdi-cog',
      navTitle: 'Settings',
      hNavParent: true,
      hNavTitle: 'PRM Settings',
      hNavSubtitle: 'Manage your PRM',
    },
    children: [
      {
        path: '',
        name: 'settings',
        redirect: '/settings/sms',
      },
      {
        path: 'sms',
        name: 'settings-sms',
        component: () => import('pages/SettingsSMS.vue'),
        meta: {
          hNavTitle: 'SMS Configuration',
        },
      },
      {
        path: 'email',
        name: 'settings-email',
        component: () => import('pages/SettingsEmail.vue'),
        meta: {
          hNavTitle: 'Email Configuration',
        },
      },
      {
        path: 'templates',
        name: 'settings-templates',
        component: () => import('pages/SettingsTemplates.vue'),
        meta: {
          hNavTitle: 'Message Templates',
        },
      },
      {
        path: 'groups',
        name: 'settings-groups',
        component: () => import('pages/SettingsGroups.vue'),
        meta: {
          hNavTitle: 'Groups',
        },
      },
      {
        path: 'workflows',
        name: 'settings-workflows',
        component: () => import('pages/SettingsWorkflows.vue'),
        meta: {
          hNavTitle: 'Workflows',
        },
      },
    ],
  },

  // utility pages
  {
    path: '/signin',
    meta: { requiresUnauth: true },
    component: () => import('layouts/PlainLayout.vue'),
    children: [{
      path: '',
      name: 'signin',
      props: r => ({ next: r.query.next }),
      component: () => import('pages/SigninPage.vue'),
    }],
  },
  {
    path: '/signout',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{
      path: '',
      name: 'signout',
      component: () => import('pages/SignoutPage.vue'),
    }],
  },
  {
    path: '/forbidden',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{
      path: '',
      name: 'forbidden',
      props: r => ({ reason: r.query.reason }),
      component: () => import('pages/ForbiddenPage.vue'),
    }],
  },
  {
    path: '/generic-error',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{
      path: '',
      name: 'generic-error',
      props: r => ({ reason: r.query.reason }),
      component: () => import('pages/GenericError.vue'),
    }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/NotFoundPage.vue'),
    }],
  },
];

export default routes;
