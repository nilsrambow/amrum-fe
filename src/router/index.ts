import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/guests",
    name: "guests",
    component: () =>
      import(/* webpackChunkName: "guests" */ "../views/GuestsView.vue"),
  },
  {
    path: "/guests/add",
    name: "add-guest",
    component: () =>
      import(/* webpackChunkName: "guest-form" */ "../views/GuestFormView.vue"),
  },
  {
    path: "/guests/:id",
    name: "guest-detail",
    component: () =>
      import(
        /* webpackChunkName: "guest-detail" */ "../views/GuestDetailView.vue"
      ),
    props: true,
  },
  {
    path: "/guests/:id/edit",
    name: "edit-guest",
    component: () =>
      import(/* webpackChunkName: "guest-form" */ "../views/GuestFormView.vue"),
    props: true,
  },
  {
    path: "/bookings",
    name: "bookings",
    component: () =>
      import(/* webpackChunkName: "bookings" */ "../views/BookingsView.vue"),
  },
  {
    path: "/bookings/add",
    name: "add-booking",
    component: () =>
      import(
        /* webpackChunkName: "booking-form" */ "../views/BookingFormView.vue"
      ),
  },
  {
    path: "/bookings/:id",
    name: "booking-detail",
    component: () =>
      import(
        /* webpackChunkName: "booking-detail" */ "../views/BookingDetailView.vue"
      ),
    props: true,
  },
  {
    path: "/bookings/:id/edit",
    name: "edit-booking",
    component: () =>
      import(
        /* webpackChunkName: "booking-form" */ "../views/BookingFormView.vue"
      ),
    props: true,
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

export default router;
