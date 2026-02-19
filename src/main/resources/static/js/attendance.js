// src/main/resources/static/js/attendance.js
document.addEventListener("DOMContentLoaded", async () => {
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

    function formatISTTime(timeStr) {
        if (!timeStr) return "--:--";
        return timeStr; // Server now sends "hh:mm:ss a"
    }

    function formatDurationMs(ms) {
        if (!ms || ms < 0) return "0m 0s";
        const totalSec = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;

        if (hrs === 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${hrs}h ${mins}m ${secs}s`;
        }
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
    function getStatusClass(status) {
        switch (status) {
            case "Present": return "bg-success";
            case "Absent": return "bg-danger";
            case "Idle": return "bg-warning text-dark";
            case "Checked Out": return "bg-primary text-white";
            case "On Break": return "bg-info text-dark";
            default: return "bg-secondary text-white";
        }
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

            data.forEach(record => {
                adminTableBody.innerHTML += `
            <tr>
                <td>${record.employee ? record.employee.firstname + ' ' + record.employee.lastname : record.username}</td>
                <td>${record.attendanceDate}</td>
                <td>${formatISTTime(record.checkInTime)}</td>
                <td>${formatISTTime(record.checkOutTime)}</td>
                <td class="text-danger fw-bold">
                    ${record.lateIn ? `Late (+${formatMinutes(record.lateMinutes)})` : ""} 
                    ${record.earlyOut ? `Early Leave (-${formatMinutes(record.earlyLeaveMinutes)})` : ""}
                </td>
                <td>
                    <span class="badge ${getStatusClass(record.status)}">
                        ${record.status}
                    </span>
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
    toDate.setAttribute("max", today);
    fromDate.setAttribute("max", today);

    // ==============================
    // 🌟 Employee Search
    // ==============================
    let employees = [];
    let selectedEmployeeId = null;

    async function loadEmployees() {
        try {
            const res = await fetch("/admin/all");
            employees = await res.json();
        } catch (e) {
            console.error("Error loading employees:", e);
        }
    }
    await loadEmployees();

    const searchInput = document.getElementById("employeeSearch");
    const suggestionsList = document.getElementById("employeeSuggestions");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        suggestionsList.innerHTML = "";

        if (!query) {
            suggestionsList.style.display = "none";
            selectedEmployeeId = null;
            return;
        }

        const filtered = employees.filter(emp =>
            `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(query)
        );

        if (!filtered.length) {
            suggestionsList.style.display = "none";
            return;
        }

        filtered.forEach(emp => {
            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action";
            li.textContent = `${emp.firstname} (${emp.companyDetails?.designation || "N/A"})`;

            li.addEventListener("click", () => {
                searchInput.value = li.textContent;
                selectedEmployeeId = emp.id;
                suggestionsList.style.display = "none";

                if (emp.joiningDate) {
                    fromDate.value = emp.joiningDate;
                    fromDate.setAttribute("min", emp.joiningDate);
                }
                toDate.value = today;
            });

            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = "block";
    });

    document.addEventListener("click", e => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = "none";
        }
    });

    // ==============================
    // 🌟 Filter Attendance
    // ==============================
    filterBtn.addEventListener("click", async () => {
        if (!selectedEmployeeId || !fromDate.value || !toDate.value) {
            alert("Please select employee and date range");
            return;
        }

        try {
            const res = await fetch(
                `/attendance/range/${selectedEmployeeId}?from=${fromDate.value}&to=${toDate.value}`
            );
            const data = await res.json();

            if (!data.length) {
                tableBody.innerHTML = `<tr><td colspan="9">No records found</td></tr>`;
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
                if (a.lateIn) {
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

                return `
                <tr>
                    <td>${a.attendanceDate}</td>
                    <td>${a.employee.firstname} ${a.employee.lastname}</td>
                    <td>${a.employee.companyDetails?.shiftTiming || "N/A"}</td>
                    <td>${formatISTTime(a.checkInTime)}</td>
                    <td>${formatDurationMs(a.totalBreakTime)}</td>
                    <td class="${idleClass}">${formatMinutes(idleMinutes)}</td>
                    <td>${formatISTTime(a.checkOutTime)}</td>
                    <td>${formatDurationMs(a.totalWorkTime)}</td>
                    <td>${remarksHtml}</td>
                    <td class="${a.status === "Present" ? "text-success fw-bold" : "text-danger fw-bold"}">
                        ${a.status}
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
        if (!selectedEmployeeId) return alert("Select employee first");
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
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Employee: ${data[0].employee.firstname} ${data[0].employee.lastname}`, 148, 22, { align: "center" });
            doc.text(`From: ${fromDate.value}   To: ${toDate.value}`, 148, 27, { align: "center" });

            // 🔹 Table
            doc.autoTable({
                startY: 35,
                head: [["Date", "Employee", "Shift", "Check-In", "Break", "Idle", "Check-Out", "Work Time", "Remarks", "Status"]],
                body: data.map(a => {
                    // Remarks Logic
                    let remarks = [];
                    if (a.lateIn) remarks.push(`Late (+${formatMinutes(a.lateMinutes)})`);
                    if (a.earlyOut) remarks.push(`Early (-${formatMinutes(a.earlyLeaveMinutes)})`);
                    const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";

                    return [
                        a.attendanceDate,
                        `${a.employee.firstname} ${a.employee.lastname}`,
                        a.employee.companyDetails?.shiftTiming || "N/A",
                        formatISTTime(a.checkInTime),
                        formatDurationMs(a.totalBreakTime),
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
    await loadAdminAttendance();
});