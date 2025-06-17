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
              {{ isEdit ? "Edit Booking" : "Create New Booking" }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{
                isEdit
                  ? "Update booking information"
                  : "Enter booking details for guest reservation"
              }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Booking Form -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">{{
              isEdit ? "mdi-calendar-edit" : "mdi-calendar-plus"
            }}</v-icon>
            Booking Information
          </v-card-title>

          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Guest Selection -->
                <v-col cols="12">
                  <div class="text-h6 mb-4">Guest Information</div>
                </v-col>

                <v-col cols="12">
                  <div class="d-flex gap-3">
                    <v-autocomplete
                      v-model="formData.guest_id"
                      label="Search and select guest"
                      :items="guestOptions"
                      item-title="displayHidden"
                      item-value="id"
                      variant="outlined"
                      :rules="guestRules"
                      prepend-inner-icon="mdi-account-search"
                      clearable
                      :custom-filter="guestFilter"
                      class="flex-grow-1"
                      required
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template #prepend>
                            <v-avatar color="primary" size="32">
                              <span class="text-white text-caption">
                                {{ item.raw.first_name[0]
                                }}{{ item.raw.last_name[0] }}
                              </span>
                            </v-avatar>
                          </template>
                          <v-list-item-title>{{
                            item.raw.name
                          }}</v-list-item-title>
                          <v-list-item-subtitle>{{
                            item.raw.email
                          }}</v-list-item-subtitle>
                          <template #append>
                            <v-chip
                              :color="
                                item.raw.pays_dayrate ? 'primary' : 'success'
                              "
                              size="small"
                              variant="tonal"
                            >
                              {{
                                item.raw.pays_dayrate ? "Pays per day" : "Free"
                              }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </template>

                      <template #selection="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar color="primary" size="24" class="mr-2">
                            <span class="text-white text-caption">
                              {{ item.raw.first_name[0]
                              }}{{ item.raw.last_name[0] }}
                            </span>
                          </v-avatar>
                          {{ item.raw.name }}
                        </div>
                      </template>
                    </v-autocomplete>

                    <v-btn
                      color="success"
                      variant="outlined"
                      prepend-icon="mdi-account-plus"
                      @click="openAddGuestDialog"
                      style="white-space: nowrap"
                    >
                      Add New Guest
                    </v-btn>
                  </div>
                </v-col>

                <!-- Date Information -->
                <v-col cols="12">
                  <div class="text-h6 mb-4">Stay Dates</div>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.check_in"
                    label="Check-in Date"
                    type="date"
                    variant="outlined"
                    :rules="dateRules"
                    prepend-inner-icon="mdi-calendar-arrow-right"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formData.check_out"
                    label="Check-out Date"
                    type="date"
                    variant="outlined"
                    :rules="checkoutRules"
                    prepend-inner-icon="mdi-calendar-arrow-left"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Booking Summary -->
                <v-col cols="12" v-if="formData.check_in && formData.check_out">
                  <v-card variant="tonal" color="info">
                    <v-card-text>
                      <div class="d-flex align-center">
                        <v-icon class="mr-3">mdi-information</v-icon>
                        <div>
                          <div class="font-weight-medium">Booking Summary</div>
                          <div class="text-caption">
                            Duration: {{ nightsCount }}
                            {{ nightsCount === 1 ? "night" : "nights" }}
                            <span
                              v-if="selectedGuest && selectedGuest.pays_dayrate"
                            >
                              • Paying guest
                            </span>
                            <span v-else-if="selectedGuest"> • Free stay </span>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Tourist Tax (Kurtaxe) - Optional -->
                <v-col cols="12" v-if="isEdit">
                  <div class="text-h6 mb-4">Additional Information</div>
                </v-col>

                <v-col cols="12" sm="6" v-if="isEdit">
                  <v-text-field
                    v-model.number="formData.kurtaxe_amount"
                    label="Tourist Tax (Kurtaxe) Amount"
                    type="number"
                    step="0.01"
                    variant="outlined"
                    prepend-inner-icon="mdi-currency-eur"
                    suffix="EUR"
                  ></v-text-field>
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
              {{ isEdit ? "Update Booking" : "Create Booking" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Side Panel with Info -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Booking Guidelines
          </v-card-title>
          <v-card-text>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Select an existing guest from the dropdown
            </div>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Check-out date must be after check-in
            </div>
            <div class="mb-3">
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Tourist tax can be added later if needed
            </div>
            <div>
              <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
              Bookings start as "Pending" by default
            </div>
          </v-card-text>
        </v-card>

        <!-- Guest Preview -->
        <v-card v-if="selectedGuest">
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Selected Guest
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <v-avatar color="primary" size="48" class="mb-3">
                <span class="text-h6 text-white">
                  {{ selectedGuest.first_name[0]
                  }}{{ selectedGuest.last_name[0] }}
                </span>
              </v-avatar>
              <div class="text-h6">{{ selectedGuest.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-3">
                {{ selectedGuest.email }}
              </div>

              <v-chip
                :color="selectedGuest.pays_dayrate ? 'primary' : 'success'"
                size="small"
              >
                {{ selectedGuest.pays_dayrate ? "Pays per day" : "Free" }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Quick Actions (if editing) -->
        <v-card v-if="isEdit && bookingId">
          <v-card-title>
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-btn
              block
              :color="
                currentBooking?.status === 'confirmed' ? 'grey' : 'success'
              "
              :variant="
                currentBooking?.status === 'confirmed' ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-check"
              @click="confirmBooking"
            >
              {{
                currentBooking?.status === "confirmed"
                  ? "Booking Confirmed"
                  : "Confirm Booking"
              }}
            </v-btn>

            <v-btn
              block
              :color="currentBooking?.kurkarten_email_sent ? 'grey' : 'info'"
              :variant="
                currentBooking?.kurkarten_email_sent ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-email"
              @click="sendKurkartenEmail"
            >
              {{
                currentBooking?.kurkarten_email_sent
                  ? "Kurkarten Email Sent"
                  : "Send Kurkarten Email"
              }}
            </v-btn>

            <v-btn
              block
              :color="currentBooking?.kurtaxe_amount ? 'grey' : 'teal'"
              :variant="
                currentBooking?.kurtaxe_amount ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-currency-eur"
              @click="registerTouristTax"
            >
              {{
                currentBooking?.kurtaxe_amount
                  ? "Tourist Tax Registered"
                  : "Register Tourist Tax"
              }}
            </v-btn>

            <v-btn
              block
              :color="
                currentBooking?.pre_arrival_email_sent ? 'grey' : 'warning'
              "
              :variant="
                currentBooking?.pre_arrival_email_sent ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-email-arrow-right"
              @click="sendPreArrivalEmail"
            >
              {{
                currentBooking?.pre_arrival_email_sent
                  ? "Pre-arrival Email Sent"
                  : "Send Pre-arrival Email"
              }}
            </v-btn>

            <v-btn
              block
              :color="currentBooking?.meter_readings ? 'grey' : 'orange'"
              :variant="
                currentBooking?.meter_readings ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-gauge"
              @click="registerReadings"
            >
              {{
                currentBooking?.meter_readings
                  ? "Readings Registered"
                  : "Register Readings"
              }}
            </v-btn>

            <v-btn
              block
              :color="currentBooking?.invoice_created ? 'grey' : 'purple'"
              :variant="
                currentBooking?.invoice_created ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-file-document-plus"
              @click="openInvoiceDialog"
            >
              {{
                currentBooking?.invoice_created
                  ? "Invoice Created"
                  : "Create Invoice"
              }}
            </v-btn>

            <v-btn
              block
              :color="currentBooking?.invoice_sent ? 'grey' : 'deep-purple'"
              :variant="currentBooking?.invoice_sent ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-file-document-arrow-right"
              @click="sendInvoice"
              :disabled="!currentBooking?.invoice_created"
            >
              {{
                currentBooking?.invoice_sent ? "Invoice Sent" : "Send Invoice"
              }}
            </v-btn>

            <v-btn
              block
              color="success"
              variant="elevated"
              class="mb-2"
              prepend-icon="mdi-cash-plus"
              @click="openPaymentDialog"
            >
              Register Payment
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Guest Dialog -->
    <v-dialog v-model="addGuestDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Add New Guest
        </v-card-title>

        <v-card-text>
          <v-form ref="guestForm" v-model="guestFormValid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGuest.first_name"
                  label="First Name"
                  variant="outlined"
                  :rules="nameRules"
                  prepend-inner-icon="mdi-account"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newGuest.last_name"
                  label="Last Name"
                  variant="outlined"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="newGuest.email"
                  label="Email Address"
                  variant="outlined"
                  :rules="emailRules"
                  prepend-inner-icon="mdi-email"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="newGuest.password"
                  label="Password"
                  variant="outlined"
                  :type="showGuestPassword ? 'text' : 'password'"
                  :rules="passwordRules"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="
                    showGuestPassword ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append-inner="showGuestPassword = !showGuestPassword"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="newGuest.pays_dayrate"
                  label="Payment Type"
                  :items="paymentTypeOptions"
                  variant="outlined"
                  prepend-inner-icon="mdi-cash"
                ></v-select>
              </v-col>

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
          <v-btn variant="text" @click="closeAddGuestDialog"> Cancel </v-btn>
          <v-btn
            color="success"
            :loading="addingGuest"
            :disabled="!guestFormValid"
            @click="createGuest"
          >
            Add Guest
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>

    <!-- Tourist Tax Registration Dialog -->
    <v-dialog v-model="touristTaxDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-currency-eur</v-icon>
          Register Tourist Tax
        </v-card-title>
        <v-card-text>
          <v-form ref="touristTaxForm" v-model="touristTaxFormValid">
            <v-text-field
              v-model="touristTaxData.amount"
              label="Tourist Tax Amount (€)"
              type="number"
              variant="outlined"
              :rules="amountRules"
              prepend-inner-icon="mdi-currency-eur"
              step="0.01"
              min="0"
              required
            ></v-text-field>
            <v-textarea
              v-model="touristTaxData.notes"
              label="Notes (Optional)"
              variant="outlined"
              prepend-inner-icon="mdi-note-text"
              rows="3"
              placeholder="Add any notes about the tourist tax registration..."
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeTouristTaxDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="registeringTouristTax"
            :disabled="!touristTaxFormValid"
            @click="saveTouristTax"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Meter Readings Registration Dialog -->
    <v-dialog v-model="meterReadingsDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-gauge</v-icon>
          Register Meter Readings
        </v-card-title>
        <v-card-text>
          <v-form ref="meterReadingsForm" v-model="meterReadingsFormValid">
            <v-row>
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    Electricity (kWh)
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model="meterReadingsData.electricity_start"
                          label="Start Reading"
                          type="number"
                          variant="outlined"
                          :rules="numberRules"
                          prepend-inner-icon="mdi-gauge"
                          min="0"
                          step="0.01"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="meterReadingsData.electricity_end"
                          label="End Reading"
                          type="number"
                          variant="outlined"
                          :rules="numberRules"
                          prepend-inner-icon="mdi-gauge"
                          min="0"
                          step="0.01"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-fire</v-icon>
                    Gas (m³)
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model="meterReadingsData.gas_start"
                          label="Start Reading"
                          type="number"
                          variant="outlined"
                          :rules="numberRules"
                          prepend-inner-icon="mdi-gauge"
                          min="0"
                          step="0.01"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="meterReadingsData.gas_end"
                          label="End Reading"
                          type="number"
                          variant="outlined"
                          :rules="numberRules"
                          prepend-inner-icon="mdi-gauge"
                          min="0"
                          step="0.01"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2">mdi-wood</v-icon>
                    Firewood
                  </v-card-title>
                  <v-card-text>
                    <v-text-field
                      v-model="meterReadingsData.firewood_boxes"
                      label="Number of Boxes Used"
                      type="number"
                      variant="outlined"
                      :rules="numberRules"
                      prepend-inner-icon="mdi-wood"
                      min="0"
                      step="1"
                    ></v-text-field>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeMeterReadingsDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="registeringMeterReadings"
            :disabled="!meterReadingsFormValid"
            @click="saveMeterReadings"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Invoice Generation Dialog -->
    <v-dialog v-model="invoiceDialog" max-width="700" persistent>
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-file-document-plus</v-icon>
          Generate Invoice
        </v-card-title>
        <v-card-text>
          <div v-if="loadingInvoice" class="text-center pa-6">
            <v-progress-circular
              indeterminate
              color="primary"
              size="32"
            ></v-progress-circular>
            <div class="mt-2">Loading invoice calculation...</div>
          </div>

          <div v-else>
            <!-- Invoice Summary -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">
                <v-icon class="mr-2">mdi-calculator</v-icon>
                Invoice Summary
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Duration</v-list-item-title>
                    <v-list-item-subtitle
                      >{{ nightsCount }} nights</v-list-item-subtitle
                    >
                  </v-list-item>

                  <v-list-item v-if="currentBooking?.guest">
                    <template #prepend>
                      <v-icon>mdi-account</v-icon>
                    </template>
                    <v-list-item-title>Guest</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ currentBooking.guest.first_name }}
                      {{ currentBooking.guest.last_name }}
                      <v-chip
                        size="x-small"
                        :color="
                          currentBooking.guest.pays_dayrate
                            ? 'primary'
                            : 'success'
                        "
                        class="ml-2"
                      >
                        {{
                          currentBooking.guest.pays_dayrate
                            ? "Pays per night"
                            : "Free"
                        }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Invoice Breakdown -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-subtitle-1">
                <v-icon class="mr-2">mdi-receipt</v-icon>
                Invoice Breakdown
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <!-- Accommodation -->
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-home</v-icon>
                    </template>
                    <v-list-item-title>Accommodation</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ nightsCount }} nights ×
                      {{ formatCurrency(unitPrices.stay_per_night || 0) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{ formatCurrency(invoiceCalculation.accommodation) }}
                      </span>
                    </template>
                  </v-list-item>

                  <!-- Electricity -->
                  <v-list-item v-if="invoiceCalculation.electricity > 0">
                    <template #prepend>
                      <v-icon>mdi-lightning-bolt</v-icon>
                    </template>
                    <v-list-item-title>Electricity</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ invoiceCalculation.electricity_usage }} kWh ×
                      {{ formatCurrency(unitPrices.electricity_per_kwh || 0) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{ formatCurrency(invoiceCalculation.electricity) }}
                      </span>
                    </template>
                  </v-list-item>

                  <!-- Gas -->
                  <v-list-item v-if="invoiceCalculation.gas > 0">
                    <template #prepend>
                      <v-icon>mdi-fire</v-icon>
                    </template>
                    <v-list-item-title>Gas</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ invoiceCalculation.gas_usage }} m³ ×
                      {{ formatCurrency(unitPrices.gas_per_cubic_meter || 0) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{ formatCurrency(invoiceCalculation.gas) }}
                      </span>
                    </template>
                  </v-list-item>

                  <!-- Firewood -->
                  <v-list-item v-if="invoiceCalculation.firewood > 0">
                    <template #prepend>
                      <v-icon>mdi-wood</v-icon>
                    </template>
                    <v-list-item-title>Firewood</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ invoiceCalculation.firewood_boxes }} boxes ×
                      {{ formatCurrency(unitPrices.firewood_per_box || 0) }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{ formatCurrency(invoiceCalculation.firewood) }}
                      </span>
                    </template>
                  </v-list-item>

                  <!-- Tourist Tax -->
                  <v-list-item v-if="invoiceCalculation.tourist_tax > 0">
                    <template #prepend>
                      <v-icon>mdi-currency-eur</v-icon>
                    </template>
                    <v-list-item-title>Tourist Tax</v-list-item-title>
                    <v-list-item-subtitle>Fixed amount</v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{ formatCurrency(invoiceCalculation.tourist_tax) }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <!-- Total -->
                  <v-list-item class="font-weight-bold">
                    <template #prepend>
                      <v-icon color="primary">mdi-calculator</v-icon>
                    </template>
                    <v-list-item-title class="text-h6">Total</v-list-item-title>
                    <template #append>
                      <span class="text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(invoiceCalculation.total) }}
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Missing Data Warning -->
            <v-alert
              v-if="missingData.length > 0"
              type="warning"
              variant="tonal"
              class="mb-4"
            >
              <template #prepend>
                <v-icon>mdi-alert</v-icon>
              </template>
              <div class="font-weight-medium mb-1">
                Missing data for complete calculation:
              </div>
              <ul class="mb-0">
                <li v-for="item in missingData" :key="item">{{ item }}</li>
              </ul>
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeInvoiceDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="generatingInvoice"
            :disabled="missingData.length > 0"
            @click="createInvoice"
          >
            Generate Invoice
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-cash-plus</v-icon>
          Register Payment
        </v-card-title>
        <v-card-text>
          <v-form ref="paymentForm" v-model="paymentFormValid">
            <v-text-field
              v-model.number="paymentData.amount"
              label="Amount (€)"
              type="number"
              step="0.01"
              min="0"
              :rules="[
                (v) => !!v || 'Amount is required',
                (v) => v > 0 || 'Amount must be greater than 0',
              ]"
              required
            ></v-text-field>

            <v-text-field
              v-model="paymentData.payment_date"
              label="Payment Date"
              type="date"
              :rules="[(v) => !!v || 'Payment date is required']"
              required
            ></v-text-field>

            <v-select
              v-model="paymentData.payment_method"
              label="Payment Method"
              :items="paymentMethods"
            ></v-select>

            <v-text-field
              v-model="paymentData.reference"
              label="Reference"
              placeholder="Transaction ID, check number, etc."
              :rules="[(v) => !!v || 'Reference is required']"
              required
            ></v-text-field>

            <v-textarea
              v-model="paymentData.notes"
              label="Notes"
              placeholder="Additional notes about the payment"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closePaymentDialog"
            :disabled="registeringPayment"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            @click="savePayment"
            :loading="registeringPayment"
            :disabled="!paymentFormValid"
          >
            Register Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BookingService,
  GuestService,
  MeterService,
  AdminService,
  type Booking,
  type Guest,
} from "@/services/api";

const router = useRouter();
const route = useRoute();

// Props and computed
const isEdit = computed(() => route.name === "edit-booking");
const bookingId = computed(() => route.params.id as string);

// Reactive data
const valid = ref(false);
const loading = ref(false);
const guests = ref<Guest[]>([]);
const currentBooking = ref<Booking | null>(null);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

// Add Guest Dialog
const addGuestDialog = ref(false);
const guestFormValid = ref(false);
const addingGuest = ref(false);
const showGuestPassword = ref(false);

// Tourist Tax Modal
const touristTaxDialog = ref(false);
const touristTaxForm = ref(null);
const touristTaxFormValid = ref(true);
const touristTaxData = ref({
  amount: 0,
  notes: "",
});
const registeringTouristTax = ref(false);

// Meter Readings Modal
const meterReadingsDialog = ref(false);
const meterReadingsForm = ref(null);
const meterReadingsFormValid = ref(true);
const meterReadingsData = ref<{
  electricity_start?: number;
  electricity_end?: number;
  gas_start?: number;
  gas_end?: number;
  firewood_boxes?: number;
}>({
  electricity_start: undefined,
  electricity_end: undefined,
  gas_start: undefined,
  gas_end: undefined,
  firewood_boxes: undefined,
});
const registeringMeterReadings = ref(false);

// Invoice Modal
const invoiceDialog = ref(false);
const loadingInvoice = ref(false);
const generatingInvoice = ref(false);
const unitPrices = ref<{
  stay_per_night: number;
  electricity_per_kwh: number;
  gas_per_cubic_meter: number;
  firewood_per_box: number;
}>({
  stay_per_night: 0,
  electricity_per_kwh: 0,
  gas_per_cubic_meter: 0,
  firewood_per_box: 0,
});

const invoiceCalculation = ref<{
  accommodation: number;
  electricity: number;
  electricity_usage: number;
  gas: number;
  gas_usage: number;
  firewood: number;
  firewood_boxes: number;
  tourist_tax: number;
  total: number;
}>({
  accommodation: 0,
  electricity: 0,
  electricity_usage: 0,
  gas: 0,
  gas_usage: 0,
  firewood: 0,
  firewood_boxes: 0,
  tourist_tax: 0,
  total: 0,
});

const missingData = ref<string[]>([]);

// Form data
const formData = ref({
  guest_id: null as number | null,
  check_in: "",
  check_out: "",
  kurtaxe_amount: undefined as number | undefined,
  kurtaxe_notes: "",
});

// New guest form data
const newGuest = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  pays_dayrate: true,
});

// Form validation rules
const guestRules = [(v: number) => !!v || "Please select a guest"];

const dateRules = [(v: string) => !!v || "Date is required"];

const checkoutRules = [
  (v: string) => !!v || "Check-out date is required",
  (v: string) => {
    if (!formData.value.check_in || !v) return true;
    return (
      new Date(v) > new Date(formData.value.check_in) ||
      "Check-out must be after check-in"
    );
  },
];

// Guest form validation rules
const nameRules = [
  (v: string) => !!v || "Name is required",
  (v: string) => (v && v.length >= 2) || "Name must be at least 2 characters",
];

const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) =>
    (v && v.length >= 6) || "Password must be at least 6 characters",
];

// Tourist tax validation rules
const amountRules = [
  (v: any) => !!v || "Amount is required",
  (v: any) => v >= 0 || "Amount must be positive",
  (v: any) => !isNaN(v) || "Amount must be a valid number",
];

// Meter readings validation rules
const numberRules = [
  (v: any) => v >= 0 || "Reading must be positive",
  (v: any) => !isNaN(v) || "Reading must be a valid number",
];

// Payment type options
const paymentTypeOptions = [
  { title: "Pays per day", value: true },
  { title: "Free", value: false },
];

// Computed properties
const guestOptions = computed(() => {
  return guests.value.map((guest) => ({
    id: guest.id,
    name: `${guest.first_name} ${guest.last_name}`,
    searchText: `${guest.first_name} ${guest.last_name} ${guest.email}`,
    displayHidden: "", // Empty string to hide default display
    email: guest.email,
    first_name: guest.first_name,
    last_name: guest.last_name,
    pays_dayrate: guest.pays_dayrate,
  }));
});

const selectedGuest = computed(() => {
  if (!formData.value.guest_id) return null;
  return (
    guestOptions.value.find((g) => g.id === formData.value.guest_id) || null
  );
});

const nightsCount = computed(() => {
  if (!formData.value.check_in || !formData.value.check_out) return 0;
  const start = new Date(formData.value.check_in);
  const end = new Date(formData.value.check_out);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Custom filter function for guest search
const guestFilter = (value: string, query: string, item?: any) => {
  if (!query) return true;

  const searchQuery = query.toLowerCase();
  const searchableText = item?.raw?.searchText?.toLowerCase() || "";

  return searchableText.includes(searchQuery);
};

// Helper function to extract meaningful error messages
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Methods
const loadGuests = async () => {
  try {
    guests.value = await GuestService.getAll();
  } catch (error: any) {
    console.error("Error loading guests:", error);
    const errorMessage = extractErrorMessage(error, "Error loading guests");
    showSnackbar(errorMessage, "error");
  }
};

const loadBooking = async () => {
  if (!isEdit.value || !bookingId.value) return;

  loading.value = true;
  try {
    currentBooking.value = await BookingService.getById(
      parseInt(bookingId.value)
    );

    // Populate form with existing booking data
    formData.value = {
      guest_id: currentBooking.value.guest_id,
      check_in: currentBooking.value.check_in,
      check_out: currentBooking.value.check_out,
      kurtaxe_amount: currentBooking.value.kurtaxe_amount || undefined,
      kurtaxe_notes: currentBooking.value.kurtaxe_notes || "",
    };
  } catch (error: any) {
    console.error("Error loading booking:", error);
    const errorMessage = extractErrorMessage(
      error,
      "Error loading booking details"
    );
    showSnackbar(errorMessage, "error");
    router.push("/bookings");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!valid.value) return;

  loading.value = true;
  try {
    if (isEdit.value && bookingId.value) {
      // Check if any changes were made
      const hasChanges =
        formData.value.guest_id !== currentBooking.value?.guest_id ||
        formData.value.check_in !== currentBooking.value?.check_in ||
        formData.value.check_out !== currentBooking.value?.check_out ||
        formData.value.kurtaxe_amount !==
          currentBooking.value?.kurtaxe_amount ||
        formData.value.kurtaxe_notes !== currentBooking.value?.kurtaxe_notes;

      if (hasChanges) {
        // Update booking with changes
        await BookingService.update(parseInt(bookingId.value), {
          guest_id: formData.value.guest_id!,
          check_in: formData.value.check_in,
          check_out: formData.value.check_out,
          kurtaxe_amount: formData.value.kurtaxe_amount,
          kurtaxe_notes: formData.value.kurtaxe_notes,
        });

        showSnackbar("Booking updated successfully", "success");

        // Redirect to booking details page
        router.push(`/bookings/${bookingId.value}`);
      } else {
        showSnackbar("No changes made to booking", "info");
        router.push(`/bookings/${bookingId.value}`);
      }
    } else {
      await BookingService.create({
        guest_id: formData.value.guest_id!,
        check_in: formData.value.check_in,
        check_out: formData.value.check_out,
        status: "new",
      });
      showSnackbar("Booking created successfully", "success");
      router.push("/bookings");
    }
  } catch (error: any) {
    console.error("Error saving booking:", error);
    const errorMessage = extractErrorMessage(error, "Error saving booking");
    showSnackbar(errorMessage, "error");
  } finally {
    loading.value = false;
  }
};

const confirmBooking = async () => {
  if (!bookingId.value) return;

  try {
    await BookingService.confirm(parseInt(bookingId.value));
    showSnackbar("Booking confirmed successfully", "success");
    if (currentBooking.value) {
      currentBooking.value.status = "confirmed";
    }
  } catch (error: any) {
    console.error("Error confirming booking:", error);
    const errorMessage = extractErrorMessage(error, "Error confirming booking");
    showSnackbar(errorMessage, "error");
  }
};

const sendKurkartenEmail = async () => {
  if (!bookingId.value) return;

  try {
    await BookingService.sendKurkartenEmail(parseInt(bookingId.value));
    showSnackbar("Kurkarten email sent successfully", "success");
  } catch (error) {
    console.error("Error sending kurkarten email:", error);
    showSnackbar("Error sending kurkarten email", "error");
  }
};

const sendPreArrivalEmail = async () => {
  if (!bookingId.value) return;

  try {
    await BookingService.sendPreArrivalEmail(parseInt(bookingId.value));
    showSnackbar("Pre-arrival email sent successfully", "success");
  } catch (error) {
    console.error("Error sending pre-arrival email:", error);
    showSnackbar("Error sending pre-arrival email", "error");
  }
};

const createInvoice = async () => {
  if (!bookingId.value) return;

  generatingInvoice.value = true;
  try {
    // Call the backend to generate invoice
    const result = await BookingService.createInvoice(
      parseInt(bookingId.value)
    );

    // Update the current booking data
    if (currentBooking.value) {
      currentBooking.value.invoice_created = true;
      currentBooking.value.invoice_id = result.invoice_id;
    }

    showSnackbar("Invoice created successfully", "success");
  } catch (error) {
    console.error("Error creating invoice:", error);
    showSnackbar("Error creating invoice", "error");
  } finally {
    generatingInvoice.value = false;
  }
};

const sendInvoice = async () => {
  if (!bookingId.value) return;

  generatingInvoice.value = true;
  try {
    await BookingService.sendInvoice(parseInt(bookingId.value));
    if (currentBooking.value) {
      currentBooking.value.invoice_sent = true;
      currentBooking.value.invoice_sent_date = new Date().toISOString();
    }
    showSnackbar("Invoice sent successfully", "success");
  } catch (error) {
    console.error("Error sending invoice:", error);
    showSnackbar("Error sending invoice", "error");
  } finally {
    generatingInvoice.value = false;
  }
};

const openInvoiceDialog = async () => {
  if (!bookingId.value) return;

  loadingInvoice.value = true;
  try {
    // Call the backend to generate invoice
    const result = await BookingService.createInvoice(
      parseInt(bookingId.value)
    );

    // Update the current booking data
    if (currentBooking.value) {
      currentBooking.value.invoice_created = true;
      currentBooking.value.invoice_id = result.invoice_id;
    }

    showSnackbar("Invoice created successfully", "success");
  } catch (error) {
    console.error("Error creating invoice:", error);
    showSnackbar("Error creating invoice", "error");
  } finally {
    loadingInvoice.value = false;
  }
};

const closeInvoiceDialog = () => {
  invoiceDialog.value = false;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const loadInvoiceData = async () => {
  if (!currentBooking.value) return;

  loadingInvoice.value = true;
  try {
    // Load unit prices from individual endpoints
    const [electricityPrices, stayPrices, gasPrices, firewoodPrices] =
      await Promise.all([
        AdminService.getElectricityPrices(),
        AdminService.getStayPrices(),
        AdminService.getGasPrices(),
        AdminService.getFirewoodPrices(),
      ]);

    // Extract current prices (assuming the API returns the most recent prices)
    const currentPrices = {
      stay_per_night: 0,
      electricity_per_kwh: 0,
      gas_per_cubic_meter: 0,
      firewood_per_box: 0,
    };

    // Helper function to find the most recent effective price
    const findCurrentPrice = (prices: any[]) => {
      const now = new Date();
      let currentPrice = 0;
      let mostRecentDate = new Date(0);

      for (const price of prices) {
        const effectiveFrom = new Date(price.effective_from);
        const effectiveTo = price.effective_to
          ? new Date(price.effective_to)
          : null;

        // Check if this price is currently effective
        if (now >= effectiveFrom && (!effectiveTo || now <= effectiveTo)) {
          // If this price is more recent than our current one, use it
          if (effectiveFrom > mostRecentDate) {
            currentPrice = price.price_per_unit;
            mostRecentDate = effectiveFrom;
          }
        }
      }
      return currentPrice;
    };

    // Process each price type
    currentPrices.stay_per_night = findCurrentPrice(stayPrices);
    currentPrices.electricity_per_kwh = findCurrentPrice(electricityPrices);
    currentPrices.gas_per_cubic_meter = findCurrentPrice(gasPrices);
    currentPrices.firewood_per_box = findCurrentPrice(firewoodPrices);

    // If no prices found, use default values
    if (currentPrices.stay_per_night === 0) {
      console.warn("No stay price found, using default");
      currentPrices.stay_per_night = 50; // Default 50€ per night
    }
    if (currentPrices.electricity_per_kwh === 0) {
      console.warn("No electricity price found, using default");
      currentPrices.electricity_per_kwh = 0.3; // Default 0.30€ per kWh
    }
    if (currentPrices.gas_per_cubic_meter === 0) {
      console.warn("No gas price found, using default");
      currentPrices.gas_per_cubic_meter = 0.8; // Default 0.80€ per m³
    }
    if (currentPrices.firewood_per_box === 0) {
      console.warn("No firewood price found, using default");
      currentPrices.firewood_per_box = 15; // Default 15€ per box
    }

    console.log("Final current prices:", currentPrices);

    unitPrices.value = currentPrices;

    // Calculate invoice
    calculateInvoice();
  } catch (error) {
    console.error("Error loading invoice data:", error);
    showSnackbar("Error loading invoice data", "error");
  } finally {
    loadingInvoice.value = false;
  }
};

const calculateInvoice = () => {
  if (!currentBooking.value) return;

  console.log("Calculating invoice for booking:", currentBooking.value);
  console.log("Unit prices:", unitPrices.value);
  console.log("Guest pays dayrate:", currentBooking.value.guest?.pays_dayrate);
  console.log("Nights count:", nightsCount.value);

  const missing: string[] = [];

  // Calculate accommodation
  const accommodation = currentBooking.value.guest?.pays_dayrate
    ? nightsCount.value * unitPrices.value.stay_per_night
    : 0;

  console.log("Accommodation calculation:", {
    pays_dayrate: currentBooking.value.guest?.pays_dayrate,
    nights: nightsCount.value,
    rate_per_night: unitPrices.value.stay_per_night,
    total: accommodation,
  });

  // Calculate electricity
  let electricity = 0;
  let electricity_usage = 0;
  if (
    currentBooking.value.meter_readings?.electricity_start !== undefined &&
    currentBooking.value.meter_readings?.electricity_end !== undefined
  ) {
    electricity_usage =
      currentBooking.value.meter_readings.electricity_end -
      currentBooking.value.meter_readings.electricity_start;
    electricity = electricity_usage * unitPrices.value.electricity_per_kwh;
    console.log("Electricity calculation:", {
      start: currentBooking.value.meter_readings.electricity_start,
      end: currentBooking.value.meter_readings.electricity_end,
      usage: electricity_usage,
      rate: unitPrices.value.electricity_per_kwh,
      total: electricity,
    });
  } else {
    missing.push("Electricity meter readings");
    console.log("Missing electricity readings");
  }

  // Calculate gas
  let gas = 0;
  let gas_usage = 0;
  if (
    currentBooking.value.meter_readings?.gas_start !== undefined &&
    currentBooking.value.meter_readings?.gas_end !== undefined
  ) {
    gas_usage =
      currentBooking.value.meter_readings.gas_end -
      currentBooking.value.meter_readings.gas_start;
    gas = gas_usage * unitPrices.value.gas_per_cubic_meter;
    console.log("Gas calculation:", {
      start: currentBooking.value.meter_readings.gas_start,
      end: currentBooking.value.meter_readings.gas_end,
      usage: gas_usage,
      rate: unitPrices.value.gas_per_cubic_meter,
      total: gas,
    });
  } else {
    missing.push("Gas meter readings");
    console.log("Missing gas readings");
  }

  // Calculate firewood
  let firewood = 0;
  let firewood_boxes = 0;
  if (currentBooking.value.meter_readings?.firewood_boxes !== undefined) {
    firewood_boxes = currentBooking.value.meter_readings.firewood_boxes;
    firewood = firewood_boxes * unitPrices.value.firewood_per_box;
    console.log("Firewood calculation:", {
      boxes: firewood_boxes,
      rate: unitPrices.value.firewood_per_box,
      total: firewood,
    });
  } else {
    missing.push("Firewood usage");
    console.log("Missing firewood data");
  }

  // Tourist tax
  const tourist_tax = currentBooking.value.kurtaxe_amount || 0;
  console.log("Tourist tax:", tourist_tax);

  // Calculate total
  const total = accommodation + electricity + gas + firewood + tourist_tax;

  console.log("Final invoice calculation:", {
    accommodation,
    electricity,
    gas,
    firewood,
    tourist_tax,
    total,
  });

  invoiceCalculation.value = {
    accommodation,
    electricity,
    electricity_usage,
    gas,
    gas_usage,
    firewood,
    firewood_boxes,
    tourist_tax,
    total,
  };

  missingData.value = missing;
};

const registerReadings = async () => {
  meterReadingsDialog.value = true;
};

const closeMeterReadingsDialog = () => {
  meterReadingsDialog.value = false;
  meterReadingsData.value = {
    electricity_start: undefined,
    electricity_end: undefined,
    gas_start: undefined,
    gas_end: undefined,
    firewood_boxes: undefined,
  };
};

const saveMeterReadings = async () => {
  if (!meterReadingsFormValid.value || !bookingId.value) return;

  registeringMeterReadings.value = true;
  try {
    const result = await MeterService.createOrUpdate(
      parseInt(bookingId.value),
      {
        electricity_start: meterReadingsData.value.electricity_start,
        electricity_end: meterReadingsData.value.electricity_end,
        gas_start: meterReadingsData.value.gas_start,
        gas_end: meterReadingsData.value.gas_end,
        firewood_boxes: meterReadingsData.value.firewood_boxes,
      }
    );

    // Update the current booking data
    if (currentBooking.value) {
      currentBooking.value.meter_readings = result;
    }

    showSnackbar("Meter readings registered successfully", "success");
    closeMeterReadingsDialog();
  } catch (error) {
    console.error("Error registering meter readings:", error);
    showSnackbar("Error registering meter readings", "error");
  } finally {
    registeringMeterReadings.value = false;
  }
};

const registerTouristTax = async () => {
  touristTaxDialog.value = true;
};

const closeTouristTaxDialog = () => {
  touristTaxDialog.value = false;
  touristTaxData.value = {
    amount: 0,
    notes: "",
  };
};

const saveTouristTax = async () => {
  if (!touristTaxFormValid.value || !bookingId.value) return;

  registeringTouristTax.value = true;
  try {
    await BookingService.updateKurtaxe(parseInt(bookingId.value), {
      kurtaxe_amount: touristTaxData.value.amount,
      kurtaxe_notes: touristTaxData.value.notes,
    });

    // Update the current booking data
    if (currentBooking.value) {
      currentBooking.value.kurtaxe_amount = touristTaxData.value.amount;
      currentBooking.value.kurtaxe_notes = touristTaxData.value.notes;
    }

    showSnackbar("Tourist tax registered successfully", "success");
    closeTouristTaxDialog();
  } catch (error) {
    console.error("Error registering tourist tax:", error);
    showSnackbar("Error registering tourist tax", "error");
  } finally {
    registeringTouristTax.value = false;
  }
};

const showSnackbar = (text: string, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Add Guest Dialog Methods
const openAddGuestDialog = () => {
  // Reset form
  newGuest.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    pays_dayrate: true,
  };
  addGuestDialog.value = true;
};

const closeAddGuestDialog = () => {
  addGuestDialog.value = false;
  newGuest.value = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    pays_dayrate: true,
  };
};

const createGuest = async () => {
  if (!guestFormValid.value) return;

  addingGuest.value = true;
  try {
    const guestData = {
      first_name: newGuest.value.first_name,
      last_name: newGuest.value.last_name,
      email: newGuest.value.email,
      password: newGuest.value.password,
      pays_dayrate: newGuest.value.pays_dayrate,
      is_admin: false, // All guests are non-admin by default
    };

    const createdGuest = await GuestService.create(guestData);

    // Refresh the guests list
    await loadGuests();

    // Auto-select the newly created guest
    formData.value.guest_id = createdGuest.id;

    // Close dialog and show success message
    closeAddGuestDialog();
    showSnackbar("Guest created successfully", "success");
  } catch (error) {
    console.error("Error creating guest:", error);
    showSnackbar("Error creating guest", "error");
  } finally {
    addingGuest.value = false;
  }
};

// Watchers
watch(
  () => formData.value.check_in,
  () => {
    // Reset check-out if check-in changes and check-out is before check-in
    if (
      formData.value.check_in &&
      formData.value.check_out &&
      new Date(formData.value.check_out) <= new Date(formData.value.check_in)
    ) {
      formData.value.check_out = "";
    }
  }
);

// Payment Methods
const openPaymentDialog = () => {
  if (!currentBooking.value) return;
  paymentData.value = {
    amount: currentBooking.value.invoice_details?.total_cost || 0,
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "Bank Transfer",
    reference: currentBooking.value.invoice_id || "",
    notes: "",
  };
  paymentDialog.value = true;
};

const closePaymentDialog = () => {
  paymentDialog.value = false;
  paymentData.value = {
    amount: 0,
    payment_date: "",
    payment_method: "",
    reference: "",
    notes: "",
  };
};

const savePayment = async () => {
  if (!paymentFormValid.value || !bookingId.value) return;

  registeringPayment.value = true;
  try {
    const result = await BookingService.createPayment({
      amount: paymentData.value.amount,
      payment_date: paymentData.value.payment_date,
      payment_method: paymentData.value.payment_method,
      reference: paymentData.value.reference,
      notes: paymentData.value.notes,
      booking_id: parseInt(bookingId.value),
    });

    // Add the new payment to the current booking
    if (currentBooking.value) {
      if (!currentBooking.value.payments) {
        currentBooking.value.payments = [];
      }
      currentBooking.value.payments.push(result);
    }

    showSnackbar("Payment registered successfully", "success");
    closePaymentDialog();
  } catch (error) {
    console.error("Error registering payment:", error);
    showSnackbar("Error registering payment", "error");
  } finally {
    registeringPayment.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await loadGuests();
  if (isEdit.value) {
    await loadBooking();
  }
});

// Payment Modal
const paymentDialog = ref(false);
const paymentForm = ref(null);
const paymentFormValid = ref(true);
const paymentData = ref({
  amount: 0,
  payment_date: "",
  payment_method: "",
  reference: "",
  notes: "",
});
const paymentMethods = ["Cash", "Credit Card", "Bank Transfer", "PayPal"];
const registeringPayment = ref(false);
</script>
