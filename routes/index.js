var express = require('express');
const AuthToken = require('../Auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const uuid4 = require('uuid4');
var router = express.Router();

router.post('/register', async(req, res)=>{
  try{
    const {userName, name, email, password, mobile, address, role, image} = req.body;
    if(!userName||!name||!email||!mobile||!password){
      return res.status(400).json({message: "Please fill all fields"});
    }
    const isEmailExisting = await User.findOne({email: email});
    const isMobileExisting = await User.findOne({mobile: mobile});
    const isUserNameExisting = await User.findOne({userName: userName});
    if(isEmailExisting){
      return res.status(400).json({message: "Email already exists, Please Login!!"});
    }
    if(isMobileExisting){
      return res.status(400).json({message: "Mobile Number already exists, Please Login!!"})
    }
    if(isUserNameExisting){
      return res.status(400).json({message: "Username already exists, Please choose a different one!!"})
    }
    const userId = uuid4();
    const response = await User.create({userId, userName, name, email, password, mobile, address, role, image});
    res.json(response);
  }catch(error){
    res.status(500).json({message:'cannot register'});
  }
})

router.post('/login', async(req, res)=>{
  try{
    const {userName, password} = req.body;
    const user = await User.findOne({userName:userName});
    if(!user){
      return res.status(400).json({message: 'Register To continue!!'});
    }
    if(user.password === password){
      const token = jwt.sign({userName:user.userName, userId:user.userId, email:user.email, mobile:user.mobile, role:user.role}, process.env.DB_URL,{expiresIn:'100d'})
      res.status(200).json({token:token, message:'Login Successfull!!'});
    }
  }catch(error){
    console.log(error);
    res.status(500).json({message:'Cannot login'})
  }
})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
