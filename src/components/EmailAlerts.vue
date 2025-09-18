<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2" color="warning">mdi-email-alert</v-icon>
      Email Alerts
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
                  {{ getEmailTypeLabel(email.email_type) }}
                </span>
              </div>

              <div class="text-body-2 font-weight-medium mb-1">
                {{ getGuestName(email.booking_id) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ getBookingDates(email.booking_id) }}
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
import {
  AlertService,
  BookingService,
  GuestService,
  type PendingEmailsResponse,
  type Booking,
  type Guest,
} from "@/services/api";

const router = useRouter();

const loading = ref(false);
const error = ref(false);
const alertsData = ref<PendingEmailsResponse | null>(null);
const bookingDetails = ref<Map<number, Booking>>(new Map());
const guestDetails = ref<Map<number, Guest>>(new Map());

const loadAlerts = async () => {
  loading.value = true;
  error.value = false;

  try {
    alertsData.value = await AlertService.getPendingEmails();

    // Fetch booking details for each pending email
    if (alertsData.value?.emails) {
      await Promise.all(
        alertsData.value.emails.map(async (email) => {
          try {
            const booking = await BookingService.getById(email.booking_id);
            bookingDetails.value.set(email.booking_id, booking);

            // If guest info is not included in booking, fetch it separately
            if (!booking.guest && booking.guest_id) {
              try {
                const guest = await GuestService.getById(booking.guest_id);
                guestDetails.value.set(booking.guest_id, guest);
              } catch (guestErr) {
                console.error(
                  `Failed to load guest ${booking.guest_id}:`,
                  guestErr
                );
              }
            }
          } catch (err) {
            console.error(`Failed to load booking ${email.booking_id}:`, err);
          }
        })
      );
    }
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

const getGuestName = (bookingId: number): string => {
  const booking = bookingDetails.value.get(bookingId);
  if (booking) {
    // First try to get guest info from booking object
    if (booking.guest) {
      return `${booking.guest.first_name} ${booking.guest.last_name}`;
    }

    // If not available, try to get from separate guest details
    if (booking.guest_id) {
      const guest = guestDetails.value.get(booking.guest_id);
      if (guest) {
        return `${guest.first_name} ${guest.last_name}`;
      }
    }
  }
  return "Loading...";
};

const getBookingDates = (bookingId: number): string => {
  const booking = bookingDetails.value.get(bookingId);
  if (booking) {
    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    return `${checkIn} - ${checkOut}`;
  }
  return "Loading...";
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
