async function loadNotifications() {
    try {
        const res = await fetch('/admin/notification/list');
        const notifications = await res.json();
        const container = document.getElementById('notificationContainer');
        container.innerHTML = '';

        notifications.forEach(n => {
            const card = document.createElement('div');
            card.classList.add('notification-card');
            if (!n.readStatus) {
                card.classList.add('unread');
            }
            
            let redirectUrl = '/admin/dashboard';
            
            if (n.type === 'Leave' || n.type === 'Approved Leave' || n.type === 'Rejected Leave') {
                redirectUrl = '/admin/leave';
            } else if (n.type === 'Onboarding') {
                redirectUrl = `/admin/onboarding/review/${n.referenceId}`;
            } else if (n.type === 'HourlyReport') {
                redirectUrl = `/admin/hourlyReports/${n.referenceId}`;
            } else if (n.type === 'Attendance') {
                redirectUrl = '/admin/attendance';
            }

            const viewBtn = !n.readStatus 
                ? `<button class="btn-view" onclick="markAsReadAndRedirect(${n.id}, '${redirectUrl}')">view</button>` 
                : '';
            
            if (n.type === 'Leave' || n.type === 'Approved Leave' || n.type === 'Rejected Leave') {
                const leaveStatus = n.leaveStatus ? n.leaveStatus.toLowerCase() : 'pending';
                const leaveType = n.leaveType ? n.leaveType : 'Leave';
                card.innerHTML = `
                    <div class="notification-info">
                        <i class="bi bi-calendar2-check-fill text-success" style="font-size: 1.5rem; margin-right: 15px;"></i>
                        <div class="notification-text">
                            <span><strong>${n.employeeName || 'Employee'}</strong> applied for <strong>${leaveType}</strong></span>
                            <small>${n.leaveFromDate || '-'} to ${n.leaveToDate || '-'} | Status: <span class="status ${leaveStatus}">${n.leaveStatus || 'Pending'}</span></small>
                        </div>
                    </div>
                    ${viewBtn}
                `;
            } else if (n.type === 'Onboarding') {
                card.innerHTML = `
                    <div class="notification-info">
                        <i class="bi bi-person-check-fill text-primary" style="font-size: 1.5rem; margin-right: 15px;"></i>
                        <div class="notification-text">
                            <span><strong>${n.title || 'Onboarding Submitted'}</strong></span>
                            <small>${n.message || ''}</small>
                        </div>
                    </div>
                    ${viewBtn}
                `;
            } else if (n.type === 'HourlyReport') {
                card.innerHTML = `
                    <div class="notification-info">
                        <i class="bi bi-clipboard-data-fill text-warning" style="font-size: 1.5rem; margin-right: 15px;"></i>
                        <div class="notification-text">
                            <span><strong>${n.title || 'Hourly Reports'}</strong></span>
                            <small>${n.message || ''}</small>
                        </div>
                    </div>
                    ${viewBtn}
                `;
            } else if (n.type === 'Attendance') {
                card.innerHTML = `
                    <div class="notification-info">
                        <i class="bi bi-clock-fill text-info" style="font-size: 1.5rem; margin-right: 15px;"></i>
                        <div class="notification-text">
                            <span><strong>${n.title || 'Attendance Alert'}</strong></span>
                            <small>${n.message || ''}</small>
                        </div>
                    </div>
                    ${viewBtn}
                `;
            } else {
                card.innerHTML = `
                    <div class="notification-info">
                        <i class="bi bi-info-circle-fill text-secondary" style="font-size: 1.5rem; margin-right: 15px;"></i>
                        <div class="notification-text">
                            <span><strong>${n.title || 'Notification'}</strong></span>
                            <small>${n.message || ''}</small>
                        </div>
                    </div>
                    ${viewBtn}
                `;
            }
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}

async function markAsReadAndRedirect(id, url) {
    try {
        const res = await fetch(`/admin/notification/markRead/${id}`, {
            method: 'POST',
            keepalive: true
        });
        if (!res.ok) {
            console.error("Mark read failed with status:", res.status);
        }
    } catch (e) {
        console.error("Error marking notification as read:", e);
    }
    window.location.href = url;
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