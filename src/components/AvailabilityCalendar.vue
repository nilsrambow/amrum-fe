<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2">mdi-calendar-month</v-icon>
      Availability Calendar
    </v-card-title>
    <v-card-text>
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <div class="mt-2">Loading availability...</div>
      </div>

      <div v-else>
        <div class="d-flex align-center mb-4">
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click="previousMonth"
          ></v-btn>
          <div class="text-h6 mx-4">
            {{ currentMonthYear }}
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            @click="nextMonth"
          ></v-btn>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid" :key="currentMonthYear">
          <!-- Day headers -->
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="calendar-header"
          >
            {{ day }}
          </div>

          <!-- Calendar days -->
          <div
            v-for="day in calendarDays"
            :key="`${day.date}-${day.isArrival}-${day.isDeparture}`"
            class="calendar-day"
            :class="getDayClasses(day)"
            :title="`${day.date} - Arrival: ${day.isArrival}, Departure: ${day.isDeparture}`"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
          </div>
        </div>

        <!-- Legend -->
        <div class="d-flex justify-center mt-4 flex-wrap">
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item free"></div>
            <span class="ml-2 text-caption">Free</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item reserved"></div>
            <span class="ml-2 text-caption">Reserved (New)</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item occupied"></div>
            <span class="ml-2 text-caption">Occupied</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item reserved-reserved"></div>
            <span class="ml-2 text-caption">Reserved → Reserved</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item reserved-occupied"></div>
            <span class="ml-2 text-caption">Reserved → Occupied</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item occupied-reserved"></div>
            <span class="ml-2 text-caption">Occupied → Reserved</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item occupied-occupied"></div>
            <span class="ml-2 text-caption">Occupied → Occupied</span>
          </div>
          <div class="d-flex align-center mr-6 mb-2">
            <div class="legend-item diagonal-line"></div>
            <span class="ml-2 text-caption">Guest Change</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  BookingService,
  GuestService,
  type Booking,
  type Guest,
} from "@/services/api";

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  booking?: Booking;
  isArrival: boolean;
  isDeparture: boolean;
  departingBooking?: Booking;
  arrivingBooking?: Booking;
}

const currentDate = ref(new Date());
const bookings = ref<Booking[]>([]);
const guests = ref<Guest[]>([]);
const loading = ref(false);

// Utility function for consistent date string formatting
const formatDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// Utility function to convert API date string to local date string
const apiDateToLocalString = (apiDateString: string): string => {
  const date = new Date(apiDateString);
  return formatDateString(date);
};

/*
 * Date Handling Notes:
 *
 * Current approach: Backend returns date strings (e.g., "2025-07-03"), frontend converts
 * to Date objects and back to strings for comparison. This works but has some overhead.
 *
 * Alternative approaches that could be better:
 * 1. Backend returns ISO date strings with timezone info (e.g., "2025-07-03T00:00:00Z")
 * 2. Backend returns Unix timestamps (numbers)
 * 3. Backend returns structured date objects with year/month/day properties
 *
 * Benefits of structured date objects from backend:
 * - No timezone conversion issues
 * - No Date object creation overhead
 * - More predictable behavior
 * - Better type safety
 * - Easier to work with in different locales
 */

// Computed properties
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get start of calendar (previous month days to fill first week)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: CalendarDay[] = [];

  // Generate 42 days (6 weeks) to ensure we have enough
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dateString = formatDateString(date);

    // Find all bookings for this date
    const bookingsForDate = bookings.value.filter((b) => {
      // Convert API date strings to local date strings for comparison
      const checkInString = apiDateToLocalString(b.check_in);
      const checkOutString = apiDateToLocalString(b.check_out);
      return dateString >= checkInString && dateString <= checkOutString;
    });

    // Determine if this is an arrival or departure day across all bookings
    let isArrival = false;
    let isDeparture = false;
    let primaryBooking: Booking | undefined;
    let departingBooking: Booking | undefined;
    let arrivingBooking: Booking | undefined;

    for (const booking of bookingsForDate) {
      const checkInString = apiDateToLocalString(booking.check_in);
      const checkOutString = apiDateToLocalString(booking.check_out);

      if (dateString === checkInString) {
        isArrival = true;
        arrivingBooking = booking;
      }
      if (dateString === checkOutString) {
        isDeparture = true;
        departingBooking = booking;
      }

      // Use the first booking as primary for display purposes
      if (!primaryBooking) {
        primaryBooking = booking;
      }
    }

    // Add guest data to bookings if not already present
    const bookingWithGuest = primaryBooking
      ? {
          ...primaryBooking,
          guest:
            primaryBooking.guest ||
            guests.value.find((g) => g.id === primaryBooking!.guest_id),
        }
      : undefined;

    const departingBookingWithGuest = departingBooking
      ? {
          ...departingBooking,
          guest:
            departingBooking.guest ||
            guests.value.find((g) => g.id === departingBooking!.guest_id),
        }
      : undefined;

    const arrivingBookingWithGuest = arrivingBooking
      ? {
          ...arrivingBooking,
          guest:
            arrivingBooking.guest ||
            guests.value.find((g) => g.id === arrivingBooking!.guest_id),
        }
      : undefined;

    // For arrival/departure days, use the departing booking as primary if no primary booking exists
    const finalBooking =
      bookingWithGuest || departingBookingWithGuest || arrivingBookingWithGuest;

    days.push({
      date: dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      booking: finalBooking,
      isArrival,
      isDeparture,
      departingBooking: departingBookingWithGuest,
      arrivingBooking: arrivingBookingWithGuest,
    });
  }

  return days;
});

// Methods
const loadBookings = async () => {
  loading.value = true;
  try {
    bookings.value = await BookingService.getAll();
    guests.value = await GuestService.getAll();
  } catch (error) {
    console.error("Error loading bookings:", error);
  } finally {
    loading.value = false;
  }
};

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const getDayClasses = (day: CalendarDay) => {
  const classes = ["calendar-day"];

  if (!day.isCurrentMonth) {
    classes.push("other-month");
  }

  // Handle arrival/departure days first
  if (day.isArrival && day.isDeparture) {
    // Determine the color combination based on departing and arriving booking statuses
    const departingStatus = day.departingBooking?.status;
    const arrivingStatus = day.arrivingBooking?.status;

    if (departingStatus === "new" && arrivingStatus === "new") {
      classes.push("reserved-reserved");
    } else if (departingStatus === "new" && arrivingStatus !== "new") {
      classes.push("reserved-occupied");
    } else if (departingStatus !== "new" && arrivingStatus === "new") {
      classes.push("occupied-reserved");
    } else {
      classes.push("occupied-occupied");
    }
  } else if (day.booking) {
    // Handle regular booking days
    if (day.booking.status === "new") {
      classes.push("reserved");
    } else {
      classes.push("occupied");
    }

    // Add arrival/departure classes
    if (day.isArrival) {
      classes.push("arrival-day");
    } else if (day.isDeparture) {
      classes.push("departure-day");
    }
  } else {
    classes.push("free");
  }

  return classes;
};

// Lifecycle
onMounted(() => {
  loadBookings();
});
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.calendar-header {
  background-color: #f5f5f5;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #666;
}

.calendar-day {
  background-color: white;
  min-height: 80px;
  padding: 8px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.other-month {
  background-color: #fafafa;
  color: #ccc;
}

.calendar-day.free {
  background-color: white;
}

.calendar-day.reserved {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.calendar-day.occupied {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
}

.calendar-day.reserved.arrival-day {
  background: linear-gradient(
    135deg,
    white 0%,
    white 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
  position: relative;
}

.calendar-day.reserved.arrival-day::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #1976d2 49%,
    #1976d2 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.calendar-day.reserved.departure-day {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    white 50%,
    white 100%
  );
}

.calendar-day.occupied.arrival-day {
  background: linear-gradient(
    135deg,
    white 0%,
    white 49%,
    #ffebee 50%,
    #ffebee 100%
  );
  position: relative;
}

.calendar-day.occupied.arrival-day::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #d32f2f 49%,
    #d32f2f 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.calendar-day.occupied.departure-day {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    white 50%,
    white 100%
  );
}

.calendar-day.reserved.arrival-departure-day {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    white 50%,
    white 100%
  );
}

.calendar-day.occupied.arrival-departure-day {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    white 50%,
    white 100%
  );
}

.calendar-day.reserved.reserved-reserved {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
}

.calendar-day.reserved.reserved-occupied {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #ffebee 50%,
    #ffebee 100%
  );
}

.calendar-day.occupied.occupied-reserved {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
}

.calendar-day.occupied.occupied-occupied {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #ffebee 50%,
    #ffebee 100%
  );
}

.calendar-day.reserved-reserved {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
  position: relative;
}

.calendar-day.reserved-reserved::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #1976d2 49%,
    #1976d2 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.calendar-day.reserved-occupied {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #ffebee 50%,
    #ffebee 100%
  );
  position: relative;
}

.calendar-day.reserved-occupied::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #d32f2f 49%,
    #d32f2f 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.calendar-day.occupied-reserved {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
  position: relative;
}

.calendar-day.occupied-reserved::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #1976d2 49%,
    #1976d2 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.calendar-day.occupied-occupied {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #ffebee 50%,
    #ffebee 100%
  );
  position: relative;
}

.calendar-day.occupied-occupied::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #d32f2f 49%,
    #d32f2f 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}

.day-number {
  font-weight: 500;
  font-size: 0.875rem;
}

.legend-item {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.legend-item.free {
  background-color: white;
}

.legend-item.reserved {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.legend-item.occupied {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
}

.legend-item.arrival-departure {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    white 50%,
    white 100%
  );
  border-left: 4px solid #f44336;
}

.legend-item.reserved-reserved {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
  border-left: 4px solid #2196f3;
}

.legend-item.reserved-occupied {
  background: linear-gradient(
    135deg,
    #e3f2fd 0%,
    #e3f2fd 49%,
    #ffebee 50%,
    #ffebee 100%
  );
  border-left: 4px solid #2196f3;
}

.legend-item.occupied-reserved {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #e3f2fd 50%,
    #e3f2fd 100%
  );
  border-left: 4px solid #f44336;
}

.legend-item.occupied-occupied {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    #ffebee 50%,
    #ffebee 100%
  );
  border-left: 4px solid #f44336;
}

.legend-item.diagonal-line {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    white 50%,
    white 100%
  );
  border-left: 4px solid #f44336;
  position: relative;
}

.legend-item.diagonal-line::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 48%,
    #d32f2f 49%,
    #d32f2f 51%,
    transparent 52%,
    transparent 100%
  );
  pointer-events: none;
}
</style>
