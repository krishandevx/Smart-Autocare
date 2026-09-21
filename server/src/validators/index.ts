import { z } from 'zod';

export const idParams = z.object({ id: z.string().min(1, 'ID required') });

export const emailSchema = z.string().email('Invalid email');
export const phoneSchema = z.string().regex(/^[0-9+\-\s()]{7,16}$/, 'Invalid phone number');

export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().optional(),
  address: z.string().optional().default(''),
}).refine((d) => !d.confirmPassword || d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: z.string().min(1), password: passwordSchema });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  preferences: z.object({ theme: z.enum(['light', 'dark', 'system']).optional(), notifications: z.boolean().optional() }).optional(),
});

const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Hydrogen', 'Other'] as const;
const transmissions = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT', 'Electric', 'Other'] as const;
const vehicleTypes = ['Two Wheeler', 'Three Wheeler', 'Four Wheeler', 'Commercial Vehicle', 'Other'] as const;

export const vehicleSchema = z.object({
  regNumber: z.string().min(4, 'Registration number is required'),
  type: z.enum(vehicleTypes),
  category: z.string().min(1, 'Vehicle category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().optional().default(''),
  year: z.coerce.number().min(1980, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  fuelType: z.enum(fuelTypes),
  transmission: z.enum(transmissions).optional().default('Manual'),
  vin: z.string().optional().default(''),
  engineNumber: z.string().optional().default(''),
  mileage: z.coerce.number().min(0).optional().default(0),
  purchaseDate: z.coerce.date().nullable().optional(),
  insuranceExpiry: z.coerce.date().nullable().optional(),
  pucExpiry: z.coerce.date().nullable().optional(),
  registrationExpiry: z.coerce.date().nullable().optional(),
  batteryCapacity: z.coerce.number().nullable().optional(),
  chargingType: z.string().optional().default(''),
  rangeKm: z.coerce.number().nullable().optional(),
  batteryHealth: z.coerce.number().min(0).max(100).nullable().optional(),
  image: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Name required'),
  category: z.string().min(1, 'Category required'),
  description: z.string().optional().default(''),
  basePrice: z.coerce.number().min(0).default(0),
  estimatedHours: z.coerce.number().min(0).default(1),
  includes: z.array(z.string()).optional().default([]),
  vehicleTypes: z.array(z.string()).optional().default([]),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  icon: z.string().optional().default('Wrench'),
});

export const bookingSchema = z.object({
  vehicle: z.string().min(1, 'Select a vehicle'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  scheduledDate: z.coerce.date(),
  timeSlot: z.string().min(3, 'Select a time slot'),
  pickup: z.object({
    enabled: z.boolean().optional().default(false),
    mode: z.enum(['Pickup and Drop', 'Workshop Visit']).optional(),
    address: z.string().optional().default(''),
    date: z.coerce.date().nullable().optional(),
    time: z.string().optional().default(''),
  }).optional(),
  issueDescription: z.string().optional().default(''),
  photos: z.array(z.string()).optional().default([]),
});

export const bookingStatusSchema = z.object({ status: z.string().min(1), notes: z.string().optional().default('') });

export const appointmentSchema = z.object({
  vehicle: z.string().min(1),
  service: z.string().nullable().optional(),
  serviceAdvisor: z.string().nullable().optional(),
  mechanic: z.string().nullable().optional(),
  date: z.coerce.date(),
  timeSlot: z.string().min(1),
  duration: z.coerce.number().min(15).default(60),
  status: z.string().optional(),
  notes: z.string().optional().default(''),
});

export const jobCardSchema = z.object({
  booking: z.string().nullable().optional(),
  vehicle: z.string().min(1, 'Vehicle required').optional().or(z.literal('')),
  mileageIn: z.coerce.number().min(0).default(0),
  fuelLevel: z.coerce.number().min(0).max(100).default(0),
  customerComplaint: z.string().optional().default(''),
  assignedMechanic: z.string().nullable().optional(),
  serviceAdvisor: z.string().nullable().optional(),
  estimatedCompletion: z.coerce.date().nullable().optional(),
});

export const jobCardStatusSchema = z.object({ status: z.string().min(1) });

export const addJobNoteSchema = z.object({ text: z.string().min(1) });
export const addJobPartSchema = z.object({
  part: z.string().nullable().optional(),
  name: z.string().min(1, 'Part name required'),
  partNumber: z.string().optional().default(''),
  qty: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});
export const jobLaborSchema = z.object({ laborCharges: z.coerce.number().min(0), discount: z.coerce.number().min(0).optional().default(0) });

export const inspectionSchema = z.object({
  odometer: z.coerce.number().min(0).optional().default(0),
  sections: z.array(z.object({
    section: z.string().min(1),
    items: z.array(z.object({
      item: z.string().min(1),
      status: z.enum(['Good', 'Attention Needed', 'Replace', 'Critical']).default('Good'),
      comment: z.string().optional().default(''),
    })),
  })),
  overallNotes: z.string().optional().default(''),
  evCheck: z.object({ batteryHealth: z.coerce.number().nullable().optional(), cellVoltageImbalance: z.coerce.number().nullable().optional(), chargingSystem: z.string().optional().default('') }).optional(),
  status: z.enum(['Draft', 'Completed']).optional(),
});

export const estimateSchema = z.object({
  items: z.array(z.object({
    type: z.enum(['Part', 'Labour', 'Misc']),
    description: z.string().min(1),
    part: z.string().nullable().optional(),
    qty: z.coerce.number().min(1).default(1),
    rate: z.coerce.number().min(0),
  })).min(1, 'Add at least one line item'),
  discount: z.coerce.number().min(0).optional().default(0),
  taxRate: z.coerce.number().min(0).optional().default(0),
  note: z.string().optional().default(''),
});

export const estimateDecisionSchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  customerNote: z.string().optional().default(''),
});

export const invoiceSchema = z.object({
  booking: z.string().nullable().optional(),
  jobCard: z.string().nullable().optional(),
  vehicle: z.string().min(1).optional().or(z.literal('')),
  items: z.array(z.object({
    type: z.enum(['Service', 'Part', 'Labour', 'Misc']),
    description: z.string().min(1),
    qty: z.coerce.number().min(1).default(1),
    rate: z.coerce.number().min(0),
  })).min(1, 'Add at least one line item').optional(),
  discount: z.coerce.number().min(0).optional().default(0),
  taxRate: z.coerce.number().min(0).optional().default(0),
  dueDate: z.coerce.date().nullable().optional(),
  notes: z.string().optional().default(''),
});

export const paymentSchema = z.object({
  invoice: z.string().optional().default(''),
  amount: z.coerce.number().min(1, 'Amount must be positive'),
  method: z.enum(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Payment']),
  reference: z.string().optional().default(''),
  date: z.coerce.date().optional(),
  notes: z.string().optional().default(''),
});

export const partSchema = z.object({
  name: z.string().min(2, 'Part name required'),
  partNumber: z.string().min(2, 'Part number required'),
  sku: z.string().optional().default(''),
  brand: z.string().optional().default(''),
  category: z.string().optional().default('General'),
  compatibleVehicles: z.array(z.string()).optional().default([]),
  costPrice: z.coerce.number().min(0).default(0),
  sellingPrice: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(5),
  unit: z.string().optional().default('pcs'),
  supplier: z.string().nullable().optional(),
  location: z.string().optional().default(''),
  warrantyMonths: z.coerce.number().min(0).default(0),
});

export const stockSchema = z.object({
  qty: z.coerce.number({ message: 'Quantity required' }),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']).default('IN'),
  reason: z.string().optional().default(''),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name required'),
  contactPerson: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: emailSchema.optional().or(z.literal('')),
  address: z.string().optional().default(''),
  gstin: z.string().optional().default(''),
  partsSupplied: z.array(z.string()).optional().default([]),
});

export const purchaseSchema = z.object({
  supplier: z.string().min(1, 'Supplier required'),
  items: z.array(z.object({
    part: z.string().nullable().optional(),
    name: z.string().min(1),
    partNumber: z.string().optional().default(''),
    qty: z.coerce.number().min(1),
    rate: z.coerce.number().min(0),
  })).min(1, 'Add at least one item'),
  expectedDate: z.coerce.date().nullable().optional(),
  supplierInvoice: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
  role: z.string().min(1, 'Role required'),
  specialization: z.string().optional().default(''),
  experienceYears: z.coerce.number().min(0).default(0),
  joiningDate: z.coerce.date().nullable().optional(),
  status: z.enum(['active', 'inactive', 'on-leave']).optional(),
  photo: z.string().optional().default(''),
  address: z.string().optional().default(''),
  salary: z.coerce.number().min(0).optional().default(0),
  user: z.string().nullable().optional(),
});

export const reviewSchema = z.object({
  booking: z.string().optional().default(''),
  ratingOverall: z.coerce.number().min(1).max(5),
  ratingService: z.coerce.number().min(1).max(5).optional(),
  ratingStaff: z.coerce.number().min(1).max(5).optional(),
  ratingTimeliness: z.coerce.number().min(1).max(5).optional(),
  comment: z.string().optional().default(''),
});

export const reviewResponseSchema = z.object({ response: z.string().min(1), status: z.enum(['Pending', 'Published', 'Hidden']).optional() });

export const reminderSchema = z.object({
  vehicle: z.string().min(1),
  type: z.string().optional(),
  title: z.string().min(2),
  dueDate: z.coerce.date(),
  dueMileage: z.coerce.number().nullable().optional(),
  note: z.string().optional().default(''),
});

export const settingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  tagline: z.string().optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
  invoicePrefix: z.string().optional(),
  bookingPrefix: z.string().optional(),
  jobCardPrefix: z.string().optional(),
  estimatePrefix: z.string().optional(),
  taxRate: z.coerce.number().min(0).optional(),
  currency: z.string().min(1).optional(),
  businessHours: z.object({
    open: z.string().optional(),
    close: z.string().optional(),
    days: z.array(z.number()).optional(),
    slotDuration: z.coerce.number().min(15).optional(),
  }).optional(),
  holidays: z.array(z.coerce.date()).optional(),
  notificationSettings: z.object({ email: z.boolean().optional(), sms: z.boolean().optional(), inApp: z.boolean().optional() }).optional(),
  pickupFee: z.coerce.number().min(0).optional(),
});

export const globalSearchQuery = z.object({
  q: z.string().min(2, 'Search term too short').max(60),
});