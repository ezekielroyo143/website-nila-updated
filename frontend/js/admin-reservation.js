import { supabase } from "./supabase.js";

const reservationsTable = document.getElementById("reservationsTable");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const refreshBtn = document.getElementById("refreshBtn");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const confirmedCount = document.getElementById("confirmedCount");
const cancelledCount = document.getElementById("cancelledCount");

const logoutBtn = document.getElementById("logoutBtn");

const detailsOverlay = document.getElementById("detailsOverlay");
const closeModal = document.getElementById("closeModal");

const modalGuest = document.getElementById("modalGuest");
const modalRoom = document.getElementById("modalRoom");
const modalCheckIn = document.getElementById("modalCheckIn");
const modalCheckOut = document.getElementById("modalCheckOut");
const modalId = document.getElementById("modalId");
const modalCreated = document.getElementById("modalCreated");
const modalStatus = document.getElementById("modalStatus");

const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");

const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");
const closeNotifications = document.getElementById("closeNotifications");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.querySelector(".sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");

let allReservations = [];
let selectedReservation = null;

//Check if the user is logged in, if not redirect to login page//
async function checkLogin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "/frontend/login.html";
    return false;
  }

  return true;
}

//get the reservations from the database and display them in the table//
async function loadReservations() {
  reservationsTable.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                Loading reservations...
            </td>
        </tr>
    `;

  emptyState.classList.remove("show");

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading reservations:", error);

    reservationsTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Unable to load reservations.
                </td>
            </tr>
        `;

    return;
  }

  allReservations = data || [];

  updateCounts();
  displayReservations();
}

function updateCounts() {
  totalCount.textContent = allReservations.length;

  pendingCount.textContent = allReservations.filter(
    (reservation) => getStatus(reservation) === "pending",
  ).length;

  confirmedCount.textContent = allReservations.filter(
    (reservation) => getStatus(reservation) === "confirmed",
  ).length;

  cancelledCount.textContent = allReservations.filter(
    (reservation) => getStatus(reservation) === "cancelled",
  ).length;
}

function displayReservations() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value.toLowerCase();

  const filtered = allReservations.filter((reservation) => {
    const guest = getGuestName(reservation).toLowerCase();
    const room = getRoom(reservation).toLowerCase();
    const id = String(reservation.id || "").toLowerCase();
    const status = getStatus(reservation);

    const matchesSearch =
      guest.includes(searchValue) ||
      room.includes(searchValue) ||
      id.includes(searchValue);

    const matchesStatus = selectedStatus === "all" || status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  reservationsTable.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  filtered.forEach((reservation) => {
    const row = document.createElement("tr");

    const guest = getGuestName(reservation);
    const room = getRoom(reservation);
    const checkIn = getCheckIn(reservation);
    const checkOut = getCheckOut(reservation);
    const status = getStatus(reservation);
    const created = reservation.created_at;

    row.innerHTML = `
            <td>
                <strong>${escapeHTML(guest)}</strong>
            </td>

            <td>
                ${escapeHTML(room)}
            </td>

            <td>
                ${formatDate(checkIn)}
            </td>

            <td>
                ${formatDate(checkOut)}
            </td>

            <td>
                <span class="status-badge ${status}">
                    ${capitalize(status)}
                </span>
            </td>

            <td>
                ${formatDate(created)}
            </td>

            <td>
                <div class="action-buttons">

                    <button
                        class="action-btn view"
                        data-action="view"
                        data-id="${escapeHTML(String(reservation.id))}"
                    >
                        View
                    </button>

                    ${
                      status === "pending"
                        ? `
                                <button
                                    class="action-btn confirm"
                                    data-action="confirm"
                                    data-id="${escapeHTML(String(reservation.id))}"
                                >
                                    Confirm
                                </button>

                                <button
                                    class="action-btn cancel"
                                    data-action="cancel"
                                    data-id="${escapeHTML(String(reservation.id))}"
                                >
                                    Cancel
                                </button>
                            `
                        : ""
                    }

                </div>
            </td>
        `;

    reservationsTable.appendChild(row);
  });
}

function getGuestName(reservation) {
  return (
    reservation.guest_name ||
    reservation.full_name ||
    reservation.name ||
    reservation.guest ||
    "Guest"
  );
}

function getRoom(reservation) {
  return String(
    reservation.room_name ||
      reservation.room_number ||
      reservation.room ||
      reservation.room_id ||
      "—",
  );
}

function getCheckIn(reservation) {
  return (
    reservation.check_in ||
    reservation.check_in_date ||
    reservation.checkin ||
    "—"
  );
}

function getCheckOut(reservation) {
  return (
    reservation.check_out ||
    reservation.check_out_date ||
    reservation.checkout ||
    "—"
  );
}

function getStatus(reservation) {
  return String(reservation.status || "pending").toLowerCase();
}

function formatDate(value) {
  if (!value || value === "—") {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function openReservation(reservation) {
  selectedReservation = reservation;

  const status = getStatus(reservation);

  modalGuest.textContent = getGuestName(reservation);
  modalRoom.textContent = getRoom(reservation);
  modalCheckIn.textContent = formatDate(getCheckIn(reservation));
  modalCheckOut.textContent = formatDate(getCheckOut(reservation));
  modalId.textContent = reservation.id || "—";
  modalCreated.textContent = formatDate(reservation.created_at);

  modalStatus.textContent = capitalize(status);

  modalStatus.className = `status-badge ${status}`;

  modalConfirm.style.display = status === "pending" ? "block" : "none";

  modalCancel.style.display = status === "cancelled" ? "none" : "block";

  detailsOverlay.classList.add("show");
}

function closeReservationModal() {
  detailsOverlay.classList.remove("show");
  selectedReservation = null;
}

async function updateReservationStatus(id, status) {
  const actionText =
    status === "confirmed"
      ? "confirm this reservation"
      : "cancel this reservation";

  const confirmed = confirm(`Are you sure you want to ${actionText}?`);

  if (!confirmed) {
    return;
  }

  const { error } = await supabase
    .from("reservations")
    .update({
      status: status,
    })
    .eq("id", id);

  if (error) {
    console.error("Status update error:", error);

    alert("Unable to update the reservation.\n\n" + error.message);

    return;
  }

  closeReservationModal();

  await loadReservations();

  alert(
    status === "confirmed"
      ? "Reservation confirmed successfully."
      : "Reservation cancelled successfully.",
  );
}

reservationsTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;

  const reservation = allReservations.find(
    (item) => String(item.id) === String(id),
  );

  if (!reservation) {
    return;
  }

  if (action === "view") {
    openReservation(reservation);
  }

  if (action === "confirm") {
    updateReservationStatus(id, "confirmed");
  }

  if (action === "cancel") {
    updateReservationStatus(id, "cancelled");
  }
});

modalConfirm.addEventListener("click", () => {
  if (!selectedReservation) {
    return;
  }

  updateReservationStatus(selectedReservation.id, "confirmed");
});

modalCancel.addEventListener("click", () => {
  if (!selectedReservation) {
    return;
  }

  updateReservationStatus(selectedReservation.id, "cancelled");
});

closeModal.addEventListener("click", closeReservationModal);

detailsOverlay.addEventListener("click", (event) => {
  if (event.target === detailsOverlay) {
    closeReservationModal();
  }
});

searchInput.addEventListener("input", displayReservations);

statusFilter.addEventListener("change", displayReservations);

refreshBtn.addEventListener("click", loadReservations);

logoutBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    alert("Unable to logout. Please try again.");
    return;
  }

  window.location.href = "/frontend/login.html";
});

notificationBtn.addEventListener("click", () => {
  notificationPanel.classList.toggle("show");
});

closeNotifications.addEventListener("click", () => {
  notificationPanel.classList.remove("show");
});

document.addEventListener("click", (event) => {
  if (
    notificationPanel.classList.contains("show") &&
    !notificationPanel.contains(event.target) &&
    !notificationBtn.contains(event.target)
  ) {
    notificationPanel.classList.remove("show");
  }
});

mobileMenuBtn.addEventListener("click", () => {
  sidebar.classList.add("open");
  mobileOverlay.classList.add("show");
});

mobileOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  mobileOverlay.classList.remove("show");
});

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("show");
  });
});

async function initialize() {
  const loggedIn = await checkLogin();

  if (!loggedIn) {
    return;
  }

  await loadReservations();
}

initialize();
