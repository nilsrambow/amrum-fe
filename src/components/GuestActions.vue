<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2" color="error">mdi-account-alert</v-icon>
      Outstanding Activities from Guests
    </v-card-title>
    <v-divider></v-divider>

    <!-- Loading state -->
    <div v-if="loading" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2 text-medium-emphasis">Loading guest actions...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="pa-4 text-center">
      <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
      <p class="text-error">Failed to load guest actions</p>
      <v-btn size="small" color="primary" @click="loadActions">
        <v-icon start>mdi-refresh</v-icon>
        Retry
      </v-btn>
    </div>

    <!-- No actions -->
    <div
      v-else-if="!actionsData?.actions?.length"
      class="pa-4 text-center text-medium-emphasis"
    >
      <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
      <p>No outstanding guest actions!</p>
    </div>

    <!-- Action boxes -->
    <v-card-text v-else-if="actionsData">
      <v-row>
        <v-col
          v-for="action in actionsData.actions"
          :key="action.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="action-box cursor-pointer"
            :color="getActionTypeColor(action.action_type)"
            variant="outlined"
            @click="navigateToBooking(action.booking_id)"
            hover
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon
                  :color="getActionTypeColor(action.action_type)"
                  size="20"
                  class="mr-2"
                >
                  {{ getActionTypeIcon(action.action_type) }}
                </v-icon>
                <span class="text-caption font-weight-medium">
                  {{ getActionTypeLabel(action.action_type) }}
                </span>
              </div>

              <div class="text-body-2 font-weight-medium mb-1">
                {{ getGuestName(action.booking_id) }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ getBookingDates(action.booking_id) }}
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
  type OutstandingGuestActionsResponse,
  type Booking,
  type Guest,
} from "@/services/api";

const router = useRouter();

const loading = ref(false);
const error = ref(false);
const actionsData = ref<OutstandingGuestActionsResponse | null>(null);
const bookingDetails = ref<Map<number, Booking>>(new Map());
const guestDetails = ref<Map<number, Guest>>(new Map());

const loadActions = async () => {
  loading.value = true;
  error.value = false;

  try {
    actionsData.value = await AlertService.getOutstandingGuestActions();

    // Fetch booking details for each outstanding action
    if (actionsData.value?.actions) {
      await Promise.all(
        actionsData.value.actions.map(async (action) => {
          try {
            const booking = await BookingService.getById(action.booking_id);
            bookingDetails.value.set(action.booking_id, booking);

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
            console.error(`Failed to load booking ${action.booking_id}:`, err);
          }
        })
      );
    }
  } catch (err) {
    console.error("Failed to load guest actions:", err);
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

const getActionTypeLabel = (actionType: string): string => {
  const labels: Record<string, string> = {
    payment_required: "Payment Required",
    registration_incomplete: "Registration Incomplete",
    confirmation_pending: "Confirmation Pending",
    document_missing: "Document Missing",
    feedback_requested: "Feedback Requested",
  };
  return labels[actionType] || actionType;
};

const getActionTypeIcon = (actionType: string): string => {
  const icons: Record<string, string> = {
    payment_required: "mdi-cash-multiple",
    registration_incomplete: "mdi-account-edit",
    confirmation_pending: "mdi-calendar-clock",
    document_missing: "mdi-file-document-outline",
    feedback_requested: "mdi-message-text",
  };
  return icons[actionType] || "mdi-account-alert";
};

const getActionTypeColor = (actionType: string): string => {
  const colors: Record<string, string> = {
    payment_required: "error",
    registration_incomplete: "warning",
    confirmation_pending: "info",
    document_missing: "orange",
    feedback_requested: "purple",
  };
  return colors[actionType] || "grey";
};

onMounted(() => {
  loadActions();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.action-box {
  transition: all 0.2s ease-in-out;
  min-height: 100px;
  position: relative;
}

.action-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.action-box .v-card-text {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
