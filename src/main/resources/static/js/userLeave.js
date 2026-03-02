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

    // Helper: Clear validation
    const clearValidation = () => {
        leaveForm.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
        leaveForm.querySelectorAll(".invalid-feedback").forEach(el => {
            if (!el.id.includes("Error")) el.style.display = "none"; // Hide generic ones
        });
    };

    // Open/Close modal
    applyBtn.addEventListener('click', () => {
        clearValidation();
        modal.classList.add('show');
        const modalEmpId = document.getElementById('modalEmpId');
        const modalEmpName = document.getElementById('modalEmpName');
        if (modalEmpId) modalEmpId.value = empId;
        if (modalEmpName) modalEmpName.value = empName;
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        leaveForm.reset();
    });

    window.addEventListener('click', (e) => { 
        if (e.target === modal) {
            modal.classList.remove('show');
            leaveForm.reset();
        }
    });

    // Handle Leave Form Submission
    leaveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearValidation();

        const leaveType = document.getElementById('leaveType').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const reason = document.getElementById('reason').value.trim();

        // Client-side quick check
        let hasError = false;
        if (!leaveType) { document.getElementById('leaveType').classList.add('is-invalid'); hasError = true; }
        if (!fromDate) { document.getElementById('fromDate').classList.add('is-invalid'); hasError = true; }
        if (!toDate) { document.getElementById('toDate').classList.add('is-invalid'); hasError = true; }
        if (!reason) { document.getElementById('reason').classList.add('is-invalid'); hasError = true; }

        if (hasError) return;

        const days = Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 3600 * 24)) + 1;
        if (days <= 0) {
            const toDateEl = document.getElementById('toDate');
            toDateEl.classList.add('is-invalid');
            document.getElementById('toDateError').textContent = "❌ To Date cannot be before From Date.";
            return;
        }

        try {
            const response = await fetch("/leave/applyLeave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leaveType,
                    leaveFromDate: fromDate,
                    leaveToDate: toDate,
                    reason
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle Field Specific Errors from Backend
                if (result.field) {
                    const fieldEl = document.getElementById(result.field);
                    if (fieldEl) {
                        fieldEl.classList.add('is-invalid');
                        const errorEl = document.getElementById(result.field + 'Error');
                        if (errorEl) errorEl.textContent = result.message;
                    }
                } else {
                    alert(result.message || "❌ Failed to apply leave!");
                }
                return;
            }

            // Success
            const savedLeave = result;
            const tableBody = document.querySelector('table tbody');
            
            // Remove "No records" message if exists
            if (tableBody.querySelector('.text-danger')) tableBody.innerHTML = "";

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
            tableBody.prepend(newRow); // New leaves at top

            alert(result.message || "✅ Leave applied successfully!");
            modal.classList.remove('show');
            leaveForm.reset();

        } catch (error) {
            console.error("❌ Error:", error);
            alert("❌ System error occurred while applying leave.");
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

    // 🌟 Download PDF (Client-side)
    const downloadBtn = document.getElementById("downloadLeaveBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // 🔹 Title
            doc.setFontSize(18);
            doc.setTextColor(35, 210, 170); // Teal
            doc.text("My Leave Report", 105, 15, { align: "center" });

            // 🔹 Employee Info
            doc.setFontSize(11);
            doc.setTextColor(100);
            const empName = document.getElementById('username')?.value || "Employee";
            doc.text(`Employee: ${empName}`, 105, 22, { align: "center" });
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 27, { align: "center" });

            // 🔹 Table Data
            const rows = [];
            document.querySelectorAll("table tbody tr").forEach(tr => {
                const cells = tr.querySelectorAll("td");
                if (cells.length > 0) {
                    rows.push([
                        cells[1].innerText, // Leave Type
                        cells[2].innerText, // From
                        cells[3].innerText, // To
                        cells[4].innerText, // Days
                        cells[6].innerText.trim() // Status
                    ]);
                }
            });

            // 🔹 Generate Table
            doc.autoTable({
                startY: 35,
                head: [["Leave Type", "From", "To", "Days", "Status"]],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [35, 210, 170], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [234, 249, 240] },
                styles: { fontSize: 10, cellPadding: 3, valign: 'middle', halign: 'center' }
            });

            doc.save(`My_Leave_Report.pdf`);
        });
    }
});
