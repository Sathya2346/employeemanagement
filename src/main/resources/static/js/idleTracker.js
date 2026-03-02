let idleStartTime = null;
let isIdle = false;

let activityEvents = ["mousemove", "keydown", "click"];

activityEvents.forEach(event => {
    window.addEventListener(event, resetIdleTimer);
});

let idleTimer = setTimeout(goIdle, 5 * 60 * 1000); // 5 minutes

function resetIdleTimer() {
    if (isIdle) {
        sendIdleEnd();
    }
    isIdle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, 5 * 60 * 1000);
}

function goIdle() {
    isIdle = true;
    idleStartTime = new Date();
    sendIdleStart();
}

function sendIdleStart() {
    fetch("/attendance/idle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: new Date() })
    });
}

function sendIdleEnd() {
    fetch("/attendance/idle/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: new Date() })
    });
}