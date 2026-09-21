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
    console.error("Login error:", error);

    loginMessage.className = "message error";
    loginMessage.textContent = error.message;
    return;
  }

  const user = data.user;

  console.log("Logged in user:", user);
  console.log("User ID:", user.id);
  console.log("User metadata:", user.user_metadata);

  const firstName = user.user_metadata?.first_name || "";
  const lastName = user.user_metadata?.last_name || "";

  const fullName =
    user.user_metadata?.full_name || `${firstName} ${lastName}`.trim();

  const phone = user.user_metadata?.phone || "";

  console.log("Profile data:", {
    id: user.id,
    full_name: fullName,
    phone: phone,
  });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        phone: phone,
      },
      {
        onConflict: "id",
      },
    )
    .select()
    .single();

  if (profileError) {
    console.error("Profile error:", profileError);

    loginMessage.className = "message error";
    loginMessage.textContent =
      "Login successful, but your profile could not be saved.";

    return;
  }

  console.log("Profile saved successfully:", profile);

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
