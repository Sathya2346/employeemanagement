# Employee Management Mobile (React Native + Expo)

Mobile companion application for the Employee Management System (EMS). Built with React Native & Expo, targeting 100% visual, functional, and API parity with the Thymeleaf Web Application.

---

## 🏗️ 1. Project Architecture & Folder Structure

```text
client-mobile/
├── assets/                  # App icon, splash screen, and brand static assets
├── src/
│   ├── components/          # Reusable UI components (Header, StatusBadge, Cards)
│   ├── context/             # AuthContext for session management & AsyncStorage
│   ├── navigation/          # Hybrid Navigation (Drawer + Bottom Icon Tabs)
│   │   ├── AdminNavigator.js
│   │   ├── UserNavigator.js
│   │   └── RootNavigator.js
│   ├── screens/
│   │   ├── auth/            # LoginScreen
│   │   ├── admin/           # Admin Dashboard, EmployeeList, Add/Edit/View, Leave, Attendance
│   │   └── user/            # User Dashboard, Attendance, Universal Meeting Tracker, Leave, Reports
│   ├── services/            # Axios instance with dynamic LAN host detection
│   └── theme/               # Color tokens matching web CSS (#23d2aa, #10b981, #FF7423)
├── App.js                   # Main application entry point
├── app.json                 # Expo configuration manifest
└── package.json             # Project dependencies and scripts
```

---

## 🎨 2. Design System & Theme Tokens

Extracted directly from `login.css`, `dashboard.css`, and `status-badges.css`:

| Design Token | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Theme Header** | `#23d2aa` | App headers, active tab highlights, sidebar header |
| **Login Primary Green** | `#10b981` | Login card badge, input focus border, login button |
| **Action Accent** | `#FF7423` | View More button, download actions |
| **Page Canvas** | `#f5f9f8` | Light mint-grey global body background |
| **Approved / Present** | `#d1fae5` | Status pill badge background (`#065f46` text) |
| **Pending / Review** | `#fef3c7` | Amber status badge (`#b45309` text) |
| **Rejected / Absent** | `#fee2e2` | Crimson red status badge (`#991b1b` text) |

---

## ⚡ 3. Prerequisites & Environment Setup

1. **Node.js**: Ensure Node.js (`v18+` or `v20+`) is installed.
2. **Spring Boot Backend**: Ensure the Spring Boot backend is running on `http://localhost:8080` or laptop local IP `192.168.x.x:8080`.
3. **Expo Go (Optional)**: Download Expo Go on Android / iOS device if testing on a physical phone over local Wi-Fi.

---

## 🚀 4. How to Run Locally in VS Code

### Step 1: Start the Mobile Application (Expo Web)
Open VS Code terminal in the `client-mobile` directory:
```bash
cd client-mobile
npm install
npx expo start --web --port 8081
```

### Step 2: Open in Browser or Mobile
- **Browser Web Mode**: Open `http://localhost:8081` in Chrome.
- **Physical Phone**: Scan the QR code shown in terminal using **Expo Go**.

---

## 📦 5. How to Build Android APK / AAB

To compile a standalone Android APK using Expo Application Services (EAS Build):

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to Expo Account**:
   ```bash
   eas login
   ```
3. **Build APK**:
   ```bash
   eas build -p android --profile preview
   ```
4. Download the compiled `.apk` file from the generated link and install directly on Android devices!

---

## 🔑 6. Default Login Credentials

- **Admin Account**: `admin` / `admin` (or `ganesansathya2346@gmail.com` / `admin`)
- **Employee Account**: `employee` / `password123` (or `employee@gmail.com` / `password123`)
