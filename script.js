document.addEventListener("DOMContentLoaded", () => {
    // Get modal elements
    const modal = document.getElementById("cardModal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const closeBtn = document.querySelector(".close-btn");

    // Select all cards
    const cards = document.querySelectorAll(".card");

    // Add click event to each card
    cards.forEach(card => {
        card.addEventListener("click", () => {
            // 1. Get content from the clicked card
            const cardImg = card.querySelector(".card-image"); // Find image if it exists
            const title = card.querySelector("h2").innerText;
            const desc = card.querySelector(".description").innerText;

            // 2. Populate the modal
            modalTitle.innerText = title;
            modalDesc.innerText = desc;

            // CHECK: Does this card have an image?
            if (cardImg) {
                modalImg.src = cardImg.src;
                modalImg.style.display = "block"; // Show image
            } else {
                modalImg.style.display = "none";  // Hide image area
            }

            // 3. Show the modal
            modal.style.display = "block";
        });
    });

    // Close button logic
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close if user clicks outside the modal content
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});