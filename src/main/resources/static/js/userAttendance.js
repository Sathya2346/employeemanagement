// src/main/resources/static/js/userAttendance.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM ELEMENTS =====
  const checkInBtn = document.getElementById("checkInBtn");
  const breakBtn = document.getElementById("breakInBtn");
  const checkOutBtn = document.getElementById("checkOutBtn");
  const workHourEl = document.getElementById("workHour");
  const breakEl = document.getElementById("breakHour");
  const idleHourEl = document.getElementById("idleHour");
  const timeInEl = document.getElementById("timeIn");
  const timeOutEl = document.getElementById("timeOut");
  const attendanceTable = document.querySelector("#attendanceTable tbody");
  // const fromDateInput = document.getElementById("fromDate"); // Removed modal input
  // const toDateInput = document.getElementById("toDate");     // Removed modal input
  const monthYearEl = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendarBody");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const downloadBtn = document.getElementById("downloadAttendanceBtn"); // New ID
  const statusBadge = document.getElementById("statusBadge");

  // ===== EMPLOYEE DETAILS =====
  const employeeId = document.getElementById("employeeId")?.value;
  const username = document.getElementById("username")?.value;

  // ===== VARIABLES =====
  let checkInTime = null;
  let checkOutTime = null;
  let breakSessions = [];
  let isOnBreak = false;
  let timerInterval = null;
  let breakInterval = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  const STORAGE_KEY = `attendance_${employeeId}_${new Date().toDateString()}`;

  // ===== HELPERS =====
  // IST Helpers
  const toIST = (date) => new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const formatTimeDisplay = (date) => date ? date.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--";

  // Format hh:mm:ss a for DB (IST)
  const formatTimeForDB = (date) => {
    if (!date) return null;
    // Get IST time components
    const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  };

  // Format YYYY-MM-DD for DB (IST)
  const formatDateForDB = (date) => {
    if (!date) return null;
    const offsetDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const year = offsetDate.getFullYear();
    const month = String(offsetDate.getMonth() + 1).padStart(2, '0');
    const day = String(offsetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDuration = (ms) => {
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
  };
  const calculateTotalBreakTime = () => {
    let total = 0;
    breakSessions.forEach((b) => {
      if (b.end) total += b.end - b.start;
      else total += new Date() - b.start;
    });
    return total;
  };
  function startIdleOnServer() {
    fetch("/attendance/idle/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: new Date().toISOString() })
    });
  }

  function endIdleOnServer() {
    fetch("/attendance/idle/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: new Date().toISOString() })
    });
  }
  const IDLE_LIMIT_MS = 5 * 60 * 1000;
  let isIdle = false;
  let idleStartedAt = null;
  let totalIdleTime = 0;
  const LAST_ACTIVITY_KEY = `lastActivity_${employeeId}`;

  function updateLastActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now());
  }
  ["mousemove", "keydown", "scroll", "click"].forEach(event => {
    document.addEventListener(event, updateLastActivity);
  });

  setInterval(() => {
    if (!checkInTime || checkOutTime || isOnBreak) return;

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
    const now = Date.now();

    if (now - lastActivity > IDLE_LIMIT_MS) {
      if (!isIdle) {
        isIdle = true;
        idleStartedAt = new Date(lastActivity);
        startIdleOnServer();
        updateStatusBadge();
      }
      idleHourEl.textContent = formatDuration(
        totalIdleTime + (now - idleStartedAt)
      );
    }
  }, 1000);

  window.addEventListener("storage", (event) => {
    if (event.key === LAST_ACTIVITY_KEY && isIdle) {
      isIdle = false;
      endIdleOnServer();
      totalIdleTime += Date.now() - idleStartedAt;
      idleStartedAt = null;
      updateIdleTimeUI();
      updateStatusBadge();
      saveSession();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateLastActivity();
    }
  });
  function updateIdleTimeUI() {
    idleHourEl.textContent = formatDuration(totalIdleTime);
  }
  // ===== LOCAL STORAGE =====
  const saveSession = () => {
    const data = {
      checkInTime: checkInTime ? checkInTime.getTime() : null,
      checkOutTime: checkOutTime ? checkOutTime.getTime() : null,
      breakSessions: breakSessions.map((b) => ({ start: b.start ? b.start.getTime() : null, end: b.end ? b.end.getTime() : null })),
      isOnBreak,
      totalIdleTime
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // ===== FETCH ATTENDANCE FROM BACKEND =====
  async function loadUserAttendance() {
    const attendanceTableBody = document.querySelector("#attendanceTable tbody");
    const res = await fetch(`/attendance/last5/${employeeId}`);
    const data = await res.json();
    attendanceTableBody.innerHTML = "";
    data.forEach(record => {
      const dateStr = new Date(record.attendanceDate).toISOString().split("T")[0];
      const checkIn = record.checkInTime ?? "--:--";
      const checkOut = record.checkOutTime ?? "--:--";
      const shift = record.employee?.companyDetails?.shiftTiming || "-";

      // Remarks Logic
      let remarks = [];
      if (record.lateIn) {
        const lateStr = formatDuration(record.lateMinutes * 60000); // Convert mins to ms
        remarks.push(`Late (+${lateStr})`);
      }
      if (record.earlyOut) {
        const earlyStr = formatDuration(record.earlyLeaveMinutes * 60000); // Convert mins to ms
        remarks.push(`Early Leave (-${earlyStr})`);
      }
      const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";

      updateTable(
        dateStr,
        checkIn,
        checkOut,
        remarksStr,
        record.status ?? "Not Checked In"
      );
      // Explicitly set shift for historical rows loaded via this function
      const lastRow = attendanceTable.lastElementChild;
      if (lastRow) lastRow.cells[1].textContent = shift;
    });
  }
  window.addEventListener("load", loadUserAttendance);
  const loadSession = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const data = JSON.parse(stored);
    if (data.checkInTime) checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime) checkOutTime = new Date(data.checkOutTime);
    if (data.breakSessions) breakSessions = data.breakSessions.map((b) => ({ start: b.start ? new Date(b.start) : null, end: b.end ? new Date(b.end) : null }));
    isOnBreak = data.isOnBreak || false;
    totalIdleTime = data.totalIdleTime || 0;
    restoreUI();
  };

  // ===== STATUS BADGE =====
  function updateStatusBadge() {
    if (!checkInTime) { statusBadge.textContent = "Not Checked In"; }
    else if (checkOutTime) { statusBadge.textContent = "Checked Out"; }
    else if (isOnBreak) { statusBadge.textContent = "On Break"; }
    else if (isIdle) { statusBadge.textContent = "Idle"; }
    else { statusBadge.textContent = "Working"; }
  }
  loadUserAttendance();
  updateStatusBadge();
  // ===== CALENDAR =====
  const renderCalendar = (month, year) => {
    calendarBody.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");
        if (i === 0 && j < firstDay) { cell.textContent = ""; }
        else if (date > daysInMonth) { cell.textContent = ""; }
        else {
          const cellDate = new Date(year, month, date);
          cell.textContent = date;
          cell.classList.add("calendar-cell");
          cell.style.cursor = "pointer";
          const today = new Date();
          if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) cell.classList.add("bg-success", "text-white", "rounded-circle");
          cell.addEventListener("click", async () => {
            document.querySelectorAll(".calendar-cell").forEach(c => c.classList.remove("bg-primary", "text-white"));
            cell.classList.add("bg-primary", "text-white");
            const selectedDate = cellDate.toLocaleDateString("sv-SE");
            try {
              const res = await fetch(`/attendance/date/${employeeId}?date=${selectedDate}`);
              const data = await res.json();
              attendanceTable.innerHTML = "";
              if (data && data.length > 0) {
                data.forEach(record => {
                  const row = document.createElement("tr");
                  let remarks = [];
                  if (record.lateIn) {
                    const lateStr = formatDuration(record.lateMinutes * 60000);
                    remarks.push(`Late (+${lateStr})`);
                  }
                  if (record.earlyOut) {
                    const earlyStr = formatDuration(record.earlyLeaveMinutes * 60000);
                    remarks.push(`Early Leave (-${earlyStr})`);
                  }
                  const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";

                  row.innerHTML = `<td>${new Date(record.attendanceDate).toLocaleDateString()}</td>
                  <td>${record.employee?.companyDetails?.shiftTiming || "-"}</td>
                  <td>${record.checkInTime || "--:--"}</td><td>${record.checkOutTime || "--:--"}</td><td class="text-danger fw-bold">${remarksStr}</td><td>${record.status}</td>`;
                  attendanceTable.appendChild(row);
                });
              } else {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="4" class="text-center text-muted">No attendance data found</td>`;
                attendanceTable.appendChild(row);
              }
            } catch (err) { console.error(err); }
          });
          row.appendChild(cell);
          date++;
        }
      }
      calendarBody.appendChild(row);
    }
  };
  prevMonthBtn.addEventListener("click", () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(currentMonth, currentYear); });
  nextMonthBtn.addEventListener("click", () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(currentMonth, currentYear); });

  // ===== TIMERS =====
  function updateWorkTime() {
    if (checkInTime && !checkOutTime && !isOnBreak) {
      const now = new Date();
      let totalBreakMs = calculateTotalBreakTime();
      let workMs = now - checkInTime - totalBreakMs - totalIdleTime;
      workHourEl.textContent = formatDuration(workMs);
    }
  }
  const updateBreakTime = () => { breakEl.textContent = formatDuration(calculateTotalBreakTime()); };
  const updateTable = (date, checkIn, checkOut, remarks, status) => {
    const existing = Array.from(attendanceTable.rows).find(r => r.cells[0].textContent === date);
    // Fetch shift from page content if not available in real-time
    const shift = document.querySelector(".card-green p")?.textContent || "-";

    if (existing) {
      existing.cells[2].textContent = checkIn;
      existing.cells[3].textContent = checkOut;
      existing.cells[4].textContent = remarks;
      existing.cells[5].textContent = status;
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${date}</td><td>${shift}</td><td>${checkIn}</td><td>${checkOut}</td><td class="text-danger fw-bold">${remarks}</td><td>${status}</td>`;
      attendanceTable.appendChild(row);
    }
  };

  function restoreUI() {
    if (checkInTime) { timeInEl.textContent = formatTimeDisplay(checkInTime); checkInBtn.disabled = true; timerInterval = setInterval(updateWorkTime, 1000); }
    if (checkOutTime) { timeOutEl.textContent = formatTimeDisplay(checkOutTime); workHourEl.textContent = formatDuration(checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime); checkInBtn.disabled = true; breakBtn.disabled = true; checkOutBtn.disabled = true; }
    if (isOnBreak) { breakBtn.textContent = "Resume"; breakInterval = setInterval(updateBreakTime, 1000); clearInterval(timerInterval); }
    else if (checkInTime && !checkOutTime) { timerInterval = setInterval(updateWorkTime, 1000); }
    const date = new Date().toLocaleDateString();
    updateTable(date, checkInTime ? formatTimeDisplay(checkInTime) : "--:--", checkOutTime ? formatTimeDisplay(checkOutTime) : "--:--", "-", checkOutTime ? "Present" : "Working");
    updateBreakTime();
    updateStatusBadge();
  }

  // ===== BUTTON LOGIC =====
  checkInBtn.addEventListener("click", async () => {
    if (checkInTime) return alert("Already checked in!");
    checkInTime = new Date();
    timeInEl.textContent = formatTimeDisplay(checkInTime);
    timerInterval = setInterval(updateWorkTime, 1000);
    saveSession();
    const date = checkInTime.toLocaleDateString();
    updateTable(date, formatTimeDisplay(checkInTime), "--:--", "-", "Working");
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkInTime), checkInTime: formatTimeForDB(checkInTime), username }) });
    await loadUserAttendance();
  });

  breakBtn.addEventListener("click", () => {
    if (!checkInTime) return alert("Check in first!");
    if (checkOutTime) return alert("Already checked out!");
    if (!isOnBreak) { breakSessions.push({ start: new Date(), end: null }); isOnBreak = true; breakBtn.textContent = "Resume"; clearInterval(timerInterval); breakInterval = setInterval(updateBreakTime, 1000); }
    else { const activeBreak = breakSessions.find(b => !b.end); if (activeBreak) activeBreak.end = new Date(); isOnBreak = false; breakBtn.textContent = "Break"; clearInterval(breakInterval); timerInterval = setInterval(updateWorkTime, 1000); updateBreakTime(); }
    saveSession();
  });

  checkOutBtn.addEventListener("click", async () => {
    if (!checkInTime) return alert("Not checked in!");
    if (checkOutTime) return alert("Already checked out!");
    if (isOnBreak) { const activeBreak = breakSessions.find(b => !b.end); if (activeBreak) activeBreak.end = new Date(); isOnBreak = false; breakBtn.textContent = "Break"; }
    checkOutTime = new Date(); clearInterval(timerInterval); clearInterval(breakInterval);
    timeOutEl.textContent = formatTimeDisplay(checkOutTime);
    workHourEl.textContent = formatDuration(checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime);
    updateBreakTime(); saveSession();
    const date = checkOutTime.toLocaleDateString();
    updateTable(date, formatTimeDisplay(checkInTime), formatTimeDisplay(checkOutTime), "-", "Checked Out");
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkOutTime), checkInTime: formatTimeForDB(checkInTime), checkOutTime: formatTimeForDB(checkOutTime), totalWorkTime: checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime, totalBreakTime: calculateTotalBreakTime(), idleTime: Math.floor(totalIdleTime / 60000), username }) });
    await loadUserAttendance();
    alert("Checked out successfully!");
  });

  // ==============================
  // 🌟 PDF DOWNLOAD (Client-side)
  // ==============================
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // 🔹 Title
      doc.setFontSize(18);
      doc.setTextColor(35, 210, 170); // Teal
      doc.text("My Attendance Report", 105, 15, { align: "center" });

      // 🔹 Employee Info
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Employee: ${username || "N/A"}`, 105, 22, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 27, { align: "center" });

      // 🔹 Table Data
      const rows = [];
      const tableRows = document.querySelectorAll("#attendanceTable tbody tr");

      tableRows.forEach(tr => {
        const cells = tr.querySelectorAll("td");
        if (cells.length > 5) {
          rows.push([
            cells[0].innerText, // Date
            cells[1].innerText, // Shift
            cells[2].innerText, // Check In
            cells[3].innerText, // Check Out
            cells[4].innerText, // Remarks
            cells[5].innerText  // Status
          ]);
        }
      });

      // 🔹 Generate Table
      doc.autoTable({
        startY: 35,
        head: [["Date", "Shift", "Check In", "Check Out", "Remarks", "Status"]],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [35, 210, 170], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [234, 249, 240] },
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle', halign: 'center' }
      });

      doc.save(`My_Attendance_Report.pdf`);
    });
  }


  // ===== INITIALIZE =====
  loadSession();
  renderCalendar(currentMonth, currentYear);
  loadUserAttendance();
});