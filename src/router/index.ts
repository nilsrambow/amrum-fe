import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuth } from "../composables/useAuth";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/LoginView.vue"),
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/guests",
    name: "guests",
    component: () =>
      import(/* webpackChunkName: "guests" */ "../views/GuestsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/guests/add",
    name: "add-guest",
    component: () =>
      import(/* webpackChunkName: "guest-form" */ "../views/GuestFormView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/guests/:id",
    name: "guest-detail",
    component: () =>
      import(
        /* webpackChunkName: "guest-detail" */ "../views/GuestDetailView.vue"
      ),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/guests/:id/edit",
    name: "edit-guest",
    component: () =>
      import(/* webpackChunkName: "guest-form" */ "../views/GuestFormView.vue"),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings",
    name: "bookings",
    component: () =>
      import(/* webpackChunkName: "bookings" */ "../views/BookingsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings/add",
    name: "add-booking",
    component: () =>
      import(
        /* webpackChunkName: "booking-form" */ "../views/BookingFormView.vue"
      ),
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings/:id",
    name: "booking-detail",
    component: () =>
      import(
        /* webpackChunkName: "booking-detail" */ "../views/BookingDetailView.vue"
      ),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/bookings/:id/edit",
    name: "edit-booking",
    component: () =>
      import(
        /* webpackChunkName: "booking-form" */ "../views/BookingFormView.vue"
      ),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/guest/booking/:token",
    name: "guest-booking",
    component: () =>
      import(
        /* webpackChunkName: "guest-booking" */ "../views/GuestBookingView.vue"
      ),
    props: true,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Authentication guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const { checkAuth } = useAuth();
  const isAuthenticated = checkAuth();

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.name === 'login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
