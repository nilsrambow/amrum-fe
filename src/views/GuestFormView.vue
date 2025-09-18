<template>
  <div>
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
          <div>
            <h1 class="text-h4 font-weight-light">
              {{ isEdit ? "Edit Guest" : "Add New Guest" }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{
                isEdit
                  ? "Update guest information"
                  : "Enter guest details to add them to the system"
              }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Guest Form -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">{{
              isEdit ? "mdi-account-edit" : "mdi-account-plus"
            }}</v-icon>
            Guest Information
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Personal Information -->
                <v-col cols="12">
                  <div class="text-h6 mb-4">Personal Information</div>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.first_name"
                    label="First Name"
                    variant="outlined"
                    :rules="nameRules"
                    prepend-inner-icon="mdi-account"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.last_name"
                    label="Last Name"
                    variant="outlined"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    label="Email Address"
                    variant="outlined"
                    :rules="emailRules"
                    prepend-inner-icon="mdi-email"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Password (only for new guests) -->
                <v-col cols="12" v-if="!isEdit">
                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    variant="outlined"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="
                      showPassword ? 'mdi-eye' : 'mdi-eye-off'
                    "
                    @click:append-inner="showPassword = !showPassword"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Settings -->
                <v-col cols="12">
                  <div class="text-h6 mb-4">Settings</div>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    v-model="formData.pays_dayrate"
                    label="Payment Type"
                    :items="paymentTypeOptions"
                    variant="outlined"
                    prepend-inner-icon="mdi-cash"
                  ></v-select>
                </v-col>

                <!-- Description Cards -->
                <v-col cols="12">
                  <v-card variant="tonal" color="primary">
                    <v-card-text>
                      <div class="d-flex align-center">
                        <v-icon class="mr-3">mdi-cash</v-icon>
                        <div>
                          <div class="font-weight-medium">Payment Type</div>
                          <div class="text-caption">
                            Pays per day: Guest pays for each night of stay<br />
                            Free: Guest stays without charge
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="router.back()"> Cancel </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!valid"
              @click="handleSubmit"
            >
              {{ isEdit ? "Update Guest" : "Add Guest" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Side Panel with Quick Info -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Quick Tips
          </v-card-title>
          <v-card-text>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              All fields marked with * are required
            </div>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Email addresses must be unique
            </div>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Passwords must be at least 8 characters
            </div>
            <div>
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              All guests are regular users by default
            </div>
          </v-card-text>
        </v-card>

        <!-- Preview Card (if editing) -->
        <v-card v-if="isEdit && formData.first_name">
          <v-card-title>
            <v-icon class="mr-2">mdi-eye</v-icon>
            Preview
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <v-avatar color="primary" size="64" class="mb-3">
                <span class="text-h5 text-white">
                  {{ formData.first_name[0] }}{{ formData.last_name[0] }}
                </span>
              </v-avatar>
              <div class="text-h6">
                {{ formData.first_name }} {{ formData.last_name }}
              </div>
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ formData.email }}
              </div>

              <v-chip
                :color="formData.pays_dayrate ? 'primary' : 'success'"
                size="small"
              >
                {{ formData.pays_dayrate ? "Pays per day" : "Free" }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { GuestService, type Guest } from "@/services/api";

const router = useRouter();
const route = useRoute();

// Props and computed
const isEdit = computed(() => route.name === "edit-guest");
const guestId = computed(() => route.params.id as string);

// Reactive data
const valid = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Form data
const formData = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  pays_dayrate: true,
  is_admin: false,
});

// Form validation rules
const nameRules = [
  (v: string) => !!v || "This field is required",
  (v: string) => v.length >= 2 || "Name must be at least 2 characters",
];

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => v.length >= 8 || "Password must be at least 8 characters",
];

// Options
const paymentTypeOptions = [
  { title: "Pays per day", value: true },
  { title: "Free", value: false },
];

// Methods
const loadGuest = async () => {
  if (!isEdit.value || !guestId.value) return;

  loading.value = true;
  try {
    const guest = await GuestService.getById(parseInt(guestId.value));
    formData.value = {
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      password: "", // Never load existing password
      pays_dayrate: guest.pays_dayrate,
      is_admin: false, // Always set to false (guest)
    };
  } catch (error) {
    console.error("Error loading guest:", error);
    showSnackbar("Error loading guest details", "error");
    router.push("/guests");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!valid.value) return;

  loading.value = true;
  try {
    if (isEdit.value && guestId.value) {
      // Update guest (exclude password from update)
      const updateData = {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        email: formData.value.email,
        pays_dayrate: formData.value.pays_dayrate,
        is_admin: formData.value.is_admin,
      };

      await GuestService.update(parseInt(guestId.value), updateData);
      showSnackbar("Guest updated successfully", "success");
    } else {
      await GuestService.create(formData.value);
      showSnackbar("Guest added successfully", "success");
    }

    router.push("/guests");
  } catch (error) {
    console.error("Error saving guest:", error);
    showSnackbar("Error saving guest", "error");
  } finally {
    loading.value = false;
  }
};

const showSnackbar = (text: string, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Lifecycle
onMounted(() => {
  if (isEdit.value) {
    loadGuest();
  }
});
</script>
