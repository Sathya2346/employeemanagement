document.addEventListener("DOMContentLoaded", () => {
    const filterBtn = document.getElementById("filterBtn");
    const empEl = document.getElementById("employeeInfo");
    const tableBody = document.querySelector("#reportTable tbody");

    if (!filterBtn || !empEl) return;

    // Read employee ID
    const employeeId = empEl.dataset.id;

    filterBtn.addEventListener("click", async () => {
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        // Construct Query Params
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        try {
            const response = await fetch(`/admin/hourlyReports/filter/${employeeId}?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }

            const reports = await response.json();
            updateTable(reports);

        } catch (error) {
            console.error("Error fetching reports:", error);
            alert("Failed to filter reports. See console for details.");
        }
    });

    function updateTable(reports) {
        tableBody.innerHTML = ""; // Clear existing rows

        if (reports.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">No reports found</td>
                </tr>
            `;
            return;
        }

        reports.forEach(report => {
            const row = document.createElement("tr");

            // Format Date (Handle LocalDateTime string array or ISO string)
            let dateStr = report.createdAt;
            // Should match the server's @JsonFormat if returned as string, or handle default serialization
            // Since we saw @JsonFormat in model, it likely returns a string like "2025-11-03 02:00:00 PM"
            // But let's check if it needs parsing. For now, display as is or simple slice.

            row.innerHTML = `
                <td>${report.timeSlot || '-'}</td>
                <td>${report.taskDescription || '-'}</td>
                <td>${report.status || '-'}</td>
                <td>${dateStr}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update Download Button State & Logic
        const downloadBtn = document.getElementById("downloadPdfBtn");
        if (downloadBtn) {
            downloadBtn.disabled = reports.length === 0;

            // Remove old listener if any (cleanest way is to clone node or just single-use)
            // But here we are inside updateTable which is called on filter.
            // Better to attach a SINGLE listener outside?
            // Let's overwrite the onclick for simplicity in this script, or handle it via a global variable.

            // 🌟 CLIENT-SIDE PDF GENERATION
            downloadBtn.onclick = () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');

                // 🔹 Title
                doc.setFont("helvetica", "bold");
                doc.setFontSize(18);
                doc.setTextColor(35, 210, 170); // Teal
                doc.text("Hourly Work Report", 105, 15, { align: "center" });

                doc.setTextColor(100);
                doc.setFontSize(11);
                const empName = document.getElementById("employeeInfo").dataset.name || "Employee";
                doc.text(`Employee: ${empName}`, 105, 22, { align: "center" });

                // 🔹 Table
                doc.autoTable({
                    startY: 30,
                    head: [["Time Slot", "Task Description", "Status", "Date"]],
                    body: reports.map(r => [
                        r.timeSlot || "-",
                        r.taskDescription || "-",
                        r.status || "-",
                        r.createdAt || "-"
                    ]),
                    styles: {
                        font: "helvetica",
                        fontSize: 10,
                        cellPadding: 3,
                        valign: 'middle',
                        halign: 'center'
                    },
                    headStyles: {
                        fillColor: [35, 210, 170], // Teal
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [234, 249, 240] // Mint
                    },
                    columnStyles: {
                        1: { cellWidth: 80 } // Wider Task Description
                    }
                });

                doc.save(`Hourly_Report_${empName}.pdf`);
            };
        }
    }
});
