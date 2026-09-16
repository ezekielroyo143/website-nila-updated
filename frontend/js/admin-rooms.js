import { supabase } from "./config.js";

const roomsTableBody = document.getElementById("roomsTableBody");

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

async function loadRooms() {
  const isAdmin = await checkAdmin();

  if (!isAdmin) return;

  roomsTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="loading-cell">
        Loading rooms...
      </td>
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
        <td colspan="7" class="loading-cell">
          Failed to load rooms.
        </td>
      </tr>
    `;

    return;
  }

  if (!rooms || rooms.length === 0) {
    roomsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">
          No rooms found.
        </td>
      </tr>
    `;

    return;
  }

  roomsTableBody.innerHTML = rooms
    .map((room) => {
      const roomName = room.name || room.room_name || `Room ${room.id}`;

      const roomType = room.type || room.room_type || "-";

      const price = room.price || room.price_per_night || 0;

      const capacity = room.capacity || room.max_guests || room.guests || "-";

      const available = room.available === true;

      return `
        <tr>
          <td>${room.id}</td>

          <td>
            <strong>${escapeHtml(roomName)}</strong>
          </td>

          <td>${escapeHtml(roomType)}</td>

          <td>₱${Number(price).toLocaleString()}</td>

          <td>${escapeHtml(String(capacity))}</td>

          <td>
            <span class="room-status ${available ? "available" : "occupied"}">
              ${available ? "Available" : "Unavailable"}
            </span>
          </td>

          <td>
            <button class="edit-room-btn" data-id="${room.id}">
              Edit
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadRooms();
