const initUserAttendance = () => {
  // ===== DOM ELEMENTS =====
  const checkInBtn = document.getElementById("checkInBtn");
  const breakBtn = document.getElementById("breakInBtn");
  const meetingBtn = document.getElementById("meetingBtn");
  const checkOutBtn = document.getElementById("checkOutBtn");
  const workHourEl = document.getElementById("workHour");
  const breakEl = document.getElementById("breakHour");
  const meetingHourEl = document.getElementById("meetingHour");
  const idleHourEl = document.getElementById("idleHour");
  const timeInEl = document.getElementById("timeIn");
  const timeOutEl = document.getElementById("timeOut");
  const attendanceTable = document.querySelector("#attendanceTable tbody");
  const monthYearEl = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendarBody");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const downloadBtn = document.getElementById("downloadAttendanceBtn");
  const statusBadge = document.getElementById("statusBadge");

  // ===== EMPLOYEE DETAILS =====
  const employeeId = document.getElementById("employeeId")?.value;
  const username = document.getElementById("username")?.value;

  // ===== VARIABLES =====
  let checkInTime = null;
  let checkOutTime = null;
  let breakSessions = [];
  let isOnBreak = false;
  let isInMeeting = false;
  let meetingSessions = [];    // { start: Date, end: Date|null }
  let meetingInterval = null;
  let timerInterval = null;
  let breakInterval = null;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  const STORAGE_KEY = `attendance_${employeeId}_${new Date().toDateString()}`;

  // ===== HELPERS =====
  // IST Helpers
  const toIST = (date) => new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const formatTimeDisplay = (date) => date ? date.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--";

  const format12HourTime = (timeVal) => {
    if (!timeVal || timeVal === "--:--" || timeVal === "-") return "--:--";
    if (Array.isArray(timeVal)) {
      const [h, m, s] = timeVal;
      const ampm = h >= 12 ? "PM" : "AM";
      const hours = h % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s || 0).padStart(2, "0")} ${ampm}`;
    }
    if (typeof timeVal === "string") {
      if (/am|pm/i.test(timeVal)) return timeVal;
      const parts = timeVal.split(":");
      if (parts.length < 2) return timeVal;
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1].padStart(2, "0");
      const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
    }
    return String(timeVal);
  };

  const parseTimeToMs = (timeStr) => {
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
  };

  // Format HH:mm:ss for DB (IST 24-hour)
  const formatTimeForDB = (date) => {
    if (!date) return null;
    const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
  const calculateTotalMeetingTime = () => {
    let total = 0;
    meetingSessions.forEach((m) => {
      if (m.end) total += m.end - m.start;
      else total += new Date() - m.start;
    });
    return total;
  };
  const updateMeetingTime = () => {
    const ms = calculateTotalMeetingTime();
    if (meetingHourEl) meetingHourEl.textContent = formatDuration(ms);
    if (checkInTime) {
      const todayStr = formatDateForDB(new Date());
      const existing = Array.from(attendanceTable.rows).find(r => r.cells[0].textContent === todayStr);
      if (existing && existing.cells.length >= 5) {
        existing.cells[4].textContent = ms > 0 ? formatDuration(ms) : "-";
      }
    }
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
      meetingSessions: meetingSessions.map((m) => ({ start: m.start ? m.start.getTime() : null, end: m.end ? m.end.getTime() : null })),
      isOnBreak,
      isInMeeting,
      totalIdleTime
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const parseDBTimeToDate = (timeVal) => {
    if (!timeVal || timeVal === "--:--" || timeVal === "-") return null;
    let hours = 0, minutes = 0, seconds = 0;
    if (Array.isArray(timeVal)) {
      [hours, minutes, seconds] = timeVal;
    } else if (typeof timeVal === "string") {
      const parts = timeVal.split(':');
      if (parts.length < 2) return null;
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      seconds = parseInt(parts[2], 10) || 0;
    } else {
      return null;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
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
        let dateStr = record.attendanceDate;
        if (Array.isArray(dateStr)) {
          const [y, m, d] = dateStr;
          dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        const checkIn = record.checkInTime ? format12HourTime(record.checkInTime) : "--:--";
        const checkOut = record.checkOutTime ? format12HourTime(record.checkOutTime) : "--:--";
        const shift = record.employee?.companyDetails?.shiftTiming || "-";

        // Remarks Logic
        let remarks = [];
        let earlyInMs = 0;
        if (record.earlyInMinutes && record.earlyInMinutes > 0) {
          earlyInMs = record.earlyInMinutes * 60000;
        } else if (record.checkInTime && record.checkInTime !== "--:--" && shift && shift !== "-") {
          const match = shift.match(/\(([^-\)]+)/);
          if (match) {
            const shiftStartStr = match[1].trim();
            const shiftStartMs = parseTimeToMs(shiftStartStr);
            const checkInMs = parseTimeToMs(record.checkInTime);
            if (shiftStartMs > 0 && checkInMs > 0 && checkInMs < shiftStartMs) {
              earlyInMs = shiftStartMs - checkInMs;
            }
          }
        }

        if (record.earlyIn || record.earlyCheckIn || earlyInMs > 0) {
          const earlyInStr = earlyInMs > 0 ? formatDuration(earlyInMs) : "";
          remarks.push(`Early Login${earlyInStr ? ' (+' + earlyInStr + ')' : ''}`);
        }
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
          const hasDbCheckIn = record.checkInTime && record.checkInTime !== "--:--";
          const hasDbCheckOut = record.checkOutTime && record.checkOutTime !== "--:--";

          if (!hasDbCheckIn && !hasDbCheckOut) {
            // DB has no check-in or check-out for today (e.g. record deleted from DB)
            checkInTime = null;
            checkOutTime = null;
            breakSessions = [];
            meetingSessions = [];
            isOnBreak = false;
            isInMeeting = false;
            totalIdleTime = 0;
            if (typeof timerInterval !== "undefined") clearInterval(timerInterval);
            if (typeof breakInterval !== "undefined") clearInterval(breakInterval);
            if (typeof meetingInterval !== "undefined") clearInterval(meetingInterval);
            localStorage.removeItem(STORAGE_KEY);

            checkInBtn.disabled = false;
            breakBtn.disabled = false;
            if (meetingBtn) meetingBtn.disabled = false;
            checkOutBtn.disabled = false;

            if (timeInEl) timeInEl.textContent = "--:--";
            if (timeOutEl) timeOutEl.textContent = "--:--";
            if (workHourEl) workHourEl.textContent = "0m 0s";
            if (breakEl) breakEl.textContent = "0m 0s";
            if (meetingHourEl) meetingHourEl.textContent = "0m 0s";
            if (idleHourEl) idleHourEl.textContent = "0m 0s";
            displayStatus = "Not Checked In";
            updateStatusBadge();
            if (hasDbCheckIn) {
              if (!checkInTime) {
                checkInTime = parseDBTimeToDate(record.checkInTime);
              }
            }
            if (hasDbCheckOut) {
              if (!checkOutTime) {
                checkOutTime = parseDBTimeToDate(record.checkOutTime);
              }
              checkInBtn.disabled = true;
              breakBtn.disabled = true;
              if (meetingBtn) meetingBtn.disabled = true;
              checkOutBtn.disabled = true;
              displayStatus = record.status || "Checked Out";
              saveSession();
            } else if (checkInTime && !checkOutTime) {
              if (isInMeeting)       displayStatus = "In Meeting";
              else if (isOnBreak)    displayStatus = "On Break";
              else if (typeof isIdle !== "undefined" && isIdle) displayStatus = "Idle";
              else                   displayStatus = "Working";
              restoreUI();
            }
          }
          updateStatusBadge(displayStatus);
        }

        // Meeting display
        let meetingMs = 0;
        const todayDBStr = formatDateForDB(new Date());
        if (dateStr === todayDBStr) {
          meetingMs = calculateTotalMeetingTime();
          if (meetingMs === 0 && record.totalMeetingTime) {
            meetingMs = record.totalMeetingTime * 60000;
          }
        } else {
          meetingMs = (record.totalMeetingTime ?? 0) * 60000;
        }
        const meetingDisplay = meetingMs > 0 ? formatDuration(meetingMs) : "-";

        // Status badge class
        const statusClass = (() => {
          const s = displayStatus.toLowerCase().replace(/\s+/g, '');
          if (s.includes('present'))   return 'badge-present';
          if (s.includes('working'))   return 'badge-working';
          if (s.includes('break'))     return 'badge-break';
          if (s.includes('meeting'))   return 'badge-meeting';
          if (s.includes('idle') || s.includes('checkedout')) return 'badge-idle';
          if (s.includes('leave'))     return 'badge-leave';
          if (s.includes('absent'))    return 'badge-absent';
          if (s.includes('partial'))   return 'badge-partial';
          return 'badge-idle';
        })();

        updateTable(
          dateStr,
          shift,
          checkIn,
          checkOut,
          meetingDisplay,
          remarksStr,
          displayStatus,
          statusClass
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
    if (data.meetingSessions) meetingSessions = data.meetingSessions.map((m) => ({ start: m.start ? new Date(m.start) : null, end: m.end ? new Date(m.end) : null }));
    isOnBreak = data.isOnBreak || false;
    isInMeeting = data.isInMeeting || false;
    totalIdleTime = data.totalIdleTime || 0;
    restoreUI();
  };

  // ===== STATUS BADGE =====
  function updateStatusBadge(customStatus) {
    if (!statusBadge) return;
    if (customStatus) {
      statusBadge.textContent = customStatus;
      return;
    }
    if (!checkInTime) { statusBadge.textContent = "Not Checked In"; }
    else if (checkOutTime) { statusBadge.textContent = "Checked Out"; }
    else if (isInMeeting) { statusBadge.textContent = "In Meeting"; }
    else if (isOnBreak) { statusBadge.textContent = "On Break"; }
    else if (typeof isIdle !== "undefined" && isIdle) { statusBadge.textContent = "Idle"; }
    else { statusBadge.textContent = "Working"; }
  }
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
  renderCalendar(currentMonth, currentYear);

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
  const updateTable = (date, shift, checkIn, checkOut, meeting, remarks, status, statusClass = '') => {
    const existing = Array.from(attendanceTable.rows).find(r => r.cells[0].textContent === date);
    const badgeHtml = statusClass
      ? `<span class="status-badge ${statusClass}">${status}</span>`
      : status;
    if (existing) {
      existing.cells[1].textContent = shift;
      existing.cells[2].textContent = checkIn;
      existing.cells[3].textContent = checkOut;
      existing.cells[4].textContent = meeting;
      existing.cells[5].textContent = remarks;
      existing.cells[6].innerHTML = badgeHtml;
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${date}</td><td>${shift}</td><td>${checkIn}</td><td>${checkOut}</td><td>${meeting}</td><td class="text-danger fw-bold">${remarks}</td><td>${badgeHtml}</td>`;
      attendanceTable.appendChild(row);
    }
  };

  function restoreUI() {
    if (checkInTime) { 
      timeInEl.textContent = formatTimeDisplay(checkInTime); 
      checkInBtn.disabled = true; 
      checkInBtn.textContent = "Check-In";
      timerInterval = setInterval(updateWorkTime, 1000); 
    } else {
      checkInBtn.disabled = false;
      checkInBtn.textContent = "Check-In";
    }
    if (checkOutTime) { 
      timeOutEl.textContent = formatTimeDisplay(checkOutTime); 
      workHourEl.textContent = formatDuration(checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime); 
      checkInBtn.disabled = true; 
      checkInBtn.textContent = "Check-In";
      breakBtn.disabled = true; 
      if(meetingBtn) meetingBtn.disabled = true; 
      checkOutBtn.disabled = true; 
    }
    if (isOnBreak) { breakBtn.textContent = "Resume"; breakInterval = setInterval(updateBreakTime, 1000); clearInterval(timerInterval); }
    else if (isInMeeting) { if(meetingBtn) { meetingBtn.textContent = "End Meeting"; meetingBtn.classList.add('active-meeting'); } meetingInterval = setInterval(updateMeetingTime, 1000); }
    else if (checkInTime && !checkOutTime) { timerInterval = setInterval(updateWorkTime, 1000); }
    const date = formatDateForDB(new Date());
    const shift = document.getElementById("shiftTiming")?.value || "-";
    const meetingTotal = meetingSessions.length > 0 ? `${meetingSessions.length} session(s)` : "-";
    updateTable(date, shift, checkInTime ? formatTimeDisplay(checkInTime) : "--:--", checkOutTime ? formatTimeDisplay(checkOutTime) : "--:--", meetingTotal, "-", checkOutTime ? "Present" : "Working");
    updateBreakTime();
    updateMeetingTime();
    updateStatusBadge();
  }

  // ===== BUTTON LOGIC =====
  checkInBtn.addEventListener("click", async () => {
    if (checkInTime) return alert("Already checked in!");
    checkInTime = new Date();
    checkInBtn.disabled = true;
    checkInBtn.textContent = "Check-In";
    timeInEl.textContent = formatTimeDisplay(checkInTime);
    timerInterval = setInterval(updateWorkTime, 1000);
    saveSession();
    updateStatusBadge();
    const date = formatDateForDB(checkInTime);
    const shift = document.getElementById("shiftTiming")?.value || "-";
    updateTable(date, shift, formatTimeDisplay(checkInTime), "--:--", "-", "-", "Working");
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkInTime), checkInTime: formatTimeForDB(checkInTime), username }) });
    await loadUserAttendance();
  });

  breakBtn.addEventListener("click", async () => {
    if (!checkInTime) return alert("Check in first!");
    if (checkOutTime) return alert("Already checked out!");
    if (isInMeeting) return alert("Please end your meeting before taking a break!");
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

  if (meetingBtn) {
    meetingBtn.addEventListener("click", async () => {
      if (!checkInTime) return alert("Please check in first before starting a meeting!");
      if (checkOutTime) return alert("You have already checked out for today!");
      if (isOnBreak) return alert("Please end your break before starting a meeting!");

      if (!isInMeeting) {
        meetingSessions.push({ start: new Date(), end: null });
        isInMeeting = true;
        meetingBtn.textContent = "End Meeting";
        meetingBtn.classList.add("active-meeting");
        meetingInterval = setInterval(updateMeetingTime, 1000);
        updateStatusBadge();
        try {
          await fetch("/attendance/meeting/start", { method: "POST" });
        } catch (e) {
          console.error("Error starting meeting:", e);
        }
      } else {
        const activeM = meetingSessions.find((m) => !m.end);
        if (activeM) activeM.end = new Date();
        isInMeeting = false;
        meetingBtn.textContent = "Start Meeting";
        meetingBtn.classList.remove("active-meeting");
        clearInterval(meetingInterval);
        updateMeetingTime();
        updateStatusBadge();
        try {
          await fetch("/attendance/meeting/end", { method: "POST" });
        } catch (e) {
          console.error("Error ending meeting:", e);
        }
      }
      saveSession();
      await loadUserAttendance();
    });
  }

  checkOutBtn.addEventListener("click", async () => {
    if (!checkInTime) return alert("Not checked in!");
    if (checkOutTime) return alert("Already checked out!");
    // Auto-end meeting if active
    if (isInMeeting) {
      const activeM = meetingSessions.find(m => !m.end);
      if (activeM) activeM.end = new Date();
      isInMeeting = false;
      clearInterval(meetingInterval);
      if (meetingBtn) { meetingBtn.textContent = "Start Meeting"; meetingBtn.classList.remove('active-meeting'); }
      await fetch("/attendance/meeting/end", { method: "POST" });
    }
    if (isOnBreak) { const activeBreak = breakSessions.find(b => !b.end); if (activeBreak) activeBreak.end = new Date(); isOnBreak = false; breakBtn.textContent = "Break"; }
    checkOutTime = new Date(); clearInterval(timerInterval); clearInterval(breakInterval);
    timeOutEl.textContent = formatTimeDisplay(checkOutTime);
    workHourEl.textContent = formatDuration(checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime);
    updateBreakTime(); updateMeetingTime(); saveSession();
    updateStatusBadge();
    const date = formatDateForDB(checkOutTime);
    const shift = document.getElementById("shiftTiming")?.value || "-";
    const meetingTotal = meetingSessions.length > 0 ? `${meetingSessions.length} session(s)` : "-";
    const totalWorkMins = Math.max(0, Math.round((checkOutTime - checkInTime - calculateTotalBreakTime() - totalIdleTime) / 60000));
    const totalBreakMins = Math.max(0, Math.round(calculateTotalBreakTime() / 60000));
    await fetch(`/attendance/save/${employeeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceDate: formatDateForDB(checkOutTime), checkInTime: formatTimeForDB(checkInTime), checkOutTime: formatTimeForDB(checkOutTime), totalWorkTime: totalWorkMins, totalBreakTime: totalBreakMins, idleTime: Math.floor(totalIdleTime / 60000), username }) });
    await loadUserAttendance();
    alert("Checked out successfully!");
  });

  // ==============================
  // 🌟 FILTER & PDF DOWNLOAD
  // ==============================
  const filterAttendanceBtn = document.getElementById("filterAttendanceBtn");
  if (filterAttendanceBtn) {
    filterAttendanceBtn.addEventListener("click", async () => {
      let fromDate = document.getElementById("fromDateDownload")?.value;
      let toDate = document.getElementById("toDateDownload")?.value;

      if (!fromDate && !toDate) {
        alert("Please select a From Date or To Date to filter!");
        return;
      }

      try {
        const res = await fetch(`/attendance/range/${employeeId}?from=${fromDate || '1970-01-01'}&to=${toDate || '2099-12-31'}`);
        const attendanceTableBody = document.querySelector("#attendanceTable tbody");
        if (res.ok) {
          const data = await res.json();
          attendanceTableBody.innerHTML = "";
          if (data && data.length > 0) {
            data.forEach(record => {
              let dateStr = record.attendanceDate;
              if (Array.isArray(dateStr)) {
                const [y, m, d] = dateStr;
                dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              }
              const checkIn = record.checkInTime ? format12HourTime(record.checkInTime) : "--:--";
              const checkOut = record.checkOutTime ? format12HourTime(record.checkOutTime) : "--:--";
              const shift = record.employee?.companyDetails?.shiftTiming || "-";
              const meetingMin = record.totalMeetingTime ?? 0;
              const meetingDisplay = meetingMin > 0 ? formatDuration(meetingMin * 60000) : "-";
              const displayStatus = record.status || "Not Checked In";
              const statusClass = (() => {
                const s = displayStatus.toLowerCase().replace(/\s+/g, '');
                if (s.includes('present'))   return 'badge-present';
                if (s.includes('working'))   return 'badge-working';
                if (s.includes('break'))     return 'badge-break';
                if (s.includes('meeting'))   return 'badge-meeting';
                if (s.includes('idle') || s.includes('checkedout')) return 'badge-idle';
                if (s.includes('leave'))     return 'badge-leave';
                if (s.includes('absent'))    return 'badge-absent';
                return 'badge-idle';
              })();
              updateTable(dateStr, shift, checkIn, checkOut, meetingDisplay, "-", displayStatus, statusClass);
            });
          } else {
            attendanceTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No attendance data found for selected range</td></tr>`;
            alert("No attendance records found for the selected date range.");
          }
        }
      } catch (err) {
        console.error("Error filtering attendance:", err);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      let fromDate = document.getElementById("fromDateDownload")?.value;
      let toDate = document.getElementById("toDateDownload")?.value;

      function normalizeToISO(val) {
        if (!val) return "";
        val = val.trim();
        if (val.includes("/")) {
          const p = val.split("/");
          if (p.length === 3) {
            if (p[0].length === 4) return `${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`;
            if (p[2].length === 4) {
              const p0 = parseInt(p[0], 10);
              if (p0 > 12) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
              return `${p[2]}-${p[0].padStart(2,'0')}-${p[1].padStart(2,'0')}`;
            }
          }
        }
        return val;
      }

      fromDate = normalizeToISO(fromDate);
      toDate = normalizeToISO(toDate);

      if ((fromDate && !toDate) || (!fromDate && toDate)) {
        alert("Please select both 'From' and 'To' dates.");
        return;
      }

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
          const meetingMin = record.totalMeetingTime ?? 0;
          const meetingDisplay = meetingMin > 0 ? formatDuration(meetingMin * 60000) : "-";

          rows.push([dateStr, record.employee?.companyDetails?.shiftTiming || shiftTiming, checkIn, checkOut, meetingDisplay, remarksStr, status]);
        });
      } else {
        // Fallback to DOM parsing (Last 5 days) if no dates or empty dates selected
        const tableRows = document.querySelectorAll("#attendanceTable tbody tr");

        tableRows.forEach(tr => {
          const cells = tr.querySelectorAll("td");
          if (cells.length > 6 && cells[0].innerText !== "No attendance data found") {
            rows.push([
              cells[0].innerText, // Date
              cells[1].innerText, // Shift
              cells[2].innerText, // Check In
              cells[3].innerText, // Check Out
              cells[4].innerText, // Meeting
              cells[5].innerText, // Remarks
              cells[6].innerText  // Status
            ]);
          }
        });
      }

      if (rows.length === 0) {
        alert("No attendance records found for the selected period. Cannot download an empty report.");
        return;
      }

      // 🔹 Generate Table
      doc.autoTable({
        startY: 35,
        head: [["Date", "Shift", "Check In", "Check Out", "Meeting", "Remarks", "Status"]],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [35, 210, 170], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [234, 249, 240] },
        styles: { fontSize: 9, cellPadding: 3, valign: 'middle', halign: 'center' }
      });

      doc.save(`My_Attendance_Report.pdf`);
    });
  }


  // ===== INITIALIZE =====
  loadSession();
  renderCalendar(currentMonth, currentYear);
  loadUserAttendance();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUserAttendance);
} else {
  initUserAttendance();
}