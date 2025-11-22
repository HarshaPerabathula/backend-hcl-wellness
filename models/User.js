const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['patient', 'provider'], required: true },
  
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    phone: String
  },
  
  providerInfo: {
    licenseNumber: String,
    specialization: String,
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  patientInfo: {
    assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    allergies: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      phone: String
    }
  },
  
  consentGiven: { type: Boolean, default: false },
  lastLogin: Date,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);