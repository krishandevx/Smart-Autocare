import { Route, Routes, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppShell, customerNav, adminNav } from './components/layout/AppShell';
import { ProtectedRoute, StaffRoute } from './components/ui/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { APP_NAME } from './constants';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import ServiceDetails from './pages/public/ServiceDetails';
import VehicleTypes from './pages/public/VehicleTypes';
import Pricing from './pages/public/Pricing';
import HowItWorks from './pages/public/HowItWorks';
import Contact from './pages/public/Contact';
import Faq from './pages/public/Faq';
import BookService from './pages/public/BookService';
import NotFound from './pages/public/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import CustomerDashboard from './pages/customer/Dashboard';
import MyVehicles from './pages/customer/MyVehicles';
import BookServicePortal from './pages/customer/BookService';
import MyBookings from './pages/customer/MyBookings';
import ActiveService from './pages/customer/ActiveService';
import ServiceHistory from './pages/customer/ServiceHistory';
import MyInvoices from './pages/customer/MyInvoices';
import MyReminders from './pages/customer/MyReminders';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerProfile from './pages/customer/Profile';
import CustomerSettings from './pages/customer/Settings';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminBookings from './pages/admin/Bookings';
import JobCards from './pages/admin/JobCards';
import JobCardDetail from './pages/admin/JobCardDetail';
import Inspections from './pages/admin/Inspections';
import Estimates from './pages/admin/Estimates';
import Customers from './pages/admin/Customers';
import CustomerDetail from './pages/admin/CustomerDetail';
import AdminVehicles from './pages/admin/Vehicles';
import VehicleDetail from './pages/admin/VehicleDetail';
import AdminServices from './pages/admin/Services';
import Employees from './pages/admin/Employees';
import Inventory from './pages/admin/Inventory';
import PartDetail from './pages/admin/PartDetail';
import Suppliers from './pages/admin/Suppliers';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import AdminInvoices from './pages/admin/Invoices';
import InvoiceDetail from './pages/admin/InvoiceDetail';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';
import Reviews from './pages/admin/Reviews';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';

function AuthRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'customer' ? '/account' : '/admin'} replace />;
  return <Login />;
}

export default function App() {
  return (
    <>
      <Helmet defaultTitle={APP_NAME} titleTemplate={`%s · ${APP_NAME}`} />
      <Routes>
        <Route path="/login" element={<AuthRedirect />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/vehicle-types" element={<VehicleTypes />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route
            path="/book"
            element={
              <ProtectedRoute>
                <BookService />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/account/*"
          element={
            <ProtectedRoute roles={['customer']}>
              <AppShell
                config={{
                  name: 'Customer Portal',
                  nav: customerNav,
                  allowedRoles: ['customer'],
                  base: '/account',
                }}
              >
                <CustomerRoutes />
              </AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <StaffRoute>
              <AppShell config={{ name: 'Admin Panel', nav: adminNav, allowedRoles: ['admin', 'workshop_manager', 'service_advisor', 'mechanic', 'inventory_manager', 'accountant', 'super_admin'], base: '/admin' }}>
                <AdminRoutes />
              </AppShell>
            </StaffRoute>
          }
        />
      </Routes>
    </>
  );
}

function CustomerRoutes() {
  return (
    <Routes>
      <Route path="" element={<CustomerDashboard />} />
      <Route path="vehicles" element={<MyVehicles />} />
      <Route path="book" element={<BookServicePortal />} />
      <Route path="bookings" element={<MyBookings />} />
      <Route path="service" element={<ActiveService />} />
      <Route path="history" element={<ServiceHistory />} />
      <Route path="invoices" element={<MyInvoices />} />
      <Route path="reminders" element={<MyReminders />} />
      <Route path="notifications" element={<CustomerNotifications />} />
      <Route path="profile" element={<CustomerProfile />} />
      <Route path="settings" element={<CustomerSettings />} />
      <Route path="*" element={<Navigate to="/account" replace />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="" element={<AdminDashboard />} />
      <Route path="appointments" element={<AdminAppointments />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="job-cards" element={<JobCards />} />
      <Route path="job-cards/:id" element={<JobCardDetail />} />
      <Route path="inspections" element={<Inspections />} />
      <Route path="estimates" element={<Estimates />} />
      <Route path="customers" element={<Customers />} />
      <Route path="customers/:id" element={<CustomerDetail />} />
      <Route path="vehicles" element={<AdminVehicles />} />
      <Route path="vehicles/:id" element={<VehicleDetail />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="employees" element={<Employees />} />
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/:id" element={<PartDetail />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="purchase-orders" element={<PurchaseOrders />} />
      <Route path="invoices" element={<AdminInvoices />} />
      <Route path="invoices/:id" element={<InvoiceDetail />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="notifications" element={<AdminNotifications />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}