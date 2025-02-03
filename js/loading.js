// Prepare the body tag by adding a "js-loading" class
document.body.classList.add("js-loading");

// Optionally, show a loading spinner
const spinner = document.createElement('div');
spinner.className = 'loading-spinner';
document.body.appendChild(spinner);

// Listen for when everything has loaded
window.addEventListener('DOMContentLoaded', showPage, false);

function showPage() {
    // Remove the "js-loading" class
    document.body.classList.remove("js-loading");
    // Remove the spinner
    spinner.remove();
    // Scroll to the top of the page after loading
    window.scrollTo(0, 0);
}
