const mongoose = require('mongoose');

const preventiveCareSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  careType: { 
    type: String, 
    enum: ['annual_checkup', 'blood_test', 'vaccination', 'mammogram', 'colonoscopy'], 
    required: true 
  },
  scheduledDate: { type: Date, required: true },
  completedDate: Date,
  status: { type: String, enum: ['scheduled', 'completed', 'missed', 'overdue'], default: 'scheduled' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  autoReminders: [{
    sentAt: Date,
    type: { type: String, enum: ['email', 'sms'] },
    status: { type: String, enum: ['sent', 'delivered'] }
  }],
  
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('PreventiveCare', preventiveCareSchema);