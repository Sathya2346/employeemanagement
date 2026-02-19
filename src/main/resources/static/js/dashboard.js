const ctx = document.getElementById('workingTimesChart').getContext('2d');

fetch('/admin/api/attendanceSummary')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Received data:', data);
        const attendanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.days, // Already ordered Sunday → Saturday
                datasets: [
                    {
                        label: 'Present',
                        data: data.present,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)'
                    },
                    {
                        label: 'Absent',
                        data: data.absent,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true, position: 'bottom' },
                    title: { display: true, text: 'Weekly Attendance Summary' }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'No. of Employees' }
                    },
                    x: {
                        title: { display: true, text: 'Days (Sun → Sat)' }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('❌ Error loading attendance data:', error);
    });
// Sample data for Employee Structure chart
// ✅ Get dynamic values from HTML
const dataDiv = document.getElementById("employeeData");
const maleCount = parseInt(dataDiv.dataset.male || "0");
const femaleCount = parseInt(dataDiv.dataset.female || "0");
const ctx2 = document.getElementById('employeeStructureChart').getContext('2d');
new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [maleCount, femaleCount],
            backgroundColor: ['#e74c3c', '#2ecc71']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Employee Structure' }
        }
    }
});
function currentDate(){
    const today = new Date();

    // Formatting options
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };

    // Format date and insert into HTML
    document.getElementById("currentDate").textContent =
      today.toLocaleDateString('en-GB', options);
}
currentDate();

function displayGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "";

    if (hours >= 5 && hours < 12) {
        greeting = "Good Morning!!!";
    } else if (hours >= 12 && hours < 17) {
        greeting = "Good Afternoon!!!";
    } else if (hours >= 17 && hours < 21) {
        greeting = "Good Evening!!!";
    } else {
        greeting = "Good Night!!!";
    }

    document.getElementById("greetingMessage").textContent = greeting;
}
displayGreeting();