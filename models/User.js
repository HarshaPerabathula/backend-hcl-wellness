const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    set: function(email) {
      return CryptoJS.AES.encrypt(email, process.env.ENCRYPTION_KEY).toString();
    },
    get: function(encryptedEmail) {
      if (!encryptedEmail) return '';
      const bytes = CryptoJS.AES.decrypt(encryptedEmail, process.env.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['patient', 'provider'], required: true },
  
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    phone: {
      type: String,
      set: function(phone) {
        return CryptoJS.AES.encrypt(phone, process.env.ENCRYPTION_KEY).toString();
      },
      get: function(encryptedPhone) {
        if (!encryptedPhone) return '';
        const bytes = CryptoJS.AES.decrypt(encryptedPhone, process.env.ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      }
    }
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
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
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