const mongoose = require('mongoose');

const wellnessGoalSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  goalType: { 
    type: String, 
    enum: ['steps', 'water_intake', 'sleep_hours', 'exercise_minutes', 'weight_loss'], 
    required: true 
  },
  
  targets: {
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  
  unit: { type: String, enum: ['steps', 'liters', 'hours', 'minutes', 'kg'], required: true },
  
  duration: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    periodType: { type: String, enum: ['1_week', '2_weeks', '1_month', '3_months', 'custom'] }
  },
  
  progress: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    daysCompleted: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    lastUpdated: Date
  },
  
  status: { type: String, enum: ['active', 'completed', 'paused', 'expired'], default: 'active' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('WellnessGoal', wellnessGoalSchema);