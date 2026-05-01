(function () {
  const courtText = {
    en: {
      title: "Family and Court",
      grandparents: "Grandparents:",
      lines: [
        "Thomas and Patricia O'Brien",
        "Jose Cuauhtemoc and Luz Maria Rivera"
      ],
      court: "Court:",
      courtLines: [
        "Chloe-Ann Rivera and Jose Rios",
        "Ethan Castillo and Angelique Jaurez",
        "Santiago Lopez and Genesis Guerra",
        "Miguel Garcia and Evlyne Gonzalez",
        "Nicolas Lopez and Amaia Marrero Colon",
        "Nicolas Sanchez and Olivia Elizondo",
        "Orlando Rodriguez and Regina Montoya",
        "Emilio Ortega and Zoe Luna",
        "Gabriel Almanza and Natalia Gonzalez"
      ]
    },
    es: {
      title: "Familia y corte",
      grandparents: "Abuelos:",
      lines: [
        "Thomas y Patricia O'Brien",
        "Jose Cuauhtemoc y Luz Maria Rivera"
      ],
      court: "Corte:",
      courtLines: [
        "Chloe-Ann Rivera y Jose Rios",
        "Ethan Castillo y Angelique Jaurez",
        "Santiago Lopez y Genesis Guerra",
        "Miguel Garcia y Evlyne Gonzalez",
        "Nicolas Lopez y Amaia Marrero Colon",
        "Nicolas Sanchez y Olivia Elizondo",
        "Orlando Rodriguez y Regina Montoya",
        "Emilio Ortega y Zoe Luna",
        "Gabriel Almanza y Natalia Gonzalez"
      ]
    }
  };

  const rsvpReminderText = {
    en: {
      title: "RSVP by May 25",
      body: "Please confirm your attendance and guest count through your invitation link.",
      contact: "Questions? Contact Joe C. Rivera at 956-898-2592, Diana L. Rivera at 956-231-7288, or Ashley N. Montemayor."
    },
    es: {
      title: "Confirma antes del 25 de mayo",
      body: "Por favor confirma tu asistencia y cantidad de invitados desde el enlace de tu invitacion.",
      contact: "Preguntas? Comunicate con Joe C. Rivera al 956-898-2592, Diana L. Rivera al 956-231-7288, o Ashley N. Montemayor."
    }
  };

  function normalizedText(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findElementByText(selector, values) {
    const wanted = values.map((value) => value.toLowerCase());
    return Array.from(document.querySelectorAll(selector)).find((element) => {
      return wanted.includes(normalizedText(element));
    });
  }

  function removeReceptionFromItinerary() {
    const itinerary = Array.from(document.querySelectorAll("#Itinerario")).find((element) => {
      return element.querySelector("h3");
    });
    if (!itinerary) return;

    const receptionTitle = Array.from(itinerary.querySelectorAll("h3")).find((element) => {
      return ["recepcion", "recepción", "reception"].includes(normalizedText(element));
    });
    if (!receptionTitle) return;

    const card = receptionTitle.closest(".grid");
    const marker = card && card.previousElementSibling && card.previousElementSibling.querySelector(".fa-heart")
      ? card.previousElementSibling
      : null;

    if (card) card.remove();
    if (marker) marker.remove();
  }

  function updateCourtOfHonor() {
    const heading = findElementByText("h1, h2, h3", ["Family and Court", "Familia y corte"]);
    if (!heading) return;

    const section = heading.closest(".bg-primary-500") || heading.parentElement;
    if (!section) return;

    const language = window.XV_I18N && window.XV_I18N.getLanguage ? window.XV_I18N.getLanguage() : "en";
    const copy = courtText[language] || courtText.en;
    const existingList = section.querySelector(".xv-court-list");
    const html = [
      `<p class="xv-court-heading">${copy.grandparents}</p>`,
      ...copy.lines.map((line) => `<p>${line}</p>`),
      `<p class="xv-court-heading">${copy.court}</p>`,
      ...copy.courtLines.map((line) => `<p>${line}</p>`)
    ].join("");

    function removeStaleCourtLines() {
      Array.from(section.querySelectorAll("h3")).forEach((element) => {
        if (element === heading || element.closest(".xv-court-list")) return;

        const text = normalizedText(element);
        const isOldCourtText = [
          "grandparents:",
          "abuelos:",
          "court:",
          "corte:",
          "miguel garcia",
          "nicolas lopez",
          "nicolas sanchez",
          "olivia elizondo",
          "orlando rodriguez",
          "regina montoya",
          "emilio ortega",
          "zoe luna",
          "gabriel almanza",
          "natalia gonzalez"
        ].some((pattern) => text.includes(pattern));

        if (isOldCourtText) {
          element.remove();
        }
      });
    }

    if (existingList) {
      if (existingList.innerHTML !== html) {
        existingList.innerHTML = html;
      }
      removeStaleCourtLines();
      return;
    }

    const existingLines = Array.from(section.querySelectorAll("h3")).filter((element) => {
      const text = normalizedText(element);
      return text.includes("grandparents:") || text.includes("abuelos:") || text.includes("court:") || text.includes("corte:");
    });
    if (!existingLines.length) return;

    const list = document.createElement("div");

    list.className = "xv-court-list";
    list.setAttribute("data-xv-managed", "court");
    list.innerHTML = html;

    existingLines[0].insertAdjacentElement("beforebegin", list);
    removeStaleCourtLines();
  }

  function centerRiveraSeven() {
    document.querySelectorAll('img[src*="rivera-07.png"]').forEach((image) => {
      image.style.objectPosition = "50% 40%";
    });
  }

  function removeNoChildrenNotice() {
    Array.from(document.querySelectorAll("h3, h4, h5, p, span, div")).forEach((element) => {
      if (element.children.length > 1) return;

      const text = normalizedText(element);
      if (text === "no children" || text === "no niños" || text === "no ninos") {
        element.remove();
      }
    });
  }

  function updateRsvpReminder() {
    const reminder = Array.from(document.querySelectorAll("h3, p, div")).find((element) => {
      if (element.closest(".xv-rsvp-reminder")) return false;

      const text = normalizedText(element);
      return text.startsWith("rsvp by may 25") || text.startsWith("confirma antes del 25 de mayo");
    });
    if (!reminder) return;

    const language = window.XV_I18N && window.XV_I18N.getLanguage ? window.XV_I18N.getLanguage() : "en";
    const copy = rsvpReminderText[language] || rsvpReminderText.en;
    const reminderSection = reminder.closest(".bg-primary-500") || reminder.parentElement;

    reminder.classList.add("xv-rsvp-reminder");
    if (reminderSection) {
      reminderSection.classList.add("xv-rsvp-reminder-section");
    }
    reminder.innerHTML = [
      `<span class="xv-rsvp-reminder-title">${copy.title}</span>`,
      `<span class="xv-rsvp-reminder-body">${copy.body}</span>`,
      `<span class="xv-rsvp-reminder-contact">${copy.contact}</span>`
    ].join("");
  }

  function applyEdits() {
    removeReceptionFromItinerary();
    updateCourtOfHonor();
    centerRiveraSeven();
    removeNoChildrenNotice();
    updateRsvpReminder();
  }

  const styles = document.createElement("style");
  styles.textContent = `
    .xv-court-list {
      display: grid;
      gap: 0.35rem;
      padding: 0.5rem;
      color: inherit;
      text-align: center;
      justify-items: center;
    }

    .xv-court-list p {
      margin: 0;
      color: inherit;
      font-size: 1.5rem;
      line-height: 1.25;
    }

    .xv-court-list .xv-court-heading {
      margin-top: 0.7rem;
      font-weight: 700;
    }

    .xv-rsvp-reminder {
      display: grid;
      gap: 0.45rem;
      width: 100%;
      margin: 0 auto;
      padding: 1.2rem max(1rem, calc((100% - 760px) / 2)) 1.4rem;
      box-sizing: border-box;
      background: #d6aaa0;
      color: inherit;
      text-align: center;
    }

    .xv-rsvp-reminder-section {
      background: #d6aaa0 !important;
      overflow: hidden;
    }

    .xv-rsvp-reminder-title,
    .xv-rsvp-reminder-body,
    .xv-rsvp-reminder-contact {
      display: block;
    }

    .xv-rsvp-reminder-title {
      font-size: 1.45rem;
      font-weight: 700;
      line-height: 1.15;
    }

    .xv-rsvp-reminder-body {
      font-size: 1.05rem;
      line-height: 1.45;
    }

    .xv-rsvp-reminder-contact {
      font-family: Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.45;
      opacity: 0.92;
    }
  `;
  document.head.appendChild(styles);

  const observer = new MutationObserver(applyEdits);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("load", applyEdits);
  window.addEventListener("xv-language-change", () => {
    window.setTimeout(applyEdits, 50);
  });
  window.setTimeout(applyEdits, 500);
  window.setTimeout(applyEdits, 1500);
  window.setTimeout(() => observer.disconnect(), 8000);
})();
