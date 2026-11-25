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