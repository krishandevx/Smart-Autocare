export const ROLES = [
  'super_admin',
  'admin',
  'workshop_manager',
  'service_advisor',
  'mechanic',
  'inventory_manager',
  'accountant',
  'customer',
] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES: Role[] = [
  'super_admin',
  'admin',
  'workshop_manager',
  'service_advisor',
  'mechanic',
  'inventory_manager',
  'accountant',
];

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

export const ESTIMATE_STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired', 'Partially Approved'] as const;

export const INVOICE_STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Refunded', 'Void'] as const;

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Payment'] as const;

export const PAYMENT_STATUSES = ['Pending', 'Completed', 'Failed', 'Refunded'] as const;

export const PICKUP_STATUSES = ['Requested', 'Assigned', 'Picked Up', 'At Workshop', 'Ready for Delivery', 'Delivered'] as const;

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

export const REVIEW_TYPES = ['Booking', 'JobCard'] as const;

export const SETTINGS_DEFAULT = {
  companyName: 'Smart AutoCare',
  tagline: 'Smart Service. Smarter Vehicle Care.',
  email: 'support@smartautocare.com',
  phone: '+91 98765 43210',
  address: '12, Auto Park Plaza, MG Road, Bengaluru, Karnataka 560001',
  gstin: '29ABCDE1234F1Z5',
  invoicePrefix: 'SAC-INV',
  bookingPrefix: 'SAC-BK',
  jobCardPrefix: 'SAC-JC',
  estimatePrefix: 'SAC-EST',
  taxRate: 18,
  currency: '₹',
  businessHours: { open: '09:00', close: '19:00', days: [1, 2, 3, 4, 5, 6], slotDuration: 60 },
  appointmentBufferMinutes: 0,
  notificationSettings: { email: true, sms: false, inApp: true },
};