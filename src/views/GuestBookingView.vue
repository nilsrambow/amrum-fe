<template>
  <div>
    <!-- Simple Header for Guest View -->
    <div
      class="guest-header pa-4 bg-primary text-white"
      v-if="!loading && !error"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon size="32" class="mr-3">mdi-home-variant</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">Amrum Property</div>
            <div class="text-caption">Guest Portal</div>
          </div>
        </div>
        <v-btn
          variant="text"
          color="white"
          prepend-icon="mdi-arrow-left"
          @click="$router.push('/')"
        >
          Back to Home
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div class="mt-4 text-h6">Loading your booking...</div>
    </div>

    <div v-else-if="error" class="text-center pa-8">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h5 mb-2">Booking Not Found</div>
      <div class="text-body-1 mb-4">
        {{
          errorMessage ||
          "The booking link you're trying to access is invalid or has expired."
        }}
      </div>
      <v-btn color="primary" @click="$router.push('/')"> Return to Home </v-btn>
    </div>

    <div v-else-if="booking" class="max-width-800 mx-auto pa-4">
      <!-- Header -->
      <v-card class="mb-6">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-home</v-icon>
          <div>
            <div class="text-h5">Your Booking Details</div>
            <div class="text-subtitle-1 text-medium-emphasis">
              {{ formatDate(booking.check_in) }} -
              {{ formatDate(booking.check_out) }}
            </div>
          </div>
        </v-card-title>
      </v-card>

      <!-- Booking Information -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-calendar</v-icon>
          Booking Information
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Check-in</div>
              <div class="text-h6">{{ formatDate(booking.check_in) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Check-out</div>
              <div class="text-h6">{{ formatDate(booking.check_out) }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">
                Number of Nights
              </div>
              <div class="text-h6">{{ nightsCount }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Status</div>
              <v-chip :color="getStatusColor(booking.status)" size="small">
                {{ getStatusText(booking.status) }}
              </v-chip>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div>
            <div class="text-subtitle-2 text-medium-emphasis mb-2">
              Guest Information
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">Name</div>
                <div class="text-body-1">{{ booking.guest_name }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">Email</div>
                <div class="text-body-1">{{ booking.guest_email }}</div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" v-if="booking.kurtaxe_amount"></v-divider>

          <div v-if="booking.kurtaxe_amount">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">
              Tourist Tax
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">Amount</div>
                <div class="text-body-1">
                  {{ formatCurrency(booking.kurtaxe_amount) }}
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="booking.kurtaxe_notes">
                <div class="text-subtitle-2 text-medium-emphasis">Notes</div>
                <div class="text-body-1">{{ booking.kurtaxe_notes }}</div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Trash Service Information -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-delete</v-icon>
          Trash Service Information
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-subtitle-2 mb-2">Important Information</div>
            <div class="text-body-2">
              Trash collection takes place every Tuesday morning. Please ensure
              all trash is properly sorted and placed in the designated
              containers by Monday evening.
            </div>
          </v-alert>

          <div class="text-body-1">
            <strong>Trash Sorting:</strong>
            <ul class="mt-2">
              <li>
                <strong>General Waste:</strong> Black bin - non-recyclable items
              </li>
              <li>
                <strong>Paper & Cardboard:</strong> Blue bin - newspapers,
                magazines, cardboard boxes
              </li>
              <li>
                <strong>Plastic & Metal:</strong> Yellow bin - plastic bottles,
                cans, metal packaging
              </li>
              <li>
                <strong>Organic Waste:</strong> Green bin - food scraps, garden
                waste
              </li>
            </ul>
          </div>
        </v-card-text>
      </v-card>

      <!-- Meter Readings -->
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-counter</v-icon>
          Meter Readings
          <v-chip
            v-if="booking.meter_readings"
            color="success"
            size="small"
            class="ml-2"
          >
            Submitted
          </v-chip>
        </v-card-title>
        <v-card-text>
          <div v-if="booking.meter_readings" class="text-center pa-4">
            <v-icon color="success" size="48" class="mb-3"
              >mdi-check-circle</v-icon
            >
            <div class="text-h6 mb-2">Readings Already Submitted</div>
            <div class="text-body-2 text-medium-emphasis">
              Your meter readings have been successfully submitted. Thank you!
            </div>

            <!-- Show submitted readings -->
            <v-card variant="outlined" class="mt-4">
              <v-card-title class="text-h6">Submitted Readings</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Electricity
                    </div>
                    <div class="text-body-1">
                      Start:
                      {{ booking.meter_readings.electricity_start || "N/A" }}
                      kWh<br />
                      End:
                      {{ booking.meter_readings.electricity_end || "N/A" }} kWh
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">Gas</div>
                    <div class="text-body-1">
                      Start:
                      {{ booking.meter_readings.gas_start || "N/A" }} m³<br />
                      End: {{ booking.meter_readings.gas_end || "N/A" }} m³
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Firewood
                    </div>
                    <div class="text-body-1">
                      {{ booking.meter_readings.firewood_boxes || 0 }} boxes
                      used
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>

          <div v-else>
            <v-alert type="warning" variant="tonal" class="mb-4">
              <div class="text-subtitle-2 mb-2">Important Notice</div>
              <div class="text-body-2">
                Please submit your meter readings after your departure. You can
                only submit readings once, so please ensure all values are
                correct before submitting.
              </div>
            </v-alert>

            <v-form ref="readingsForm" v-model="readingsFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.electricity_start"
                    label="Electricity Start Reading"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-lightning-bolt"
                    suffix="kWh"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.electricity_end"
                    label="Electricity End Reading"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-lightning-bolt"
                    suffix="kWh"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.gas_start"
                    label="Gas Start Reading"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-fire"
                    suffix="m³"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.gas_end"
                    label="Gas End Reading"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-fire"
                    suffix="m³"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.firewood_boxes"
                    label="Firewood Consumption"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-wood"
                    suffix="boxes"
                    :rules="numberRules"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>

            <v-card-actions class="pa-0 pt-4">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                :loading="submittingReadings"
                :disabled="!readingsFormValid"
                @click="submitReadings"
              >
                Submit Readings
              </v-btn>
            </v-card-actions>
          </div>
        </v-card-text>
      </v-card>

      <!-- Payments Section (if any) -->
      <v-card
        v-if="booking.payments && booking.payments.length > 0"
        class="mt-6"
      >
        <v-card-title>
          <v-icon class="mr-2">mdi-credit-card</v-icon>
          Payment History
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="payment in booking.payments" :key="payment.id">
              <template #prepend>
                <v-icon color="success">mdi-check-circle</v-icon>
              </template>
              <v-list-item-title>
                {{ formatCurrency(payment.amount) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(payment.payment_date) }} -
                {{ payment.payment_method || "Unknown method" }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip size="small" color="success">Paid</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>

    <!-- Simple Footer for Guest View -->
    <div
      class="guest-footer pa-4 bg-grey-lighten-4 text-center"
      v-if="!loading && !error"
    >
      <div class="text-caption text-medium-emphasis">
        © 2024 Amrum Property Management. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { BookingService, type GuestBookingResponse } from "@/services/api";

const route = useRoute();
const token = computed(() => route.params.token as string);

// Reactive data
const booking = ref<GuestBookingResponse | null>(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref("");
const submittingReadings = ref(false);
const readingsFormValid = ref(false);
const readingsForm = ref();

const readingsData = ref({
  electricity_start: undefined as number | undefined,
  electricity_end: undefined as number | undefined,
  gas_start: undefined as number | undefined,
  gas_end: undefined as number | undefined,
  firewood_boxes: undefined as number | undefined,
});

// Validation rules
const numberRules = [
  (v: any) => (v !== undefined && v !== null) || "Reading is required",
  (v: any) =>
    v === undefined || v === null || v >= 0 || "Reading must be positive",
  (v: any) =>
    v === undefined ||
    v === null ||
    !isNaN(v) ||
    "Reading must be a valid number",
];

// Computed properties
const nightsCount = computed(() => {
  if (!booking.value) return 0;
  const start = new Date(booking.value.check_in);
  const end = new Date(booking.value.check_out);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Methods
const loadBooking = async () => {
  loading.value = true;
  error.value = false;
  errorMessage.value = "";

  try {
    booking.value = await BookingService.getGuestBookingByToken(token.value);
  } catch (err: any) {
    console.error("Error loading booking:", err);
    error.value = true;
    errorMessage.value =
      err.response?.data?.message || "Booking not found or link has expired.";
  } finally {
    loading.value = false;
  }
};

const submitReadings = async () => {
  if (!readingsFormValid.value || !booking.value) return;

  submittingReadings.value = true;
  try {
    await BookingService.submitGuestReadings(token.value, readingsData.value);

    // Reload the booking to get updated data
    await loadBooking();

    // Show success message
    alert("Readings submitted successfully!");
  } catch (err: any) {
    console.error("Error submitting readings:", err);
    alert(
      err.response?.data?.message ||
        "Error submitting readings. Please try again."
    );
  } finally {
    submittingReadings.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    new: "New",
    confirmed: "Confirmed",
    kurkarten_requested: "Kurkarten Requested",
    ready_for_arrival: "Ready for Arrival",
    arriving: "Arriving",
    on_site: "On Site",
    departing: "Departing",
    departed_readings_due: "Readings Due",
    departed_invoice_due: "Invoice Due",
    departed_payment_due: "Payment Due",
    departed_done: "Completed",
  };
  return statusMap[status] || "Unknown";
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    new: "warning",
    confirmed: "primary",
    kurkarten_requested: "info",
    ready_for_arrival: "success",
    arriving: "purple",
    on_site: "green",
    departing: "orange",
    departed_readings_due: "error",
    departed_invoice_due: "purple",
    departed_payment_due: "deep-orange",
    departed_done: "success",
  };
  return colorMap[status] || "grey";
};

// Lifecycle
onMounted(() => {
  loadBooking();
});
</script>

<style scoped>
.max-width-800 {
  max-width: 800px;
}

.guest-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.guest-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}
</style>
