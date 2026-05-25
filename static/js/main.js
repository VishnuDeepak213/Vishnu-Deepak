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
  const soundToggle = document.getElementById("video-sound-toggle");
  const soundOffIcon = document.querySelector(".sound-off-icon");
  const soundOnIcon = document.querySelector(".sound-on-icon");
  
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
        aboutVideo.muted = true; // MUST be muted for Chrome autoplay
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
          const playPromise = aboutVideo.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video autoplay successful");
                // Unmute after play starts successfully
                setTimeout(() => {
                  aboutVideo.muted = false;
                  updateSoundIcon();
                }, 100);
              })
              .catch(err => {
                console.log("Autoplay not allowed, attempting muted play");
                // Try without unmuting
                aboutVideo.muted = true;
                aboutVideo.play().catch(e => console.log("Play error:", e));
                updateSoundIcon();
              });
          }
        }, 100);
      }, 1000);
    }, 1000);
  }
  
  // Handle video end event
  function handleVideoEnd() {
    // Show image again when video ends
    aboutVideo.style.display = "none";
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
  }
  
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && aboutImage && aboutVideo) {
          playVideoAnimation();
          
          // Add event listeners only once
          aboutVideo.removeEventListener("ended", handleVideoEnd);
          aboutVideo.addEventListener("ended", handleVideoEnd);
          
          aboutVideo.removeEventListener("click", togglePlayPause);
          aboutVideo.addEventListener("click", togglePlayPause);
          
          aboutImage.removeEventListener("click", playVideoAnimation);
          aboutImage.addEventListener("click", playVideoAnimation);
          
          // Add sound toggle handler
          if (soundToggle) {
            soundToggle.removeEventListener("click", handleSoundToggle);
            soundToggle.addEventListener("click", handleSoundToggle);
          }
          
          aboutObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  
  aboutObserver.observe(aboutSection);
  
  // Play/Pause toggle function
  function togglePlayPause() {
    if (aboutVideo.paused) {
      aboutVideo.play();
    } else {
      aboutVideo.pause();
    }
  }
  
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
