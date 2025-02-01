document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
  
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document.getElementById('confirm-password').value.trim();
  
      if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
      }
  
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
  
      // If validation passes, redirect to index2.html
      window.location.href = 'sign_in.html';
    });
  });