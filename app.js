const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app =  express();
app.use(express.json());
app.use(morgan('dev'));

const user = require('./user.model');







app.listen(3000,async () => {
    await mongoose.connect('Link mongo');
    console.log('Server is running on port 3000');
});




app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date().toISOString() });
});



app.post('/register', async (req, res) => {
    try {
        const { fullName, username, email, password, phone, role } = req.body;
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        await user.create({ fullName, username, email, password, phone, role });
        res.status(201).json({ success: true, message: 'User registered successfully' });
        
    }catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }

});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Missing email or password' });
        }
       let userdata =  await user.findOne({ email, password });

       if (!userdata) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        res.status(200).json({ success: true, message: 'Login successful'});

    }catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});