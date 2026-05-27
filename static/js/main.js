const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// About section image and video reveal
const aboutSection = document.getElementById("about");
if (aboutSection) {
  const aboutImage = document.getElementById("about-details-image");
  const aboutVideo = document.getElementById("about-intro-video");
  const videoOverlay = document.getElementById("video-overlay");
  const soundToggle = document.getElementById("video-sound-toggle");
  const soundOffIcon = document.querySelector(".sound-off-icon");
  const soundOnIcon = document.querySelector(".sound-on-icon");
  
  let firstTimeEntry = true;
  
  // Update sound icon display
  function updateSoundIcon() {
    if (soundOffIcon && soundOnIcon) {
      if (aboutVideo.muted) {
        soundOffIcon.style.display = "block";
        soundOnIcon.style.display = "none";
      } else {
        soundOffIcon.style.display = "none";
        soundOnIcon.style.display = "block";
      }
    }
  }
  
  // Overlay appears only when video is not playing
  function updateOverlay() {
    if (aboutVideo.paused) {
      if (videoOverlay) videoOverlay.classList.remove("hidden");
    } else {
      if (videoOverlay) videoOverlay.classList.add("hidden");
    }
  }
  
  // Reset to initial state with image only (NO overlay, NO auto-play)
  function resetVideoState() {
    aboutVideo.pause();
    aboutVideo.currentTime = 0;
    aboutVideo.muted = true;
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    updateOverlay();
    updateSoundIcon();
  }
  
  // Auto-play animation (FIRST TIME ONLY)
  function playVideoAnimation() {
    // Show image for 1 second, HIDE overlay during auto-play sequence
    aboutImage.style.opacity = "1";
    if (videoOverlay) videoOverlay.classList.add("hidden");
    
    setTimeout(() => {
      // Fade out image
      aboutImage.classList.add("fade-out");
      
      // After fade completes, play video
      setTimeout(() => {
        aboutVideo.currentTime = 0;
        aboutVideo.muted = true;
        aboutVideo.play().catch(e => console.error("Auto-play failed:", e));
        // Overlay stays hidden while video plays
        if (videoOverlay) videoOverlay.classList.add("hidden");
        
        // Unmute after a short delay
        setTimeout(() => {
          aboutVideo.muted = false;
          updateSoundIcon();
        }, 100);
      }, 500);
    }, 1000);
  }
  
  // Handle video end event - show image with overlay
  function handleVideoEnd() {
    aboutVideo.currentTime = 0;
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    updateOverlay(); // Shows overlay since video is now paused
  }
  
  // Handle image click to play with sound
  function handleImageClick() {
    // Only play if image is visible (not faded out)
    if (!aboutImage.classList.contains("fade-out")) {
      aboutImage.classList.add("fade-out");
      aboutVideo.currentTime = 0;
      aboutVideo.muted = false;
      aboutVideo.play().catch(e => console.error("Manual play failed:", e));
      updateOverlay();
      updateSoundIcon();
    }
  }

  // Handle overlay click to play with sound (when overlay is visible)
  function handleOverlayClick() {
    if (videoOverlay && !videoOverlay.classList.contains("hidden")) {
      aboutImage.classList.add("fade-out");
      aboutVideo.currentTime = 0;
      aboutVideo.muted = false;
      aboutVideo.play().catch(e => console.error("Manual play from overlay failed:", e));
      updateOverlay();
      updateSoundIcon();
    }
  }
  
  // Handle video click to play/pause
  function togglePlayPause(e) {
    e.stopPropagation();
    if (aboutVideo.paused) {
      aboutVideo.play();
    } else {
      aboutVideo.pause();
    }
    updateOverlay();
  }
  
  // Sound toggle handler
  function handleSoundToggle(e) {
    e.stopPropagation();
    aboutVideo.muted = !aboutVideo.muted;
    updateSoundIcon();
  }
  
  // Set up intersection observer - KEEPS WATCHING
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && aboutImage && aboutVideo) {
          // First time entering: auto-play
          if (firstTimeEntry) {
            playVideoAnimation();
            firstTimeEntry = false;
          } else {
            // Subsequent entries: show image only, no overlay, no auto-play
            resetVideoState();
          }
          
          // Set up event listeners
          aboutVideo.removeEventListener("ended", handleVideoEnd);
          aboutVideo.addEventListener("ended", handleVideoEnd);
          
          aboutVideo.removeEventListener("click", togglePlayPause);
          aboutVideo.addEventListener("click", togglePlayPause);
          
          aboutImage.removeEventListener("click", handleImageClick);
          aboutImage.addEventListener("click", handleImageClick);
          
          if (videoOverlay) {
            videoOverlay.removeEventListener("click", handleOverlayClick);
            videoOverlay.addEventListener("click", handleOverlayClick);
          }
          
          if (soundToggle) {
            soundToggle.removeEventListener("click", handleSoundToggle);
            soundToggle.addEventListener("click", handleSoundToggle);
          }
          
          // Monitor play/pause to update overlay
          aboutVideo.removeEventListener("play", updateOverlay);
          aboutVideo.addEventListener("play", updateOverlay);
          
          aboutVideo.removeEventListener("pause", updateOverlay);
          aboutVideo.addEventListener("pause", updateOverlay);
          
        } else if (!entry.isIntersecting && aboutVideo) {
          // When leaving section, pause video
          if (!aboutVideo.paused) {
            aboutVideo.pause();
          }
        }
      });
    },
    { threshold: 0.3 }
  );
  
  aboutObserver.observe(aboutSection);
}

const sections = Array.from(document.querySelectorAll("section[id]"));
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      if (!id) return;
      const link = navLinks.find((nav) => nav.getAttribute("href") === `#${id}`);
      if (entry.isIntersecting) {
        entry.target.classList.add("section-active");
        navLinks.forEach((nav) => nav.classList.remove("active"));
        if (link) link.classList.add("active");
      } else {
        entry.target.classList.remove("section-active");
      }
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => sectionObserver.observe(section));

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    const emailInput = contactForm.querySelector('input[name="email"]');
    const subjectInput = contactForm.querySelector('input[name="subject"]');
    const messageInput = contactForm.querySelector('textarea[name="message"]');

    const countWords = (value) => value.trim().split(/\s+/).filter(Boolean).length;

    emailInput.setCustomValidity("");
    subjectInput.setCustomValidity("");
    messageInput.setCustomValidity("");

    if (!emailInput.value.trim().toLowerCase().endsWith("@gmail.com")) {
      emailInput.setCustomValidity("Email must end with @gmail.com.");
    }

    if (countWords(subjectInput.value) > 7) {
      subjectInput.setCustomValidity("Subject must be at most 7 words.");
    }

    if (countWords(messageInput.value) > 15) {
      messageInput.setCustomValidity("Message must be at most 15 words.");
    }

    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactForm.reportValidity();
    }
  });
}
