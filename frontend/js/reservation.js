const form = document.getElementById("reservationForm");
const message = document.getElementById("message");

const roomSelect = document.getElementById("room");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const adults = document.getElementById("adults");
const children = document.getElementById("children");

const paymentSection = document.getElementById("paymentSection");

const paymentAmount = document.getElementById("paymentAmount");

const paymentReference = document.getElementById("paymentReference");

const paymentMessage = document.getElementById("paymentMessage");

const submitReservationBtn = document.getElementById("submitReservationBtn");

const logoutBtn = document.getElementById("logoutBtn");

let rooms = [];
let selectedRoom = null;

/* =========================
   PRICE FORMAT
========================= */

function peso(value) {
  return (
    "₱" +
    Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/* =========================
   CALCULATE NIGHTS
========================= */

function getNights() {
  if (!checkIn.value || !checkOut.value) {
    return 0;
  }

  const start = new Date(checkIn.value + "T00:00:00");

  const end = new Date(checkOut.value + "T00:00:00");

  const difference = Math.ceil((end - start) / 86400000);

  return difference > 0 ? difference : 0;
}

/* =========================
   UPDATE SUMMARY
========================= */

function updateSummary() {
  selectedRoom =
    rooms.find((room) => String(room.id) === String(roomSelect.value)) || null;

  const nights = getNights();

  const total = selectedRoom ? Number(selectedRoom.price) * nights : 0;

  const summaryRoom = document.getElementById("summaryRoom");

  const summaryCheckIn = document.getElementById("summaryCheckIn");

  const summaryCheckOut = document.getElementById("summaryCheckOut");

  const summaryNights = document.getElementById("summaryNights");

  const summaryRate = document.getElementById("summaryRate");

  const summaryTotal = document.getElementById("summaryTotal");

  if (summaryRoom) {
    summaryRoom.textContent = selectedRoom ? selectedRoom.name : "-";
  }

  if (summaryCheckIn) {
    summaryCheckIn.textContent = checkIn.value ? checkIn.value : "-";
  }

  if (summaryCheckOut) {
    summaryCheckOut.textContent = checkOut.value ? checkOut.value : "-";
  }

  if (summaryNights) {
    summaryNights.textContent = nights;
  }

  if (summaryRate) {
    summaryRate.textContent = selectedRoom ? peso(selectedRoom.price) : "₱0.00";
  }

  if (summaryTotal) {
    summaryTotal.textContent = peso(total);
  }

  if (paymentAmount) {
    paymentAmount.textContent = peso(total);
  }
}

/* =========================
   LOAD LOGGED-IN USER
========================= */

async function loadUser() {
  const { data, error } = await window.supabaseClient.auth.getUser();

  if (error) {
    console.error("Auth error:", error);

    return;
  }

  if (!data.user) {
    return;
  }

  const user = data.user;

  const emailInput = document.getElementById("email");

  if (emailInput) {
    emailInput.value = user.email || "";
  }

  const { data: profile, error: profileError } = await window.supabaseClient
    .from("profiles")
    .select("full_name,phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.warn("Profile could not be loaded:", profileError);

    return;
  }

  if (!profile) {
    return;
  }

  const firstName = document.getElementById("firstName");

  const lastName = document.getElementById("lastName");

  const phone = document.getElementById("phone");

  if (profile.full_name) {
    const nameParts = profile.full_name.trim().split(/\s+/);

    if (firstName) {
      firstName.value = nameParts[0] || "";
    }

    if (lastName) {
      lastName.value = nameParts.slice(1).join(" ") || "";
    }
  }

  if (phone) {
    phone.value = profile.phone || "";
  }
}

/* =========================
   LOAD ROOMS
========================= */

async function loadRooms() {
  const { data, error } = await window.supabaseClient
    .from("rooms")
    .select("id,name,slug,price,max_guests")
    .eq("available", true)
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error("Rooms error:", error);

    roomSelect.innerHTML = `<option value="">
                Unable to load rooms
            </option>`;

    if (message) {
      message.className = "message-error";

      message.textContent = "Unable to load rooms.";
    }

    return;
  }

  rooms = data || [];

  roomSelect.innerHTML = `<option value="">
            Select a room
        </option>`;

  rooms.forEach((room) => {
    const option = document.createElement("option");

    option.value = room.id;

    option.textContent = `${room.name} - ${peso(room.price)} / night`;

    roomSelect.appendChild(option);
  });

  const urlParams = new URLSearchParams(window.location.search);

  const roomSlug = urlParams.get("room");

  if (roomSlug) {
    const room = rooms.find((item) => item.slug === roomSlug);

    if (room) {
      roomSelect.value = String(room.id);
    }
  }

  updateSummary();
}

/* =========================
   VALIDATE RESERVATION
========================= */

function validateReservation() {
  if (message) {
    message.className = "";
    message.textContent = "";
  }

  const firstName = document.getElementById("firstName").value.trim();

  const lastName = document.getElementById("lastName").value.trim();

  const email = document.getElementById("email").value.trim();

  const phone = document.getElementById("phone").value.trim();

  const nights = getNights();

  if (!firstName || !lastName || !email || !phone) {
    if (message) {
      message.className = "message-error";

      message.textContent = "Please complete all guest information.";
    }

    return false;
  }

  if (!selectedRoom) {
    if (message) {
      message.className = "message-error";

      message.textContent = "Please select a room.";
    }

    return false;
  }

  if (nights < 1) {
    if (message) {
      message.className = "message-error";

      message.textContent = "Please select valid check-in and check-out dates.";
    }

    return false;
  }

  const adultCount = Number(adults.value);

  const childCount = Number(children.value || 0);

  if (adultCount < 1) {
    if (message) {
      message.className = "message-error";

      message.textContent = "There must be at least 1 adult.";
    }

    return false;
  }

  if (childCount < 0) {
    if (message) {
      message.className = "message-error";

      message.textContent = "Children cannot be negative.";
    }

    return false;
  }

  if (adultCount + childCount > Number(selectedRoom.max_guests)) {
    if (message) {
      message.className = "message-error";

      message.textContent = `This room allows up to ${selectedRoom.max_guests} guests.`;
    }

    return false;
  }

  return true;
}

/* =========================
   CONTINUE TO PAYMENT
========================= */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateReservation()) {
    return;
  }

  const nights = getNights();

  const total = Number(selectedRoom.price) * nights;

  if (paymentAmount) {
    paymentAmount.textContent = peso(total);
  }

  paymentSection.scrollIntoView({
    behavior: "smooth",
  });
});

/* =========================
   SUBMIT RESERVATION
========================= */

async function submitReservation() {
  if (paymentMessage) {
    paymentMessage.className = "";

    paymentMessage.textContent = "";
  }

  const reference = paymentReference.value.trim();

  if (!reference) {
    paymentMessage.className = "message-error";

    paymentMessage.textContent = "Please enter your GCash reference number.";

    return;
  }

  const { data, error: authError } = await window.supabaseClient.auth.getUser();

  if (authError) {
    console.error("Authentication error:", authError);

    paymentMessage.className = "message-error";

    paymentMessage.textContent = "Unable to verify your login.";

    return;
  }

  if (!data.user) {
    paymentMessage.className = "message-error";

    paymentMessage.textContent = "Please log in before making a reservation.";

    return;
  }

  if (!validateReservation()) {
    return;
  }

  const nights = getNights();

  const total = Number(selectedRoom.price) * nights;

  submitReservationBtn.disabled = true;

  submitReservationBtn.textContent = "Submitting...";

  const { error } = await window.supabaseClient.from("reservations").insert({
    user_id: data.user.id,

    room_id: selectedRoom.id,

    first_name: document.getElementById("firstName").value.trim(),

    last_name: document.getElementById("lastName").value.trim(),

    email: document.getElementById("email").value.trim(),

    phone: document.getElementById("phone").value.trim(),

    check_in: checkIn.value,

    check_out: checkOut.value,

    adults: Number(adults.value),

    children: Number(children.value || 0),

    special_requests: document.getElementById("specialRequests").value.trim(),

    total: total,
  });

  if (error) {
    console.error("Reservation error:", error);

    paymentMessage.className = "message-error";

    paymentMessage.textContent =
      error.message || "Failed to submit reservation.";

    submitReservationBtn.disabled = false;

    submitReservationBtn.textContent = "Submit Reservation";

    return;
  }

  paymentMessage.className = "message-success";

  paymentMessage.textContent = "Reservation submitted successfully!";

  submitReservationBtn.disabled = true;

  setTimeout(() => {
    window.location.href = "./my-reservations.html";
  }, 1500);
}

/* =========================
   EVENT LISTENERS
========================= */

roomSelect.addEventListener("change", updateSummary);

checkIn.addEventListener("change", updateSummary);

checkOut.addEventListener("change", updateSummary);

adults.addEventListener("change", updateSummary);

children.addEventListener("change", updateSummary);

/* =========================
   DATE SETTINGS
========================= */

const today = new Date().toISOString().split("T")[0];

checkIn.min = today;

checkOut.min = today;

checkIn.addEventListener("change", () => {
  checkOut.min = checkIn.value || today;

  if (checkOut.value && checkOut.value <= checkIn.value) {
    checkOut.value = "";
  }

  updateSummary();
});

/* =========================
   LOGOUT
========================= */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;

    logoutBtn.textContent = "Logging out...";

    const { error } = await window.supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error);

      logoutBtn.disabled = false;

      logoutBtn.textContent = "Logout";

      return;
    }

    window.location.href = "./login.html";
  });
}

/* =========================
   START
========================= */

submitReservationBtn.addEventListener("click", submitReservation);

async function updateNavigation() {
  const navActions = document.getElementById("navActions");

  if (!navActions) {
    return;
  }

  const { data } = await window.supabaseClient.auth.getUser();

  if (data.user) {
    navActions.innerHTML = `
      <a href="./rooms.html" class="btn">Rooms</a>
      <a href="./my-reservations.html" class="btn btn-primary">My Reservations</a>
      <button type="button" class="btn" id="navLogoutBtn">Logout</button>
    `;

    const navLogoutBtn = document.getElementById("navLogoutBtn");

    navLogoutBtn.addEventListener("click", async () => {
      navLogoutBtn.disabled = true;
      navLogoutBtn.textContent = "Logging out...";

      const { error } = await window.supabaseClient.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        navLogoutBtn.disabled = false;
        navLogoutBtn.textContent = "Logout";
        return;
      }

      window.location.href = "./index.html";
    });
  }
}
loadUser();

loadRooms();
