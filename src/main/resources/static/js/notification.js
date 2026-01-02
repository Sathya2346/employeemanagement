async function loadNotifications() {
    try {
        const res = await fetch('/notification/list');
        const notifications = await res.json();
        const container = document.getElementById('notificationContainer');
        container.innerHTML = '';

        notifications.forEach(n => {
            const leaveStatus = n.leaveStatus ? n.leaveStatus.toLowerCase() : 'pending';
            const leaveType = n.leaveType ? n.leaveType : 'Leave';
            const card = document.createElement('div');
            card.classList.add('notification-card');
            card.innerHTML = `
                <div class="notification-info">
                    <i class="bi bi-bell-fill"></i>
                    <div class="notification-text">
                        <span><strong>${n.employeeName || 'Employee'}</strong> applied for <strong>${leaveType}</strong></span>
                        <small>${n.leaveFromDate || '-'} to ${n.leaveToDate || '-'} | Status: <span class="status ${leaveStatus}">${n.leaveStatus || 'Pending'}</span></small>
                    </div>
                </div>
                <button class="btn-view"onclick="window.location.href='/admin/leave'">view</button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}


document.addEventListener('DOMContentLoaded', loadNotifications);

function displayGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "";
    if (hours >= 5 && hours < 12) greeting = "Good Morning!!!";
    else if (hours >= 12 && hours < 17) greeting = "Good Afternoon!!!";
    else if (hours >= 17 && hours < 21) greeting = "Good Evening!!!";
    else greeting = "Good Night!!!";

    document.getElementById("greetingMessage").textContent = greeting;
}
displayGreeting();

function currentDate() {
    const today = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    document.getElementById("currentDate").textContent = today.toLocaleDateString('en-GB', options);
}
currentDate();