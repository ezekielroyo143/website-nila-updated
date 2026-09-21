const navToggle = document.getElementById("navToggle");
const nav = document.getElementById(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("mobile-open");
  });
}

async function updateNavigation() {
  const navActions = document.getElementById("navActions");

  if (!navActions) {
    return;
  }

  const { data, error } = await window.supabaseClient.auth.getUser();

  if (error) {
    console.error("Navigation auth error:", error);
    return;
  }

  if (data.user) {
    navActions.innerHTML = `
            <a href="./rooms.html" class="btn">Rooms</a>
            <a href="./my-reservations.html" class="btn btn-primary">
                My Reservations
            </a>
            <button type="button" class="btn" id="navLogoutBtn">
                Logout
            </button>
        `;

    const logoutButton = document.getElementById("navLogoutBtn");

    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      logoutButton.textContent = "Logging out...";

      const { error } = await window.supabaseClient.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";
        return;
      }

      window.location.href = "./index.html";
    });
  }
}

updateNavigation();
