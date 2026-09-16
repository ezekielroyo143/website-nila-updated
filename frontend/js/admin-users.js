import { supabase } from "./config.js";

const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const totalUsers = document.getElementById("totalUsers");

let users = [];

async function checkAdmin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    alert("Please login first.");
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

async function loadUsers() {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return;
  }

  usersTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="loading-cell">
        Loading users...
      </td>
    </tr>
  `;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Users error:", error);

    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-cell">
          Failed to load users.
        </td>
      </tr>
    `;

    return;
  }

  users = data || [];

  if (totalUsers) {
    totalUsers.textContent = users.length;
  }

  displayUsers(users);
}

function displayUsers(data) {
  if (!data.length) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-cell">
          No users found.
        </td>
      </tr>
    `;

    return;
  }

  usersTableBody.innerHTML = data
    .map((user) => {
      const name = user.full_name || "No name";
      const email = user.email || "No email";
      const phone = user.phone || "No phone";

      const created = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : "—";

      return `
        <tr>
          <td>
            <div class="user-name">
              <div class="user-avatar">
                ${escapeHtml(name.charAt(0).toUpperCase())}
              </div>

              <strong>${escapeHtml(name)}</strong>
            </div>
          </td>

          <td>${escapeHtml(email)}</td>

          <td>${escapeHtml(phone)}</td>

          <td>${created}</td>

          <td>
            <span class="user-status active">
              Active
            </span>
          </td>

          <td>
            <button
              class="view-user-btn"
              data-id="${escapeHtml(user.id)}"
            >
              View
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function searchUsers() {
  const search = searchInput.value.toLowerCase().trim();

  if (!search) {
    displayUsers(users);
    return;
  }

  const filtered = users.filter((user) => {
    return (
      (user.full_name || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search) ||
      (user.phone || "").toLowerCase().includes(search)
    );
  });

  displayUsers(filtered);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

if (searchInput) {
  searchInput.addEventListener("input", searchUsers);
}

loadUsers();
