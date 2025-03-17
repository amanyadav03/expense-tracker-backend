const mongoose = require('mongoose');
const {Schema} = mongoose;

const expenseSchema = new Schema({
    userId:String,
    expenseId:String,
    category:String,
    amount: Number,
    paymentMethod: String,
    date: {type:Date, default: Date.now},
    createdAt: {type:Date, default: Date.now},
    description: String,
})

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;