import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Send, Play, CheckCircle2, XCircle, Plus, Trash2, FileText, Phone, User, Car, Fuel, Gauge,
} from 'lucide-react';
import {
  useJobCard, useInspection, useEstimate, useAddLaborToJob, useAddPartToJob, useRemoveJobPart, useCloseJob,
  useSaveInspection, useCreateEstimate, useSendJobToInspection, useStartJob, useMarkJobQuality,
  useUpdateJobCard, useEmployees, useCreateInvoice, useParts,
} from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { StatusBadge, HealthScoreBadge } from '../../components/ui/Badge';
import { Field, Input, Select } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/Confirm';
import { formatCurrency, formatDate, formatTime, getErrorMessage } from '../../lib/utils';
import { unvehicle, unuser } from './shared';

const inspectionSections = [
  { section: 'Engine', items: ['Oil Leak', 'Compression', 'Noise / Vibration', 'Belts & Hoses'] },
  { section: 'Transmission', items: ['Fluid Level', 'Shifts', 'Noise'] },
  { section: 'Brakes', items: ['Front Pads', 'Rear Pads', 'Disc Condition', 'Brake Fluid'] },
  { section: 'Suspension', items: ['Shock Absorbers', 'Bushings', 'Alignment Wear'] },
  { section: 'Electrical', items: ['Battery', 'Lights', 'Alternator', 'Wiring'] },
  { section: 'Tyres', items: ['Tread Depth', 'Pressure', 'Sidewall Condition'] },
];

export default function JobCardDetail() {
  const { id } = useParams();
  const { data: job, isLoading } = useJobCard(id);
  const { data: inspection } = useInspection(id);
  const { data: estimate } = useEstimate(id);
  const { data: mechanics } = useEmployees({ role: 'mechanic', limit: 50 });
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const sendInspection = useSendJobToInspection();
  const startJob = useStartJob();
  const markQuality = useMarkJobQuality();
  const closeJob = useCloseJob();
  const update = useUpdateJobCard();
  const saveInspection = useSaveInspection();
  const createEstimate = useCreateEstimate();
  const addLabor = useAddLaborToJob();
  const addPart = useAddPartToJob();
  const removePart = useRemoveJobPart();
  const createInvoice = useCreateInvoice();

  const [mechanic, setMechanic] = useState('');
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [estOpen, setEstOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [partModal, setPartModal] = useState(false);
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  const [selectedPart, setSelectedPart] = useState('');

  const { data: parts } = useParts({ limit: 200, q: '' });

  const inspectionValues = useMemo(() => {
    const map: Record<string, string> = {};
    inspection?.sections?.forEach((s) => s.items.forEach((it) => (map[`${s.section}|${it.item}`] = it.status)));
    return map;
  }, [inspection]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const currentMap = { ...inspectionValues, ...statusMap };

  if (isLoading) return <PageLoader />;
  if (!job) return <EmptyState title="Job card not found" />;

  const v = unvehicle(job.vehicle);
  const c = unuser(job.customer);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitInspection = async () => {
    const sections = inspectionSections
      .map((s) => ({
        section: s.section,
        items: s.items.map((item) => ({ item, status: currentMap[`${s.section}|${item}`] ?? 'Good', notes: '' })),
      }))
      .filter((s) => s.items.length);
    await run(() => saveInspection.mutateAsync({ jobCardId: id!, data: { sections, odometer: job.mileageIn, status: 'Completed' } }), 'Inspection saved');
    setInspectionOpen(false);
  };

  const submitEstimate = async () => {
    const items = [
      ...(job.parts?.length ? job.parts.map((p) => ({ type: 'Part', description: `${p.name} (qty ${p.qty})`, qty: p.qty, rate: p.price, amount: p.qty * p.price })) : []),
    ];
    if (items.length === 0) {
      toast.error('Add parts or a labour line to the estimate first');
      return;
    }
    await run(() => createEstimate.mutateAsync({ jobCardId: id!, data: { items, taxRate: job.taxRate || 18 } }), 'Estimate sent for customer approval');
    setEstOpen(false);
  };

  const addPartToJob = async (partId?: string) => {
    const p = parts?.data?.find((x) => x._id === (partId || selectedPart));
    if (!p) {
      toast.error('Select a part');
      return;
    }
    await run(
      () => addPart.mutateAsync({ id: id!, data: { part: p._id, name: p.name, partNumber: p.partNumber, qty: partQty, price: partPrice || p.sellingPrice } }),
      'Part added to job card',
    );
    setPartModal(false);
    setPartQty(1);
    setPartPrice(0);
    setSelectedPart('');
  };

  const invoiceFromJob = async () => {
    await run(() => createInvoice.mutateAsync({ jobCard: id! }), 'Invoice created');
  };

  const isClosed = ['Invoiced', 'Closed'].includes(job.status);
  const isInvoiced = job.status === 'Invoiced';

  return (
    <>
      <Helmet>
        <title>Job Card {job.jobCardId}</title>
      </Helmet>
      <div className="mb-1">
        <Link to="/admin/job-cards" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Job cards
        </Link>
      </div>
      <PageHeader
        title={job.jobCardId}
        subtitle={`Opened ${formatDate(job.createdAt)} · ${c?.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={job.status} />
            {!isClosed && (
              <>
                {job.status === 'Open' && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => void run(() => sendInspection.mutateAsync(id!), 'Sent for inspection')}>
                    <Send className="h-3.5 w-3.5" /> Send for inspection
                  </Button>
                )}
                {['In Inspection', 'Estimate Pending'].includes(job.status) && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => setInspectionOpen(true)}>
                    <Play className="h-3.5 w-3.5" /> {inspection ? 'Update inspection' : 'Run inspection'}
                  </Button>
                )}
                {(job.status === 'Estimate Pending' || job.status === 'Open') && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => setEstOpen(true)}>
                    <FileText className="h-3.5 w-3.5" /> Create estimate
                  </Button>
                )}
                {job.status === 'Awaiting Approval' && (
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Waiting on customer…</span>
                )}
                {job.status === 'In Progress' && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => void run(() => markQuality.mutateAsync(id!), 'Sent to quality check')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Send to QC
                  </Button>
                )}
                {job.status === 'Quality Check' && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => setCloseOpen(true)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Close job
                  </Button>
                )}
                {job.status === 'Parts Ordered' && (
                  <Button size="sm" variant="outline" loading={busy} onClick={() => void run(() => startJob.mutateAsync(id!), 'Service started')}>
                    <Play className="h-3.5 w-3.5" /> Start service
                  </Button>
                )}
              </>
            )}
            {isClosed && !isInvoiced && (
              <Button size="sm" loading={busy} onClick={() => void invoiceFromJob()}>
                <FileText className="h-3.5 w-3.5" /> Create invoice
              </Button>
            )}
            {isInvoiced && (
              <Link to="/admin/invoices" className="btn-secondary btn-sm px-3 py-1.5 text-xs">View invoice</Link>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>Customer & vehicle</CardTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <User className="mt-0.5 h-5 w-5 text-brand-600 dark:text-brand-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{c?.name}</p>
                  <p className="text-xs text-slate-400">{c?.phone}</p>
                  <p className="text-xs text-slate-400">{c?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <Car className="mt-0.5 h-5 w-5 text-brand-600 dark:text-brand-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{v?.brand} {v?.model} ({v?.year})</p>
                  <p className="text-xs text-slate-400">{v?.regNumber} · {v?.fuelType}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <Gauge className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Mileage in</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{job.mileageIn.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <Fuel className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Fuel</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{job.fuelLevel}%</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Complaint</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{job.customerComplaint || '—'}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Health inspection</CardTitle>
                <CardDescription>
                  {inspection ? `Completed by workshop · ${formatDate(inspection.updatedAt)}` : 'Run a digital health scan on the vehicle'}
                </CardDescription>
              </div>
              <HealthScoreBadge score={inspection?.healthScore} />
            </div>
            {inspection?.sections ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inspection.sections.map((s) => (
                  <div key={s.section} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{s.section}</p>
                    <ul className="mt-2 space-y-1.5">
                      {s.items.map((it) => (
                        <li key={it.item} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-300">{it.item}</span>
                          <StatusBadge status={it.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No inspection yet" description="Click 'Run inspection' to generate a vehicle health score." />
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estimate</CardTitle>
                <CardDescription>{isClosed || job.status !== 'Awaiting Approval' ? 'Approved work order' : 'Awaiting customer decision'}</CardDescription>
              </div>
              {estimate && (
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(estimate.total)}</p>
                  <StatusBadge status={estimate.status} />
                </div>
              )}
            </div>
            {estimate?.items?.length ? (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {estimate.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium text-slate-800 dark:text-slate-100">{it.description}</td>
                      <td className="py-2 text-center text-slate-600 dark:text-slate-300">{it.qty}</td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-300">{formatCurrency(it.rate)}</td>
                      <td className="py-2 text-right font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No estimate created" description="Use 'Create estimate' once inspection is complete." />
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Parts & labour</CardTitle>
                <CardDescription>Items added to this job card</CardDescription>
              </div>
              {!isClosed && (
                <Button size="sm" variant="secondary" onClick={() => setPartModal(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add part
                </Button>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {(job.parts ?? []).map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.qty} × {formatCurrency(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(p.qty * p.price)}</span>
                    {!isClosed && (
                      <button className="text-slate-400 hover:text-red-500" onClick={() => void run(() => removePart.mutateAsync({ id: id!, index: i }), 'Part removed')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Labour charges</p>
                  <p className="text-xs text-slate-400">Workshop labour</p>
                </div>
                <div className="flex items-center gap-3">
                  {!isClosed ? (
                    <input
                      type="number"
                      className="input-base w-28 py-1.5 text-right"
                      defaultValue={job.laborCharges || 0}
                      onBlur={(e) => void run(() => addLabor.mutateAsync({ id: id!, laborCharges: Number(e.target.value) }), 'Labour updated')}
                    />
                  ) : (
                    <span className="font-bold">{formatCurrency(job.laborCharges)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white dark:bg-slate-800">
              <span className="text-sm font-semibold">Job total (incl. {job.taxRate}% tax)</span>
              <span className="font-display text-lg font-extrabold">{formatCurrency(job.total)}</span>
            </div>
          </Card>

          <Card>
            <CardTitle>Timeline</CardTitle>
            <div className="mt-4 space-y-2">
              {(job.statusHistory ?? []).map((h: { status: string; at: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">{h.status}</span>
                  <span className="text-xs text-slate-400">{formatDate(h.at, 'd MMM')} {formatTime(h.at)}</span>
                </div>
              ))}
              {(job.statusHistory ?? []).length === 0 && <p className="text-sm text-slate-400">No activity recorded yet.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Staff</CardTitle>
            <Field label="Assigned mechanic">
              <Select value={(unuser(job.assignedMechanic) as { _id?: string } | undefined)?._id ?? ''} onChange={(e) => void run(() => update.mutateAsync({ id: id!, data: { assignedMechanic: e.target.value || null } }), 'Mechanic assigned')}>
                <option value="">Unassigned</option>
                {(mechanics?.data ?? []).map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </Select>
            </Field>
            {job.serviceAdvisor && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Service advisor: <strong>{unuser(job.serviceAdvisor)?.name}</strong>
              </p>
            )}
          </Card>

          {inspection?.healthScore !== undefined && (
            <Card>
              <CardTitle>Health score</CardTitle>
              <div className="mt-3">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={
                      inspection.healthScore >= 75
                        ? 'h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : inspection.healthScore >= 50
                          ? 'h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'h-full rounded-full bg-gradient-to-r from-red-500 to-red-400'
                    }
                    style={{ width: `${inspection.healthScore}%` }}
                  />
                </div>
                <p className="mt-2 text-center font-display text-2xl font-extrabold text-slate-900 dark:text-white">{inspection.healthScore}/100</p>
              </div>
            </Card>
          )}

          <Card>
            <CardTitle>Total (raw)</CardTitle>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="py-2 text-slate-500 dark:text-slate-400">Parts</td><td className="py-2 text-right font-medium">{formatCurrency((job.parts ?? []).reduce((s, p) => s + p.qty * p.price, 0))}</td></tr>
                <tr><td className="py-2 text-slate-500 dark:text-slate-400">Labour</td><td className="py-2 text-right font-medium">{formatCurrency(job.laborCharges)}</td></tr>
                <tr><td className="py-2 text-slate-500 dark:text-slate-400">Tax ({job.taxRate}%)</td><td className="py-2 text-right font-medium">{formatCurrency(Math.round(job.total <= 0 ? 0 : job.total - job.total / (1 + job.taxRate / 100)))}</td></tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <Modal open={inspectionOpen} onClose={() => setInspectionOpen(false)} title="Vehicle health inspection" size="xl">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Scan each area and save. A health score out of 100 is generated automatically.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inspectionSections.map((s) => (
            <div key={s.section} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{s.section}</p>
              <div className="mt-2 space-y-2">
                {s.items.map((item) => {
                  const key = `${s.section}|${item}`;
                  return (
                    <select
                      key={key}
                      value={currentMap[key] ?? 'Good'}
                      onChange={(e) => setStatusMap((m) => ({ ...m, [key]: e.target.value }))}
                      className="input-base py-1.5 text-xs"
                    >
                      <option>Good</option>
                      <option>Attention Needed</option>
                      <option>Replace</option>
                      <option>Critical</option>
                    </select>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setInspectionOpen(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void submitInspection()}>Save inspection & health score</Button>
        </div>
      </Modal>

      <Modal open={estOpen} onClose={() => setEstOpen(false)} title="Send estimate for approval" size="md">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Estimate total will be built from current job cards. Tax rate {job.taxRate || 18}%. Customer will receive a push + email immediately.
        </p>
        <div className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Items from job card:</p>
          {(job.parts ?? []).map((p, i) => (
            <p key={i} className="mt-1 flex justify-between text-slate-600 dark:text-slate-300">
              <span>{p.name} × {p.qty}</span>
              <span>{formatCurrency(p.qty * p.price)}</span>
            </p>
          ))}
          <p className="mt-2 flex justify-between font-bold">
            <span>Labour</span>
            <span>{formatCurrency(job.laborCharges)}</span>
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setEstOpen(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void submitEstimate()}>
            <Send className="h-4 w-4" /> Send estimate
          </Button>
        </div>
      </Modal>

      <Modal open={partModal} onClose={() => setPartModal(false)} title="Add part to job card" size="sm">
        <Field label="Part">
          <Select value={selectedPart} onChange={(e) => { setSelectedPart(e.target.value); const p = parts?.data?.find((x) => x._id === e.target.value); setPartPrice(p?.sellingPrice ?? 0); }}>
            <option value="">Select part…</option>
            {(parts?.data ?? []).map((p) => (
              <option key={p._id} value={p._id}>{p.name} ({p.stock} in stock) — {formatCurrency(p.sellingPrice)}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Qty">
            <Input type="number" min={1} value={partQty} onChange={(e) => setPartQty(Number(e.target.value))} />
          </Field>
          <Field label="Unit price">
            <Input type="number" min={0} value={partPrice} onChange={(e) => setPartPrice(Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setPartModal(false)}>Cancel</Button>
          <Button loading={busy} onClick={() => void addPartToJob()}>Add part</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={() => void run(() => closeJob.mutateAsync(id!), 'Job card closed. Service record created.')}
        title="Close job card"
        message="Closing marks the vehicle ready and creates the permanent service record. Continue?"
        confirmLabel="Close job"
        loading={busy}
      />
    </>
  );
}