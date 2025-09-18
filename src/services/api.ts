import axios from "axios";

// API Configuration
const API_BASE_URL = "http://amrum-be:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("auth_token");
      // router.push('/login')
    }
    return Promise.reject(error);
  }
);

// API Types (based on backend schemas)
export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  pays_dayrate: boolean;
  is_admin: boolean;
  created_at: string;
  modified_at: string;
}

export interface InvoiceData {
  accommodation: number;
  electricity: number;
  gas: number;
  firewood: number;
  tourist_tax: number;
  total: number;
  breakdown: {
    nights: number;
    rate_per_night: number;
    electricity_usage: number;
    electricity_rate: number;
    gas_usage: number;
    gas_rate: number;
    firewood_boxes: number;
    firewood_rate: number;
  };
}

export interface InvoiceDetails {
  accommodation_cost: number;
  stay_rate: number;
  electricity_cost: number;
  elec_rate: number;
  gas_cost: number;
  gas_rate: number;
  firewood_cost: number;
  firewood_rate: number;
  kurtaxe_cost: number;
  total_cost: number;
  consumption: {
    electricity_kwh: number;
    gas_kwh: number;
    gas_cubic_meters: number;
    firewood_boxes: number;
  };
  num_days: number;
}

export interface Booking {
  id: number;
  guest_id: number;
  guest?: Guest;
  check_in: string;
  check_out: string;
  status:
    | "new"
    | "confirmed"
    | "kurkarten_requested"
    | "ready_for_arrival"
    | "arriving"
    | "on_site"
    | "departing"
    | "departed_readings_due"
    | "departed_invoice_due"
    | "departed_payment_due"
    | "departed_done";
  confirmed: boolean;
  final_info_sent: boolean;
  invoice_created: boolean;
  invoice_sent: boolean;
  paid: boolean;
  kurkarten_email_sent: boolean;
  kurkarten_email_sent_date?: string;
  pre_arrival_email_sent: boolean;
  pre_arrival_email_sent_date?: string;
  kurtaxe_amount?: number;
  kurtaxe_notes?: string;
  invoice_id?: string;
  invoice_created_date?: string;
  invoice_sent_date?: string;
  invoice_details?: InvoiceDetails;
  access_token?: string;
  created_at: string;
  modified_at: string;
  meter_readings?: MeterReading;
  payments?: Payment[];
}

export interface MeterReading {
  id: number;
  booking_id: number;
  electricity_start?: number;
  electricity_end?: number;
  gas_start?: number;
  gas_end?: number;
  firewood_boxes?: number;
  created_at: string;
  modified_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string;
  notes: string;
  created_at: string;
  modified_at: string;
}

export interface CreatePaymentRequest {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string;
  notes: string;
  booking_id: number;
}

export interface UnitPrice {
  id: number;
  price_type:
    | "electricity_per_kwh"
    | "stay_per_night"
    | "gas_per_cubic_meter"
    | "firewood_per_box";
  price_per_unit: number;
  currency: string;
  effective_from: string;
  effective_to?: string;
  description?: string;
  created_at: string;
  modified_at: string;
}

export interface PendingEmail {
  id: number;
  booking_id: number;
  email_type:
    | "booking_confirmation"
    | "kurkarten_request"
    | "pre_arrival_info"
    | "invoice_generation"
    | "missing_readings_reminder";
}

export interface PendingEmailsResponse {
  total_count: number;
  emails: PendingEmail[];
}

export interface OutstandingGuestAction {
  id: number;
  booking_id: number;
  action_type:
    | "payment_required"
    | "registration_incomplete"
    | "confirmation_pending"
    | "document_missing"
    | "feedback_requested";
}

export interface OutstandingGuestActionsResponse {
  total_count: number;
  actions: OutstandingGuestAction[];
}

export interface GuestPaymentResponse {
  id: number;
  booking_id: number;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  modified_at: string;
}

export interface GuestBookingResponse {
  id: number;
  check_in: string;
  check_out: string;
  confirmed: boolean;
  status:
    | "new"
    | "confirmed"
    | "kurkarten_requested"
    | "ready_for_arrival"
    | "arriving"
    | "on_site"
    | "departing"
    | "departed_readings_due"
    | "departed_invoice_due"
    | "departed_payment_due"
    | "departed_done";
  kurtaxe_amount: number | null;
  kurtaxe_notes: string | null;
  created_at: string;
  guest_name: string;
  guest_email: string;
  meter_readings: MeterReading | null;
  payments: GuestPaymentResponse[] | null;
}

// API Service Classes
export class BookingService {
  static async getAll(): Promise<Booking[]> {
    const response = await api.get("/bookings");
    return response.data;
  }

  static async getById(id: number): Promise<Booking> {
    const response = await api.get(`/booking/${id}`);
    return response.data;
  }

  static async getGuestBookingByToken(
    token: string
  ): Promise<GuestBookingResponse> {
    const response = await api.get(`/guest/booking/${token}`);
    return response.data;
  }

  static async getByGuest(guestId: number): Promise<Booking[]> {
    const response = await api.get(`/bookings?guest_id=${guestId}`);
    return response.data;
  }

  static async update(
    id: number,
    booking: Partial<
      Omit<
        Booking,
        | "id"
        | "created_at"
        | "modified_at"
        | "confirmed"
        | "final_info_sent"
        | "invoice_created"
        | "invoice_sent"
        | "paid"
        | "kurkarten_email_sent"
        | "pre_arrival_email_sent"
      >
    >
  ): Promise<Booking> {
    const response = await api.patch(`/booking/${id}`, booking);
    return response.data;
  }

  static async create(
    booking: Omit<
      Booking,
      | "id"
      | "created_at"
      | "modified_at"
      | "confirmed"
      | "final_info_sent"
      | "invoice_created"
      | "invoice_sent"
      | "paid"
      | "kurkarten_email_sent"
      | "pre_arrival_email_sent"
    >
  ): Promise<Booking> {
    const response = await api.post("/bookings", booking);
    return response.data;
  }

  static async confirm(id: number): Promise<Booking> {
    const response = await api.patch(`/booking/${id}/confirm`);
    return response.data;
  }

  static async updateKurtaxe(
    id: number,
    data: { kurtaxe_amount?: number; kurtaxe_notes?: string }
  ): Promise<Booking> {
    const response = await api.patch(`/booking/${id}/kurtaxe`, data);
    return response.data;
  }

  static async sendKurkartenEmail(id: number): Promise<{ message: string }> {
    const response = await api.post(`/booking/${id}/kurkarten/send`);
    return response.data;
  }

  static async sendPreArrivalEmail(id: number): Promise<{ message: string }> {
    const response = await api.post(`/booking/${id}/pre-arrival/send`);
    return response.data;
  }

  static async createInvoice(
    id: number
  ): Promise<{ message: string; invoice_id: string }> {
    const response = await api.post(`/booking/${id}/invoice/generate`);
    return response.data;
  }

  static async sendInvoice(id: number): Promise<{ message: string }> {
    const response = await api.post(`/booking/${id}/invoice/send`);
    return response.data;
  }

  static async registerReadings(id: number): Promise<{ message: string }> {
    const response = await api.post(`/booking/${id}/readings/register`);
    return response.data;
  }

  static async registerTouristTax(id: number): Promise<{ message: string }> {
    const response = await api.post(`/booking/${id}/tourist-tax/register`);
    return response.data;
  }

  static async createPayment(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post(
      `/booking/${payment.booking_id}/payment`,
      payment
    );
    return response.data;
  }

  static async submitGuestReadings(
    token: string,
    readings: {
      electricity_start?: number;
      electricity_end?: number;
      gas_start?: number;
      gas_end?: number;
      firewood_boxes?: number;
    }
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/guest/booking/${token}/readings`,
      readings
    );
    return response.data;
  }
}

export class GuestService {
  static async getAll(): Promise<Guest[]> {
    const response = await api.get("/guests");
    return response.data;
  }

  static async create(
    guest: Omit<Guest, "id" | "created_at" | "modified_at"> & {
      password: string;
    }
  ): Promise<Guest> {
    const response = await api.post("/guests", guest);
    return response.data;
  }

  static async getById(id: number): Promise<Guest> {
    const response = await api.get(`/guest/${id}`);
    return response.data;
  }

  static async update(
    id: number,
    guest: Partial<Omit<Guest, "id" | "created_at" | "modified_at">>
  ): Promise<Guest> {
    const response = await api.patch(`/guest/${id}`, guest);
    return response.data;
  }
}

export class MeterService {
  static async get(bookingId: number): Promise<MeterReading> {
    const response = await api.get(`/booking/${bookingId}/meter-readings`);
    return response.data;
  }

  static async createOrUpdate(
    bookingId: number,
    data: Omit<MeterReading, "id" | "booking_id" | "created_at" | "modified_at">
  ): Promise<MeterReading> {
    const response = await api.post(
      `/booking/${bookingId}/meter-readings`,
      data
    );
    return response.data;
  }
}

export class PaymentService {
  static async getByBooking(bookingId: number): Promise<Payment[]> {
    const response = await api.get(`/booking/${bookingId}/payment`);
    return response.data;
  }

  static async create(
    bookingId: number,
    payment: Omit<Payment, "id" | "booking_id" | "created_at" | "modified_at">
  ): Promise<Payment> {
    const response = await api.post(`/booking/${bookingId}/payment`, payment);
    return response.data;
  }
}

export class AdminService {
  static async getUnitPrices(): Promise<UnitPrice[]> {
    const response = await api.get("/admin/pricing");
    return response.data;
  }

  static async getElectricityPrices(): Promise<UnitPrice[]> {
    const response = await api.get("/admin/pricing/electricity");
    return response.data;
  }

  static async getStayPrices(): Promise<UnitPrice[]> {
    const response = await api.get("/admin/pricing/stay");
    return response.data;
  }

  static async getGasPrices(): Promise<UnitPrice[]> {
    const response = await api.get("/admin/pricing/gas");
    return response.data;
  }

  static async getFirewoodPrices(): Promise<UnitPrice[]> {
    const response = await api.get("/admin/pricing/firewood");
    return response.data;
  }

  static async createElectricityPrice(data: {
    price_per_unit: number;
    effective_from: string;
    effective_to?: string;
    description?: string;
  }): Promise<UnitPrice> {
    const response = await api.post("/admin/unit-prices/electricity", data);
    return response.data;
  }

  static async createStayPrice(data: {
    price_per_unit: number;
    effective_from: string;
    effective_to?: string;
    description?: string;
  }): Promise<UnitPrice> {
    const response = await api.post("/admin/unit-prices/stay", data);
    return response.data;
  }

  static async createGasPrice(data: {
    price_per_unit: number;
    effective_from: string;
    effective_to?: string;
    description?: string;
  }): Promise<UnitPrice> {
    const response = await api.post("/admin/unit-prices/gas", data);
    return response.data;
  }

  static async createFirewoodPrice(data: {
    price_per_unit: number;
    effective_from: string;
    effective_to?: string;
    description?: string;
  }): Promise<UnitPrice> {
    const response = await api.post("/admin/unit-prices/firewood", data);
    return response.data;
  }
}

export class AlertService {
  static async getPendingEmails(): Promise<PendingEmailsResponse> {
    const response = await api.get("/alerts/pending-emails");
    return response.data;
  }

  static async getOutstandingGuestActions(): Promise<OutstandingGuestActionsResponse> {
    const response = await api.get("/alerts/outstanding-guest-actions");
    return response.data;
  }
}

export default api;
