const videoModal = document.getElementById("videoModal");
const introVideo = document.getElementById("introVideo");
const watchStory = document.getElementById("watchStory");
const closeVideo = document.getElementById("closeVideo");

watchStory.addEventListener("click", () => {
    videoModal.showModal();

    introVideo.play().catch(error => {
        console.error("Video playback failed:", error);
    });
});

closeVideo.addEventListener("click", () => {
    videoModal.close();
});

videoModal.addEventListener("close", () => {
    introVideo.pause();
    introVideo.currentTime = 0;
});

// function delivery(){

// }

const backToTop = document.getElementById("backToTop");
const offerSection = document.querySelector(".premium-section");

function toggleBackToTop() {

    const sectionTop = offerSection.getBoundingClientRect().top;
    if (sectionTop <= 100) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
}

window.addEventListener("scroll", toggleBackToTop);

toggleBackToTop();

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});