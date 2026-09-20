import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export type SequenceKey =
  | 'booking'
  | 'jobcard'
  | 'invoice'
  | 'estimate'
  | 'purchase'
  | 'part'
  | 'appointment';

function prefix(key: SequenceKey): string {
  const map: Record<SequenceKey, string> = {
    booking: 'SAC-BK',
    jobcard: 'SAC-JC',
    invoice: 'SAC-INV',
    estimate: 'SAC-EST',
    purchase: 'SAC-PO',
    part: 'SAC-PT',
    appointment: 'SAC-APP',
  };
  return map[key];
}

export async function nextId(key: SequenceKey): Promise<string> {
  const year = new Date().getFullYear();
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const seq = (doc?.seq ?? 0).toString().padStart(6, '0');
  return `${prefix(key)}-${year}-${seq}`;
}