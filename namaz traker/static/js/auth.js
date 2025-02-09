document.addEventListener("DOMContentLoaded", function () {
  console.log("auth.js is connected!");

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const signupDiv = document.getElementById("signup");
  const loginDiv = document.getElementById("login");
  const notMemberBtn = document.getElementById("not-member");
  const alreadyMemberBtn = document.getElementById("already-member");

  // Pehle login form hide kar do
  loginDiv.style.display = "none";

  // Switch to Login
  notMemberBtn.addEventListener("click", function () {
      signupDiv.style.display = "none";
      loginDiv.style.display = "block";
  });

  // Switch to Signup
  alreadyMemberBtn.addEventListener("click", function () {
      loginDiv.style.display = "none";
      signupDiv.style.display = "block";
  });

  // Signup Form Submit
  signupForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = signupForm.name.value;
      const email = signupForm.email.value;
      const password = signupForm.password.value;

      if (name && email && password) {
          localStorage.setItem("user", JSON.stringify({ name, email, password }));
          alert("Signup successful! Please login.");
          signupDiv.style.display = "none";
          loginDiv.style.display = "block";
      }
  });

  // Login Form Submit
  loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const user = JSON.parse(localStorage.getItem("user"));

      if (user && user.email === email && user.password === password) {
          alert("Login successful!");
          window.location.href = "index.html"; // Namaz Tracker page redirect
      } else {
          alert("Invalid email or password!");
      }
  });
});



