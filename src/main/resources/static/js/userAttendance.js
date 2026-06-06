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

  const getISTDateTimeString = (date = new Date()) => {
    const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const pad = (n) => String(n).padStart(2, '0');
    const padMs = (n) => String(n).padStart(3, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
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
  let totalIdleTime = 0;
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
    try {
      const attendanceTableBody = document.querySelector("#attendanceTable tbody");
      const res = await fetch(`/attendance/last5/${employeeId}`);
      if (!res.ok) throw new Error("Failed to load user attendance data");
      const data = await res.json();
      attendanceTableBody.innerHTML = "";
      data.forEach(record => {
        const dateStr = record.attendanceDate; // Direct string to avoid timezone-sensitive new Date().toISOString() shifts
        const checkIn = record.checkInTime ?? "--:--";
        const checkOut = record.checkOutTime ?? "--:--";
        const shift = record.employee?.companyDetails?.shiftTiming || "-";

        // Remarks Logic
        let remarks = [];
        if (record.lateIn || record.isLateIn) {
          const lateStr = formatDuration(record.lateMinutes * 60000); // Convert mins to ms
          remarks.push(`Late (+${lateStr})`);
        }
        if (record.earlyOut) {
          const earlyStr = formatDuration(record.earlyLeaveMinutes * 60000); // Convert mins to ms
          remarks.push(`Early Leave (-${earlyStr})`);
        }
        const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";

        let displayStatus = record.status ?? "Not Checked In";
        if (dateStr === formatDateForDB(new Date())) {
          if (checkInTime && !checkOutTime) {
            if (isOnBreak) {
              displayStatus = "On Break";
            } else if (typeof isIdle !== "undefined" && isIdle) {
              displayStatus = "Idle";
            } else {
              displayStatus = "Working";
            }
          }
        }

        updateTable(
          dateStr,
          shift,
          checkIn,
          checkOut,
          remarksStr,
          displayStatus
        );
      });
    } catch (err) {
      console.error("Error loading user attendance:", err);
    }
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
    else if (typeof isIdle !== "undefined" && isIdle) { statusBadge.textContent = "Idle"; }
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
                  if (record.lateIn || record.isLateIn) {
                    const lateStr = formatDuration(record.lateMinutes * 60000);
                    remarks.push(`Late (+${lateStr})`);
                  }
                  if (record.earlyOut) {
                    const earlyStr = formatDuration(record.earlyLeaveMinutes * 60000);
                    remarks.push(`Early Leave (-${earlyStr})`);
                  }
                  const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";

                  let displayStatus = record.status;
                  if (record.attendanceDate === formatDateForDB(new Date())) {
                    if (checkInTime && !checkOutTime) {
                      if (isOnBreak) {
                        displayStatus = "On Break";
                      } else if (typeof isIdle !== "undefined" && isIdle) {
                        displayStatus = "Idle";
                      } else {
                        displayStatus = "Working";
                      }
                    }
                  }

                  row.innerHTML = `<td>${record.attendanceDate}</td>
                  <td>${record.employee?.companyDetails?.shiftTiming || "-"}</td>
                  <td>${record.checkInTime || "--:--"}</td><td>${record.checkOutTime || "--:--"}</td><td class="text-danger fw-bold">${remarksStr}</td><td>${displayStatus}</td>`;
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
  const updateTable = (date, shift, checkIn, checkOut, remarks, status) => {
    const existing = Array.from(attendanceTable.rows).find(r => r.cells[0].textContent === date);

    if (existing) {
      existing.cells[1].textContent = shift;
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
    const date = formatDateForDB(new Date()); // Consistently use YYYY-MM-DD
    const shift = document.getElementById("shiftTiming")?.value || "-";
    updateTable(date, shift, checkInTime ? formatTimeDisplay(checkInTime) : "--:--", checkOutTime ? formatTimeDisplay(checkOutTime) : "--:--", "-", checkOutTime ? "Present" : "Working");
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
    updateStatusBadge();
    const date = formatDateForDB(checkInTime);
    const shift = document.getElementById("shiftTiming")?.value || "-";
    updateTable(date, shift, formatTimeDisplay(checkInTime), "--:--", "-", "Working");
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkInTime), checkInTime: formatTimeForDB(checkInTime), username }) });
    await loadUserAttendance();
  });

  breakBtn.addEventListener("click", async () => {
    if (!checkInTime) return alert("Check in first!");
    if (checkOutTime) return alert("Already checked out!");
    if (!isOnBreak) { 
      breakSessions.push({ start: new Date(), end: null }); 
      isOnBreak = true; 
      breakBtn.textContent = "Resume"; 
      clearInterval(timerInterval); 
      breakInterval = setInterval(updateBreakTime, 1000); 
      updateStatusBadge();
      await fetch("/attendance/break/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: getISTDateTimeString() })
      });
    }
    else { 
      const activeBreak = breakSessions.find(b => !b.end); 
      if (activeBreak) activeBreak.end = new Date(); 
      isOnBreak = false; 
      breakBtn.textContent = "Break"; 
      clearInterval(breakInterval); 
      timerInterval = setInterval(updateWorkTime, 1000); 
      updateBreakTime(); 
      updateStatusBadge();
      await fetch("/attendance/break/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: getISTDateTimeString() })
      });
    }
    saveSession();
    await loadUserAttendance();
  });

  checkOutBtn.addEventListener("click", async () => {
    if (!checkInTime) return alert("Not checked in!");
    if (checkOutTime) return alert("Already checked out!");
    if (isOnBreak) { const activeBreak = breakSessions.find(b => !b.end); if (activeBreak) activeBreak.end = new Date(); isOnBreak = false; breakBtn.textContent = "Break"; }
    checkOutTime = new Date(); clearInterval(timerInterval); clearInterval(breakInterval);
    timeOutEl.textContent = formatTimeDisplay(checkOutTime);
    workHourEl.textContent = formatDuration(checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime);
    updateBreakTime(); saveSession();
    updateStatusBadge();
    const date = formatDateForDB(checkOutTime);
    const shift = document.getElementById("shiftTiming")?.value || "-";
    updateTable(date, shift, formatTimeDisplay(checkInTime), formatTimeDisplay(checkOutTime), "-", "Checked Out");
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkOutTime), checkInTime: formatTimeForDB(checkInTime), checkOutTime: formatTimeForDB(checkOutTime), totalWorkTime: checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime, totalBreakTime: calculateTotalBreakTime(), idleTime: Math.floor(totalIdleTime / 60000), username }) });
    await loadUserAttendance();
    alert("Checked out successfully!");
  });

  // ==============================
  // 🌟 PDF DOWNLOAD (Client-side)
  // ==============================
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const fromDate = document.getElementById("fromDateDownload")?.value;
      const toDate = document.getElementById("toDateDownload")?.value;

      let reportData = [];

      // 1. If valid dates are provided, fetch from backend API
      if (fromDate && toDate) {
        // Prevent 'To' date from being greater than today's date
        const today = formatDateForDB(new Date());
        if (toDate > today) {
          alert("The 'To' date cannot be greater than today's date.");
          return;
        }

        try {
          const res = await fetch(`/attendance/range/${employeeId}?from=${fromDate}&to=${toDate}`);
          if (res.ok) {
            const data = await res.json();
            reportData = data;
          } else {
            console.error("Failed to fetch filtered attendance data");
            alert("Could not fetch data for the selected date range.");
            return;
          }
        } catch (err) {
          console.error("Error fetching filtered data for PDF:", err);
          alert("System error reading dates.");
          return;
        }
      }

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

      let dateRangeStr = `Generated: ${new Date().toLocaleDateString()}`;
      if (fromDate && toDate) {
        dateRangeStr = `Period: ${fromDate} to ${toDate}`;
      }
      doc.text(dateRangeStr, 105, 27, { align: "center" });

      // 🔹 Table Data
      const rows = [];

      if (reportData.length > 0) {
        // Process fetched API data
        const shiftTiming = document.querySelector(".card-green p")?.textContent || "-"; // Fallback to basic shift

        reportData.forEach(record => {
          const dateStr = record.attendanceDate; // Direct string formatting to avoid timezone shifting
          const checkIn = record.checkInTime ?? "--:--";
          const checkOut = record.checkOutTime ?? "--:--";

          let remarks = [];
          if (record.lateIn || record.isLateIn) remarks.push(`Late`);
          if (record.earlyOut) remarks.push(`Early Leave`);
          const remarksStr = remarks.length > 0 ? remarks.join(", ") : "-";
          const status = record.status ?? "-";

          rows.push([dateStr, record.employee?.companyDetails?.shiftTiming || shiftTiming, checkIn, checkOut, remarksStr, status]);
        });
      } else {
        // Fallback to DOM parsing (Last 5 days) if no dates or empty dates selected
        const tableRows = document.querySelectorAll("#attendanceTable tbody tr");

        tableRows.forEach(tr => {
          const cells = tr.querySelectorAll("td");
          if (cells.length > 5 && cells[0].innerText !== "No attendance data found") {
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
      }

      if (rows.length === 0) {
        alert("No attendance data found for this period.");
        return;
      }

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