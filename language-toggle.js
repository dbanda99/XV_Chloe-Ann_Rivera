(function () {
  const STORAGE_KEY = "xv_language";
  const DEFAULT_LANGUAGE = "en";
  const supported = new Set(["en", "es"]);
  const icons = {
    en: "assets/icons/en-icon.png",
    es: "assets/icons/sp-icon.png"
  };
  let isApplying = false;
  let pendingApply = false;

  const englishToSpanish = {
    "we are delighted to invite you!": "\u00a1Nos complace invitarte!",
    "we are delighted to invite you": "\u00a1Nos complace invitarte!",
    "guest name": "Nombre del invitado",
    "guest message": "Mensaje para el invitado",
    "pass": "Pase",
    "passes": "Pases",
    "table no.": "No. Mesa",
    "rsvp": "Confirmar asistencia",
    "confirm attendance": "Confirmar asistencia",
    "confirm passes": "Confirmar pases",
    "respectfully": "Respetuosamente",
    "no children": "NO NI\u00d1OS",
    "formal attire requested": "Se solicita vestimenta formal",
    "no shades of pink, please": "No tonos de rosa, por favor",
    "thank you for confirming your attendance": "Gracias por confirmar tu asistencia",
    "click here": "Haz clic aqu\u00ed",
    "home": "Inicio",
    "itinerary": "Itinerario",
    "locations": "Ubicaciones",
    "our story": "Nuestra historia",
    "gift table": "Mesa de regalos",
    "gifts": "Regalos",
    "dress code": "C\u00f3digo de vestimenta",
    "good wishes": "Buenos deseos",
    "gallery": "Galer\u00eda",
    "song suggestions": "Sugerencia de canciones",
    "contact": "Contacto",
    "ceremony": "Ceremonia",
    "reception": "Recepci\u00f3n",
    "hotel": "Hotel",
    "add to calendar": "Agregar al calendario",
    "go to location": "Ir a ubicaci\u00f3n",
    "presentation": "Presentaci\u00f3n",
    "dinner": "Cena",
    "dance": "Baile",
    "farewell": "Despedida",
    "contacts": "Contactos",
    "mom": "Mam\u00e1",
    "dad": "Pap\u00e1",
    "photo gallery": "Galer\u00eda de Fotos",
    "gift table": "Mesa de regalos",
    "gift": "Regalo",
    "all gifts are happily received, but gifts are not required to attend. your presence is the most important gift.": "Todos los regalos se reciben con mucho cari\u00f1o, pero no son necesarios para asistir. Tu presencia es el regalo m\u00e1s importante.",
    "what matters most is having you with us! if you would like to give a gift, we will be very grateful!": "\u00a1Que nos acompa\u00f1es es lo m\u00e1s importante! Y si est\u00e1 en tu disposici\u00f3n realizar una muestra de cari\u00f1o, \u00a1estaremos muy agradecidos!",
    "the envelope shower is the tradition of gifting cash in an envelope on the day of the event": "La lluvia de sobres, es la tradici\u00f3n de regalar dinero en efectivo en un sobre el d\u00eda del evento",
    "lodging suggestion": "Sugerencia de Hospedaje",
    "share this unique moment with us": "Comparte con nosotros este momento \u00fanico",
    "we would love for you to join us.": "Nos gustar\u00eda mucho que nos acompa\u00f1aras.",
    "time is the only thing that never comes back... don't miss it!": "\u00a1El tiempo es lo \u00fanico que no vuelve... no te lo pierdas!",
    "time is the only thing that never comes back...": "El tiempo es lo \u00fanico que no vuelve...",
    "don't miss it!": "\u00a1No te lo pierdas!",
    "friday, june 5, 2026": "Viernes 5 de junio 2026",
    "days": "D\u00edas",
    "hrs": "Hrs",
    "hours": "Horas",
    "mins": "Mins",
    "minutes": "Minutos",
    "secs": "Segs",
    "seconds": "Segundos",
    "a new chapter begins in my story...": "Empieza un nuevo cap\u00edtulo en mi historia...",
    "my xv years": "Mis XV a\u00f1os",
    "you are invited to honor chloe-ann rivera on her quincea\u00f1era.": "Est\u00e1s invitado a honrar a Chloe-Ann Rivera en su quincea\u00f1era.",
    "father: joe c. rivera": "Padre: Joe C. Rivera",
    "mother: diana l. rivera": "Madre: Diana L. Rivera",
    "sister: ashley n. montemayor": "Hermana: Ashley N. Montemayor",
    "you are invited to honor chloe-ann rivera on her quinceanera.": "Est\u00e1s invitado a honrar a Chloe-Ann Rivera en su quincea\u00f1era.",
    "family and court": "Familia y corte",
    "grandparents: thomas and patricia o'brien; jose cuauhtemoc and luz maris rivera.": "Abuelos: Thomas y Patricia O'Brien; Jose Cuauhtemoc y Luz Maris Rivera.",
    "court: jose rios, quince chambelan; ethan castillo and angelique jaurez; santiago lopez and genesis guerra.": "Corte: Jose Rios, chambel\u00e1n de honor; Ethan Castillo y Angelique Jaurez; Santiago Lopez y Genesis Guerra.",
    "miguel garcia and evlyne gonzalez; nicolas lopez and amaia marrero colon; nicolas sanchez and olivia elizondo.": "Miguel Garcia y Evlyne Gonzalez; Nicolas Lopez y Amaia Marrero Colon; Nicolas Sanchez y Olivia Elizondo.",
    "orlando rodriguez and regina montoya; emilio ortega and zoe luna; gabriel almanza and natalia gonzalez.": "Orlando Rodriguez y Regina Montoya; Emilio Ortega y Zoe Luna; Gabriel Almanza y Natalia Gonzalez.",
    "will you attend the xv?": "\u00bfAsistir\u00e1s a los XV?",
    "attending": "Asistir\u00e9",
    "not attending": "No asistir\u00e9",
    "how many passes will you use?": "\u00bfCu\u00e1ntos pases usar\u00e1s?",
    "cancel": "Cancelar",
    "confirm": "Confirmar",
    "back to invitation": "Volver a la invitaci\u00f3n",
    "loading invitation...": "Cargando invitaci\u00f3n...",
    "invitation guest": "Invitado",
    "missing guest id": "Falta el ID del invitado",
    "please open this page from your invitation link.": "Abre esta p\u00e1gina desde el enlace de tu invitaci\u00f3n.",
    "saving rsvp...": "Guardando confirmaci\u00f3n...",
    "thank you. your rsvp is confirmed.": "Gracias. Tu asistencia qued\u00f3 confirmada.",
    "thank you. your response has been saved.": "Gracias. Tu respuesta qued\u00f3 guardada.",
    "the rsvp request timed out. please try again.": "La solicitud tard\u00f3 demasiado. Int\u00e9ntalo de nuevo.",
    "could not reach the rsvp service. please try again.": "No se pudo conectar con el servicio RSVP. Int\u00e9ntalo de nuevo.",
    "missing guest_api_url in guest-api-config.js": "Falta GUEST_API_URL en guest-api-config.js",
    "open rsvp page": "Abrir p\u00e1gina RSVP",
    "view in english": "Ver en ingl\u00e9s",
    "first name": "Nombre",
    "last name": "Apellido",
    "send response": "Enviar respuesta",
    "please complete all fields.": "Por favor completa todos los campos."
    ,"rsvp by may 25. please confirm your attendance and guest count through your invitation link.": "Confirma antes del 25 de mayo. Por favor confirma tu asistencia y cantidad de invitados desde el enlace de tu invitaci\u00f3n."
    ,"rsvp by may 25 with guest count, name, and phone number. father: joe c. rivera 956-898-2592. mother: diana l. rivera 956-231-7288. sister: ashley n. montemayor.": "Confirma antes del 25 de mayo. Por favor confirma tu asistencia y cantidad de invitados desde el enlace de tu invitaci\u00f3n."
    ,"made with \u2764\ufe0f for our guests": "Hecho con \u2764\ufe0f para nuestros invitados"
    ,"made with \u2764\ufe0f for our guest": "Hecho con \u2764\ufe0f para nuestros invitados"
    ,"made with <3 for our guests": "Hecho con \u2764\ufe0f para nuestros invitados"
    ,"made with <3 for our guest": "Hecho con \u2764\ufe0f para nuestros invitados"
  };

  const spanishToEnglish = {
    "\u00a1nos complace invitarte!": "We are delighted to invite you!",
    "\u00a1es un placer invitarte!": "We are delighted to invite you!",
    "\u00a1es un placer invitarlos!": "We are delighted to invite you!",
    "nombre del invitado": "Guest name",
    "nombre del invitado": "Guest name",
    "mensaje para el invitado": "Guest message",
    "pase": "Pass",
    "pases": "Passes",
    "no. mesa": "Table No.",
    "confirmar asistencia": "RSVP",
    "confirmar pases": "Confirm Passes",
    "respetuosamente": "Respectfully",
    "no ni\u00f1os": "NO CHILDREN",
    "se solicita vestimenta formal": "Formal attire requested",
    "no tonos de rosa, por favor": "No shades of pink, please",
    "gracias por confirmar tu asistencia": "Thank you for confirming your attendance",
    "haz clic aqu\u00ed": "Click Here",
    "inicio": "Home",
    "itinerario": "Itinerary",
    "ubicaciones": "Locations",
    "nuestra historia": "Our Story",
    "mesa de regalos": "Gift Table",
    "regalos": "Gifts",
    "c\u00f3digo de vestimenta": "Dress Code",
    "c\u00f3digo de": "Dress",
    "codigo de": "Dress",
    "vestimenta": "Code",
    "buenos deseos": "Good Wishes",
    "galer\u00eda": "Gallery",
    "sugerencia de canciones": "Song Suggestions",
    "contacto": "Contact",
    "ceremonia": "Ceremony",
    "recepci\u00f3n": "Reception",
    "hotel": "Hotel",
    "agregar al calendario": "Add to Calendar",
    "agregar a calendario": "Add to Calendar",
    "ir a ubicaci\u00f3n": "Go to Location",
    "recepcion": "Reception",
    "recepci\u00f3n": "Reception",
    "presentacion": "Presentation",
    "presentaci\u00f3n": "Presentation",
    "cena": "Dinner",
    "baile": "Dance",
    "despedida": "Farewell",
    "contactos": "Contacts",
    "mam\u00e1": "Mom",
    "pap\u00e1": "Dad",
    "galer\u00eda de fotos": "Photo Gallery",
    "mesa de": "Gift",
    "regalos": "Table",
    "todos los regalos se reciben con mucho cari\u00f1o, pero no son necesarios para asistir. tu presencia es el regalo m\u00e1s importante.": "All gifts are happily received, but gifts are not required to attend. Your presence is the most important gift.",
    "\u00a1que nos acompa\u00f1es es lo m\u00e1s importante! y si est\u00e1 en tu disposici\u00f3n realizar una muestra de cari\u00f1o, \u00a1estaremos muy agradecidos!": "What matters most is having you with us! If you would like to give a gift, we will be very grateful!",
    "\"la lluvia de sobres, es la tradici\u00f3n de regalar dinero en efectivo en un sobre el d\u00eda del evento\"": "\"The envelope shower is the tradition of gifting cash in an envelope on the day of the event\"",
    "la lluvia de sobres, es la tradici\u00f3n de regalar dinero en efectivo en un sobre el d\u00eda del evento": "The envelope shower is the tradition of gifting cash in an envelope on the day of the event",
    "sugerencia de": "Lodging",
    "hospedaje": "Suggestion",
    "comparte con nosotros este momento \u00fanico": "Share this unique moment with us",
    "nos gustar\u00eda mucho que nos acompa\u00f1aras.": "We would love for you to join us.",
    "\u00a1el tiempo es lo \u00fanico que no vuelve... no te lo pierdas!": "Time is the only thing that never comes back... don't miss it!",
    "el tiempo es lo \u00fanico que no vuelve...": "Time is the only thing that never comes back...",
    "\u00a1no te lo pierdas!": "Don't miss it!",
    "viernes 5 de junio 2026": "Friday, June 5, 2026",
    "d\u00edas": "Days",
    "hrs": "Hrs",
    "mins": "Mins",
    "segs": "Secs",
    "empieza un nuevo cap\u00edtulo en mi historia...": "A new chapter begins in my story...",
    "empieza un nuevo capitulo en mi historia\u2026": "A new chapter begins in my story...",
    "empieza un nuevo capitulo en mi historia...": "A new chapter begins in my story...",
    "mis xv a\u00f1os": "My XV Years",
    "est\u00e1s invitado a honrar a chloe-ann rivera en su quincea\u00f1era.": "You are invited to honor Chloe-Ann Rivera on her Quincea\u00f1era.",
    "padre: joe c. rivera": "Father: Joe C. Rivera",
    "madre: diana l. rivera": "Mother: Diana L. Rivera",
    "hermana: ashley n. montemayor": "Sister: Ashley N. Montemayor",
    "familia y corte": "Family and Court",
    "abuelos: thomas y patricia o'brien; jose cuauhtemoc y luz maris rivera.": "Grandparents: Thomas and Patricia O'Brien; Jose Cuauhtemoc and Luz Maris Rivera.",
    "corte: jose rios, chambel\u00e1n de honor; ethan castillo y angelique jaurez; santiago lopez y genesis guerra.": "Court: Jose Rios, Quince Chambelan; Ethan Castillo and Angelique Jaurez; Santiago Lopez and Genesis Guerra.",
    "miguel garcia y evlyne gonzalez; nicolas lopez y amaia marrero colon; nicolas sanchez y olivia elizondo.": "Miguel Garcia and Evlyne Gonzalez; Nicolas Lopez and Amaia Marrero Colon; Nicolas Sanchez and Olivia Elizondo.",
    "orlando rodriguez y regina montoya; emilio ortega y zoe luna; gabriel almanza y natalia gonzalez.": "Orlando Rodriguez and Regina Montoya; Emilio Ortega and Zoe Luna; Gabriel Almanza and Natalia Gonzalez.",
    "\u00bfasistir\u00e1s a los xv?": "Will you attend the XV?",
    "asistir\u00e9": "Attending",
    "no asistir\u00e9": "Not Attending",
    "\u00bfcu\u00e1ntos pases usar\u00e1s?": "How many passes will you use?",
    "cancelar": "Cancel",
    "confirmar": "Confirm",
    "volver a la invitaci\u00f3n": "Back to Invitation",
    "cargando invitaci\u00f3n...": "Loading invitation...",
    "invitado": "Invitation guest",
    "falta el id del invitado": "Missing guest id",
    "abre esta p\u00e1gina desde el enlace de tu invitaci\u00f3n.": "Please open this page from your invitation link.",
    "guardando confirmaci\u00f3n...": "Saving RSVP...",
    "gracias. tu asistencia qued\u00f3 confirmada.": "Thank you. Your RSVP is confirmed.",
    "gracias. tu respuesta qued\u00f3 guardada.": "Thank you. Your response has been saved.",
    "la solicitud tard\u00f3 demasiado. int\u00e9ntalo de nuevo.": "The RSVP request timed out. Please try again.",
    "no se pudo conectar con el servicio rsvp. int\u00e9ntalo de nuevo.": "Could not reach the RSVP service. Please try again.",
    "falta guest_api_url en guest-api-config.js": "Missing GUEST_API_URL in guest-api-config.js",
    "abrir p\u00e1gina rsvp": "Open RSVP page",
    "ver en espa\u00f1ol": "View in Spanish",
    "nombre": "First name",
    "apellido": "Last name",
    "enviar respuesta": "Send response",
    "por favor completa todos los campos.": "Please complete all fields.",
    "confirma antes del 25 de mayo. por favor confirma tu asistencia y cantidad de invitados desde el enlace de tu invitaci\u00f3n.": "RSVP by May 25. Please confirm your attendance and guest count through your invitation link.",
    "confirma tu asistencia antes del 25 de mayo con cantidad de invitados, nombre y tel\u00e9fono. padre: joe c. rivera 956-898-2592. madre: diana l. rivera 956-231-7288. hermana: ashley n. montemayor.": "RSVP by May 25. Please confirm your attendance and guest count through your invitation link.",
    "hecho con \u2764\ufe0f para nuestros invitados": "Made with \u2764\ufe0f for our guests",
    "hecho con <3 para nuestros invitados": "Made with \u2764\ufe0f for our guests"
  };

  function key(value) {
    return String(value || "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getLanguage() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (supported.has(fromUrl)) return fromUrl;

    const saved = localStorage.getItem(STORAGE_KEY);
    return supported.has(saved) ? saved : DEFAULT_LANGUAGE;
  }

  function setLanguage(language) {
    const nextLanguage = supported.has(language) ? language : DEFAULT_LANGUAGE;
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    applyLanguage(nextLanguage);
    window.dispatchEvent(new CustomEvent("xv-language-change", {
      detail: { language: nextLanguage }
    }));
  }

  function translateText(value, language) {
    const normalized = key(value);
    if (!normalized) return value;

    if (language === "es") return englishToSpanish[normalized] || value;
    return spanishToEnglish[normalized] || value;
  }

  function replaceTextNode(node, language) {
    const original = node.nodeValue;
    const leading = original.match(/^\s*/)[0];
    const trailing = original.match(/\s*$/)[0];
    const translated = translateText(original, language);

    if (translated !== original) {
      node.nodeValue = leading + translated + trailing;
    }
  }

  function applyLanguage(language) {
    if (isApplying) return;
    isApplying = true;
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, noscript")) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".xv-language-toggle")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node = walker.nextNode();
    while (node) {
      replaceTextNode(node, language);
      node = walker.nextNode();
    }

    document.querySelectorAll("[aria-label], [title], [placeholder], [alt]").forEach((element) => {
      ["aria-label", "title", "placeholder", "alt"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const next = translateText(element.getAttribute(attribute), language);
        element.setAttribute(attribute, next);
      });
    });

    const button = document.querySelector(".xv-language-toggle");
    if (button) {
      const targetLanguage = language === "en" ? "es" : "en";
      const icon = button.querySelector(".xv-language-toggle-icon");
      const text = button.querySelector(".xv-language-toggle-text");

      if (icon) icon.src = icons[targetLanguage];
      if (text) text.textContent = targetLanguage === "es" ? "SP" : "EN";
      button.setAttribute("aria-label", language === "en" ? "Ver en espa\u00f1ol" : "View in English");
    }
    isApplying = false;
  }

  function scheduleApply() {
    if (pendingApply) return;
    pendingApply = true;

    window.requestAnimationFrame(() => {
      pendingApply = false;
      applyLanguage(getLanguage());
    });
  }

  function mountToggle() {
    if (document.querySelector(".xv-language-toggle")) return;

    const button = document.createElement("button");
    const icon = document.createElement("img");
    const text = document.createElement("span");

    button.type = "button";
    button.className = "xv-language-toggle";
    icon.className = "xv-language-toggle-icon";
    icon.alt = "";
    text.className = "xv-language-toggle-text";

    button.addEventListener("click", () => {
      setLanguage(getLanguage() === "en" ? "es" : "en");
    });
    button.appendChild(icon);
    button.appendChild(text);
    document.body.appendChild(button);
  }

  function mountStyles() {
    if (document.getElementById("xv-language-toggle-style")) return;

    const style = document.createElement("style");
    style.id = "xv-language-toggle-style";
    style.textContent = `
      .xv-language-toggle {
        position: fixed !important;
        left: 12px !important;
        top: 12px !important;
        z-index: 1400 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        width: auto !important;
        min-width: 64px !important;
        max-width: 64px !important;
        min-height: 36px !important;
        padding: 8px 10px !important;
        border: 1px solid rgba(115, 66, 81, 0.28) !important;
        border-radius: 6px !important;
        background: rgba(255, 255, 255, 0.92) !important;
        color: #734251 !important;
        box-shadow: 0 8px 24px rgba(45, 37, 39, 0.16) !important;
        font-family: Arial, sans-serif !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
      }

      .xv-language-toggle-icon {
        display: block !important;
        width: 18px !important;
        height: 18px !important;
        object-fit: contain !important;
        flex: 0 0 auto !important;
      }

      .xv-language-toggle-text {
        display: inline-block !important;
      }
    `;
    document.head.appendChild(style);
  }

  function watchLanguageTargets() {
    const observer = new MutationObserver(() => {
      scheduleApply();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => observer.disconnect(), 12000);
  }

  function start() {
    mountStyles();
    mountToggle();
    setLanguage(getLanguage());
    watchLanguageTargets();

    window.setTimeout(() => applyLanguage(getLanguage()), 500);
    window.setTimeout(() => applyLanguage(getLanguage()), 1500);
    window.setTimeout(() => applyLanguage(getLanguage()), 3000);
    window.addEventListener("scroll", scheduleApply, { passive: true });
    window.addEventListener("touchend", scheduleApply, { passive: true });
    window.addEventListener("click", scheduleApply);
  }

  window.XV_I18N = {
    applyLanguage,
    getLanguage,
    setLanguage,
    t(value) {
      return translateText(value, getLanguage());
    }
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
