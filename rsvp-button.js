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

  function createLink(className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = "RSVP";
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
      passLabel.textContent = "Pases";

      panel.appendChild(passNumber);
      panel.appendChild(passLabel);
    }

    qrLink.className = "simple-rsvp-qr";
    qrLink.href = href;
    qrLink.setAttribute("aria-label", "Open RSVP page");
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
      tableLabel.textContent = "No. Mesa";
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
    const passesLabel = findTextElement("pases");
    const confirmTarget = findTextElement("confirmar asistencia");
    const guestNameElement = findGuestNameElement();

    if (passesLabel && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      const panel = createQrPanel(false);

      passesLabel.insertAdjacentElement("afterend", panel);
      if (confirmTarget) {
        const confirmButton = confirmTarget.closest("button, a, [role='button']");
        if (confirmButton && !confirmButton.closest(".simple-rsvp-panel")) {
          confirmButton.style.display = "none";
        }
      }
      return;
    }

    if (guestNameElement && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      guestNameElement.insertAdjacentElement("afterend", createQrPanel(true));
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
      return;
    }

    if (attempt < 60) {
      window.setTimeout(() => mountButton(attempt + 1), 250);
    }
  }

  function watchForQrSection() {
    const observer = new MutationObserver(() => {
      if (findTextElement("pases") || findGuestNameElement() || document.getElementById("Qr")) {
        mountButton(0);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => observer.disconnect(), 20000);
  }

  async function start() {
    try {
      guestRecord = await guestApi("guest=" + encodeURIComponent(guestId));
    } catch (error) {
      guestRecord = null;
    }

    mountButton(0);
    watchForQrSection();

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      mountButton(0);

      if (document.querySelector(".simple-rsvp-panel") || attempts >= 40) {
        window.clearInterval(interval);
      }
    }, 500);
  }

  if (document.readyState === "loading") {
    window.addEventListener("load", start);
  } else {
    start();
  }
})();
