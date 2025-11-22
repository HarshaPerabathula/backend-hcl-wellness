const express = require('express');
const User = require('../models/User');
const WellnessGoal = require('../models/WellnessGoal');
const DailyProgress = require('../models/DailyProgress');
const { auth, requireRole } = require('../middleware/auth');
const { goalSchema } = require('../utils/validation');

const router = express.Router();

// Assign goals to patient
router.post('/assign-goals', auth, requireRole(['provider']), async (req, res) => {
  try {
    const { error } = goalSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { patientId, goalType, targets, unit, duration, notes } = req.body;

    // Verify patient exists and is assigned to this provider
    const patient = await User.findOne({ 
      _id: patientId, 
      role: 'patient',
      'patientInfo.assignedProvider': req.user._id 
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    const goal = new WellnessGoal({
      patientId,
      assignedBy: req.user._id,
      goalType,
      targets,
      unit,
      duration,
      notes
    });

    await goal.save();
    res.status(201).json({ message: 'Goal assigned successfully', goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assigned patients
router.get('/patients', auth, requireRole(['provider']), async (req, res) => {
  try {
    const patients = await User.find({ 
      role: 'patient',
      'patientInfo.assignedProvider': req.user._id 
    }).select('profile patientInfo.allergies patientInfo.medications');
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient's goals
router.get('/patients/:id/goals', auth, requireRole(['provider']), async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient is assigned to this provider
    const patient = await User.findOne({ 
      _id: patientId, 
      role: 'patient',
      'patientInfo.assignedProvider': req.user._id 
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    const goals = await WellnessGoal.find({ patientId }).sort({ createdAt: -1 });
    
    // Get recent progress for each goal
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const recentProgress = await DailyProgress.find({ goalId: goal._id })
        .sort({ date: -1 })
        .limit(7);
      
      return {
        ...goal.toObject(),
        recentProgress
      };
    }));
    
    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modify existing goal
router.put('/goals/:id/modify', auth, requireRole(['provider']), async (req, res) => {
  try {
    const goalId = req.params.id;
    const { targets, duration, notes, status } = req.body;

    const goal = await WellnessGoal.findOne({ 
      _id: goalId, 
      assignedBy: req.user._id 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or not assigned by you' });
    }

    const updateData = {};
    if (targets) updateData.targets = targets;
    if (duration) updateData.duration = duration;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;

    const updatedGoal = await WellnessGoal.findByIdAndUpdate(goalId, updateData, { new: true });
    res.json({ message: 'Goal updated successfully', goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove goal
router.delete('/goals/:id', auth, requireRole(['provider']), async (req, res) => {
  try {
    const goalId = req.params.id;

    const goal = await WellnessGoal.findOne({ 
      _id: goalId, 
      assignedBy: req.user._id 
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or not assigned by you' });
    }

    await WellnessGoal.findByIdAndDelete(goalId);
    await DailyProgress.deleteMany({ goalId });
    
    res.json({ message: 'Goal removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;