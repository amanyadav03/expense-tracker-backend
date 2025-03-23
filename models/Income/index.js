const mongoose = require('mongoose');
const {Schema} = mongoose;

const incomeSchema = new Schema({
    userId: String,
    amount: Number,
    category: String,
    description: String,
    date: Date,
    source: String,
    paymentMethod: String,
    isRecurring: Boolean,
    frequency: String,
    createdAt: {type: Date, default: Date.now},
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;