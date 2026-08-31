import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import firebaseConfig from "../../config/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ADMIN_EMAIL = "ssheraji@gmail.com";

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      if (userCredential.user.email === ADMIN_EMAIL) {
        window.location.href = "src/admin/dashboard.html";
      } else {
        window.location.href = "src/user/dashboard.html";
      }
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});
