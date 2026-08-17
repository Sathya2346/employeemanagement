let idleStartTime = null;
let isIdle = false;
const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

// UI Elements (Optional)
const idleHourEl = document.getElementById("idleHour");
const statusBadge = document.getElementById("statusBadge");

let activityEvents = ["mousemove", "keydown", "click", "scroll"];

activityEvents.forEach(event => {
    window.addEventListener(event, resetIdleTimer);
});

let idleTimer = setTimeout(goIdle, IDLE_LIMIT_MS);

function resetIdleTimer() {
    if (isIdle) {
        sendIdleEnd();
        isIdle = false;
        if (statusBadge && statusBadge.textContent === "Idle") {
            statusBadge.textContent = "Working";
        }
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_LIMIT_MS);
}

function goIdle() {
    // Only go idle if they are checked in (attendance page logic)
    // For other pages, we just send the signal and server handles it
    const checkInTimeText = document.getElementById("timeIn")?.textContent;
    const checkOutTimeText = document.getElementById("timeOut")?.textContent;
    
    if (checkInTimeText && (checkInTimeText === "--:--:--" || (checkOutTimeText && checkOutTimeText !== "--:--:--"))) {
        return; // Not checked in or already checked out
    }

    isIdle = true;
    idleStartTime = new Date();
    sendIdleStart();
    if (statusBadge) statusBadge.textContent = "Idle";
}

const getISTDateTimeString = (date = new Date()) => {
    const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const pad = (n) => String(n).padStart(2, '0');
    const padMs = (n) => String(n).padStart(3, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
};

function sendIdleStart() {
    fetch("/attendance/idle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: getISTDateTimeString() })
      });
}

function sendIdleEnd() {
    fetch("/attendance/idle/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: getISTDateTimeString() })
      });
}