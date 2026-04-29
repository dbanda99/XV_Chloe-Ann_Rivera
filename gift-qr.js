(function () {
  const QR_ID = "cashapp-gift-qr";
  const QR_SRC = "assets/images/cashapp-qr.png";

  function mountStyles() {
    if (document.getElementById("cashapp-gift-qr-style")) return;

    const style = document.createElement("style");
    style.id = "cashapp-gift-qr-style";
    style.textContent = `
      .cashapp-gift-qr {
        display: flex;
        justify-content: center;
        margin: 22px auto 4px;
        width: 100%;
      }

      .cashapp-gift-qr img {
        display: block;
        width: min(190px, 72vw);
        max-width: 100%;
        height: auto;
        padding: 10px;
        border: 1px solid rgba(152, 121, 114, 0.35);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 10px 26px rgba(63, 45, 49, 0.14);
      }
    `;
    document.head.appendChild(style);
  }

  function findGiftContent(section) {
    return section.querySelector(".content-center") || section.querySelector(".h-full") || section;
  }

  function mountCashAppQr() {
    const section = document.getElementById("MesaDeRegalos");
    if (!section || document.getElementById(QR_ID)) return;

    const wrapper = document.createElement("div");
    const image = document.createElement("img");

    wrapper.id = QR_ID;
    wrapper.className = "cashapp-gift-qr";
    image.src = QR_SRC;
    image.alt = "Cash App QR code";
    image.loading = "lazy";
    image.decoding = "async";

    wrapper.appendChild(image);
    findGiftContent(section).appendChild(wrapper);
  }

  function start() {
    mountStyles();
    mountCashAppQr();

    const observer = new MutationObserver(mountCashAppQr);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(mountCashAppQr, 500);
    window.setTimeout(mountCashAppQr, 1500);
    window.setTimeout(mountCashAppQr, 3000);
    window.setTimeout(() => observer.disconnect(), 12000);
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
