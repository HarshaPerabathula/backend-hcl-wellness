const express = require('express');
const PreventiveCare = require('../models/PreventiveCare');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get preventive care schedule
router.get('/schedule', auth, requireRole(['patient']), async (req, res) => {
  try {
    const schedule = await PreventiveCare.find({ patientId: req.user._id })
      .populate('providerId', 'profile.firstName profile.lastName')
      .sort({ scheduledDate: 1 });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book new checkup
router.post('/book', auth, requireRole(['patient']), async (req, res) => {
  try {
    const { careType, scheduledDate, providerId, priority, notes } = req.body;

    const preventiveCare = new PreventiveCare({
      patientId: req.user._id,
      providerId: providerId || req.user.patientInfo.assignedProvider,
      careType,
      scheduledDate,
      priority: priority || 'medium',
      notes
    });

    await preventiveCare.save();
    res.status(201).json({ message: 'Checkup scheduled successfully', preventiveCare });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark checkup as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { completedDate, notes } = req.body;
    
    const filter = { _id: req.params.id };
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'provider') {
      filter.providerId = req.user._id;
    }

    const preventiveCare = await PreventiveCare.findOneAndUpdate(
      filter,
      { 
        status: 'completed',
        completedDate: completedDate || new Date(),
        notes: notes || ''
      },
      { new: true }
    );

    if (!preventiveCare) {
      return res.status(404).json({ error: 'Checkup not found' });
    }

    res.json({ message: 'Checkup marked as completed', preventiveCare });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue checkups
router.get('/overdue', auth, requireRole(['patient']), async (req, res) => {
  try {
    const today = new Date();
    const overdue = await PreventiveCare.find({
      patientId: req.user._id,
      status: 'scheduled',
      scheduledDate: { $lt: today }
    }).populate('providerId', 'profile.firstName profile.lastName');

    // Update status to overdue
    await PreventiveCare.updateMany(
      {
        patientId: req.user._id,
        status: 'scheduled',
        scheduledDate: { $lt: today }
      },
      { status: 'overdue' }
    );

    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule appointment
router.post('/reschedule', auth, requireRole(['patient']), async (req, res) => {
  try {
    const { appointmentId, newDate } = req.body;

    const preventiveCare = await PreventiveCare.findOneAndUpdate(
      { _id: appointmentId, patientId: req.user._id },
      { 
        scheduledDate: newDate,
        status: 'scheduled'
      },
      { new: true }
    );

    if (!preventiveCare) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment rescheduled successfully', preventiveCare });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;