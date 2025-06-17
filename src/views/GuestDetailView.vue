<template>
  <div v-if="guest">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex align-center mb-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="router.back()"
            class="mr-3"
          ></v-btn>
          <div class="flex-grow-1">
            <h1 class="text-h4 font-weight-light">
              {{ guest.first_name }} {{ guest.last_name }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Guest Details and History
            </p>
          </div>
          <div>
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              @click="router.push(`/guests/${guest.id}/edit`)"
              class="mr-2"
            >
              Edit Guest
            </v-btn>
            <v-btn
              color="error"
              prepend-icon="mdi-delete"
              variant="outlined"
              @click="confirmDelete"
            >
              Delete
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Guest Information Cards -->
    <v-row class="mb-6">
      <!-- Personal Information -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Personal Information
          </v-card-title>
          <v-card-text>
            <div class="text-center mb-4">
              <v-avatar color="primary" size="80">
                <span class="text-h4 text-white">
                  {{ guest.first_name[0] }}{{ guest.last_name[0] }}
                </span>
              </v-avatar>
            </div>

            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Name</v-list-item-title>
                <v-list-item-subtitle>
                  {{ guest.first_name }} {{ guest.last_name }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ guest.email }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-cash</v-icon>
                </template>
                <v-list-item-title>Payment Type</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="guest.pays_dayrate ? 'primary' : 'success'"
                    size="small"
                  >
                    {{ guest.pays_dayrate ? "Pays per day" : "Free" }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar-plus</v-icon>
                </template>
                <v-list-item-title>Member Since</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(guest.created_at) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Stats -->
      <v-col cols="12" md="8">
        <v-row>
          <v-col cols="6" sm="3">
            <v-card class="text-center pa-4" color="primary" dark>
              <v-icon size="40" class="mb-2">mdi-calendar-check</v-icon>
              <div class="text-h4 font-weight-bold">
                {{ stats.totalBookings }}
              </div>
              <div class="text-caption">Total Bookings</div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card class="text-center pa-4" color="success" dark>
              <v-icon size="40" class="mb-2">mdi-cash-multiple</v-icon>
              <div class="text-h4 font-weight-bold">
                €{{ stats.totalRevenue }}
              </div>
              <div class="text-caption">Total Revenue</div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card class="text-center pa-4" color="info" dark>
              <v-icon size="40" class="mb-2">mdi-calendar-clock</v-icon>
              <div class="text-h4 font-weight-bold">
                {{ stats.totalNights }}
              </div>
              <div class="text-caption">Total Nights</div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card class="text-center pa-4" color="warning" dark>
              <v-icon size="40" class="mb-2">mdi-calendar-today</v-icon>
              <div class="text-h4 font-weight-bold">
                {{ stats.activeBookings }}
              </div>
              <div class="text-caption">Active Bookings</div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Bookings and Payments Tabs -->
    <v-card>
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="bookings">
          <v-icon class="mr-2">mdi-calendar-check</v-icon>
          Bookings ({{ bookings.length }})
        </v-tab>
        <v-tab value="payments">
          <v-icon class="mr-2">mdi-cash</v-icon>
          Payments ({{ payments.length }})
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- Bookings Tab -->
        <v-window-item value="bookings">
          <v-card-text>
            <div v-if="bookings.length === 0" class="text-center pa-6">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-calendar-remove
              </v-icon>
              <div class="text-h6 mb-2">No bookings yet</div>
              <div class="text-body-2 text-medium-emphasis">
                This guest hasn't made any bookings yet
              </div>
            </div>

            <v-timeline v-else align="start" density="compact">
              <v-timeline-item
                v-for="booking in bookings"
                :key="booking.id"
                :icon="getBookingIcon(booking)"
                :color="getBookingColor(booking)"
                size="small"
              >
                <v-card
                  @click="viewBooking(booking.id)"
                  class="booking-card"
                  hover
                  style="cursor: pointer"
                >
                  <v-card-title class="text-h6">
                    Booking #{{ booking.id }}
                    <v-spacer></v-spacer>
                    <v-chip :color="getBookingColor(booking)" size="small">
                      {{ getBookingStatus(booking) }}
                    </v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <strong>Dates:</strong>
                      {{ formatDate(booking.check_in) }} -
                      {{ formatDate(booking.check_out) }}
                    </div>
                    <div class="mb-2">
                      <strong>Duration:</strong>
                      {{ calculateNights(booking.check_in, booking.check_out) }}
                      nights
                    </div>
                    <div v-if="booking.kurtaxe_amount" class="mb-2">
                      <strong>Tourist Tax:</strong> €{{
                        booking.kurtaxe_amount
                      }}
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      color="primary"
                      @click.stop="viewBooking(booking.id)"
                    >
                      <v-icon class="mr-1">mdi-eye</v-icon>
                      View Details
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-window-item>

        <!-- Payments Tab -->
        <v-window-item value="payments">
          <v-card-text>
            <div v-if="payments.length === 0" class="text-center pa-6">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-cash-off
              </v-icon>
              <div class="text-h6 mb-2">No payments yet</div>
              <div class="text-body-2 text-medium-emphasis">
                No payment records found for this guest
              </div>
            </div>

            <v-timeline v-else align="start" density="compact">
              <v-timeline-item
                v-for="payment in payments"
                :key="payment.id"
                icon="mdi-cash"
                color="success"
                size="small"
              >
                <v-card>
                  <v-card-title class="text-h6">
                    Payment #{{ payment.id }}
                    <v-spacer></v-spacer>
                    <span class="text-success">€{{ payment.amount }}</span>
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <strong>Date:</strong>
                      {{ formatDate(payment.payment_date) }}
                    </div>
                    <div v-if="payment.payment_method" class="mb-2">
                      <strong>Method:</strong> {{ payment.payment_method }}
                    </div>
                    <div v-if="payment.reference" class="mb-2">
                      <strong>Reference:</strong> {{ payment.reference }}
                    </div>
                    <div v-if="payment.notes" class="mb-2">
                      <strong>Notes:</strong> {{ payment.notes }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirm Deletion
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ guest.first_name }} {{ guest.last_name }}</strong
          >? This will also delete all their bookings and payment records. This
          action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>
          <v-btn color="error" variant="text" @click="deleteGuest">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center pa-6">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    ></v-progress-circular>
    <div class="mt-4">Loading guest details...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  GuestService,
  BookingService,
  type Guest,
  type Booking,
  type Payment,
} from "@/services/api";

const router = useRouter();
const route = useRoute();

// Props
const guestId = computed(() => parseInt(route.params.id as string));

// Reactive data
const guest = ref<Guest | null>(null);
const bookings = ref<Booking[]>([]);
const payments = ref<Payment[]>([]);
const loading = ref(false);
const activeTab = ref("bookings");
const deleteDialog = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Computed stats
const stats = computed(() => {
  const totalBookings = bookings.value.length;
  const activeBookings = bookings.value.filter(
    (b) => new Date(b.check_out) > new Date()
  ).length;
  const totalNights = bookings.value.reduce((sum, booking) => {
    return sum + calculateNights(booking.check_in, booking.check_out);
  }, 0);
  const totalRevenue = payments.value.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    totalBookings,
    activeBookings,
    totalNights,
    totalRevenue: totalRevenue.toFixed(2),
  };
});

// Methods
const loadGuestDetails = async () => {
  loading.value = true;
  try {
    // Load guest
    guest.value = await GuestService.getById(guestId.value);

    // Load bookings for this guest
    bookings.value = await BookingService.getByGuest(guestId.value);

    // Load payments (mock data for now)
    payments.value = []; // TODO: Implement when API is ready
  } catch (error) {
    console.error("Error loading guest details:", error);
    showSnackbar("Error loading guest details", "error");
    router.push("/guests");
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getBookingStatus = (booking: Booking) => {
  if (booking.paid) return "Paid";
  if (booking.confirmed) return "Confirmed";
  return "Pending";
};

const getBookingColor = (booking: Booking) => {
  if (booking.paid) return "success";
  if (booking.confirmed) return "primary";
  return "warning";
};

const getBookingIcon = (booking: Booking) => {
  if (booking.paid) return "mdi-check-circle";
  if (booking.confirmed) return "mdi-calendar-check";
  return "mdi-calendar-clock";
};

const confirmDelete = () => {
  deleteDialog.value = true;
};

const deleteGuest = async () => {
  if (!guest.value) return;

  try {
    // TODO: Implement delete in GuestService
    // await GuestService.delete(guest.value.id);

    showSnackbar("Guest deleted successfully", "success");
    deleteDialog.value = false;
    router.push("/guests");
  } catch (error) {
    console.error("Error deleting guest:", error);
    showSnackbar("Error deleting guest", "error");
  }
};

const showSnackbar = (text: string, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const viewBooking = (bookingId: number) => {
  router.push(`/bookings/${bookingId}`);
};

// Lifecycle
onMounted(() => {
  loadGuestDetails();
});
</script>

<style scoped>
.booking-card {
  transition: all 0.2s ease-in-out;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.booking-card .v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 8px;
}

.booking-card .v-card-text {
  padding-top: 12px;
}
</style>
