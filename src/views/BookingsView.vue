<template>
  <div>
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-light">Booking Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Manage reservations and guest bookings
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-calendar-plus"
            @click="router.push('/bookings/add')"
          >
            Add New Booking
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3">
        <v-card class="text-center pa-4" color="primary" dark>
          <v-icon size="32" class="mb-2">mdi-calendar-check</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.total }}</div>
          <div class="text-caption">Total Bookings</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card class="text-center pa-4" color="success" dark>
          <v-icon size="32" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.confirmed }}</div>
          <div class="text-caption">Confirmed</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card class="text-center pa-4" color="warning" dark>
          <v-icon size="32" class="mb-2">mdi-clock-outline</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.pending }}</div>
          <div class="text-caption">Pending</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card class="text-center pa-4" color="info" dark>
          <v-icon size="32" class="mb-2">mdi-calendar-today</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.active }}</div>
          <div class="text-caption">Active Now</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Search bookings..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filterStatus"
          label="Status"
          :items="statusFilterOptions"
          variant="outlined"
          clearable
          @update:model-value="filterBookings"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filterPayment"
          label="Payment Status"
          :items="paymentFilterOptions"
          variant="outlined"
          clearable
          @update:model-value="filterBookings"
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          block
          variant="outlined"
          prepend-icon="mdi-filter-off"
          @click="clearFilters"
        >
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

    <!-- Bookings Data Table -->
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">mdi-calendar-multiple</v-icon>
        All Bookings ({{ filteredBookings.length }})
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredBookings"
        :loading="loading"
        :search="search"
        class="elevation-1"
        item-value="id"
      >
        <!-- Guest column -->
        <template v-slot:[`item.guest`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-white">
                {{ item.guest?.first_name?.[0]
                }}{{ item.guest?.last_name?.[0] }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ item.guest?.first_name }} {{ item.guest?.last_name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.guest?.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Dates column -->
        <template v-slot:[`item.dates`]="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ formatDate(item.check_in) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              to {{ formatDate(item.check_out) }}
            </div>
            <v-chip size="x-small" color="info" class="mt-1">
              {{ calculateNights(item.check_in, item.check_out) }} nights
            </v-chip>
          </div>
        </template>

        <!-- Status column -->
        <template v-slot:[`item.status`]="{ item }">
          <div class="d-flex flex-column gap-1">
            <v-chip :color="getStatusColor(item)" size="small" variant="tonal">
              {{ getStatusText(item) }}
            </v-chip>
            <v-chip
              v-if="item.paid"
              color="success"
              size="x-small"
              variant="tonal"
            >
              Paid
            </v-chip>
          </div>
        </template>

        <!-- Actions column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="View Details">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewBooking(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Edit Booking">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editBooking(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip v-if="!item.confirmed" text="Confirm Booking">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-check"
                  size="small"
                  variant="text"
                  color="success"
                  @click="confirmBooking(item)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="sendKurkartenEmail(item.id)">
                  <v-list-item-title>Send Kurkarten Email</v-list-item-title>
                </v-list-item>
                <v-list-item @click="sendPreArrivalEmail(item.id)">
                  <v-list-item-title>Send Pre-arrival Email</v-list-item-title>
                </v-list-item>
                <v-list-item @click="generateInvoice(item.id)">
                  <v-list-item-title>Generate Invoice</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="deleteBooking(item)" class="text-error">
                  <v-list-item-title>Delete Booking</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-calendar-remove
            </v-icon>
            <div class="text-h6 mb-2">No bookings found</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Start by adding your first booking to the system
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-calendar-plus"
              @click="router.push('/bookings/add')"
            >
              Add First Booking
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { BookingService, type Booking } from "@/services/api";

const router = useRouter();

// Reactive data
const bookings = ref<Booking[]>([]);
const loading = ref(false);
const search = ref("");
const filterStatus = ref<string | null>(null);
const filterPayment = ref<string | null>(null);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Table headers
const headers = [
  { title: "Guest", key: "guest", sortable: false },
  { title: "Dates", key: "dates", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Created", key: "created_at", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "140px" },
];

// Filter options
const statusFilterOptions = [
  { title: "All Statuses", value: null },
  { title: "Pending", value: "pending" },
  { title: "Confirmed", value: "confirmed" },
];

const paymentFilterOptions = [
  { title: "All Payments", value: null },
  { title: "Paid", value: "paid" },
  { title: "Unpaid", value: "unpaid" },
];

// Computed stats
const stats = computed(() => {
  const total = bookings.value.length;
  const confirmed = bookings.value.filter((b) => b.confirmed).length;
  const pending = bookings.value.filter((b) => !b.confirmed).length;
  const today = new Date().toISOString().split("T")[0];
  const active = bookings.value.filter(
    (b) => b.check_in <= today && b.check_out >= today
  ).length;

  return { total, confirmed, pending, active };
});

// Computed filtered bookings
const filteredBookings = computed(() => {
  let filtered = bookings.value;

  if (filterStatus.value) {
    if (filterStatus.value === "confirmed") {
      filtered = filtered.filter((booking) => booking.confirmed);
    } else if (filterStatus.value === "pending") {
      filtered = filtered.filter((booking) => !booking.confirmed);
    }
  }

  if (filterPayment.value) {
    if (filterPayment.value === "paid") {
      filtered = filtered.filter((booking) => booking.paid);
    } else if (filterPayment.value === "unpaid") {
      filtered = filtered.filter((booking) => !booking.paid);
    }
  }

  return filtered;
});

// Methods
const loadBookings = async () => {
  loading.value = true;
  try {
    bookings.value = await BookingService.getAll();
  } catch (error) {
    console.error("Error loading bookings:", error);
    showSnackbar("Error loading bookings", "error");
  } finally {
    loading.value = false;
  }
};

const filterBookings = () => {
  // Filtering is handled by the computed property
};

const clearFilters = () => {
  filterStatus.value = null;
  filterPayment.value = null;
  search.value = "";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatusText = (booking: Booking) => {
  if (booking.paid) return "Completed";
  if (booking.confirmed) return "Confirmed";
  return "Pending";
};

const getStatusColor = (booking: Booking) => {
  if (booking.paid) return "success";
  if (booking.confirmed) return "primary";
  return "warning";
};

const viewBooking = (id: number) => {
  router.push(`/bookings/${id}`);
};

const editBooking = (id: number) => {
  router.push(`/bookings/${id}/edit`);
};

const confirmBooking = async (booking: Booking) => {
  try {
    await BookingService.confirm(booking.id);
    booking.confirmed = true;
    showSnackbar("Booking confirmed successfully", "success");
  } catch (error) {
    console.error("Error confirming booking:", error);
    showSnackbar("Error confirming booking", "error");
  }
};

const sendKurkartenEmail = async (id: number) => {
  try {
    await BookingService.sendKurkartenEmail(id);
    showSnackbar("Kurkarten email sent successfully", "success");
  } catch (error) {
    console.error("Error sending kurkarten email:", error);
    showSnackbar("Error sending kurkarten email", "error");
  }
};

const sendPreArrivalEmail = async (id: number) => {
  try {
    await BookingService.sendPreArrivalEmail(id);
    showSnackbar("Pre-arrival email sent successfully", "success");
  } catch (error) {
    console.error("Error sending pre-arrival email:", error);
    showSnackbar("Error sending pre-arrival email", "error");
  }
};

const generateInvoice = async (id: number) => {
  try {
    await BookingService.generateInvoice(id);
    showSnackbar("Invoice generated and sent successfully", "success");
  } catch (error) {
    console.error("Error generating invoice:", error);
    showSnackbar("Error generating invoice", "error");
  }
};

const deleteBooking = async (booking: Booking) => {
  if (
    confirm(
      `Are you sure you want to delete the booking for ${booking.guest?.first_name} ${booking.guest?.last_name}?`
    )
  ) {
    try {
      // TODO: Implement delete in BookingService
      // await BookingService.delete(booking.id);

      // For now, just remove from local array
      bookings.value = bookings.value.filter((b) => b.id !== booking.id);

      showSnackbar("Booking deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting booking:", error);
      showSnackbar("Error deleting booking", "error");
    }
  }
};

const showSnackbar = (text: string, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Lifecycle
onMounted(() => {
  loadBookings();
});
</script>
