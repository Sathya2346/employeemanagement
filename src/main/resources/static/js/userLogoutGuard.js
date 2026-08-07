const initLogoutGuard = () => {
  const logoutLink = document.getElementById("logoutLink");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", async (e) => {
    // 1. Prevent default navigation SYNCHRONOUSLY before any async operations
    e.preventDefault();
    const logoutUrl = logoutLink.getAttribute("href") || "/logout";

    // 2. Determine employee ID
    let employeeId = document.getElementById("employeeId")?.value;
    if (!employeeId) {
      const match = window.location.pathname.match(/\/(\d+)$/);
      if (match) employeeId = match[1];
    }

    // 3. Check client-side localStorage session as immediate check
    let isLocallyCheckedIn = false;
    try {
      const stored = localStorage.getItem("userAttendance_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.checkInTime && !parsed.checkOutTime) {
          isLocallyCheckedIn = true;
        }
      }
    } catch (err) {
      console.warn("Could not read local attendance session:", err);
    }

    // Helper to display warning modal
    const showWarningModal = (empId) => {
      let modalEl = document.getElementById("logoutWarningModal");
      if (!modalEl) {
        modalEl = document.createElement("div");
        modalEl.id = "logoutWarningModal";
        modalEl.className = "modal fade";
        modalEl.setAttribute("tabindex", "-1");
        modalEl.setAttribute("aria-hidden", "true");
        modalEl.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content text-center p-4" style="border-radius:15px; background: #ffffff; color: #212529;">
                  <div class="modal-header border-0 justify-content-center">
                      <h5 class="modal-title fw-bold text-danger">⚠️ You haven't Checked Out yet!</h5>
                  </div>
                  <div class="modal-body">
                      <p class="text-dark">Please <strong>check out</strong> before logging out.<br>Your attendance will not be saved if you logout without checking out.</p>
                  </div>
                  <div class="modal-footer border-0 justify-content-center gap-3">
                      <button type="button" class="btn btn-primary" onclick="window.location.href='/user/userAttendance/${empId || '1'}'">Go to Attendance</button>
                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                  </div>
              </div>
          </div>`;
        document.body.appendChild(modalEl);
      }
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    };

    // If locally checked in, block logout immediately
    if (isLocallyCheckedIn) {
      showWarningModal(employeeId);
      return;
    }

    if (!employeeId) {
      window.location.href = logoutUrl;
      return;
    }

    // 4. Server-side check
    try {
      const res = await fetch(`/attendance/checkin-status/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.checkedIn) {
          showWarningModal(employeeId);
          return;
        }
      }
    } catch (err) {
      console.error("Logout guard check failed:", err);
    }

    // If not checked in, proceed to logout URL
    window.location.href = logoutUrl;
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLogoutGuard);
} else {
  initLogoutGuard();
}
