# EMS Mobile

React Native / Expo mobile UI for the Employee Management System.

## Roles
- Admin panel
- Employee panel

Technician functionality is intentionally excluded.

## Screens
### Admin
Dashboard, Employees, Add Employee, Employee Details, Update Employee, Attendance, Leave, Hourly Reports, Notifications, Profile, Settings.

### Employee
Dashboard, Attendance, Leave, Hourly Reports, Notifications, Profile, Onboarding.

## Run locally
```bash
cd mobile
npm install
npx expo start
```

Start the Spring Boot backend before testing API actions. For Android emulator the API base is `http://10.0.2.2:8080`; for a physical device replace it with the computer's LAN IP.

The mobile UI is implemented as a role-based shell and is designed to use the existing Spring Boot backend rather than duplicating business logic.
