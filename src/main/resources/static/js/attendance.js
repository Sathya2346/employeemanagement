// src/main/resources/static/js/attendance.js
function sideNav() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('active-sidebar');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active-sidebar');
        });
    }
}
const initAdminAttendance = async () => {
    // ==============================
    // ✅ IST HELPERS
    // ==============================
    function formatMinutes(mins) {
        if (mins == null || mins < 0) return "--";
        const h = Math.floor(mins / 60);
        const m = mins % 60;

        if (h === 0) {
            return `${m}m`;
        } else {
            return `${h}h ${m}m`;
        }
    }

    function parseTimeToMs(timeStr) {
        if (!timeStr || timeStr === "--:--") return 0;
        const isPM = /pm/i.test(timeStr);
        const isAM = /am/i.test(timeStr);
        const cleanStr = timeStr.replace(/(am|pm)/i, '').trim();
        const parts = cleanStr.split(':').map(n => parseInt(n) || 0);
        let hours = parts[0] || 0;
        const minutes = parts[1] || 0;
        const seconds = parts[2] || 0;

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    function formatISTTime(timeStr) {
        if (!timeStr || timeStr === "--:--" || timeStr === "-") return "--:--";
        if (/am|pm/i.test(timeStr)) return timeStr;
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const seconds = parts[2] ? parts[2].split('.')[0] : '00';
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strHours = hours < 10 ? '0' + hours : hours;
        return `${strHours}:${minutes}:${seconds} ${ampm}`;
    }

    function formatSmartDuration(val) {
        if (val == null || val <= 0) return "0m 0s";
        if (val > 100000) {
            const totalSec = Math.floor(val / 1000);
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            if (hrs === 0) return `${mins}m ${secs}s`;
            return `${hrs}h ${mins}m ${secs}s`;
        }
        const hrs = Math.floor(val / 60);
        const mins = val % 60;
        if (hrs === 0) return `${mins}m 0s`;
        return `${hrs}h ${mins}m 0s`;
    }

    function formatDurationMs(ms) {
        return formatSmartDuration(ms);
    }

    function todayIST() {
        const now = new Date();
        const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const year = istDate.getFullYear();
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const day = String(istDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ==============================
    // ✅ HELPER: Status badge class
    // ==============================
    function getStatusBadgeClass(status) {
        if (!status) return "badge-working";
        const s = status.toLowerCase();
        if (s.includes("working")) return "badge-working";
        if (s.includes("present")) return "badge-present";
        if (s.includes("break")) return "badge-break";
        if (s.includes("meeting")) return "badge-meeting";
        if (s.includes("idle")) return "badge-idle";
        if (s.includes("leave")) return "badge-leave";
        if (s.includes("absent")) return "badge-absent";
        if (s.includes("partial")) return "badge-partial";
        return "badge-working";
    }

    // ==============================
    // 🌟 Load Admin Attendance
    // ==============================
    async function loadAdminAttendance() {
        try {
            const adminTableBody = document.querySelector("#attendanceTable tbody");
            const res = await fetch("/attendance/all"); // Endpoint to get all users' attendance
            const data = await res.json();

            adminTableBody.innerHTML = "";

            data.forEach(a => {
                const shift = a.employee?.companyDetails?.shiftTiming || "-";
                let earlyInMs = 0;
                if (a.earlyInMinutes && a.earlyInMinutes > 0) {
                    earlyInMs = a.earlyInMinutes * 60000;
                } else if (a.checkInTime && a.checkInTime !== "--:--" && shift && shift !== "-") {
                    const match = shift.match(/\(([^-\)]+)/);
                    if (match) {
                        const shiftStartStr = match[1].trim();
                        const shiftStartMs = parseTimeToMs(shiftStartStr);
                        const checkInMs = parseTimeToMs(a.checkInTime);
                        if (shiftStartMs > 0 && checkInMs > 0 && checkInMs < shiftStartMs) {
                            earlyInMs = shiftStartMs - checkInMs;
                        }
                    }
                }

                let remarksHtml = "";
                if (a.earlyIn || a.earlyCheckIn || earlyInMs > 0) {
                    const earlyInStr = earlyInMs > 0 ? formatMinutes(Math.floor(earlyInMs / 60000)) : "";
                    remarksHtml += `<div class="text-info fw-bold">Early Login${earlyInStr ? ' (+' + earlyInStr + ')' : ''}</div>`;
                }
                if (a.lateIn || a.isLateIn) {
                    remarksHtml += `<div class="text-danger fw-bold">Late (+${formatMinutes(a.lateMinutes)})</div>`;
                }
                if (a.earlyOut) {
                    remarksHtml += `<div class="text-warning fw-bold">Early Leave (-${formatMinutes(a.earlyLeaveMinutes)})</div>`;
                }
                if (!remarksHtml) remarksHtml = "-";

                const idleMinutes = a.idleTime || 0;
                let idleClass = "bg-success";
                if (idleMinutes >= 60) idleClass = "bg-danger";
                else if (idleMinutes >= 30) idleClass = "bg-warning text-dark";

                const empName = a.employee ? `${a.employee.firstname} ${a.employee.lastname}` : (a.username || "-");

                adminTableBody.innerHTML += `
                <tr>
                    <td>${a.attendanceDate}</td>
                    <td>${empName}</td>
                    <td>${shift}</td>
                    <td>${formatISTTime(a.checkInTime)}</td>
                    <td>${formatDurationMs(a.totalBreakTime)}</td>
                    <td>${formatMinutes(a.totalMeetingTime || 0)}</td>
                    <td class="${idleClass}">${formatMinutes(idleMinutes)}</td>
                    <td>${formatISTTime(a.checkOutTime)}</td>
                    <td>${formatDurationMs(a.totalWorkTime)}</td>
                    <td>${remarksHtml}</td>
                    <td>
                        <span class="status-badge ${getStatusBadgeClass(a.status)}">${a.status || 'Working'}</span>
                    </td>
                </tr>`;
            });
        } catch (err) {
            console.error("Error loading admin attendance:", err);
        }
    }
    // ==============================
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");
    const filterBtn = document.getElementById("filterBtn");
    const pdfBtn = document.getElementById("pdfBtn");
    const tableBody = document.querySelector("#attendanceTable tbody");

    const today = todayIST();
    if (toDate) toDate.setAttribute("max", today);
    if (fromDate) fromDate.setAttribute("max", today);

    // ==============================
    // 🌟 Employee Search
    // ==============================
    let employees = [];
    let selectedEmployeeId = null;

    const searchInput = document.getElementById("employeeSearch");
    const suggestionsList = document.getElementById("employeeSuggestions");

    async function loadEmployees() {
        try {
            const res = await fetch("/admin/all");
            if (res.ok) {
                employees = await res.json();
            }
        } catch (e) {
            console.error("Error loading employees:", e);
        }
    }
    loadEmployees();

    if (searchInput && suggestionsList) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();
            suggestionsList.innerHTML = "";

            if (!query) {
                suggestionsList.style.display = "none";
                selectedEmployeeId = null;
                return;
            }

            const filtered = employees.filter(emp => {
                const fn = (emp.firstname || "").toLowerCase();
                const ln = (emp.lastname || "").toLowerCase();
                const fullName = `${fn} ${ln}`.trim();
                const username = (emp.username || "").toLowerCase();
                const email = (emp.email || "").toLowerCase();
                const empId = String(emp.id || "");
                return fn.includes(query) || ln.includes(query) || fullName.includes(query) || username.includes(query) || email.includes(query) || empId.includes(query);
            });

            if (!filtered.length) {
                const noMatchLi = document.createElement("li");
                noMatchLi.className = "list-group-item text-muted small py-2";
                noMatchLi.textContent = "No matching employees found";
                suggestionsList.appendChild(noMatchLi);
                suggestionsList.style.display = "block";
                return;
            }

            filtered.forEach(emp => {
                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action py-2";
                li.style.cursor = "pointer";
                const fn = emp.firstname || "";
                const ln = emp.lastname || "";
                const displayName = (fn + " " + ln).trim() || emp.username || (`Employee #${emp.id}`);
                const designation = emp.companyDetails?.designation || emp.designation || "N/A";
                li.textContent = `${displayName} (${emp.username || emp.email || emp.id} - ${designation})`;

                li.addEventListener("click", () => {
                    searchInput.value = `${displayName} (${emp.username || emp.id})`;
                    selectedEmployeeId = emp.id;
                    suggestionsList.style.display = "none";

                    if (emp.companyDetails?.joiningDate) {
                        fromDate.value = emp.companyDetails.joiningDate;
                        fromDate.setAttribute("min", emp.companyDetails.joiningDate);
                    } else {
                        fromDate.value = today;
                    }
                    toDate.value = today;
                    // Do NOT auto-trigger filterBtn.click(); wait for user to click Filter button
                });

                suggestionsList.appendChild(li);
            });

            suggestionsList.style.display = "block";
        });

        document.addEventListener("click", e => {
            if (searchInput && suggestionsList && !searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.style.display = "none";
            }
        });
    }

    // ==============================
    // 🌟 Resolve Selected Employee
    // ==============================
    function resolveEmployee() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            selectedEmployeeId = null;
            return false;
        }

        if (selectedEmployeeId) {
            const currentEmp = employees.find(emp => emp.id === selectedEmployeeId);
            if (currentEmp) {
                const fn = (currentEmp.firstname || "").toLowerCase();
                const ln = (currentEmp.lastname || "").toLowerCase();
                const fullName = `${fn} ${ln}`.trim();
                const username = (currentEmp.username || "").toLowerCase();
                const email = (currentEmp.email || "").toLowerCase();
                if (fullName.includes(query) || fn.includes(query) || ln.includes(query) || username.includes(query) || email.includes(query) || query.includes(fn) || query.includes(username)) {
                    return true;
                }
            }
        }

        const matchedEmp = employees.find(emp => {
            const fn = (emp.firstname || "").toLowerCase();
            const ln = (emp.lastname || "").toLowerCase();
            const fullName = `${fn} ${ln}`.trim();
            const username = (emp.username || "").toLowerCase();
            const email = (emp.email || "").toLowerCase();
            return fullName === query || fn === query || username === query || email === query;
        }) || employees.find(emp => {
            const fn = (emp.firstname || "").toLowerCase();
            const ln = (emp.lastname || "").toLowerCase();
            const fullName = `${fn} ${ln}`.trim();
            const username = (emp.username || "").toLowerCase();
            const email = (emp.email || "").toLowerCase();
            return fullName.includes(query) || fn.includes(query) || ln.includes(query) || username.includes(query) || email.includes(query);
        });

        if (matchedEmp) {
            selectedEmployeeId = matchedEmp.id;
            const fn = matchedEmp.firstname || "";
            const ln = matchedEmp.lastname || "";
            const displayName = (fn + " " + ln).trim() || matchedEmp.username || (`Employee #${matchedEmp.id}`);
            searchInput.value = `${displayName} (${matchedEmp.username || matchedEmp.id})`;
            if (matchedEmp.companyDetails?.joiningDate) {
                fromDate.value = matchedEmp.companyDetails.joiningDate;
                fromDate.setAttribute("min", matchedEmp.companyDetails.joiningDate);
            }
            if (!toDate.value) toDate.value = today;
            return true;
        }

        selectedEmployeeId = null;
        return false;
    }

    // ==============================
    // 🌟 Filter Attendance
    // ==============================
    filterBtn.addEventListener("click", async () => {
        const resolved = resolveEmployee();
        if (!resolved) {
            alert("Please select or type an employee name");
            return;
        }

        if (!fromDate.value) fromDate.value = "2026-01-01";
        if (!toDate.value) toDate.value = today;

        try {
            const res = await fetch(
                `/attendance/range/${selectedEmployeeId}?from=${fromDate.value}&to=${toDate.value}`
            );
            const data = await res.json();

            if (!data || !data.length) {
                tableBody.innerHTML = `<tr><td colspan="11" class="text-center">No attendance records found for this employee in the selected range.</td></tr>`;
                return;
            }

            tableBody.innerHTML = data.map(a => {

                // ==============================
                // ✅ CHECK-IN WITH LATE COMMENT
                // ==============================
                // ==============================
                // ✅ REMARKS COLUMN LOGIC
                // ==============================
                let remarksHtml = "";
                if (a.lateIn || a.isLateIn) {
                    remarksHtml += `<div class="text-danger fw-bold">Late (+${formatMinutes(a.lateMinutes)})</div>`;
                }
                if (a.earlyOut) {
                    remarksHtml += `<div class="text-warning fw-bold">Early Leave (-${formatMinutes(a.earlyLeaveMinutes)})</div>`;
                }
                if (!remarksHtml) remarksHtml = "-";

                const idleMinutes = a.idleTime || 0;
                let idleClass = "bg-success";
                if (idleMinutes >= 60) idleClass = "bg-danger";
                else if (idleMinutes >= 30) idleClass = "bg-warning text-dark";

                const empName = a.employee ? `${a.employee.firstname || ''} ${a.employee.lastname || ''}`.trim() : (a.username || "-");
                const empShift = a.employee?.companyDetails?.shiftTiming || "N/A";

                return `
                <tr>
                    <td>${a.attendanceDate}</td>
                    <td>${empName}</td>
                    <td>${empShift}</td>
                    <td>${formatISTTime(a.checkInTime)}</td>
                    <td>${formatDurationMs(a.totalBreakTime)}</td>
                    <td>${formatMinutes(a.totalMeetingTime || 0)}</td>
                    <td class="${idleClass}">${formatMinutes(idleMinutes)}</td>
                    <td>${formatISTTime(a.checkOutTime)}</td>
                    <td>${formatDurationMs(a.totalWorkTime)}</td>
                    <td>${remarksHtml}</td>
                    <td class="${a.status === "Present" ? "text-success fw-bold" : "text-danger fw-bold"}">
                        ${a.status || 'Working'}
                    </td>
                </tr>`;
            }).join("");

        } catch (err) {
            console.error(err);
        }
    });

    // ==============================
    // 🌟 PDF (UNCHANGED)
    // ==============================
    pdfBtn.addEventListener("click", async () => {
        if (!resolveEmployee()) return alert("Select employee first");
        if (!fromDate.value || !toDate.value) return alert("Select date range");

        try {
            const res = await fetch(
                `/attendance/range/${selectedEmployeeId}?from=${fromDate.value}&to=${toDate.value}`
            );
            const data = await res.json();

            if (!data || data.length === 0) {
                return alert("No attendance records found for the selected range.");
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

            // 🔹 Title
            doc.setFontSize(18);
            doc.setTextColor(35, 210, 170); // Teal Title
            doc.text("Attendance Report", 148, 15, { align: "center" });

            // 🔹 Date Info
            const firstEmpName = data[0].employee ? `${data[0].employee.firstname || ''} ${data[0].employee.lastname || ''}`.trim() : (data[0].username || "");
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Employee: ${firstEmpName}`, 148, 22, { align: "center" });
            doc.text(`From: ${fromDate.value}   To: ${toDate.value}`, 148, 27, { align: "center" });

            // 🔹 Table
            doc.autoTable({
                startY: 35,
                head: [["Date", "Employee", "Shift", "Check-In", "Break", "Meeting", "Idle", "Check-Out", "Work Time", "Remarks", "Status"]],
                body: data.map(a => {
                    // Remarks Logic
                    let remarks = [];
                    if (a.lateIn || a.isLateIn) remarks.push(`Late (+${formatMinutes(a.lateMinutes)})`);
                    if (a.earlyOut) remarks.push(`Early (-${formatMinutes(a.earlyLeaveMinutes)})`);
                    const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";
                    const rowEmpName = a.employee ? `${a.employee.firstname || ''} ${a.employee.lastname || ''}`.trim() : (a.username || "-");

                    return [
                        a.attendanceDate,
                        rowEmpName,
                        a.employee?.companyDetails?.shiftTiming || "N/A",
                        formatISTTime(a.checkInTime),
                        formatDurationMs(a.totalBreakTime),
                        formatMinutes(a.totalMeetingTime || 0),
                        formatMinutes(a.idleTime),
                        formatISTTime(a.checkOutTime),
                        formatDurationMs(a.totalWorkTime),
                        remarksStr,
                        a.status
                    ];
                }),
                styles: {
                    font: "helvetica",
                    fontSize: 10,
                    cellPadding: 3,
                    valign: 'middle',
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [35, 210, 170], // Teal Header
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [234, 249, 240] // Mild Mint Row
                },
                columnStyles: {
                    0: { cellWidth: 25 }, // Date
                    1: { cellWidth: 30 }, // Name
                    2: { cellWidth: 25 }, // Shift
                    8: { cellWidth: 35 }, // Remarks
                }
            });

            doc.save(`Attendance_Report_${fromDate.value}_to_${toDate.value}.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Failed to generate PDF. Check console.");
        }
    });
};

sideNav();
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminAttendance);
} else {
    initAdminAttendance();
}
