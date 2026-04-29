(function () {
  const params = new URLSearchParams(window.location.search);
  const guestId = (params.get("guest") || params.get("id") || "").trim();

  if (!guestId) return;

  const rsvpUrl = new URL("rsvp.html", window.location.href);
  rsvpUrl.search = "?guest=" + encodeURIComponent(guestId);
  const href = rsvpUrl.href;
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data="
    + encodeURIComponent(href);
  const fallbackQrUrl = "https://quickchart.io/qr?size=180&margin=2&text=" + encodeURIComponent(href);
  let guestRecord = null;
  let mountScheduled = false;
  const styles = document.createElement("style");
  styles.textContent = `
    .simple-rsvp-panel {
      display: grid;
      justify-items: center;
      gap: 14px;
      width: 100%;
      margin: 10px auto 0;
    }

    .simple-rsvp-repair {
      display: grid;
      justify-items: center;
      gap: 10px;
      width: 100%;
      margin: 16px auto 0;
      color: #9b746d;
      text-align: center;
    }

    .simple-rsvp-pass-number {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 64px;
      line-height: 0.9;
    }

    .simple-rsvp-pass-label,
    .simple-rsvp-table-label {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 18px;
      line-height: 1.1;
    }

    .simple-rsvp-table-number {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 44px;
      line-height: 1;
    }

    .simple-rsvp-qr {
      display: block;
      width: 180px;
      height: 180px;
      padding: 0;
      background: #fff;
      box-shadow: 0 8px 22px rgba(45, 37, 39, 0.12);
    }

    .simple-rsvp-qr img {
      display: block;
      width: 180px;
      height: 180px;
    }

    .simple-rsvp-link,
    .simple-rsvp-inline {
      align-items: center;
      justify-content: center;
      min-height: 50px;
      padding: 12px 20px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 6px;
      background: #734251;
      color: #fff;
      box-shadow: 0 16px 40px rgba(45, 37, 39, 0.28);
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-decoration: none;
    }

    .simple-rsvp-inline {
      display: flex;
      width: min(84%, 280px);
      margin: 0 auto;
    }

    .simple-rsvp-inline:focus-visible,
    .simple-rsvp-qr:focus-visible {
      outline: 3px solid #fff;
      outline-offset: 3px;
    }
  `;

  document.head.appendChild(styles);

  function t(value) {
    return window.XV_I18N ? window.XV_I18N.t(value) : value;
  }

  function currentLanguage() {
    return window.XV_I18N ? window.XV_I18N.getLanguage() : "en";
  }

  function createLink(className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = t("RSVP");
    return link;
  }

  function createQrPanel(includePasses) {
    const panel = document.createElement("div");
    const qrLink = document.createElement("a");
    const qrImage = document.createElement("img");

    panel.className = includePasses ? "simple-rsvp-panel simple-rsvp-repair" : "simple-rsvp-panel";

    if (includePasses && guestRecord) {
      const passNumber = document.createElement("div");
      const passLabel = document.createElement("div");

      passNumber.className = "simple-rsvp-pass-number";
      passNumber.textContent = String(guestRecord.inInvitadoPases || "");
      passLabel.className = "simple-rsvp-pass-label";
      passLabel.textContent = t(Number(guestRecord.inInvitadoPases || 0) === 1 ? "Pass" : "Passes");

      panel.appendChild(passNumber);
      panel.appendChild(passLabel);
    }

    qrLink.className = "simple-rsvp-qr";
    qrLink.href = href;
    qrLink.setAttribute("aria-label", t("Open RSVP page"));
    qrImage.src = qrUrl;
    qrImage.alt = "RSVP QR code";
    qrImage.width = 180;
    qrImage.height = 180;
    qrImage.onerror = () => {
      if (qrImage.src !== fallbackQrUrl) {
        qrImage.src = fallbackQrUrl;
      }
    };

    qrLink.appendChild(qrImage);
    panel.appendChild(qrLink);
    panel.appendChild(createLink("simple-rsvp-inline"));

    if (includePasses && guestRecord && guestRecord.nvInvitadoMesa) {
      const tableLabel = document.createElement("div");
      const tableNumber = document.createElement("div");

      tableLabel.className = "simple-rsvp-table-label";
      tableLabel.textContent = t("Table No.");
      tableNumber.className = "simple-rsvp-table-number";
      tableNumber.textContent = String(guestRecord.nvInvitadoMesa);

      panel.appendChild(tableLabel);
      panel.appendChild(tableNumber);
    }

    return panel;
  }

  function removeOldInline() {
    document.querySelectorAll(".simple-rsvp-inline, .simple-rsvp-panel").forEach((element) => {
      element.remove();
    });
  }

  function pruneDuplicatePanels() {
    const panels = Array.from(document.querySelectorAll(".simple-rsvp-panel"));
    panels.slice(1).forEach((panel) => panel.remove());

    const activePanels = Array.from(document.querySelectorAll(".simple-rsvp-panel"));
    const nativeQrBlocks = document.querySelectorAll("#Qr qrcodecomponent, #Qr QRCodeComponent");
    if (activePanels.length > 0) {
      nativeQrBlocks.forEach((nativeQr) => {
        nativeQr.style.display = "none";
      });
      hideNativeConfirmButtons();
    }
  }

  function hideNativeConfirmButtons() {
    const labels = new Set([
      "confirm attendance",
      "confirmar asistencia",
      "rsvp"
    ]);
    const candidates = Array.from(document.querySelectorAll("button, a, [role='button'], div"));

    candidates.forEach((candidate) => {
      if (candidate.closest(".simple-rsvp-panel")) return;
      if (candidate.closest(".xv-language-toggle")) return;

      const text = (candidate.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!labels.has(text)) return;

      const buttonLike = candidate.closest("button, a, [role='button']") || candidate;
      if (!buttonLike.closest(".simple-rsvp-panel")) {
        buttonLike.style.setProperty("display", "none", "important");
      }
    });
  }

  function findTextElement(expectedText) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if ((node.nodeValue || "").replace(/\s+/g, " ").trim().toLowerCase() === expectedText) {
        return node.parentElement;
      }

      node = walker.nextNode();
    }

    return null;
  }

  function findGuestNameElement() {
    if (!guestRecord || !guestRecord.nvInvitadoNombre) return null;

    const expectedName = String(guestRecord.nvInvitadoNombre).replace(/\s+/g, " ").trim().toLowerCase();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const text = (node.nodeValue || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (text === expectedName) return node.parentElement;
      node = walker.nextNode();
    }

    return null;
  }

  function guestApi(query) {
    return new Promise((resolve, reject) => {
      if (!window.GUEST_API_URL) {
        reject(new Error("Missing GUEST_API_URL"));
        return;
      }

      const callbackName = "simpleRsvpCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
      const script = document.createElement("script");
      const separator = window.GUEST_API_URL.includes("?") ? "&" : "?";
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("Guest API timed out"));
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
        reject(new Error("Guest API request failed"));
      };

      script.src = window.GUEST_API_URL + separator + query + "&callback=" + encodeURIComponent(callbackName);
      document.body.appendChild(script);
    });
  }

  function mountButton(attempt) {
    const passesLabel = findTextElement("passes") || findTextElement("pass") || findTextElement("pases");
    const confirmTarget = findTextElement("confirm attendance") || findTextElement("rsvp") || findTextElement("confirmar asistencia");
    const guestNameElement = findGuestNameElement();

    if (passesLabel && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      const panel = createQrPanel(false);

      passesLabel.insertAdjacentElement("afterend", panel);
      hideNativeConfirmButtons();
      pruneDuplicatePanels();
      return;
    }

    if (guestNameElement && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      guestNameElement.insertAdjacentElement("afterend", createQrPanel(true));
      pruneDuplicatePanels();
      return;
    }

    const qrSection = document.getElementById("Qr");

    if (qrSection && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      const firstCanvas = qrSection.querySelector("canvas");
      const panel = createQrPanel(false);

      if (firstCanvas && firstCanvas.parentElement) {
        firstCanvas.parentElement.insertAdjacentElement("afterend", panel);
      } else {
        qrSection.appendChild(panel);
      }
      pruneDuplicatePanels();
      return;
    }

    if (attempt < 60) {
      window.setTimeout(() => mountButton(attempt + 1), 250);
    }
  }

  function watchForQrSection() {
    let observer;
    function scheduleMount() {
      if (mountScheduled) return;
      mountScheduled = true;

      window.requestAnimationFrame(() => {
        mountScheduled = false;
        mountButton(0);
        pruneDuplicatePanels();

        if (document.querySelector(".simple-rsvp-panel") && observer) {
          window.setTimeout(() => observer.disconnect(), 1000);
        }
      });
    }

    observer = new MutationObserver(() => {
      if (findTextElement("passes") || findTextElement("pass") || findTextElement("pases") || findGuestNameElement() || document.getElementById("Qr")) {
        scheduleMount();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => observer.disconnect(), 8000);
  }

  async function start() {
    try {
      guestRecord = await guestApi("guest=" + encodeURIComponent(guestId));
    } catch (error) {
      guestRecord = null;
    }

    mountButton(0);
    watchForQrSection();

    window.setTimeout(() => {
      mountButton(0);
      pruneDuplicatePanels();
      hideNativeConfirmButtons();
    }, 1000);
    window.setTimeout(() => {
      mountButton(0);
      pruneDuplicatePanels();
      hideNativeConfirmButtons();
    }, 2500);
  }

  window.addEventListener("xv-language-change", () => {
    const existingPanel = document.querySelector(".simple-rsvp-panel");
    const includePasses = Boolean(existingPanel && existingPanel.classList.contains("simple-rsvp-repair"));
    if (!existingPanel) return;

    existingPanel.replaceWith(createQrPanel(includePasses));
    pruneDuplicatePanels();
  });

  if (document.readyState === "loading") {
    window.addEventListener("load", start);
  } else {
    start();
  }
})();
