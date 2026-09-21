import { supabase } from "./config.js";

const roomsTableBody = document.getElementById("roomsTableBody");
const addRoomBtn = document.getElementById("addRoomBtn");
const roomModal = document.getElementById("roomModal");
const roomModalClose = document.getElementById("roomModalClose");
const roomCancelBtn = document.getElementById("roomCancelBtn");
const roomForm = document.getElementById("roomForm");
const roomModalTitle = document.getElementById("roomModalTitle");
const roomModalSubtitle = document.getElementById("roomModalSubtitle");
const roomFormMessage = document.getElementById("roomFormMessage");
const roomSubmitBtn = document.getElementById("roomSubmitBtn");

const roomIdInput = document.getElementById("roomId");
const roomName = document.getElementById("roomName");
const roomType = document.getElementById("roomType");
const roomPrice = document.getElementById("roomPrice");
const roomCapacity = document.getElementById("roomCapacity");
const roomBeds = document.getElementById("roomBeds");
const roomSize = document.getElementById("roomSize");
const roomView = document.getElementById("roomView");
const roomImage = document.getElementById("roomImage");
const roomDescription = document.getElementById("roomDescription");
const roomAmenities = document.getElementById("roomAmenities");
const roomAvailable = document.getElementById("roomAvailable");

let roomsCache = [];
let isSubmitting = false;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAmenities(value) {
  if (!value || !String(value).trim()) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatAmenities(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

async function checkAdmin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    window.location.href = "./login.html";
    return false;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Admin check error:", adminError);
    alert("Unable to verify administrator access.");
    return false;
  }

  if (!admin) {
    alert("You do not have administrator access.");
    window.location.href = "./rooms.html";
    return false;
  }

  return true;
}

function openModal(mode = "add", room = null) {
  roomFormMessage.textContent = "";
  roomFormMessage.className = "admin-form-message";
  roomForm.reset();
  roomIdInput.value = "";
  roomAvailable.checked = true;

  if (mode === "edit" && room) {
    roomModalTitle.textContent = "Edit Room";
    roomModalSubtitle.textContent = "Update room details.";
    roomSubmitBtn.textContent = "Update Room";

    roomIdInput.value = room.id;
    roomName.value = room.name || room.room_name || "";
    roomType.value = room.type || room.room_type || "";
    roomPrice.value = room.price || room.price_per_night || "";
    roomCapacity.value =
      room.max_guests || room.capacity || room.guests || "";
    roomBeds.value = room.beds || "";
    roomSize.value = room.size || "";
    roomView.value = room.view || "";
    roomImage.value = room.image_url || room.image || "";
    roomDescription.value = room.description || "";
    roomAmenities.value = formatAmenities(room.amenities);
    roomAvailable.checked = room.available !== false;
  } else {
    roomModalTitle.textContent = "Add Room";
    roomModalSubtitle.textContent = "Create a new room for your resort.";
    roomSubmitBtn.textContent = "Save Room";
  }

  roomModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  roomModal.classList.remove("show");
  document.body.style.overflow = "";
  roomFormMessage.textContent = "";
  roomFormMessage.className = "admin-form-message";
}

function bindActionButtons() {
  document.querySelectorAll(".edit-room-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const room = roomsCache.find((item) => Number(item.id) === id);
      if (room) openModal("edit", room);
    });
  });

  document.querySelectorAll(".delete-room-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      const room = roomsCache.find((item) => Number(item.id) === id);
      const label = room
        ? room.name || room.room_name || `Room ${id}`
        : `Room ${id}`;

      const confirmed = confirm(
        `Are you sure you want to delete "${label}"? This cannot be undone.`,
      );
      if (!confirmed) return;

      const { error } = await supabase.from("rooms").delete().eq("id", id);

      if (error) {
        alert("Failed to delete room: " + error.message);
        return;
      }

      await loadRooms();
    });
  });
}

async function loadRooms() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return;

  roomsTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="loading-cell">Loading rooms...</td>
    </tr>
  `;

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Rooms error:", error);
    roomsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">Failed to load rooms.</td>
      </tr>
    `;
    return;
  }

  roomsCache = rooms || [];

  if (!rooms || rooms.length === 0) {
    roomsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">No rooms found. Click "+ Add Room" to create one.</td>
      </tr>
    `;
    return;
  }

  roomsTableBody.innerHTML = rooms
    .map((room) => {
      const roomNameValue = room.name || room.room_name || `Room ${room.id}`;
      const roomTypeValue = room.type || room.room_type || "-";
      const price = room.price || room.price_per_night || 0;
      const capacity =
        room.max_guests || room.capacity || room.guests || "-";
      const available = room.available === true;

      return `
        <tr>
          <td>${room.id}</td>
          <td><strong>${escapeHtml(roomNameValue)}</strong></td>
          <td>${escapeHtml(roomTypeValue)}</td>
          <td>₱${Number(price).toLocaleString()}</td>
          <td>${escapeHtml(String(capacity))}</td>
          <td>
            <span class="room-status ${available ? "available" : "occupied"}">
              ${available ? "Available" : "Unavailable"}
            </span>
          </td>
          <td>
            <button type="button" class="edit-room-btn" data-id="${room.id}">
              Edit
            </button>
            <button type="button" class="delete-room-btn" data-id="${room.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  bindActionButtons();
}

function getFormPayload() {
  const name = roomName.value.trim();
  const price = Number(roomPrice.value);
  const maxGuests = Number(roomCapacity.value);

  const payload = {
    name,
    slug: slugify(name),
    type: roomType.value || null,
    price,
    max_guests: maxGuests,
    beds: roomBeds.value.trim() || null,
    size: roomSize.value.trim() || null,
    view: roomView.value.trim() || null,
    image_url: roomImage.value.trim() || null,
    description: roomDescription.value.trim() || null,
    amenities: parseAmenities(roomAmenities.value),
    available: roomAvailable.checked,
  };

  return payload;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isSubmitting) return;

  roomFormMessage.textContent = "";
  roomFormMessage.className = "admin-form-message";

  const name = roomName.value.trim();
  const price = Number(roomPrice.value);
  const maxGuests = Number(roomCapacity.value);

  if (!name) {
    roomFormMessage.textContent = "Room name is required.";
    roomFormMessage.classList.add("error");
    return;
  }

  if (!price || price < 0) {
    roomFormMessage.textContent = "Please enter a valid price.";
    roomFormMessage.classList.add("error");
    return;
  }

  if (!maxGuests || maxGuests < 1) {
    roomFormMessage.textContent = "Please enter a valid capacity.";
    roomFormMessage.classList.add("error");
    return;
  }

  isSubmitting = true;
  roomSubmitBtn.disabled = true;
  const originalText = roomSubmitBtn.textContent;
  roomSubmitBtn.textContent = "Saving...";

  const payload = getFormPayload();
  const editingId = roomIdInput.value;

  try {
    let error;

    if (editingId) {
      ({ error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error } = await supabase.from("rooms").insert([payload]));
    }

    if (error) {
      roomFormMessage.textContent = error.message;
      roomFormMessage.classList.add("error");
      return;
    }

    roomFormMessage.textContent = editingId
      ? "Room updated successfully."
      : "Room created successfully.";
    roomFormMessage.classList.add("success");

    await loadRooms();

    setTimeout(() => {
      closeModal();
    }, 700);
  } catch (err) {
    console.error(err);
    roomFormMessage.textContent = "Something went wrong. Please try again.";
    roomFormMessage.classList.add("error");
  } finally {
    isSubmitting = false;
    roomSubmitBtn.disabled = false;
    roomSubmitBtn.textContent = originalText;
  }
}

// Event listeners
if (addRoomBtn) {
  addRoomBtn.addEventListener("click", () => openModal("add"));
}

if (roomModalClose) {
  roomModalClose.addEventListener("click", closeModal);
}

if (roomCancelBtn) {
  roomCancelBtn.addEventListener("click", closeModal);
}

if (roomModal) {
  roomModal.addEventListener("click", (event) => {
    if (event.target === roomModal) closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && roomModal.classList.contains("show")) {
    closeModal();
  }
});

if (roomForm) {
  roomForm.addEventListener("submit", handleSubmit);
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "./login.html";
  });
}

// Mobile menu
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileOverlay = document.getElementById("mobileOverlay");
const sidebar = document.querySelector(".sidebar");

if (mobileMenuBtn && sidebar) {
  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (mobileOverlay) mobileOverlay.classList.toggle("show");
  });
}

if (mobileOverlay && sidebar) {
  mobileOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("show");
  });
}

loadRooms();
