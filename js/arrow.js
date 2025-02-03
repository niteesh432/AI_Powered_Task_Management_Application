// Get the down arrow element
const downArrow = document.querySelector('.header-down-arrow');

// Add an event listener to handle the scroll event
window.addEventListener('scroll', function () {
    const threshold = window.innerHeight / 10;
    if (window.scrollY > threshold) {
        downArrow.classList.add('hidden'); // Add the hidden class to fade out
    } else {
        downArrow.classList.remove('hidden'); // Remove the hidden class to fade in
    }
});

// Optional: Add a fade-out animation for smoother effect
document.styleSheets[0].insertRule(`
    .hidden {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
`, 0);
