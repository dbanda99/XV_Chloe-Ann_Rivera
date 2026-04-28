(function () {
  const params = new URLSearchParams(window.location.search);
  const guestId = (params.get("guest") || params.get("id") || "").trim();

  if (!guestId) return;

  const rsvpUrl = new URL("rsvp.html", window.location.href);
  rsvpUrl.search = "?guest=" + encodeURIComponent(guestId);
  const href = rsvpUrl.href;
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data="
    + encodeURIComponent(href);
  const styles = document.createElement("style");
  styles.textContent = `
    #Qr qrcodecomponent,
    #Qr QRCodeComponent {
      display: none !important;
    }

    .simple-rsvp-panel {
      display: grid;
      justify-items: center;
      gap: 14px;
      width: 100%;
      margin: 10px auto 0;
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

    .simple-rsvp-link {
      position: fixed;
      left: 50%;
      bottom: 18px;
      z-index: 1200;
      transform: translateX(-50%);
      display: inline-flex;
      width: min(calc(100vw - 32px), 360px);
    }

    .simple-rsvp-inline {
      display: flex;
      width: min(84%, 280px);
      margin: 0 auto;
    }

    .simple-rsvp-link:focus-visible,
    .simple-rsvp-inline:focus-visible,
    .simple-rsvp-qr:focus-visible {
      outline: 3px solid #fff;
      outline-offset: 3px;
    }

    @media (min-width: 768px) {
      .simple-rsvp-link {
        right: 24px;
        left: auto;
        bottom: 24px;
        width: auto;
        transform: none;
      }
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

  function createQrPanel() {
    const panel = document.createElement("div");
    const qrLink = document.createElement("a");
    const qrImage = document.createElement("img");

    panel.className = "simple-rsvp-panel";
    qrLink.className = "simple-rsvp-qr";
    qrLink.href = href;
    qrLink.setAttribute("aria-label", "Open RSVP page");
    qrImage.src = qrUrl;
    qrImage.alt = "RSVP QR code";
    qrImage.width = 180;
    qrImage.height = 180;

    qrLink.appendChild(qrImage);
    panel.appendChild(qrLink);
    panel.appendChild(createLink("simple-rsvp-inline"));
    return panel;
  }

  function removeOldInline() {
    document.querySelectorAll(".simple-rsvp-inline, .simple-rsvp-panel, .simple-rsvp-link").forEach((element) => {
      element.remove();
    });
  }

  function mountButton(attempt) {
    const qrSection = document.getElementById("Qr");

    if (qrSection && !document.querySelector(".simple-rsvp-panel")) {
      removeOldInline();
      const firstCanvas = qrSection.querySelector("canvas");
      const panel = createQrPanel();

      if (firstCanvas && firstCanvas.parentElement) {
        firstCanvas.parentElement.insertAdjacentElement("afterend", panel);
      } else {
        qrSection.appendChild(panel);
      }
      return;
    }

    if (attempt < 20) {
      window.setTimeout(() => mountButton(attempt + 1), 250);
      return;
    }

    if (!document.querySelector(".simple-rsvp-link")) {
      document.body.appendChild(createLink("simple-rsvp-link"));
    }
  }

  function watchForQrSection() {
    const observer = new MutationObserver(() => {
      if (document.getElementById("Qr")) {
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

  window.addEventListener("load", () => {
    mountButton(0);
    watchForQrSection();
  });
})();
