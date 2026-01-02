document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ userLeave.js loaded successfully");

    const applyBtn = document.getElementById('applyBtn');
    const modal = document.getElementById('leaveModal');
    const closeBtn = document.querySelector('.close-btn');
    const leaveForm = document.getElementById('leaveForm');

    if (!applyBtn || !modal || !closeBtn || !leaveForm) {
        console.error("❌ Modal elements not found in DOM!");
        return;
    }

    const empIdField = document.getElementById('employeeId');
    const empNameField = document.getElementById('username');

    if (!empIdField || !empNameField) {
        console.error("❌ Employee ID or username field not found!");
        return;
    }

    const empId = empIdField.value.trim();
    const empName = empNameField.value.trim();

    // Open/Close modal
    applyBtn.addEventListener('click', () => {
        modal.classList.add('show');
        const modalEmpId = document.getElementById('empId');
        const modalEmpName = document.getElementById('empName');
        if (modalEmpId) modalEmpId.value = empId;
        if (modalEmpName) modalEmpName.value = empName;
    });

    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

    // Handle Leave Form Submission
    leaveForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const leaveType = document.getElementById('leaveType').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const reason = document.getElementById('reason')?.value || "";

        if (!leaveType || !fromDate || !toDate) {
            return alert("⚠️ Fill all fields!");
        }

        const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 3600 * 24)) + 1;
        if (days <= 0) return alert("⚠️ Invalid date range!");

        try {
            const response = await fetch("/leave/applyLeave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee: { id: empId },
                    leaveType,
                    leaveFromDate: fromDate,
                    leaveToDate: toDate,
                    reason
                })
            });

            if (!response.ok) throw new Error("Failed to apply leave!");
            const savedLeave = await response.json();

            const tableBody = document.querySelector('table tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${savedLeave.employeeName}</td>
                <td>${savedLeave.leaveType}</td>
                <td>${savedLeave.leaveFromDate}</td>
                <td>${savedLeave.leaveToDate}</td>
                <td>${savedLeave.leaveDays}</td>
                <td>${savedLeave.leaveApprovedBy || " "}</td>
                <td><span class="status pending">${savedLeave.leaveStatus}</span></td>
            `;
            tableBody.appendChild(newRow);

            alert("✅ Leave applied successfully! Pending approval.");
            modal.classList.remove('show');
            leaveForm.reset();

        } catch (error) {
            console.error("❌ Error:", error);
            alert("❌ Failed to apply leave");
        }
    });

    async function updateBalances(empId) {
        try {
            const balanceRes = await fetch(`/leave/balance/${empId}`);
            if (!balanceRes.ok) throw new Error("Failed to fetch updated balances!");
            const empData = await balanceRes.json();

            document.querySelector('#totalLeaves').textContent = empData.totalLeaves;
            document.querySelector('#paidLeaveBalance').textContent = empData.paidLeaveBalance;
            document.querySelector('#sickLeaveBalance').textContent = empData.sickLeaveBalance;
            document.querySelector('#casualLeaveBalance').textContent = empData.casualLeaveBalance;
        } catch (err) {
            console.error("❌ Error updating balances:", err);
        }
    }

    // Listen for leave approval/rejection events
    document.addEventListener("leaveUpdated", async (e) => {
        const leave = e.detail; // { employeeId, leaveId, leaveStatus, leaveType, leaveFromDate }
        const rows = document.querySelectorAll("table tbody tr");

        rows.forEach(row => {
            if (row.cells[2].textContent === leave.leaveFromDate) {
            // ✅ Update leave status
            const statusCell = row.cells[6];
            statusCell.innerHTML =
                leave.leaveStatus === "Approved"
                    ? `<span class="status approved">${leave.leaveStatus}</span>`
                    : `<span class="status rejectedleave">${leave.leaveStatus}</span>`;

            // ✅ Update "Approved By" column
            const approvedByCell = row.cells[5];
            approvedByCell.textContent = leave.leaveApprovedBy || "-";
        }
        });

        // Update leave balances only if approved
        await updateBalances(empId);
    });

    // Download Leave Report
    const downloadBtn = document.getElementById('downloadLeaveBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const fromDate = document.getElementById('fromDateDownload').value;
            const toDate = document.getElementById('toDateDownload').value;

            if (!fromDate || !toDate) return alert("⚠️ Select date range!");

            try {
                const response = await fetch(`/leave/download/pdf?empId=${empId}&from=${fromDate}&to=${toDate}`);
                if (!response.ok) throw new Error("Failed to download report!");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Leave_Report_${empName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                console.error("❌ Download error:", err);
                alert("❌ Failed to download leave report");
            }
        });
    }
});
