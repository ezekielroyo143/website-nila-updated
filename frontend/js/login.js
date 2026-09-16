import { supabase } from "./config.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.className = "message";
  loginMessage.textContent = "Logging in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginMessage.className = "message error";
    loginMessage.textContent = error.message;
    return;
  }

  const user = data.user;

  console.log("Logged in user:", user);

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Admin check error:", adminError);
  }

  loginMessage.className = "message success";

  if (admin) {
    loginMessage.textContent = "Administrator login successful! Redirecting...";

    setTimeout(() => {
      window.location.href = "./admin.html";
    }, 700);

    return;
  }

  loginMessage.textContent = "Login successful! Redirecting...";

  setTimeout(() => {
    window.location.href = "./rooms.html";
  }, 700);
});
