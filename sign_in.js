document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');

  function showModal(message) {
    modalContent.textContent = message;
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 3000);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showModal('Please fill in all fields.');
      return;
    }

    try {
      const result = await firebase.auth().signInWithEmailAndPassword(email, password);
      if (!result.user.emailVerified) {
        showModal('Please verify your email before logging in.');
        await firebase.auth().signOut();
        return;
      }
      showModal('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'index2.html'; // or dashboard.html
      }, 1000);
    } catch (error) {
      showModal('Login failed: ' + error.message);
    }
  });

  document.getElementById('google-login')?.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      showModal('Google sign-in successful!');
      setTimeout(() => {
        window.location.href = 'index2.html';
      }, 1000);
    } catch (err) {
      showModal('Google sign-in failed: ' + err.message);
    }
  });

  document.getElementById('forgot-password')?.addEventListener('click', async () => {
    const email = prompt("Enter your email for password reset:");
    if (!email) return;
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      showModal("Password reset link sent to your email.");
    } catch (error) {
      showModal("Failed to send reset email: " + error.message);
    }
  });
});
