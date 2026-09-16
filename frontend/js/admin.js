import { supabase } from "./config.js";

async function checkAdminSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    return;
  }

  console.log("Admin session:", session);

  if (!session) {
    console.log("No active Supabase session.");
    window.location.href = "login.html";
    return;
  }

  loadDashboard();
}

async function loadDashboard() {
  await loadRooms();
  await loadReservations();
}

async function loadRooms() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("id, available");

  if (error) {
    console.error("Rooms error:", error);
    return;
  }

  const total = rooms.length;

  const available = rooms.filter((room) => room.available === true).length;

  const occupied = rooms.filter((room) => room.available === false).length;

  document.getElementById("availableRooms").textContent = available;
  document.getElementById("occupiedRooms").textContent = occupied;
  document.getElementById("reservedRooms").textContent = 0;

  const availablePercent = total ? (available / total) * 100 : 0;

  const occupiedPercent = total ? (occupied / total) * 100 : 0;

  document.getElementById("availableBar").style.width = `${availablePercent}%`;

  document.getElementById("occupiedBar").style.width = `${occupiedPercent}%`;

  document.getElementById("reservedBar").style.width = "0%";
}

async function loadReservations() {
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Reservations error:", error);
    return;
  }

  const total = reservations.length;

  const pending = reservations.filter(
    (reservation) => reservation.status === "pending",
  ).length;

  const confirmed = reservations.filter(
    (reservation) => reservation.status === "confirmed",
  ).length;

  const cancelled = reservations.filter(
    (reservation) => reservation.status === "cancelled",
  ).length;

  document.getElementById("totalReservations").textContent = total;

  document.getElementById("pendingReservations").textContent = pending;

  document.getElementById("confirmedReservations").textContent = confirmed;

  document.getElementById("cancelledReservations").textContent = cancelled;

  loadRecentReservations(reservations);

  let guests = 0;

  reservations.forEach((reservation) => {
    if (reservation.guests) {
      guests += Number(reservation.guests) || 0;
    } else if (reservation.number_of_guests) {
      guests += Number(reservation.number_of_guests) || 0;
    } else {
      guests++;
    }
  });

  document.getElementById("totalGuests").textContent = guests;
}

function loadRecentReservations(reservations) {
  const container = document.getElementById("recentReservations");

  if (!reservations.length) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="loading-cell">
          No reservations found.
        </td>
      </tr>
    `;

    return;
  }

  const recent = reservations.slice(0, 5);

  container.innerHTML = recent
    .map((reservation) => {
      const guest =
        reservation.guest_name ||
        reservation.full_name ||
        reservation.name ||
        reservation.email ||
        "Guest";

      const room =
        reservation.room_number ||
        reservation.room_name ||
        reservation.room_id ||
        "-";

      const checkIn = reservation.check_in || reservation.check_in_date || "-";

      const checkOut =
        reservation.check_out || reservation.check_out_date || "-";

      const status = reservation.status || "pending";

      return `
        <tr>
          <td>${escapeHtml(guest)}</td>
          <td>${escapeHtml(room)}</td>
          <td>${formatDate(checkIn)}</td>
          <td>${formatDate(checkOut)}</td>
          <td>${escapeHtml(status)}</td>
        </tr>
      `;
    })
    .join("");
}

function formatDate(date) {
  if (!date || date === "-") {
    return "-";
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString();
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
}

const notificationBtn = document.getElementById("notificationBtn");

const notificationPanel = document.getElementById("notificationPanel");

const closeNotification = document.getElementById("closeNotification");

if (notificationBtn && notificationPanel) {
  notificationBtn.addEventListener("click", () => {
    notificationPanel.classList.toggle("show");
  });
}

if (closeNotification && notificationPanel) {
  closeNotification.addEventListener("click", () => {
    notificationPanel.classList.remove("show");
  });
}

const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const sidebar = document.querySelector(".sidebar");

const mobileOverlay = document.getElementById("mobileOverlay");

if (mobileMenuBtn && sidebar && mobileOverlay) {
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    mobileOverlay.classList.add("show");
  });

  mobileOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("show");
  });
}

checkAdminSession();
