const navActions = document.querySelector(".nav-actions");

async function updateNavigation() {
  if (!navActions) return;

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (user) {
    navActions.innerHTML = `
            <a href="./rooms.html" class="btn">Rooms</a>
            <a href="./my-reservations.html" class="btn btn-primary">My Reservations</a>
            <button id="logoutBtn" class="btn">Logout</button>
        `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      window.location.href = "./index.html";
    });
  } else {
    navActions.innerHTML = `
            <a href="./login.html" class="btn">Login</a>
            <a href="./register.html" class="btn btn-primary">Register</a>
        `;
  }
}

updateNavigation();

supabaseClient.auth.onAuthStateChange(() => {
  updateNavigation();
});
