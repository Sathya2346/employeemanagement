# Employee Management Mobile

Native React Native/Expo frontend added alongside the existing Spring Boot + Thymeleaf application.

## Run

```bash
cd mobile
npm install
npm start
```

Set `API_BASE_URL` in `mobile/config.js` to the reachable Spring Boot server address for the physical device/emulator.

The existing Thymeleaf templates, CSS, backend APIs, database and business logic are not replaced by this mobile frontend.