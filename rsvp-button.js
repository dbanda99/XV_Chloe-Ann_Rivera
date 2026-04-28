(function () {
  const params = new URLSearchParams(window.location.search);
  const guestId = (params.get("guest") || params.get("id") || "").trim();

  if (!guestId) return;

  const href = "rsvp.html?guest=" + encodeURIComponent(guestId);
  const styles = document.createElement("style");
  styles.textContent = `
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
      margin: 14px auto 0;
    }

    .simple-rsvp-link:focus-visible,
    .simple-rsvp-inline:focus-visible {
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

  function mountButton(attempt) {
    const qrSection = document.getElementById("Qr");

    if (qrSection && !document.querySelector(".simple-rsvp-inline")) {
      qrSection.appendChild(createLink("simple-rsvp-inline"));
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

  window.addEventListener("load", () => mountButton(0));
})();
