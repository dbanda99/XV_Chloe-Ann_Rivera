(function () {
  const params = new URLSearchParams(window.location.search);
  const guestId = (params.get("guest") || params.get("id") || "").trim();
  const guestName = document.getElementById("guestName");
  const status = document.getElementById("status");
  const backLink = document.getElementById("backLink");
  const buttons = Array.from(document.querySelectorAll("[data-action]"));

  if (guestId) {
    backLink.href = "index.html?guest=" + encodeURIComponent(guestId);
  }

  function setBusy(isBusy) {
    buttons.forEach((button) => {
      button.disabled = isBusy;
    });
  }

  function guestApi(query) {
    return new Promise((resolve, reject) => {
      if (!window.GUEST_API_URL) {
        reject(new Error("Missing GUEST_API_URL in guest-api-config.js"));
        return;
      }

      const callbackName = "rsvpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      const separator = window.GUEST_API_URL.includes("?") ? "&" : "?";
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("The RSVP request timed out. Please try again."));
      }, 12000);

      function cleanup() {
        window.clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("Could not reach the RSVP service. Please try again."));
      };

      script.src = window.GUEST_API_URL + separator + query + "&callback=" + encodeURIComponent(callbackName);
      document.body.appendChild(script);
    });
  }

  function showError(message) {
    status.textContent = message;
  }

  function updateGuest(data) {
    if (data && data.nvInvitadoNombre) {
      guestName.textContent = data.nvInvitadoNombre;
      return;
    }

    guestName.textContent = "Invitation guest";
  }

  async function loadGuest() {
    if (!guestId) {
      guestName.textContent = "Missing guest id";
      showError("Please open this page from your invitation link.");
      setBusy(true);
      return;
    }

    try {
      const data = await guestApi("guest=" + encodeURIComponent(guestId));
      updateGuest(data);
    } catch (error) {
      guestName.textContent = "Invitation guest";
      showError(error.message);
    }
  }

  async function submitRsvp(action) {
    if (!guestId) return;

    setBusy(true);
    status.textContent = "Saving RSVP...";

    try {
      const data = await guestApi(
        "guest=" + encodeURIComponent(guestId) + "&action=" + encodeURIComponent(action)
      );
      updateGuest(data);
      status.textContent = action === "confirm"
        ? "Thank you. Your RSVP is confirmed."
        : "Thank you. Your response has been saved.";
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false);
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => submitRsvp(button.dataset.action));
  });

  loadGuest();
})();
