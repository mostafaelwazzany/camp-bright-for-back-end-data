const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
fullName:{type :String, required:true},
username:{type :String, required:true, unique:true},
email:{type :String, required:true, unique:true},
password:{type :String, required:true},
phone:{type :Number},
role: {type:String, enum:['customer', 'provider','admin'], default:'customer'},
isEmailVerified:{type:Boolean, default:false},
},
{timestamps:true});

module.exports = mongoose.model('User', userSchema);
