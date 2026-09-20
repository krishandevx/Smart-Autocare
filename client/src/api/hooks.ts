import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client, get, post, put, del, makeUrl } from './client';
import type {
  ApiResponse,
  Appointment,
  Booking,
  BusinessSettings,
  CustomerDashboardData,
  DashboardData,
  Employee,
  Estimate,
  Inspection,
  InventoryTransaction,
  Invoice,
  JobCard,
  Notification,
  Paginated,
  Part,
  Payment,
  PublicMeta,
  PurchaseOrder,
  Reminder,
  Review,
  Service,
  ServiceRecord,
  Supplier,
  User,
  Vehicle,
} from '../types';

const q = (key: unknown[]) => key.map((k) => String(k)).join(':');

export function usePublicMeta() {
  return useQuery({ queryKey: ['public/meta'], queryFn: () => get<PublicMeta>('/public/meta') });
}

export function useServices(params: { category?: string } = {}) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => get<Service[]>(makeUrl('/public/services', params)),
  });
}

export function useTimeSlots(date: string, service: string) {
  return useQuery({
    queryKey: ['public/time-slots', date, service],
    queryFn: () => get<{ available: boolean; slots: string[]; message: string }>(makeUrl('/public/time-slots', { date, service })),
    enabled: !!date,
  });
}

export function usePublicSettings() {
  return useQuery({ queryKey: ['public/settings'], queryFn: () => get<Record<string, unknown>>('/public/settings') });
}

export function useLogin() {
  return post;
}

export function useMyVehicles() {
  return useQuery({ queryKey: ['vehicles'], queryFn: () => get<Paginated<Vehicle>>('/vehicles') });
}

export function useVehiclesList(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['vehicles', params], queryFn: () => get<Paginated<Vehicle>>(makeUrl('/vehicles', params)) });
}

export function useVehicle(id?: string) {
  return useQuery({ queryKey: ['vehicles', id], queryFn: () => get<Vehicle>(`/vehicles/${id}`), enabled: !!id });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Partial<Vehicle>) => post<Vehicle>('/vehicles', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['vehicles'] }) });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => put<Vehicle>(`/vehicles/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['vehicles'] }) });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del<ApiResponse<void>>(`/vehicles/${id}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['vehicles'] }) });
}

export function useBookings(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['bookings', params], queryFn: () => get<Paginated<Booking>>(makeUrl('/bookings', params)) });
}

export function useBooking(id?: string) {
  return useQuery({ queryKey: ['bookings', id], queryFn: () => get<Booking>(`/bookings/${id}`), enabled: !!id });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post<Booking>('/bookings', data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bookings'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post<Booking>(`/bookings/${id}/cancel`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, timeSlot }: { id: string; date: string; timeSlot: string }) => post<Booking>(`/bookings/${id}/reschedule`, { date, timeSlot }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useAppointments(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['appointments', params], queryFn: () => get<Paginated<Appointment>>(makeUrl('/appointments', params)) });
}

export function useAppointment(id?: string) {
  return useQuery({ queryKey: ['appointments', id], queryFn: () => get<Appointment>(`/appointments/${id}`), enabled: !!id });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Appointment>('/appointments', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['appointments'] }) });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Appointment>(`/appointments/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['appointments'] }) });
}

export function useJobCards(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['job-cards', params], queryFn: () => get<Paginated<JobCard>>(makeUrl('/job-cards', params)) });
}

export function useJobCard(id?: string) {
  return useQuery({ queryKey: ['job-cards', id], queryFn: () => get<JobCard>(`/job-cards/${id}`), enabled: !!id });
}

export function useCreateJobCard() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<JobCard>('/job-cards', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useUpdateJobCard() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<JobCard>(`/job-cards/${id}/assign`, { mechanic: data.assignedMechanic ?? null, serviceAdvisor: data.serviceAdvisor ?? null }), onSuccess: (_, v) => void qc.invalidateQueries({ queryKey: ['job-cards', v.id] }) });
}

export function useRemoveJobPart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, index }: { id: string; index: number }) => del<ApiResponse<void>>(`/job-cards/${id}/parts/${index}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useAddLaborToJob() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, laborCharges }: { id: string; laborCharges: number }) => put<JobCard>(`/job-cards/${id}/labor`, { laborCharges }), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useAddPartToJob() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => post<JobCard>(`/job-cards/${id}/parts`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useSendJobToInspection() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<JobCard>(`/job-cards/${id}/send-inspection`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useStartJob() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<JobCard>(`/job-cards/${id}/start`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useMarkJobQuality() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<JobCard>(`/job-cards/${id}/quality`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<JobCard>(`/job-cards/${id}/close`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards'] }) });
}

export function useInspection(jobCardId?: string) {
  return useQuery({ queryKey: ['inspections', jobCardId], queryFn: () => get<Inspection>(`/job-cards/${jobCardId}/inspection`), enabled: !!jobCardId });
}

export function useSaveInspection() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ jobCardId, data }: { jobCardId: string; data: Record<string, unknown> }) => post<Inspection>(`/job-cards/${jobCardId}/inspection`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['inspections'] }) });
}

export function useEstimate(jobCardId?: string) {
  return useQuery({ queryKey: ['estimates', jobCardId], queryFn: () => get<Estimate>(`/job-cards/${jobCardId}/estimate`), enabled: !!jobCardId });
}

export function useCreateEstimate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ jobCardId, data }: { jobCardId: string; data: Record<string, unknown> }) => post<Estimate>(`/job-cards/${jobCardId}/estimate`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['estimates'] }) });
}

export function useSendEstimate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<Estimate>(`/estimates/${id}/send`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['estimates'] }) });
}

export function useEstimateDecision() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, decision }: { id: string; decision: 'Approved' | 'Rejected' }) => post<Estimate>(`/estimates/${id}/decision`, { decision }), onSuccess: () => void qc.invalidateQueries({ queryKey: ['estimates'] }) });
}

export function useInvoices(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['invoices', params], queryFn: () => get<Paginated<Invoice>>(makeUrl('/invoices', params)) });
}

export function useInvoice(id?: string) {
  return useQuery({ queryKey: ['invoices', id], queryFn: () => get<Invoice>(`/invoices/${id}`), enabled: !!id });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Invoice>('/invoices', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['invoices'] }) });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => put<Invoice>(`/invoices/${id}`, { paymentStatus: 'Void' }), onSuccess: () => void qc.invalidateQueries({ queryKey: ['invoices'] }) });
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => post<{ payment: Payment; invoice: Invoice }>(`/invoices/${data.invoice}/payments`, { amount: data.amount, method: data.method, reference: data.reference, notes: data.notes, date: data.date }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function usePayments(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['payments', params], queryFn: () => get<Paginated<Payment>>(makeUrl('/payments', params)) });
}

export function useParts(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['parts', params], queryFn: () => get<Paginated<Part>>(makeUrl('/inventory/parts', params)) });
}

export function usePart(id?: string) {
  return useQuery({ queryKey: ['parts', id], queryFn: () => get<Part>(`/inventory/parts/${id}`), enabled: !!id });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Part>('/inventory/parts', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['parts'] }) });
}

export function useUpdatePart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Part>(`/inventory/parts/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['parts'] }) });
}

export function useDeletePart() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del<ApiResponse<void>>(`/inventory/parts/${id}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['parts'] }) });
}

export function useInventoryTransactions(partId?: string) {
  return useQuery({ queryKey: ['transactions', partId], queryFn: () => get<InventoryTransaction[]>(`/inventory/parts/${partId}/transactions`), enabled: !!partId });
}

export function useStockIn() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ part, quantity, reference, notes }: { part: string; quantity: number; reference?: string; notes?: string }) => post<Part>(`/inventory/parts/${part}/stock`, { qty: quantity, type: 'IN', reason: reference || notes || 'Stock in' }), onSuccess: () => void qc.invalidateQueries({ queryKey: ['parts'] }) });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ part, quantity, reason }: { part: string; quantity: number; reason?: string }) => post<Part>(`/inventory/parts/${part}/stock`, { qty: quantity, type: 'ADJUSTMENT', reason: reason || 'Manual adjustment' }), onSuccess: () => void qc.invalidateQueries({ queryKey: ['parts'] }) });
}

export function useSuppliers(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['suppliers', params], queryFn: () => get<Paginated<Supplier>>(makeUrl('/inventory/suppliers', params)) });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Supplier>('/inventory/suppliers', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['suppliers'] }) });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Supplier>(`/inventory/suppliers/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['suppliers'] }) });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del<ApiResponse<void>>(`/inventory/suppliers/${id}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['suppliers'] }) });
}

export function usePurchaseOrders(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['purchase-orders', params], queryFn: () => get<Paginated<PurchaseOrder>>(makeUrl('/inventory/purchases', params)) });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<PurchaseOrder>('/inventory/purchases', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
}

export function useUpdatePO() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<PurchaseOrder>(`/inventory/purchases/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
}

export function useReceivePO() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => post<PurchaseOrder>(`/inventory/purchases/${id}/receive`, {}), onSuccess: () => void qc.invalidateQueries({ queryKey: ['purchase-orders'] }) });
}

export function useAdminServices(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['services', params], queryFn: () => get<Paginated<Service>>(makeUrl('/admin/services', params)) });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Service>('/admin/services', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['services'] }) });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Service>(`/admin/services/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['services'] }) });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del<ApiResponse<void>>(`/admin/services/${id}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['services'] }) });
}

export function useEmployees(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['employees', params], queryFn: () => get<Paginated<Employee>>(makeUrl('/admin/employees', params)) });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Employee>('/admin/employees', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }) });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Employee>(`/admin/employees/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }) });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => del<ApiResponse<void>>(`/admin/employees/${id}`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }) });
}

export function useCustomers(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['customers', params], queryFn: () => get<Paginated<Customer2>>(makeUrl('/admin/customers', params)) });
}

export type Customer2 = User & { vehicleCount?: number; bookingCount?: number };
export type CustomerDetail2 = User & { vehicles?: Vehicle[]; recentBookings?: Booking[]; recentInvoices?: Invoice[] };

export function useCustomer(id?: string) {
  return useQuery({ queryKey: ['customers', id], queryFn: () => get<CustomerDetail2>(`/admin/customers/${id}`), enabled: !!id });
}

export function useReminders(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['reminders', params], queryFn: () => get<Paginated<Reminder>>(makeUrl('/reminders', params)) });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Reminder>('/reminders', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['reminders'] }) });
}

export function useUpdateReminder() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Reminder>(`/reminders/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['reminders'] }) });
}

export function useNotifications(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['notifications', params], queryFn: () => get<Paginated<Notification>>(makeUrl('/notifications', params)) });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => put<Notification>(`/notifications/${id}/read`), onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }) });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => put<ApiResponse<void>>('/notifications/read-all'), onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }) });
}

export function useReviews(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['reviews', params], queryFn: () => get<Paginated<Review>>(makeUrl('/admin/reviews', params)) });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Review>(`/admin/reviews/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['reviews'] }) });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Review>('/reviews', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['reviews'] }) });
}

export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin/dashboard'], queryFn: () => get<DashboardData>('/admin/dashboard') });
}

export function useCustomerDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => get<CustomerDashboardData>('/dashboard') });
}

export function useReports(type: string, unit: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', type, unit, from, to],
    queryFn: () => get<Record<string, unknown>>(makeUrl('/admin/reports', { type, unit, from, to })),
  });
}

export function useReportsAll(unit: string) {
  return useQuery({ queryKey: ['reports', unit], queryFn: () => get<Record<string, unknown>>(makeUrl('/admin/reports', { unit })) });
}

export function useGlobalSearch(params: Record<string, unknown> = {}) {
  const qq = String(params.q ?? '');
  const enabled = qq.trim().length >= 2;
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => get<unknown>(makeUrl('/admin/search', params)),
    enabled,
  });
}

export function useServiceRecords(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['records', params], queryFn: () => get<Paginated<ServiceRecord>>(makeUrl('/service-records', params)) });
}

export function useCreateEstimateForJob(jobCardId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<Estimate>(`/job-cards/${jobCardId}/estimate`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['job-cards', jobCardId] }) });
}

export function useAdminEstimates(params: Record<string, unknown> = {}) {
  return useQuery({ queryKey: ['admin-estimates', params], queryFn: () => get<Paginated<Estimate>>(makeUrl('/admin/estimates', params)) });
}

export function useUpdateEstimate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => put<Estimate>(`/admin/estimates/${id}`, data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-estimates'] }) });
}

export function useAdminEstimateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'Approved' | 'Rejected' }) => post<Estimate>(`/admin/estimates/${id}/decision`, { decision }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-estimates'] });
      void qc.invalidateQueries({ queryKey: ['job-cards'] });
    },
  });
}

export function useGetSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => get<BusinessSettings>('/admin/settings') });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => put<BusinessSettings>('/admin/settings', data), onSuccess: () => void qc.invalidateQueries({ queryKey: ['settings'] }) });
}

export function useNotifyStaff() {
  return useMutation({ mutationFn: (data: Record<string, unknown>) => post<ApiResponse<void>>('/admin/notify', data) });
}