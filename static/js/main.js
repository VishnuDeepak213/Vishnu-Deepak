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
  
  // Reset to initial state with image, NO overlay (2nd entry)
  function resetVideoState() {
    aboutVideo.pause();
    aboutVideo.currentTime = 0;
    aboutVideo.muted = true;
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    aboutImage.style.pointerEvents = "auto";
    aboutImage.style.zIndex = "2";
    aboutVideo.style.zIndex = "1";
    if (videoOverlay) videoOverlay.classList.add("hidden");
    updateSoundIcon();
  }
  
  // Auto-play animation (FIRST TIME ONLY)
  function playVideoAnimation() {
    // Show image for 1 second with NO overlay
    if (videoOverlay) videoOverlay.classList.add("hidden");
    
    setTimeout(() => {
      // Fade out image, show video
      aboutImage.classList.add("fade-out");
      aboutImage.style.pointerEvents = "none";
      aboutImage.style.zIndex = "0";
      
      setTimeout(() => {
        aboutVideo.muted = true;
        aboutVideo.currentTime = 0;
        aboutVideo.style.zIndex = "3";
        const playPromise = aboutVideo.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video is playing, show overlay so user knows they can click to pause
              if (videoOverlay) videoOverlay.classList.remove("hidden");
              
              // Unmute after 100ms
              setTimeout(() => {
                aboutVideo.muted = false;
                updateSoundIcon();
              }, 100);
            })
            .catch(() => {
              // Autoplay failed, show overlay
              if (videoOverlay) videoOverlay.classList.remove("hidden");
            });
        }
      }, 500);
    }, 1000);
  }
  
  // Handle video end event - show image and overlay
  function handleVideoEnd() {
    aboutVideo.pause();
    aboutVideo.currentTime = 0;
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    aboutImage.style.pointerEvents = "auto";
    aboutImage.style.zIndex = "2";
    aboutVideo.style.zIndex = "1";
    if (videoOverlay) videoOverlay.classList.remove("hidden");
    aboutVideo.muted = true;
    updateSoundIcon();
  }
  
  // Handle image click to play with sound
  function handleImageClick() {
    // Only play if image is visible (not faded out)
    if (!aboutImage.classList.contains("fade-out")) {
      aboutImage.classList.add("fade-out");
      aboutImage.style.pointerEvents = "none";
      aboutImage.style.zIndex = "0";
      
      // Reset and prepare video
      aboutVideo.muted = false;
      aboutVideo.currentTime = 0;
      aboutVideo.style.zIndex = "3";
      
      // Wait for image to fade before playing
      setTimeout(() => {
        const playPromise = aboutVideo.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (videoOverlay) videoOverlay.classList.add("hidden");
              updateSoundIcon();
            })
            .catch(e => console.error("Play failed:", e));
        }
      }, 100);
    }
  }
  
  // Handle overlay click to play
  function handleOverlayClick() {
    if (videoOverlay && !videoOverlay.classList.contains("hidden")) {
      aboutVideo.muted = false;
      aboutVideo.currentTime = 0;
      aboutVideo.style.zIndex = "3";
      
      const playPromise = aboutVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (videoOverlay) videoOverlay.classList.add("hidden");
            updateSoundIcon();
          })
          .catch(e => console.error("Play failed:", e));
      }
    }
  }
  
  // Handle video click to pause/resume
  function togglePlayPause() {
    if (aboutVideo.paused) {
      aboutVideo.play();
      if (videoOverlay) videoOverlay.classList.add("hidden");
    } else {
      aboutVideo.pause();
      if (videoOverlay) videoOverlay.classList.remove("hidden");
    }
  }
  
  // Sound toggle handler
  function handleSoundToggle(e) {
    e.stopPropagation();
    aboutVideo.muted = !aboutVideo.muted;
    updateSoundIcon();
  }
  
  // Set up intersection observer - KEEPS WATCHING (doesn't unobserve)
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && aboutImage && aboutVideo) {
          // First time entering: auto-play
          if (firstTimeEntry) {
            playVideoAnimation();
            firstTimeEntry = false;
          } else {
            // Subsequent entries: show image, NO overlay, no auto-play
            resetVideoState();
          }
          
          // Ensure event listeners are set up
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
