# EMS-Mobile — React Native Mobile Application

The **EMS-Mobile** application is the React Native + Expo mobile application built for the existing **Java Full Stack Employee Management System (EMS)**.

---

## 🎨 Theme & Visual Identity

The mobile UI has been created to reproduce the exact visual identity, colors, icon colors, spacing, typography, and status badges of the Thymeleaf Web application:

- **Primary Color**: `#23d2aa` / `#10b981` (Teal / Emerald)
- **Secondary Color**: `#FF7423` (Orange Action Button)
- **Background**: `#F5F9F8`
- **Surface / Cards**: `#FFFFFF`
- **Status Badges**:
  - **Working**: `#16A34A`
  - **Present**: `#0F766E`
  - **Break**: `#F59E0B`
  - **Meeting**: `#7C3AED`
  - **Leave**: `#1D4ED8`
  - **Absent / Rejected**: `#DC2626`
  - **Approved**: `#16A34A`
  - **Pending**: `#F59E0B`

---

## 📱 Features Included

### 🔐 Authentication Flow
- Login screen with split branding card (`login.html` styling)
- Role detection (ADMIN / USER)
- Password reset (Forgot Password → Verify OTP → Reset Password)

### 👑 Admin Management Flow
- **Dashboard**: Live employee statistics, male/female count, attendance stats, pending onboarding alerts, quick actions, weekly attendance chart
- **Employee Directory**: Search by name/email/role, list cards, view details, edit details, delete employee
- **Add Employee**: Full creation form with automatic email credential dispatch
- **Attendance Overview**: Punch logs & Proxy forgery rectification
- **Leave Management**: View, approve, or reject employee leave applications
- **Hourly Reports**: Real-time hourly task logs per employee
- **Pending Onboarding**: Review submitted document checklists & approve/request changes
- **System Settings**: Manage shift timings & workspace configuration
- **Notifications & Profile**: Real-time alert notifications & account info

### 👤 Employee (User) Portal
- **Dashboard**: Attendance check-in / check-out status, shift timing details, portal quick links
- **Attendance**: Punch check-in/out, start/end break, start/end meeting, attendance history
- **Apply Leave**: Form to apply for leaves with status badges (Pending, Approved, Rejected)
- **Hourly Reports**: Form to log hourly task descriptions
- **Onboarding**: Verification status & document upload checklist
- **Notifications & Profile**: Personal notifications & profile overview

---

## 🚀 How to Run the Mobile Application

### 1. Install Dependencies
```bash
cd EMS-Mobile
npm install
```

### 2. Start the Expo Development Server
```bash
npx expo start
```

### 3. Running on Android Emulator / Physical Device
- **Physical Android Device**: Download **Expo Go** app from Google Play Store and scan the QR code printed in terminal. Ensure your computer and mobile phone are on the same Wi-Fi network.
- **Android Emulator**: Press `a` in the terminal to launch on Android Emulator.

---

## 🌐 Connecting to Spring Boot Backend

The mobile app connects to the Spring Boot backend running on port `8085`.

To change the server URL for physical devices:
Modify `DEFAULT_BASE_URL` in `src/api/apiClient.js`:
```javascript
export const DEFAULT_BASE_URL = 'http://YOUR_LAN_IP:8085'; // e.g. http://192.168.1.100:8085
```
