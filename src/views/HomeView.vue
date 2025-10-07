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
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" color="primary" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-calendar-check</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">
                {{ statsLoading ? '...' : statsData?.total_bookings || 0 }}
              </div>
              <div class="text-subtitle-2">Bookings This Year</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" color="success" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-cash-multiple</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">
                {{ statsLoading ? '...' : formatCurrency(statsData?.total_invoice_amount || 0) }}
              </div>
              <div class="text-subtitle-2">Invoice Total This Year</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4" color="warning" dark>
          <div class="d-flex align-center">
            <v-icon size="40" class="mr-4">mdi-bed</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">
                {{ statsLoading ? '...' : statsData?.total_occupied_nights || 0 }}
              </div>
              <div class="text-subtitle-2">Occupied Nights This Year</div>
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import EmailAlerts from "@/components/EmailAlerts.vue";
import GuestActions from "@/components/GuestActions.vue";
import AvailabilityCalendar from "@/components/AvailabilityCalendar.vue";
import { DashboardService, type DashboardStatsResponse } from "@/services/api";

const router = useRouter();

// Dashboard statistics
const statsLoading = ref(false);
const statsData = ref<DashboardStatsResponse | null>(null);

const loadStats = async () => {
  statsLoading.value = true;
  try {
    statsData.value = await DashboardService.getStats();
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  } finally {
    statsLoading.value = false;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Quick action methods
const newBooking = () => {
  router.push("/bookings/add");
};

const addGuest = () => {
  router.push("/guests/add");
};

onMounted(() => {
  loadStats();
});
</script>
