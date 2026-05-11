<template>
  <v-container class="availability-container" fluid>
    <h1 class="text-h5 mb-6 text-center">Verfügbarkeit {{ year }}</h1>

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <div class="months-grid">
        <div v-for="month in months" :key="month.index" class="month-card">
          <div class="month-title">{{ month.name }}</div>
          <div class="calendar-grid">
            <div v-for="h in dayHeaders" :key="h" class="cal-header">{{ h }}</div>
            <div
              v-for="(day, i) in month.days"
              :key="i"
              class="cal-day"
              :class="dayClass(day)"
            >
              <span v-if="day">{{ day.d }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="d-flex justify-center flex-wrap mt-6 gap-4">
        <div class="d-flex align-center">
          <div class="legend-swatch free"></div>
          <span class="ml-2 text-caption">Frei</span>
        </div>
        <div class="d-flex align-center">
          <div class="legend-swatch booked"></div>
          <span class="ml-2 text-caption">Belegt</span>
        </div>
        <div class="d-flex align-center">
          <div class="legend-swatch arrival"></div>
          <span class="ml-2 text-caption">Anreise</span>
        </div>
        <div class="d-flex align-center">
          <div class="legend-swatch departure"></div>
          <span class="ml-2 text-caption">Abreise</span>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8000";

interface DateRange {
  start: string;
  end: string;
}

interface CalDay {
  d: number;
  iso: string;
}

interface Month {
  index: number;
  name: string;
  days: (CalDay | null)[];
}

const year = new Date().getFullYear();
const dayHeaders = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const loading = ref(true);
const ranges = ref<DateRange[]>([]);

const monthNames = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

// Build all 12 months with Monday-first grids
const months: Month[] = Array.from({ length: 12 }, (_, mi) => {
  const firstDay = new Date(year, mi, 1);
  const daysInMonth = new Date(year, mi + 1, 0).getDate();
  // 0=Sun…6=Sat → convert to Mon-first offset (0=Mon…6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: (CalDay | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ d, iso: isoDate(year, mi, d) });
  }
  // Pad to full 7-column rows
  while (days.length % 7 !== 0) days.push(null);

  return { index: mi, name: monthNames[mi], days };
});

function dayClass(day: CalDay | null) {
  if (!day) return "cal-day-empty";
  const iso = day.iso;
  let isArrival = false;
  let isDeparture = false;
  let isBooked = false;

  for (const r of ranges.value) {
    if (iso > r.start && iso < r.end) {
      isBooked = true;
    } else if (iso === r.start) {
      isArrival = true;
    } else if (iso === r.end) {
      isDeparture = true;
    }
  }

  if (isArrival && isDeparture) return "cal-day-split";
  if (isArrival) return "cal-day-arrival";
  if (isDeparture) return "cal-day-departure";
  if (isBooked) return "cal-day-booked";
  return "cal-day-free";
}

onMounted(async () => {
  try {
    const res = await axios.get<DateRange[]>(`${API_BASE_URL}/availability`);
    ranges.value = res.data;
  } catch (e) {
    console.error("Failed to load availability", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.availability-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 959px) {
  .months-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .months-grid {
    grid-template-columns: 1fr;
  }
}

.month-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
}

.month-title {
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
}

.cal-header {
  background-color: #f5f5f5;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  padding: 4px 2px;
}

.cal-day {
  background-color: white;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  position: relative;
  overflow: hidden;
}

.cal-day-empty {
  background-color: #fafafa;
}

.cal-day-free {
  background-color: white;
}

.cal-day-booked {
  background-color: #ffebee;
  border-left: 3px solid #f44336;
}

.cal-day-arrival {
  background: linear-gradient(135deg, white 0%, white 49%, #ffebee 50%, #ffebee 100%);
  position: relative;
}

.cal-day-arrival::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%, transparent 48%,
    #d32f2f 49%, #d32f2f 51%,
    transparent 52%, transparent 100%
  );
  pointer-events: none;
}

.cal-day-departure {
  background: linear-gradient(135deg, #ffebee 0%, #ffebee 49%, white 50%, white 100%);
}

.cal-day-split {
  background: linear-gradient(135deg, #ffebee 0%, #ffebee 49%, #ffebee 50%, #ffebee 100%);
  position: relative;
}

.cal-day-split::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%, transparent 48%,
    #d32f2f 49%, #d32f2f 51%,
    transparent 52%, transparent 100%
  );
  pointer-events: none;
}

.legend-swatch {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.legend-swatch.free {
  background-color: white;
}

.legend-swatch.booked {
  background-color: #ffebee;
  border-left: 3px solid #f44336;
}

.legend-swatch.arrival {
  background: linear-gradient(135deg, white 0%, white 49%, #ffebee 50%, #ffebee 100%);
}

.legend-swatch.departure {
  background: linear-gradient(135deg, #ffebee 0%, #ffebee 49%, white 50%, white 100%);
}

.gap-4 {
  gap: 16px;
}
</style>
