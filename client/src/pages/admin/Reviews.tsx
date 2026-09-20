import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquareText, Reply, Star } from 'lucide-react';
import { useReviews, useUpdateReview } from '../../api/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { PageLoader } from '../../components/ui/Feedback';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Field, Select, Textarea } from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { formatDate, getErrorMessage } from '../../lib/utils';
import { unuser } from './shared';
import type { Review } from '../../types';

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
      ))}
    </span>
  );
}

const REVIEW_STATUSES = ['Pending', 'Published', 'Hidden'];

export default function Reviews() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useReviews({ page, limit: 12, status: status || undefined });
  const updateR = useUpdateReview();
  const toast = useToast();
  const [viewing, setViewing] = useState<Review | null>(null);
  const [reply, setReply] = useState('');
  const [publish, setPublish] = useState('Published');
  const [busy, setBusy] = useState(false);

  const open = (r: Review) => {
    setViewing(r);
    setReply(r.response ?? '');
    setPublish(r.status);
  };

  const save = async () => {
    if (!viewing) return;
    if (viewing.status !== 'Pending' && !reply.trim()) {
      toast.error('Add a response before editing this review');
      return;
    }
    setBusy(true);
    try {
      await updateR.mutateAsync({ id: viewing._id, data: { response: reply.trim(), status: publish } });
      toast.success('Review updated');
      setViewing(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const published = (data?.data ?? []).filter((r) => r.status === 'Published');
  const avg = published.length ? (published.reduce((s, r) => s + r.ratingOverall, 0) / published.length).toFixed(1) : '—';

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Reviews</title>
      </Helmet>
      <PageHeader
        title="Reviews"
        subtitle={`Customer feedback · avg ${avg}★ across ${published.length} published`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...REVIEW_STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(1); }}
            className={
              status === s
                ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-brand-400 dark:border-slate-700 dark:text-slate-300'
            }
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(data?.data ?? []).length === 0 && (
          <Card className="sm:col-span-2">
            <CardBody className="flex items-center justify-center gap-2 py-10 text-slate-400">
              <MessageSquareText className="h-5 w-5" /> No reviews here yet.
            </CardBody>
          </Card>
        )}
        {(data?.data ?? []).map((r) => (
          <Card key={r._id}>
            <CardBody className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <Stars value={r.ratingOverall} />
                <Badge tone={r.status === 'Published' ? 'green' : r.status === 'Pending' ? 'amber' : 'slate'}>{r.status}</Badge>
              </div>
              <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{unuser(r.customer)?.name ?? 'Customer'}</p>
              <p className="text-xs text-slate-400">{formatDate(r.createdAt)} · {r.ratingService}/5 service · {r.ratingStaff}/5 staff · {r.ratingTimeliness}/5 timeliness</p>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-300">{r.comment || 'No comment.'}</p>
              {r.response && (
                <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-slate-600 dark:bg-brand-500/10 dark:text-slate-300">
                  <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400"><Reply className="h-3 w-3" /> Response</p>
                  {r.response}
                </div>
              )}
              <div className="mt-4">
                <Button size="sm" variant="outline" className="w-full" onClick={() => open(r)}>
                  <Reply className="h-3.5 w-3.5" /> {r.response ? 'Edit response' : 'Respond'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {viewing && (
        <Modal open={!!viewing} onClose={() => setViewing(null)} title="Moderate review" size="md">
          <div className="flex items-center justify-between">
            <Stars value={viewing.ratingOverall} />
            <Badge tone={viewing.status === 'Published' ? 'green' : 'amber'}>{viewing.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{viewing.comment}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={publish} onChange={(e) => setPublish(e.target.value)}>
                {REVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Overall rating">
              <p className="flex h-9 items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Stars value={viewing.ratingOverall} /> {viewing.ratingOverall}/5</p>
            </Field>
          </div>
          <Field label="Your response">
            <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Thank the customer and address their feedback…" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setViewing(null)}>Cancel</Button>
            <Button loading={busy} onClick={() => void save()}>Save</Button>
          </div>
        </Modal>
      )}
    </>
  );
}