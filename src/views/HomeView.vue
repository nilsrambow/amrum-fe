<template>
  <div>
    <!-- Welcome Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4 font-weight-light">
          Welcome to Amrum Property Management
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Your vacation rental management dashboard
        </p>
      </v-col>
    </v-row>

    <!-- Key Metrics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="primary" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-calendar-check</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">12</div>
              <div class="text-subtitle-2">Active Bookings</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-cash-multiple</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">€4,250</div>
              <div class="text-subtitle-2">Monthly Revenue</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-account-group</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">28</div>
              <div class="text-subtitle-2">Registered Guests</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" color="info" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-gauge</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">85%</div>
              <div class="text-subtitle-2">Occupancy Rate</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Email Alerts -->
    <v-row class="mb-6">
      <v-col cols="12">
        <EmailAlerts />
      </v-col>
    </v-row>

    <!-- Outstanding Guest Actions -->
    <v-row class="mb-6">
      <v-col cols="12">
        <GuestActions />
      </v-col>
    </v-row>

    <!-- Availability Calendar -->
    <v-row class="mb-6">
      <v-col cols="12">
        <AvailabilityCalendar />
      </v-col>
    </v-row>

    <!-- Recent Activities and Quick Actions -->
    <v-row>
      <v-col cols="12" md="8"> </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-btn
              block
              color="primary"
              class="mb-3"
              prepend-icon="mdi-plus"
              @click="newBooking"
            >
              New Booking
            </v-btn>

            <v-btn
              block
              color="success"
              class="mb-3"
              prepend-icon="mdi-account-plus"
              @click="addGuest"
            >
              Add Guest
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import EmailAlerts from "@/components/EmailAlerts.vue";
import GuestActions from "@/components/GuestActions.vue";
import AvailabilityCalendar from "@/components/AvailabilityCalendar.vue";

const router = useRouter();

// Quick action methods
const newBooking = () => {
  router.push("/bookings/add");
};

const addGuest = () => {
  router.push("/guests/add");
};
</script>
