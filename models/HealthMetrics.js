const mongoose = require('mongoose');

const healthMetricsSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  metrics: {
    steps: { value: Number, goal: Number },
    waterIntake: { value: Number, goal: Number },
    sleepHours: { value: Number, goal: Number },
    weight: Number,
    bloodPressure: { systolic: Number, diastolic: Number }
  },
  source: { type: String, enum: ['manual', 'device', 'provider'], default: 'manual' }
}, { timestamps: true });

healthMetricsSchema.index({ patientId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthMetrics', healthMetricsSchema);