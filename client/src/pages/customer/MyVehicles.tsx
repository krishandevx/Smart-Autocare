import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Car } from 'lucide-react';
import { useMyVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../lib/utils';
import { VEHICLE_TYPES, VEHICLE_CATEGORIES, FUEL_TYPES, TRANSMISSIONS } from '../../constants';
import type { Vehicle } from '../../types';

const empty = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  regNumber: '',
  type: 'Four Wheeler' as const,
  category: 'Hatchback',
  fuelType: 'Petrol' as const,
  transmission: 'Manual',
  mileage: 0,
};

export default function MyVehicles() {
  const { data, isLoading } = useMyVehicles();
  const createV = useCreateVehicle();
  const updateV = useUpdateVehicle();
  const deleteV = useDeleteVehicle();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      brand: v.brand,
      model: v.model,
      year: v.year,
      regNumber: v.regNumber,
      type: (v.type as typeof empty.type) || empty.type,
      category: v.category || VEHICLE_CATEGORIES[v.type]?.[0] || '',
      fuelType: (v.fuelType as typeof empty.fuelType) || empty.fuelType,
      transmission: v.transmission || 'Manual',
      mileage: v.mileage ?? 0,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.brand || !form.model || !form.regNumber) {
      toast.error('Brand, model and registration number are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) await updateV.mutateAsync({ id: editing._id, data: payload });
      else await createV.mutateAsync(payload);
      toast.success(editing ? 'Vehicle updated' : 'Vehicle added');
      setModalOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await deleteV.mutateAsync(deleting._id);
      toast.success('Vehicle removed');
      setDeleting(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const vehicles = data?.data ?? [];

  return (
    <>
      <Helmet>
        <title>My Vehicles</title>
      </Helmet>
      <PageHeader
        title="My Vehicles"
        subtitle={`${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'} on your account`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add vehicle
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : vehicles.length === 0 ? (
        <Card>
          <EmptyState
            title="No vehicles yet"
            description="Add your first vehicle to start booking services."
            action={
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4" /> Add your first vehicle
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v._id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Car className="h-6 w-6" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleting(v)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
                {v.brand} {v.model} <span className="text-sm font-medium text-slate-400">{v.year}</span>
              </h3>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{v.regNumber}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v.category || v.type}</span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v.fuelType}</span>
                {v.transmission && <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v.transmission}</span>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                <span>{v.mileage ? `${v.mileage.toLocaleString()} km` : '—'}</span>
                <span>{v.purchaseDate ? `Owned since ${new Date(v.purchaseDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ''}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit vehicle' : 'Add a vehicle'} size="md">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration number" required>
            <Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value.toUpperCase() })} placeholder="KA-01-AB-1234" />
          </Field>
          <Field label="Vehicle type" required>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof empty.type, category: VEHICLE_CATEGORIES[e.target.value]?.[0] || '' })}
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category" required>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {(VEHICLE_CATEGORIES[form.type] ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Brand" required>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Maruti" />
          </Field>
          <Field label="Model" required>
            <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Swift" />
          </Field>
          <Field label="Year" required>
            <Input type="number" min={1980} max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </Field>
          <Field label="Fuel type" required>
            <Select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value as typeof empty.fuelType })}>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
          </Field>
          <Field label="Transmission">
            <Select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Current mileage (km)">
            <Input type="number" min={0} value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={() => void save()}>{editing ? 'Save changes' : 'Add vehicle'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void doDelete()}
        title="Remove vehicle"
        message={`Remove ${deleting?.brand} ${deleting?.model} (${deleting?.regNumber})? Service history will be kept for records.`}
        confirmLabel="Remove"
      />
    </>
  );
}