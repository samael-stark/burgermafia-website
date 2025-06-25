document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("myNavbar");
  const timeElement = document.querySelector(".time");
  const loadingOverlay = document.getElementById("loading-overlay"); // Get the loading overlay element

  let stickyOffset; // This will be calculated after the loading screen is gone

  // Function to update the current time
  function updateCurrentTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const formattedTime = now.toLocaleTimeString(undefined, options);
    if (timeElement) {
      timeElement.textContent = formattedTime;
    }
  }

  // --- Loading Screen Logic ---
  const minimumDisplayTime = 1000; // 1 second as requested
  let pageLoaded = false; // Flag for window.load event
  let minimumTimeElapsed = false; // Flag for minimum timeout

  // This function hides the loading overlay if both conditions are met
  function hideLoadingOverlay() {
    if (pageLoaded && minimumTimeElapsed) {
      if (loadingOverlay) {
        loadingOverlay.classList.add("hidden"); // Start fade-out
        // Ensure display: none happens after CSS transition completes (0.5s from CSS)
        setTimeout(() => {
          loadingOverlay.style.display = "none";
        }, 500);
      }
      // Initialize main website features ONLY after loading is complete
      // A small additional delay here helps ensure the DOM has settled after the overlay is removed.
      setTimeout(() => {
        initializeWebsiteFeatures();
      }, 100);
    }
  }

  // Set minimum time elapsed flag after the specified duration
  setTimeout(() => {
    minimumTimeElapsed = true;
    hideLoadingOverlay(); // Check if page is also loaded
  }, minimumDisplayTime);

  // Set page loaded flag when all resources (images, etc.) are loaded
  window.addEventListener("load", () => {
    pageLoaded = true;
    hideLoadingOverlay(); // Check if minimum time has also elapsed
  });

  // Function to initialize all other website features (called after loading screen hides)
  function initializeWebsiteFeatures() {
    // IMPORTANT: Calculate stickyOffset and initialize sticky navbar ONLY
    // after the loading overlay is hidden and the navbar is in its final DOM position.
    stickyOffset = navbar.offsetTop;
    handleStickyNavbar(); // Initialize sticky navbar state

    // Initialize time updates
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Initialize navigation observers (for active link highlighting on main content)
    initializeNavObservers();
  }

  // --- Sticky Navbar Logic ---
  function handleStickyNavbar() {
    if (window.pageYOffset >= stickyOffset) {
      navbar.classList.add("fixed-nav");
      document.body.style.paddingTop = navbar.offsetHeight + "px";
    } else {
      navbar.classList.remove("fixed-nav");
      document.body.style.paddingTop = "0";
    }
  }

  window.addEventListener("scroll", handleStickyNavbar);
  window.addEventListener("resize", () => {
    // On resize, remove fixed state, recalculate offset, then re-apply sticky
    navbar.classList.remove("fixed-nav");
    document.body.style.paddingTop = "0";
    stickyOffset = navbar.offsetTop; // Recalculate on resize for accuracy
    handleStickyNavbar();
  });

  // --- Navigation Link Logic (Active on Click/Scroll) ---
  function initializeNavObservers() {
    const navLinks = document.querySelectorAll(
      ".navlistoption a, .navlistoptionm a"
    );
    const sections = document.querySelectorAll(
      '[id^="mealid"], [id^="burgerid"], [id^="sideid"], [id^="cheesecakeid"], [id^="drinkid"], [id^="sauceid"]'
    );

    function removeAllActiveLinks() {
      navLinks.forEach((link) => {
        link.classList.remove("active-link");
        link.removeAttribute("aria-current");
      });
    }

    function setActiveLink(linkElement) {
      removeAllActiveLinks();
      if (linkElement) {
        linkElement.classList.add("active-link");
        linkElement.setAttribute("aria-current", "page");
      }
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const offset = navbar.offsetHeight;
          const scrollPosition = targetElement.offsetTop - offset;

          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });

          setActiveLink(this);

          if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
          } else {
            location.hash = `#${targetId}`;
          }
        }
      });
    });

    const observerOptions = {
      root: null,
      rootMargin: `-${navbar.offsetHeight + 5}px 0px -50% 0px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const correspondingLink = document.querySelector(
            `.navlistoption a[href="#${id}"], .navlistoptionm a[href="#${id}"]`
          );
          if (correspondingLink) {
            const currentActive = document.querySelector(
              ".navlistoption a.active-link, .navlistoptionm a.active-link"
            );
            if (
              !currentActive ||
              currentActive.getAttribute("href") !== `#${id}`
            ) {
              setActiveLink(correspondingLink);
            }
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    const currentHash = window.location.hash;
    if (currentHash) {
      const initialLink = document.querySelector(
        `.navlistoption a[href="${currentHash}"], .navlistoptionm a[href="${currentHash}"]`
      );
      if (initialLink) {
        setActiveLink(initialLink);
        const targetElement = document.getElementById(currentHash.substring(1));
        if (targetElement) {
          const offset = navbar.offsetHeight;
          window.scrollTo({
            top: targetElement.offsetTop - offset,
            behavior: "smooth",
          });
        }
      }
    }
  }
});
