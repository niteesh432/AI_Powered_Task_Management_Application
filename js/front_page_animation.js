document.addEventListener("DOMContentLoaded", function () {
    const parts = [
        ...document.getElementsByClassName("info-and-image"),
        ...document.getElementsByClassName("basicfeatures-and-image"),
        ...document.getElementsByClassName("progresstracking-and-image"),
        ...document.getElementsByClassName("customizepriorities-and-image"),
        ...document.getElementsByClassName("aifeatures-and-image"),
        ...document.getElementsByClassName("btn"),
        
    ];

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add an animation class when the container enters the viewport
                    entry.target.classList.add("animate");
                    // Stop observing once the animation is triggered
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.07,
        }
    );

    // Observe each part
    parts.forEach(part => {
        observer.observe(part);
    });
});
