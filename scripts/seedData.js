const mongoose = require('mongoose');
const User = require('../models/User');
const HealthTip = require('../models/HealthTip');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await HealthTip.deleteMany({});

    // Create sample provider
    const provider = new User({
      email: 'doctor@healthcare.com',
      passwordHash: 'password123',
      role: 'provider',
      profile: {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        phone: '555-0100'
      },
      providerInfo: {
        licenseNumber: 'MD12345',
        specialization: 'Family Medicine',
        patients: []
      },
      consentGiven: true
    });
    await provider.save();

    // Create sample patient
    const patient = new User({
      email: 'patient@example.com',
      passwordHash: 'password123',
      role: 'patient',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phone: '555-0123'
      },
      patientInfo: {
        assignedProvider: provider._id,
        allergies: ['Peanuts'],
        medications: ['Aspirin'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '555-0124'
        }
      },
      consentGiven: true
    });
    await patient.save();

    // Update provider's patient list
    provider.providerInfo.patients.push(patient._id);
    await provider.save();

    // Create health tips
    const healthTips = [
      {
        title: 'Stay Hydrated',
        content: 'Drink at least 8 glasses of water daily to maintain proper hydration and support overall health.',
        category: 'nutrition'
      },
      {
        title: 'Regular Exercise',
        content: 'Aim for at least 30 minutes of moderate exercise 5 days a week to improve cardiovascular health.',
        category: 'exercise'
      },
      {
        title: 'Mental Wellness',
        content: 'Practice mindfulness or meditation for 10 minutes daily to reduce stress and improve mental clarity.',
        category: 'mental_health'
      },
      {
        title: 'Annual Checkups',
        content: 'Schedule regular health screenings and checkups to catch potential issues early.',
        category: 'preventive_care'
      }
    ];

    await HealthTip.insertMany(healthTips);

    console.log('Sample data created successfully!');
    console.log('Provider email: doctor@healthcare.com');
    console.log('Patient email: patient@example.com');
    console.log('Password for both: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();