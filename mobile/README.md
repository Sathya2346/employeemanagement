# EMS Mobile

React Native / Expo mobile frontend for `Sathya2346/employeemanagement`.

## Architecture

React Native Mobile + Thymeleaf Web -> existing Spring backend -> existing database.

The mobile client uses the existing `/api/auth/login` endpoint and keeps business logic in the backend.

## Run

```bash
cd mobile
npm install
npm start
```

For Android emulator, the development API base is `http://10.0.2.2:8080`. For a physical device, replace it with the host machine's LAN address in `App.js`.

The existing Thymeleaf templates, backend controllers, APIs, and database are not moved or replaced. The mobile UI follows the existing login visual language: Poppins-style typography, emerald `#10b981`, pale green `#d1fae5`, white cards, rounded controls, and responsive spacing.
