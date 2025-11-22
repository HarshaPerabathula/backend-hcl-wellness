const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['nutrition', 'exercise', 'mental_health', 'preventive_care'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  publishDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('HealthTip', healthTipSchema);