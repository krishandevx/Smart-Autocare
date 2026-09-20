import mongoose from 'mongoose';
const m = await mongoose.connect('mongodb://127.0.0.1:27017/smart_autocare');
const r1 = await m.connection.db.collection('invoices').aggregate([{ $match: { paymentStatus: { $nin: ['Void'] } } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]).toArray();
console.log('raw driver:', r1);
