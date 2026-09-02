const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
const loginHtml = fs.readFileSync(path.join(root, 'src/main/resources/templates/login.html'), 'utf8');
const adminDashboard = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/dashboard.html'), 'utf8');
const adminAdd = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/addEmployee.html'), 'utf8');
const adminAttendance = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/attendance.html'), 'utf8');
const adminLeave = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/leave.html'), 'utf8');
const adminHourly = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/adminHourlyReports.html'), 'utf8');
const adminNotifications = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/adminNotifications.html'), 'utf8');
const adminSettings = fs.readFileSync(path.join(root, 'src/main/resources/templates/admin/settings.html'), 'utf8');
const userDashboard = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userDashboard.html'), 'utf8');
const userProfile = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userProfile.html'), 'utf8');
const userAttendance = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userAttendance.html'), 'utf8');
const userLeave = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userLeave.html'), 'utf8');
const userHourly = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userHourlyReport.html'), 'utf8');
const userNotifications = fs.readFileSync(path.join(root, 'src/main/resources/templates/user/userNotification.html'), 'utf8');

let passed = 0;
let failed = 0;
function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}
function has(text, value) { return text.includes(value); }
function all(text, values) { return values.every(v => has(text, v)); }

console.log('\n=== EMS MOBILE PARITY TEST ===\n');

// 1. Source-of-truth content parity.
check('Login text parity', all(app, [
  'Grow Your', 'Workspace', 'Experience',
  'It is certainly important because it is only through hard work that we can achieve the goals of our life. Thus, we all must work hard.',
  'Login', 'Enter User name or Email', 'Enter Your Password', 'Forgot Password?'
]));
check('Login image parity', has(app, "IMAGE_BASE+'/img1.png'"));
check('Admin navigation parity', all(app, ['Overview','Add Employee','Employee List','Pending Onboarding','Attendance','Leave','Hourly Reports','Notifications','Settings','Logout']));
check('Employee navigation parity', all(app, ['Overview','Profile','Attendance','Leave','Hourly Report','Notification','Logout']));
check('Add Employee content parity', all(app, [
  'Create Employee Account',
  "Enter the employee's basic info and login credentials.",
  'First Name *', 'Last Name *', 'Email Address *', 'Username *', 'Role *',
  'Create Account & Send Email', 'What happens next?'
]));
check('Admin attendance columns parity', all(app, ['Date','Employee','Shift','Check-In','Break','Meeting','Idle Time','Check-Out','Total Hours','Remarks','Status']));
check('Admin leave content parity', all(app, ['Total Leaves','Approved Leave','Pending Leave','Rejected Leave','Employee Leave Requests']));
check('Admin hourly content parity', all(app, ['Time Slot','Task Description','Status','Action','Add Entry','Submit All Reports']));
check('Employee attendance content parity', all(app, ['Employee Name','Employee ID','Joining Date','Designation','Working Hours','In Time','Out Time','Break Time','Meeting Time','Idle Time','Check-In','Check-Out']));
check('Employee leave content parity', all(app, ['Total Available Leaves','Paid Leave','Sick Leave','Casual Leave','All Requested Leaves','Apply Leave']));
check('Employee hourly content parity', all(app, ['Time Slot','Task Description','Status','Action','Add Entry','Submit All Reports']));

// 2. Visual language parity against the existing Thymeleaf CSS/source.
check('Primary green parity', has(app, "green:'#10b981'"));
check('Pale green parity', has(app, "light:'#d1fae5'"));
check('Admin sidebar green parity', has(app, "sidebar:'#23d2aa'"));
check('Admin active green parity', has(app, "active:'#50d2b3'"));
check('Admin background parity', has(app, "bg:'#f5f9f8'"));
check('Orange parity', has(app, "orange:'#FF7423'"));
check('White card/base parity', has(app, "white:'#fff'"));
check('Login left background parity', has(app, 'backgroundColor:C.light'));
check('Login image asset parity', has(loginHtml, 'images/img1.png') && has(app, "IMAGE_BASE+'/img1.png'"));
check('Admin dashboard source uses EMS sidebar', has(adminDashboard, '<h4>EMS</h4>'));
check('Admin dashboard source uses chart containers', has(adminDashboard, 'chart-container'));

// 3. Backend endpoint contract parity.
const requiredRoutes = [
  '/api/auth/login', '/api/auth/me', '/api/auth/my-details',
  '/api/employees/all', '/api/employees/save',
  '/api/admin/onboarding/pending', '/api/admin/onboarding/review/',
  '/api/admin/onboarding/approve/', '/api/admin/onboarding/reject/',
  '/api/attendance/today/', '/api/attendance/check-in/', '/api/attendance/check-out/',
  '/api/attendance/range/', '/api/attendance/last5/',
  '/api/attendance/break/start', '/api/attendance/break/end',
  '/api/attendance/meeting/start', '/api/attendance/meeting/end',
  '/api/leave/all', '/api/leave/userLeave/', '/api/leave/apply',
  '/api/leave/approve/', '/api/leave/reject/', '/api/leave/cancel/',
  '/api/hourly-reports/employee/', '/api/hourly-reports/all', '/api/hourly-reports/submit',
  '/api/notifications/admin', '/api/notifications/user/', '/api/notifications/unread/count',
  '/api/notifications/mark-read/', '/api/notifications/mark-all-read',
  '/api/admin/settings', '/api/admin/settings/save', '/api/admin/settings/shift/add',
  '/api/admin/settings/shift/update/', '/api/admin/settings/shift/delete/'
];
for (const route of requiredRoutes) check(`Mobile references route ${route}`, has(app, route));

// 4. Known correctness traps. These deliberately fail when the mobile code is not safe.
check('Break-start sends required time body', !/api\('\/api\/attendance\/break\/start'\s*,\s*\{\s*method\s*:\s*'POST'\s*\}\s*\)/.test(app), 'AttendanceRestController requires a JSON time field');
check('No object-valued icon component', !/const\s+Icon\s*=\s*\(\)\s*=>\s*null/.test(app));
check('Vector shim default is a component', (() => {
  const shim = fs.readFileSync(path.join(__dirname, 'vector-icons-shim/index.js'), 'utf8');
  return /export\s+default\s+MaterialCommunityIcons/.test(shim);
})());
check('Metro config exports Expo config', (() => {
  const metro = fs.readFileSync(path.join(__dirname, 'metro.config.js'), 'utf8');
  return has(metro, 'getDefaultConfig') && has(metro, 'module.exports');
})());
check('No fake PDF success', !/Alert\.alert\([^;]*(?:PDF|Pdf|pdf)[^;]*coming|not implemented|placeholder/i.test(app));

// 5. Detect the strict-parity risks that require visual/runtime verification.
check('Admin dashboard preserves two chart sections', all(app, ['Attendance For Last Week','Employee Structure']));
check('Mobile has responsive scroll container', has(app, 'ScrollView'));
check('Role-specific navigation exists', has(app, 'admin?ADMIN:EMP'));
check('Session credentials requested on API calls', has(app, "credentials:'include'"));

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  console.error('\nParity test FAILED. Fix every FAIL before treating the mobile app as production-ready.');
  process.exit(1);
}
console.log('\nParity test PASSED. This is source-level validation; still perform Android/iOS visual and live-backend smoke tests.');
