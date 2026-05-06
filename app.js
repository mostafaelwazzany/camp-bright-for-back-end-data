const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const mongoSanitize = require('mongo-sanitize');
const bodyParser = require('body-parser');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

let secretKey = "uyfwefq-d#23986235423SFGoiufa!#$@$%@#%$"
let tokenExpiration = '30d';
const app =  express();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mostafawazzany111@gmail.com",
    pass: "vivk qhyx askn rodp", 
  },
});
const user = require('./user.model');
const Otp = require('./otp.model');
app.use(express.json());
app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(
//   mongoSanitize({
//     replaceWith: '_',
//   }),
// );


function sendTestEmail(code,email) {

const message = {
    from :"mostafawazzany111@gmail.com",
    to:email,
    subject:"Test Email",
    html:`
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111">
      <h2>Password Reset Code</h2>
      <p>Hello Mostafa,</p>
      <p>Your reset code is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</div>
      <p>This code expires in 5 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    </div
    `
}


transporter.sendMail(message, (error, info) => {
    if (error) {
        console.error("Error sending email:", error);
    }
    else {
        console.log("Email sent successfully:", info.response);
    }
});

}
function generateRandomCode(length = 6) {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }   
    return code;
}



async function CreateOtp(email){
let code = generateRandomCode();

otpdata = {
    email,
    otp: code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes
}


await  Otp.create(otpdata);

sendTestEmail(code,email);
}




function genereateToken(DataUser){
return jwt.sign({
    id: DataUser._id,
    email: DataUser.email,
    role: DataUser.role,
    username: DataUser.username
}, secretKey, {expiresIn: tokenExpiration})
}



function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
}

app.listen(3000,async () => {
    await mongoose.connect('mongodb://mostafawazzany50050_db_user:MM2314214@ac-gjfxi3i-shard-00-00.p7g0knq.mongodb.net:27017,ac-gjfxi3i-shard-00-01.p7g0knq.mongodb.net:27017,ac-gjfxi3i-shard-00-02.p7g0knq.mongodb.net:27017/?ssl=true&replicaSet=atlas-nmgy56-shard-0&authSource=admin&appName=Cluster0');
    console.log('Server is running on port 3000');
});




app.get('/health', verifyToken,(req, res) => {

    res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});



const registrationSchema = joi.object({
fullName: joi.string().min(3).max(50).required(),
username: joi.string().alphanum().min(3).max(30).required(),
email: joi.string().email().required(),
password: joi.string().min(6).required(),
phone: joi.string().min(10).max(11),
role: joi.string().valid('customer', 'provider','admin')
})

const loginSchema = joi.object({
email: joi.string().email().required(),
password: joi.string().min(6).required()
})



app.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, password, phone, role } = req.body;
        await mongoSanitize(req.body);
        const {error} = registrationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        let existingUser = await user.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or username already exists' });
        }
        await user.create({ fullName, username, email, password, phone, role });

        await CreateOtp(email);
        res.status(201).json({ success: true, message: 'User registered successfully' });
        
    }catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }

});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        await mongoSanitize(req.body);
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
       let userdata =  await user.findOne({ email, password });

       if (!userdata) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        let token = genereateToken(userdata);

        res.status(200).json({ success: true, message: 'Login successful', token });

    }catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});




