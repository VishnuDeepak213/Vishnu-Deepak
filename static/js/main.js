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

  // Function to reset video to initial state (no auto-play)
  function resetVideoState() {
    aboutVideo.pause();
    aboutVideo.currentTime = 0;
    aboutVideo.muted = true;
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
    aboutImage.style.opacity = "1";
    aboutImage.style.pointerEvents = "auto";
    aboutVideo.style.display = "none";
    aboutVideo.classList.remove("play");
    if (videoOverlay) videoOverlay.classList.remove("hidden");
    updateSoundIcon();
  }
  
  // Function to play the video animation sequence (FIRST TIME ONLY - AUTO PLAY)
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
        aboutVideo.muted = true;
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
          aboutVideo.muted = true;
          const playPromise = aboutVideo.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Video autoplay successful");
                if (videoOverlay) videoOverlay.classList.add("hidden");
                setTimeout(() => {
                  aboutVideo.muted = false;
                  updateSoundIcon();
                }, 100);
              })
              .catch(err => {
                console.log("Autoplay blocked");
                aboutVideo.muted = true;
                aboutVideo.play().catch(e => console.log("Play error:", e));
                if (videoOverlay) videoOverlay.classList.add("hidden");
                updateSoundIcon();
              });
          }
        }, 50);
      }, 1000);
    }, 1000);
  }
  
  // Handle video end event
  function handleVideoEnd() {
    aboutVideo.style.display = "none";
    aboutImage.style.display = "block";
    aboutImage.classList.remove("fade-out");
    if (videoOverlay) videoOverlay.classList.remove("hidden");
  }
  
  // Handle image click to play with sound
  function handleImageClick() {
    if (aboutImage.classList.contains("fade-out") === false) {
      aboutImage.classList.add("fade-out");
      aboutImage.style.display = "none";
      aboutVideo.muted = false;
      aboutVideo.currentTime = 0;
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
  
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && aboutImage && aboutVideo) {
          if (firstTimeEntry) {
            playVideoAnimation();
            firstTimeEntry = false;
          } else {
            resetVideoState();
          }
          
          aboutVideo.removeEventListener("ended", handleVideoEnd);
          aboutVideo.addEventListener("ended", handleVideoEnd);
          
          aboutVideo.removeEventListener("click", togglePlayPause);
          aboutVideo.addEventListener("click", togglePlayPause);
          
          aboutImage.removeEventListener("click", handleImageClick);
          aboutImage.addEventListener("click", handleImageClick);
          
          if (soundToggle) {
            soundToggle.removeEventListener("click", handleSoundToggle);
            soundToggle.addEventListener("click", handleSoundToggle);
          }
        } else if (!entry.isIntersecting && aboutVideo) {
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
