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

  function t(value) {
    return window.XV_I18N ? window.XV_I18N.t(value) : value;
  }

  function setBusy(isBusy) {
    buttons.forEach((button) => {
      button.disabled = isBusy;
    });
  }

  function guestApi(query) {
    return new Promise((resolve, reject) => {
      if (!window.GUEST_API_URL) {
        reject(new Error(t("Missing GUEST_API_URL in guest-api-config.js")));
        return;
      }

      const callbackName = "rsvpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      const separator = window.GUEST_API_URL.includes("?") ? "&" : "?";
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error(t("The RSVP request timed out. Please try again.")));
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
        reject(new Error(t("Could not reach the RSVP service. Please try again.")));
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

    guestName.textContent = t("Invitation guest");
  }

  async function loadGuest() {
    if (!guestId) {
      guestName.textContent = t("Missing guest id");
      showError(t("Please open this page from your invitation link."));
      setBusy(true);
      return;
    }

    try {
      const data = await guestApi("guest=" + encodeURIComponent(guestId));
      updateGuest(data);
    } catch (error) {
      guestName.textContent = t("Invitation guest");
      showError(error.message);
    }
  }

  async function submitRsvp(action) {
    if (!guestId) return;

    setBusy(true);
    status.textContent = t("Saving RSVP...");

    try {
      const data = await guestApi(
        "guest=" + encodeURIComponent(guestId) + "&action=" + encodeURIComponent(action)
      );
      updateGuest(data);
      status.textContent = action === "confirm"
        ? t("Thank you. Your RSVP is confirmed.")
        : t("Thank you. Your response has been saved.");
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(false);
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => submitRsvp(button.dataset.action));
  });

  window.addEventListener("xv-language-change", () => {
    if (!guestName.textContent || guestName.textContent === "Invitation guest" || guestName.textContent === "Invitado") {
      guestName.textContent = t("Invitation guest");
    }
  });

  loadGuest();
})();
