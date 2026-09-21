const resortForm = document.getElementById("resortSettingsForm");
const reservationForm = document.getElementById("reservationSettingsForm");

const resortMessage = document.getElementById("resortMessage");
const reservationMessage = document.getElementById("reservationMessage");

const resortName = document.getElementById("resortName");
const contactNumber = document.getElementById("contactNumber");
const email = document.getElementById("email");
const address = document.getElementById("address");

const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");

const adminEmail = document.getElementById("adminEmail");

const logoutBtn = document.getElementById("logoutBtn");
const logoutAccountBtn = document.getElementById("logoutAccountBtn");

async function checkAdmin() {
  const result = await window.supabaseClient.auth.getUser();

  if (result.error || !result.data.user) {
    window.location.href = "/FRONTEND/login.html";
    return null;
  }

  adminEmail.textContent = result.data.user.email;

  return result.data.user;
}

async function loadSettings() {
  const result = await window.supabaseClient
    .from("resort_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (result.error) {
    console.error("Error loading settings:", result.error);
    return;
  }

  if (!result.data) {
    checkIn.value = "14:00";
    checkOut.value = "12:00";
    return;
  }

  const data = result.data;

  resortName.value = data.resort_name || "";
  contactNumber.value = data.contact_number || "";
  email.value = data.email || "";
  address.value = data.address || "";

  checkIn.value = data.check_in_time
    ? data.check_in_time.substring(0, 5)
    : "14:00";

  checkOut.value = data.check_out_time
    ? data.check_out_time.substring(0, 5)
    : "12:00";
}

async function saveResortSettings(event) {
  event.preventDefault();

  resortMessage.textContent = "Saving...";

  const existingResult = await window.supabaseClient
    .from("resort_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existingResult.error) {
    console.error(existingResult.error);
    resortMessage.textContent = "Failed to load settings.";
    return;
  }

  const settings = {
    resort_name: resortName.value.trim(),
    contact_number: contactNumber.value.trim(),
    email: email.value.trim(),
    address: address.value.trim(),
  };

  let result;

  if (existingResult.data) {
    result = await window.supabaseClient
      .from("resort_settings")
      .update(settings)
      .eq("id", existingResult.data.id);
  } else {
    result = await window.supabaseClient
      .from("resort_settings")
      .insert([settings]);
  }

  if (result.error) {
    console.error("Save error:", result.error);
    resortMessage.textContent = "Failed to save settings.";
    return;
  }

  resortMessage.textContent = "Resort information saved successfully.";

  await loadSettings();
}

async function saveReservationSettings(event) {
  event.preventDefault();

  reservationMessage.textContent = "Saving...";

  const existingResult = await window.supabaseClient
    .from("resort_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existingResult.error) {
    console.error(existingResult.error);
    reservationMessage.textContent = "Failed to load settings.";
    return;
  }

  const settings = {
    check_in_time: checkIn.value,
    check_out_time: checkOut.value,
  };

  let result;

  if (existingResult.data) {
    result = await window.supabaseClient
      .from("resort_settings")
      .update(settings)
      .eq("id", existingResult.data.id);
  } else {
    result = await window.supabaseClient
      .from("resort_settings")
      .insert([settings]);
  }

  if (result.error) {
    console.error("Save error:", result.error);
    reservationMessage.textContent = "Failed to save settings.";
    return;
  }

  reservationMessage.textContent = "Reservation settings saved successfully.";

  await loadSettings();
}

async function logout() {
  const result = await window.supabaseClient.auth.signOut();

  if (result.error) {
    console.error("Logout error:", result.error);
    return;
  }

  window.location.href = "/FRONTEND/login.html";
}

resortForm.addEventListener("submit", saveResortSettings);

reservationForm.addEventListener("submit", saveReservationSettings);

logoutBtn.addEventListener("click", logout);

logoutAccountBtn.addEventListener("click", logout);

async function init() {
  if (!window.supabaseClient) {
    console.error("Supabase client is not available.");
    return;
  }

  const user = await checkAdmin();

  if (!user) {
    return;
  }

  await loadSettings();
}

init();
