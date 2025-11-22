const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../utils/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, role, firstName, lastName, dateOfBirth, phone, consentGiven, licenseNumber, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userData = {
      email,
      passwordHash: password,
      role,
      profile: { firstName, lastName, dateOfBirth, phone },
      consentGiven
    };

    if (role === 'provider') {
      userData.providerInfo = { licenseNumber, specialization, patients: [] };
    } else {
      userData.patientInfo = { allergies: [], medications: [] };
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh-token', auth, async (req, res) => {
  try {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;