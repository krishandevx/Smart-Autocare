export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export type Role =
  | 'super_admin'
  | 'admin'
  | 'workshop_manager'
  | 'service_advisor'
  | 'mechanic'
  | 'inventory_manager'
  | 'accountant'
  | 'customer';

export type VehicleType = 'Two Wheeler' | 'Three Wheeler' | 'Four Wheeler' | 'Commercial Vehicle' | 'Other';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'LPG' | 'Electric' | 'Hybrid' | 'Hydrogen' | 'Other';

export interface SelectOption {
  value: string;
  label: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  address?: string;
  avatar?: string;
  specialization?: string;
  companyName?: string;
  isEmailVerified?: boolean;
  preferences?: { theme?: 'light' | 'dark' | 'system'; notifications?: boolean };
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  user?: string | User;
  name: string;
  phone: string;
  email: string;
  role: Role;
  specialization: string;
  experienceYears: number;
  joiningDate?: string;
  status: 'active' | 'inactive' | 'on-leave';
  photo?: string;
  address?: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  owner: string | User;
  regNumber: string;
  type: VehicleType;
  category: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuelType: FuelType;
  transmission?: string;
  vin?: string;
  engineNumber?: string;
  mileage: number;
  purchaseDate?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  registrationExpiry?: string;
  batteryCapacity?: number;
  chargingType?: string;
  rangeKm?: number;
  batteryHealth?: number;
  image?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  estimatedHours: number;
  includes: string[];
  vehicleTypes: string[];
  isPopular: boolean;
  isActive: boolean;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'Requested'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Vehicle Pickup'
  | 'Vehicle Received'
  | 'Inspection'
  | 'Estimate Pending'
  | 'Awaiting Customer Approval'
  | 'Service In Progress'
  | 'Quality Check'
  | 'Ready for Delivery'
  | 'Completed'
  | 'Closed';

export interface Pickup {
  enabled: boolean;
  mode?: string;
  address?: string;
  date?: string;
  time?: string;
  driver?: string;
  status?: string;
  fee?: number;
}

export interface Booking {
  _id: string;
  bookingId: string;
  customer: string | User;
  vehicle: string | Vehicle;
  services: string[];
  serviceName?: string;
  scheduledDate: string;
  timeSlot: string;
  pickup?: Pickup;
  issueDescription?: string;
  photos?: string[];
  status: BookingStatus;
  statusHistory?: { status: string; at: string }[];
  serviceAdvisor?: string | User;
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  _id: string;
  appointmentId: string;
  booking?: string;
  customer: string | User;
  vehicle: string | Vehicle;
  service?: string | Service;
  serviceAdvisor?: string | User;
  mechanic?: string | User;
  date: string;
  timeSlot: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | 'Open'
  | 'In Inspection'
  | 'Estimate Pending'
  | 'Awaiting Approval'
  | 'In Progress'
  | 'Parts Ordered'
  | 'Quality Check'
  | 'Ready'
  | 'Invoiced'
  | 'Closed';

export interface JobPart {
  part?: string;
  name: string;
  partNumber?: string;
  sku?: string;
  qty: number;
  price: number;
  amount: number;
}

export interface JobNote {
  text: string;
  by?: string | User;
  at: string;
}

export interface JobCard {
  _id: string;
  jobCardId: string;
  booking?: string;
  customer: string | User;
  vehicle: string | Vehicle;
  mileageIn: number;
  fuelLevel: number;
  customerComplaint: string;
  inspectionNotes?: string;
  assignedMechanic?: string | User;
  serviceAdvisor?: string | User;
  status: JobStatus;
  statusHistory?: { status: string; at: string }[];
  estimatedCompletion?: string;
  actualCompletion?: string;
  parts: JobPart[];
  laborCharges: number;
  discount: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  images?: string[];
  videos?: string[];
  notes?: JobNote[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItem {
  item: string;
  status: 'Good' | 'Attention Needed' | 'Replace' | 'Critical';
  comment?: string;
  image?: string;
}

export interface InspectionSection {
  section: string;
  items: InspectionItem[];
}

export interface Inspection {
  _id: string;
  booking?: string;
  jobCard?: string | JobCard;
  customer: string | User;
  vehicle: string | Vehicle;
  odometer: number;
  sections: InspectionSection[];
  healthScore: number;
  overallNotes?: string;
  evCheck?: { batteryHealth?: number | null; cellVoltageImbalance?: number | null; chargingSystem?: string };
  createdBy?: string;
  status: 'Draft' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export type EstimateStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired' | 'Partially Approved';

export interface EstimateItem {
  type: 'Part' | 'Labour' | 'Misc';
  description: string;
  part?: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Estimate {
  _id: string;
  estimateId: string;
  booking?: string;
  jobCard?: string;
  customer: string | User;
  vehicle: string | Vehicle;
  items: EstimateItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: EstimateStatus;
  note?: string;
  customerNote?: string;
  customerDecisionAt?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Refunded' | 'Void';

export interface InvoiceLine {
  type: 'Service' | 'Part' | 'Labour' | 'Misc';
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  booking?: string;
  jobCard?: string;
  customer: string | User;
  vehicle: string | Vehicle;
  items: InvoiceLine[];
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  remaining: number;
  paymentStatus: InvoiceStatus;
  paymentMethod?: string;
  issuedDate: string;
  dueDate?: string;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  invoice: string | Invoice;
  booking?: string;
  customer: string | User;
  amount: number;
  method: string;
  reference?: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  date: string;
  recordedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Part {
  _id: string;
  partNumber: string;
  name: string;
  sku?: string;
  brand?: string;
  category: string;
  compatibleVehicles: string[];
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  location?: string;
  warrantyMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  _id: string;
  part: string | Part;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'PURCHASE' | 'RETURN' | 'USED';
  qty: number;
  before: number;
  after: number;
  reason?: string;
  reference?: string;
  user?: string;
  createdAt: string;
}

export interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  partsSupplied: string[];
  outstandingAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseStatus = 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';

export interface PurchaseOrderItem {
  part?: string;
  name: string;
  partNumber?: string;
  qty: number;
  rate: number;
  amount: number;
  received: number;
}

export interface PurchaseOrder {
  _id: string;
  poId: string;
  supplier: string | Supplier;
  items: PurchaseOrderItem[];
  total: number;
  status: PurchaseStatus;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  supplierInvoice?: string;
  paidAmount: number;
  dueAmount: number;
  createdBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  customer: string | User;
  vehicle: string | Vehicle;
  type: string;
  title: string;
  dueDate: string;
  dueMileage?: number | null;
  status: 'Pending' | 'Due Soon' | 'Overdue' | 'Completed';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  customer?: string | User;
  booking?: string;
  jobCard?: string;
  ratingOverall: number;
  ratingService: number;
  ratingStaff: number;
  ratingTimeliness: number;
  comment: string;
  response?: string;
  status: 'Pending' | 'Published' | 'Hidden';
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  _id: string;
  customer: string | User;
  vehicle: string | Vehicle;
  booking?: string;
  jobCard?: string;
  invoice?: string;
  services: string[];
  serviceName: string;
  date: string;
  mileage: number;
  parts: { name: string; partNumber?: string; qty: number; price: number; amount: number }[];
  laborCharges: number;
  total: number;
  invoiceNumber?: string;
  technician?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  key: string;
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  invoicePrefix: string;
  bookingPrefix: string;
  jobCardPrefix: string;
  estimatePrefix: string;
  taxRate: number;
  currency: string;
  businessHours: { open: string; close: string; days: number[]; slotDuration: number };
  appointmentBufferMinutes?: number;
  notificationSettings: { email: boolean; sms: boolean; inApp: boolean };
  pickupFee?: number;
  holidays?: string[];
}

export interface DashboardData {
  todayAppointments: number;
  activeJobs: number;
  pendingApprovals: number;
  inShopVehicles: number;
  completedThisMonth: number;
  monthInvoices: number;
  pendingPaymentTotal: number;
  lowStockCount: number;
  newCustomersThisMonth: number;
  openBookings: number;
  thisMonthRevenue: number;
  revenueSeries: { label: string; revenue: number; services: number }[];
  revenueTotal: { paid: number; billed: number; pending: number };
}

export interface CustomerDashboardData {
  vehicleCount: number;
  upcoming?: Booking | null;
  active?: Booking | null;
  totalSpend: number;
  pendingPayments: number;
  recentBookings: Booking[];
  invoices: {
    _id: string;
    invoiceNumber: string;
    grandTotal: number;
    paidAmount: number;
    remaining: number;
    paymentStatus: InvoiceStatus;
    issuedDate: string;
    vehicle: string | Vehicle;
    jobCard?: string;
  }[];
  reminders: Reminder[];
  vehicles: (Vehicle & { healthScore: number | null; lastServiceDate?: string | null; lastServiceId?: string | null })[];
}

export interface TimeSlot {
  time: string;
  available?: boolean;
}

export interface PublicMeta {
  VEHICLE_TYPES: VehicleType[];
  VEHICLE_CATEGORIES: Record<string, string[]>;
  FUEL_TYPES: FuelType[];
  TRANSMISSIONS: string[];
  SERVICE_CATEGORIES: string[];
}

export interface PublicSettings extends BusinessSettings {}

export interface StatusMeta {
  BOOKING_STATUSES: BookingStatus[];
  JOB_STATUSES: JobStatus[];
  ESTIMATE_STATUSES: EstimateStatus[];
  INVOICE_STATUSES: InvoiceStatus[];
  PAYMENT_METHODS: string[];
  INSPECTION_SECTIONS: string[];
  ROLES: Role[];
}

export interface SearchResult {
  id: string;
  type: 'vehicle' | 'booking' | 'jobcard' | 'invoice' | 'part' | 'customer';
  label: string;
  subtitle: string;
}