const mongoose = require('mongoose');
const {Schema} = mongoose;

const expenseSchema = new Schema({
    userId:String,
    expenseId:String,
    category:String,
    amount: Number,
    date: {type:Date},
    description: String,
})

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;