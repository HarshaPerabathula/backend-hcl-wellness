# Healthcare Management System Backend

A comprehensive backend system for healthcare management with patient tracking, wellness goals, and preventive care scheduling.

## Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Patient Dashboard**: Wellness goals tracking, preventive care reminders, health tips
- **Provider Management**: Assign and monitor patient goals, view compliance status
- **Data Encryption**: Sensitive patient data encrypted at rest
- **HIPAA Compliance**: Consent management and audit logging

## Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
# Update .env file with your MongoDB URI and secrets
MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

3. **Start Server**
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register patient/provider
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/refresh-token` - Refresh expired JWT
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/give-consent` - Give HIPAA consent

### Patient APIs
- `POST /api/patients/log-progress` - Log daily metrics
- `GET /api/patients/active-goals` - Get current goals
- `GET /api/patients/dashboard` - Dashboard summary
- `GET /api/patients/progress-history` - Historical data

### Provider APIs
- `POST /api/providers/assign-goals` - Assign goals to patient
- `GET /api/providers/patients` - Get assigned patients
- `GET /api/providers/patients/:id/goals` - View patient goals
- `PUT /api/providers/goals/:id/modify` - Modify goal

### Preventive Care
- `GET /api/preventive-care/schedule` - Upcoming checkups
- `POST /api/preventive-care/book` - Schedule checkup
- `PUT /api/preventive-care/:id/complete` - Mark completed
- `GET /api/preventive-care/overdue` - Overdue checkups

## Database Schema

### Users Collection
Unified patient and provider model with encrypted PII data.

### Wellness Goals
Doctor-assigned goals with progress tracking and streak calculation.

### Daily Progress
Time-series data for tracking daily goal achievements.

### Preventive Care
Scheduling and tracking of medical checkups and screenings.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Data encryption for PII
- Rate limiting
- CORS protection
- Helmet security headers
- Role-based access control

## Sample Usage

### Register a Patient
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "password123",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "phone": "555-0123",
    "consentGiven": true
  }'
```

### Assign a Goal (Provider)
```bash
curl -X POST http://localhost:5000/api/providers/assign-goals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID",
    "goalType": "steps",
    "targets": { "daily": 8000 },
    "unit": "steps",
    "duration": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "periodType": "1_month"
    }
  }'
```

### Log Progress (Patient)
```bash
curl -X POST http://localhost:5000/api/patients/log-progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "GOAL_ID",
    "date": "2024-01-15",
    "actualValue": 9500
  }'
```

## Development

- Node.js 16+
- MongoDB 4.4+
- Express.js framework
- Mongoose ODM
- JWT authentication
- Joi validation

## Production Deployment

1. Set strong JWT_SECRET and ENCRYPTION_KEY
2. Use MongoDB Atlas or secure MongoDB instance
3. Enable HTTPS
4. Set up proper logging and monitoring
5. Configure rate limiting based on usage
6. Implement backup strategies