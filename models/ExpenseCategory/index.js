const mongoose = require('mongoose');
const {Schema} = mongoose;

const expenseCategorySchema = new Schema({
    userId: String,
    category : String,
    createdAt:  {type: Date, default: Date.now},
})

const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema);

module.exports = ExpenseCategory;