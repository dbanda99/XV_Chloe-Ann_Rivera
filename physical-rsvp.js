(function () {
  const form = document.getElementById("physicalRsvpForm");
  const status = document.getElementById("physicalRsvpStatus");
  const submitButton = document.getElementById("submitPhysicalRsvp");

  function t(value) {
    return window.XV_I18N ? window.XV_I18N.t(value) : value;
  }

  function setBusy(isBusy) {
    if (submitButton) submitButton.disabled = isBusy;
  }

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  function guestApi(query) {
    return new Promise((resolve, reject) => {
      if (!window.GUEST_API_URL) {
        reject(new Error(t("Missing GUEST_API_URL in guest-api-config.js")));
        return;
      }

      const callbackName = "physicalRsvpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      const separator = window.GUEST_API_URL.includes("?") ? "&" : "?";
      const timeout = window.setTimeout(() => {
        cleanup(true);
        reject(new Error(t("The RSVP request timed out. Please try again.")));
      }, 30000);

      function cleanup(keepLateCallback) {
        window.clearTimeout(timeout);
        if (keepLateCallback) {
          window[callbackName] = () => {};
          window.setTimeout(() => {
            delete window[callbackName];
          }, 60000);
        } else {
          delete window[callbackName];
        }
        script.remove();
      }

      window[callbackName] = (data) => {
        cleanup(false);
        resolve(data);
      };

      script.onerror = () => {
        cleanup(false);
        reject(new Error(t("Could not reach the RSVP service. Please try again.")));
      };

      script.src = window.GUEST_API_URL + separator + query + "&callback=" + encodeURIComponent(callbackName);
      document.body.appendChild(script);
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const rsvpStatus = String(formData.get("rsvp_status") || "").trim();

    if (!firstName || !lastName || !rsvpStatus) {
      showStatus(t("Please complete all fields."));
      return;
    }

    setBusy(true);
    showStatus(t("Saving RSVP..."));

    try {
      const query = [
        "action=physicalRsvp",
        "first_name=" + encodeURIComponent(firstName),
        "last_name=" + encodeURIComponent(lastName),
        "rsvp_status=" + encodeURIComponent(rsvpStatus)
      ].join("&");
      const response = await guestApi(query);

      if (response && response.error) {
        throw new Error(response.error);
      }

      form.reset();
      showStatus(t("Thank you. Your response has been saved."));
    } catch (error) {
      showStatus(error.message);
    } finally {
      setBusy(false);
    }
  });
})();
