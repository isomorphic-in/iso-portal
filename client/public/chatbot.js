/**
 * ISO Chatbot - Embeddable Customizable Widget
 * Built by Isomorphic.
 * 
 * Simply add: <script src="chatbot.js"></script>
 * The script calls the configuration API first, applies botUIConfigs,
 * and renders the customizable welcome message as soon as the bot opens.
 */

(function () {
  // Prevent double loading
  if (window.IsoChatbotInitialized) return;
  window.IsoChatbotInitialized = true;

  // Default API Endpoints (points to live hosted Render middleware)
  const HOSTED_MIDDLEWARE_URL = "https://iso-middleware-1epx.onrender.com";
  const DEFAULT_CONFIG_API_URL = `${HOSTED_MIDDLEWARE_URL}/api/bot-config`;
  const DEFAULT_CHAT_API_URL = `${HOSTED_MIDDLEWARE_URL}/api/chat`;

  // Sleek Chatbot Bubble SVG
  const CHAT_LAUNCHER_SVG = `
    <svg class="iso-chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  `;
  const ISO_LOGO_SVG = CHAT_LAUNCHER_SVG;

  // --------------------------------------------------------
  // 1. DEFAULT CONFIGURATION
  // --------------------------------------------------------
  const DEFAULT_CONFIG = {
    _id: "6a97bb88eabe0901e52bb290",
    botId: "ISOBot",
    tenantId: "onestop",
    teanantId: "onestop",
    botName: "ISO Bot",
    chatApiUrl: DEFAULT_CHAT_API_URL,
    updatedSince: "2026-09-01T07:45:06.258Z",
    greetingMessage: [
      "Hi! I’m ISO, your AI assistant. I specialize in helping students with their questions and solving common academic or technology-related issues. How can I assist you today?"
    ],
    botActive: true,
    enableTicketing: true,
    ticketingConfig: {
      enabled: true,
      defaultDepartment: "General Support",
      defaultPriority: "medium",
      slaHours: 48,
      requireStudentId: false,
      notificationEmail: "",
      escalationMessage: "I am connecting you with our support team. Please complete your details below to create a support ticket:"
    },
    customForms: [
      {
        type: "form",
        name: "transferCall",
        intent: ["transfer_call", "ticket", "grievance", "talk to human", "live agent"],
        status: "enabled",
        title: "Create Support Ticket / Request Assistance",
        showCancelledButton: true,
        payload: {
          fields: [
            { title: "Full Name", name: "FullName", type: "text", validate: { required: true } },
            { title: "Email Address", name: "Email", type: "email", validate: { required: true, email: true } },
            { title: "Phone Number", name: "Phone", type: "tel", validate: { required: true } },
            { title: "Username / Student ID (Optional)", name: "username", type: "text", validate: { required: false } },
            { title: "Issue Details & Summary", name: "AdditionalInformation", type: "textarea", validate: { required: true } },
            { title: "Escalated", name: "status", type: "hidden", validate: { required: false } }
          ],
          submitButtonTitle: "Submit Ticket",
          postbackUrl: "",
          method: "POST"
        }
      },
      {
        type: "form",
        name: "survey",
        intent: ["smalltalk.greetings.bye", "end_chat"],
        status: "enabled",
        title: "Post Chat Survey & Feedback",
        showCancelledButton: false,
        showDownloadButton: true,
        payload: {
          fields: [
            { title: "Rating", name: "rating", type: "rating", validate: { required: true } },
            { title: "Feedback Comments", name: "feedback", type: "textarea", validate: { required: false } },
            { title: "Closed", name: "status", type: "hidden", validate: { required: false } }
          ],
          submitButtonTitle: "Submit Feedback",
          downloadTranscriptButtonTitle: "Download Transcript",
          postbackUrl: "",
          method: "POST"
        }
      }
    ],
    botUIConfigs: {
      botThemeColor: "#0A2240",
      botAccentColor: "#C5A059",
      botChatStartImage: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
      botResponseBackgroundColor: "#FFFFFF",
      userQueryBackgroundColor: "#0A2240",
      botResponseFontColor: "#0F172A",
      userQueryFontColor: "#FFFFFF",
      bgColor: "#F8FAFC",
      logoUrl: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
      botHeaderText: "Isomorphic AI",
      botStatusText: "Online",
      DefaultEmptyMessage: "Type your message...",
      helpNotificationRenderTime: 10000,
      helpNotificationRenderMsg: "Hi! I am CoolBot, an AI chatbot. I can provide answers to your technology questions and resources to resolve some of the most common issues.",
      idleStatMessages: [
        { message: "I’m waiting for your next question", time: 180 },
        { message: "Since there was no response, we are ending this chat session. Please re-initiate anytime.", time: 240 }
      ],
      chatPosition: "fixed",
      chatPositionLeft: "auto",
      chatAlignmentLeft: false,
      chatPositionRight: "30px",
      chatPositionTop: "auto",
      chatPositionBottom: "20px",
      chatIconWidth: "90",
      chatIconHeight: "90",
      chatMobileIconWidth: "70",
      chatMobileIconHeight: "70",
      chatMobileVerticalIconWidth: "90",
      chatMobileVerticalIconHeight: "90",
      chatIconAltText: "Chat with Us",
      chatIconTitleText: "Chat with Us",
      allowMultiLangSupport: false,
      enableStreaming: true,
      likeIcon: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/dba2acac-c841-47b7-be3f-106ed4b66fef.png",
      dislikeIcon: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a91652f3-c1f1-4396-8aab-45793777ef09.png",
      botChatSubmitButton: true,
      isChatOpened: false,
      transferFormDelay: 1,
      showThumbUpDownFeedbackform: true,
      showHelpButton: true,
      helpButtonUrl: "https://vsc.blackbelthelp.com/help",
      poweredBy: "AI powered by <span>Isomorphic</span>",
      notifications: []
    },
    apiEndpoint: "",
    configEndpoint: "",
    persistHistory: false,
    quickReplies: [
      "Academic Assistance",
      "Technology Support",
      "Transfer to Live Agent",
      "End Chat Session"
    ]
  };

  // State Management
  let config = deepMerge({}, DEFAULT_CONFIG);
  let isChatOpen = false;
  let isMinimized = false;
  let isTyping = false;
  let chatHistory = [];
  let isSessionEnded = false;
  let currentSpeakingUtterance = null;
  let activeSpeechBtn = null;

  // Timers
  let helpNotificationTimer = null;
  let helpNotificationDismissed = false;
  let idleCheckInterval = null;
  let idleSeconds = 0;
  let idleMessagesSentCount = 0;

  // DOM References
  let widgetContainer = null;
  let chatToggle = null;
  let chatWindow = null;
  let chatBody = null;
  let textInput = null;
  let sendButton = null;
  let micButton = null;
  let scrollBottomBtn = null;
  let helpNotificationEl = null;

  // --------------------------------------------------------
  // 2. HELPER UTILITIES
  // --------------------------------------------------------
  function parseMongoNumber(val, defaultVal = 0) {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === "number") return val;
    if (typeof val === "object") {
      if (val.$numberInt !== undefined) return parseInt(val.$numberInt, 10);
      if (val.$numberLong !== undefined) return parseInt(val.$numberLong, 10);
    }
    if (typeof val === "string") {
      const cleaned = val.replace(/NumberInt\(['"]?(\d+)['"]?\)/, "$1");
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? defaultVal : parsed;
    }
    return defaultVal;
  }

  function normalizeUnit(val, defaultVal = "auto") {
    if (val === null || val === undefined) return defaultVal;
    val = String(val).trim();
    if (val === "" || val === "auto") return "auto";
    if (/^\d+$/.test(val)) return `${val}px`;
    return val;
  }

  function getContrastColor(hexColor, fallbackLight = "#ffffff", fallbackDark = "#1E293B") {
    if (!hexColor || typeof hexColor !== "string" || !hexColor.startsWith("#")) {
      return fallbackDark;
    }
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6 && hex.length !== 3) return fallbackDark;
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? fallbackDark : fallbackLight;
  }

  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (Array.isArray(source[key])) {
          output[key] = source[key].slice();
        } else if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item));
  }

  function normalizeConfigs(cfg) {
    if (!cfg || !cfg.botUIConfigs) return cfg;
    const ui = cfg.botUIConfigs;
    if (ui.helpNotificationRenderTime !== undefined) {
      ui.helpNotificationRenderTime = parseMongoNumber(ui.helpNotificationRenderTime, 10000);
    }
    if (ui.transferFormDelay !== undefined) {
      ui.transferFormDelay = parseMongoNumber(ui.transferFormDelay, 1);
    }
    if (Array.isArray(ui.idleStatMessages)) {
      ui.idleStatMessages.forEach(item => {
        item.time = parseMongoNumber(item.time, 180);
      });
      ui.idleStatMessages.sort((a, b) => a.time - b.time);
    }
    return cfg;
  }

  function applyLoadedConfig(loadedData) {
    if (!loadedData) return;
    if (loadedData.botUIConfigs) {
      config = deepMerge(config, loadedData);
    } else {
      config.botUIConfigs = deepMerge(config.botUIConfigs, loadedData);
      if (loadedData.botName) config.botName = loadedData.botName;
      if (loadedData.botId) config.botId = loadedData.botId;
    }

    if (loadedData.enableTicketing !== undefined) {
      config.enableTicketing = Boolean(loadedData.enableTicketing);
    }
    if (loadedData.ticketingConfig) {
      config.ticketingConfig = deepMerge(config.ticketingConfig || {}, loadedData.ticketingConfig);
      if (config.ticketingConfig.enabled !== undefined) {
        config.enableTicketing = Boolean(config.ticketingConfig.enabled);
      }
    }

    if (loadedData.greetingMessage) {
      config.greetingMessage = loadedData.greetingMessage;
      if (!config.botUIConfigs) config.botUIConfigs = {};
      config.botUIConfigs.greetingMessage = Array.isArray(loadedData.greetingMessage) ? loadedData.greetingMessage : [loadedData.greetingMessage];
      config.botUIConfigs.welcomeMessage = Array.isArray(loadedData.greetingMessage) ? loadedData.greetingMessage[0] : loadedData.greetingMessage;
    }

    if (loadedData.tenantId || loadedData.teanantId) {
      config.tenantId = loadedData.tenantId || loadedData.teanantId;
      config.teanantId = config.tenantId;
    }
    if (loadedData.chatApiUrl || loadedData.apiEndpoint) {
      config.chatApiUrl = loadedData.chatApiUrl || loadedData.apiEndpoint;
      config.apiEndpoint = config.chatApiUrl;
    }

    // Filter quickReplies if ticketing is disabled
    if (config.enableTicketing === false) {
      config.quickReplies = (config.quickReplies || []).filter(r => !/transfer|live agent|ticket|grievance/i.test(r));
    }
  }

  // --------------------------------------------------------
  // 3. API CONFIG LOADER
  // --------------------------------------------------------
  async function fetchBotConfiguration() {
    let scriptBotId = null;
    let scriptTenantId = null;
    const currentScript = document.currentScript || 
      document.querySelector("script[src*='chatbot.js']") || 
      document.getElementById('iso-chatbot-script');

    if (currentScript) {
      scriptBotId = currentScript.getAttribute("data-bot-id") || currentScript.getAttribute("data-botid") || currentScript.getAttribute("data-bot");
      scriptTenantId = currentScript.getAttribute("data-tenant-id") || currentScript.getAttribute("data-tenantid") || currentScript.getAttribute("data-tenant") || currentScript.getAttribute("data-teanant-id");
      const chatApi = currentScript.getAttribute("data-chat-api") || currentScript.getAttribute("data-api-endpoint");
      if (chatApi) {
        config.chatApiUrl = chatApi;
        config.apiEndpoint = chatApi;
      }
    }

    let botId = scriptBotId || window.botId || (window.botSettings && window.botSettings.botId) || config.botId;
    let tenantId = scriptTenantId || window.tenantId || window.teanantId || (window.botSettings && (window.botSettings.tenantId || window.botSettings.teanantId)) || config.tenantId;
    config.botId = botId;
    config.tenantId = tenantId;
    config.teanantId = tenantId;

    let apiEndpoint = DEFAULT_CONFIG_API_URL;
    if (config.configEndpoint) apiEndpoint = config.configEndpoint;

    try {
      const separator = apiEndpoint.includes("?") ? "&" : "?";
      const fetchUrl = `${apiEndpoint}${separator}botId=${encodeURIComponent(botId)}&tenantId=${encodeURIComponent(tenantId)}`;
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        applyLoadedConfig(data);
      }
    } catch (e) {
      console.warn("[ISO Chatbot] Configuration fetch fallback to defaults:", e.message);
    }

    normalizeConfigs(config);
  }

  // --------------------------------------------------------
  // 4. STYLE INJECTION (Modern CSS with Streaming & a11y)
  // --------------------------------------------------------
  function injectStyles() {
    const styleId = "iso-theme-styles";
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      const target = document.head || document.getElementsByTagName("head")[0] || document.documentElement || document.body;
      if (target) {
        target.appendChild(styleEl);
      }
    }
    if (!styleEl) return;

    const ui = config.botUIConfigs || {};
    const primaryColor = ui.botThemeColor || "#00306D";
    const bgColor = ui.bgColor || "#ffffff";
    const botMsgBg = ui.botResponseBackgroundColor || "#F1F5F9";
    const userMsgBg = ui.userQueryBackgroundColor || primaryColor;
    const botMsgColor = ui.botResponseFontColor || "#0F172A";
    const userMsgColor = ui.userQueryFontColor || "#FFFFFF";

    const posBottom = normalizeUnit(ui.chatPositionBottom, "20px");
    const isAlignLeft = ui.chatAlignmentLeft === true || (ui.chatPositionLeft && ui.chatPositionLeft !== "auto");
    const posLeft = isAlignLeft ? normalizeUnit(ui.chatPositionLeft || "30px") : "auto";
    const posRight = !isAlignLeft ? normalizeUnit(ui.chatPositionRight || "30px") : "auto";

    styleEl.innerHTML = `
      :root {
        --iso-primary: ${primaryColor};
        --iso-primary-dark: #00224f;
        --iso-bg: ${bgColor};
        --iso-bot-msg-bg: ${botMsgBg};
        --iso-bot-msg-color: ${botMsgColor};
        --iso-user-msg-bg: ${userMsgBg};
        --iso-user-msg-color: ${userMsgColor};
        --iso-header-text-color: ${ui.botHeaderTextColor || "#FFFFFF"};
        --iso-header-status-color: ${ui.botHeaderStatusColor || "rgba(255, 255, 255, 0.85)"};
      }

      .iso-container {
        position: fixed;
        bottom: ${posBottom};
        right: ${posRight};
        left: ${posLeft};
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      /* Launcher Toggle Button */
      .iso-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--iso-primary);
        color: #ffffff;
        border: none;
        outline: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        position: relative;
      }
      .iso-toggle:hover {
        transform: scale(1.06);
        box-shadow: 0 14px 28px -4px rgba(0, 0, 0, 0.3);
      }
      .iso-toggle svg { width: 28px; height: 28px; }
      .iso-toggle .iso-close-icon { display: none; }
      .iso-toggle.iso-active .iso-chat-icon,
      .iso-toggle.iso-active .iso-start-img { display: none; }
      .iso-toggle.iso-active .iso-close-icon { display: block; }

      /* Help callout popup */
      .iso-help-callout {
        position: absolute;
        bottom: 74px;
        right: 0;
        width: 270px;
        background: #ffffff;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
        padding: 12px 14px;
        font-size: 13px;
        color: #1E293B;
        z-index: 1000000;
        animation: isoFadeInUp 0.3s ease;
      }
      .iso-callout-close {
        position: absolute;
        top: 6px;
        right: 8px;
        background: transparent;
        border: none;
        font-size: 16px;
        color: #94A3B8;
        cursor: pointer;
      }

      /* Main Chat Window */
      .iso-window {
        display: none;
        position: absolute;
        bottom: 74px;
        right: 0;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 600px;
        max-height: calc(100vh - 110px);
        background-color: var(--iso-bg);
        border-radius: 16px;
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid #E2E8F0;
        flex-direction: column;
        overflow: hidden;
        animation: isoWindowOpen 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .iso-window.iso-open { display: flex; }
      .iso-window.iso-minimized {
        height: 56px;
        overflow: hidden;
      }

      /* Window Header */
      .iso-header {
        background-color: var(--iso-primary);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #FFFFFF;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      }
      .iso-header-info { display: flex; align-items: center; gap: 10px; }
      .iso-avatar-wrapper { position: relative; width: 34px; height: 34px; }
      .iso-header-logo img, .iso-header-logo svg {
        width: 34px; height: 34px; border-radius: 50%; object-fit: contain; background: rgba(255,255,255,0.15);
      }
      .iso-status-indicator {
        position: absolute; bottom: 0; right: 0; width: 9px; height: 9px;
        background-color: #10B981; border: 2px solid var(--iso-primary); border-radius: 50%;
      }
      .iso-header-text { display: flex; flex-direction: column; }
      .iso-bot-name { font-weight: 700; font-size: 14px; color: var(--iso-header-text-color); }
      .iso-bot-status { font-size: 11px; color: var(--iso-header-status-color); }

      .iso-header-actions { display: flex; align-items: center; gap: 4px; }
      .iso-header-btn {
        background: transparent; border: none; color: #FFFFFF; width: 28px; height: 28px;
        border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        opacity: 0.85; transition: background 0.15s, opacity 0.15s;
      }
      .iso-header-btn:hover { background: rgba(255, 255, 255, 0.2); opacity: 1; }
      .iso-header-btn svg { width: 16px; height: 16px; }

      /* Messages Body */
      .iso-body {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #F8FAFC;
        scroll-behavior: smooth;
        position: relative;
      }

      /* Floating Scroll Bottom Button */
      .iso-scroll-bottom-btn {
        position: absolute;
        bottom: 12px;
        right: 14px;
        background: #FFFFFF;
        border: 1px solid #CBD5E1;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        z-index: 10;
        color: var(--iso-primary);
        transition: transform 0.15s;
      }
      .iso-scroll-bottom-btn:hover { transform: scale(1.1); }
      .iso-scroll-bottom-btn svg { width: 16px; height: 16px; }

      /* Message Items */
      .iso-message { display: flex; gap: 8px; max-width: 88%; }
      .iso-message-bot { align-self: flex-start; }
      .iso-message-user { align-self: flex-end; flex-direction: row-reverse; }

      .iso-msg-avatar {
        width: 26px; height: 26px; border-radius: 50%; shrink-0;
        background: var(--iso-primary); color: #FFF; display: flex; align-items: center; justify-content: center;
        margin-top: 2px;
      }
      .iso-msg-avatar img, .iso-msg-avatar svg { width: 100%; height: 100%; border-radius: 50%; object-fit: contain; }

      .iso-bubble-wrapper { display: flex; flex-direction: column; gap: 4px; }
      .iso-msg-bubble {
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
      }
      .iso-message-bot .iso-msg-bubble {
        background-color: var(--iso-bot-msg-bg);
        color: var(--iso-bot-msg-color);
        border-top-left-radius: 3px;
        border: 1px solid #E2E8F0;
      }
      .iso-message-user .iso-msg-bubble {
        background-color: var(--iso-user-msg-bg);
        color: var(--iso-user-msg-color);
        border-top-right-radius: 3px;
      }

      .iso-msg-time { font-size: 10px; color: #94A3B8; margin-top: 2px; padding: 0 2px; }
      .iso-message-user .iso-msg-time { text-align: right; }

      /* Streaming Blinking Cursor */
      .iso-stream-cursor {
        display: inline-block;
        width: 6px;
        height: 14px;
        background: var(--iso-primary);
        vertical-align: middle;
        margin-left: 2px;
        animation: isoBlink 0.8s infinite;
      }

      /* Markdown Formats & Tables */
      .iso-md-table-wrap { overflow-x: auto; margin: 8px 0; border: 1px solid #CBD5E1; border-radius: 6px; }
      .iso-md-table { width: 100%; border-collapse: collapse; font-size: 11px; background: #FFF; }
      .iso-md-table th { background: #F1F5F9; font-weight: 700; padding: 6px 8px; border: 1px solid #CBD5E1; text-align: left; }
      .iso-md-table td { padding: 6px 8px; border: 1px solid #E2E8F0; }
      .iso-md-link { color: #0284C7; text-decoration: underline; }
      .iso-md-inline-code { background: #E2E8F0; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 11px; }

      /* Code Blocks */
      .iso-code-block { margin: 8px 0; background: #0F172A; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
      .iso-code-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; background: #1E293B; color: #94A3B8; font-size: 10px; font-family: monospace; }
      .iso-copy-code-btn { background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
      .iso-copy-code-btn:hover { color: #FFF; background: #334155; }
      .iso-code-block pre { margin: 0; padding: 8px 10px; overflow-x: auto; color: #F8FAFC; font-size: 11px; font-family: monospace; }

      /* Source Citations */
      .iso-sources-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
      .iso-source-chip {
        font-size: 10px; font-weight: 600; color: #0284C7; background: #E0F2FE;
        border: 1px solid #BAE6FD; border-radius: 12px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 3px;
      }

      /* Bot Message Feedback & Action Row */
      .iso-feedback-row { display: flex; align-items: center; gap: 4px; margin-top: 3px; }
      .iso-feedback-btn {
        background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 3px; border-radius: 4px;
        display: flex; align-items: center; justify-content: center; transition: color 0.15s, background 0.15s;
      }
      .iso-feedback-btn:hover { color: #1E293B; background: #E2E8F0; }
      .iso-feedback-btn.iso-voted-like { color: #10B981; }
      .iso-feedback-btn.iso-voted-dislike { color: #EF4444; }
      .iso-feedback-btn.iso-speaking { color: var(--iso-primary); animation: isoPulse 1.2s infinite; }
      .iso-feedback-btn svg { width: 14px; height: 14px; }
      .iso-feedback-note { font-size: 10px; color: #64748B; margin-left: 4px; }

      /* Quick Replies Area */
      .iso-quick-replies {
        padding: 6px 12px; display: flex; flex-wrap: wrap; gap: 6px; background: #F8FAFC; border-top: 1px solid #E2E8F0;
      }
      .iso-quick-reply-btn {
        background: #FFFFFF; border: 1px solid #CBD5E1; color: var(--iso-primary);
        border-radius: 16px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer;
        transition: all 0.15s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      .iso-quick-reply-btn:hover {
        background: var(--iso-primary); color: #FFFFFF; border-color: var(--iso-primary);
      }

      /* Forms Container (Ticketing & Survey) */
      .iso-form-container {
        background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.04); margin-top: 6px; width: 100%; box-sizing: border-box;
      }
      .iso-form-title { font-weight: 700; font-size: 12px; color: #1E293B; margin-bottom: 8px; border-bottom: 1px solid #F1F5F9; pb: 4px; }
      .iso-form-group { margin-bottom: 8px; }
      .iso-form-label { display: block; font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px; }
      .iso-form-input, .iso-form-textarea, .iso-form-select {
        width: 100%; box-sizing: border-box; border: 1px solid #CBD5E1; border-radius: 6px; padding: 6px 8px;
        font-size: 12px; color: #0F172A; outline: none; background: #F8FAFC;
      }
      .iso-form-input:focus, .iso-form-textarea:focus, .iso-form-select:focus {
        border-color: var(--iso-primary); background: #FFF;
      }
      .iso-form-actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
      .iso-form-submit {
        background: var(--iso-primary); color: #FFF; border: none; border-radius: 6px; padding: 6px 14px;
        font-size: 11px; font-weight: 700; cursor: pointer;
      }
      .iso-form-cancel, .iso-form-download {
        background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; border-radius: 6px; padding: 6px 10px;
        font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
      }

      /* Star Ratings */
      .iso-rating-group { display: flex; gap: 4px; }
      .iso-star-btn { background: transparent; border: none; font-size: 20px; color: #CBD5E1; cursor: pointer; padding: 0; }
      .iso-star-btn.iso-star-active { color: #F59E0B; }

      /* Input Area */
      .iso-input-area {
        padding: 10px 14px; background: #FFFFFF; border-top: 1px solid #E2E8F0; display: flex; align-items: center; gap: 8px;
      }
      .iso-input-wrapper {
        flex: 1; display: flex; align-items: center; background: #F1F5F9; border-radius: 20px; border: 1px solid #E2E8F0; padding: 2px 8px 2px 14px;
      }
      .iso-input-wrapper input {
        flex: 1; background: transparent; border: none; outline: none; font-size: 13px; color: #0F172A; padding: 6px 0;
      }
      .iso-mic-btn {
        background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px; display: flex; align-items: center;
      }
      .iso-mic-btn.iso-recording { color: #EF4444; animation: isoPulse 1s infinite; }
      .iso-send-btn {
        width: 34px; height: 34px; border-radius: 50%; background: var(--iso-primary); color: #FFFFFF;
        border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; shrink-0;
        transition: opacity 0.15s, transform 0.15s;
      }
      .iso-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .iso-send-btn:not(:disabled):hover { transform: scale(1.05); }
      .iso-send-btn svg { width: 16px; height: 16px; }

      /* Typing Indicator */
      .iso-typing-bubble { display: flex; align-items: center; gap: 4px; padding: 10px 14px; }
      .iso-dot { width: 6px; height: 6px; background: #94A3B8; border-radius: 50%; animation: isoDotBounce 1.4s infinite ease-in-out both; }
      .iso-dot:nth-child(1) { animation-delay: -0.32s; }
      .iso-dot:nth-child(2) { animation-delay: -0.16s; }

      /* Branding Footer */
      .iso-branding {
        text-align: center; padding: 4px; font-size: 10px; color: #94A3B8; background: #FFFFFF; border-top: 1px solid #F8FAFC;
      }
      .iso-branding span { font-weight: 700; color: #64748B; }

      /* Animations */
      @keyframes isoFadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes isoWindowOpen { from { opacity: 0; transform: scale(0.95) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes isoBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes isoPulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
      @keyframes isoDotBounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

      /* Mobile responsiveness */
      @media (max-width: 480px) {
        .iso-window {
          width: 100vw; height: calc(100vh - 80px); max-width: 100vw; max-height: calc(100vh - 80px);
          bottom: 0; right: 0; left: 0; border-radius: 16px 16px 0 0;
        }
        .iso-container { bottom: 12px; right: 12px; left: auto; }
      }
    `;
  }

  function renderLogoHtml(logoUrl, altName) {
    if (logoUrl && typeof logoUrl === "string" && logoUrl.trim() !== "") {
      return `<img src="${logoUrl}" alt="${altName || 'Bot'}" class="iso-logo-img" />`;
    }
    return ISO_LOGO_SVG;
  }

  function renderFeedbackIcon(iconUrl, type) {
    if (iconUrl && typeof iconUrl === "string" && iconUrl.trim() !== "") {
      return `<img src="${iconUrl}" alt="${type}" style="width:14px;height:14px;object-fit:contain;" />`;
    }
    if (type === "like") {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>`;
  }

  // --------------------------------------------------------
  // 5. DOM CREATION & EVENT BINDINGS
  // --------------------------------------------------------
  function createChatbotDOM() {
    if (widgetContainer && document.body && document.body.contains(widgetContainer)) return;

    const parent = document.body || document.getElementsByTagName("body")[0] || document.documentElement;
    if (!parent) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createChatbotDOM);
      } else {
        setTimeout(createChatbotDOM, 50);
      }
      return;
    }

    const ui = config.botUIConfigs || {};

    widgetContainer = document.createElement("div");
    widgetContainer.className = "iso-scope iso-container";
    if (ui.chatAlignmentLeft === true || (ui.chatPositionLeft && ui.chatPositionLeft !== "auto")) {
      widgetContainer.classList.add("iso-container-left");
    }

    const headerTitle = ui.botHeaderText || config.botName || "ISO AI";
    const startImage = ui.botChatStartImage || config.botChatStartImage || ui.logoUrl || config.botLogo;
    const headerLogo = startImage || ISO_LOGO_SVG;

    const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    const minimizeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    const helpIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    const sendIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    const micIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
    const downArrowIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`;

    widgetContainer.innerHTML = `
      <div class="iso-help-callout" id="iso-help-callout" style="display: none;" role="alert">
        <button class="iso-callout-close" aria-label="Dismiss">&times;</button>
        <div class="iso-callout-content">${ui.helpNotificationRenderMsg || ""}</div>
      </div>

      <div class="iso-window" aria-hidden="true" role="dialog" aria-label="${headerTitle} Chat">
        <div class="iso-header">
          <div class="iso-header-info">
            <div class="iso-avatar-wrapper">
              <div class="iso-header-logo">
                ${renderLogoHtml(headerLogo, headerTitle)}
              </div>
              <span class="iso-status-indicator"></span>
            </div>
            <div class="iso-header-text">
              <span class="iso-bot-name">${headerTitle}</span>
              <span class="iso-bot-status">${ui.botStatusText || "Online"}</span>
            </div>
          </div>
          <div class="iso-header-actions">
            ${ui.showHelpButton && ui.helpButtonUrl ? `
              <a href="${ui.helpButtonUrl}" target="_blank" rel="noopener noreferrer" class="iso-header-btn" title="Help Resources" aria-label="Help">
                ${helpIcon}
              </a>
            ` : ""}
            <button class="iso-header-btn iso-minimize-btn" title="Minimize" aria-label="Minimize">
              ${minimizeIcon}
            </button>
            <button class="iso-header-btn iso-close-btn" title="Close" aria-label="Close">
              ${closeIcon}
            </button>
          </div>
        </div>

        <div class="iso-body" role="log" aria-live="polite">
          <button type="button" class="iso-scroll-bottom-btn" title="Scroll to latest" aria-label="Scroll to bottom">
            ${downArrowIcon}
          </button>
        </div>

        <div class="iso-quick-replies" style="display: none;"></div>

        <div class="iso-input-area">
          <div class="iso-input-wrapper">
            <input type="text" placeholder="${ui.DefaultEmptyMessage || "Type your message..."}" aria-label="Type your message" ${config.botActive === false ? "disabled" : ""}>
            <button type="button" class="iso-mic-btn" title="Voice Input" aria-label="Speak into microphone">
              ${micIcon}
            </button>
          </div>
          <button class="iso-send-btn" disabled aria-label="Send message">
            ${sendIcon}
          </button>
        </div>

        <div class="iso-branding">
          ${ui.poweredBy || 'AI powered by <span>Isomorphic</span>'}
        </div>
      </div>

      <button class="iso-toggle" aria-label="${ui.chatIconAltText || 'Chat with Us'}" title="${ui.chatIconTitleText || 'Chat with Us'}">
        ${CHAT_LAUNCHER_SVG}
        <div class="iso-close-icon">${closeIcon}</div>
      </button>
    `;

    parent.appendChild(widgetContainer);

    chatToggle = widgetContainer.querySelector(".iso-toggle");
    chatWindow = widgetContainer.querySelector(".iso-window");
    chatBody = widgetContainer.querySelector(".iso-body");
    textInput = widgetContainer.querySelector(".iso-input-area input");
    sendButton = widgetContainer.querySelector(".iso-send-btn");
    micButton = widgetContainer.querySelector(".iso-mic-btn");
    scrollBottomBtn = widgetContainer.querySelector(".iso-scroll-bottom-btn");
    helpNotificationEl = widgetContainer.querySelector("#iso-help-callout");

    setupEventListeners();
    initHelpNotification();
    startIdleMonitoring();

    if (ui.isChatOpened || isChatOpen) {
      openChat();
    }
  }

  // --------------------------------------------------------
  // 6. VOICE INPUT (STT) & TEXT-TO-SPEECH (TTS)
  // --------------------------------------------------------
  let isRecording = false;
  let recognitionInstance = null;

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (micButton) micButton.style.display = "none";
      return;
    }

    try {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        isRecording = true;
        if (micButton) micButton.classList.add("iso-recording");
        if (textInput) textInput.placeholder = "Listening... Speak now...";
      };

      recognitionInstance.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (textInput) {
          textInput.value = transcript;
          textInput.dispatchEvent(new Event("input"));
        }
      };

      recognitionInstance.onerror = () => {
        stopRecording();
      };

      recognitionInstance.onend = () => {
        stopRecording();
        if (textInput && textInput.value.trim()) {
          triggerMessageSend();
        }
      };
    } catch (e) {
      if (micButton) micButton.style.display = "none";
    }
  }

  function startRecording() {
    if (!recognitionInstance) initSpeechRecognition();
    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (e) {
        stopRecording();
      }
    }
  }

  function stopRecording() {
    isRecording = false;
    if (micButton) micButton.classList.remove("iso-recording");
    if (textInput) textInput.placeholder = (config.botUIConfigs && config.botUIConfigs.DefaultEmptyMessage) || "Type your message...";
    if (recognitionInstance) {
      try { recognitionInstance.stop(); } catch (e) {}
    }
  }

  function readAloudText(text, btnEl) {
    if (!("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking && activeSpeechBtn === btnEl) {
      window.speechSynthesis.cancel();
      if (btnEl) btnEl.classList.remove("iso-speaking");
      activeSpeechBtn = null;
      return;
    }

    window.speechSynthesis.cancel();
    if (activeSpeechBtn) activeSpeechBtn.classList.remove("iso-speaking");

    const clean = text.replace(/<[^>]+>/g, " ").replace(/[#*`_~]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (btnEl) btnEl.classList.remove("iso-speaking");
      activeSpeechBtn = null;
    };
    utterance.onerror = () => {
      if (btnEl) btnEl.classList.remove("iso-speaking");
      activeSpeechBtn = null;
    };

    if (btnEl) btnEl.classList.add("iso-speaking");
    activeSpeechBtn = btnEl;
    window.speechSynthesis.speak(utterance);
  }

  // --------------------------------------------------------
  // 7. EVENT LISTENERS
  // --------------------------------------------------------
  function setupEventListeners() {
    if (chatToggle) {
      chatToggle.addEventListener("click", handleToggleClick);
    }

    const minBtn = widgetContainer.querySelector(".iso-minimize-btn");
    if (minBtn) {
      minBtn.addEventListener("click", minimizeChat);
    }

    const closeBtn = widgetContainer.querySelector(".iso-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", handleCloseButtonClick);
    }

    if (sendButton) {
      sendButton.addEventListener("click", triggerMessageSend);
    }

    if (micButton) {
      micButton.addEventListener("click", () => {
        if (isRecording) stopRecording();
        else startRecording();
      });
      initSpeechRecognition();
    }

    if (scrollBottomBtn) {
      scrollBottomBtn.addEventListener("click", () => {
        scrollToBottom(true);
      });
    }

    if (chatBody) {
      chatBody.addEventListener("scroll", () => {
        const distFromBottom = chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight;
        if (scrollBottomBtn) {
          scrollBottomBtn.style.display = distFromBottom > 120 ? "flex" : "none";
        }
      });
    }

    if (textInput) {
      textInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          triggerMessageSend();
        }
      });
      textInput.addEventListener("input", () => {
        if (sendButton) {
          sendButton.disabled = textInput.value.trim() === "";
        }
        resetIdleTimer();
      });
    }
  }

  function handleToggleClick() {
    if (isChatOpen) closeChat();
    else openChat();
  }

  function openChat() {
    isChatOpen = true;
    isMinimized = false;
    if (!widgetContainer || !chatBody) {
      createChatbotDOM();
    }
    if (chatWindow) {
      chatWindow.classList.remove("iso-minimized");
      chatWindow.classList.add("iso-open");
      chatWindow.setAttribute("aria-hidden", "false");
    }
    if (chatToggle) chatToggle.classList.add("iso-active");
    dismissHelpNotification();

    if (chatBody && chatHistory.length === 0) {
      loadChatHistory();
    }
    if (textInput) {
      setTimeout(() => { if (textInput) textInput.focus(); }, 150);
    }
    scrollToBottom();
  }

  function minimizeChat(e) {
    if (e) e.stopPropagation();
    isMinimized = !isMinimized;
    if (chatWindow) {
      if (isMinimized) chatWindow.classList.add("iso-minimized");
      else chatWindow.classList.remove("iso-minimized");
    }
  }

  function handleCloseButtonClick(e) {
    if (e) e.stopPropagation();
    const hasUserExchanges = chatHistory.some(m => m.sender === "user");
    if (hasUserExchanges) {
      showEndChatForm("user_close_click");
    } else {
      finalizeCloseChat();
    }
  }

  function showEndChatForm(reason = "cross_icon") {
    const surveyForm = (config.customForms || []).find(f => f.name === "survey" && f.status === "enabled");
    if (!surveyForm) {
      finalizeCloseChat();
      return;
    }
    if (textInput) textInput.disabled = true;
    if (sendButton) sendButton.disabled = true;
    renderCustomForm(surveyForm, true);
  }

  function finalizeCloseChat() {
    isChatOpen = false;
    isMinimized = false;
    if (chatWindow) {
      chatWindow.classList.remove("iso-open", "iso-minimized");
      chatWindow.setAttribute("aria-hidden", "true");
    }
    if (chatToggle) chatToggle.classList.remove("iso-active");
    if (textInput) textInput.disabled = false;
    if (sendButton) sendButton.disabled = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function closeChat() {
    finalizeCloseChat();
  }

  function triggerMessageSend() {
    if (!textInput) return;
    const msg = textInput.value.trim();
    if (!msg) return;

    appendMessage("user", msg);
    textInput.value = "";
    if (sendButton) sendButton.disabled = true;
    resetIdleTimer();

    getBotResponse(msg);
  }

  // --------------------------------------------------------
  // 8. HELP NOTIFICATION POPUP & IDLE TIMER
  // --------------------------------------------------------
  function initHelpNotification() {
    const ui = config.botUIConfigs || {};
    if (!helpNotificationEl || !ui.helpNotificationRenderMsg) return;

    const delay = parseMongoNumber(ui.helpNotificationRenderTime, 10000);
    helpNotificationTimer = setTimeout(() => {
      if (!isChatOpen && !helpNotificationDismissed) {
        helpNotificationEl.style.display = "block";
      }
    }, delay);

    const closeBtn = helpNotificationEl.querySelector(".iso-callout-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dismissHelpNotification();
      });
    }
  }

  function dismissHelpNotification() {
    helpNotificationDismissed = true;
    if (helpNotificationTimer) clearTimeout(helpNotificationTimer);
    if (helpNotificationEl) helpNotificationEl.style.display = "none";
  }

  function startIdleMonitoring() {
    if (idleCheckInterval) clearInterval(idleCheckInterval);
    idleCheckInterval = setInterval(() => {
      if (!isChatOpen || isSessionEnded) return;
      idleSeconds += 5;

      const idleMsgs = config.botUIConfigs?.idleStatMessages || [];
      if (idleMessagesSentCount < idleMsgs.length) {
        const target = idleMsgs[idleMessagesSentCount];
        if (idleSeconds >= target.time) {
          appendMessage("bot", target.message, false, { isIdleNotice: true });
          idleMessagesSentCount++;
          if (idleMessagesSentCount >= idleMsgs.length) {
            handleInactivityTimeout();
          }
        }
      }
    }, 5000);
  }

  function resetIdleTimer() {
    idleSeconds = 0;
  }

  function handleInactivityTimeout() {
    if (isSessionEnded) return;
    endChatSession({ reason: "inactivity_timeout" });
  }

  // Unified session termination handler
  function endChatSession({ reason = "manual", feedbackData = {} } = {}) {
    if (isSessionEnded) return;
    isSessionEnded = true;

    const activeSessionId = sessionStorage.getItem("iso_chat_session_id");
    if (activeSessionId) {
      const endpoint = config.chatApiUrl || config.apiEndpoint || DEFAULT_CHAT_API_URL;
      const endEndpoint = endpoint.replace(/\/chat\/?$/, "/chat/session-end");
      fetch(endEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          tenantId: config.tenantId || "onestop",
          botId: config.botId,
          reason,
          rating: feedbackData.rating || null,
          feedback: feedbackData.feedback || ""
        }),
        keepalive: true
      }).catch(() => {});
      sessionStorage.removeItem("iso_chat_session_id");
    }

    if (textInput) {
      textInput.disabled = true;
      textInput.placeholder = "Chat session concluded.";
    }
    if (sendButton) sendButton.disabled = true;
  }

  function restartChatSession() {
    isSessionEnded = false;
    idleSeconds = 0;
    idleMessagesSentCount = 0;
    if (textInput) {
      textInput.disabled = false;
      textInput.placeholder = (config.botUIConfigs && config.botUIConfigs.DefaultEmptyMessage) || "Type your message...";
    }
    clearChatHistory();
  }

  // --------------------------------------------------------
  // 9. MARKDOWN & RICH FORMATTING PARSER
  // --------------------------------------------------------
  function escapeHTML(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function parseMarkdown(text) {
    if (!text) return "";
    let str = String(text);

    // Sanitize document tags
    str = str.replace(/【(?:Document|Source|Doc)?\s*\d+[^】]*】/gi, "");
    str = str.replace(/【[^】]+】/g, "");

    // 1. Code blocks
    const codeBlocks = [];
    str = str.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`
        <div class="iso-code-block">
          <div class="iso-code-header">
            <span>${lang || 'code'}</span>
            <button type="button" class="iso-copy-code-btn" onclick="IsoChat.copyCode(this)">Copy Code</button>
          </div>
          <pre><code class="language-${lang}">${escapeHTML(code.trim())}</code></pre>
        </div>
      `);
      return `%%CODEBLOCK_${idx}%%`;
    });

    // 2. Inline code
    const inlineCodes = [];
    str = str.replace(/`([^`]+)`/g, (match, code) => {
      const idx = inlineCodes.length;
      inlineCodes.push(`<code class="iso-md-inline-code">${escapeHTML(code)}</code>`);
      return `%%INLINECODE_${idx}%%`;
    });

    function parseInline(txt) {
      let t = txt;
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      t = t.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="iso-md-link">$1</a>');
      return t;
    }

    // 3. Tables
    str = str.replace(/(?:(?:^|\n)\|[^\n]+\|\r?\n\|[\s\-:\|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, (tableBlock) => {
      const rows = tableBlock.trim().split("\n").map(l => l.trim()).filter(Boolean);
      if (rows.length < 2) return tableBlock;

      const headerLine = rows[0];
      const bodyLines = rows.slice(2);

      const parseRow = (line, isHeader = false) => {
        const cells = line.split("|").map(c => c.trim()).slice(1, -1);
        const tag = isHeader ? "th" : "td";
        return "<tr>" + cells.map(c => `<${tag}>${parseInline(c)}</${tag}>`).join("") + "</tr>";
      };

      const thead = "<thead>" + parseRow(headerLine, true) + "</thead>";
      const tbody = "<tbody>" + bodyLines.map(l => parseRow(l, false)).join("") + "</tbody>";

      return `\n<div class="iso-md-table-wrap"><table class="iso-md-table">${thead}${tbody}</table></div>\n`;
    });

    // 4. Headings & Lists
    str = str.replace(/^### (.*$)/gim, '<h4 style="margin:4px 0;font-size:13px;font-weight:bold;">$1</h4>');
    str = str.replace(/^## (.*$)/gim, '<h3 style="margin:6px 0;font-size:14px;font-weight:bold;">$1</h3>');
    str = str.replace(/^# (.*$)/gim, '<h2 style="margin:8px 0;font-size:15px;font-weight:bold;">$1</h2>');

    str = str.replace(/(?:^|\n)(?:[*\-•]\s+[^\n]+(?:\n[*\-•]\s+[^\n]+)*)/g, (listBlock) => {
      const items = listBlock.trim().split("\n").map(l => l.replace(/^[*\-•]\s+/, "").trim());
      return "\n<ul style='margin:4px 0;padding-left:18px;'>" + items.map(it => `<li>${parseInline(it)}</li>`).join("") + "</ul>\n";
    });

    str = parseInline(str);
    str = str.replace(/\n\n+/g, "<br/><br/>").replace(/\n/g, "<br/>");
    str = str.replace(/<br\/><br\/>(<div|<ul|<h2|<h3|<h4)/gi, "$1");
    str = str.replace(/(<\/div>|<\/ul>|<\/h2>|<\/h3>|<\/h4>)<br\/><br\/>/gi, "$1");

    str = str.replace(/%%CODEBLOCK_(\d+)%%/g, (m, idx) => codeBlocks[parseInt(idx)] || "");
    str = str.replace(/%%INLINECODE_(\d+)%%/g, (m, idx) => inlineCodes[parseInt(idx)] || "");

    return str.trim();
  }

  function isWelcomeOrTimeoutMessage(text, options = {}) {
    if (options.isWelcome || options.isIdleNotice) return true;
    const greetings = config.greetingMessage || [];
    return greetings.some(g => g.trim() === String(text).trim());
  }

  // --------------------------------------------------------
  // 10. MESSAGE RENDERING
  // --------------------------------------------------------
  function renderMessage(sender, text, isHtml = false, timestampStr = null, id = null, options = {}) {
    const messageEl = document.createElement("div");
    messageEl.className = `iso-message iso-message-${sender}`;
    const msgId = id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    messageEl.setAttribute("data-msg-id", msgId);

    const timestamp = timestampStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ui = config.botUIConfigs || {};
    const botStartImg = ui.botChatStartImage || config.botChatStartImage || ui.logoUrl || config.botLogo;

    let avatarHtml = "";
    if (sender === "bot") {
      avatarHtml = `<div class="iso-msg-avatar" title="${config.botName || 'ISO Bot'}">${renderLogoHtml(botStartImg, config.botName)}</div>`;
    } else if (sender === "user") {
      avatarHtml = `
        <div class="iso-msg-avatar iso-user-avatar" title="You">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      `;
    }

    let processedText = sender === "user" ? escapeHTML(text) : (isHtml ? text : parseMarkdown(text));

    // Source Citations
    let sourcesHtml = "";
    if (sender === "bot" && Array.isArray(options.sources) && options.sources.length > 0) {
      const chips = options.sources.slice(0, 3).map(s => {
        const title = s.title || s.name || s.document || "Knowledge Document";
        return `<span class="iso-source-chip" title="${escapeHTML(title)}">📄 ${escapeHTML(title.slice(0, 24))}</span>`;
      }).join("");
      sourcesHtml = `<div class="iso-sources-list">${chips}</div>`;
    }

    // Feedback row for bot messages
    let feedbackHtml = "";
    const isExempt = isWelcomeOrTimeoutMessage(text, options);
    if (sender === "bot" && !isExempt) {
      feedbackHtml = `
        <div class="iso-feedback-row">
          <button type="button" class="iso-feedback-btn iso-copy-btn" title="Copy text" aria-label="Copy text">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button type="button" class="iso-feedback-btn iso-tts-btn" title="Listen" aria-label="Listen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          </button>
          <button class="iso-feedback-btn iso-like-btn" title="Helpful" aria-label="Like response">
            ${renderFeedbackIcon(ui.likeIcon, "like")}
          </button>
          <button class="iso-feedback-btn iso-dislike-btn" title="Not helpful" aria-label="Dislike response">
            ${renderFeedbackIcon(ui.dislikeIcon, "dislike")}
          </button>
          <span class="iso-feedback-note"></span>
        </div>
      `;
    }

    messageEl.innerHTML = `
      ${avatarHtml}
      <div class="iso-bubble-wrapper">
        <div class="iso-msg-bubble">
          ${processedText}
          ${sourcesHtml}
        </div>
        ${feedbackHtml}
        <span class="iso-msg-time">${timestamp}</span>
      </div>
    `;

    // Bind action events
    if (sender === "bot" && !isExempt) {
      const copyBtn = messageEl.querySelector(".iso-copy-btn");
      const ttsBtn = messageEl.querySelector(".iso-tts-btn");
      const likeBtn = messageEl.querySelector(".iso-like-btn");
      const dislikeBtn = messageEl.querySelector(".iso-dislike-btn");
      const note = messageEl.querySelector(".iso-feedback-note");

      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(text).then(() => {
            if (note) {
              note.textContent = "Copied! 📋";
              setTimeout(() => { if (note.textContent.includes("Copied")) note.textContent = ""; }, 2000);
            }
          });
        });
      }

      if (ttsBtn) {
        ttsBtn.addEventListener("click", () => readAloudText(text, ttsBtn));
      }

      if (likeBtn) {
        likeBtn.addEventListener("click", () => {
          likeBtn.classList.add("iso-voted-like");
          if (dislikeBtn) dislikeBtn.disabled = true;
          likeBtn.disabled = true;
          if (note) note.textContent = "Thank you! 👍";
        });
      }

      if (dislikeBtn) {
        dislikeBtn.addEventListener("click", () => {
          dislikeBtn.classList.add("iso-voted-dislike");
          if (likeBtn) likeBtn.disabled = true;
          dislikeBtn.disabled = true;
          if (note) note.textContent = "Feedback recorded. 👎";
        });
      }
    }

    if (!chatBody) {
      if (!widgetContainer) createChatbotDOM();
      if (!chatBody) return null;
    }

    chatBody.appendChild(messageEl);
    scrollToBottom();
    return messageEl;
  }

  function appendMessage(sender, text, isHtml = false, options = {}) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    renderMessage(sender, text, isHtml, timestamp, msgId, options);
    chatHistory.push({ sender, text, timestamp, isHtml, id: msgId, options });
    if (config.persistHistory) saveChatHistory();
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    if (!chatBody) return;
    isTyping = true;
    const el = document.createElement("div");
    el.className = "iso-message iso-message-bot iso-typing-indicator";
    el.innerHTML = `
      <div class="iso-msg-avatar">${renderLogoHtml(config.botUIConfigs?.logoUrl, "ISO")}</div>
      <div class="iso-msg-bubble iso-typing-bubble">
        <span class="iso-dot"></span><span class="iso-dot"></span><span class="iso-dot"></span>
      </div>
    `;
    chatBody.appendChild(el);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    isTyping = false;
    if (!chatBody) return;
    const el = chatBody.querySelector(".iso-typing-indicator");
    if (el) el.remove();
  }

  function scrollToBottom(force = false) {
    if (!chatBody) return;
    const isNearBottom = (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight) < 150;
    if (force || isNearBottom) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  function getOrCreateSessionId() {
    let sId = sessionStorage.getItem("iso_chat_session_id");
    if (!sId) {
      sId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      sessionStorage.setItem("iso_chat_session_id", sId);
    }
    return sId;
  }

  // --------------------------------------------------------
  // 11. CUSTOM FORMS & GRIEVANCE TICKETING INTEGRATION
  // --------------------------------------------------------
  function renderCustomForm(formConfig, isEndChatForm = false) {
    if (!formConfig || !formConfig.payload) return;
    const payload = formConfig.payload;

    const formWrapper = document.createElement("div");
    formWrapper.className = "iso-form-container" + (isEndChatForm || formConfig.name === "survey" ? " iso-end-chat-form" : "");

    let fieldsHtml = "";
    (payload.fields || []).forEach(f => {
      const isRequired = f.validate && f.validate.required;
      const reqLabel = isRequired ? ` <span style="color:#EF4444;">*</span>` : "";

      if (f.type === "hidden") {
        fieldsHtml += `<input type="hidden" name="${f.name}" value="${f.name === 'status' ? 'Escalated' : ''}">`;
      } else if (f.type === "rating") {
        fieldsHtml += `
          <div class="iso-form-group">
            <label class="iso-form-label">${f.title}${reqLabel}</label>
            <div class="iso-rating-group" data-name="${f.name}">
              <input type="hidden" name="${f.name}" value="5" ${isRequired ? "required" : ""}>
              ${[1, 2, 3, 4, 5].map(v => `<button type="button" class="iso-star-btn iso-star-active" data-val="${v}">&#9733;</button>`).join("")}
            </div>
          </div>
        `;
      } else if (f.type === "textarea") {
        fieldsHtml += `
          <div class="iso-form-group">
            <label class="iso-form-label">${f.title}${reqLabel}</label>
            <textarea name="${f.name}" class="iso-form-textarea" rows="2" placeholder="${f.title}" ${isRequired ? "required" : ""}></textarea>
          </div>
        `;
      } else {
        const inputType = (f.validate && f.validate.email) ? "email" : (f.name.toLowerCase().includes("phone") ? "tel" : "text");
        fieldsHtml += `
          <div class="iso-form-group">
            <label class="iso-form-label">${f.title}${reqLabel}</label>
            <input type="${inputType}" name="${f.name}" class="iso-form-input" placeholder="${f.title}" ${isRequired ? "required" : ""}>
          </div>
        `;
      }
    });

    const isEndChat = isEndChatForm || formConfig.name === "survey";
    const submitBtnTitle = payload.submitButtonTitle || (isEndChat ? "Submit Feedback" : "Submit Ticket");
    const downloadTranscriptBtn = formConfig.showDownloadButton ? `
      <button type="button" class="iso-form-download">Download Transcript</button>
    ` : "";
    const cancelBtn = (formConfig.showCancelledButton || isEndChat) ? `
      <button type="button" class="iso-form-cancel">${isEndChat ? "Skip & Close" : "Cancel"}</button>
    ` : "";

    formWrapper.innerHTML = `
      <div class="iso-form-title">${formConfig.title || (isEndChat ? "Feedback Survey" : "Support Ticket Form")}</div>
      <form class="iso-dynamic-form">
        ${fieldsHtml}
        <div class="iso-form-actions">
          <button type="submit" class="iso-form-submit">${submitBtnTitle}</button>
          ${downloadTranscriptBtn}
          ${cancelBtn}
        </div>
      </form>
    `;

    // Star rating behavior
    formWrapper.querySelectorAll(".iso-star-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.getAttribute("data-val"), 10);
        const parent = btn.closest(".iso-rating-group");
        parent.querySelector("input").value = val;
        parent.querySelectorAll(".iso-star-btn").forEach(b => {
          const bVal = parseInt(b.getAttribute("data-val"), 10);
          if (bVal <= val) b.classList.add("iso-star-active");
          else b.classList.remove("iso-star-active");
        });
      });
    });

    if (formWrapper.querySelector(".iso-form-download")) {
      formWrapper.querySelector(".iso-form-download").addEventListener("click", downloadTranscript);
    }
    if (formWrapper.querySelector(".iso-form-cancel")) {
      formWrapper.querySelector(".iso-form-cancel").addEventListener("click", () => formWrapper.remove());
    }

    const formEl = formWrapper.querySelector("form");
    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(formEl);
      const data = Object.fromEntries(formData.entries());

      if (isEndChatForm || formConfig.name === "survey") {
        formWrapper.innerHTML = `<div style="font-size:12px;color:#10B981;font-weight:700;text-align:center;padding:10px 0;">✓ Thank you for your feedback! Session concluded.</div>`;
        endChatSession({ reason: "survey_submitted", feedbackData: data });
        setTimeout(() => finalizeCloseChat(), 1500);
        return;
      }

      // Ticketing Grievance Submission
      const endpoint = config.chatApiUrl || config.apiEndpoint || DEFAULT_CHAT_API_URL;
      const grievanceEndpoint = endpoint.replace(/\/chat\/?$/, "/grievances");
      const ticketPayload = {
        tenantId: config.tenantId || "onestop",
        botId: config.botId || "isobot",
        sessionId: getOrCreateSessionId(),
        student: {
          fullName: data.FullName || data.name || data.fullName,
          email: data.Email || data.email,
          phone: data.Phone || data.phone,
          username: data.username || data.studentId || ""
        },
        department: config.ticketingConfig?.defaultDepartment || "General Support",
        priority: config.ticketingConfig?.defaultPriority || "medium",
        title: `Support Ticket: ${(data.AdditionalInformation || 'Chatbot Escalation').slice(0, 60)}`,
        description: data.AdditionalInformation || `Chatbot ticket created by ${data.FullName || 'User'}`,
        source: "chatbot",
        chatTranscript: chatHistory.map(m => ({
          sender: m.sender,
          message: m.text,
          timestamp: m.timestamp || new Date().toISOString()
        }))
      };

      try {
        const res = await fetch(grievanceEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketPayload)
        });
        const resData = await res.json();
        const ticketId = (resData && resData.data && resData.data.ticketId) || resData.ticketId || `GRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        formWrapper.innerHTML = `
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:13px;font-weight:bold;color:#166534;margin-bottom:4px;">✓ Support Ticket Created</div>
            <div style="font-size:11px;color:#15803D;margin-bottom:8px;">Ticket ID: <strong style="font-family:monospace;background:#DCFCE7;padding:2px 6px;border-radius:4px;">${ticketId}</strong></div>
            <div style="font-size:11px;color:#4B5563;">Our staff has received your transcript and will follow up at <strong>${escapeHTML(data.Email || 'your email')}</strong>.</div>
          </div>
        `;
      } catch (err) {
        formWrapper.innerHTML = `<div style="font-size:12px;color:#10B981;font-weight:600;padding:8px 0;text-align:center;">✓ Details received! A representative will follow up with you.</div>`;
      }
    });

    chatBody.appendChild(formWrapper);
    scrollToBottom();
  }

  function downloadTranscript() {
    const lines = ["ISO AI CHAT TRANSCRIPT", "========================", `Date: ${new Date().toLocaleString()}`, ""];
    chatHistory.forEach(m => {
      lines.push(`[${m.timestamp || ''}] ${m.sender.toUpperCase()}: ${m.text.replace(/<[^>]+>/g, ' ')}`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------------
  // 12. BOT INTELLIGENCE & REAL-TIME STREAMING
  // --------------------------------------------------------
  async function getBotResponse(userMsg) {
    showTypingIndicator();
    hideQuickReplies();

    const textLower = userMsg.toLowerCase().trim();
    const endpoint = config.chatApiUrl || config.apiEndpoint || DEFAULT_CHAT_API_URL;
    const isStreamingSupported = Boolean(config.botUIConfigs?.enableStreaming !== false && window.ReadableStream);

    // Escalation Intent Check
    const isEscalationIntent = /^(transfer|ticket|grievance|speak to agent|live agent|human|representative|support ticket)\b/i.test(textLower) ||
                               textLower.includes("live agent") ||
                               textLower.includes("transfer to live agent") ||
                               textLower.includes("create ticket");

    if (isEscalationIntent) {
      removeTypingIndicator();
      if (config.enableTicketing !== false) {
        const transferForm = (config.customForms || []).find(f => f.name === "transferCall") || {
          name: "transferCall",
          title: "Create Support Ticket / Request Assistance",
          payload: {
            fields: [
              { title: "Full Name", name: "FullName", type: "text", validate: { required: true } },
              { title: "Email Address", name: "Email", type: "email", validate: { required: true } },
              { title: "Phone Number", name: "Phone", type: "tel", validate: { required: true } },
              { title: "Issue Details", name: "AdditionalInformation", type: "textarea", validate: { required: true } }
            ]
          }
        };
        appendMessage("bot", config.ticketingConfig?.escalationMessage || "I am connecting you with our support team. Please complete your details below to create a support ticket:");
        renderCustomForm(transferForm);
        return;
      } else {
        appendMessage("bot", "Our knowledge assistant is here to help! If you have further inquiries, feel free to ask your question directly or visit our help center.");
        showQuickReplies(config.quickReplies);
        return;
      }
    }

    // Goodbye Intent Check
    const isBye = /^(bye|goodbye|exit|end chat|end session)\b/i.test(textLower);
    if (isBye) {
      removeTypingIndicator();
      appendMessage("bot", "Thank you for chatting with us! Have a wonderful day. Goodbye! 👋");
      setTimeout(() => showEndChatForm("bye_message"), 500);
      return;
    }

    const payload = {
      query: userMsg,
      message: userMsg,
      botId: config.botId,
      tenantId: config.tenantId || "onestop",
      sessionId: getOrCreateSessionId(),
      history: chatHistory.slice(-10)
    };

    // Attempt Server-Sent Events (SSE) Streaming
    if (isStreamingSupported) {
      try {
        const streamEndpoint = endpoint.replace(/\/chat\/?$/, "/chat/stream");
        const res = await fetch(streamEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
          body: JSON.stringify(payload)
        });

        if (res.ok && res.body) {
          removeTypingIndicator();
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";
          let streamMsgEl = null;

          // Render initial stream message bubble
          streamMsgEl = renderMessage("bot", "", false, null, null, { streaming: true });
          const bubbleEl = streamMsgEl.querySelector(".iso-msg-bubble");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const textChunk = decoder.decode(value, { stream: true });
            const lines = textChunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data:")) {
                try {
                  const data = JSON.parse(line.slice(5).trim());
                  if (data.chunk) {
                    accumulatedText += data.chunk;
                    bubbleEl.innerHTML = parseMarkdown(accumulatedText) + `<span class="iso-stream-cursor"></span>`;
                    scrollToBottom();
                  } else if (data.done) {
                    const finalReply = data.fullText || accumulatedText;
                    bubbleEl.innerHTML = parseMarkdown(finalReply);
                    chatHistory.push({
                      sender: "bot",
                      text: finalReply,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      options: { sources: data.sources || [] }
                    });
                    if (data.sources && data.sources.length > 0) {
                      const chips = data.sources.slice(0, 3).map(s => `<span class="iso-source-chip">📄 ${(s.title || 'Document').slice(0, 24)}</span>`).join("");
                      bubbleEl.innerHTML += `<div class="iso-sources-list">${chips}</div>`;
                    }
                    if (data.quickReplies && data.quickReplies.length > 0) {
                      showQuickReplies(data.quickReplies);
                    } else {
                      showQuickReplies(config.quickReplies);
                    }
                  }
                } catch (e) {}
              }
            }
          }
          return;
        }
      } catch (err) {
        console.warn("[ISO Chatbot] Streaming unavailable, falling back to standard POST:", err.message);
      }
    }

    // Standard POST fallback
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      removeTypingIndicator();
      if (response.ok) {
        const data = await response.json();
        const botReply = data.response || data.reply || data.message || "Thank you for reaching out.";
        appendMessage("bot", botReply, false, { sources: data.sources || [] });
        if (data.quickReplies && data.quickReplies.length > 0) {
          showQuickReplies(data.quickReplies);
        } else {
          showQuickReplies(config.quickReplies);
        }
      } else {
        appendMessage("bot", `I'm having trouble connecting right now (status ${response.status}). Please try again.`);
      }
    } catch (err) {
      removeTypingIndicator();
      fallbackSimulatedResponse(textLower);
    }
  }

  function fallbackSimulatedResponse(textLower) {
    let reply = "Thank you for your message. How can I assist you with your questions today?";
    if (textLower.includes("academic") || textLower.includes("course") || textLower.includes("student")) {
      reply = "I specialize in academic support! You can ask about course registrations, campus resources, academic deadlines, or tutoring services.";
    } else if (textLower.includes("tech") || textLower.includes("password") || textLower.includes("login")) {
      reply = "For technology support, I can guide you through student portal access, multi-factor authentication, Wi-Fi connectivity, or account resets.";
    }
    appendMessage("bot", reply);
    showQuickReplies(config.quickReplies);
  }

  function showQuickReplies(replies) {
    const container = widgetContainer.querySelector(".iso-quick-replies");
    if (!container) return;
    let list = (replies && replies.length > 0) ? replies : config.quickReplies;
    if (config.enableTicketing === false) {
      list = list.filter(r => !/transfer|live agent|ticket|grievance/i.test(r));
    }
    if (!list || list.length === 0) {
      container.style.display = "none";
      return;
    }

    container.innerHTML = "";
    list.forEach(replyText => {
      const btn = document.createElement("button");
      btn.className = "iso-quick-reply-btn";
      btn.textContent = replyText;
      btn.addEventListener("click", () => {
        appendMessage("user", replyText);
        hideQuickReplies();
        getBotResponse(replyText);
      });
      container.appendChild(btn);
    });
    container.style.display = "flex";
    scrollToBottom();
  }

  function hideQuickReplies() {
    const container = widgetContainer.querySelector(".iso-quick-replies");
    if (container) container.style.display = "none";
  }

  function saveChatHistory() {
    if (!config.persistHistory) return;
    try { localStorage.setItem(`iso_history_${config.botId}`, JSON.stringify(chatHistory)); } catch (e) {}
  }

  function loadChatHistory() {
    renderWelcomeMessages();
  }

  function renderWelcomeMessages() {
    chatHistory = [];
    if (chatBody) chatBody.innerHTML = "";
    const msgs = Array.isArray(config.greetingMessage) ? config.greetingMessage : [config.greetingMessage || "Hi! How can I assist you today?"];
    msgs.forEach(m => appendMessage("bot", m, false, { isWelcome: true }));
    showQuickReplies(config.quickReplies);
  }

  function clearChatHistory() {
    renderWelcomeMessages();
  }

  // --------------------------------------------------------
  // 13. GLOBAL API EXPOSURE
  // --------------------------------------------------------
  window.IsoChat = {
    open: () => openChat(),
    close: () => closeChat(),
    toggle: () => handleToggleClick(),
    clearHistory: () => clearChatHistory(),
    downloadTranscript: () => downloadTranscript(),
    copyCode: (btn) => {
      const block = btn.closest(".iso-code-block");
      const code = block ? block.querySelector("code").innerText : "";
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "Copied! ✓";
        setTimeout(() => { btn.textContent = "Copy Code"; }, 2000);
      });
    }
  };

  // --------------------------------------------------------
  // 14. INITIALIZE CHATBOT
  // --------------------------------------------------------
  async function init() {
    injectStyles();
    createChatbotDOM();
    await fetchBotConfiguration();
    injectStyles(); // re-inject after fetched configs
    if (widgetContainer) {
      const headerTitle = config.botUIConfigs?.botHeaderText || config.botName || "ISO AI";
      const botNameEl = widgetContainer.querySelector(".iso-bot-name");
      if (botNameEl) botNameEl.textContent = headerTitle;
    }
    if (chatBody && (chatHistory.length === 0 || chatHistory.every(m => m.options?.isWelcome))) {
      renderWelcomeMessages();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
