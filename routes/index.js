var express = require('express');
const AuthToken = require('../Auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const uuid4 = require('uuid4');
const bcrypt = require("bcrypt");

const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');
const Income = require('../models/Income');
var router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { userName, name, email, password, mobile, address, role, image } = req.body;

    // Validate required fields
    if (!userName || !name || !email || !mobile || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if email, mobile number, or username already exists
    const [isEmailExisting, isMobileExisting, isUserNameExisting] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ mobile }),
      User.findOne({ userName })
    ]);

    if (isEmailExisting) {
      return res.status(400).json({ message: "Email already exists, please login!" });
    }
    if (isMobileExisting) {
      return res.status(400).json({ message: "Mobile number already exists, please login!" });
    }
    if (isUserNameExisting) {
      return res.status(400).json({ message: "Username already exists, please choose a different one!" });
    }

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = uuid4();
    const newUser = await User.create({
      userId,
      userName,
      name,
      email,
      password: hashedPassword,  // Store hashed password
      mobile,
      address,
      role,
      image
    });

    // Remove password from response for security
    const response = { ...newUser._doc };
    delete response.password;

    res.status(201).json({ message: "User registered successfully", user: response });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Cannot register user" });
  }
});

router.post('/login', async (req, res) => {
  try {
      const { userName, password } = req.body;
      const user = await User.findOne({ email: userName });

      if (!user) {
          return res.status(400).json({ message: 'User not registered' });
      }

      // Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
          {
              userName: user.userName,
              userId: user.userId,
              name: user.name,
              email: user.email,
              mobile: user.mobile,
              role: user.role,
              monthlyBudget: user.monthlyBudget,
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }  // Changed to 7 days for better security
      );
      res.status(200).json({ token, message: 'Login successful!' });
  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
});

router.post('/expense', AuthToken, async (req, res) => {
  try {
    console.log("Incoming request headers:", req.headers);
    console.log("Incoming request body:", req.body);

    const { userId } = req.user;
    console.log('user',userId);
    const { amount, description, date, category, paymentMethod } = req.body;

    // Validate the essential fields
    if (!amount || !description || !category || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check the date format and handle it properly
    const expenseDate = date ? new Date(date) : new Date();
    if (isNaN(expenseDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    console.log("Parsed Date:", expenseDate.toISOString());

    const expenseId = uuid4();
    const expenseData = {
      userId,
      expenseId,
      category: category.toLowerCase(),
      amount: Number(amount),
      paymentMethod,
      date: expenseDate,
      description,
    };

    const response = await Expense.create(expenseData);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: 'Could not add expense' });
  }
});


router.get('/expense', AuthToken, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(userId)
    const response = await Expense.find({ userId });

    if (!response || response.length === 0) {
      return res.status(404).json({ message: 'No expenses found for this user' });
    }

    res.status(200).json({ message: 'Expenses retrieved successfully', expenses: response });
  } catch (error) {
    console.error("Error retrieving expenses:", error.message);
    res.status(500).json({ message: 'Could not retrieve expenses' });
  }
});

router.get('/expense/category', AuthToken, async(req, res)=>{
  try{
    const {userId} = req.user;
    const {category} = req.query;
    const response = await Expense.find({userId: userId, category: { $regex: category, $options: "i" }});
    res.status(200).json(response);
  }catch(error){
    res.status(500).json({message:'could not get expense'})
  }
})

router.post('/income', AuthToken, async (req, res) => {
  try{
    const {amount, category, date, description, source, paymentMethod, isRecurring, frequency} = req.body;
    const {userId} = req.user;
    const incomeData = {
      userId,
      amount, 
      category: category.toLowerCase(), 
      date, 
      description, 
      source, 
      paymentMethod, 
      isRecurring, 
      frequency
    }
    console.log();
    const response  = await Income.create(incomeData);
    res.status(200).json(response);
  }catch(err){
    console.error(err)
    res.status(500).json({message:err});
  }
});

router.get('/income', AuthToken, async (req, res) => {
  try{
    const {userId} = req.user;
    const response  = await Income.find({userId : userId});
    res.status(200).json({
      income: response
    });
  }catch(err){
    res.status(500).json({message:err});
  }
});

router.get('/transactions', AuthToken, async(req, res)=>{
  try{
    const {userId} = req.user;
    const expense = await Expense.find({userId: userId});
    const income = await Income.find({userId: userId});
    const response = [...expense, ...income];
    res.status(200).json({txn: response});
  }catch(error){
    res.status(500).json({message:'could not get transactions', error: error});
  }
});

router.get('/dashboard', AuthToken, async(req, res)=>{
  try{
    const {userId} = req.user;
    const expenseTotal = await Expense.aggregate([
      {$match:{userId}},
      {$group : { _id: null, total: {$sum: "$amount"}}},
    ]);

    const incomeTotal = await Income.aggregate([
      {$match: {userId}},
      {$group: {_id: null, total: {$sum: "$amount"}}},
    ]);

    const expenseByCat = await Expense.aggregate([
      {$match: {userId}},
      {$group: {_id: "$category", total: {$sum: "$amount"}}}
    ])

    res.status(200).json({expense: expenseTotal, income: incomeTotal, expenseByCategory: expenseByCat});
  }catch(err){
    res.status(500).json({message:'cannot fetch dashboard data', error: err});
  }
})

module.exports = router;
