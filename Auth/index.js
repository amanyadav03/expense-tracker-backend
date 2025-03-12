const jwt = require("jsonwebtoken");
require('dotenv').config()
const AuthToken = async(req, res, next) =>{
    const token = req.header('Authentication');
    if(!token){
        return res.status(401).send({error: 'Access Denied'});
    }
    try{
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
        }catch(error){
        res.status(400).send({error: error.message});
    }
}

module.exports = AuthToken;