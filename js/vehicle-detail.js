let selectedCar = null;

document.addEventListener("DOMContentLoaded", () => {
  const vin = localStorage.getItem("selectedVIN");
  if (!vin) {
    document.getElementById("vehicle-detail-container")
            .innerHTML = "<p>Please select a vehicle first.</p>";
    return;
  }

  const raw = localStorage.getItem("carsData");
  if (raw) {
    const data = JSON.parse(raw);
    selectedCar = data.cars.find(c => c.vin === vin);
    renderDetailPage();
  } else {
    fetch("data/cars.json")
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("carsData", JSON.stringify(data));
        selectedCar = data.cars.find(c => c.vin === vin);
        renderDetailPage();
      });
  }
});

function renderDetailPage() {
  if (!selectedCar) {
    document.getElementById("vehicle-detail-container")
            .innerHTML = "<p>Car not found.</p>";
    return;
  }

  // 🚫 已被租出禁止访问
  if (selectedCar.available === false) {
    alert("This vehicle has already been rented. Please choose another one.");
    location.href = "all-vehicles.html"; // 或者 index.html
    return;
  }

  const html = `
    <div class="vehicle-card confirmation-card">
      <div class="vehicle-image">
        <img src="${selectedCar.image}" alt="${selectedCar.brand} ${selectedCar.carModel}">
      </div>
      <div class="vehicle-info">
        <h2>${selectedCar.brand} ${selectedCar.carModel} (${selectedCar.yearOfManufacture})</h2>
        <div class="specs-grid">
          <div class="spec-item"><span class="spec-label">Seats</span><span class="spec-value">5</span></div>
          <div class="spec-item"><span class="spec-label">Luggage</span><span class="spec-value">2</span></div>
          <div class="spec-item"><span class="spec-label">Transmission</span><span class="spec-value">${selectedCar.carType}</span></div>
          <div class="spec-item"><span class="spec-label">Fuel</span><span class="spec-value">${selectedCar.fuelType}</span></div>
        </div>
        <div class="price-tag">$${selectedCar.pricePerDay}/day</div>
      </div>
      <form id="rentalForm" class="rental-form">
        <div class="timeline-section">
          <h3>Pick up Details</h3>
          <div class="detail-row">
            <div class="detail-column">
              <label for="pickup-location">Location</label>
              <input type="text" id="pickup-location" required>
            </div>
            <div class="detail-column">
              <label for="pickup-date">Date</label>
              <input type="date" id="pickup-date" required>
            </div>
            <div class="detail-column">
              <label for="pickup-time">Time</label>
              <input type="time" id="pickup-time" required>
            </div>
          </div>
        </div>

        <div class="timeline-section">
          <h3>Drop off Details</h3>
          <div class="detail-row">
            <div class="detail-column">
              <label for="dropoff-location">Location</label>
              <input type="text" id="dropoff-location" required>
            </div>
            <div class="detail-column">
              <label for="dropoff-date">Date</label>
              <input type="date" id="dropoff-date" required>
            </div>
            <div class="detail-column">
              <label for="dropoff-time">Time</label>
              <input type="time" id="dropoff-time" required>
            </div>
          </div>
        </div>

        <button type="submit" class="book-button">Book this vehicle</button>
      </form>
    </div>
  `;

  document.getElementById("vehicle-detail-container").innerHTML = html;

  const today = new Date().toISOString().split("T")[0];
  const puDate = document.getElementById("pickup-date");
  const doDate = document.getElementById("dropoff-date");
  puDate.min = today;
  doDate.min = today;

  puDate.addEventListener("change", e => {
    doDate.min = e.target.value;
    if (doDate.value && doDate.value < e.target.value) doDate.value = "";
  });

  doDate.addEventListener("focus", () => {
    if (!puDate.value) {
      alert("Please select pick-up date first.");
      puDate.focus();
    }
  });

  document.getElementById("dropoff-time").addEventListener("focus", () => {
    if (!document.getElementById("pickup-time").value) {
      alert("Please select pick-up time first.");
      document.getElementById("pickup-time").focus();
    }
  });

  document.getElementById("rentalForm").addEventListener("submit", e => {
    e.preventDefault();

    const booking = {
      vin: selectedCar.vin,
      pickupLocation: puDate.form["pickup-location"].value.trim(),
      pickupDate: puDate.value,
      pickupTime: document.getElementById("pickup-time").value,
      dropoffLocation: doDate.form["dropoff-location"].value.trim(),
      dropoffDate: doDate.value,
      dropoffTime: document.getElementById("dropoff-time").value
    };

    sessionStorage.setItem("bookingDetails", JSON.stringify(booking));
    location.href = "reservation.html";
  });
}
