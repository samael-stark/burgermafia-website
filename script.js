document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("myNavbar");
  const navLinks = document.querySelectorAll(
    ".navlistoption a, .navlistoptionm a"
  );
  const sections = document.querySelectorAll(
    '[id^="mealid"], [id^="burgerid"], [id^="sideid"], [id^="cheesecakeid"], [id^="drinkid"], [id^="sauceid"]'
  );
  const timeElement = document.querySelector(".time"); // Select the time element

  let stickyOffset = navbar.offsetTop;

  // Function to update the current time
  function updateCurrentTime() {
    const now = new Date();
    const options = {
      weekday: "long", // Full weekday name (e.g., "Wednesday")
      hour: "2-digit", // Two-digit hour (e.g., "05" or "17")
      minute: "2-digit", // Two-digit minute (e.g., "07" or "45")
      hour12: false, // Use 24-hour format
    };
    // Format the time using the user's locale
    const formattedTime = now.toLocaleTimeString(undefined, options);

    // Update the text content of the time element
    if (timeElement) {
      timeElement.textContent = formattedTime;
    }
  }

  // Call the function immediately to display time on load
  updateCurrentTime();
  // Update the time every minute (60,000 milliseconds) for less frequent updates
  // Or every second (1,000 milliseconds) for a live second display
  setInterval(updateCurrentTime, 1000); // Updates every second

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
    navbar.classList.remove("fixed-nav");
    document.body.style.paddingTop = "0";
    stickyOffset = navbar.offsetTop;
    handleStickyNavbar();
  });

  handleStickyNavbar();

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
});
