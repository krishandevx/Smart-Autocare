import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    jobCard: { type: Schema.Types.ObjectId, ref: 'JobCard', default: null },
    ratingOverall: { type: Number, required: true, min: 1, max: 5 },
    ratingService: { type: Number, min: 1, max: 5, default: 5 },
    ratingStaff: { type: Number, min: 1, max: 5, default: 5 },
    ratingTimeliness: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, default: '' },
    response: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Published', 'Hidden'], default: 'Pending' },
  },
  { timestamps: true },
);

export const Review = model<any>('Review', reviewSchema);