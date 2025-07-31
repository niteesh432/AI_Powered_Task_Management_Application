document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
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

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (!name || !email || !password || !confirmPassword) {
      showModal('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showModal('Passwords do not match.');
      return;
    }

    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      await result.user.sendEmailVerification();

      showModal('Signup successful! Verification email sent.');

      // Optional: Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = 'sign_in.html';
      }, 3000);
    } catch (error) {
      showModal('Error: ' + error.message);
    }
  });
});
