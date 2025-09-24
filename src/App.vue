<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      :rail="rail"
      @click="rail = false"
      v-if="!isGuestRoute && isAuthenticated"
    >
      <v-list-item
        prepend-avatar="https://via.placeholder.com/40"
        title="Amrum Property"
        subtitle="Management System"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard"
          to="/"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-calendar-check"
          title="Bookings"
          value="bookings"
          to="/bookings"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-group"
          title="Guests"
          value="guests"
          to="/guests"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cash-multiple"
          title="Payments"
          value="payments"
          to="/payments"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-gauge"
          title="Meter Readings"
          value="meters"
          to="/meters"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-file-document"
          title="Invoices"
          value="invoices"
          to="/invoices"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          value="settings"
          to="/settings"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app v-if="!isGuestRoute && isAuthenticated">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>
        <v-icon icon="mdi-home-variant" class="me-2"></v-icon>
        Amrum Property Management
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-avatar size="32">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "./composables/useAuth";

const drawer = ref(true);
const rail = ref(false);

const route = useRoute();
const router = useRouter();
const { isAuthenticated, logout } = useAuth();

// Check if current route is a guest route
const isGuestRoute = computed(() => {
  return route.name === "guest-booking";
});

// Handle logout
const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<style>
.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12) !important;
}
</style>
