document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
  
    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
  
      if (!email || !password) {
        alert('Please fill in all fields.');
        return;
      }
  
      // Perform any additional validation or authentication here
  
      // If validation passes, redirect to index2.html
      window.location.href = 'index2.html';
    });
  });