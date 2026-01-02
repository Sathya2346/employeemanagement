// src/main/resources/static/js/attendance.js
document.addEventListener("DOMContentLoaded", async () => {
    // ==============================
    // ✅ IST HELPERS
    // ==============================
    function formatMinutes(mins) {
        if (mins == null || mins < 0) return "--";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    }

    function formatISTTime(timeStr) {
        if (!timeStr) return "--:--";
        const date = new Date(`1970-01-01T${timeStr}`);
        return date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    function todayIST() {
        return new Date().toLocaleDateString("sv-SE", {
            timeZone: "Asia/Kolkata"
        });
    }

    // ==============================
// ✅ HELPER: Status badge class
// ==============================
function getStatusClass(status) {
    switch(status) {
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
                <td>${record.username}</td>
                <td>${record.attendanceDate}</td>
                <td>${formatISTTime(record.checkInTime)}</td>
                <td>${formatISTTime(record.checkOutTime)}</td>
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
            li.textContent = `${emp.firstname} (${emp.companyDetails?.department || "N/A"})`;

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
                let checkInHtml = formatISTTime(a.checkInTime);
                if (a.lateCheckIn && a.status !== "Absent") {
                    checkInHtml += `<br>
                        <small class="text-danger fw-bold">
                            Late In (${a.lateMinutes}m)
                        </small>`;
                }

                // ==============================
                // ✅ CHECK-OUT WITH EARLY COMMENT
                // ==============================
                let checkOutHtml = formatISTTime(a.checkOutTime);
                if (a.earlyCheckOut && a.status !== "Absent") {
                    checkOutHtml += `<br>
                        <small class="text-warning fw-bold">
                            Early Out (${a.earlyLeaveMinutes}m)
                        </small>`;
                }

                const idleMinutes = a.idleTime || 0;
                let idleClass = "bg-success";
                if (idleMinutes >= 60) idleClass = "bg-danger";
                else if (idleMinutes >= 30) idleClass = "bg-warning text-dark";

                return `
                <tr>
                    <td>${a.attendanceDate}</td>
                    <td>${a.employee.firstname} ${a.employee.lastname}</td>
                    <td>${a.employee.companyDetails?.shiftTiming || "N/A"}</td>
                    <td>${checkInHtml}</td>
                    <td>${formatMinutes(a.totalBreakTime)}</td>
                    <td class="${idleClass}">${formatMinutes(idleMinutes)}</td>
                    <td>${checkOutHtml}</td>
                    <td>${formatMinutes(a.totalWorkTime)}</td>
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

        const res = await fetch(
            `/attendance/range/${selectedEmployeeId}?from=${fromDate.value}&to=${toDate.value}`
        );
        const data = await res.json();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.text("Attendance Report", 105, 15, { align: "center" });

        doc.autoTable({
            startY: 25,
            head: [["Date", "Check-In", "Break", "Idle", "Check-Out", "Work", "Status"]],
            body: data.map(a => [
                a.attendanceDate,
                formatISTTime(a.checkInTime),
                formatMinutes(a.totalBreakTime),
                formatMinutes(a.idleTime),
                formatISTTime(a.checkOutTime),
                formatMinutes(a.totalWorkTime),
                a.status
            ])
        });

        doc.save("Attendance_Report.pdf");
    });
    await loadAdminAttendance();
});