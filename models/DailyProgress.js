const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'WellnessGoal', required: true },
  date: { type: Date, required: true },
  targetValue: { type: Number, required: true },
  actualValue: { type: Number, required: true },
  achieved: { type: Boolean, required: true },
  completionPercentage: { type: Number, required: true }
}, { timestamps: true });

dailyProgressSchema.index({ patientId: 1, goalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);