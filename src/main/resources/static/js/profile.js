function sideNav() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('active-sidebar');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active-sidebar');
    });
}
sideNav();
function popup() {
    // ===== Filter Popup Script =====
    const filterBtn = document.querySelector('.filter-btn');
    const filterPopup = document.getElementById('filterPopup');
    const closePopup = document.querySelector('.close-popup');

    filterBtn.addEventListener('click', () => {
        filterPopup.style.display = 'flex';
    });

    closePopup.addEventListener('click', () => {
        filterPopup.style.display = 'none';
    });

    // Close popup if clicked outside content
    window.addEventListener('click', (e) => {
        if (e.target === filterPopup) {
            filterPopup.style.display = 'none';
        }
    });
}
popup();

// ===== Employee Filter Logic =====
const filterForm = document.getElementById('filterForm');
const noEmployeeMsg = document.getElementById('noEmployeeMsg');

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = document.getElementById('filterName').value.toLowerCase().trim();
    const idVal = document.getElementById('filterId').value.trim();


    const employeeCards = document.querySelectorAll('.emp-card');
    let anyVisible = false; // Track if any card matches

    employeeCards.forEach(card => {
        const empName = card.querySelector('h6').innerText.toLowerCase().trim();
        const empId = card.querySelector('.view-btn a').getAttribute('href').split('/').pop().trim();

        const matchesName = !nameVal || empName.includes(nameVal);
        const matchesId = !idVal || empId === idVal;

        if (matchesName && matchesId) {
            card.style.display = 'block';
            anyVisible = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Show or hide "Employee Not Found"
    noEmployeeMsg.style.display = anyVisible ? 'none' : 'block';

    filterPopup.style.display = 'none'; // close popup after applying
});

// ===== Search Functionality (Responsive) =====
const searchForm = document.querySelector('.search-box');
const searchInput = searchForm.querySelector('input[type="search"]');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchVal = searchInput.value.toLowerCase().trim();
    const employeeCols = document.querySelectorAll('.row.g-4 > .col-md-6, .row.g-4 > .col-lg-4');
    let anyVisible = false;

    employeeCols.forEach(col => {
        const card = col.querySelector('.emp-card');
        const empName = card.querySelector('h6').innerText.toLowerCase().trim();
        const empId = card.querySelector('.view-btn a').getAttribute('href').split('/').pop().trim();

        const matchesName = empName.includes(searchVal);
        const matchesId = empId.includes(searchVal);

        if (searchVal === '' || matchesName || matchesId) {
            col.style.display = ''; // Reset display, keeps responsive grid intact
            anyVisible = true;
        } else {
            col.style.display = 'none';
        }
    });

    // Show "Employee Not Found" if no match
    noEmployeeMsg.style.display = anyVisible ? 'none' : 'block';
});