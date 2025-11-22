# Postman API Testing Guide

Base URL: `http://localhost:5000`

## 1. Authentication APIs

### Register Patient
**POST** `/api/auth/register`
```json
{
  "email": "john.patient@test.com",
  "password": "password123",
  "role": "patient",
  "firstName": "John",
  "lastName": "Patient",
  "dateOfBirth": "1990-01-01",
  "phone": "555-0123",
  "consentGiven": true
}
```

### Register Provider
**POST** `/api/auth/register`
```json
{
  "email": "dr.smith@test.com",
  "password": "password123",
  "role": "provider",
  "firstName": "Dr. Sarah",
  "lastName": "Smith",
  "dateOfBirth": "1980-01-01",
  "phone": "555-0100",
  "consentGiven": true,
  "licenseNumber": "MD12345",
  "specialization": "Family Medicine"
}
```

### Login
**POST** `/api/auth/login`
```json
{
  "email": "john.patient@test.com",
  "password": "password123"
}
```

### Refresh Token
**POST** `/api/auth/refresh-token`
Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Logout
**POST** `/api/auth/logout`
Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

## 2. User Management APIs

### Get Profile
**GET** `/api/users/profile`
Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Update Profile
**PUT** `/api/users/profile`
Headers: `Authorization: Bearer YOUR_JWT_TOKEN`
```json
{
  "firstName": "John Updated",
  "phone": "555-9999",
  "allergies": ["Peanuts", "Shellfish"],
  "medications": ["Aspirin", "Vitamin D"]
}
```

### Give Consent
**POST** `/api/users/give-consent`
Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

## 3. Provider APIs

### Assign Goal to Patient
**POST** `/api/providers/assign-goals`
Headers: `Authorization: Bearer PROVIDER_JWT_TOKEN`
```json
{
  "patientId": "PATIENT_USER_ID",
  "goalType": "steps",
  "targets": {
    "daily": 8000
  },
  "unit": "steps",
  "duration": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "periodType": "1_month"
  },
  "notes": "Walk 8000 steps daily for better health"
}
```

### Get Assigned Patients
**GET** `/api/providers/patients`
Headers: `Authorization: Bearer PROVIDER_JWT_TOKEN`

### View Patient Goals
**GET** `/api/providers/patients/PATIENT_ID/goals`
Headers: `Authorization: Bearer PROVIDER_JWT_TOKEN`

### Modify Goal
**PUT** `/api/providers/goals/GOAL_ID/modify`
Headers: `Authorization: Bearer PROVIDER_JWT_TOKEN`
```json
{
  "targets": {
    "daily": 10000
  },
  "notes": "Increased target to 10k steps"
}
```

## 4. Patient APIs

### Log Daily Progress
**POST** `/api/patients/log-progress`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`
```json
{
  "goalId": "GOAL_ID",
  "date": "2024-01-15",
  "actualValue": 9500
}
```

### Get Active Goals
**GET** `/api/patients/active-goals`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

### Get Dashboard
**GET** `/api/patients/dashboard`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

### Get Progress History
**GET** `/api/patients/progress-history?goalId=GOAL_ID&startDate=2024-01-01&endDate=2024-01-31`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

### Get Streaks
**GET** `/api/patients/streaks`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

## 5. Preventive Care APIs

### Get Schedule
**GET** `/api/preventive-care/schedule`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

### Book Checkup
**POST** `/api/preventive-care/book`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`
```json
{
  "careType": "annual_checkup",
  "scheduledDate": "2024-02-15T10:00:00Z",
  "priority": "medium",
  "notes": "Annual physical examination"
}
```

### Mark Completed
**PUT** `/api/preventive-care/APPOINTMENT_ID/complete`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`
```json
{
  "completedDate": "2024-02-15T10:30:00Z",
  "notes": "Checkup completed successfully"
}
```

### Get Overdue
**GET** `/api/preventive-care/overdue`
Headers: `Authorization: Bearer PATIENT_JWT_TOKEN`

## Testing Flow

1. **Register Provider** → Save JWT token
2. **Register Patient** → Save JWT token and User ID
3. **Provider assigns goal** using Patient ID
4. **Patient logs progress** using Goal ID
5. **Patient views dashboard**
6. **Patient books preventive care**
7. **Provider views patient goals**

## Sample Goal Types
- `steps` (unit: steps)
- `water_intake` (unit: liters)
- `sleep_hours` (unit: hours)
- `exercise_minutes` (unit: minutes)
- `weight_loss` (unit: kg)

## Sample Care Types
- `annual_checkup`
- `blood_test`
- `vaccination`
- `mammogram`
- `colonoscopy`