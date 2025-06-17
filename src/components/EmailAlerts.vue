<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2" color="warning">mdi-email-alert</v-icon>
      Email Alerts
      <v-spacer></v-spacer>
      <v-chip
        v-if="alertsData && alertsData.total_count > 0"
        color="warning"
        variant="elevated"
        size="small"
      >
        {{ alertsData.total_count }}
      </v-chip>
    </v-card-title>
    <v-divider></v-divider>

    <!-- Loading state -->
    <div v-if="loading" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2 text-medium-emphasis">Loading alerts...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4 text-center">
      <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
      <p class="text-error">Failed to load email alerts</p>
      <v-btn size="small" color="primary" @click="loadAlerts">
        <v-icon start>mdi-refresh</v-icon>
        Retry
      </v-btn>
    </div>

    <!-- No alerts -->
    <div
      v-else-if="!alertsData?.emails?.length"
      class="pa-4 text-center text-medium-emphasis"
    >
      <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
      <p>All emails are up to date!</p>
    </div>

    <!-- Alert boxes -->
    <v-card-text v-else-if="alertsData">
      <v-row>
        <v-col
          v-for="email in alertsData.emails"
          :key="email.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="alert-box cursor-pointer"
            :color="getEmailTypeColor(email.email_type)"
            variant="outlined"
            @click="navigateToBooking(email.booking_id)"
            hover
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon
                  :color="getEmailTypeColor(email.email_type)"
                  size="20"
                  class="mr-2"
                >
                  {{ getEmailTypeIcon(email.email_type) }}
                </v-icon>
                <span class="text-caption font-weight-medium">
                  Booking #{{ email.booking_id }}
                </span>
              </div>

              <div class="text-body-2 font-weight-medium mb-1">
                {{ getEmailTypeLabel(email.email_type) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                Click to view booking
              </div>

              <v-icon
                size="16"
                class="position-absolute"
                style="top: 8px; right: 8px"
                color="medium-emphasis"
              >
                mdi-chevron-right
              </v-icon>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AlertService, type PendingEmailsResponse } from "@/services/api";

const router = useRouter();

const loading = ref(false);
const error = ref(false);
const alertsData = ref<PendingEmailsResponse | null>(null);

const loadAlerts = async () => {
  loading.value = true;
  error.value = false;

  try {
    alertsData.value = await AlertService.getPendingEmails();
  } catch (err) {
    console.error("Failed to load email alerts:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const navigateToBooking = (bookingId: number) => {
  router.push({ name: "booking-detail", params: { id: bookingId } });
};

const getEmailTypeLabel = (emailType: string): string => {
  const labels: Record<string, string> = {
    booking_confirmation: "Booking Confirmation",
    kurkarten_request: "Kurkarten Request",
    pre_arrival_info: "Pre-arrival Information",
    invoice_generation: "Invoice Generation",
    missing_readings_reminder: "Missing Readings Reminder",
  };
  return labels[emailType] || emailType;
};

const getEmailTypeIcon = (emailType: string): string => {
  const icons: Record<string, string> = {
    booking_confirmation: "mdi-calendar-check",
    kurkarten_request: "mdi-card-account-details",
    pre_arrival_info: "mdi-information",
    invoice_generation: "mdi-file-document",
    missing_readings_reminder: "mdi-gauge-empty",
  };
  return icons[emailType] || "mdi-email";
};

const getEmailTypeColor = (emailType: string): string => {
  const colors: Record<string, string> = {
    booking_confirmation: "primary",
    kurkarten_request: "info",
    pre_arrival_info: "warning",
    invoice_generation: "success",
    missing_readings_reminder: "error",
  };
  return colors[emailType] || "grey";
};

onMounted(() => {
  loadAlerts();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.alert-box {
  transition: all 0.2s ease-in-out;
  min-height: 100px;
  position: relative;
}

.alert-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.alert-box .v-card-text {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
