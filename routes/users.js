const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, allergies, medications, emergencyContact } = req.body;
    
    const updateData = {};
    if (firstName) updateData['profile.firstName'] = firstName;
    if (lastName) updateData['profile.lastName'] = lastName;
    if (phone) updateData['profile.phone'] = phone;
    
    if (req.user.role === 'patient') {
      if (allergies) updateData['patientInfo.allergies'] = allergies;
      if (medications) updateData['patientInfo.medications'] = medications;
      if (emergencyContact) updateData['patientInfo.emergencyContact'] = emergencyContact;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-passwordHash');
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check consent status
router.get('/consent-status', auth, async (req, res) => {
  try {
    res.json({ consentGiven: req.user.consentGiven });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Give consent
router.post('/give-consent', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { consentGiven: true });
    res.json({ message: 'Consent given successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;