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
  
  let videoPlayed = false;

  // Function to fully reset video element
  function resetVideoElement() {
    // Stop all playback
    aboutVideo.pause();
    aboutVideo.currentTime = 0;
    
    // Reset all properties
    aboutVideo.muted = true;
    aboutVideo.volume = 1;
    aboutVideo.playbackRate = 1;
    
    // Remove all event listeners to clear state
    const newVideo = aboutVideo.cloneNode(true);
    aboutVideo.parentNode.replaceChild(newVideo, aboutVideo);
    
    // Update reference if needed (though we'll use the old variable)
    return newVideo;
  }

  // Function to reset UI state
  function resetUIState() {
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    aboutImage.style.pointerEvents = "auto";
    aboutVideo.style.display = "none";
    aboutVideo.classList.remove("play");
    if (videoOverlay) videoOverlay.classList.remove("hidden");
    videoPlayed = false;
    updateSoundIcon();
  }
  
  // Function to play the video animation sequence
  function playVideoAnimation() {
    // Show image
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    aboutImage.style.pointerEvents = "auto";
    aboutVideo.style.display = "none";
    aboutVideo.classList.remove("play");
    
    // After 1 second, fade out image and play video
    setTimeout(() => {
      aboutImage.classList.add("fade-out");
      setTimeout(() => {
        // Reset video BEFORE making it visible
        aboutVideo.currentTime = 0;
        aboutVideo.muted = true;  // CRITICAL: Must be muted FIRST
        aboutVideo.volume = 1;
        aboutVideo.playbackRate = 1;
        
        // Make video display block
        aboutImage.style.display = "none";
        aboutVideo.style.display = "block";
        aboutVideo.classList.add("play");
        
        // Force browser reflow to ensure element is rendered
        aboutVideo.offsetHeight;
        
        // Give browser time to render, then play
        setTimeout(() => {
          // CRITICAL: Set muted again right before play
          aboutVideo.muted = true;
          const playPromise = aboutVideo.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video autoplay successful");
                // Hide overlay when video plays
                if (videoOverlay) videoOverlay.classList.add("hidden");
                videoPlayed = true;
                // Unmute after play starts successfully
                setTimeout(() => {
                  aboutVideo.muted = false;
                  updateSoundIcon();
                }, 100);
              })
              .catch(err => {
                console.log("Autoplay blocked, attempting muted play");
                // Ensure muted and try again
                aboutVideo.muted = true;
                aboutVideo.play().catch(e => console.log("Play error:", e));
                if (videoOverlay) videoOverlay.classList.add("hidden");
                videoPlayed = true;
                updateSoundIcon();
              });
          }
        }, 50);
      }, 1000);
    }, 1000);
  }
  
  // Handle video end event
  function handleVideoEnd() {
    // Show image again when video ends
    aboutVideo.style.display = "none";
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
    if (videoOverlay) videoOverlay.classList.remove("hidden");
  }
  
  // Handle image click to replay with sound
  function handleImageClick() {
    // If image is visible (not faded out), restart animation with sound
    if (aboutImage.classList.contains("fade-out") === false) {
      aboutImage.classList.add("fade-out");
      // Play video with sound on replay
      aboutVideo.currentTime = 0;
      aboutVideo.muted = false;  // Unmute for replay
      aboutVideo.style.display = "block";
      aboutVideo.classList.add("play");
      aboutVideo.play().catch(e => console.error("Play failed:", e));
      if (videoOverlay) videoOverlay.classList.add("hidden");
      updateSoundIcon();
    }
  }
  
  // Handle video click to pause/resume
  function togglePlayPause() {
    if (aboutVideo.paused) {
      aboutVideo.muted = false;
      updateSoundIcon();
      aboutVideo.play();
      if (videoOverlay) videoOverlay.classList.add("hidden");
    } else {
      aboutVideo.pause();
      if (videoOverlay) videoOverlay.classList.remove("hidden");
    }
  }
  
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && aboutImage && aboutVideo) {
          // When entering about section
          if (!videoPlayed) {
            // First time entering - play animation
            playVideoAnimation();
          } else {
            // Re-entering section - reset and prepare for replay
            resetUIState();
          }
          
          // Add event listeners
          aboutVideo.removeEventListener("ended", handleVideoEnd);
          aboutVideo.addEventListener("ended", handleVideoEnd);
          
          aboutVideo.removeEventListener("click", togglePlayPause);
          aboutVideo.addEventListener("click", togglePlayPause);
          
          aboutImage.removeEventListener("click", handleImageClick);
          aboutImage.addEventListener("click", handleImageClick);
          
          // Add sound toggle handler
          if (soundToggle) {
            soundToggle.removeEventListener("click", handleSoundToggle);
            soundToggle.addEventListener("click", handleSoundToggle);
          }
        } else if (!entry.isIntersecting && aboutVideo && videoPlayed) {
          // When leaving about section - pause video
          if (!aboutVideo.paused) {
            aboutVideo.pause();
          }
        }
      });
    },
    { threshold: 0.3 }
  );
  
  aboutObserver.observe(aboutSection);
  
  // Sound toggle handler
  function handleSoundToggle(e) {
    e.stopPropagation();
    toggleSound();
  }
  
  // Sound toggle function
  function toggleSound() {
    aboutVideo.muted = !aboutVideo.muted;
    updateSoundIcon();
  }
  
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
