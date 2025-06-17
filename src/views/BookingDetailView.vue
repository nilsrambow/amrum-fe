<template>
  <div v-if="booking">
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
            <h1 class="text-h4 font-weight-light">Booking #{{ booking.id }}</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{ formatDateRange(booking.check_in, booking.check_out) }}
            </p>
          </div>
          <div>
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              @click="router.push(`/bookings/${booking.id}/edit`)"
              class="mr-2"
            >
              Edit Booking
            </v-btn>
            <v-btn
              v-if="booking.status === 'new'"
              color="success"
              prepend-icon="mdi-check"
              @click="confirmBooking"
              class="mr-2"
            >
              Confirm
            </v-btn>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  color="info"
                  prepend-icon="mdi-dots-vertical"
                  variant="outlined"
                >
                  Actions
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="sendKurkartenEmail">
                  <v-list-item-title>Send Kurkarten Email</v-list-item-title>
                </v-list-item>
                <v-list-item @click="sendPreArrivalEmail">
                  <v-list-item-title>Send Pre-arrival Email</v-list-item-title>
                </v-list-item>
                <v-list-item @click="generateInvoice">
                  <v-list-item-title>Generate Invoice</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="deleteBooking" class="text-error">
                  <v-list-item-title>Delete Booking</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Booking-Specific Alerts -->
    <v-row class="mb-6">
      <v-col cols="12">
        <BookingAlerts :booking-id="booking.id" />
      </v-col>
    </v-row>

    <!-- Status Cards -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3">
        <v-card
          class="text-center pa-4"
          :color="getStatusColor(booking.status)"
          dark
        >
          <v-icon size="32" class="mb-2">{{
            getStatusIcon(booking.status)
          }}</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ getStatusText(booking.status) }}
          </div>
          <div class="text-caption">Status</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card class="text-center pa-4" color="purple" dark>
          <v-icon size="32" class="mb-2">mdi-currency-eur</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ formatCurrency(booking.kurtaxe_amount || 0) }}
          </div>
          <div class="text-caption">Tourist Tax</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card
          class="text-center pa-4"
          :color="booking.meter_readings ? 'success' : 'grey'"
          dark
        >
          <v-icon size="32" class="mb-2">{{
            booking.meter_readings ? "mdi-gauge" : "mdi-gauge-empty"
          }}</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ booking.meter_readings ? "Recorded" : "Pending" }}
          </div>
          <div class="text-caption">Meter Readings</div>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card
          class="text-center pa-4"
          :color="booking.invoice_sent ? 'success' : 'warning'"
          dark
        >
          <v-icon size="32" class="mb-2">{{
            booking.invoice_sent
              ? "mdi-file-document-check"
              : "mdi-file-document-outline"
          }}</v-icon>
          <div class="text-h6 font-weight-bold">
            {{ booking.invoice_sent ? "Sent" : "Pending" }}
          </div>
          <div class="text-caption">Invoice</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row>
      <!-- Booking & Guest Information -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Booking Details
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar-arrow-right</v-icon>
                    </template>
                    <v-list-item-title>Check-in</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(booking.check_in)
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar-arrow-left</v-icon>
                    </template>
                    <v-list-item-title>Check-out</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(booking.check_out)
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar-plus</v-icon>
                    </template>
                    <v-list-item-title>Created</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDateTime(booking.created_at)
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar-clock</v-icon>
                    </template>
                    <v-list-item-title>Duration</v-list-item-title>
                    <v-list-item-subtitle
                      >{{ nightsCount }}
                      {{ nightsCount === 1 ? "night" : "nights" }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" sm="6">
                <v-list density="compact">
                  <v-list-item v-if="booking.kurtaxe_amount">
                    <template #prepend>
                      <v-icon>mdi-currency-eur</v-icon>
                    </template>
                    <v-list-item-title>Tourist Tax</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatCurrency(booking.kurtaxe_amount)
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="booking.kurtaxe_notes">
                    <template #prepend>
                      <v-icon>mdi-note-text</v-icon>
                    </template>
                    <v-list-item-title>Tax Notes</v-list-item-title>
                    <v-list-item-subtitle>{{
                      booking.kurtaxe_notes
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="booking.invoice_id">
                    <template #prepend>
                      <v-icon>mdi-file-document</v-icon>
                    </template>
                    <v-list-item-title>Invoice ID</v-list-item-title>
                    <v-list-item-subtitle>{{
                      booking.invoice_id
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Guest Information -->
        <v-card class="mb-6" v-if="booking.guest">
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Guest Information
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" size="64" class="mr-4">
                <span class="text-h5 text-white">
                  {{ booking.guest.first_name[0]
                  }}{{ booking.guest.last_name[0] }}
                </span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h6">
                  {{ booking.guest.first_name }} {{ booking.guest.last_name }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ booking.guest.email }}
                </div>
                <v-chip
                  :color="booking.guest.pays_dayrate ? 'primary' : 'success'"
                  size="small"
                >
                  {{ booking.guest.pays_dayrate ? "Pays per day" : "Free" }}
                </v-chip>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-account-details"
                  @click="router.push(`/guests/${booking.guest.id}`)"
                >
                  View Profile
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-account-edit"
                  @click="router.push(`/guests/${booking.guest.id}/edit`)"
                >
                  Edit Guest
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Invoice Details -->
        <v-card v-if="booking.invoice_created" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-file-document</v-icon>
            Invoice Details
            <v-chip
              :color="booking.invoice_sent ? 'success' : 'warning'"
              size="small"
              class="ml-2"
            >
              {{ booking.invoice_sent ? "Sent" : "Created" }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="font-weight-medium">Invoice ID:</span>
                <span class="text-primary">{{ booking.invoice_id }}</span>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="font-weight-medium">Created:</span>
                <span>{{
                  formatDateTime(
                    booking.invoice_created_date || booking.modified_at
                  )
                }}</span>
              </div>
              <div
                v-if="booking.invoice_sent"
                class="d-flex justify-space-between align-center"
              >
                <span class="font-weight-medium">Sent:</span>
                <span>{{ formatDateTime(booking.invoice_sent_date) }}</span>
              </div>
            </div>

            <!-- Invoice Breakdown -->
            <v-card v-if="booking.invoice_details" class="mt-4">
              <v-card-title class="text-h6"> Invoice Breakdown </v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Accommodation</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ booking.invoice_details.num_days || 0 }} nights ×
                      {{
                        formatCurrency(booking.invoice_details.stay_rate || 0)
                      }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{
                          formatCurrency(
                            booking.invoice_details.accommodation_cost || 0
                          )
                        }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Electricity</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        booking.invoice_details.consumption?.electricity_kwh ||
                        0
                      }}
                      kWh ×
                      {{
                        formatCurrency(booking.invoice_details.elec_rate || 0)
                      }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{
                          formatCurrency(
                            booking.invoice_details.electricity_cost || 0
                          )
                        }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Gas</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        booking.invoice_details.consumption?.gas_cubic_meters ||
                        0
                      }}
                      m³ ×
                      {{
                        formatCurrency(booking.invoice_details.gas_rate || 0)
                      }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{
                          formatCurrency(booking.invoice_details.gas_cost || 0)
                        }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Firewood</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        booking.invoice_details.consumption?.firewood_boxes || 0
                      }}
                      boxes ×
                      {{
                        formatCurrency(
                          booking.invoice_details.firewood_rate || 0
                        )
                      }}
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{
                          formatCurrency(
                            booking.invoice_details.firewood_cost || 0
                          )
                        }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>Tourist Tax</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ booking.invoice_details.num_days || 0 }} days
                    </v-list-item-subtitle>
                    <template #append>
                      <span class="font-weight-medium">
                        {{
                          formatCurrency(
                            booking.invoice_details.kurtaxe_cost || 0
                          )
                        }}
                      </span>
                    </template>
                  </v-list-item>

                  <v-divider class="my-2"></v-divider>

                  <v-list-item>
                    <v-list-item-title class="text-h6">Total</v-list-item-title>
                    <template #append>
                      <span class="text-h6 font-weight-bold">
                        {{
                          formatCurrency(
                            booking.invoice_details.total_cost || 0
                          )
                        }}
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>

        <!-- Communication History -->
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-email-multiple</v-icon>
            Communication History
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact" align="start">
              <v-timeline-item
                v-if="booking.kurkarten_email_sent"
                icon="mdi-email"
                color="info"
                size="small"
              >
                <v-card>
                  <v-card-title class="text-subtitle-1"
                    >Kurkarten Email Sent</v-card-title
                  >
                  <v-card-subtitle v-if="booking.kurkarten_email_sent_date">
                    {{ formatDateTime(booking.kurkarten_email_sent_date) }}
                  </v-card-subtitle>
                </v-card>
              </v-timeline-item>

              <v-timeline-item
                v-if="booking.pre_arrival_email_sent"
                icon="mdi-email-arrow-right"
                color="warning"
                size="small"
              >
                <v-card>
                  <v-card-title class="text-subtitle-1"
                    >Pre-arrival Email Sent</v-card-title
                  >
                  <v-card-subtitle v-if="booking.pre_arrival_email_sent_date">
                    {{ formatDateTime(booking.pre_arrival_email_sent_date) }}
                  </v-card-subtitle>
                </v-card>
              </v-timeline-item>

              <v-timeline-item
                v-if="booking.invoice_sent"
                icon="mdi-file-document-arrow-right"
                color="success"
                size="small"
              >
                <v-card>
                  <v-card-title class="text-subtitle-1"
                    >Invoice Sent</v-card-title
                  >
                  <v-card-subtitle v-if="booking.invoice_sent_date">
                    {{ formatDateTime(booking.invoice_sent_date) }}
                  </v-card-subtitle>
                </v-card>
              </v-timeline-item>

              <v-timeline-item
                v-if="
                  !booking.kurkarten_email_sent &&
                  !booking.pre_arrival_email_sent &&
                  !booking.invoice_sent
                "
                icon="mdi-email-off"
                color="grey"
                size="small"
              >
                <v-card>
                  <v-card-title class="text-subtitle-1"
                    >No communications sent yet</v-card-title
                  >
                  <v-card-subtitle
                    >Use the actions menu to send emails</v-card-subtitle
                  >
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Side Panel -->
      <v-col cols="12" md="4">
        <!-- Quick Actions -->
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-btn
              block
              :color="booking.status === 'confirmed' ? 'grey' : 'success'"
              :variant="
                booking.status === 'confirmed' ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-check"
              @click="confirmBooking"
            >
              {{
                booking.status === "confirmed"
                  ? "Booking Confirmed"
                  : "Confirm Booking"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.kurkarten_email_sent ? 'grey' : 'info'"
              :variant="booking.kurkarten_email_sent ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-email"
              @click="sendKurkartenEmail"
            >
              {{
                booking.kurkarten_email_sent
                  ? "Kurkarten Email Sent"
                  : "Send Kurkarten Email"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.kurtaxe_amount ? 'grey' : 'teal'"
              :variant="booking.kurtaxe_amount ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-currency-eur"
              @click="registerTouristTax"
            >
              {{
                booking.kurtaxe_amount
                  ? "Tourist Tax Registered"
                  : "Register Tourist Tax"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.pre_arrival_email_sent ? 'grey' : 'warning'"
              :variant="
                booking.pre_arrival_email_sent ? 'outlined' : 'elevated'
              "
              class="mb-2"
              prepend-icon="mdi-email-arrow-right"
              @click="sendPreArrivalEmail"
            >
              {{
                booking.pre_arrival_email_sent
                  ? "Pre-arrival Email Sent"
                  : "Send Pre-arrival Email"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.meter_readings ? 'grey' : 'orange'"
              :variant="booking.meter_readings ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-gauge"
              @click="registerReadings"
            >
              {{
                booking.meter_readings
                  ? "Readings Registered"
                  : "Register Readings"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.invoice_created ? 'grey' : 'purple'"
              :variant="booking.invoice_created ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-file-document-plus"
              @click="openInvoiceDialog"
            >
              {{
                booking.invoice_created ? "Invoice Created" : "Create Invoice"
              }}
            </v-btn>

            <v-btn
              block
              :color="booking.invoice_sent ? 'grey' : 'deep-purple'"
              :variant="booking.invoice_sent ? 'outlined' : 'elevated'"
              class="mb-2"
              prepend-icon="mdi-file-document-arrow-right"
              @click="sendInvoice"
              :disabled="!booking.invoice_created"
            >
              {{ booking.invoice_sent ? "Invoice Sent" : "Send Invoice" }}
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

        <!-- Meter Readings -->
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-gauge</v-icon>
            Meter Readings
          </v-card-title>
          <v-card-text>
            <div v-if="booking.meter_readings">
              <v-list density="compact">
                <v-list-item
                  v-if="booking.meter_readings.electricity_start !== null"
                >
                  <v-list-item-title>Electricity</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ booking.meter_readings.electricity_start }} -
                    {{ booking.meter_readings.electricity_end || "TBD" }} kWh
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="booking.meter_readings.gas_start !== null">
                  <v-list-item-title>Gas</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ booking.meter_readings.gas_start }} -
                    {{ booking.meter_readings.gas_end || "TBD" }} m³
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="booking.meter_readings.firewood_boxes">
                  <v-list-item-title>Firewood</v-list-item-title>
                  <v-list-item-subtitle
                    >{{
                      booking.meter_readings.firewood_boxes
                    }}
                    boxes</v-list-item-subtitle
                  >
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-center text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-gauge-empty</v-icon>
              <div>No meter readings recorded</div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Payment Summary -->
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-cash-multiple</v-icon>
            Payments
          </v-card-title>
          <v-card-text>
            <div v-if="booking.payments && booking.payments.length > 0">
              <v-list density="compact">
                <v-list-item
                  v-for="payment in booking.payments"
                  :key="payment.id"
                >
                  <template #prepend>
                    <v-icon color="success">mdi-cash</v-icon>
                  </template>
                  <v-list-item-title>{{
                    formatCurrency(payment.amount)
                  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(payment.payment_date) }}
                    <span v-if="payment.payment_method">
                      • {{ payment.payment_method }}</span
                    >
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex justify-space-between font-weight-bold">
                <span>Total Paid:</span>
                <span>{{ formatCurrency(totalPaid) }}</span>
              </div>
            </div>
            <div v-else class="text-center text-medium-emphasis">
              <v-icon size="48" class="mb-2">mdi-cash-off</v-icon>
              <div>No payments recorded</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>

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
  </div>

  <!-- Loading State -->
  <div v-else class="text-center pa-6">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    ></v-progress-circular>
    <div class="mt-4">Loading booking details...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BookingService,
  GuestService,
  MeterService,
  AdminService,
  type Booking,
  type Guest,
  type MeterReading,
} from "@/services/api";
import BookingAlerts from "@/components/BookingAlerts.vue";

const router = useRouter();
const route = useRoute();

// Props
const bookingId = computed(() => parseInt(route.params.id as string));

// Reactive data
const booking = ref<Booking | null>(null);
const loading = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");
const touristTaxDialog = ref(false);
const touristTaxForm = ref(null);
const touristTaxFormValid = ref(true);
const touristTaxData = ref({
  amount: 0,
  notes: "",
});
const registeringTouristTax = ref(false);
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

// Validation rules
const amountRules = [
  (v: any) => !!v || "Amount is required",
  (v: any) => v >= 0 || "Amount must be positive",
  (v: any) => !isNaN(v) || "Amount must be a valid number",
];
const numberRules = [
  (v: any) => !!v || "Reading is required",
  (v: any) => v >= 0 || "Reading must be positive",
  (v: any) => !isNaN(v) || "Reading must be a valid number",
];

// Computed properties
const nightsCount = computed(() => {
  if (!booking.value) return 0;
  const start = new Date(booking.value.check_in);
  const end = new Date(booking.value.check_out);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const totalPaid = computed(() => {
  if (!booking.value?.payments) return 0;
  return booking.value.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
});

// Methods
const loadBookingDetails = async () => {
  loading.value = true;
  try {
    booking.value = await BookingService.getById(bookingId.value);

    // Automatically load guest data since guest is mandatory for bookings
    if (booking.value && !booking.value.guest) {
      try {
        const guest = await GuestService.getById(booking.value.guest_id);
        booking.value.guest = guest;
      } catch (guestError) {
        console.warn("Failed to load guest data:", guestError);
        // Don't fail the entire booking load if guest data fails
      }
    }
  } catch (error: any) {
    console.error("Error loading booking details:", error);
    let errorMessage = "Error loading booking details";

    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "Booking not found";
      } else if (error.response.status === 0) {
        errorMessage =
          "Cannot connect to server. Please check if the backend is running.";
      } else {
        errorMessage = `Server error (${error.response.status}): ${
          error.response.data?.message || error.response.statusText
        }`;
      }
    } else if (error.request) {
      errorMessage =
        "No response from server. Please check your network connection.";
    } else {
      errorMessage = `Error: ${error.message}`;
    }

    showSnackbar(errorMessage, "error");
    router.push("/bookings");
  } finally {
    loading.value = false;
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

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateRange = (checkIn: string, checkOut: string) => {
  const start = formatDate(checkIn);
  const end = formatDate(checkOut);
  return `${start} - ${end}`;
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

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    new: "mdi-calendar-plus",
    confirmed: "mdi-calendar-check",
    kurkarten_requested: "mdi-card-account-details",
    ready_for_arrival: "mdi-calendar-clock",
    arriving: "mdi-car",
    on_site: "mdi-home",
    departing: "mdi-car-side",
    departed_readings_due: "mdi-gauge-empty",
  };
  return iconMap[status] || "mdi-help-circle";
};

const confirmBooking = async () => {
  if (!booking.value) return;

  try {
    await BookingService.confirm(booking.value.id);
    booking.value.status = "confirmed";
    showSnackbar("Booking confirmed successfully", "success");
  } catch (error) {
    console.error("Error confirming booking:", error);
    showSnackbar("Error confirming booking", "error");
  }
};

const sendKurkartenEmail = async () => {
  if (!booking.value) return;

  try {
    await BookingService.sendKurkartenEmail(booking.value.id);
    booking.value.kurkarten_email_sent = true;
    booking.value.kurkarten_email_sent_date = new Date().toISOString();
    showSnackbar("Kurkarten email sent successfully", "success");
  } catch (error) {
    console.error("Error sending kurkarten email:", error);
    showSnackbar("Error sending kurkarten email", "error");
  }
};

const sendPreArrivalEmail = async () => {
  if (!booking.value) return;

  try {
    await BookingService.sendPreArrivalEmail(booking.value.id);
    booking.value.pre_arrival_email_sent = true;
    booking.value.pre_arrival_email_sent_date = new Date().toISOString();
    showSnackbar("Pre-arrival email sent successfully", "success");
  } catch (error) {
    console.error("Error sending pre-arrival email:", error);
    showSnackbar("Error sending pre-arrival email", "error");
  }
};

const createInvoice = async () => {
  if (!booking.value) return;

  try {
    const result = await BookingService.createInvoice(booking.value.id);
    booking.value.invoice_created = true;
    booking.value.invoice_id = result.invoice_id;
    showSnackbar("Invoice created successfully", "success");
  } catch (error) {
    console.error("Error creating invoice:", error);
    showSnackbar("Error creating invoice", "error");
  }
};

const sendInvoice = async () => {
  if (!booking.value) return;

  try {
    await BookingService.sendInvoice(booking.value.id);
    booking.value.invoice_sent = true;
    booking.value.invoice_sent_date = new Date().toISOString();
    showSnackbar("Invoice sent successfully", "success");
  } catch (error) {
    console.error("Error sending invoice:", error);
    showSnackbar("Error sending invoice", "error");
  }
};

const closeInvoiceDialog = () => {
  // Implementation needed
};

const deleteBooking = async () => {
  if (!booking.value) return;

  if (confirm(`Are you sure you want to delete this booking?`)) {
    try {
      // TODO: Implement delete in BookingService
      // await BookingService.delete(booking.value.id);

      showSnackbar("Booking deleted successfully", "success");
      router.push("/bookings");
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

const registerReadings = () => {
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
  if (!booking.value) return;

  registeringMeterReadings.value = true;
  try {
    const result = await MeterService.createOrUpdate(booking.value.id, {
      electricity_start: meterReadingsData.value.electricity_start,
      electricity_end: meterReadingsData.value.electricity_end,
      gas_start: meterReadingsData.value.gas_start,
      gas_end: meterReadingsData.value.gas_end,
      firewood_boxes: meterReadingsData.value.firewood_boxes,
    });

    // Update the booking data locally with the result from the API
    booking.value.meter_readings = result;

    showSnackbar("Meter readings registered successfully", "success");
    closeMeterReadingsDialog();
  } catch (error) {
    console.error("Error registering meter readings:", error);
    showSnackbar("Error registering meter readings", "error");
  } finally {
    registeringMeterReadings.value = false;
  }
};

const registerTouristTax = () => {
  touristTaxDialog.value = true;
};

const closeTouristTaxDialog = () => {
  touristTaxDialog.value = false;
};

const saveTouristTax = async () => {
  if (!booking.value) return;

  registeringTouristTax.value = true;
  try {
    await BookingService.updateKurtaxe(booking.value.id, {
      kurtaxe_amount: touristTaxData.value.amount,
      kurtaxe_notes: touristTaxData.value.notes,
    });
    booking.value.kurtaxe_amount = touristTaxData.value.amount;
    booking.value.kurtaxe_notes = touristTaxData.value.notes;
    showSnackbar("Tourist tax registered successfully", "success");
    closeTouristTaxDialog();
  } catch (error) {
    console.error("Error registering tourist tax:", error);
    showSnackbar("Error registering tourist tax", "error");
  } finally {
    registeringTouristTax.value = false;
  }
};

const openInvoiceDialog = async () => {
  if (!booking.value) return;

  try {
    // Call the backend to generate invoice
    const result = await BookingService.createInvoice(booking.value.id);

    // Update the booking data
    booking.value.invoice_created = true;
    booking.value.invoice_id = result.invoice_id;

    showSnackbar("Invoice created successfully", "success");
  } catch (error) {
    console.error("Error creating invoice:", error);
    showSnackbar("Error creating invoice", "error");
  }
};

const openPaymentDialog = () => {
  if (!booking.value) return;
  paymentData.value = {
    amount: booking.value.invoice_details?.total_cost || 0,
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "Bank Transfer",
    reference: booking.value.invoice_id || "",
    notes: "",
  };
  paymentDialog.value = true;
};

const closePaymentDialog = () => {
  paymentDialog.value = false;
};

const savePayment = async () => {
  if (!booking.value) return;

  registeringPayment.value = true;
  try {
    const result = await BookingService.createPayment({
      amount: paymentData.value.amount,
      payment_date: paymentData.value.payment_date,
      payment_method: paymentData.value.payment_method,
      reference: paymentData.value.reference,
      notes: paymentData.value.notes,
      booking_id: booking.value.id,
    });

    // Add the new payment to the existing payments array
    if (!booking.value.payments) {
      booking.value.payments = [];
    }
    booking.value.payments.push(result);

    // Reset the form
    paymentData.value = {
      amount: 0,
      payment_date: "",
      payment_method: "",
      reference: "",
      notes: "",
    };

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
onMounted(() => {
  loadBookingDetails();
});
</script>
