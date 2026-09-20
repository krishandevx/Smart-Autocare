export const APP_NAME = 'Smart AutoCare';
export const APP_TAGLINE = 'Smarter Vehicle Care, Built Around You.';

export const VEHICLE_TYPES = ['Two Wheeler', 'Three Wheeler', 'Four Wheeler', 'Commercial Vehicle', 'Other'] as const;

export const VEHICLE_CATEGORIES: Record<string, string[]> = {
  'Two Wheeler': ['Motorcycle', 'Scooter', 'Electric Scooter', 'Electric Motorcycle', 'Other'],
  'Three Wheeler': ['Auto Rickshaw', 'Electric Auto', 'Cargo Three Wheeler', 'Other'],
  'Four Wheeler': ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Pickup', 'Van', 'Electric Car', 'Other'],
  'Commercial Vehicle': ['Light Commercial Vehicle', 'Pickup Truck', 'Delivery Vehicle', 'Mini Truck', 'Other'],
  Other: ['Other'],
};

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Hydrogen', 'Other'] as const;

export const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'Electric', 'Other'] as const;

export const SERVICE_CATEGORIES = [
  'General Service',
  'Mechanical',
  'Electrical',
  'AC',
  'Tyres',
  'Detailing',
  'EV',
  'Other',
] as const;

export const STAFF_ROLES = [
  'super_admin',
  'admin',
  'workshop_manager',
  'service_advisor',
  'mechanic',
  'inventory_manager',
  'accountant',
] as const;

export const ROLES = [...STAFF_ROLES, 'customer'] as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  workshop_manager: 'Workshop Manager',
  service_advisor: 'Service Advisor',
  mechanic: 'Mechanic',
  inventory_manager: 'Inventory Manager',
  accountant: 'Accountant',
  customer: 'Customer',
};

export const BOOKING_STATUSES = [
  'Requested',
  'Confirmed',
  'Rescheduled',
  'Cancelled',
  'Vehicle Pickup',
  'Vehicle Received',
  'Inspection',
  'Estimate Pending',
  'Awaiting Customer Approval',
  'Service In Progress',
  'Quality Check',
  'Ready for Delivery',
  'Completed',
  'Closed',
] as const;

export const BOOKING_STATUS_FLOW: readonly string[] = BOOKING_STATUSES;

export const JOB_STATUSES = [
  'Open',
  'In Inspection',
  'Estimate Pending',
  'Awaiting Approval',
  'In Progress',
  'Parts Ordered',
  'Quality Check',
  'Ready',
  'Invoiced',
  'Closed',
] as const;

export const JOB_CARD_STATUSES: readonly string[] = JOB_STATUSES;

export const INSPECTION_STATUSES = ['Good', 'Attention Needed', 'Replace', 'Critical'] as const;

export const INSPECTION_SECTIONS = [
  'Exterior',
  'Interior',
  'Engine',
  'Brakes',
  'Battery',
  'Tyres',
  'Suspension',
  'AC',
  'Electrical',
  'Lights',
  'Fluids',
  'Safety',
  'Odometer',
  'EV Battery',
] as const;

export const APPOINTMENT_STATUSES = ['Scheduled', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'No Show'] as const;

export const ESTIMATE_STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired', 'Partially Approved'] as const;

export const ESTIMATE_ITEM_TYPES = ['Part', 'Labour', 'Misc'] as const;

export const INVOICE_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Refunded', 'Void'] as const;

export const INVOICE_ITEM_TYPES = ['Service', 'Part', 'Labour', 'Misc'] as const;

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Payment'] as const;

export const PAYMENT_STATUSES = ['Pending', 'Completed', 'Failed', 'Refunded'] as const;

export const PURCHASE_STATUSES = ['Draft', 'Sent', 'Partial', 'Received', 'Cancelled'] as const;

export const REMINDER_TYPES = [
  'Periodic Service',
  'Oil Change',
  'Brake Inspection',
  'Tyre Replacement',
  'Battery Check',
  'Insurance Renewal',
  'PUC Renewal',
  'Custom',
] as const;

export const REMINDER_STATUSES = ['Pending', 'Due Soon', 'Overdue', 'Completed'] as const;

export const REVIEW_STATUSES = ['Pending', 'Published', 'Hidden'] as const;

export const TIMESLOT_STEP_MIN = 30;

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
] as const;

export const REPORT_UNITS = [
  { id: 'day', label: 'Daily' },
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'year' as string, label: 'Yearly' },
] as const;

export const GLOBAL_SEARCH_REDIRECTS: Record<string, (id: string) => string> = {
  vehicle: (id: string) => `/admin/vehicles/${id}`,
  booking: (id: string) => `/admin/bookings/${id}`,
  jobcard: (id: string) => `/admin/job-cards/${id}`,
  invoice: (id: string) => `/admin/invoices/${id}`,
  part: (id: string) => `/admin/inventory/${id}`,
  customer: (id: string) => `/admin/customers/${id}`,
};