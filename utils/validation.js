const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('patient', 'provider').required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  phone: Joi.string().required(),
  consentGiven: Joi.boolean().required()
  // licenseNumber: Joi.when('role', { is: 'provider', then: Joi.string().required() }),
  // specialization: Joi.when('role', { is: 'provider', then: Joi.string().required() })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const goalSchema = Joi.object({
  patientId: Joi.string().required(),
  goalType: Joi.string().valid('steps', 'water_intake', 'sleep_hours', 'exercise_minutes', 'weight_loss').required(),
  targets: Joi.object({
    daily: Joi.number().required(),
    weekly: Joi.number(),
    monthly: Joi.number()
  }).required(),
  unit: Joi.string().valid('steps', 'liters', 'hours', 'minutes', 'kg').required(),
  duration: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    periodType: Joi.string().valid('1_week', '2_weeks', '1_month', '3_months', 'custom')
  }).required(),
  notes: Joi.string()
});

const progressSchema = Joi.object({
  goalId: Joi.string().required(),
  date: Joi.date().required(),
  actualValue: Joi.number().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  goalSchema,
  progressSchema
};