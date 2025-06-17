<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2" color="error">mdi-account-alert</v-icon>
      Outstanding Guest Actions
      <v-spacer></v-spacer>
      <v-chip
        v-if="actionsData && actionsData.total_count > 0"
        color="error"
        variant="elevated"
        size="small"
      >
        {{ actionsData.total_count }}
      </v-chip>
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
                  Booking #{{ action.booking_id }}
                </span>
              </div>

              <div class="text-body-2 font-weight-medium mb-1">
                {{ getActionTypeLabel(action.action_type) }}
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
import {
  AlertService,
  type OutstandingGuestActionsResponse,
} from "@/services/api";

const router = useRouter();

const loading = ref(false);
const error = ref(false);
const actionsData = ref<OutstandingGuestActionsResponse | null>(null);

const loadActions = async () => {
  loading.value = true;
  error.value = false;

  try {
    actionsData.value = await AlertService.getOutstandingGuestActions();
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
