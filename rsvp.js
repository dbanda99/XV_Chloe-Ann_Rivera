(function () {
  const params = new URLSearchParams(window.location.search);
  const guestId = (params.get("guest") || params.get("id") || "").trim();
  const guestName = document.getElementById("guestName");
  const status = document.getElementById("status");
  const backLink = document.getElementById("backLink");
  const buttons = Array.from(document.querySelectorAll("[data-action]"));
  const attendanceModal = document.getElementById("attendanceModal");
  const attendanceCount = document.getElementById("attendanceCount");
  const attendanceCancel = document.getElementById("attendanceCancel");
  const attendanceConfirm = document.getElementById("attendanceConfirm");
  const attendanceLabel = document.getElementById("attendanceLabel");
  let guestRecord = null;
  let availablePasses = 1;

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
    if (attendanceCancel) attendanceCancel.disabled = isBusy;
    if (attendanceConfirm) attendanceConfirm.disabled = isBusy;
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
    guestRecord = data || null;
    availablePasses = Math.max(1, Number(data && data.inInvitadoPases ? data.inInvitadoPases : 1));

    if (data && data.nvInvitadoNombre) {
      guestName.textContent = data.nvInvitadoNombre;
      return;
    }

    guestName.textContent = t("Invitation guest");
  }

  function fillAttendanceOptions() {
    if (!attendanceCount) return;

    attendanceCount.innerHTML = "";
    for (let count = 1; count <= availablePasses; count += 1) {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = String(count);
      attendanceCount.appendChild(option);
    }
  }

  function openAttendanceModal() {
    if (!attendanceModal) return;

    fillAttendanceOptions();
    if (attendanceLabel) attendanceLabel.textContent = t("How many passes will you use?");
    if (attendanceCancel) attendanceCancel.textContent = t("Cancel");
    if (attendanceConfirm) attendanceConfirm.textContent = t("Confirm");
    attendanceModal.classList.add("is-open");
    window.setTimeout(() => attendanceCount && attendanceCount.focus(), 0);
  }

  function closeAttendanceModal() {
    if (!attendanceModal) return;

    attendanceModal.classList.remove("is-open");
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

  async function submitRsvp(action, guestsAttending) {
    if (!guestId) return;

    setBusy(true);
    status.textContent = t("Saving RSVP...");

    try {
      let query = "guest=" + encodeURIComponent(guestId) + "&action=" + encodeURIComponent(action);
      if (typeof guestsAttending === "number") {
        const encodedCount = encodeURIComponent(String(guestsAttending));
        query += "&guestsAttending=" + encodedCount + "&guests_attending=" + encodedCount;
      }

      const data = await guestApi(query);
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
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "confirm" && availablePasses > 1) {
        openAttendanceModal();
        return;
      }

      submitRsvp(action, action === "confirm" ? 1 : 0);
    });
  });

  if (attendanceCancel) {
    attendanceCancel.addEventListener("click", closeAttendanceModal);
  }

  if (attendanceConfirm) {
    attendanceConfirm.addEventListener("click", () => {
      const selectedCount = Math.max(1, Number(attendanceCount && attendanceCount.value ? attendanceCount.value : 1));
      closeAttendanceModal();
      submitRsvp("confirm", selectedCount);
    });
  }

  if (attendanceModal) {
    attendanceModal.addEventListener("click", (event) => {
      if (event.target === attendanceModal) closeAttendanceModal();
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAttendanceModal();
  });

  window.addEventListener("xv-language-change", () => {
    if (!guestName.textContent || guestName.textContent === "Invitation guest" || guestName.textContent === "Invitado") {
      guestName.textContent = t("Invitation guest");
    }
    if (attendanceLabel) attendanceLabel.textContent = t("How many passes will you use?");
    if (attendanceCancel) attendanceCancel.textContent = t("Cancel");
    if (attendanceConfirm) attendanceConfirm.textContent = t("Confirm");
  });

  loadGuest();
})();
