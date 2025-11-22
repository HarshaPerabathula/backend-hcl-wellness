const express = require('express');
const WellnessGoal = require('../models/WellnessGoal');
const DailyProgress = require('../models/DailyProgress');
const HealthMetrics = require('../models/HealthMetrics');
const PreventiveCare = require('../models/PreventiveCare');
const HealthTip = require('../models/HealthTip');
const { auth, requireRole } = require('../middleware/auth');
const { progressSchema } = require('../utils/validation');

const router = express.Router();

// Log daily progress
router.post('/log-progress', auth, requireRole(['patient']), async (req, res) => {
  try {
    const { error } = progressSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { goalId, date, actualValue } = req.body;
    
    const goal = await WellnessGoal.findOne({ _id: goalId, patientId: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const targetValue = goal.targets.daily;
    const achieved = actualValue >= targetValue;
    const completionPercentage = Math.min((actualValue / targetValue) * 100, 100);

    const progress = await DailyProgress.findOneAndUpdate(
      { patientId: req.user._id, goalId, date },
      { targetValue, actualValue, achieved, completionPercentage },
      { upsert: true, new: true }
    );

    // Update goal progress
    const totalProgress = await DailyProgress.find({ goalId });
    const completedDays = totalProgress.filter(p => p.achieved).length;
    
    await WellnessGoal.findByIdAndUpdate(goalId, {
      'progress.daysCompleted': completedDays,
      'progress.totalDays': totalProgress.length,
      'progress.completionRate': (completedDays / totalProgress.length) * 100,
      'progress.lastUpdated': new Date()
    });

    res.json({ message: 'Progress logged successfully', progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active goals
router.get('/active-goals', auth, requireRole(['patient']), async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ 
      patientId: req.user._id, 
      status: 'active' 
    }).populate('assignedBy', 'profile.firstName profile.lastName');
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard data
router.get('/dashboard', auth, requireRole(['patient']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active goals
    const activeGoals = await WellnessGoal.find({ 
      patientId: req.user._id, 
      status: 'active' 
    });

    // Get today's progress
    const todayProgress = await DailyProgress.find({
      patientId: req.user._id,
      date: today
    });

    // Get upcoming preventive care
    const upcomingCare = await PreventiveCare.find({
      patientId: req.user._id,
      status: 'scheduled',
      scheduledDate: { $gte: today }
    }).sort({ scheduledDate: 1 }).limit(3);

    // Get random health tip
    const healthTips = await HealthTip.find({ isActive: true });
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

    res.json({
      activeGoals: activeGoals.length,
      todayProgress,
      upcomingCare,
      healthTip: randomTip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress history
router.get('/progress-history', auth, requireRole(['patient']), async (req, res) => {
  try {
    const { goalId, startDate, endDate } = req.query;
    
    const filter = { patientId: req.user._id };
    if (goalId) filter.goalId = goalId;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const progress = await DailyProgress.find(filter)
      .populate('goalId', 'goalType unit targets')
      .sort({ date: -1 });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streaks
router.get('/streaks', auth, requireRole(['patient']), async (req, res) => {
  try {
    const goals = await WellnessGoal.find({ 
      patientId: req.user._id, 
      status: 'active' 
    }).select('goalType progress');
    
    res.json(goals.map(goal => ({
      goalType: goal.goalType,
      currentStreak: goal.progress.currentStreak,
      longestStreak: goal.progress.longestStreak
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;