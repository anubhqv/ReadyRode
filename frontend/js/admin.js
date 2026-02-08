
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    alert("Access Denied: Admins Only!");
    window.location.href = 'login.html';
}

async function loadFleet() {
    try {
        const res = await fetch('http://localhost:5000/api/cars');
        const cars = await res.json();
        document.getElementById('fleetTable').innerHTML = cars.map(car => `
                    <tr>
                        <td><strong>${car.make}</strong> ${car.model}</td>
                        <td>$${car.pricePerDay}</td>
                        <td><button class="remove-btn" onclick="deleteCar('${car._id}')">Remove</button></td>
                    </tr>
                `).join('');
    } catch (err) { console.error(err); }
}

async function loadAllBookings() {
    try {
        const res = await fetch('http://localhost:5000/api/bookings/admin/all', {
            headers: { 'x-auth-token': token }
        });

        const bookings = await res.json();
        const tableBody = document.getElementById('allBookingsTable');

        if (!bookings || bookings.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No bookings found.</td></tr>';
            return;
        }

        tableBody.innerHTML = bookings.map(b => {
            const userName = b.user ? `${b.user.firstName} ${b.user.lastName}` : '<span style="color:red">Deleted User</span>';
            const carName = b.car ? `${b.car.make} ${b.car.model}` : '<span style="color:red">Car Removed</span>';
            const revenue = b.totalPrice ? `$${b.totalPrice}` : '$0';
            const startDate = b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A';
            const endDate = b.endDate ? new Date(b.endDate).toLocaleDateString() : 'N/A';

            return `
                    <tr>
                        <td>${userName}</td>
                        <td>${carName}</td>
                        <td>${startDate} - ${endDate}</td>
                        <td><strong>${revenue}</strong></td>
                    </tr>`;
        }).join('');
    } catch (err) {
        console.error("Error loading bookings:", err);
        document.getElementById('allBookingsTable').innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Failed to load.</td></tr>';
    }
}

document.getElementById('addCarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('http://localhost:5000/api/cars/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Car added!");
        e.target.reset();
        loadFleet();
    }
});

async function deleteCar(id) {
    if (confirm("Are you sure?")) {
        await fetch(`http://localhost:5000/api/cars/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        loadFleet();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

loadFleet();
loadAllBookings();