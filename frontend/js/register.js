const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  registerMessage.className = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Passwords do not match.";
    return;
  }

  if (!firstName || !lastName || !phone || !email || !password) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Please fill in all fields.";
    return;
  }

  registerMessage.className = "";
  registerMessage.textContent = "Creating account...";

  const fullName = `${firstName} ${lastName}`;

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    registerMessage.className = "message error";
    registerMessage.textContent = error.message;
    return;
  }

  if (!data.user) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Account could not be created.";
    return;
  }

  const { error: profileError } = await supabaseClient.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: fullName,
      phone: phone,
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    console.error("Profile error:", profileError);

    registerMessage.className = "message error";
    registerMessage.textContent =
      "Account created, but your profile information could not be saved.";

    return;
  }

  registerMessage.className = "message success";

  registerMessage.textContent = data.session
    ? "Account created successfully. Redirecting..."
    : "Account created. Check your email to confirm your account.";

  if (data.session) {
    setTimeout(() => {
      window.location.href = "./rooms.html";
    }, 900);
  } else {
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1800);
  }
});
