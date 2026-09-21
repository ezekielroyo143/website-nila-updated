const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const capsLockMessage = document.getElementById("capsLockMessage");

if (passwordInput && capsLockMessage) {
  passwordInput.addEventListener("keyup", (event) => {
    if (event.getModifierState("CapsLock")) {
      capsLockMessage.textContent = "Caps Lock is ON.";
    } else {
      capsLockMessage.textContent = "";
    }
  });
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  registerMessage.className = "message";
  registerMessage.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Please fill in all fields.";
    return;
  }

  const strongPassword =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!strongPassword) {
    registerMessage.className = "message error";
    registerMessage.textContent =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Passwords do not match.";
    return;
  }

  registerMessage.className = "message";
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
    console.error("Registration error:", error);

    registerMessage.className = "message error";
    registerMessage.textContent = error.message;
    return;
  }

  if (!data.user) {
    registerMessage.className = "message error";
    registerMessage.textContent = "Account could not be created.";
    return;
  }

  if (data.session) {
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name: fullName,
          email: email,
          phone: phone,
        },
        {
          onConflict: "id",
        },
      );

    if (profileError) {
      console.error("Profile error:", profileError);

      registerMessage.className = "message error";
      registerMessage.textContent = "profile error: " + profileError.message;

      return;
    }

    registerMessage.className = "message success";
    registerMessage.textContent =
      "Account created successfully. Redirecting...";

    setTimeout(() => {
      window.location.href = "./rooms.html";
    }, 900);
  } else {
    registerMessage.className = "message success";
    registerMessage.textContent =
      "Account created. Check your email to confirm your account.";

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1800);
  }
});
