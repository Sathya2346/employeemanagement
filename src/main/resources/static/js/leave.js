// /static/js/leave.js
document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ leave.js loaded successfully");

    await loadLeaveSummary();
    await loadAllLeaves(); // 🔹 Show all leaves by default

    // 🔹 Search / Filter form
    const filterForm = document.querySelector(".search-box");
    if (filterForm) {
        filterForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            await filterLeaves();
        });
    }

    // 🔹 Filter button
    const filterBtn = document.getElementById("filterBtn");
    if (filterBtn) {
        filterBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            await filterLeaves();
        });
    }

    // 🔹 Auto filter when filters change
    const statusSelect = document.getElementById("statusFilter");
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");
    const nameInput = document.getElementById("name");

    const today = new Date().toISOString().split("T")[0];
    fromDate.setAttribute("max", today);

    // 🔹 Prevent typing future dates manually
    fromDate.addEventListener("input", () => {
        if (fromDate.value > today) fromDate.value = today;
    });


    // ✅ Enhanced Select Filter
    if (statusSelect) {
        let selectDebounce;
        statusSelect.addEventListener("change", () => {
            clearTimeout(selectDebounce);
            selectDebounce = setTimeout(filterLeaves, 200);
        });
    }

    if (fromDate) fromDate.addEventListener("change", filterLeaves);
    if (toDate) toDate.addEventListener("change", filterLeaves);

    if (nameInput) {
        let debounceTimer;
        nameInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterLeaves, 400); // Live search debounce
        });
    }

    // ✅ Enhanced PDF Report (clean version)
    const pdfBtn = document.getElementById("downloadPdfBtn");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", async () => {
            const from = document.getElementById("fromDate")?.value;
            const to = document.getElementById("toDate")?.value;
            const name = document.getElementById("name")?.value.trim();
            const status = document.getElementById("statusFilter")?.value;

            const today = new Date().toISOString().split("T")[0];

            if (from > today) {
                alert("⚠️ Future dates are not allowed!");
                return;
            }

            if (!from || !to) {
                alert("⚠️ Please select From and To dates first.");
                return;
            }

            try {
                const params = new URLSearchParams();
                params.append("from", from);
                params.append("to", to);
                if (name) params.append("name", name);
                if (status && status !== "") params.append("status", status);

                const res = await fetch(`/admin/leave/filter?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch leave data");

                const data = await res.json();
                if (!data || data.length === 0) {
                    alert("⚠️ No leave records found for the selected filters.");
                    return;
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF("p", "mm", "a4");

                // ✅ Header (Matched to Attendance PDF)
                doc.setFontSize(18);
                doc.setTextColor(35, 210, 170); // Teal Title
                doc.text("Leave Report", 105, 15, { align: "center" });

                // ✅ Report Info
                doc.setFontSize(11);
                doc.setTextColor(100); // Gray

                const empText = name ? `Employee: ${name}` : "Employee: All";
                doc.text(empText, 105, 22, { align: "center" });
                doc.text(`From: ${from}   To: ${to}`, 105, 27, { align: "center" });

                // ✅ PDF Data: Use Full Name
                const tableData = data.map(leave => [
                    (leave.employee && leave.employee.firstname && leave.employee.lastname)
                        ? `${leave.employee.firstname} ${leave.employee.lastname}`
                        : (leave.employeeName || "-"),
                    leave.leaveType || "-",
                    leave.leaveFromDate || "-",
                    leave.leaveToDate || "-",
                    leave.leaveDays ?? "0",
                    leave.leaveApprovedBy || "-",
                    leave.leaveStatus || "Pending"
                ]);

                // ✅ Styled Table
                doc.autoTable({
                    startY: 35,
                    head: [["Employee", "Type", "From", "To", "Days", "Approved By", "Status"]],
                    body: tableData,
                    styles: {
                        font: "helvetica",
                        fontSize: 10,
                        cellPadding: 4,
                        halign: "center",
                        valign: "middle",
                    },
                    headStyles: {
                        fillColor: [35, 210, 170], // Teal Header
                        textColor: 255,
                        fontStyle: "bold",
                        halign: "center",
                    },
                    alternateRowStyles: { fillColor: [234, 249, 240] }, // Mild Mint Row
                    columnStyles: {
                        0: { halign: "left" },
                        5: { halign: "left" },
                    },
                });

                // ✅ Footer
                const finalY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(10);
                doc.text("Note: This report is system-generated and does not require a signature.", 20, finalY);

                // ✅ Page Numbers
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.text(`Page ${i} of ${pageCount}`, 190, 290, { align: "right" });
                }

                // ✅ Save file
                const safeName = name ? name.replace(/\s+/g, "_") : "All";
                doc.save(`Leave_Report_${safeName}_${from}_to_${to}.pdf`);
            } catch (err) {
                console.error("❌ Error generating Leave PDF:", err);
                alert("Failed to generate Leave PDF. Please try again.");
            }
        });
    }
});

// 🔹 Load Summary Cards
async function loadLeaveSummary() {
    try {
        const res = await fetch("/admin/leave/summary");
        if (!res.ok) throw new Error("Failed to fetch summary");

        const data = await res.json();

        document.getElementById("totalLeaves").innerText = data.total || 0;
        document.getElementById("paidLeaves").innerText = data.approved || 0;
        document.getElementById("sickLeaves").innerText = data.pending || 0;
        document.getElementById("casualLeaves").innerText = data.rejected || 0;
    } catch (err) {
        console.error("❌ Error fetching summary:", err);
    }
}

// 🔹 Load All Leaves Initially
async function loadAllLeaves() {
    try {
        const res = await fetch("/leave/all");
        if (!res.ok) throw new Error("Failed to load leaves");

        const data = await res.json();
        populateLeaveTable(data);
    } catch (err) {
        console.error("❌ Error loading leave data:", err);
        // Show fallback message
        const tbody = document.getElementById("leaveTableBody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Failed to load leave data</td></tr>`;
        }
    }
}

// 🔹 Filter by Name / Date / Status
async function filterLeaves() {
    const name = document.getElementById("name")?.value.trim();
    const status = document.getElementById("statusFilter")?.value;
    const from = document.getElementById("fromDate")?.value;
    const to = document.getElementById("toDate")?.value;

    const today = new Date().toISOString().split("T")[0];

    if (from > today) {
        alert("⚠️ Future dates are not allowed!");
        return;
    }

    if (!name && !status && !from && !to) {
        await loadAllLeaves();
        return;
    }

    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (status && status !== "") params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    try {
        const res = await fetch(`/leave/filter?${params.toString()}`);
        if (!res.ok) throw new Error("Filter request failed");

        const data = await res.json();
        populateLeaveTable(data);
    } catch (err) {
        console.error("❌ Error filtering leaves:", err);
        const tbody = document.getElementById("leaveTableBody");
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Failed to filter leave data</td></tr>`;
        }
    }
}

// 🔹 Populate Table with Data
function populateLeaveTable(data) {
    const tbody = document.getElementById("leaveTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No records found</td></tr>`;
        return;
    }

    data.forEach((leave) => {
        const fullName = (leave.employee && leave.employee.firstname && leave.employee.lastname)
            ? `${leave.employee.firstname} ${leave.employee.lastname}`
            : (leave.employeeName || "-");

        const status = leave.leaveStatus || "Pending";
        const statusClass = status.toLowerCase();

        tbody.innerHTML += `
            <tr>
                <td>${fullName}</td>
                <td>${leave.leaveType || "-"}</td>
                <td>${leave.leaveFromDate || "-"}</td>
                <td>${leave.leaveToDate || "-"}</td>
                <td>${leave.leaveDays ?? 0}</td>
                <td>${leave.leaveApprovedBy || "Manager"}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
                <td class="action-icons">
                    ${status === "Pending"
                ? `
                            <i class="bi bi-check-circle text-success approve-btn" data-id="${leave.id}" title="Approve"></i>
                            <i class="bi bi-x-circle text-danger reject-btn" data-id="${leave.id}" title="Reject"></i>
                          `
                : ""
            }
                    <i class="bi bi-trash3 text-muted delete-btn" data-id="${leave.id}" title="Delete"></i>
                </td>
            </tr>
        `;
    });

    attachActionHandlers();
}

// 🔹 Attach Action Handlers (Approve / Reject / Delete)
function attachActionHandlers() {
    document.querySelectorAll(".approve-btn").forEach((btn) => {
        btn.addEventListener("click", () => updateLeaveStatus(btn.dataset.id, "Approved"));
    });

    document.querySelectorAll(".reject-btn").forEach((btn) => {
        btn.addEventListener("click", () => updateLeaveStatus(btn.dataset.id, "Rejected"));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => deleteLeave(btn.dataset.id));
    });
}

// 🔹 Approve or Reject Leave
function updateLeaveStatus(id, status) {
    if (!confirm(`Are you sure you want to mark this leave as ${status}?`)) return;

    fetch(`/admin/leave/update-status/${id}?status=${encodeURIComponent(status)}`, {
        method: "POST",
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        })
        .then((data) => {
            alert(`✅ ${data.message}`);
            loadAllLeaves(); // reload table
            // 🔹 Notify other parts of the app that a leave was updated
            const leaveUpdatedEvent = new CustomEvent("leaveUpdated", {
                detail: {
                    employeeId: data.employeeId,
                    leaveId: data.leaveId,
                    leaveStatus: data.leaveStatus,
                    leaveApprovedBy: data.leaveApprovedBy,
                    leaveFromDate: data.leaveFromDate,
                },
            });
            document.dispatchEvent(leaveUpdatedEvent);
        })
        .catch((err) => {
            console.error(err);
            alert("❌ Failed to update leave status.");
        });
}

// 🔹 Delete Leave Record
function deleteLeave(id) {
    if (!confirm("Are you sure you want to delete this leave record?")) return;

    fetch(`/admin/leave/delete/${id}`, {
        method: "DELETE",
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to delete");
            return res.json();
        })
        .then(() => loadAllLeaves())
        .catch(() => alert("❌ Failed to delete leave."));
}