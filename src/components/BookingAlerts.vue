<template>
  <div>
    <!-- Email Alerts for this booking -->
    <v-card v-if="emailAlerts.length > 0" class="mb-4">
      <v-card-title>
        <v-icon class="mr-2" color="warning">mdi-email-alert</v-icon>
        Email Alerts for This Booking
        <v-spacer></v-spacer>
        <v-chip color="warning" variant="elevated" size="small">
          {{ emailAlerts.length }}
        </v-chip>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col
            v-for="email in emailAlerts"
            :key="email.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              class="alert-box cursor-pointer"
              :color="getEmailTypeColor(email.email_type)"
              variant="outlined"
              @click="handleEmailAction(email)"
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
                    Email #{{ email.id }}
                  </span>
                </div>

                <div class="text-body-2 font-weight-medium mb-1">
                  {{ getEmailTypeLabel(email.email_type) }}
                </div>

                <div class="text-caption text-medium-emphasis">
                  Click to send
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

    <!-- Guest Actions for this booking -->
    <v-card v-if="guestActions.length > 0">
      <v-card-title>
        <v-icon class="mr-2" color="error">mdi-account-alert</v-icon>
        Guest Actions for This Booking
        <v-spacer></v-spacer>
        <v-chip color="error" variant="elevated" size="small">
          {{ guestActions.length }}
        </v-chip>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col
            v-for="action in guestActions"
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
              @click="handleGuestAction(action)"
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
                    Action #{{ action.id }}
                  </span>
                </div>

                <div class="text-body-2 font-weight-medium mb-1">
                  {{ getActionTypeLabel(action.action_type) }}
                </div>

                <div class="text-caption text-medium-emphasis">
                  Click to resolve
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

    <!-- No alerts message -->
    <v-card
      v-if="emailAlerts.length === 0 && guestActions.length === 0"
      class="text-center pa-4"
    >
      <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
      <p class="text-medium-emphasis">No pending alerts for this booking!</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  AlertService,
  type PendingEmail,
  type OutstandingGuestAction,
} from "@/services/api";

// Props - using a simpler approach
const props = defineProps({
  bookingId: {
    type: Number,
    required: true,
  },
});

// Reactive data
const emailAlerts = ref<PendingEmail[]>([]);
const guestActions = ref<OutstandingGuestAction[]>([]);

// Load alerts for this specific booking
const loadBookingAlerts = async () => {
  try {
    // Load all alerts and filter for this booking
    const [emailsResponse, actionsResponse] = await Promise.all([
      AlertService.getPendingEmails(),
      AlertService.getOutstandingGuestActions(),
    ]);

    // Filter for this specific booking
    emailAlerts.value = emailsResponse.emails.filter(
      (email) => email.booking_id === props.bookingId
    );
    guestActions.value = actionsResponse.actions.filter(
      (action) => action.booking_id === props.bookingId
    );
  } catch (error) {
    console.error("Error loading booking alerts:", error);
  }
};

// Email type methods
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

// Action type methods
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

// Handle email action
const handleEmailAction = (email: PendingEmail) => {
  // Emit event for parent to handle
  // This could trigger sending the email or navigating to email form
  console.log("Handle email action:", email);
};

// Handle guest action
const handleGuestAction = (action: OutstandingGuestAction) => {
  // Emit event for parent to handle
  // This could trigger resolving the action
  console.log("Handle guest action:", action);
};

onMounted(() => {
  loadBookingAlerts();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.alert-box,
.action-box {
  transition: all 0.2s ease-in-out;
  min-height: 100px;
  position: relative;
}

.alert-box:hover,
.action-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.alert-box .v-card-text,
.action-box .v-card-text {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
