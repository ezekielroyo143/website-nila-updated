const reservationsList = document.getElementById("reservationsList");
const message = document.getElementById("message");

function peso(value) {
  return (
    "₱" +
    Number(value).toLocaleString("en-PH", {
      maximumFractionDigits: 0,
    })
  );
}

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusClass(status) {
  if (status === "cancelled") {
    return "status-cancelled";
  }

  if (status === "confirmed") {
    return "status-confirmed";
  }

  return "status-pending";
}

async function loadReservations() {
  message.className = "";
  message.textContent = "";

  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    message.className = "message error";
    message.textContent = "Please log in to view your reservations.";

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1200);

    return;
  }

  const { data, error } = await supabaseClient
    .from("reservations")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  console.log("USER:", userData.user);
  console.log("RESERVATIONS:", data);
  console.log("ERROR:", error);

  if (error) {
    message.className = "message error";
    message.textContent = error.message;
    return;
  }

  if (!data || data.length === 0) {
    reservationsList.innerHTML = `
      <div class="form-card">
        <h2>No Reservations Yet</h2>
        <p>You haven't made a reservation yet.</p>
        <a href="./rooms.html" class="btn btn-primary">Browse Rooms</a>
      </div>
    `;

    return;
  }

  reservationsList.innerHTML = data
    .map((reservation) => {
      const status = reservation.status || "pending";
      const total = reservation.total_price || reservation.total || 0;

      return `
      <div class="form-card reservation-card" style="max-width: none; margin-bottom: 20px;">
        <div class="reservation-header">
          <div>
            <p class="eyebrow">RESERVATION #${reservation.id}</p>
            <h2>Booking Details</h2>
          </div>

          <span class="${getStatusClass(status)}">
            ${status}
          </span>
        </div>

        <div class="summary-row">
          <span>Check-in</span>
          <strong>${formatDate(reservation.check_in)}</strong>
        </div>

        <div class="summary-row">
          <span>Check-out</span>
          <strong>${formatDate(reservation.check_out)}</strong>
        </div>

        <div class="summary-row">
          <span>Guests</span>
          <strong>${reservation.guests || 0}</strong>
        </div>

        <div class="summary-row">
          <span>Adults</span>
          <strong>${reservation.adults || 0}</strong>
        </div>

        <div class="summary-row">
          <span>Children</span>
          <strong>${reservation.children || 0}</strong>
        </div>

        <div class="summary-row">
          <span>Special Requests</span>
          <strong>${reservation.special_requests || "None"}</strong>
        </div>

        <div class="summary-total">
          ${peso(total)}
        </div>

        <div style="margin-top: 20px;">
          ${
            status === "cancelled"
              ? `<button class="btn" disabled>Reservation Cancelled</button>`
              : `<button class="btn cancel-btn" data-id="${reservation.id}">
                  Cancel Reservation
                </button>`
          }
        </div>
      </div>
    `;
    })
    .join("");

  document.querySelectorAll(".cancel-btn").forEach((button) => {
    button.addEventListener("click", () => {
      cancelReservation(button.dataset.id);
    });
  });
}

async function cancelReservation(id) {
  const confirmed = confirm(
    "Are you sure you want to cancel this reservation?",
  );

  if (!confirmed) {
    return;
  }

  message.className = "";
  message.textContent = "Cancelling reservation...";

  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !userData.user) {
    window.location.href = "./login.html";
    return;
  }

  const { error } = await supabaseClient
    .from("reservations")
    .update({
      status: "cancelled",
    })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    message.className = "message error";
    message.textContent = error.message;
    return;
  }

  message.className = "message success";
  message.textContent = "Reservation cancelled successfully.";

  await loadReservations();
}

loadReservations();
