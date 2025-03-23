const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    userId: String,
    userName: String,
    name: String,
    email: String,
    password: String,
    mobile: String,
    monthlyBudget: Number,
    address: String,
    role: String,
    image: String,
    createdAt: {default: Date.now, type: Date},
})

const User = mongoose.model('User', userSchema);

module.exports = User;