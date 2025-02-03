// JavaScript code to animate the main container when it reaches the viewport
document.addEventListener("DOMContentLoaded", function () {
    const mainPart = document.getElementById("main-part");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add an animation class when the container enters the viewport
                    mainPart.classList.add("animate");
                    // Stop observing once the animation is triggered
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.07,
        }
    );

    observer.observe(mainPart);
});
