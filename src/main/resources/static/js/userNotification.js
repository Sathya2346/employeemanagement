// src/main/resources/static/js/userNotification.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ User Notification JS Loaded");

    // Notifications are already marked as read by the backend when the page loads.
    // We can add client-side dynamic behavior here if needed in the future.

    const cards = document.querySelectorAll('.notification-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.remove('border-primary'); // Remove "unread" style
            card.classList.add('border-secondary'); // Add "read" style
        });
    });

    // Sidebar Toggle Logic (If not already in HTML script block)
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('active'); // CSS class for showing sidebar
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
});
