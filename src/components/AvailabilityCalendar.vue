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
        <div class="d-flex justify-center mt-4">
          <div class="d-flex align-center mr-6">
            <div class="legend-item free"></div>
            <span class="ml-2 text-caption">Free</span>
          </div>
          <div class="d-flex align-center mr-6">
            <div class="legend-item reserved"></div>
            <span class="ml-2 text-caption">Reserved (New)</span>
          </div>
          <div class="d-flex align-center mr-6">
            <div class="legend-item occupied"></div>
            <span class="ml-2 text-caption">Occupied</span>
          </div>
          <div class="d-flex align-center">
            <div class="legend-item diagonal-split-example"></div>
            <span class="ml-2 text-caption">Arrival/Departure</span>
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

    // Find booking for this date using string comparison to avoid timezone issues
    const booking = bookings.value.find((b) => {
      // Convert API date strings to local date strings for comparison
      const checkInString = apiDateToLocalString(b.check_in);
      const checkOutString = apiDateToLocalString(b.check_out);
      return dateString >= checkInString && dateString <= checkOutString;
    });

    // Add guest data to booking if not already present
    const bookingWithGuest = booking
      ? {
          ...booking,
          guest:
            booking.guest ||
            guests.value.find((g) => g.id === booking.guest_id),
        }
      : undefined;

    // Determine if this is an arrival or departure day
    const isArrival = bookingWithGuest?.check_in === dateString;
    const isDeparture = bookingWithGuest?.check_out === dateString;

    days.push({
      date: dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      booking: bookingWithGuest,
      isArrival,
      isDeparture,
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

  if (day.booking) {
    if (day.booking.status === "new") {
      classes.push("reserved");
    } else {
      classes.push("occupied");
    }

    // Add arrival/departure classes
    if (day.isArrival) {
      classes.push("arrival-day");
    }
    if (day.isDeparture) {
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

.legend-item.diagonal-split-example {
  background: linear-gradient(
    135deg,
    #ffebee 0%,
    #ffebee 49%,
    white 50%,
    white 100%
  );
  border-left: 4px solid #f44336;
}
</style>
