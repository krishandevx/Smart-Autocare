import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { nextId } from '../utils/idGenerator';
import {
  User, Vehicle, Service, Booking, Appointment, JobCard, Inspection, Estimate,
  ServiceRecord, Part, InventoryTransaction, Supplier, PurchaseOrder, Employee,
  Invoice, Payment, Notification, Review, Reminder,
} from '../models';

const SAMPLE_MARKER = '@example.net';
const SAMPLE_PASSWORD = 'Sample@1234';
const TAX_RATE = 18;

const at = (daysAgo: number, hour = 10, minute = 30): Date => {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const r2 = (n: number): number => Math.round(n * 100) / 100;
const mon = (n: number): string => 'Rs. ' + n.toLocaleString('en-IN');

const STAFF_DEFS = [
  { name: 'Samantha Rao', email: 'sam.rao@example.net', phone: '+91 98450 11001', role: 'workshop_manager', specialization: 'Operations', exp: 12, joining: -3000 },
  { name: 'Arjun Malhotra', email: 'arjun.mech@example.net', phone: '+91 98450 11002', role: 'mechanic', specialization: 'Engine & Transmission', exp: 8, joining: -2800 },
  { name: 'Deepak Verma', email: 'deepak.mech@example.net', phone: '+91 98450 11003', role: 'mechanic', specialization: 'Electrical & AC', exp: 6, joining: -2000 },
  { name: 'Kiran Shetty', email: 'kiran.advisor@example.net', phone: '+91 98450 11004', role: 'service_advisor', specialization: 'Front Desk', exp: 5, joining: -1500 },
  { name: 'Neha Bhatt', email: 'neha.store@example.net', phone: '+91 98450 11005', role: 'inventory_manager', specialization: 'Stores', exp: 4, joining: -1200 },
  { name: 'Priya Desai', email: 'priya.billing@example.net', phone: '+91 98450 11006', role: 'accountant', specialization: 'Billing', exp: 7, joining: -2200 },
] as const;

const CUSTOMER_DEFS = [
  { name: 'Rahul Sharma', phone: '+91 98450 22001', address: 'No. 12, 5th Cross, Indiranagar', city: 'Bengaluru' },
  { name: 'Priya Mehta', phone: '+91 98450 22002', address: 'A-204, Skyline Residency, HSR Layout', city: 'Bengaluru' },
  { name: 'Amit Patel', phone: '+91 98240 22003', address: '7, Ashram Road', city: 'Ahmedabad' },
  { name: 'Sneha Reddy', phone: '+91 90300 22004', address: 'Plot 44, Jubilee Hills', city: 'Hyderabad' },
  { name: 'Vikram Singh', phone: '+91 98110 22005', address: '21, Vasant Vihar', city: 'New Delhi' },
  { name: 'Neha Gupta', phone: '+91 98330 22006', address: 'B-9, Salt Lake Sector 1', city: 'Kolkata' },
  { name: 'Arjun Nair', phone: '+91 98460 22007', address: '45, MG Road', city: 'Kochi' },
  { name: 'Kavya Iyer', phone: '+91 98840 22008', address: '3rd Avenue, Anna Nagar', city: 'Chennai' },
  { name: 'Rohan Das', phone: '+91 98310 22009', address: '89, Park Street', city: 'Kolkata' },
  { name: 'Meera Joshi', phone: '+91 99250 22010', address: 'F-301, Baner Road', city: 'Pune' },
  { name: 'Ananya Kapoor', phone: '+91 98100 22011', address: 'C-77, Defence Colony', city: 'New Delhi' },
  { name: 'Farhan Ali', phone: '+91 98980 22012', address: '18, Linking Road, Bandra West', city: 'Mumbai' },
] as const;

interface VehicleDef { reg: string; type: string; category: string; brand: string; model: string; variant?: string; year: number; fuel: string; trans: string; mileage: number }
const VEHICLE_DEFS: VehicleDef[] = [
  { reg: 'KA-01-MQ-4521', type: 'Four Wheeler', category: 'Hatchback', brand: 'Maruti Suzuki', model: 'Swift', variant: 'VXi', year: 2021, fuel: 'Petrol', trans: 'Manual', mileage: 32140 },
  { reg: 'KA-05-NR-8832', type: 'Four Wheeler', category: 'SUV', brand: 'Hyundai', model: 'Creta', variant: 'SX(O)', year: 2022, fuel: 'Diesel', trans: 'Automatic', mileage: 48720 },
  { reg: 'KA-03-EF-9010', type: 'Four Wheeler', category: 'Hatchback', brand: 'Maruti Suzuki', model: 'Baleno', variant: 'Delta', year: 2020, fuel: 'Petrol', trans: 'Manual', mileage: 45310 },
  { reg: 'DL-03-AB-1122', type: 'Four Wheeler', category: 'SUV (EV)', brand: 'Tata', model: 'Nexon EV', variant: 'XZ+ Lux', year: 2022, fuel: 'Electric', trans: 'Automatic', mileage: 26180 },
  { reg: 'MH-02-CD-7745', type: 'Four Wheeler', category: 'SUV', brand: 'Mahindra', model: 'Scorpio-N', variant: 'Z8L', year: 2023, fuel: 'Diesel', trans: 'Manual', mileage: 18450 },
  { reg: 'TS-09-GH-3311', type: 'Four Wheeler', category: 'MUV', brand: 'Toyota', model: 'Innova Crysta', variant: 'GX', year: 2019, fuel: 'Diesel', trans: 'Manual', mileage: 61200 },
  { reg: 'DL-08-JK-5544', type: 'Four Wheeler', category: 'Hatchback', brand: 'Volkswagen', model: 'Polo', variant: 'GT TSI', year: 2018, fuel: 'Petrol', trans: 'Manual', mileage: 58870 },
  { reg: 'KA-51-PQ-2290', type: 'Four Wheeler', category: 'SUV', brand: 'Kia', model: 'Seltos', variant: 'HTX', year: 2023, fuel: 'Petrol', trans: 'Automatic', mileage: 14260 },
  { reg: 'TN-10-RS-6671', type: 'Four Wheeler', category: 'Sedan', brand: 'Honda', model: 'City', variant: 'ZX', year: 2021, fuel: 'Petrol', trans: 'CVT', mileage: 36890 },
  { reg: 'MH-12-TU-1023', type: 'Four Wheeler', category: 'SUV', brand: 'Hyundai', model: 'Venue', variant: 'SX', year: 2022, fuel: 'Petrol', trans: 'DCT', mileage: 22480 },
  { reg: 'KA-02-VW-3305', type: 'Two Wheeler', category: 'Scooter', brand: 'Honda', model: 'Activa 6G', year: 2023, fuel: 'Petrol', trans: 'Automatic', mileage: 9820 },
  { reg: 'KL-07-XY-7812', type: 'Two Wheeler', category: 'Motorcycle', brand: 'Royal Enfield', model: 'Classic 350', year: 2021, fuel: 'Petrol', trans: 'Manual', mileage: 27540 },
  { reg: 'WB-01-ZM-4450', type: 'Two Wheeler', category: 'Scooter', brand: 'TVS', model: 'Jupiter', year: 2022, fuel: 'Petrol', trans: 'Automatic', mileage: 11850 },
  { reg: 'KA-05-BN-9182', type: 'Four Wheeler', category: 'Sedan', brand: 'Hyundai', model: 'Verna', variant: 'SX(O)', year: 2020, fuel: 'Petrol', trans: 'Automatic', mileage: 41200 },
];

const SERVICE_DEFS = [
  { name: 'Basic Service', category: 'General Service', description: 'Engine oil, oil filter, general inspection and top-up of essential fluids.', basePrice: 1499, hours: 2, includes: ['Engine oil replacement', 'Oil filter replacement', '45-point inspection', 'Air filter cleaning', 'Wash and vacuum'], types: ['Four Wheeler', 'Two Wheeler'], popular: true, icon: 'Wrench' },
  { name: 'Periodic Service', category: 'General Service', description: 'Complete scheduled maintenance as per the manufacturer service interval.', basePrice: 2499, hours: 3, includes: ['Everything in Basic Service', 'Brake inspection and adjustment', 'Wheel alignment check', 'Battery health check', 'Coolant and brake fluid top-up'], types: ['Four Wheeler', 'Two Wheeler'], popular: true, icon: 'CalendarCheck' },
  { name: 'Engine Oil & Filter Change', category: 'Mechanical', description: 'Fresh engine oil and filter for smoother performance.', basePrice: 999, hours: 1, includes: ['Oil drain and filter change', 'Engine oil top check', 'Minor leak inspection'], types: ['Four Wheeler', 'Two Wheeler'], icon: 'Droplet' },
  { name: 'Brake Pad Replacement', category: 'Mechanical', description: 'Replace worn front or rear brake pads with premium grade friction material.', basePrice: 1899, hours: 2, includes: ['Brake pad replacement (per axle)', 'Disc resurfacing check', 'Brake fluid bleed'], types: ['Four Wheeler'], icon: 'Disc' },
  { name: 'AC Service & Gas Refill', category: 'AC', description: 'AC gas top-up, condenser cleaning and cooling efficiency check.', basePrice: 1299, hours: 1, includes: ['AC gas top-up', 'Condenser and cabin filter cleaning', 'Temperature output test'], types: ['Four Wheeler', 'Three Wheeler'], icon: 'Snowflake' },
  { name: 'Wheel Alignment & Balancing', category: 'Tyres', description: 'Computerised wheel alignment and balancing for a straight, smooth drive.', basePrice: 799, hours: 1, includes: ['4-wheel computerised alignment', 'Wheel balancing', 'Tyre pressure calibration'], types: ['Four Wheeler'], icon: 'CircleDot' },
  { name: 'Tyre Replacement', category: 'Tyres', description: 'New tubeless tyres fitted and balanced, with tyre health inspection.', basePrice: 4500, hours: 1, includes: ['Fitting and balancing', 'Valve and stem replacement', 'Old tyre disposal'], types: ['Four Wheeler', 'Two Wheeler'], icon: 'Disc3' },
  { name: 'Battery Replacement', category: 'Electrical', description: 'High-capacity battery with free health check and 24-month warranty.', basePrice: 5500, hours: 1, includes: ['Old battery replacement', 'Terminal cleaning', 'Charging system test'], types: ['Four Wheeler', 'Two Wheeler'], icon: 'BatteryCharging' },
  { name: 'Full Body Detailing', category: 'Detailing', description: 'Paint correction, polishing, interior deep clean and protection coating.', basePrice: 2899, hours: 5, includes: ['Foam wash and decontamination', 'Machine polish (2-step)', 'Durable wax coating', 'Interior deep clean'], types: ['Four Wheeler'], icon: 'Sparkles' },
  { name: 'EV Battery Health Check', category: 'EV', description: 'Battery SoH analysis, cell voltage check and charging system diagnostics.', basePrice: 999, hours: 1, includes: ['Battery state-of-health report', 'Cell voltage balance scan', 'Charging system test', 'Software health scan'], types: ['Four Wheeler', 'Two Wheeler'], icon: 'Battery' },
  { name: 'Suspension & Steering Check', category: 'Mechanical', description: 'Shock absorber, bush and steering component inspection and service.', basePrice: 1499, hours: 2, includes: ['Shock absorber inspection', 'Bush and boot check', 'Steering play test', 'Lubrication'], types: ['Four Wheeler'], icon: 'Car' },
  { name: 'Interior Deep Clean', category: 'Detailing', description: 'Shampoo seats, steam clean trims and sanitise the cabin.', basePrice: 1999, hours: 3, includes: ['Seat shampooing', 'Carpet and roof cleaning', 'Dashboard polishing', 'Sanitisation'], types: ['Four Wheeler', 'Two Wheeler'], icon: 'SprayCan' },
] as const;

const SUPPLIER_DEFS = [
  { name: 'AutoParts India', contactPerson: 'Pankaj Khanna', phone: '+91 98111 33001', email: 'sales@autopartsindia.in', address: 'Plot 21, Okhla Industrial Estate, New Delhi', gstin: '07AABCA1234F1Z5', partsSupplied: ['Castrol', 'Bosch', 'MGP', 'Gates'] },
  { name: 'SpareZone Distributors', contactPerson: 'Rakesh Menon', phone: '+91 98450 33002', email: 'orders@sparezone.in', address: '46, Hosur Road, Bengaluru', gstin: '29AASCS5678R1Z6', partsSupplied: ['Bosch', 'Philips', 'Monroe'] },
  { name: 'Bharat Tyres & Wheels', contactPerson: 'Sunil Agarwal', phone: '+91 98100 33003', email: 'bharattyres@example.in', address: '12A, Nehru Place, New Delhi', gstin: '07AABTB9012L1Z7', partsSupplied: ['Apollo', 'MRF', 'CEAT'] },
  { name: 'PowerVolt Batteries', contactPerson: 'Ismail Shaikh', phone: '+91 98980 33004', email: 'powervolt@example.in', address: '303, L.B.S. Marg, Mumbai', gstin: '27AABPV3456P1Z8', partsSupplied: ['Exide', 'Amaron', 'SF Sonic'] },
  { name: 'G.S. Filters & Belts', contactPerson: 'Gurpreet Singh', phone: '+91 98720 33005', email: 'gsfilters@example.in', address: '8, Focal Point, Ludhiana', gstin: '03AABFG7890Q1Z9', partsSupplied: ['MGP', 'Gates', 'Bosch'] },
  { name: 'CoolAir AC Solutions', contactPerson: 'Vivek Patil', phone: '+91 98900 33006', email: 'coolair@example.in', address: '91, Shivaji Nagar, Pune', gstin: '27AABCAL1234M1Z1', partsSupplied: ['Sanden', 'Denso', 'MGP'] },
] as const;

interface PartDef { partNumber: string; name: string; brand: string; category: string; cost: number; sell: number; stock: number; min: number; unit: string; supplierIdx: number; location: string }
const PART_DEFS: PartDef[] = [
  { partNumber: 'ENG-OIL-5W30', name: 'Engine Oil 5W-30 (5L)', brand: 'Castrol', category: 'Lubricants', cost: 1800, sell: 2250, stock: 18, min: 8, unit: 'ltr', supplierIdx: 0, location: 'Rack-A1' },
  { partNumber: 'FLT-OIL-MGP-203', name: 'Engine Oil Filter (Celerio/Swift)', brand: 'MGP', category: 'Filters', cost: 260, sell: 420, stock: 34, min: 10, unit: 'pcs', supplierIdx: 4, location: 'Rack-B2' },
  { partNumber: 'FLT-AIR-K10', name: 'Air Filter (K10 / 1.2L)', brand: 'MGP', category: 'Filters', cost: 320, sell: 540, stock: 26, min: 10, unit: 'pcs', supplierIdx: 4, location: 'Rack-B2' },
  { partNumber: 'BRK-PAD-SWIFT', name: 'Brake Pad Set Front (Swift)', brand: 'Bosch', category: 'Brakes', cost: 1400, sell: 2150, stock: 10, min: 5, unit: 'set', supplierIdx: 1, location: 'Rack-C3' },
  { partNumber: 'BRK-PAD-CRETA', name: 'Brake Pad Set Front (Creta)', brand: 'Bosch', category: 'Brakes', cost: 2100, sell: 3150, stock: 8, min: 5, unit: 'set', supplierIdx: 1, location: 'Rack-C3' },
  { partNumber: 'BRK-ROTOR-PAIR', name: 'Brake Disc Rotor (Pair)', brand: 'Bosch', category: 'Brakes', cost: 3400, sell: 4650, stock: 6, min: 4, unit: 'pair', supplierIdx: 1, location: 'Rack-C3' },
  { partNumber: 'AC-GAS-R134A', name: 'AC Refrigerant R134a (340g)', brand: 'CoolAir', category: 'AC', cost: 550, sell: 850, stock: 14, min: 6, unit: 'can', supplierIdx: 5, location: 'Rack-D1' },
  { partNumber: 'BAT-35B19R', name: 'Battery 35B19R (32Ah) i10', brand: 'Exide', category: 'Batteries', cost: 2600, sell: 3450, stock: 4, min: 4, unit: 'pcs', supplierIdx: 3, location: 'Rack-D2' },
  { partNumber: 'BAT-55D23L', name: 'Battery 55D23L (60Ah) Creta', brand: 'Amaron', category: 'Batteries', cost: 5200, sell: 6450, stock: 3, min: 5, unit: 'pcs', supplierIdx: 3, location: 'Rack-D2' },
  { partNumber: 'TYR-185-65R15', name: 'Tyre 185/65 R15', brand: 'Apollo', category: 'Tyres', cost: 3800, sell: 4600, stock: 8, min: 6, unit: 'pcs', supplierIdx: 2, location: 'Rack-E1' },
  { partNumber: 'TYR-215-60R17', name: 'Tyre 215/60 R17', brand: 'MRF', category: 'Tyres', cost: 7200, sell: 8600, stock: 4, min: 5, unit: 'pcs', supplierIdx: 2, location: 'Rack-E2' },
  { partNumber: 'SPL-STRUT-SWIFT', name: 'Front Strut Assembly (Swift)', brand: 'Monroe', category: 'Suspension', cost: 3200, sell: 3950, stock: 7, min: 4, unit: 'pcs', supplierIdx: 1, location: 'Rack-F1' },
  { partNumber: 'FLT-FUEL-DIESEL', name: 'Fuel Filter Assembly (Diesel)', brand: 'Bosch', category: 'Filters', cost: 950, sell: 1380, stock: 11, min: 5, unit: 'pcs', supplierIdx: 1, location: 'Rack-B3' },
  { partNumber: 'WPR-BLADE-24', name: 'Wiper Blade 24 inch', brand: 'MGP', category: 'General', cost: 180, sell: 320, stock: 27, min: 12, unit: 'pcs', supplierIdx: 4, location: 'Rack-G1' },
  { partNumber: 'HED-BULB-H4', name: 'H4 Headlamp Bulb (Pair)', brand: 'Philips', category: 'Electrical', cost: 650, sell: 950, stock: 20, min: 8, unit: 'pair', supplierIdx: 1, location: 'Rack-G2' },
  { partNumber: 'AC-CLN-PURGE', name: 'AC Cleaner & Purge Kit', brand: 'CoolAir', category: 'AC', cost: 380, sell: 650, stock: 16, min: 6, unit: 'kit', supplierIdx: 5, location: 'Rack-D1' },
  { partNumber: 'TIM-BELT-SWIFT', name: 'Timing Belt Kit (Swift 1.2)', brand: 'Gates', category: 'Engine', cost: 4500, sell: 5400, stock: 3, min: 4, unit: 'kit', supplierIdx: 4, location: 'Rack-A3' },
  { partNumber: 'GRC-LITH-400', name: 'Lithium Grease (400g)', brand: 'MGP', category: 'Lubricants', cost: 420, sell: 700, stock: 24, min: 8, unit: 'jar', supplierIdx: 4, location: 'Rack-A1' },
  { partNumber: 'SPK-PLUG-SWIFT', name: 'Spark Plug Set (Swift 1.2)', brand: 'Bosch', category: 'Engine', cost: 480, sell: 720, stock: 18, min: 8, unit: 'set', supplierIdx: 1, location: 'Rack-A3' },
  { partNumber: 'FLT-CABIN', name: 'Cabin Filter (Universal)', brand: 'MGP', category: 'Filters', cost: 290, sell: 480, stock: 31, min: 12, unit: 'pcs', supplierIdx: 4, location: 'Rack-B2' },
];

interface Scenario {
  daysAgo: number; custIdx: number; vehIdx: number; services: number[]; labor: number;
  parts: Array<{ partIdx: number; qty: number }>;
  bookingStatus: string; jcStatus: string; invStatus: string; paidPct: number; method: string;
  source: string; slot: string;
  review?: { rating: number; service: number; staff: number; timely: number; comment: string; response?: string };
}

const SCENARIOS: Scenario[] = [
  { daysAgo: 88, custIdx: 0, vehIdx: 0, services: [1], labor: 1500, parts: [{ partIdx: 0, qty: 1 }, { partIdx: 1, qty: 1 }, { partIdx: 2, qty: 1 }, { partIdx: 11, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'UPI', source: 'Website', slot: '10:00 AM - 1:00 PM', review: { rating: 5, service: 5, staff: 5, timely: 5, comment: 'Smooth experience. Drop and pickup on time, car feels brand new. Transparent pricing on the app.', response: 'Thank you Rahul! Glad the vehicle is in great shape. See you at the next service.' } },
  { daysAgo: 74, custIdx: 1, vehIdx: 1, services: [8], labor: 2200, parts: [{ partIdx: 8, qty: 1 }, { partIdx: 12, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'Card', source: 'Phone', slot: '11:00 AM - 2:00 PM', review: { rating: 4, service: 4, staff: 5, timely: 4, comment: 'Interior looks spotless. Detailing team was thorough, slightly delayed on pickup though.' } },
  { daysAgo: 61, custIdx: 2, vehIdx: 2, services: [2], labor: 600, parts: [{ partIdx: 0, qty: 1 }, { partIdx: 1, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'Cash', source: 'Walk-in', slot: '12:00 PM - 3:00 PM' },
  { daysAgo: 52, custIdx: 3, vehIdx: 3, services: [9], labor: 500, parts: [], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'Online Payment', source: 'App', slot: '10:00 AM - 11:00 AM', review: { rating: 5, service: 5, staff: 5, timely: 5, comment: 'Loved the battery health report — got a clear number with a graph in the app. Very professional.', response: 'Thank you Sneha! Happy to keep you charged up for many more kilometres.' } },
  { daysAgo: 43, custIdx: 4, vehIdx: 4, services: [1], labor: 1800, parts: [{ partIdx: 0, qty: 2 }, { partIdx: 1, qty: 2 }, { partIdx: 4, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Partially Paid', paidPct: 0.5, method: 'Bank Transfer', source: 'Website', slot: '09:00 AM - 12:00 PM' },
  { daysAgo: 36, custIdx: 5, vehIdx: 5, services: [3], labor: 1000, parts: [{ partIdx: 12, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'UPI', source: 'Phone', slot: '04:00 PM - 07:00 PM' },
  { daysAgo: 28, custIdx: 6, vehIdx: 6, services: [6], labor: 800, parts: [{ partIdx: 9, qty: 2 }, { partIdx: 13, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'Card', source: 'Walk-in', slot: '10:00 AM - 12:00 PM', review: { rating: 4, service: 5, staff: 5, timely: 4, comment: 'Old tyres were dangerously worn out, they replaced all four in a single visit. Fair pricing.' } },
  { daysAgo: 19, custIdx: 7, vehIdx: 7, services: [1, 3], labor: 1400, parts: [{ partIdx: 0, qty: 1 }, { partIdx: 1, qty: 1 }, { partIdx: 4, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Invoiced', invStatus: 'Paid', paidPct: 1, method: 'UPI', source: 'Website', slot: '11:00 AM - 02:00 PM' },
  { daysAgo: 12, custIdx: 8, vehIdx: 8, services: [0, 4], labor: 700, parts: [{ partIdx: 0, qty: 1 }, { partIdx: 1, qty: 1 }, { partIdx: 5, qty: 1 }, { partIdx: 15, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Paid', paidPct: 1, method: 'Cash', source: 'App', slot: '09:00 AM - 12:00 PM', review: { rating: 4, service: 5, staff: 4, timely: 4, comment: 'Good value service. The 45-point report card is a nice touch, points out things I would have ignored.' } },
  { daysAgo: 7, custIdx: 9, vehIdx: 9, services: [1], labor: 1600, parts: [{ partIdx: 0, qty: 1 }, { partIdx: 1, qty: 1 }], bookingStatus: 'Completed', jcStatus: 'Closed', invStatus: 'Overdue', paidPct: 0, method: 'Bank Transfer', source: 'Website', slot: '12:00 PM - 03:00 PM' },
  { daysAgo: 3, custIdx: 10, vehIdx: 10, services: [0], labor: 300, parts: [{ partIdx: 6, qty: 1 }], bookingStatus: 'Service In Progress', jcStatus: 'In Progress', invStatus: 'Pending', paidPct: 0, method: 'UPI', source: 'Website', slot: '10:00 AM - 01:00 PM' },
  { daysAgo: 1, custIdx: 11, vehIdx: 11, services: [2, 5], labor: 500, parts: [{ partIdx: 9, qty: 1 }], bookingStatus: 'Awaiting Customer Approval', jcStatus: 'Awaiting Approval', invStatus: 'Pending', paidPct: 0, method: 'UPI', source: 'App', slot: '09:00 AM - 12:00 PM' },
];

const UPCOMING: Array<{ inDays: number; custIdx: number; vehIdx: number; services: number[]; slot: string }> = [
  { inDays: 2, custIdx: 0, vehIdx: 1, services: [0], slot: '10:00 AM - 12:00 PM' },
  { inDays: 4, custIdx: 7, vehIdx: 7, services: [5], slot: '04:00 PM - 05:00 PM' },
  { inDays: 6, custIdx: 3, vehIdx: 3, services: [9], slot: '11:00 AM - 12:00 PM' },
];

const VEHICLE_FOR_CUST: number[][] = [[0, 1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12]];
const EXTRA_VEHICLE_FOR_CUST = 1;

async function main(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  console.log('[samples] connected.');

  const existing = await User.countDocuments({ email: new RegExp(SAMPLE_MARKER, 'i') });
  if (existing > 0) {
    console.log('[samples] sample data already present (' + existing + ' sample users).');
    console.log('[samples] run "npm run seed" for a clean DB, then "npm run seed:samples".');
    await mongoose.disconnect();
    return;
  }

  console.log('[samples] password for all sample accounts: ' + SAMPLE_PASSWORD);
  const pwHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  // ---- Staff (users + employees) ----
  const staffUsers: any[] = [];
  for (const s of STAFF_DEFS) {
    const u = await User.create({
      name: s.name, email: s.email, phone: s.phone, password: pwHash, role: s.role,
      address: 'Smart AutoCare Workshop, Bengaluru', isEmailVerified: true,
      emailVerifiedAt: at(s.joining, 9), lastLoginAt: at(0, 9),
    });
    staffUsers.push(u);
    await Employee.create({
      user: u._id, name: s.name, phone: s.phone, email: s.email, role: s.role,
      specialization: s.specialization, experienceYears: s.exp,
      joiningDate: at(s.joining, 9), status: 'active',
      address: 'Smart AutoCare Workshop, Bengaluru', salary: 0,
    });
  }
  console.log('[samples] staff: ' + staffUsers.length);
  const [manager, mechanicA, mechanicB, advisor, storekeeper, accountant] = staffUsers;

  // ---- Services ----
  const serviceDocs = await Service.create(SERVICE_DEFS.map((s) => ({
    name: s.name, category: s.category, description: s.description,
    basePrice: s.basePrice, estimatedHours: s.hours, includes: s.includes,
    vehicleTypes: s.types, isPopular: 'popular' in s && !!s.popular, isActive: true, icon: s.icon,
  })));
  console.log('[samples] services: ' + serviceDocs.length);

  // ---- Suppliers ----
  const supplierDocs = await Supplier.create(SUPPLIER_DEFS);
  console.log('[samples] suppliers: ' + supplierDocs.length);

  // ---- Parts + suppliers link ----
  const parts: any[] = [];
  for (const p of PART_DEFS) {
    const d = await Part.create({
      partNumber: p.partNumber, name: p.name, sku: p.partNumber, brand: p.brand,
      category: p.category, costPrice: p.cost, sellingPrice: p.sell, stock: p.stock,
      minStock: p.min, unit: p.unit, supplier: supplierDocs[p.supplierIdx]._id,
      location: p.location, warrantyMonths: 0, isActive: true,
    });
    parts.push(d);
  }
  console.log('[samples] parts: ' + parts.length);

  // Used-quantity tally for inventory history
  const used = new Map<number, number>();
  for (const sc of SCENARIOS) for (const p of sc.parts) used.set(p.partIdx, (used.get(p.partIdx) || 0) + p.qty);

  // ---- Purchase orders ----
  const poReceivedId = await nextId('purchase');
  const poReceivedItems = [
    { part: parts[9]._id, name: parts[9].name, partNumber: parts[9].partNumber, qty: 8, rate: 3800, amount: 8 * 3800 },
    { part: parts[13]._id, name: parts[13].name, partNumber: parts[13].partNumber, qty: 20, rate: 180, amount: 20 * 180 },
  ];
  const poReceived = await PurchaseOrder.create({
    poId: poReceivedId, supplier: supplierDocs[2]._id, items: poReceivedItems,
    total: poReceivedItems.reduce((a, i) => a + i.amount, 0),
    status: 'Received', orderDate: at(40, 11), expectedDate: at(36, 11),
    receivedDate: at(35, 12), supplierInvoice: 'BTW/2026/114', paidAmount: poReceivedItems.reduce((a, i) => a + i.amount, 0), dueAmount: 0,
    notes: 'Monthly stock refill for Apollo 185/65 R15 and wiper blades.', createdAt: at(40, 11), updatedAt: at(35, 12),
  });
  const poSentId = await nextId('purchase');
  const poSentItems = [
    { part: parts[8]._id, name: parts[8].name, partNumber: parts[8].partNumber, qty: 5, rate: 5200, amount: 5 * 5200 },
    { part: parts[16]._id, name: parts[16].name, partNumber: parts[16].partNumber, qty: 4, rate: 4500, amount: 4 * 4500 },
  ];
  await PurchaseOrder.create({
    poId: poSentId, supplier: supplierDocs[3]._id, items: poSentItems,
    total: poSentItems.reduce((a, i) => a + i.amount, 0),
    status: 'Sent', orderDate: at(2, 10), expectedDate: at(-3, 10),
    paidAmount: 0, dueAmount: poSentItems.reduce((a, i) => a + i.amount, 0),
    notes: 'Battery and timing belt restock for the festive season.', createdAt: at(2, 10), updatedAt: at(2, 10),
  });
  console.log('[samples] purchase orders: 2 (1 received, 1 sent)');

  // ---- Customers + vehicles ----
  const customerDocs: any[] = [];
  const vehicleDocs: any[] = [];
  const vehGlobalToDoc: Record<number, any> = {};
  for (let i = 0; i < CUSTOMER_DEFS.length; i++) {
    const c = CUSTOMER_DEFS[i];
    const u = await User.create({
      name: c.name, email: c.name.toLowerCase().replace(/ +/g, '.') + '@example.net',
      phone: c.phone, password: pwHash, role: 'customer',
      address: c.address + ', ' + c.city, isEmailVerified: true,
      emailVerifiedAt: at(120 + i, 9), lastLoginAt: at(i % 4, 9),
    });
    customerDocs.push(u);
    const vehIdxs: number[] = VEHICLE_FOR_CUST[i];
    for (const vIdx of vehIdxs) {
      const v = VEHICLE_DEFS[vIdx];
      const vdoc = await Vehicle.create({
        owner: u._id, regNumber: v.reg, type: v.type, category: v.category,
        brand: v.brand, model: v.model, variant: v.variant || '', year: v.year,
        fuelType: v.fuel, transmission: v.trans, mileage: v.mileage,
        purchaseDate: at(-((2026 - v.year) * 365 + 200), 10),
        insuranceExpiry: at(-(6 - (i % 3) * 3) * 30, 10),
        pucExpiry: at((i % 3 === 0 ? -15 : 60 + i * 10), 10),
        isActive: true,
      });
      vehicleDocs.push(vdoc);
      vehGlobalToDoc[vIdx] = vdoc;
    }
  }
  // extra second vehicle (Hyundai Verna) for customer 1
  const extraV = VEHICLE_DEFS[13];
  const extraVeh = await Vehicle.create({
    owner: customerDocs[1]._id, regNumber: extraV.reg, type: extraV.type, category: extraV.category,
    brand: extraV.brand, model: extraV.model, variant: extraV.variant || '', year: extraV.year,
    fuelType: extraV.fuel, transmission: extraV.trans, mileage: extraV.mileage,
    purchaseDate: at(-2000, 10), insuranceExpiry: at(-30, 10), pucExpiry: at(90, 10), isActive: true,
  });
  vehicleDocs.push(extraVeh);
  vehGlobalToDoc[13] = extraVeh;
  console.log('[samples] customers: ' + customerDocs.length + ', vehicles: ' + vehicleDocs.length);

  const vehIdxOf = (_ci: number, vi: number) => vehGlobalToDoc[vi];

  // ---- Inventory history: opening, then PO in, then USED per scenario ----
  const running = new Map<number, number>();
  parts.forEach((p, idx) => running.set(idx, p.stock));
  const openTx: any[] = [];
  for (let idx = 0; idx < parts.length; idx++) {
    const usedQty = used.get(idx) || 0;
    const initial = running.get(idx)! + usedQty + (idx === 9 ? 8 : 0) + (idx === 13 ? 20 : 0);
    openTx.push({
      part: parts[idx]._id, type: 'IN', qty: initial, before: 0, after: initial,
      reason: 'Opening stock', reference: '',
    });
    running.set(idx, initial);
  }
  await InventoryTransaction.create(openTx.map((t) => ({ ...t, createdAt: at(95, 9), updatedAt: at(95, 9) })));
  // PO stock-in
  for (const pi of [9, 13]) {
    const qty = pi === 9 ? 8 : 20;
    const cur = running.get(pi)!;
    await InventoryTransaction.create({
      part: parts[pi]._id, type: 'PURCHASE', qty, before: cur - qty, after: cur,
      reason: 'Received against ' + poReceivedId + ' (Bharat Tyres & Wheels)', reference: poReceivedId,
      createdAt: at(35, 12), updatedAt: at(35, 12),
    });
  }
  console.log('[samples] inventory transactions: opening for ' + parts.length + ' parts');

  // ---- Scenarios (bookings -> job cards -> inspections -> invoices -> payments -> reviews + stock USED) ----
  const invoiceDocs: any[] = [];
  let paymentCount = 0;
  for (let i = 0; i < SCENARIOS.length; i++) {
    const sc = SCENARIOS[i];
    const customer = customerDocs[sc.custIdx];
    const vehicle = vehIdxOf(sc.custIdx, sc.vehIdx);
    const serviceObjs = sc.services.map((s) => serviceDocs[s]);

    const jobDate = at(sc.daysAgo, 10);
    const mileage = VEHICLE_DEFS[sc.vehIdx].mileage;

    const bookingId = await nextId('booking');
    const booking = await Booking.create({
      bookingId, customer: customer._id, vehicle: vehicle._id,
      services: serviceObjs.map((s) => s._id),
      serviceName: serviceObjs.map((s) => s.name).join(', '),
      scheduledDate: jobDate, timeSlot: sc.slot, source: sc.source,
      issueDescription: sc.daysAgo > 20
        ? 'Scheduled ' + sc.services.map((s) => serviceDocs[s].name).join(' and ').toLowerCase()
        : (sc.daysAgo > 5
          ? 'Vehicle pickup requested for ' + sc.services.map((s) => serviceDocs[s].name).join(' and ')
          : 'Scheduled ' + sc.services.map((s) => serviceDocs[s].name).join(' and ').toLowerCase()),
      pickup: sc.source === 'Website' || sc.source === 'App'
        ? { enabled: sc.daysAgo > 20, mode: 'Pickup and Drop', address: customer.address, date: jobDate, time: sc.slot.split(' - ')[0], fee: sc.daysAgo > 20 ? 0 : 199 }
        : { enabled: false, mode: 'Workshop Visit', address: '', date: null, time: '', fee: 0 },
      serviceAdvisor: advisor._id,
      status: sc.bookingStatus, notes: '',
      createdAt: jobDate, updatedAt: jobDate,
    });

    const jobCardId = await nextId('jobcard');
    const jcParts = sc.parts.map((p) => {
      const pd = parts[p.partIdx];
      return { part: pd._id, name: pd.name, partNumber: pd.partNumber, sku: pd.partNumber, qty: p.qty, price: pd.sellingPrice, amount: r2(p.qty * pd.sellingPrice) };
    });
    const laborPlus = sc.labor + jcParts.reduce((a, p) => a + p.amount, 0);
    const jobCard = await JobCard.create({
      jobCardId, booking: booking._id, customer: customer._id, vehicle: vehicle._id,
      mileageIn: mileage, fuelLevel: sc.daysAgo % 4 === 0 ? 35 : 60,
      customerComplaint: sc.daysAgo > 20
        ? 'Routine maintenance — ' + sc.services.map((s) => serviceDocs[s].name).join(' and ')
        : (sc.daysAgo > 10
          ? serviceObjs[0].name + ' with a few additional checks requested.'
          : serviceObjs[0].name + ' requested by customer.'),
      inspectionNotes: sc.daysAgo > 20 ? 'Vehicle in good condition. No major findings.' : 'Minor wear noted on brake components. Advised customer.',
      assignedMechanic: i % 2 === 0 ? mechanicA._id : mechanicB._id,
      serviceAdvisor: advisor._id,
      status: sc.jcStatus,
      estimatedCompletion: at(sc.daysAgo - 1, 18),
      actualCompletion: sc.jcStatus === 'Closed' || sc.jcStatus === 'Invoiced' ? at(sc.daysAgo - 1, 18) : null,
      parts: jcParts, laborCharges: sc.labor, discount: 0, taxRate: TAX_RATE,
      subtotal: r2(laborPlus),
      tax: r2(laborPlus * TAX_RATE / 100),
      total: r2(laborPlus * (1 + TAX_RATE / 100)),
      statusHistory: [{ status: 'Open', at: jobDate }, { status: sc.jcStatus, at: jobDate }],
      createdAt: jobDate, updatedAt: jobDate,
    });

    // Inspection
    const inspectionItems = [
      { section: 'Exterior', items: [{ item: 'Paint condition', status: 'Good', comment: 'Minor swirl marks, no dents.' }, { item: 'Glass & mirrors', status: 'Good', comment: 'Chips on windshield, within limits.' }] },
      { section: 'Engine', items: [{ item: 'Oil level & leak', status: sc.daysAgo > 40 ? 'Attention Needed' : 'Good', comment: 'Slight seepage around oil filter housing.' }, { item: 'Oil condition', status: 'Good', comment: 'Due for change, no sludge observed.' }] },
      { section: 'Brakes', items: [{ item: 'Brake pads', status: sc.daysAgo > 40 ? 'Attention Needed' : 'Good', comment: 'Friction material ~40% remaining.' }, { item: 'Brake discs', status: 'Good', comment: 'No scoring noticed.', section: 'Brakes' }] },
      { section: 'Battery', items: [{ item: 'Battery health', status: sc.vehIdx === 8 ? 'Attention Needed' : 'Good', comment: 'Cranking voltage slightly low, no replacement needed this visit.' }] },
      { section: 'Tyres', items: [{ item: 'Tread depth', status: sc.daysAgo > 25 ? 'Attention Needed' : 'Good', comment: 'Tread at wear limit, advise replacement soon.' }, { item: 'Tyre pressure & wear', status: 'Good', comment: 'Even wear, corrected pressure.' }] },
      { section: 'AC', items: [{ item: 'AC cooling', status: 'Good', comment: 'Vent temp 6C, performance normal.' }] },
      { section: 'Electrical', items: [{ item: 'Battery terminals', status: 'Good', comment: 'Cleaned and protected.' }] },
      { section: 'Lights', items: [{ item: 'All lamps', status: 'Good', comment: 'All lamps working, aimed correctly.' }] },
      { section: 'Fluids', items: [{ item: 'Coolant & brake fluid', status: 'Good', comment: 'Levels topped up.' }] },
      { section: 'Safety', items: [{ item: 'Seatbelts & airbags', status: 'Good', comment: 'No faults reported by module.' }] },
    ];
    const ev = sc.vehIdx === 3;
    await Inspection.create({
      booking: booking._id, jobCard: jobCard._id, customer: customer._id, vehicle: vehicle._id,
      odometer: mileage, sections: inspectionItems,
      healthScore: sc.daysAgo < 10 ? 86 : 92, overallNotes: 'No critical findings. Routine maintenance completed.',
      evCheck: ev ? { batteryHealth: 92, cellVoltageImbalance: 8, chargingSystem: 'Normal' } : { batteryHealth: null, cellVoltageImbalance: null, chargingSystem: '' },
      createdBy: mechanicA._id, status: 'Completed',
      createdAt: at(sc.daysAgo - 1, 9), updatedAt: at(sc.daysAgo - 1, 9),
    });

    // Service record
    await ServiceRecord.create({
      customer: customer._id, vehicle: vehicle._id, booking: booking._id, jobCard: jobCard._id,
      services: serviceObjs.map((s) => s._id), serviceName: serviceObjs.map((s) => s.name).join(', '),
      date: jobDate, mileage, laborCharges: sc.labor, total: jobCard.total,
      invoiceNumber: '', technician: (i % 2 === 0 ? mechanicA : mechanicB).name, notes: jcParts.length ? 'Parts fitted: ' + jcParts.map((p) => p.name + ' x' + p.qty).join(', ') : '',
    });

    // Stock usage (USED transactions)
    for (const p of sc.parts) {
      const cur = running.get(p.partIdx)!;
      await InventoryTransaction.create({
        part: parts[p.partIdx]._id, type: 'USED', qty: p.qty, before: cur, after: cur - p.qty,
        reason: 'Part used in ' + jobCardId, reference: jobCardId,
        user: mechanicA._id,
        createdAt: jobDate, updatedAt: jobDate,
      });
      running.set(p.partIdx, cur - p.qty);
    }

    // Estimate + invoice
    if (sc.invStatus === 'Pending' || sc.bookingStatus === 'Awaiting Customer Approval') {
      const estimateId = await nextId('estimate');
      await Estimate.create({
        estimateId, booking: booking._id, jobCard: jobCard._id,
        customer: customer._id, vehicle: vehicle._id,
        items: [
          ...serviceObjs.map((s) => ({ type: 'Labour' as const, description: s.name, qty: 1, rate: s.basePrice, amount: s.basePrice })),
          ...jcParts.map((p) => ({ type: 'Part' as const, description: p.name, qty: p.qty, rate: p.amount / p.qty, amount: p.amount })),
          { type: 'Labour', description: 'Labour charges', qty: 1, rate: sc.labor, amount: sc.labor },
        ],
        subtotal: r2(laborPlus), discount: 0, taxRate: TAX_RATE, tax: r2(laborPlus * TAX_RATE / 100), total: r2(laborPlus * (1 + TAX_RATE / 100)),
        status: sc.bookingStatus === 'Awaiting Customer Approval' ? 'Sent' : 'Approved',
        note: sc.bookingStatus === 'Awaiting Customer Approval' ? 'Awaiting customer decision on additional brake work.' : 'Standard service estimate.',
        createdBy: advisor._id, approvedBy: mechanicA._id, approvedAt: jobDate,
        createdAt: jobDate, updatedAt: jobDate,
      });
    } else {
      const invoiceNumber = await nextId('invoice');
      const items = [
        ...serviceObjs.map((s) => ({ type: 'Labour' as const, description: s.name, qty: 1, rate: s.basePrice, amount: s.basePrice })),
        ...jcParts.map((p) => ({ type: 'Part' as const, description: p.name, qty: p.qty, rate: p.amount / p.qty, amount: p.amount })),
        { type: 'Labour', description: 'Workshop labour', qty: 1, rate: sc.labor, amount: sc.labor },
      ];
      const subtotal = r2(items.reduce((a, it) => a + it.amount, 0));
      const tax = r2(subtotal * TAX_RATE / 100);
      const discount = sc.daysAgo === 88 ? 200 : 0;
      const grandTotal = r2(subtotal + tax - discount);
      const paid = sc.paidPct === 1 ? grandTotal : sc.paidPct > 0 ? r2(grandTotal * sc.paidPct) : 0;
      const issued = at(sc.daysAgo - 1, 12);
      const invoice = await Invoice.create({
        invoiceNumber, booking: booking._id, jobCard: jobCard._id, customer: customer._id, vehicle: vehicle._id,
        items, subtotal, discount, taxRate: TAX_RATE, tax, grandTotal,
        paidAmount: paid, remaining: r2(grandTotal - paid),
        status: sc.invStatus, paymentMethod: sc.paidPct > 0 ? sc.method : '',
        issuedDate: issued, createdAt: issued, updatedAt: issued,
      });
      invoiceDocs.push(invoice);
      await ServiceRecord.updateMany({ jobCard: jobCard._id }, { $set: { invoice: invoice._id, invoiceNumber } });

      if (paid > 0) {
        const payDate = at(sc.daysAgo - 2, 11);
        await Payment.create({
          invoice: invoice._id, booking: booking._id, customer: customer._id,
          amount: paid, method: sc.method, reference: sc.method === 'UPI' ? 'UPI-' + Math.floor(100000 + Math.random() * 900000) : '',
          status: 'Completed', date: payDate, recordedBy: accountant._id,
          notes: sc.paidPct > 0 && sc.paidPct < 1 ? 'Advance part payment' : 'Full settlement',
          createdAt: payDate, updatedAt: payDate,
        });
        paymentCount++;
      }
    }

    // Review for completed, reviewed scenarios
    if (sc.review && (sc.invStatus === 'Paid' || sc.jcStatus === 'Closed')) {
      const revDate = at(sc.daysAgo - 2, 18);
      await Review.create({
        customer: customer._id, booking: booking._id, jobCard: jobCard._id,
        ratingOverall: sc.review.rating, ratingService: sc.review.service, ratingStaff: sc.review.staff, ratingTimeliness: sc.review.timely,
        comment: sc.review.comment, response: sc.review.response || '', status: 'Published',
        createdAt: revDate, updatedAt: revDate,
      });
    }
  }
  console.log('[samples] bookings: ' + SCENARIOS.length + ', job cards: ' + SCENARIOS.length + ', invoices: ' + invoiceDocs.length + ', payments: ' + paymentCount);

  // ---- Upcoming bookings + appointments ----
  for (const u of UPCOMING) {
    const customer = customerDocs[u.custIdx];
    const vehicle = vehIdxOf(u.custIdx, u.vehIdx);
    const serviceObjs = u.services.map((s) => serviceDocs[s]);
    const date = at(-u.inDays, 10);
    const bookingId = await nextId('booking');
    const booking = await Booking.create({
      bookingId, customer: customer._id, vehicle: vehicle._id,
      services: serviceObjs.map((s) => s._id), serviceName: serviceObjs.map((s) => s.name).join(', '),
      scheduledDate: date, timeSlot: u.slot, source: 'Website',
      issueDescription: 'Scheduled ' + serviceObjs.map((s) => s.name).join(' and ').toLowerCase(),
      pickup: { enabled: false, mode: 'Workshop Visit', address: '', date: null, time: '', fee: 0 },
      serviceAdvisor: advisor._id, status: 'Confirmed', notes: '',
      createdAt: at(-u.inDays - 2, 9), updatedAt: at(-u.inDays - 2, 9),
    });
    await Appointment.create({
      appointmentId: await nextId('appointment'), booking: booking._id,
      customer: customer._id, vehicle: vehicle._id, service: serviceObjs[0]._id,
      serviceAdvisor: advisor._id, mechanic: mechanicA._id,
      date, timeSlot: u.slot, duration: 120, status: 'Confirmed', notes: '',
      createdAt: at(-u.inDays - 2, 9), updatedAt: at(-u.inDays - 2, 9),
    });
  }
  console.log('[samples] upcoming bookings/appointments: ' + UPCOMING.length);

  // ---- Reminders ----
  const reminderDefs = [
    { cust: 0, veh: 0, type: 'Periodic Service', title: 'Periodic Service due', daysAgo: 5, status: 'Due Soon' },
    { cust: 1, veh: 1, type: 'Insurance Renewal', title: 'Insurance renewal reminder', daysAgo: 9, status: 'Overdue' },
    { cust: 2, veh: 2, type: 'Oil Change', title: 'Oil change due in 900 km', daysAgo: -7, status: 'Pending' },
    { cust: 4, veh: 4, type: 'Brake Inspection', title: 'Brake pad wear check', daysAgo: 12, status: 'Overdue' },
    { cust: 6, veh: 6, type: 'Tyre Replacement', title: 'Tyre tread at limit', daysAgo: 20, status: 'Completed' },
    { cust: 7, veh: 7, type: 'Periodic Service', title: 'Next periodic service', daysAgo: -30, status: 'Pending' },
    { cust: 3, veh: 3, type: 'Battery Check', title: 'EV battery health scan', daysAgo: -45, status: 'Pending' },
    { cust: 5, veh: 5, type: 'PUC Renewal', title: 'PUC certificate renewal', daysAgo: 3, status: 'Due Soon' },
    { cust: 8, veh: 8, type: 'Periodic Service', title: 'Scheduled service reminder', daysAgo: -20, status: 'Due Soon' },
  ];
  for (const r of reminderDefs) {
    await Reminder.create({
      customer: customerDocs[r.cust]._id, vehicle: vehIdxOf(r.cust, r.veh)._id,
      type: r.type, title: r.title, dueDate: at(-r.daysAgo, 9),
      dueMileage: null, status: r.status, note: 'Automated from sample data.',
      createdAt: at(60, 9), updatedAt: at(60, 9),
    });
  }
  console.log('[samples] reminders: ' + reminderDefs.length);

  // ---- Notifications ----
  const notifDefs = [
    { cust: 0, title: 'Service reminder', message: 'Your booking for ' + vehicleDocs[0].model + ' (KA-01-MQ-4521) is confirmed for tomorrow.', type: 'booking', link: '/bookings', daysAgo: 1 },
    { cust: 7, title: 'Invoice generated', message: 'Invoice ' + (invoiceDocs[7] ? invoiceDocs[7].invoiceNumber : '') + ' is ready — ' + (invoiceDocs[7] ? mon(invoiceDocs[7].grandTotal) : '0') + ' payable.', type: 'invoice', link: '/invoices', daysAgo: 2 },
    { cust: 9, title: 'Payment pending', message: 'Your invoice is overdue. Please complete the payment to keep your services active.', type: 'payment', link: '/invoices', daysAgo: 1 },
    { cust: 3, title: 'Health check complete', message: 'Battery health report for your Nexon EV is now available in the app.', type: 'service', link: '/health', daysAgo: 3 },
    { cust: 0, title: 'Welcome to Smart AutoCare', message: 'We have saved your Swift on your profile. Book a service anytime.', type: 'general', link: '/services', daysAgo: 30 },
  ];
  for (const n of notifDefs) {
    await Notification.create({
      user: customerDocs[n.cust]._id, type: n.type, title: n.title, message: n.message,
      link: n.link, read: n.daysAgo > 3, readAt: n.daysAgo > 3 ? at(n.daysAgo, 9) : null,
      createdAt: at(n.daysAgo, 10), updatedAt: at(n.daysAgo, 10),
    });
  }
  console.log('[samples] notifications: ' + notifDefs.length);

  await mongoose.disconnect();
  console.log('[samples] done. Sample accounts sign in with ' + SAMPLE_PASSWORD + '.');
}

main().catch((err) => {
  console.error('[samples] failed', err);
  process.exit(1);
});
