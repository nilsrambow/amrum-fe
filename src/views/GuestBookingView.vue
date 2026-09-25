<template>
  <div>
    <!-- Simple Header for Guest View -->
    <div
      class="guest-header pa-4 bg-primary text-white"
      v-if="!loading && !error"
    >
      <div class="d-flex align-center">
        <v-icon size="32" class="mr-3">mdi-home-variant</v-icon>
        <div>
          <div class="text-h6 font-weight-bold">Amrum Property</div>
          <div class="text-caption">Gästeportal</div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <div class="mt-4 text-h6">Deine Buchung wird geladen ...</div>
    </div>

    <div v-else-if="error" class="text-center pa-8">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h5 mb-2">Buchung nicht gefunden</div>
      <div class="text-body-1 mb-2">Der Link ist ungültig oder abgelaufen.</div>
      <div class="text-body-2 text-medium-emphasis">
        Bei Fragen melde Dich gerne bei uns:
        <a href="mailto:hausb@mailbox.org">hausb@mailbox.org</a>
      </div>
    </div>

    <div v-else-if="booking" class="max-width-800 mx-auto pa-4">
      <!-- Header -->
      <v-card class="mb-6">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-home</v-icon>
          <div>
            <div class="text-h5">Deine Buchungsdetails</div>
            <div class="text-subtitle-1 text-medium-emphasis">
              {{ formatDate(booking.check_in) }} –
              {{ formatDate(booking.check_out) }}
            </div>
          </div>
        </v-card-title>
      </v-card>

      <!-- Booking Information -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-calendar</v-icon>
          Buchungsinformationen
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Check-in</div>
              <div class="text-h6">{{ formatDate(booking.check_in) }}</div>
              <div class="text-body-2">ab 13:00 Uhr</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">Check-out</div>
              <div class="text-h6">{{ formatDate(booking.check_out) }}</div>
              <div class="text-body-2">bis 11:00 Uhr</div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 text-medium-emphasis">
                Anzahl der Nächte
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
              Gäste-Informationen
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">Name</div>
                <div class="text-body-1">{{ booking.guest_name }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">E-Mail</div>
                <div class="text-body-1">{{ booking.guest_email }}</div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" v-if="hasKurtaxe"></v-divider>

          <div v-if="hasKurtaxe">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Kurtaxe</div>
            <v-row>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-medium-emphasis">Betrag</div>
                <div class="text-body-1">
                  {{ formatCurrency(booking.kurtaxe_amount ?? 0) }}
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="booking.kurtaxe_notes">
                <div class="text-subtitle-2 text-medium-emphasis">Hinweise</div>
                <div class="text-body-1">{{ booking.kurtaxe_notes }}</div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Arrival -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-map-marker</v-icon>
          Anreise
        </v-card-title>
        <v-card-text class="text-body-1">
          <div class="mb-4">
            <strong>Adresse:</strong> Tanenwai 4, 25946 Nebel, Amrum
          </div>

          <div class="text-subtitle-1 font-weight-bold mb-1">Mit der Fähre</div>
          <p class="mb-4">
            Fähren verkehren ab Dagebüll (WDR), die Überfahrt dauert etwa 90
            Minuten. Aktuelle Fahrpläne findest Du unter
            <a href="https://www.faehre.de" target="_blank" rel="noopener"
              >faehre.de</a
            >. Ab dem Fähranleger Wittdün kannst Du den Bus nach
            Nebel/Westerheide nehmen oder Dir ein Taxi rufen.
          </p>

          <div class="text-subtitle-1 font-weight-bold mb-1">Mit dem Auto</div>
          <p>
            Mit dem Auto fährst Du die Inselstraße am Leuchtturm und an Süddorf
            vorbei. Die Fahrt dauert etwa zehn Minuten bis Tanenwai 4.
          </p>
        </v-card-text>
      </v-card>

      <!-- Access & Wi-Fi -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-key</v-icon>
          Zugang &amp; Schlüssel
        </v-card-title>
        <v-card-text class="text-body-1">
          <p class="mb-2">
            Der Schlüssel hängt im Fahrradschuppen an der Wand direkt hinter der
            Tür an einem Haken. Den Code für das Zahlenschloss am
            Fahrradschuppen solltest Du kennen – falls Du Dir unsicher bist,
            frag gerne nach, dann sagen wir ihn Dir.
          </p>
          <p>
            Bitte hänge den Schlüssel bei Deiner Abreise wieder in den Schuppen
            und verschließe die Tür mit dem Zahlenschloss.
          </p>
        </v-card-text>
      </v-card>

      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-wifi</v-icon>
          WLAN
        </v-card-title>
        <v-card-text class="text-body-1">
          Im Haus beim Telefon hängt ein QR-Code zum Anmelden im WLAN. Dafür ist
          kein Passwort erforderlich.
        </v-card-text>
      </v-card>

      <!-- House rules -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-clipboard-list</v-icon>
          Hausordnung
        </v-card-title>
        <v-card-text class="text-body-1">
          <ul class="pl-4">
            <li>Rauchen im Haus ist nicht gestattet.</li>
            <li>Haustiere sind ohne vorherige Absprache nicht erlaubt.</li>
            <li>Bitte vermeide Lärm nach 22:00 Uhr.</li>
            <li>
              Kein offenes Feuer im Haus. Der Kamin darf nur mit dem
              bereitgestellten Holz genutzt werden (Kaminholzkisten – bitte
              trage den Verbrauch in das Zählerstandsformular weiter unten ein).
            </li>
            <li>
              Bitte hinterlasse das Haus in einem ordentlichen und sauberen
              Zustand. Dazu gehört die Reinigung des gesamten Wohnbereichs
              (Saugen und Wischen von Wohnzimmer und Schlafräumen), der Toilette
              und des Duschbads. Es gibt keine weitere Reinigung, bevor die
              nächsten Gäste kommen.
            </li>
          </ul>
        </v-card-text>
      </v-card>

      <!-- Waste -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-delete</v-icon>
          Informationen zur Müllentsorgung
        </v-card-title>
        <v-card-text class="text-body-1">
          <v-alert
            v-if="wasteReminders && wasteReminders.length > 0"
            type="warning"
            variant="tonal"
            icon="mdi-delete-alert"
            class="mb-4"
          >
            <div class="text-subtitle-1 font-weight-bold mb-2">
              Tonnen rausstellen
            </div>
            <ul class="pl-4">
              <li v-for="reminder in wasteReminders" :key="reminder.key">
                <strong>{{ reminder.when }}:</strong>
                {{ reminder.label }} rausstellen (Abholung am
                {{ reminder.pickup }})
              </li>
            </ul>
          </v-alert>
          <v-alert
            v-else-if="wasteReminders"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            Während Deines Aufenthalts steht keine Tonnenleerung an.
          </v-alert>

          <v-alert type="info" variant="tonal" class="mb-4">
            In der Innentür des Schranks im Wohnzimmer befindet sich eine
            Übersicht über die Müllabfuhrtermine. Bitte achte darauf, wann
            welche Tonne geleert wird, und stelle sie am Vorabend an die Straße.
          </v-alert>

          <strong>Mülltrennung:</strong>
          <ul class="mt-2 pl-4">
            <li>
              <strong>Restmüll:</strong> Schwarze/graue Tonne – nicht
              recycelbare Abfälle
            </li>
            <li>
              <strong>Papier &amp; Pappe:</strong> Grüne Tonne – Zeitungen,
              Zeitschriften, Kartons
            </li>
            <li>
              <strong>Plastik &amp; Metall:</strong> Gelbe Tonne –
              Plastikflaschen, Dosen, Metallverpackungen
            </li>
            <li>
              <strong>Kompost:</strong> Kompost-Tonnen – ausschließlich
              Gartenabfälle, <strong>keine Küchenabfälle</strong> (wegen Ratten)
            </li>
          </ul>
        </v-card-text>
      </v-card>

      <!-- Meter Readings -->
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-counter</v-icon>
          Zählerstände
          <v-chip
            v-if="booking.meter_readings"
            color="success"
            size="small"
            class="ml-2"
          >
            Übermittelt
          </v-chip>
        </v-card-title>
        <v-card-text>
          <div v-if="booking.meter_readings" class="text-center pa-4">
            <v-icon color="success" size="48" class="mb-3"
              >mdi-check-circle</v-icon
            >
            <div class="text-h6 mb-2">Zählerstände bereits übermittelt</div>
            <div class="text-body-2 text-medium-emphasis">
              Deine Zählerstände sind bei uns angekommen. Vielen Dank!
            </div>

            <!-- Show submitted readings -->
            <v-card variant="outlined" class="mt-4">
              <v-card-title class="text-h6"
                >Übermittelte Zählerstände</v-card-title
              >
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Strom
                    </div>
                    <div class="text-body-1">
                      Anfang:
                      {{ booking.meter_readings.electricity_start ?? "k. A." }}
                      kWh<br />
                      Ende:
                      {{ booking.meter_readings.electricity_end ?? "k. A." }}
                      kWh
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">Gas</div>
                    <div class="text-body-1">
                      Anfang:
                      {{ booking.meter_readings.gas_start ?? "k. A." }} m³<br />
                      Ende: {{ booking.meter_readings.gas_end ?? "k. A." }} m³
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 text-medium-emphasis">
                      Kaminholz
                    </div>
                    <div class="text-body-1">
                      {{ booking.meter_readings.firewood_boxes ?? 0 }} Kisten
                      verbraucht
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>

          <div v-else>
            <v-alert type="warning" variant="tonal" class="mb-4">
              <div class="text-subtitle-2 mb-2">Wichtiger Hinweis</div>
              <div class="text-body-2">
                Bitte übermittle Deine Zählerstände für Strom, Gas und den
                Kaminholzverbrauch nach Deiner Abreise. Du kannst die Werte nur
                einmal einreichen. Bitte überprüfe daher alle Angaben vor dem
                Absenden auf ihre Richtigkeit.
              </div>
            </v-alert>

            <v-form ref="readingsForm" v-model="readingsFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="readingsData.electricity_start"
                    label="Strom – Stand bei Anreise"
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
                    label="Strom – Stand bei Abreise"
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
                    label="Gas – Stand bei Anreise"
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
                    label="Gas – Stand bei Abreise"
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
                    label="Kaminholz – Verbrauch"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-wood"
                    suffix="Kisten"
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
                Zählerstände absenden
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
          Zahlungen
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
                {{ formatDate(payment.payment_date) }} –
                {{ payment.payment_method || "Zahlungsart unbekannt" }}
              </v-list-item-subtitle>
              <template #append>
                <v-chip size="small" color="success">Bezahlt</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Further information -->
      <v-card class="mt-6">
        <v-card-title>
          <v-icon class="mr-2">mdi-information</v-icon>
          Weitere Informationen
        </v-card-title>
        <v-card-text class="text-body-1">
          Im Zählerschrank findest Du einen schwarzen Ordner, der weitere
          Informationen zum Haus enthält.
        </v-card-text>
      </v-card>

      <div class="text-center text-h6 mt-8 mb-2">
        Wir wünschen Dir einen schönen Aufenthalt auf der schönen Insel Amrum!
      </div>
    </div>

    <!-- Simple Footer for Guest View -->
    <div
      class="guest-footer pa-4 bg-grey-lighten-4 text-center"
      v-if="!loading && !error"
    >
      <div class="text-caption text-medium-emphasis">
        © {{ currentYear }} Amrum Property Management
      </div>
    </div>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="4000">
      {{ snackbarText }}
    </v-snackbar>
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
const submittingReadings = ref(false);
const readingsFormValid = ref(false);
const readingsForm = ref();

const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

const currentYear = new Date().getFullYear();

const readingsData = ref({
  electricity_start: undefined as number | undefined,
  electricity_end: undefined as number | undefined,
  gas_start: undefined as number | undefined,
  gas_end: undefined as number | undefined,
  firewood_boxes: undefined as number | undefined,
});

// Validation rules
const numberRules = [
  (v: any) => (v !== undefined && v !== null && v !== "") || "Pflichtfeld",
  (v: any) =>
    v === undefined ||
    v === null ||
    v === "" ||
    v >= 0 ||
    "Bitte einen Wert ab 0 eingeben",
  (v: any) =>
    v === undefined ||
    v === null ||
    v === "" ||
    !isNaN(v) ||
    "Bitte eine gültige Zahl eingeben",
];

// Computed properties
const nightsCount = computed(() => {
  if (!booking.value) return 0;
  const start = new Date(booking.value.check_in);
  const end = new Date(booking.value.check_out);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// 0 is a valid tourist tax amount, only an empty value means "not entered"
const hasKurtaxe = computed(
  () =>
    booking.value?.kurtaxe_amount !== null &&
    booking.value?.kurtaxe_amount !== undefined
);

// Bins to put out: on the evening before the collection, or before departure
// if the collection is after check-out
const wasteBinLabels: Record<string, string> = {
  restmuell: "Restmüll-Tonne (schwarz/grau)",
  papier: "Grüne Tonne (Papier & Pappe)",
  plastik: "Gelbe Tonne (Plastik & Metall)",
};

// null = no dates known for this stay, [] = no collection during the stay
const wasteReminders = computed(() => {
  if (!booking.value || !booking.value.waste_pickups) return null;
  const checkOut = booking.value.check_out;
  return booking.value.waste_pickups.map((pickup) => ({
    key: `${pickup.date}-${pickup.bin_type}`,
    when:
      pickup.put_out_date < checkOut
        ? `${formatShortDate(pickup.put_out_date)} abends`
        : `Vor Deiner Abreise (${formatShortDate(checkOut)})`,
    label: wasteBinLabels[pickup.bin_type] ?? pickup.bin_type,
    pickup: formatShortDate(pickup.date),
  }));
});

// Methods
const showSnackbar = (text: string, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const loadBooking = async () => {
  loading.value = true;
  error.value = false;

  try {
    booking.value = await BookingService.getGuestBookingByToken(token.value);
  } catch (err: any) {
    console.error("Error loading booking:", err);
    error.value = true;
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

    showSnackbar("Zählerstände erfolgreich übermittelt. Vielen Dank!");
  } catch (err: any) {
    console.error("Error submitting readings:", err);
    showSnackbar(
      "Die Zählerstände konnten nicht übermittelt werden. Bitte versuche es noch einmal.",
      "error"
    );
  } finally {
    submittingReadings.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Internal workflow states are grouped into what is meaningful for a guest
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    new: "Angefragt",
    confirmed: "Bestätigt",
    kurkarten_requested: "Bestätigt",
    ready_for_arrival: "Bestätigt",
    arriving: "Bestätigt",
    on_site: "Vor Ort",
    departing: "Abreise",
    departed_readings_due: "Abgereist",
    departed_invoice_due: "Abgereist",
    departed_payment_due: "Abgereist",
    departed_done: "Abgeschlossen",
  };
  return statusMap[status] || "Unbekannt";
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    new: "warning",
    confirmed: "success",
    kurkarten_requested: "success",
    ready_for_arrival: "success",
    arriving: "success",
    on_site: "success",
    departing: "orange",
    departed_readings_due: "grey",
    departed_invoice_due: "grey",
    departed_payment_due: "grey",
    departed_done: "grey",
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
