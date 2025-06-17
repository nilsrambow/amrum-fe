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

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="warning" dark>
          <v-icon size="24" class="mb-1">mdi-calendar-plus</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.newBookings }}</div>
          <div class="text-caption">New</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="info" dark>
          <v-icon size="24" class="mb-1">mdi-calendar-check</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.confirmed }}</div>
          <div class="text-caption">Confirmed</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="cyan" dark>
          <v-icon size="24" class="mb-1">mdi-card-account-details</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ stats.kurkartenRequested }}
          </div>
          <div class="text-caption">Kurkarten</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="success" dark>
          <v-icon size="24" class="mb-1">mdi-calendar-clock</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ stats.readyForArrival }}
          </div>
          <div class="text-caption">Ready</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="purple" dark>
          <v-icon size="24" class="mb-1">mdi-car</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.arriving }}</div>
          <div class="text-caption">Arriving</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="green" dark>
          <v-icon size="24" class="mb-1">mdi-home</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.onSite }}</div>
          <div class="text-caption">On Site</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="orange" dark>
          <v-icon size="24" class="mb-1">mdi-car-side</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.departing }}</div>
          <div class="text-caption">Departing</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-card class="text-center pa-3" color="error" dark>
          <v-icon size="24" class="mb-1">mdi-gauge-empty</v-icon>
          <div class="text-h6 font-weight-bold">{{ stats.readingsDue }}</div>
          <div class="text-caption">Readings Due</div>
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
        All Bookings ({{ bookingsWithGuests.length }})
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="bookingsWithGuests"
        :loading="loading"
        :search="search"
        class="elevation-1"
        item-value="id"
      >
        <!-- Guest column -->
        <template v-slot:[`item.guest`]="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.guest?.first_name }} {{ item.guest?.last_name }}
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
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusText(item.status) }}
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

            <v-tooltip
              v-if="item.status !== 'confirmed'"
              text="Confirm Booking"
            >
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
import {
  BookingService,
  GuestService,
  type Booking,
  type Guest,
} from "@/services/api";
import EmailAlerts from "@/components/EmailAlerts.vue";
import GuestActions from "@/components/GuestActions.vue";

const router = useRouter();

// Reactive data
const bookings = ref<Booking[]>([]);
const guests = ref<Guest[]>([]);
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
  { title: "New", value: "new" },
  { title: "Confirmed", value: "confirmed" },
  { title: "Kurkarten Requested", value: "kurkarten_requested" },
  { title: "Ready for Arrival", value: "ready_for_arrival" },
  { title: "Arriving", value: "arriving" },
  { title: "On Site", value: "on_site" },
  { title: "Departing", value: "departing" },
  { title: "Departed - Readings Due", value: "departed_readings_due" },
];

const paymentFilterOptions = [
  { title: "All Payments", value: null },
  { title: "Paid", value: "paid" },
  { title: "Unpaid", value: "unpaid" },
];

// Computed stats
const stats = computed(() => {
  const newBookings = bookings.value.filter((b) => b.status === "new").length;
  const confirmed = bookings.value.filter(
    (b) => b.status === "confirmed"
  ).length;
  const kurkartenRequested = bookings.value.filter(
    (b) => b.status === "kurkarten_requested"
  ).length;
  const readyForArrival = bookings.value.filter(
    (b) => b.status === "ready_for_arrival"
  ).length;
  const arriving = bookings.value.filter((b) => b.status === "arriving").length;
  const onSite = bookings.value.filter((b) => b.status === "on_site").length;
  const departing = bookings.value.filter(
    (b) => b.status === "departing"
  ).length;
  const readingsDue = bookings.value.filter(
    (b) => b.status === "departed_readings_due"
  ).length;

  return {
    newBookings,
    confirmed,
    kurkartenRequested,
    readyForArrival,
    arriving,
    onSite,
    departing,
    readingsDue,
  };
});

// Computed filtered bookings
const filteredBookings = computed(() => {
  let filtered = bookings.value;

  if (filterStatus.value) {
    filtered = filtered.filter(
      (booking) => booking.status === filterStatus.value
    );
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

// Computed bookings with guest data
const bookingsWithGuests = computed(() => {
  return filteredBookings.value.map((booking) => {
    const guest = guests.value.find((g) => g.id === booking.guest_id);
    return {
      ...booking,
      guest,
    };
  });
});

// Methods
const loadBookings = async () => {
  loading.value = true;
  try {
    const [bookingsData, guestsData] = await Promise.all([
      BookingService.getAll(),
      GuestService.getAll(),
    ]);
    bookings.value = bookingsData;
    guests.value = guestsData;
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
  };
  return colorMap[status] || "grey";
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
    booking.status = "confirmed";
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
    await BookingService.createInvoice(id);
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
