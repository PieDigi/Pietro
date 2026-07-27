const root = document.documentElement;
const siteLoader = document.getElementById("site-loader");
const heroSection = document.querySelector(".hero-section");
const nameSection = document.querySelector(".name-section");
const nameRows = [...document.querySelectorAll(".name-row")];
const topbar = document.querySelector(".topbar");
const topbarToggle = document.getElementById("topbar-toggle");
const topbarNav = document.getElementById("topbar-nav");
const topbarNavLinks = [...document.querySelectorAll(".topbar-nav a")];
const issueSections = [...document.querySelectorAll(".issue-section[data-issue]")];
const aboutSection = document.querySelector(".issue-section--about");
const aboutHeading = document.querySelector(".issue-section--about .section-heading");
const aboutPanel = document.querySelector(".issue-section--about .about-panel");
const skillsSection = document.querySelector(".issue-section--skills");
const projectsSection = document.querySelector(".issue-section--projects");
const contactSection = document.querySelector(".issue-section--contact");
const projectGrid = document.getElementById("project-grid");
const projectCards = [...document.querySelectorAll(".issue-section--projects .project-card")];
const yearPrevBtn = document.getElementById("year-prev");
const yearNextBtn = document.getElementById("year-next");
const yearLabel   = document.getElementById("year-label");
const skillBadges = [...document.querySelectorAll(".issue-section--skills .tool-badge")];
const revealItems = [...document.querySelectorAll(".reveal")].filter(
  (item) => !item.classList.contains("project-card"),
);
const questionChips = document.querySelectorAll(".question-chip");
const answerBox = document.getElementById("assistant-answer");
const askForm = document.getElementById("assistant-ask-form");
const askInput = document.getElementById("assistant-question");
const askSubmit = document.getElementById("assistant-ask-submit");
const askStatus = document.getElementById("assistant-status");
const projectButtons = document.querySelectorAll(".project-card__button");
const projectModal = document.getElementById("project-modal");
const modalPanel = document.querySelector(".project-modal__panel");
const modalFront = document.getElementById("project-modal-front");
const modalMirror = document.getElementById("project-modal-mirror");
const modalTitle = document.getElementById("project-modal-title");
const modalType = document.getElementById("project-modal-type");
const modalDescription = document.getElementById("project-modal-description");
const modalDomain = document.getElementById("project-modal-domain");
const modalGithub = document.getElementById("project-modal-github");
const modalGithubNote = document.getElementById("project-modal-github-note");
const modalMeta = document.getElementById("project-modal-meta");
const modalSignals = document.getElementById("project-modal-signals");
const modalPreview = document.getElementById("project-modal-preview");
const modalProofs = document.getElementById("project-modal-proofs");
const modalProofTrigger = document.getElementById("project-modal-proof-trigger");
const modalProofSheet = document.getElementById("project-modal-proof-sheet");
const contactIcon = document.querySelector(".contact-callout__icon");
const copyContactButtons = [...document.querySelectorAll(".contact-link--copy[data-copy-value]")];
const languageToggle = document.getElementById("language-toggle");
const heroScrollLabel = document.querySelector(".hero-scroll__label");
const nameTranslationNodes = [...document.querySelectorAll(".name-translation")];
const nameLetterOverlayNodes = nameRows.map((row, index) => {
  const shell = row.querySelector(".name-letter-shell");
  if (!(shell instanceof HTMLElement)) return null;

  const overlay = document.createElement("span");
  overlay.className = "name-letter-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.textContent = nameTranslationNodes[index]?.textContent?.trim() ?? "";
  shell.append(overlay);
  return overlay;
});
const aboutFactBodies = [...document.querySelectorAll(".about-facts article p:not(.fact-label)")];
const contactCopy = document.querySelector(".contact-copy");
const modalProofHeading = document.querySelector(".project-modal__proof-heading");
const modalProofNote = document.querySelector(".project-modal__proof-note");

let activeProjectButton = null;
let activeProjectData = null;
let closeTimer = null;
let closeStageTimer = null;
let flipTimer = null;
let collapseAnimation = null;
let suppressedHoverButton = null;
let lastPointerPosition = null;
let assistantRequestId = 0;
let currentLanguage = "it";
let pendingAssistantQuestion = "";
const visibleIssueSections = new Set();
const issueIntersectionRatios = new Map();
const copyFeedbackTimers = new WeakMap();

const PANEL_TRANSITION_MS = 620;
const CLOSE_RETURN_DELAY_MS = 520;
const CLOSE_COLLAPSE_MS = 760;
const FLIP_DELAY_MS = 120;
const MODAL_EXIT_BUFFER_MS = 90;
const SKILL_BADGE_SEQUENCE = [7, 2, 10, 4, 1, 13, 8, 14, 9, 16, 6, 15, 5, 11, 3, 12];
const LANGUAGE_STORAGE_KEY = "site-language";
const defaultAssistantAnswer = answerBox?.textContent?.trim() ?? "";
const defaultAssistantStatus = askStatus?.textContent?.trim() ?? "";
const lowMemoryDevice =
  Boolean(navigator.connection?.saveData) ||
  (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 8);
const LOADER_MIN_VISIBLE_MS = 520;
const LANGUAGE_COPY = {
  it: {
    buttonLabel: "EN",
    buttonAria: "Switch to Italian",
    htmlLang: "en",
    heroScroll: "Scroll down",
    nameTranslations: [
      "Development",
      "Hardware Assembly",
      "Networking",
      "Computer Science",
      "Cybersecurity",
    ],
    assistant: {
      defaultAnswer:
        "I'm Pietro itang, a fifth-year student in IT at Blaise Pascal in Reggio Emilia (A.S. 2025/2026). I specialise in backend and software architecture with a focus on security. I also study piano at the Peri-Merulo Conservatory.",
      defaultStatus: defaultAssistantStatus,
      emptyQuestion: "Enter a question about Pietro first, then I'll answer.",
      loadingAnswer: (question) => `Generating an answer about "${question}"...`,
      loadingStatus: "Loading response about Pietro, his skills and projects.",
      followUpStatus: "You can ask another question about Pietro's projects, skills, or background.",
      requestError: "Service unavailable. Reverted to default answer.",
      placeholder: "E.g.: What is your best project?",
      questions: [
        {
          label: "Who are you?",
          answer:
            "I'm Pietro itang, a fifth-year IT student at Blaise Pascal in Reggio Emilia. I specialise in backend development (Node.js, PHP) and software architecture with a focus on security. In my spare time I play piano at the Peri-Merulo Conservatory.",
        },
        {
          label: "What can you do?",
          answer:
            "I develop backends in Node.js and PHP, manage MySQL datas with encryption, and implement secure authentication (prepared statements, CSRF protection). I have experience in REST APIs, browser extensions (manifest, content scripts, service worker), testing with Jest (80%+ coverage), LAN networking (IP, switches), and hardware assembly. My main project is KeyManager: a password manager with triple-layer security.",
        },
        {
          label: "What is your best project?",
          answer:
            "KeyManager: a three-layer credential management system. PHP backend with user authentication and CSRF protection. MySQL data with double-layer encryption (master password + extra layer). JavaScript browser extension that detects login fields and auto-fills secured data. I implemented 30-min session timeout, prepared statements against SQL injection, audit logging, email verification, and tokenised password reset. Jest tests with 80%+ coverage.",
        },
        {
          label: "What excites you about computer science?",
          answer:
            "Cybersecurity fascinates me — understanding how attackers think. At the Mead Informatica lab we simulated a real attack/defence on a company infrastructure. I also love software architecture: designing systems that actually work, not just look good. And I enjoy discovering how components interconnect (backend, data, frontend, network).",
        },
      ],
      facts: [
        "Specialised in backend (Node.js, PHP) and software architecture with a focus on security and testing.",
        "From design to code: data design, robust authentication, REST APIs, browser extensions, test coverage.",
        "I care that code is secure, maintainable, and tested — it's not enough for it to 'work', it has to be resilient.",
      ],
    },
    secondaryProjects: {
      "project-two.dev": {
        intro: "Frontend and backend logic advancing at the same pace.",
        description: "A product built end to end, from interface to backend, with emphasis on coherence rather than connecting isolated features.",
        meta: "Full-Stack / UI / API",
      },
      "project-three.dev": {
        intro: "Not just a visual experiment, but a product with clear functional goals.",
        description: "An expressive project that keeps a clear function, so visual impact and practical utility coexist.",
        meta: "Creative Interaction / Animation / Usability",
      },
      "project-four.dev": {
        intro: "System-oriented, suited to solving problems in complex environments.",
        description: "A system-level project combining infrastructure, networks, and edge capabilities in a single solution.",
        meta: "Systems / Networking / Hardware",
      },
    },
    contactCopy:
      "If you're looking for someone who can build complete products with attention to detail and security, let's talk.",
    modal: {
      proofTrigger: "View proof",
      proofTriggerWithCount: (count) => `View proof and feedback (${count})`,
      proofHeading: "Proof and Feedback",
      proofNote: "Supplementary proof here, without taking up the main preview slot.",
      previewAria: (title) => `Play ${title ?? "project demo video"}`,
      previewPlay: "Start Demo",
      previewPending: "Video coming soon",
      previewTitle: "Project Preview",
      previewVideoTitle: "project demo video",
      previewNote: "Preview material coming soon.",
      galleryPending: "Images coming soon",
    },
  },
  en: {
    buttonLabel: "IT",
    buttonAria: "Switch to English",
    htmlLang: "it",
    heroScroll: "Scorri in basso",
    nameTranslations: [
      "Programmazione",
      "Assemblaggio PC",
      "Networking",
      "Informatica",
      "Cybersecurity",
    ],
    assistant: {
      defaultAnswer:
        "Sono Pietro Digitalino. Mi specializo in backend e architettura software con focus su sicurezza.",
      defaultStatus: "Clicca una domanda per saperne di più.",
      emptyQuestion: "Inserisci prima una domanda su Pietro, poi rispondo.",
      loadingAnswer: (question) => `Elaboro una risposta su "${question}"...`,
      loadingStatus: "Caricamento risposta su Pietro, le sue competenze e i suoi progetti.",
      followUpStatus: "Puoi fare un'altra domanda sui progetti, le competenze o il percorso di Pietro.",
      requestError: "Servizio non disponibile. Tornato alla risposta predefinita.",
      placeholder: "Es.: Qual è il tuo progetto migliore?",
      questions: [
        {
          label: "Chi sei?",
          answer:
            "Sono Pietro itang, frequento il quinto anno dell'indirizzo tecnico informatico al Blaise Pascal di Reggia Emilia. Mi specializo in backend (Node.js, PHP) e architettura software con focus su sicurezza. Nel tempo libero suono pianoforte al Conservatorio Peri-Merulo di Reggio Emilia.",
        },
        {
          label: "Cosa sai fare?",
          answer:
            "Sviluppo backend in Node.js e PHP, gestisco data MySQL con crittografia, implemento autenticazione sicura (prepared statements, CSRF protection). Ho esperienza in: API REST, browser extension (manifest, content scripts, service worker), testing con Jest (80%+ coverage), reti LAN (IP, switch), hardware (assemblaggio). Il mio progetto maggiore è KeyManager: password manager con triple-layer security.",
        },
        {
          label: "Qual è il tuo progetto migliore?",
          answer:
            "KeyManager: sistema di gestione credenziali a tre strati. Backend PHP con autenticazione utente e CSRF protection. Data MySQL con doppio livello di crittografia (master password + layer aggiuntivo). Browser extension JavaScript che rileva campi login e auto-compila dati securizzati. Ho implementato session timeout 30 min, prepared statements contro SQL injection, logging per audit trail, email verification e password reset tokenizzato. Test Jest con copertura 80%+.",
        },
        {
          label: "Cosa ti appassiona dell'informatica?",
          answer:
            "La cybersecurity mi affascina: capire come ragionano gli attaccanti. Al laboratorio Mead Informatica abbiamo simulato un vero attacco/difesa su infrastruttura aziendale. Mi piace anche l'architettura software — progettare sistemi che funzionano davvero, non solo belli. E mi attrae scoprire come i componenti si interconnettono (backend, data, frontend, network).",
        },
      ],
      facts: [
        "Specializzato in backend (Node.js, PHP) e architettura software con focus su sicurezza e testing.",
        "Dalla progettazione al codice: database design, autenticazione robusta, API REST, browser extension, test coverage.",
        "Mi importa che il codice sia sicuro, manutenibile e testato — non basta che 'funzioni', deve essere resiliente.",
      ],
    },
    secondaryProjects: {
      "project-two.dev": {
        intro: "Frontend e logica backend avanzano con lo stesso ritmo.",
        description: "Un prodotto costruito end to end, dall'interfaccia al backend, con enfasi sulla coerenza invece di collegare funzionalità isolate.",
        meta: "Full-Stack / UI / API",
      },
      "project-three.dev": {
        intro: "Non solo un esperimento visivo, ma un prodotto con obiettivi funzionali chiari.",
        description: "Progetto espressivo che mantiene una funzione chiara, così l'impatto visivo e l'utilità pratica coesistono.",
        meta: "Interazione creativa / Animazione / Usabilità",
      },
      "project-four.dev": {
        intro: "Orientato ai sistemi, adatto a risolvere problemi in ambienti complessi.",
        description: "Un progetto di livello sistemico che combina infrastruttura, reti e capacità edge in un'unica soluzione.",
        meta: "Sistemi / Reti / Hardware",
      },
    },
    contactCopy:
      "Se cerchi qualcuno che sa realizzare prodotti completi con attenzione ai dettagli e alla sicurezza, parliamoci.",
    modal: {
      proofTrigger: "Visualizza prove",
      proofTriggerWithCount: (count) => `Visualizza prove e feedback (${count})`,
      proofHeading: "Prove e Feedback",
      proofNote: "Prove supplementari qui, senza occupare l'anteprima principale.",
      previewAria: (title) => `Riproduci ${title ?? "video demo del progetto"}`,
      previewPlay: "Avvia Demo",
      previewPending: "Video in arrivo",
      previewTitle: "Anteprima Progetto",
      previewVideoTitle: "video demo del progetto",
      previewNote: "Materiale di anteprima in arrivo.",
      galleryPending: "Immagini in arrivo",
    },
  },
};

const PROJECT_DETAILS = {
  crittos: {
    title: "Crittos - Dimostrazione AES-256",
    image: "img/cr.png", // IMMAGINE CRITTOS
    type: { it: "Crittografia / Web / C++ / iOS", en: "Cryptography / Web / C++ / iOS" },
    link: "https://piedigi.github.io/crittos/",
    linkLabel: "Apri Crittos Web",
    frontIntro: {
      it: "Dimostrazione pratica dell'algoritmo di crittografia AES-256 su Web, con versioni C++ ed iOS.",
      en: "Hands-on demonstration of AES-256 encryption on Web, with C++ and iOS versions."
    },
    description: {
      it: "<strong>Crittos</strong> è una dimostrazione interattiva dell'algoritmo di crittografia standard **AES-256**. Permette di cifrare e decifrare dati garantendo elevata sicurezza.<br><br>Inoltre, oltre alla versione Web accessibile dal link, esistono:<br>- Una versione nativa locale sviluppata in **C++**.<br>- Una versione dell'applicazione in fase di sviluppo per **iOS**.",
      en: "<strong>Crittos</strong> is an interactive demonstration of the **AES-256** encryption standard. Allows encrypting and decrypting data securely.<br><br>In addition to the Web version, there are:<br>- A native local version written in **C++**.<br>- An **iOS** app version currently under development."
    },
    meta: { it: "AES-256 / Security / C++ / iOS / Web", en: "AES-256 / Security / C++ / iOS / Web" },
    signals: { it: ["AES-256", "C++ Native", "App iOS in dev"], en: ["AES-256", "C++ Native", "iOS App in dev"] },
  },
  cookit: {
    title: "CookIT - Project Work",
    image: "img/co.png", // IMMAGINE COOKIT
    type: { it: "Mobile App / AI / PHP & MySQL", en: "Mobile App / AI / PHP & MySQL" },
    link: "http://pietronline.altervista.org/projectWork/login.php",
    linkLabel: "Visita CookIT",
    frontIntro: {
      it: "Dispensa virtuale e generatore di ricette basato su AI per incentivare la creatività in cucina e ridurre gli sprechi.",
      en: "Virtual pantry and AI recipe generator to boost creativity in cooking and reduce food waste."
    },
    description: {
      it: "<strong>Descrizione del progetto:</strong><br>Il progetto prevede la realizzazione di un’applicazione mobile che funge da dispensa virtuale per la gestione degli ingredienti e delle relative quantità. L’app utilizza un sistema di intelligenza artificiale per generare ricette basate sugli ingredienti disponibili, sul tempo a disposizione e sulle calorie desiderate. Il sistema include anche funzionalità di registrazione utente, gestione dei preferiti e un’interfaccia grafica dedicata. Progetto sviluppato per l’IIS Blaise Pascal.<br><br><strong>Back-End (Pietro Digitalino):</strong><br>Nel ruolo di back-end developer, Pietro Digitalino ha progettato il database e le relative tabelle, integrandole successivamente nel codice PHP per garantire una gestione efficiente dei dati. Ha inoltre sviluppato tutte le logiche necessarie al corretto funzionamento del sistema, compresa l’integrazione e la comunicazione con l’IA.<br><br><strong>Front-End (Federica Miglio):</strong><br>Federica Miglio si è occupata della progettazione grafica dell’applicazione, curando l’aspetto visivo, l’organizzazione dell’interfaccia intuitiva e la scelta dei colori e layout.<br><br><strong>Obiettivo e Idee Progettuali:</strong><br>Incentivare la creatività in cucina, riducendo gli sprechi e valorizzando gli ingredienti già presenti in dispensa tramite suggerimenti personalizzati e salvataggio ricette preferite.",
      en: "<strong>Project Description:</strong><br>A mobile app serving as a virtual pantry to manage ingredients and quantities. It uses AI to generate recipes based on available ingredients, available time, and target calories. Features user registration, favorites management, and custom UI.<br><br><strong>Back-End (Pietro Digitalino):</strong><br>Designed database structure, PHP integration, system logic, and AI API communication.<br><br><strong>Front-End (Federica Miglio):</strong><br>UI/UX design, visual aspect, color palette, and intuitive navigation layout.<br><br><strong>Goal:</strong><br>Encourage creativity in cooking and reduce food waste by making the most of pantry ingredients."
    },
    meta: { it: "PHP / MySQL / AI API / Web Mobile App", en: "PHP / MySQL / AI API / Web Mobile App" },
    signals: { it: ["AI Integration", "Database MySQL", "PHP Back-end"], en: ["AI Integration", "MySQL Database", "PHP Back-end"] },
  },
  "resta-connesso": {
    title: "Resta Connesso (Gioco AI)",
    image: "img/gi.png", // IMMAGINE RESTA CONNESSO
    type: { it: "AI Game / Web Optimization", en: "AI Game / Web Optimization" },
    link: "http://pietronline.altervista.org/restaConnesso/successo.html",
    linkLabel: "Prova il gioco",
    frontIntro: {
      it: "Gioco creato con l'AI e ottimizzato da Pietro Digitalino per renderlo leggero e reattivo.",
      en: "Game created with AI and enhanced by Pietro Digitalino for performance and lightness."
    },
    description: {
      it: "Un sito web e gioco realizzato sfruttando le potenzialità dell'Intelligenza Artificiale e successivamente rivisto e migliorato da Pietro per renderlo più leggero, fluido e performante. Anche se non ancora definitivo, rappresenta una dimostrazione concreta delle potenzialità dell'AI applicata allo sviluppo web e all'intrattenimento interattivo.",
      en: "A web game built using Artificial Intelligence tools and then optimized and refined by Pietro to improve performance, responsiveness, and lightness. Represents an active demonstration of AI potential in web development."
    },
    meta: { it: "AI Generated / Optimization / JavaScript / HTML5", en: "AI Generated / Optimization / JavaScript / HTML5" },
    signals: { it: ["AI Powered", "Ottimizzato", "Web Game"], en: ["AI Powered", "Optimized", "Web Game"] },
  },
  carrello: {
    title: "E-Commerce Carrello & Sessioni",
    image: "img/ca.png", // IMMAGINE CARRELLO
    type: { it: "PHP / Sessioni / E-Commerce", en: "PHP / Sessions / E-Commerce" },
    link: "http://pietronline.altervista.org/sessoioni/carrello/index.php",
    linkLabel: "Vedi Carrello",
    frontIntro: {
      it: "Dimostrazione di gestione carrello prodotti e persistenza dati tramite sessioni PHP.",
      en: "Demonstration of product cart management and data persistence via PHP sessions."
    },
    description: {
      it: "Sito di prova creato per testare e implementare la gestione completa di un carrello della spesa e-commerce: selezione prodotti, salvataggio in sessione, aggiornamento quantità e gestione del flusso di acquisto utente.",
      en: "Test site created to implement and test full e-commerce shopping cart management: product selection, session storage, quantity updates, and user purchase flow."
    },
    meta: { it: "PHP Sessions / E-Commerce Logic / Data Management", en: "PHP Sessions / E-Commerce Logic / Data Management" },
    signals: { it: ["Sessioni PHP", "E-commerce", "Carrello Spesa"], en: ["PHP Sessions", "E-commerce", "Shopping Cart"] },
  },
  "eden-cafe": {
    title: "Eden Cafè Reggio Emilia Demo",
    image: "img/ed.jpg", // IMMAGINE EDEN CAFE
    type: { it: "Web Design / UI Demo", en: "Web Design / UI Demo" },
    link: "https://eden-cafe-reggioemilia-demo.lovable.app/",
    linkLabel: "Visita la Demo",
    frontIntro: {
      it: "Demo web moderna creata per un bar/cafè locale di Reggio Emilia.",
      en: "Modern web demo crafted for a local bar/cafè in Reggio Emilia."
    },
    description: {
      it: "Progetto e interfaccia web sviluppati come demo promozionale per un bar locale di Reggio Emilia (Eden Cafè). Il sito presenta il locale, i menu e l'atmosfera con uno stile moderno e curato nei dettagli visivi.",
      en: "Web showcase developed as a demo for a local bar in Reggio Emilia (Eden Cafè). Features clean layout, menu presentations, and modern design."
    },
    meta: { it: "UI/UX / Responsive Design / Web App", en: "UI/UX / Responsive Design / Web App" },
    signals: { it: ["Demo Locale", "Web Design", "Responsive"], en: ["Local Demo", "Web Design", "Responsive"] },
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutCubic = (value) => 1 - (1 - value) ** 3;
const easeInOutQuad = (value) =>
  value < 0.5 ? 2 * value * value : 1 - ((-2 * value + 2) ** 2) / 2;
const isLocalizedValue = (value) =>
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "it" in value &&
  "en" in value;

const getStoredLanguage = () => {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" ? "en" : stored === "it" ? "it" : null;
  } catch {
    return null;
  }
};

const storeLanguage = (language) => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore storage failures
  }
};

const getCopy = () => LANGUAGE_COPY[currentLanguage];
const getAssistantCopy = () => getCopy().assistant;
const getModalCopy = () => getCopy().modal;

const localizeValue = (value) => {
  if (isLocalizedValue(value)) return value[currentLanguage] ?? value.it;
  return value;
};

const localizeProjectDetail = (detail) => {
  if (!detail) return null;

  return {
    ...detail,
    title: localizeValue(detail.title),
    type: localizeValue(detail.type),
    frontIntro: localizeValue(detail.frontIntro),
    description: localizeValue(detail.description),
    meta: localizeValue(detail.meta),
    githubNote: localizeValue(detail.githubNote),
    signals: localizeValue(detail.signals) ?? [],
    cover: detail.cover
      ? {
          ...detail.cover,
          logo: detail.cover.logo ? { ...detail.cover.logo } : null,
          impact: detail.cover.impact
            ? {
                ...detail.cover.impact,
                text: localizeValue(detail.cover.impact.text),
              }
            : null,
        }
      : null,
    preview: detail.preview
      ? {
          ...detail.preview,
          label: localizeValue(detail.preview.label),
          title: localizeValue(detail.preview.title),
          note: localizeValue(detail.preview.note),
        }
      : null,
    proofs: Array.isArray(detail.proofs)
      ? detail.proofs.map((proof) => ({
          ...proof,
          title: localizeValue(proof.title),
          description: localizeValue(proof.description),
          alt: localizeValue(proof.alt),
        }))
      : [],
  };
};

const getAssistantStatusKey = (value) => {
  if (!value) return null;

  const statusKeys = ["defaultStatus", "emptyQuestion", "loadingStatus", "followUpStatus", "requestError"];
  for (const language of ["it", "en"]) {
    for (const key of statusKeys) {
      if (LANGUAGE_COPY[language].assistant[key] === value) {
        return key;
      }
    }
  }

  return null;
};

const applyStaticLanguage = () => {
  const copy = getCopy();

  document.documentElement.lang = copy.htmlLang;

  if (languageToggle) {
    languageToggle.textContent = copy.buttonLabel;
    languageToggle.setAttribute("aria-label", copy.buttonAria);
  }

  if (heroScrollLabel) {
    heroScrollLabel.textContent = copy.heroScroll;
  }

  nameTranslationNodes.forEach((node, index) => {
    const nextText = copy.nameTranslations[index];
    if (nextText) node.textContent = nextText;
    if (nameLetterOverlayNodes[index]) {
      nameLetterOverlayNodes[index].textContent = nextText ?? "";
    }
  });

  if (contactCopy) {
    contactCopy.textContent = copy.contactCopy;
  }

  if (modalProofHeading) {
    modalProofHeading.textContent = copy.modal.proofHeading;
  }

  if (modalProofNote) {
    modalProofNote.textContent = copy.modal.proofNote;
  }
};

const dismissSiteLoader = () => {
  if (!(siteLoader instanceof HTMLElement) || siteLoader.dataset.dismissed === "true") return;

  siteLoader.dataset.dismissed = "true";
  document.body.classList.remove("is-site-loading");
  siteLoader.classList.add("is-loaded");

  window.setTimeout(() => {
    siteLoader.hidden = true;
  }, 620);
};
window.addEventListener('load', dismissSiteLoader);

const applyAssistantLanguage = () => {
  const assistantCopy = getAssistantCopy();
  const activeChip = [...questionChips].find((chip) => chip.classList.contains("is-active"));
  const currentAnswer = answerBox?.textContent?.trim() ?? "";
  const currentStatus = askStatus?.textContent?.trim() ?? "";

  questionChips.forEach((chip, index) => {
    const question = assistantCopy.questions[index];
    if (!question) return;
    chip.textContent = question.label;
    chip.dataset.answer = question.answer;
  });

  if (askInput) {
    askInput.placeholder = assistantCopy.placeholder;
  }

  aboutFactBodies.forEach((node, index) => {
    const nextText = assistantCopy.facts[index];
    if (nextText) node.textContent = nextText;
  });

  if (answerBox) {
    if (answerBox.classList.contains("is-loading") && pendingAssistantQuestion) {
      answerBox.textContent = assistantCopy.loadingAnswer(pendingAssistantQuestion);
    } else if (activeChip?.dataset.answer) {
      answerBox.textContent = activeChip.dataset.answer;
    } else if (
      !currentAnswer ||
      currentAnswer === LANGUAGE_COPY.it.assistant.defaultAnswer ||
      currentAnswer === LANGUAGE_COPY.en.assistant.defaultAnswer
    ) {
      answerBox.textContent = assistantCopy.defaultAnswer;
    }
  }

  if (askStatus) {
    const statusKey = getAssistantStatusKey(currentStatus);
    askStatus.textContent = statusKey ? assistantCopy[statusKey] : assistantCopy.defaultStatus;
  }
};

const applySecondaryProjectLanguage = () => {
  const projectCopy = getCopy().secondaryProjects;

  projectButtons.forEach((button) => {
    const detail = projectCopy[button.dataset.domain ?? ""];
    if (!detail) return;

    button.dataset.description = detail.description;
    button.dataset.meta = detail.meta;

    const intro = button.querySelector("p");
    if (intro) intro.textContent = detail.intro;
  });
};

const applyLanguage = (language, { persist = true } = {}) => {
  currentLanguage = language === "en" ? "en" : "it";
  if (persist) {
    storeLanguage(currentLanguage);
  }

  applyStaticLanguage();
  applyAssistantLanguage();
  applySecondaryProjectLanguage();
  //hydrateProjectCards();

  if (activeProjectButton) {
    activeProjectData = getProjectDetail(activeProjectButton);
    populateModalContent(activeProjectData);
    const currentModalCard = modalFront?.querySelector(".project-card__button");
    syncModalCardScene(activeProjectButton, {
      scene: currentModalCard?.classList.contains("is-active-scene") ? "active" : "idle",
    });
  }
};

const normalizeProjectUrl = (value) => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const getProjectDetail = (button) => {
  const projectId = button.dataset.projectId;
  const projectDetail = projectId ? PROJECT_DETAILS[projectId] : null;

  if (projectDetail) return localizeProjectDetail(projectDetail);

  const title =
    button.dataset.title ??
    button.querySelector("strong")?.textContent?.trim() ??
    "Project";
  const type =
    button.dataset.type ??
    button.querySelector(".project-card__type")?.textContent?.trim() ??
    "Project Type";
  const frontIntro = button.querySelector("p")?.textContent?.trim() ?? "";
  const linkLabel = button.dataset.domain ?? "";

  return {
    title,
    type,
    link: normalizeProjectUrl(linkLabel),
    linkLabel,
    frontIntro,
    description: button.dataset.description ?? frontIntro,
    meta: button.dataset.meta ?? "",
    signals: [],
    preview: { images: [] },
    proofs: [],
  };
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const sanitizeClassToken = (value = "") => String(value).replace(/[^a-z0-9_-]/gi, "");

const getProjectCardIndexLabel = (button) =>
  button.dataset.projectIndex ??
  button.querySelector(".project-card__index")?.textContent?.trim() ??
  "";

const applyProjectCoverTheme = (button, cover) => {
  const theme = cover?.theme ?? {};
  const styleEntries = [
    /*["--cover-logo-asset", cover?.logo?.asset ? `url("${BASE}${cover.logo.asset}")` : ""],
    ["--cover-art-asset", cover?.art?.asset ? `url("${BASE}${cover.art.asset}")` : ""],*/
    ["--card-hover-image", (cover?.art?.asset || cover?.logo?.asset) ? `url("${BASE}${cover.art?.asset || cover.logo?.asset}")` : ""],
    ["--cover-origin-x", theme.originX],
    ["--cover-origin-y", theme.originY],
    ["--cover-logo-muted", theme.logoMuted],
    ["--cover-logo-active", theme.logoActive],
    ["--cover-logo-glow", theme.logoGlow],
    ["--cover-burst-accent", theme.burstAccent],
    ["--cover-burst-soft", theme.burstSoft],
    ["--cover-dot-muted", theme.dotMuted],
    ["--cover-dot-active", theme.dotActive],
    ["--cover-line-muted", theme.lineMuted],
    ["--cover-ray-light", theme.rayLight],
    ["--cover-ray-ink", theme.rayInk],
    ["--cover-panel-tint", theme.panelTint],
    ["--cover-accent", theme.accent],
    ["--cover-accent-soft", theme.accentSoft],
    ["--cover-ink-soft", theme.inkSoft],
    ["--cover-ink-strong", theme.inkStrong],
    ["--cover-line-soft", theme.lineSoft],
    ["--cover-line-strong", theme.lineStrong],
    ["--cover-net-line", theme.netLine],
    ["--cover-speedline-light", theme.speedlineLight],
    ["--cover-speedline-dark", theme.speedlineDark],
    ["--cover-border-active", theme.borderActive],
    ["--cover-shadow-active", theme.shadowActive],
  ];

  styleEntries.forEach(([property, value]) => {
    if (value) {
      button.style.setProperty(property, value);
    } else {
      button.style.removeProperty(property);
    }
  });
};

const buildLogoBurstCardMarkup = ({ indexLabel, detail, cover }) => {
  const impactText = cover?.impact?.text ?? "";
  const impactMode = sanitizeClassToken(cover?.impact?.mode);
  const impactClass = impactMode ? ` project-card__impact--${impactMode}` : "";
  const logoMarkStyle = cover?.logo?.asset
    ? ` style="--cover-logo-asset: url('${BASE}${cover.logo.asset}')"`
    : "";

  return `
    <span class="project-card__cover" aria-hidden="true">
      <span class="project-card__cover-panel"></span>
      <span class="project-card__cover-burst"></span>
      <span class="project-card__cover-dots"></span>
      <span class="project-card__cover-rays"></span>
      <span class="project-card__cover-bubble"></span>
      <span class="project-card__cover-fragments"></span>
      <span class="project-card__logo">
        <span class="project-card__logo-mark"${logoMarkStyle}></span>
      </span>
    </span>
    <span class="project-card__impact${impactClass}" aria-hidden="true">${escapeHtml(impactText)}</span>
    <span class="project-card__copy">
      <span class="project-card__index">${escapeHtml(indexLabel)}</span>
      <strong>${escapeHtml(detail.title)}</strong>
      <span class="project-card__type">${escapeHtml(detail.type)}</span>
      <p>${escapeHtml(detail.frontIntro)}</p>
    </span>
  `;
};

const buildFootballInkCardMarkup = ({ indexLabel, detail, cover }) => {
  const impactText = cover?.impact?.text ?? "";
  const impactMode = sanitizeClassToken(cover?.impact?.mode);
  const impactClass = impactMode ? ` project-card__impact--${impactMode}` : "";

  return `
    <span class="project-card__cover" aria-hidden="true">
      <span class="project-card__cover-panel"></span>
      <span class="project-card__cover-dots"></span>
      <span class="project-card__cover-rays"></span>
      <span class="project-card__cover-goal"></span>
      <span class="project-card__cover-net"></span>
      <span class="project-card__cover-burst"></span>
      <span class="project-card__cover-shot"></span>
      <span class="project-card__cover-ball"></span>
      <span class="project-card__cover-fragments"></span>
      <span class="project-card__logo">
        <span class="project-card__logo-mark"></span>
      </span>
    </span>
    <span class="project-card__impact${impactClass}" aria-hidden="true">${escapeHtml(impactText)}</span>
    <span class="project-card__copy">
      <span class="project-card__index">${escapeHtml(indexLabel)}</span>
      <strong>${escapeHtml(detail.title)}</strong>
      <span class="project-card__type">${escapeHtml(detail.type)}</span>
      <p>${escapeHtml(detail.frontIntro)}</p>
    </span>
  `;
};

const resetProjectCardVariants = (button) => {
  button.classList.remove(
    "project-card__button--pow",
    "project-card__button--bang",
    "project-card__button--crash",
    "project-card__button--wham",
    "project-card__button--logo-burst",
    "project-card__button--bugpet-pixel",
    "project-card__button--football-ink",
    "project-card__button--scriptmind-wave",
  );
};

const renderProjectCardCover = (button, localizedDetail) => {
  const cover = localizedDetail.cover;
  if (!cover?.profile) return false;

  if (cover.profile === "logo-burst") {
    const indexLabel = getProjectCardIndexLabel(button);
    resetProjectCardVariants(button);
    button.classList.add("project-card__button--logo-burst");
    button.dataset.coverProfile = cover.profile;
    // applyProjectCoverTheme(button, cover);
    button.innerHTML = buildLogoBurstCardMarkup({ indexLabel, detail: localizedDetail, cover });
    return true;
  }

  if (cover.profile === "football-ink") {
    const indexLabel = getProjectCardIndexLabel(button);
    resetProjectCardVariants(button);
    button.classList.add("project-card__button--football-ink");
    button.dataset.coverProfile = cover.profile;
    applyProjectCoverTheme(button, cover);
    button.innerHTML = buildFootballInkCardMarkup({ indexLabel, detail: localizedDetail, cover });
    return true;
  }

  if (cover.profile === "scriptmind-wave") {
    const indexLabel = getProjectCardIndexLabel(button);
    resetProjectCardVariants(button);
    button.classList.add("project-card__button--logo-burst", "project-card__button--scriptmind-wave");
    button.dataset.coverProfile = cover.profile;
    applyProjectCoverTheme(button, cover);
    button.innerHTML = buildLogoBurstCardMarkup({ indexLabel, detail: localizedDetail, cover });
    return true;
  }

  if (cover.profile === "bugpet-pixel") {
    const indexLabel = getProjectCardIndexLabel(button);
    resetProjectCardVariants(button);
    button.classList.add("project-card__button--logo-burst", "project-card__button--bugpet-pixel");
    button.dataset.coverProfile = cover.profile;
    applyProjectCoverTheme(button, cover);
    button.innerHTML = buildLogoBurstCardMarkup({ indexLabel, detail: localizedDetail, cover });
    return true;
  }

  return false;
};

/*const hydrateProjectCards = () => {
  projectButtons.forEach((button) => {
    const projectId = button.dataset.projectId;
    const projectDetail = projectId ? PROJECT_DETAILS[projectId] : null;
    if (!projectDetail) return;

    const localizedDetail = localizeProjectDetail(projectDetail);

    if (renderProjectCardCover(button, localizedDetail)) {
      button.setAttribute(
        "aria-label",
        currentLanguage === "it"
          ? `${localizedDetail.title}，${localizedDetail.type}`
          : `${localizedDetail.title}, ${localizedDetail.type}`,
      );
      return;
    }

    const title = button.querySelector("strong");
    const type = button.querySelector(".project-card__type");
    const intro = button.querySelector("p");

    if (title) title.textContent = localizedDetail.title;
    if (type) type.textContent = localizedDetail.type;
    if (intro) intro.textContent = localizedDetail.frontIntro;
    button.setAttribute(
      "aria-label",
      currentLanguage === "it"
        ? `${localizedDetail.title}，${localizedDetail.type}`
        : `${localizedDetail.title}, ${localizedDetail.type}`,
    );
  });
};*/

const getToolBadgeNumber = (badge) => {
  const badgeClass = [...badge.classList].find((className) => /^tool-badge--\d+$/.test(className));
  return badgeClass ? Number.parseInt(badgeClass.replace("tool-badge--", ""), 10) : null;
};

const initializeSkillBadges = () => {
  if (skillBadges.length === 0) return;

  const badgeOrder = new Map(SKILL_BADGE_SEQUENCE.map((badgeNumber, index) => [badgeNumber, index]));

  skillBadges.forEach((badge, fallbackIndex) => {
    const badgeNumber = getToolBadgeNumber(badge) ?? fallbackIndex + 1;
    const order = badgeOrder.get(badgeNumber) ?? fallbackIndex;
    const angle = (order / Math.max(skillBadges.length, 1)) * Math.PI * 2 - Math.PI * 0.56;
    const enterRadius = 14 + (order % 4) * 3.2;
    const driftRadius = 3.4 + (order % 3) * 1.45;
    const enterX = Math.cos(angle) * enterRadius;
    const enterY = Math.sin(angle) * enterRadius + 18;
    const enterRotate = ((order % 2 === 0 ? -1 : 1) * (4 + (order % 4) * 1.2));
    const driftX = Math.cos(angle + Math.PI / 3) * driftRadius;
    const driftY = -5.4 - (order % 4) * 1.15;
    const driftRotate = ((badgeNumber % 2 === 0 ? 1 : -1) * (0.38 + (order % 3) * 0.12));
    const driftScale = 0.009 + (order % 4) * 0.002;
    const floatDuration = 8.6 + (order % 5) * 0.8;
    const floatDelay = order * -0.53;

    badge.style.setProperty("--badge-order", String(order));
    badge.style.setProperty("--badge-enter-x", `${enterX.toFixed(2)}px`);
    badge.style.setProperty("--badge-enter-y", `${enterY.toFixed(2)}px`);
    badge.style.setProperty("--badge-enter-rotate", `${enterRotate.toFixed(2)}deg`);
    badge.style.setProperty("--badge-drift-x", `${driftX.toFixed(2)}px`);
    badge.style.setProperty("--badge-drift-y", `${driftY.toFixed(2)}px`);
    badge.style.setProperty("--badge-drift-rotate", `${driftRotate.toFixed(2)}deg`);
    badge.style.setProperty("--badge-drift-scale", driftScale.toFixed(4));
    badge.style.setProperty("--badge-float-duration", `${floatDuration.toFixed(2)}s`);
    badge.style.setProperty("--badge-float-delay", `${floatDelay.toFixed(2)}s`);
    badge.style.setProperty("--badge-pop", "0");
    badge.style.setProperty("--badge-float", "0");
    badge.style.setProperty("--badge-burst-y", "0px");
    badge.style.setProperty("--badge-burst-scale", "0");
    badge.style.setProperty("--badge-burst-rotate", "0deg");
  });
};

const setTopbarMenuState = (isOpen) => {
  if (!topbar || !topbarToggle) return;
  topbar.classList.toggle("is-open", isOpen);
  topbarToggle.setAttribute("aria-expanded", String(isOpen));
};

const trimContactIconBackground = () => {
  if (!(contactIcon instanceof HTMLImageElement) || contactIcon.dataset.trimmed === "true") return;

  const applyTrim = () => {
    if (!contactIcon.naturalWidth || !contactIcon.naturalHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = contactIcon.naturalWidth;
    canvas.height = contactIcon.naturalHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(contactIcon, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const brightness = (red + green + blue) / 3;
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);

      if (brightness > 247 && saturation < 22) {
        data[index + 3] = 0;
      } else if (brightness > 232 && saturation < 38) {
        const softness = (247 - brightness) / 15;
        data[index + 3] = Math.min(data[index + 3], Math.round(Math.max(softness, 0) * 255));
      }
    }

    context.putImageData(imageData, 0, 0);
    contactIcon.dataset.trimmed = "true";
    contactIcon.src = canvas.toDataURL("image/png");
  };

  if (contactIcon.complete) {
    applyTrim();
  } else {
    contactIcon.addEventListener("load", applyTrim, { once: true });
  }
};

const fallbackCopyText = (value) => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  textarea.style.inset = "0 auto auto 0";
  document.body.append(textarea);
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  textarea.remove();
  return copied;
};

const copyTextToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_error) {
      return fallbackCopyText(value);
    }
  }

  return fallbackCopyText(value);
};

const setCopyFeedbackState = (button, state) => {
  button.classList.remove("is-copied", "is-copy-failed");

  const existingTimer = copyFeedbackTimers.get(button);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  if (!state) return;

  button.classList.add(state);
  button.dataset.copyStatus = "COPIED";

  const resetTimer = window.setTimeout(() => {
    button.classList.remove("is-copied", "is-copy-failed");
    button.dataset.copyStatus = "COPIED";
    copyFeedbackTimers.delete(button);
  }, 1400);

  copyFeedbackTimers.set(button, resetTimer);
};

const initializeContactCopyButtons = () => {
  copyContactButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const copyValue = button.dataset.copyValue?.trim();
      if (!copyValue) return;

      const copied = await copyTextToClipboard(copyValue);
      setCopyFeedbackState(button, copied ? "is-copied" : "is-copy-failed");
    });
  });
};

const updateHeroProgress = () => {
  if (!heroSection) return;

  const rect = heroSection.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
  const liftProgress = easeOutCubic(clamp((progress - 0.018) / 0.18, 0, 1));
  const travelProgress = easeInOutQuad(clamp((progress - 0.6) / 0.34, 0, 1));

  document.body.classList.toggle("is-hero-active", progress < 0.92);
  root.style.setProperty("--hero-progress", progress.toFixed(3));
  root.style.setProperty("--hero-lift-progress", liftProgress.toFixed(3));
  root.style.setProperty("--hero-detach-progress", travelProgress.toFixed(3));
  root.style.setProperty("--hero-lift-x", `${liftProgress * -18}px`);
  root.style.setProperty("--hero-lift-y", `${liftProgress * -26}px`);
  root.style.setProperty("--hero-lift-rotate", `${liftProgress * -4.2}deg`);
  root.style.setProperty("--hero-tilt-x", `${travelProgress * 8}deg`);
  root.style.setProperty("--hero-tilt-y", `${travelProgress * -18}deg`);
  root.style.setProperty("--hero-residue-opacity", `${Math.max(travelProgress * 0.78, liftProgress * 0.08)}`);
  root.style.setProperty("--hero-residue-size", `${28 + travelProgress * 168}px`);
  root.style.setProperty("--hero-shadow-opacity", `${0.42 + liftProgress * 0.18 + travelProgress * 0.11}`);
  root.style.setProperty("--hero-shift-x", `${travelProgress * window.innerWidth * -0.82}px`);
  root.style.setProperty("--hero-shift-y", `${travelProgress * window.innerHeight * -0.96}px`);
  root.style.setProperty("--hero-rotate", `${travelProgress * -20}deg`);
  root.style.setProperty("--hero-scale", `${1 + liftProgress * 0.012 - travelProgress * 0.098}`);
}
  
const updateNameProgress = () => {
  if (!nameSection || nameRows.length === 0) return;

  const rect = nameSection.getBoundingClientRect();
  const total = rect.height - window.innerHeight * 0.45;
  const progress = total > 0 ? clamp((window.innerHeight * 0.2 - rect.top) / total, 0, 1) : 0;

  nameRows.forEach((row, index) => {
    const start = index * 0.12;
    const end = start + 0.26;
    const rowProgress = clamp((progress - start) / (end - start), 0, 1);
    row.style.setProperty("--row-progress", rowProgress.toFixed(3));
  });
};

const updateProjectsProgress = () => {
  if (!projectsSection || !projectGrid || projectCards.length === 0) return;

  const rect = projectGrid.getBoundingClientRect();
  const start = window.innerHeight * 0.92;
  const end = window.innerHeight * 0.24;
  const distance = start - end;
  const sectionProgress = distance > 0 ? clamp((start - rect.top) / distance, 0, 1) : 0;
  const cardFlow = clamp((sectionProgress - 0.05) / 0.82, 0, 1);
  const titleEnter = easeOutCubic(clamp((sectionProgress - 0.02) / 0.17, 0, 1));
  const titleHoldEnd = 0.82;
  const titleExitWindow = 0.1;
  const titleExit = easeOutCubic(clamp((sectionProgress - titleHoldEnd) / titleExitWindow, 0, 1));

  projectsSection.style.setProperty("--projects-progress", sectionProgress.toFixed(3));
  projectsSection.style.setProperty("--projects-title-enter", titleEnter.toFixed(3));
  projectsSection.style.setProperty("--projects-title-exit", titleExit.toFixed(3));

  projectCards.forEach((card, index) => {
    const total = Math.max(projectCards.length, 1);
    const cardStart = 0.04 + (index / total) * 0.35;
    const cardEnd = cardStart + 0.3;
    const cardRaw = clamp((cardFlow - cardStart) / (cardEnd - cardStart), 0, 1);
    const cardProgress = easeInOutQuad(cardRaw);
    card.style.setProperty("--project-pop", cardProgress.toFixed(3));
  });
};

const updateIssueFiveSixTransition = () => {
  if (!projectsSection || !contactSection) return;

  const contactRect = contactSection.getBoundingClientRect();
  const start = window.innerHeight * 0.9;
  const end = window.innerHeight * 0.18;
  const distance = start - end;
  const progress = distance > 0 ? clamp((start - contactRect.top) / distance, 0, 1) : 0;

  root.style.setProperty("--issue-56-progress", progress.toFixed(3));
};

const updateSkillsTransition = () => {
  if (!skillsSection) return;

  const rect = skillsSection.getBoundingClientRect();
  const isPhoneViewport = window.innerWidth <= 560;
  const start = window.innerHeight * 0.99;
  const end = window.innerHeight * -0.12;
  const distance = start - end;
  const progress = distance > 0 ? clamp((start - rect.top) / distance, 0, 1) : 0;

  const titleRaw = clamp((progress - 0.14) / 0.22, 0, 1);
  const webRaw = clamp((progress - (isPhoneViewport ? 0.54 : 0.64)) / (isPhoneViewport ? 0.24 : 0.2), 0, 1);
  const webDensityRaw = clamp(
    (progress - (isPhoneViewport ? 0.62 : 0.74)) / (isPhoneViewport ? 0.18 : 0.14),
    0,
    1,
  );
  const iconsRaw = clamp((progress - (isPhoneViewport ? 0.7 : 0.9)) / (isPhoneViewport ? 0.22 : 0.16), 0, 1);
  const aboutExitRaw = clamp((progress - 0.28) / 0.46, 0, 1);

  const titleProgress = easeInOutQuad(titleRaw);
  const webProgress = easeInOutQuad(webRaw);
  const webDensityProgress = easeInOutQuad(webDensityRaw);
  const iconsProgress = easeInOutQuad(iconsRaw);
  const aboutExitProgress = easeInOutQuad(aboutExitRaw);

  skillsSection.style.setProperty("--skills-progress", progress.toFixed(3));
  skillsSection.style.setProperty("--skills-title-progress", titleProgress.toFixed(3));
  skillsSection.style.setProperty("--skills-web-progress", webProgress.toFixed(3));
  skillsSection.style.setProperty("--skills-web-density-progress", webDensityProgress.toFixed(3));
  skillsSection.style.setProperty("--skills-icons-progress", iconsProgress.toFixed(3));

  if (aboutSection) {
    aboutSection.style.setProperty("--about-exit-progress", aboutExitProgress.toFixed(3));
  }

  skillBadges.forEach((badge) => {
    const badgeNumber = getToolBadgeNumber(badge);
    const order = Number.parseFloat(badge.style.getPropertyValue("--badge-order")) || 0;
    const normalizedOrder = skillBadges.length > 1 ? order / (skillBadges.length - 1) : 0;
    const badgeSpread = isPhoneViewport ? 0.46 : 0.68;
    const badgeWindow = isPhoneViewport ? 0.42 : 0.32;
    const badgeLead = badgeNumber === 12 ? (isPhoneViewport ? 0.16 : 0.18) : 0;
    const badgeStart = Math.max(0, normalizedOrder * badgeSpread - badgeLead);
    const badgeEnd = Math.min(badgeStart + badgeWindow + (badgeNumber === 12 ? 0.08 : 0), 1);
    const badgeRaw = clamp((iconsProgress - badgeStart) / (badgeEnd - badgeStart), 0, 1);
    const badgePopBase = easeOutCubic(clamp((badgeRaw - 0.06) / 0.84, 0, 1));
    const badgePop = badgeNumber === 12 ? Math.max(badgePopBase, iconsProgress * 0.38) : badgePopBase;
    const badgeFloat = easeInOutQuad(clamp((badgeRaw - 0.82) / 0.18, 0, 1));
    const burstEnvelope = Math.sin(badgeRaw * Math.PI);
    const burstLift = burstEnvelope * (1 - badgeRaw * 0.22) * (isPhoneViewport ? 10 : 18);
    const burstScale = burstEnvelope * (isPhoneViewport ? 0.04 : 0.07);
    const burstRotate = burstEnvelope * (order % 2 === 0 ? -1 : 1) * 1.35;

    badge.style.setProperty("--badge-pop", badgePop.toFixed(3));
    badge.style.setProperty("--badge-float", badgeFloat.toFixed(3));
    badge.style.setProperty("--badge-burst-y", `${burstLift.toFixed(2)}px`);
    badge.style.setProperty("--badge-burst-scale", burstScale.toFixed(4));
    badge.style.setProperty("--badge-burst-rotate", `${burstRotate.toFixed(2)}deg`);
  });
};

const updateAboutEntryTransition = () => {
  if (!aboutSection || !aboutHeading || !aboutPanel) {
    root.style.setProperty("--about-enter-progress", "0");
    root.style.setProperty("--about-heading-enter", "0");
    root.style.setProperty("--about-panel-enter", "0");
    return;
  }

  const sectionRect = aboutSection.getBoundingClientRect();
  const headingRect = aboutHeading.getBoundingClientRect();
  const panelRect = aboutPanel.getBoundingClientRect();

  const sectionStart = window.innerHeight * 0.94;
  const sectionEnd = window.innerHeight * 0.44;
  const sectionDistance = sectionStart - sectionEnd;
  const progress =
    sectionDistance > 0 ? clamp((sectionStart - sectionRect.top) / sectionDistance, 0, 1) : 0;

  const headingStart = window.innerHeight * 0.64;
  const headingEnd = window.innerHeight * 0.26;
  const headingDistance = headingStart - headingEnd;
  const headingRaw =
    headingDistance > 0 ? clamp((headingStart - headingRect.top) / headingDistance, 0, 1) : 0;

  const panelStart = window.innerHeight * 0.82;
  const panelEnd = window.innerHeight * 0.34;
  const panelDistance = panelStart - panelEnd;
  const panelRaw =
    panelDistance > 0 ? clamp((panelStart - panelRect.top) / panelDistance, 0, 1) : 0;

  const headingEnter = easeOutCubic(headingRaw);
  const panelEnter = easeOutCubic(panelRaw);

  root.style.setProperty("--about-enter-progress", progress.toFixed(3));
  root.style.setProperty("--about-heading-enter", headingEnter.toFixed(3));
  root.style.setProperty("--about-panel-enter", panelEnter.toFixed(3));
};

const resetIssueProgress = () => {
  issueSections.forEach((section) => section.classList.remove("is-current"));
  document.body.classList.remove("is-skills-active");
  delete document.body.dataset.issue;
  root.style.setProperty("--bridge-progress", "0");
  root.style.setProperty("--accent-opacity", "0.16");
  root.style.setProperty("--thread-opacity", "0.24");
  root.style.setProperty("--section-dim", "0.16");
  root.style.setProperty("--issue-56-progress", "0");
  root.style.setProperty("--about-enter-progress", "0");
  root.style.setProperty("--about-heading-enter", "0");
  root.style.setProperty("--about-panel-enter", "0");
  aboutSection?.style.setProperty("--about-exit-progress", "0");
  skillsSection?.style.setProperty("--skills-progress", "0");
  skillsSection?.style.setProperty("--skills-title-progress", "0");
  skillsSection?.style.setProperty("--skills-web-progress", "0");
  skillsSection?.style.setProperty("--skills-web-density-progress", "0");
  skillsSection?.style.setProperty("--skills-icons-progress", "0");
  skillBadges.forEach((badge) => {
    badge.style.setProperty("--badge-pop", "0");
    badge.style.setProperty("--badge-float", "0");
    badge.style.setProperty("--badge-burst-y", "0px");
    badge.style.setProperty("--badge-burst-scale", "0");
    badge.style.setProperty("--badge-burst-rotate", "0deg");
  });
};

const getIssueFocus = (rect) => {
  const viewportAnchor = window.innerHeight * 0.48;
  const sectionCenter = rect.top + rect.height / 2;
  const distance = Math.abs(sectionCenter - viewportAnchor);
  const maxDistance = window.innerHeight * 0.72 + rect.height * 0.16;
  return clamp(1 - distance / maxDistance, 0, 1);
};

const getIssueProgress = (rect) => {
  const total = rect.height + window.innerHeight * 0.38;
  return total > 0 ? clamp((window.innerHeight * 0.22 - rect.top) / total, 0, 1) : 0;
};

const updateIssueProgress = () => {
  if (issueSections.length === 0) return;

  const candidates = issueSections
    .filter((section) => visibleIssueSections.has(section))
    .map((section) => {
      const rect = section.getBoundingClientRect();
      const focus = getIssueFocus(rect);
      const ratio = issueIntersectionRatios.get(section) ?? 0;
      return {
        section,
        rect,
        focus,
        score: focus * 0.72 + ratio * 0.28,
      };
    });

  if (candidates.length === 0) {
    resetIssueProgress();
    return;
  }

  const activeCandidate = candidates.reduce((best, candidate) =>
    candidate.score > best.score ? candidate : best,
  );

  const activeIssue = activeCandidate.section.dataset.issue ?? "";
  const progress = getIssueProgress(activeCandidate.rect);
  const stage = clamp((Number(activeIssue) - 3) / 3, 0, 1);
  const accentOpacity = clamp(0.24 - stage * 0.1 + Math.sin(progress * Math.PI) * 0.05, 0.08, 0.26);
  const threadOpacity = clamp(0.34 - stage * 0.1 + (1 - progress) * 0.08, 0.12, 0.4);
  const sectionDim = clamp(0.14 + stage * 0.14 + Math.abs(progress - 0.5) * 0.06, 0.14, 0.34);

  issueSections.forEach((section) => {
    section.classList.toggle("is-current", section === activeCandidate.section);
  });

  document.body.dataset.issue = activeIssue;
  document.body.classList.toggle("is-skills-active", activeIssue === "04");
  root.style.setProperty("--bridge-progress", progress.toFixed(3));
  root.style.setProperty("--accent-opacity", accentOpacity.toFixed(3));
  root.style.setProperty("--thread-opacity", threadOpacity.toFixed(3));
  root.style.setProperty("--section-dim", sectionDim.toFixed(3));
};

let ticking = false;

const updateScene = () => {
  ticking = false;
  updateHeroProgress();
  updateNameProgress();
  updateIssueProgress();
  updateAboutEntryTransition();
  updateSkillsTransition();
  updateProjectsProgress();
  updateIssueFiveSixTransition();
};

const requestSceneUpdate = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScene);
};

const issueObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      issueIntersectionRatios.set(entry.target, entry.intersectionRatio);

      if (entry.isIntersecting) {
        visibleIssueSections.add(entry.target);
        entry.target.classList.add("is-visible");
      } else {
        visibleIssueSections.delete(entry.target);
      }
    });

    requestSceneUpdate();
  },
  {
    threshold: [0, 0.16, 0.32, 0.48, 0.64, 0.8],
    rootMargin: "-16% 0px -16% 0px",
  },
);

currentLanguage = getStoredLanguage() ?? "it";
document.body.classList.toggle("is-low-memory-device", lowMemoryDevice);
initializeSkillBadges();
issueSections.forEach((section) => issueObserver.observe(section));
// applyLanguage(currentLanguage, { persist: false });
updateScene();
trimContactIconBackground();
initializeContactCopyButtons();
window.addEventListener("scroll", requestSceneUpdate, { passive: true });
window.addEventListener("resize", () => {
  requestSceneUpdate();
});

languageToggle?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "it" ? "en" : "it");
});

topbarToggle?.addEventListener("click", () => {
  setTopbarMenuState(!topbar?.classList.contains("is-open"));
});

topbarNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setTopbarMenuState(false);
  });
});

document.addEventListener("click", (event) => {
  if (!topbar?.classList.contains("is-open")) return;
  if (event.target instanceof Node && topbar.contains(event.target)) return;
  setTopbarMenuState(false);
});

const clearQuestionChipState = () => {
  questionChips.forEach((chip) => chip.classList.remove("is-active"));
};

const setAssistantState = ({
  answer,
  status = getAssistantCopy().defaultStatus,
  isLoading = false,
  disableInput = false,
}) => {
  if (answerBox && typeof answer === "string") {
    answerBox.textContent = answer;
    answerBox.classList.toggle("is-loading", isLoading);
  }

  if (askStatus) {
    askStatus.textContent = status;
  }

  if (askInput) {
    askInput.disabled = disableInput;
  }

  if (askSubmit) {
    askSubmit.disabled = disableInput;
  }
};

const askPortfolioAssistant = async (question, fallbackAnswer = getAssistantCopy().defaultAnswer) => {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    setAssistantState({
      answer: fallbackAnswer,
      status: getAssistantCopy().emptyQuestion,
    });
    return;
  }

  const currentRequestId = ++assistantRequestId;
  pendingAssistantQuestion = trimmedQuestion;

  setAssistantState({
    answer: getAssistantCopy().loadingAnswer(trimmedQuestion),
    status: getAssistantCopy().loadingStatus,
    isLoading: true,
    disableInput: true,
  });

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: trimmedQuestion,
        language: currentLanguage,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || getAssistantCopy().requestError);
    }

    if (currentRequestId !== assistantRequestId) return;

    setAssistantState({
      answer: data.answer || fallbackAnswer,
      status: getAssistantCopy().followUpStatus,
    });
  } catch (error) {
    if (currentRequestId !== assistantRequestId) return;

    setAssistantState({
      answer: fallbackAnswer,
      status: error instanceof Error ? getAssistantCopy().requestError : getAssistantCopy().requestError,
    });
  } finally {
    if (currentRequestId === assistantRequestId) {
      pendingAssistantQuestion = "";
      setAssistantState({
        answer: answerBox?.textContent?.trim() ?? fallbackAnswer,
        status: askStatus?.textContent?.trim() ?? getAssistantCopy().defaultStatus,
        disableInput: false,
      });
    }
  }
};

questionChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    clearQuestionChipState();
    chip.classList.add("is-active");
    setAssistantState({
      answer: chip.dataset.answer ?? getAssistantCopy().defaultAnswer,
      status: getAssistantCopy().defaultStatus,
    });
  });
});

askForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = askInput?.value?.trim() ?? "";
  if (!question) {
    setAssistantState({
      answer: getAssistantCopy().defaultAnswer,
      status: getAssistantCopy().emptyQuestion,
    });
    askInput?.focus();
    return;
  }

  clearQuestionChipState();
  void askPortfolioAssistant(question);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
  revealObserver.observe(item);
});

const getCenteredRect = () => {
  const maxWidth = Math.min(window.innerWidth - 32, 560);
  const maxHeight = Math.min(window.innerHeight - 24, 820);
  const width = Math.min(maxWidth, maxHeight * 0.68);
  const height = Math.min(maxHeight, width / 0.68);

  return {
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
    width,
    height,
  };
};

const applyPanelRect = (rect) => {
  if (!modalPanel) return;
  modalPanel.style.top = `${rect.top}px`;
  modalPanel.style.left = `${rect.left}px`;
  modalPanel.style.width = `${rect.width}px`;
  modalPanel.style.height = `${rect.height}px`;
};

const applyPanelTransform = ({ x = 0, y = 0, scaleX = 1, scaleY = 1 }) => {
  if (!modalPanel) return;
  modalPanel.style.setProperty("--panel-x", `${x}px`);
  modalPanel.style.setProperty("--panel-y", `${y}px`);
  modalPanel.style.setProperty("--panel-scale-x", `${scaleX}`);
  modalPanel.style.setProperty("--panel-scale-y", `${scaleY}`);
};

const getTransformFromRect = (fromRect, toRect) => {
  const fromCenterX = fromRect.left + fromRect.width / 2;
  const fromCenterY = fromRect.top + fromRect.height / 2;
  const toCenterX = toRect.left + toRect.width / 2;
  const toCenterY = toRect.top + toRect.height / 2;

  return {
    x: fromCenterX - toCenterX,
    y: fromCenterY - toCenterY,
    scaleX: fromRect.width / toRect.width,
    scaleY: fromRect.height / toRect.height,
  };
};

const getTransformString = ({ x = 0, y = 0, scaleX = 1, scaleY = 1 }) =>
  `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`;

const cancelCollapseAnimation = () => {
  if (!collapseAnimation) return;
  collapseAnimation.cancel();
  collapseAnimation = null;
};

const clearModalTimers = () => {
  clearTimeout(closeTimer);
  clearTimeout(closeStageTimer);
  clearTimeout(flipTimer);
  cancelCollapseAnimation();
};

const setProjectCardScene = (element, scene = "idle") => {
  if (!(element instanceof HTMLElement)) return;

  element.classList.remove("is-hovered", "is-active-scene", "is-returning");

  if (scene === "hovered") {
    element.classList.add("is-hovered");
  }

  if (scene === "active") {
    element.classList.add("is-active-scene");
  }
};

const setModalCardScene = (scene = "idle") => {
  const modalCards = [
    modalFront?.querySelector(".project-card__button"),
    modalMirror?.querySelector(".project-card__button"),
  ];

  modalCards.forEach((card) => setProjectCardScene(card, scene));
};

const syncHoveredProjectCard = () => {
  if (!lastPointerPosition) return;

  if (projectModal && !projectModal.hidden && projectModal.classList.contains("is-visible")) {
    projectButtons.forEach((button) => {
      if (!button.classList.contains("is-source-hidden")) {
        setProjectCardScene(button, "idle");
      }
    });
    return;
  }

  const hoveredElement = document.elementFromPoint(
    lastPointerPosition.clientX,
    lastPointerPosition.clientY,
  );
  const hoveredButton = hoveredElement?.closest?.(".project-card__button");

  projectButtons.forEach((button) => {
    const isInteractive =
      !button.classList.contains("is-hover-suppressed") &&
      !button.classList.contains("is-source-hidden");

    if (isInteractive && button === hoveredButton) {
      setProjectCardScene(button, "hovered");
      return;
    }

    setProjectCardScene(button, "idle");
  });
};

const updatePointerPosition = (event) => {
  lastPointerPosition = { clientX: event.clientX, clientY: event.clientY };
};

const releaseSuppressedProjectHover = () => {
  suppressedHoverButton?.classList.remove("is-hover-suppressed");
  suppressedHoverButton = null;
};

const isPointerOutsideElement = (element) => {
  if (!(element instanceof HTMLElement) || !lastPointerPosition) return true;

  const { clientX, clientY } = lastPointerPosition;
  const rect = element.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
};

const queueSuppressedProjectHoverRelease = () => {
  requestAnimationFrame(() => {
    if (!suppressedHoverButton || isPointerOutsideElement(suppressedHoverButton)) {
      releaseSuppressedProjectHover();
    }
  });
};

const suppressProjectHover = (button) => {
  releaseSuppressedProjectHover();
  if (!(button instanceof HTMLElement)) return;

  suppressedHoverButton = button;
  suppressedHoverButton.classList.add("is-hover-suppressed");
};

const getProjectCardCloneMarkup = (button, { extraClasses = "", stripped = false, scene = "active" } = {}) => {
  const variantClasses = [...button.classList].filter((className) =>
    className.startsWith("project-card__button--"),
  );
  const cloneClasses = [
    "project-card__button",
    ...variantClasses,
    "project-card__button--modal",
    scene === "hovered" ? "is-hovered" : "",
    scene === "active" ? "is-active-scene" : "",
    extraClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const clone = document.createElement("div");
  clone.className = cloneClasses;
  clone.setAttribute("aria-hidden", "true");
  if (button.dataset.projectId) clone.dataset.projectId = button.dataset.projectId;
  if (button.dataset.coverProfile) clone.dataset.coverProfile = button.dataset.coverProfile;
  if (button.getAttribute("style")) clone.setAttribute("style", button.getAttribute("style"));
  clone.innerHTML = button.innerHTML;

  if (stripped) {
    clone
      .querySelectorAll(
        ".project-card__copy, .project-card__impact, .project-card__logo, .project-card__index, strong, .project-card__type, p",
      )
      .forEach((element) => element.remove());

    const echoPanel = document.createElement("span");
    echoPanel.className = "project-modal__echo-panel";
    const echoLines = document.createElement("span");
    echoLines.className = "project-modal__echo-lines";
    clone.append(echoPanel, echoLines);
  }

  return clone.outerHTML;
};

const syncModalCardScene = (button, { scene = "active" } = {}) => {
  if (!modalFront || !modalMirror) return;

  modalFront.innerHTML = getProjectCardCloneMarkup(button, {
    extraClasses: "project-modal__card",
    scene,
  });
  modalMirror.innerHTML = getProjectCardCloneMarkup(button, {
    extraClasses: "project-modal__card project-modal__card--echo",
    stripped: true,
    scene,
  });
};

const clearModalCardScene = () => {
  if (modalFront) modalFront.innerHTML = "";
  if (modalMirror) modalMirror.innerHTML = "";
};

const clearModalProjectContent = () => {
  const previewVideo = modalPreview?.querySelector("video");
  if (previewVideo instanceof HTMLVideoElement) {
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.querySelectorAll("source").forEach((source) => source.remove());
    previewVideo.load();
  }

  if (modalSignals) modalSignals.replaceChildren();
  if (modalPreview) modalPreview.replaceChildren();
  if (modalProofs) modalProofs.replaceChildren();
  if (modalProofTrigger) {
    modalProofTrigger.hidden = true;
    modalProofTrigger.textContent = getModalCopy().proofTrigger;
  }
  closeProofSheet();
};

const renderProjectSignals = (signals = []) => {
  if (!modalSignals) return;

  modalSignals.replaceChildren();
  modalSignals.hidden = signals.length === 0;

  signals.forEach((signal) => {
    const chip = document.createElement("span");
    chip.className = "project-modal__signal";
    chip.textContent = signal;
    modalSignals.append(chip);
  });
};

const createPreviewMedia = (preview) => {
  const hasVideo = Boolean(preview?.videoSrc);
  const mediaWrapper = hasVideo ? document.createElement("button") : document.createElement("div");
  mediaWrapper.className = "project-modal__preview-frame";

  if (hasVideo) {
    mediaWrapper.type = "button";
    mediaWrapper.classList.add("project-modal__preview-frame--interactive");
    mediaWrapper.dataset.previewPlay = "true";
    mediaWrapper.dataset.videoSrc = preview.videoSrc ?? "";
    mediaWrapper.dataset.videoType = preview.videoType ?? "video/mp4";
    mediaWrapper.setAttribute(
      "aria-label",
      getModalCopy().previewAria(preview.title ?? getModalCopy().previewVideoTitle),
    );
  } else {
    mediaWrapper.classList.add("project-modal__preview-frame--pending");
  }

  if (preview?.poster) {
    const poster = document.createElement("img");
    poster.className = "project-modal__preview-poster";
    poster.src = preview.poster;
    poster.alt = preview.label ?? "";
    poster.loading = "lazy";
    mediaWrapper.append(poster);
  }

  const overlay = document.createElement("div");
  overlay.className = "project-modal__preview-overlay";

  const badge = document.createElement("span");
  badge.className = "project-modal__preview-badge";
  badge.textContent = hasVideo ? getModalCopy().previewPlay : getModalCopy().previewPending;

  const play = document.createElement("span");
  play.className = "project-modal__preview-play";
  play.setAttribute("aria-hidden", "true");
  play.textContent = hasVideo ? "▶" : "•";

  const copy = document.createElement("div");
  copy.className = "project-modal__preview-copy";

  const title = document.createElement("strong");
  title.className = "project-modal__preview-title";
  title.textContent = preview?.title ?? getModalCopy().previewTitle;

  const note = document.createElement("p");
  note.className = "project-modal__preview-note";
  note.textContent = preview?.note ?? getModalCopy().previewNote;

  copy.append(title, note);
  overlay.append(badge, play, copy);
  mediaWrapper.append(overlay);

  return mediaWrapper;
};

const renderProjectGallery = (images) => {
  const gallery = document.createElement("div");
  gallery.className = "project-modal__gallery";

  const track = document.createElement("div");
  track.className = "project-modal__gallery-track";

  if (images.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "project-modal__gallery-placeholder";
    const icon = document.createElement("span");
    icon.className = "project-modal__gallery-placeholder-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🖼";
    const label = document.createElement("span");
    label.textContent = getModalCopy().galleryPending;
    placeholder.append(icon, label);
    track.append(placeholder);
    gallery.append(track);
    return gallery;
  }

  images.forEach(({ src, alt = "" }) => {
    const slide = document.createElement("div");
    slide.className = "project-modal__gallery-slide";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    slide.append(img);
    track.append(slide);
  });

  const btnPrev = document.createElement("button");
  btnPrev.type = "button";
  btnPrev.className = "project-modal__gallery-arrow project-modal__gallery-arrow--prev";
  btnPrev.setAttribute("aria-label", "Immagine precedente");
  btnPrev.textContent = "‹";

  const btnNext = document.createElement("button");
  btnNext.type = "button";
  btnNext.className = "project-modal__gallery-arrow project-modal__gallery-arrow--next";
  btnNext.setAttribute("aria-label", "Immagine successiva");
  btnNext.textContent = "›";

  const dotsEl = document.createElement("div");
  dotsEl.className = "project-modal__gallery-dots";
  const dots = images.map((_, i) => {
    const d = document.createElement("span");
    d.className = "project-modal__gallery-dot" + (i === 0 ? " is-active" : "");
    dotsEl.append(d);
    return d;
  });

  let current = 0;
  const goTo = (index) => {
    current = Math.max(0, Math.min(images.length - 1, index));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === images.length - 1;
  };

  btnPrev.addEventListener("click", () => goTo(current - 1));
  btnNext.addEventListener("click", () => goTo(current + 1));

  gallery.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(current - 1);
    else if (e.key === "ArrowRight") goTo(current + 1);
  });

  goTo(0);
  gallery.append(track, btnPrev, btnNext, dotsEl);
  return gallery;
};

const renderProjectPreview = (projectDetail) => {
  if (!modalPreview) return;

  modalPreview.replaceChildren();
  const preview = projectDetail.preview ?? {};
  const images = Array.isArray(preview.images) ? preview.images : [];

  modalPreview.append(renderProjectGallery(images));
};

const renderProjectProofs = (proofs = []) => {
  if (!modalProofs) return;

  modalProofs.replaceChildren();

  proofs.forEach((proof) => {
    const figure = document.createElement("figure");
    figure.className = "project-modal__proof";

    const image = document.createElement("img");
    image.className = "project-modal__proof-image";
    image.src = proof.src;
    image.alt = proof.alt ?? proof.title;
    image.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.className = "project-modal__proof-copy";

    const kicker = document.createElement("span");
    kicker.className = "project-modal__proof-kicker";
    kicker.textContent = "Real Signal";

    const title = document.createElement("strong");
    title.className = "project-modal__proof-title";
    title.textContent = proof.title;

    const description = document.createElement("p");
    description.className = "project-modal__proof-description";
    description.textContent = proof.description;

    caption.append(kicker, title, description);
    figure.append(image, caption);
    modalProofs.append(figure);
  });
};

const openProofSheet = () => {
  if (!modalProofSheet) return;
  modalProofSheet.hidden = false;
  projectModal?.classList.add("is-proof-open");
};

const closeProofSheet = () => {
  projectModal?.classList.remove("is-proof-open");
  if (modalProofSheet) modalProofSheet.hidden = true;
};

const renderProjectProofTrigger = (proofs = []) => {
  if (!modalProofTrigger) return;

  const hasProofs = proofs.length > 0;
  modalProofTrigger.hidden = !hasProofs;
  modalProofTrigger.textContent = hasProofs
    ? getModalCopy().proofTriggerWithCount(proofs.length)
    : getModalCopy().proofTrigger;
};

const populateModalContent = (projectDetail) => {
  if (!projectDetail) return;

  if (modalTitle) modalTitle.textContent = projectDetail.title ?? "Project";
  if (modalType) modalType.textContent = projectDetail.type ?? "Project Type";
  if (modalDescription) {
    modalDescription.innerHTML = projectDetail.description ?? projectDetail.frontIntro ?? "";
  }
 console.log(projectDetail);
 console.log("signals =", projectDetail.signals);
 console.log("Array?", Array.isArray(projectDetail.signals));
  renderProjectSignals(projectDetail.signals ?? []);
  renderProjectProofs(projectDetail.proofs ?? []);
  renderProjectProofTrigger(projectDetail.proofs ?? []);

  if (modalDomain) {
    const href = projectDetail.link ?? "";
    modalDomain.textContent = projectDetail.linkLabel ?? href;
    modalDomain.href = href || "#";
    modalDomain.hidden = !href;
  }

  if (modalGithub) {
    const href = projectDetail.githubLink ?? "";
    modalGithub.textContent = projectDetail.githubLabel ?? "GitHub";
    modalGithub.href = href || "#";
    modalGithub.hidden = !href;
  }

  if (modalGithubNote) {
    const note = projectDetail.githubNote ?? "";
    modalGithubNote.textContent = note;
    modalGithubNote.hidden = !note.trim();
  }

  if (modalMeta) {
    modalMeta.textContent = projectDetail.meta ?? "";
    modalMeta.hidden = !(projectDetail.meta ?? "").trim();
  }

  // --- ANTEPRIMA / IMMAGINE PROGETTO CORRETTA ---
  if (modalPreview) {
    if (projectDetail.image) {
      modalPreview.innerHTML = `
        <img src="${projectDetail.image}" 
             alt="${projectDetail.title}" 
             style="width: 100%; border-radius: 12px; margin-top: 1rem; object-fit: cover; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" 
             loading="lazy">
      `;
    } else {
      renderProjectPreview(projectDetail);
    }
  }
};

const lockBodyScroll = () => {
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = scrollbarGap > 0 ? `${scrollbarGap}px` : "";
};

const unlockBodyScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const openModal = (button) => {
  if (!projectModal || !modalPanel || !modalFront) return;

  releaseSuppressedProjectHover();

  const projectDetail = getProjectDetail(button);
  const startRect = button.getBoundingClientRect();
  const centeredRect = getCenteredRect();

  activeProjectData = projectDetail;
  populateModalContent(projectDetail);
  syncModalCardScene(button, { scene: "active" });
  projectButtons.forEach((item) => {
    setProjectCardScene(item, "idle");
    item.classList.remove("is-source-hidden");
  });

  activeProjectButton = button;
  clearModalTimers();
  setProjectCardScene(button, "idle");
  button.classList.add("is-source-hidden");

  projectModal.hidden = false;
  projectModal.classList.remove("is-closing");
  projectModal.classList.remove("is-collapsing");
  projectModal.classList.remove("is-open");
  applyPanelRect(centeredRect);
  applyPanelTransform({});
  projectModal.classList.add("is-visible");
  lockBodyScroll();
  cancelCollapseAnimation();
  const isPhoneViewport = window.innerWidth <= 560;
  const mobileOpenDelay = isPhoneViewport ? 520 : FLIP_DELAY_MS;
  collapseAnimation = modalPanel.animate(
    [
      {
        transform: getTransformString(getTransformFromRect(startRect, centeredRect)),
        opacity: 1,
      },
      {
        transform: getTransformString({}),
        opacity: 1,
      },
    ],
    {
      duration: PANEL_TRANSITION_MS,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "both",
    },
  );
  collapseAnimation.onfinish = () => {
    collapseAnimation = null;
  };
  collapseAnimation.oncancel = () => {
    collapseAnimation = null;
  };
  flipTimer = window.setTimeout(() => {
    projectModal.classList.add("is-open");
  }, mobileOpenDelay);
};

const closeModal = () => {
  if (!projectModal || !modalPanel) return;

  clearModalTimers();
  closeProofSheet();
  if (activeProjectButton) {
    suppressProjectHover(activeProjectButton);
    activeProjectButton.blur();
    setProjectCardScene(activeProjectButton, "idle");
    activeProjectButton.classList.add("is-source-hidden");
  }
  projectModal.classList.add("is-closing");
  projectModal.classList.remove("is-collapsing");
  projectModal.classList.remove("is-open");
  const centeredRect = getCenteredRect();
  applyPanelRect(centeredRect);
  applyPanelTransform({});

  closeStageTimer = window.setTimeout(() => {
    const targetRect = activeProjectButton?.getBoundingClientRect();
    if (!targetRect || !projectModal?.classList.contains("is-visible")) return;
    const currentRect = modalPanel.getBoundingClientRect();
    const fromTransform = getTransformFromRect(currentRect, targetRect);

    projectModal.classList.add("is-collapsing");
    setModalCardScene("idle");
    cancelCollapseAnimation();
    applyPanelRect(targetRect);
    applyPanelTransform({});
    collapseAnimation = modalPanel.animate(
      [
        {
          transform: getTransformString(fromTransform),
          opacity: 1,
        },
        {
          transform: getTransformString({}),
          opacity: 1,
        },
      ],
      {
        duration: CLOSE_COLLAPSE_MS,
        easing: "cubic-bezier(0.28, 0.2, 0.18, 1)",
        fill: "both",
      },
    );
    collapseAnimation.onfinish = () => {
      collapseAnimation = null;
    };
    collapseAnimation.oncancel = () => {
      collapseAnimation = null;
    };
  }, CLOSE_RETURN_DELAY_MS);

  closeTimer = window.setTimeout(() => {
    const returningButton = activeProjectButton;
    projectModal.classList.remove("is-closing");
    projectModal.classList.remove("is-collapsing");
    projectModal.classList.remove("is-visible");
    projectModal.hidden = true;
    cancelCollapseAnimation();
    applyPanelTransform({});
    clearModalCardScene();
    clearModalProjectContent();
    unlockBodyScroll();
    activeProjectButton = null;
    activeProjectData = null;

    if (returningButton) {
      setProjectCardScene(returningButton, "idle");
      returningButton.classList.remove("is-source-hidden");
      queueSuppressedProjectHoverRelease();
    }
  }, CLOSE_RETURN_DELAY_MS + CLOSE_COLLAPSE_MS + MODAL_EXIT_BUFFER_MS);
};

projectButtons.forEach((button) => {
  button.addEventListener("click", () => openModal(button));
});

modalPreview?.addEventListener("click", async (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-preview-play='true']") : null;
  if (!(trigger instanceof HTMLButtonElement) || !activeProjectData?.preview?.videoSrc) return;

  const frame = document.createElement("div");
  frame.className = "project-modal__preview-frame";
  const video = document.createElement("video");
  video.className = "project-modal__preview-video";
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.poster = activeProjectData.preview.poster ?? "";

  const source = document.createElement("source");
  source.src = activeProjectData.preview.videoSrc;
  source.type = activeProjectData.preview.videoType ?? "video/mp4";
  video.append(source);

  frame.append(video);
  trigger.replaceWith(frame);

  try {
    await video.play();
  } catch (_error) {
    video.controls = true;
  }
});

modalProofTrigger?.addEventListener("click", () => {
  if (!activeProjectData?.proofs?.length) return;
  openProofSheet();
});

projectModal?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.close === "true") {
    closeModal();
    return;
  }
  if (target.dataset.proofClose === "true") {
    closeProofSheet();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setTopbarMenuState(false);
    if (projectModal?.classList.contains("is-proof-open")) {
      closeProofSheet();
      return;
    }
    closeModal();
  }
});

window.addEventListener(
  "pointermove",
  (event) => {
    updatePointerPosition(event);

    if (suppressedHoverButton && isPointerOutsideElement(suppressedHoverButton)) {
      releaseSuppressedProjectHover();
      return;
    }

    syncHoveredProjectCard();
  },
  { passive: true },
);

window.addEventListener(
  "pointerdown",
  (event) => {
    updatePointerPosition(event);
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  setTopbarMenuState(false);

  if (!projectModal || projectModal.hidden || !projectModal.classList.contains("is-visible")) return;
  const centeredRect = getCenteredRect();

  if (projectModal.classList.contains("is-closing") && activeProjectButton) {
    if (projectModal.classList.contains("is-collapsing")) {
      const targetRect = activeProjectButton.getBoundingClientRect();
      applyPanelRect(targetRect);
      applyPanelTransform({});
      return;
    }

    applyPanelRect(centeredRect);
    applyPanelTransform({});
    return;
  }

  applyPanelRect(centeredRect);

  if (!projectModal.classList.contains("is-open") && activeProjectButton) {
    applyPanelTransform(getTransformFromRect(activeProjectButton.getBoundingClientRect(), centeredRect));
    return;
  }

  applyPanelTransform({});
});

const LOADER_HARD_TIMEOUT_MS = 5000;
const loaderStartTime = performance.now();
const completeInitialLoad = () => {
  const elapsed = performance.now() - loaderStartTime;
  const remaining = Math.max(0, LOADER_MIN_VISIBLE_MS - elapsed);
  window.setTimeout(dismissSiteLoader, remaining);
};

window.setTimeout(() => {
  if (siteLoader instanceof HTMLElement && siteLoader.dataset.dismissed !== "true") {
    console.warn("[loader] Hard timeout fired — dismissing loader. Check console for upstream errors.");
    dismissSiteLoader();
  }
}, LOADER_HARD_TIMEOUT_MS);

if (document.readyState === "complete") {
  completeInitialLoad();
} else {
  window.addEventListener("load", completeInitialLoad, { once: true });
}

/* ── Year navigation ── */
const YEARS = ["2023-2024", "2024-2025", "2025-2026"];
const YEAR_LABELS = { "2023-2024": "A.S. 2023/2024", "2024-2025": "A.S. 2024/2025", "2025-2026": "A.S. 2025/2026" };
let currentYearIndex = 0;

const getFirstCardForYear = (year) =>
  projectGrid?.querySelector(`.project-card[data-year="${year}"]`) ?? null;

const scrollToYear = (index) => {
  const year = YEARS[index];
  const target = getFirstCardForYear(year);
  if (!target || !projectGrid) return;
  const gridRect = projectGrid.getBoundingClientRect();
  const cardRect = target.getBoundingClientRect();
  projectGrid.scrollBy({ left: cardRect.left - gridRect.left, behavior: "smooth" });
};

const setYearIndex = (index) => {
  currentYearIndex = index;
  if (yearLabel) yearLabel.textContent = YEAR_LABELS[YEARS[index]];
  if (yearPrevBtn) yearPrevBtn.disabled = index === 0;
  if (yearNextBtn) yearNextBtn.disabled = index === YEARS.length - 1;
  scrollToYear(index);
};

const detectCurrentYear = () => {
  if (!projectGrid) return;
  const gridLeft = projectGrid.getBoundingClientRect().left;
  for (let i = YEARS.length - 1; i >= 0; i--) {
    const card = getFirstCardForYear(YEARS[i]);
    if (card && card.getBoundingClientRect().left - gridLeft <= 8) {
      if (i !== currentYearIndex) {
        currentYearIndex = i;
        if (yearLabel) yearLabel.textContent = YEAR_LABELS[YEARS[i]];
        if (yearPrevBtn) yearPrevBtn.disabled = i === 0;
        if (yearNextBtn) yearNextBtn.disabled = i === YEARS.length - 1;
      }
      break;
    }
  }
};

yearPrevBtn?.addEventListener("click", () => {
  if (currentYearIndex > 0) setYearIndex(currentYearIndex - 1);
});

yearNextBtn?.addEventListener("click", () => {
  if (currentYearIndex < YEARS.length - 1) setYearIndex(currentYearIndex + 1);
});

projectGrid?.addEventListener("scroll", detectCurrentYear, { passive: true });
