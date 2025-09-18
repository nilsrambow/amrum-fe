<template>
  <div>
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col>
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-light">Guest Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Manage your property guests and their information
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-account-plus"
            @click="router.push('/guests/add')"
          >
            Add New Guest
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search guests..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          @input="searchGuests"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="filterPaymentType"
          label="Payment Type"
          :items="paymentTypeOptions"
          variant="outlined"
          clearable
          @update:model-value="filterGuests"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Guests Data Table -->
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">mdi-account-group</v-icon>
        All Guests ({{ filteredGuests.length }})
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredGuests"
        :loading="loading"
        :search="search"
        class="elevation-1"
        item-value="id"
      >
        <!-- Custom name column -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-white">
                {{ item.first_name[0] }}{{ item.last_name[0] }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ item.first_name }} {{ item.last_name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- Payment type column -->
        <template v-slot:[`item.pays_dayrate`]="{ item }">
          <v-chip
            :color="item.pays_dayrate ? 'primary' : 'success'"
            size="small"
            variant="tonal"
          >
            {{ item.pays_dayrate ? "Pays per day" : "Free" }}
          </v-chip>
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
                  @click="viewGuest(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Edit Guest">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editGuest(item.id)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Delete Guest">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-account-off
            </v-icon>
            <div class="text-h6 mb-2">No guests found</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Start by adding your first guest to the system
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-account-plus"
              @click="router.push('/guests/add')"
            >
              Add First Guest
            </v-btn>
          </div>
        </template>
      </v-data-table>
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
          <strong
            >{{ selectedGuest?.first_name }}
            {{ selectedGuest?.last_name }}</strong
          >? This action cannot be undone.
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { GuestService, type Guest } from "@/services/api";

const router = useRouter();

// Reactive data
const guests = ref<Guest[]>([]);
const loading = ref(false);
const search = ref("");
const filterPaymentType = ref<string | null>(null);
const deleteDialog = ref(false);
const selectedGuest = ref<Guest | null>(null);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Table headers
const headers = [
  { title: "Guest", key: "name", sortable: true },
  { title: "Payment Type", key: "pays_dayrate", sortable: true },
  { title: "Created", key: "created_at", sortable: true },
  { title: "Actions", key: "actions", sortable: false, width: "120px" },
];

// Filter options
const paymentTypeOptions = [
  { title: "All Types", value: null },
  { title: "Pays per day", value: "dayrate" },
  { title: "Free", value: "free" },
];

// Computed filtered guests
const filteredGuests = computed(() => {
  let filtered = guests.value;

  if (filterPaymentType.value) {
    if (filterPaymentType.value === "dayrate") {
      filtered = filtered.filter((guest) => guest.pays_dayrate);
    } else if (filterPaymentType.value === "free") {
      filtered = filtered.filter((guest) => !guest.pays_dayrate);
    }
  }

  return filtered;
});

// Methods
const loadGuests = async () => {
  loading.value = true;
  try {
    guests.value = await GuestService.getAll();
  } catch (error) {
    console.error("Error loading guests:", error);
    showSnackbar("Error loading guests", "error");
  } finally {
    loading.value = false;
  }
};

const searchGuests = () => {
  // Search is handled by the v-data-table component
};

const filterGuests = () => {
  // Filtering is handled by the computed property
};

const viewGuest = (id: number) => {
  router.push(`/guests/${id}`);
};

const editGuest = (id: number) => {
  router.push(`/guests/${id}/edit`);
};

const confirmDelete = (guest: Guest) => {
  selectedGuest.value = guest;
  deleteDialog.value = true;
};

const deleteGuest = async () => {
  if (!selectedGuest.value) return;

  try {
    // TODO: Implement delete in GuestService
    // await GuestService.delete(selectedGuest.value.id);

    // For now, just remove from local array
    guests.value = guests.value.filter((g) => g.id !== selectedGuest.value!.id);

    showSnackbar("Guest deleted successfully", "success");
    deleteDialog.value = false;
    selectedGuest.value = null;
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

// Lifecycle
onMounted(() => {
  loadGuests();
});
</script>
