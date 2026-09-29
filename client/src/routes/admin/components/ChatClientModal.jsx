import React, { useState, useEffect, useRef } from "react";
import { 
  X, Sliders, Palette, MessageSquare, FormInput, Code, Save, 
  Loader2, Bot as BotIcon, Send, RotateCcw, ThumbsUp, ThumbsDown, 
  HelpCircle, Minus, Sparkles, CheckCircle, AlertTriangle, 
  Ticket, ShieldCheck, ShieldAlert, Smartphone, Monitor, Eye,
  Star, MessageCircle, ArrowRight, CornerDownLeft, Volume2, Mic
} from "lucide-react";
import { apiUrl } from "../../../config/api";

const DEFAULT_BOT_UI_CONFIGS = {
  botThemeColor: "#00306D",
  botHeaderTextColor: "#FFFFFF",
  botHeaderStatusColor: "#B0C4DE",
  botHeaderIconColor: "#FFFFFF",
  botAvatarIconColor: "#FFFFFF",
  botChatStartImage: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
  botResponseBackgroundColor: "#FFFFFF",
  userQueryBackgroundColor: "#00306D",
  botResponseFontColor: "#1E293B",
  userQueryFontColor: "#FFFFFF",
  bgColor: "#F8FAFC",
  logoUrl: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a04ac944-0efc-4f92-84cd-9463c94f0505.png",
  botHeaderText: "AI Assistant",
  botStatusText: "Online",
  DefaultEmptyMessage: "Type your message...",
  helpNotificationRenderTime: 10000,
  helpNotificationRenderMsg: "Hi! I am an AI Assistant. How can I help you today?",
  idleStatMessages: [
    { message: "I’m waiting for your next question", time: 180 },
    { message: "Since there was no response from your end, we are concluding this session.", time: 240 }
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
  demoBackgroundUrl: "",
  likeIcon: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/dba2acac-c841-47b7-be3f-106ed4b66fef.png",
  dislikeIcon: "https://bbh-product-bucket.s3.us-east-2.amazonaws.com/a91652f3-c1f1-4396-8aab-45793777ef09.png",
  botChatSubmitButton: true,
  isChatOpened: false,
  transferFormDelay: 5,
  showThumbUpDownFeedbackform: true,
  showHelpButton: true,
  helpButtonUrl: "https://vsc.blackbelthelp.com/help",
  poweredBy: "AI powered by <span>Isomorphic</span>",
  surveySubmitButtonText: "Submit Feedback",
  surveySubmitButtonColor: "",
  surveySubmitButtonTextColor: "",
  enableTicketing: true
};

export default function ChatClientModal({
  isOpen,
  onClose,
  activeTenant,
  editingBot,
  onSaved,
  showToast
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [newGreeting, setNewGreeting] = useState("");
  const [newQuickReply, setNewQuickReply] = useState("");
  const [newIdleMsg, setNewIdleMsg] = useState({ message: "", time: 180 });
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState(null);

  // Live Preview State
  const [previewView, setPreviewView] = useState("window"); // "window" | "launcher" | "survey"
  const [simulatedChat, setSimulatedChat] = useState([]);
  const [previewInput, setPreviewInput] = useState("");
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const previewChatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingBot) {
        const isTicketingOn = editingBot.enableTicketing !== undefined 
          ? editingBot.enableTicketing 
          : (editingBot.botUIConfigs?.enableTicketing !== undefined ? editingBot.botUIConfigs.enableTicketing : true);

        const initialGreetings = Array.isArray(editingBot.greetingMessage) 
          ? [...editingBot.greetingMessage] 
          : (editingBot.greetingMessage ? [editingBot.greetingMessage] : ["Hi! How can I assist you today?"]);

        const initialQuickReplies = Array.isArray(editingBot.quickReplies) && editingBot.quickReplies.length > 0
          ? [...editingBot.quickReplies] 
          : (Array.isArray(editingBot.botUIConfigs?.starterQuestions) 
              ? [...editingBot.botUIConfigs.starterQuestions] 
              : ["Academic Assistance", "Technology Support", "Tuition & Financial Aid", "Advising Services"]);

        setFormData({
          _id: editingBot._id,
          botId: editingBot.botId || editingBot.code || "",
          botName: editingBot.botName || editingBot.name || "",
          name: editingBot.name || editingBot.botName || "",
          code: editingBot.code || editingBot.botId || "",
          description: editingBot.description || "",
          botActive: editingBot.botActive !== false,
          enableTicketing: isTicketingOn,
          greetingMessage: initialGreetings,
          quickReplies: initialQuickReplies,
          customForms: Array.isArray(editingBot.customForms) ? [...editingBot.customForms] : [],
          botUIConfigs: {
            ...DEFAULT_BOT_UI_CONFIGS,
            ...(editingBot.botUIConfigs || {}),
            enableTicketing: isTicketingOn
          }
        });
      } else {
        const brandColor = activeTenant?.tenantConfig?.ButtonandLeftBarColor || "#00306D";
        const botTitle = `${activeTenant?.name || "ISO"} AI`;
        setFormData({
          _id: null,
          botId: "",
          botName: "",
          name: "",
          code: "",
          description: "",
          botActive: true,
          enableTicketing: true,
          greetingMessage: [`Hi! I am ${activeTenant?.name || "AI"} Assistant. How can I help you today?`],
          quickReplies: ["Academic Assistance", "Technology Support", "Tuition & Financial Aid", "Advising Services"],
          customForms: [],
          botUIConfigs: {
            ...DEFAULT_BOT_UI_CONFIGS,
            botThemeColor: brandColor,
            botHeaderText: botTitle,
            userQueryBackgroundColor: brandColor,
            enableTicketing: true
          }
        });
      }
      setActiveTab("general");
      setJsonError(null);
      setSimulatedChat([]);
      setPreviewInput("");
      setPreviewView("window");
    }
  }, [isOpen, editingBot, activeTenant]);

  useEffect(() => {
    if (activeTab === "json") {
      setRawJson(JSON.stringify(formData, null, 2));
      setJsonError(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (previewChatEndRef.current) {
      previewChatEndRef.current.scrollTop = previewChatEndRef.current.scrollHeight;
    }
  }, [simulatedChat, isSimulatingTyping]);

  const updateUIField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      botUIConfigs: {
        ...(prev.botUIConfigs || {}),
        [field]: value
      }
    }));
  };

  const handleToggleTicketing = () => {
    const nextVal = !(formData.enableTicketing !== false);
    setFormData(prev => ({
      ...prev,
      enableTicketing: nextVal,
      botUIConfigs: {
        ...(prev.botUIConfigs || {}),
        enableTicketing: nextVal
      }
    }));
  };

  const addGreeting = () => {
    if (!newGreeting.trim()) return;
    setFormData(prev => ({
      ...prev,
      greetingMessage: [...(prev.greetingMessage || []), newGreeting.trim()]
    }));
    setNewGreeting("");
  };

  const removeGreeting = (idx) => {
    setFormData(prev => ({
      ...prev,
      greetingMessage: (prev.greetingMessage || []).filter((_, i) => i !== idx)
    }));
  };

  const addQuickReply = () => {
    if (!newQuickReply.trim()) return;
    setFormData(prev => ({
      ...prev,
      quickReplies: [...(prev.quickReplies || []), newQuickReply.trim()]
    }));
    setNewQuickReply("");
  };

  const removeQuickReply = (idx) => {
    setFormData(prev => ({
      ...prev,
      quickReplies: (prev.quickReplies || []).filter((_, i) => i !== idx)
    }));
  };

  const addIdleMsg = () => {
    if (!newIdleMsg.message.trim()) return;
    setFormData(prev => ({
      ...prev,
      botUIConfigs: {
        ...prev.botUIConfigs,
        idleStatMessages: [
          ...(prev.botUIConfigs?.idleStatMessages || []),
          { message: newIdleMsg.message.trim(), time: Number(newIdleMsg.time) || 180 }
        ]
      }
    }));
    setNewIdleMsg({ message: "", time: 180 });
  };

  const removeIdleMsg = (idx) => {
    setFormData(prev => ({
      ...prev,
      botUIConfigs: {
        ...prev.botUIConfigs,
        idleStatMessages: (prev.botUIConfigs?.idleStatMessages || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const handleSendSimulatedMessage = (textToSend) => {
    const q = (textToSend || previewInput).trim();
    if (!q) return;

    const userMsg = { sender: "user", text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setSimulatedChat(prev => [...prev, userMsg]);
    setPreviewInput("");
    setIsSimulatingTyping(true);

    setTimeout(() => {
      let botReply = "";
      const isTicketingOn = formData.enableTicketing !== false;

      if (/(ticket|grievance|complaint|raise|escalate)/i.test(q)) {
        if (isTicketingOn) {
          botReply = `📋 **Support & Grievance Ticketing is Active**\n\nI can help log an official support ticket for this issue. Please provide your full name and student ID to submit.`;
        } else {
          botReply = `ℹ️ Support ticketing is **disabled** for this chatbot. I can answer questions directly, but cannot generate official tickets.`;
        }
      } else if (/(hello|hi|hey)/i.test(q)) {
        botReply = `Hello! I'm ${formData.botUIConfigs?.botHeaderText || formData.botName || "ISO AI Assistant"}. How can I assist you with your questions today?`;
      } else if (/(tuition|financial aid|scholarship)/i.test(q)) {
        botReply = `Financial aid applications and FAFSA forms are open for the academic semester. Let me know if you need instructions on applying!`;
      } else {
        botReply = `Thank you for asking about "${q}". In live deployment, I will search your institution's indexed knowledge base and provide an instant verified answer.`;
      }

      setSimulatedChat(prev => [...prev, {
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsSimulatingTyping(false);
    }, 600);
  };

  const handleResetPreview = () => {
    setSimulatedChat([]);
    setPreviewInput("");
    setIsSimulatingTyping(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    let payload = { ...formData };

    if (activeTab === "json") {
      try {
        payload = JSON.parse(rawJson);
        setFormData(payload);
        setJsonError(null);
      } catch (err) {
        setJsonError("Invalid JSON format: " + err.message);
        showToast("Cannot save invalid JSON schema.", "error");
        return;
      }
    }

    const finalName = (payload.botName || payload.name || "").trim();
    const finalCode = (payload.botId || payload.code || "").trim();

    if (!finalName || !finalCode) {
      showToast("Bot Name and Bot ID are required.", "error");
      return;
    }

    const isTicketingOn = payload.enableTicketing !== false;
    const targetId = activeTenant?._id || activeTenant?.tenantId || "";
    const targetDb = activeTenant?.tenantDbName || (activeTenant?.tenantId ? `iso_${activeTenant.tenantId}` : "");
    const method = payload._id ? "PUT" : "POST";
    const endpoint = payload._id
      ? `/api/admin/bots/${payload._id}?tenantId=${encodeURIComponent(targetId)}&tenantDbName=${encodeURIComponent(targetDb)}`
      : `/api/admin/bots?tenantId=${encodeURIComponent(targetId)}&tenantDbName=${encodeURIComponent(targetDb)}`;

    setSaving(true);
    try {
      const sessionId = localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(endpoint), {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          ...payload,
          name: finalName,
          botName: finalName,
          code: finalCode,
          botId: finalCode,
          status: payload.botActive !== false ? "active" : "inactive",
          enableTicketing: isTicketingOn,
          botUIConfigs: {
            ...(payload.botUIConfigs || {}),
            enableTicketing: isTicketingOn
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(payload._id ? "Chatbot settings updated successfully." : `Chatbot "${data.name || data.botName}" created.`);
        onSaved();
        onClose();
      } else {
        showToast(data.error || "Failed to save chatbot settings.", "error");
      }
    } catch (err) {
      showToast("Network error saving chatbot configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Exact UI Config Values
  const ui = formData.botUIConfigs || {};
  const themeColor = ui.botThemeColor || "#00306D";
  const headerTextColor = ui.botHeaderTextColor || "#FFFFFF";
  const headerStatusColor = ui.botHeaderStatusColor || "#B0C4DE";
  const headerIconColor = ui.botHeaderIconColor || "#FFFFFF";
  const avatarIconColor = ui.botAvatarIconColor || "#FFFFFF";
  const botBubbleBg = ui.botResponseBackgroundColor || "#FFFFFF";
  const userBubbleBg = ui.userQueryBackgroundColor || themeColor;
  const botBubbleTextColor = ui.botResponseFontColor || "#1E293B";
  const userBubbleTextColor = ui.userQueryFontColor || "#FFFFFF";
  const widgetBgColor = ui.bgColor || "#F8FAFC";
  const botHeaderText = ui.botHeaderText || formData.botName || formData.name || "AI Assistant";
  const botStatusText = ui.botStatusText || (formData.botActive !== false ? "Online" : "Offline");
  const isTicketingEnabled = formData.enableTicketing !== false;
  const logoUrl = ui.logoUrl || "";
  const startImage = ui.botChatStartImage || "";
  const submitButtonVisible = ui.botChatSubmitButton !== false;
  const showFeedback = ui.showThumbUpDownFeedbackform !== false;
  const showHelp = ui.showHelpButton !== false;
  const placeholderText = ui.DefaultEmptyMessage || "Type your message...";
  const surveyButtonText = ui.surveySubmitButtonText || "Submit Feedback";
  const surveyButtonColor = ui.surveySubmitButtonColor || themeColor;
  const surveyButtonTextColor = ui.surveySubmitButtonTextColor || "#FFFFFF";
  const poweredByText = ui.poweredBy || "AI powered by <span>Isomorphic</span>";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-iso-cardBg border border-iso-border rounded-xl shadow-2xl w-full max-w-[1520px] h-[94vh] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-3 border-b border-iso-border flex items-center justify-between bg-iso-bgSecondary/30 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-colors shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              <BotIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-serif font-bold text-iso-primary leading-tight">
                  {formData._id ? `Edit Chatbot: ${formData.botName || formData.name || "Assistant"}` : "Create New Chatbot Assistant"}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  formData.botActive !== false 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                    : "bg-slate-100 text-slate-500 border-slate-300"
                }`}>
                  {formData.botActive !== false ? "ACTIVE" : "INACTIVE"}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isTicketingEnabled 
                    ? "bg-blue-50 text-blue-700 border-blue-300" 
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}>
                  {isTicketingEnabled ? "🎟️ TICKETING ACTIVE" : "🚫 NO TICKETS"}
                </span>
              </div>
              <p className="text-[11px] text-iso-textMuted font-mono mt-0.5">
                Workspace: <span className="font-bold text-iso-accent">{activeTenant?.tenantDbName || `iso_${activeTenant?.tenantId}`}</span> &gt; chatClientSettings
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 text-iso-textMuted hover:text-iso-primary hover:bg-iso-bgSecondary rounded-md transition-all"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* DUAL PANE LAYOUT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* ======================================================== */}
          {/* LEFT STUDIO: CONFIGURATION TABS & FORM CONTROLS (7 Cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-iso-border bg-iso-cardBg overflow-hidden">
            
            {/* Studio Navigation Tabs */}
            <div className="px-5 border-b border-iso-border flex gap-1 bg-iso-bg text-xs overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "general" ? "border-iso-primary text-iso-primary font-bold bg-iso-cardBg" : "border-transparent text-iso-textMuted hover:text-iso-text"
                }`}
              >
                <Sliders size={13} /> General &amp; Ticketing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ui_theme")}
                className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "ui_theme" ? "border-iso-primary text-iso-primary font-bold bg-iso-cardBg" : "border-transparent text-iso-textMuted hover:text-iso-text"
                }`}
              >
                <Palette size={13} /> Theme &amp; Colors
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("messages")}
                className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "messages" ? "border-iso-primary text-iso-primary font-bold bg-iso-cardBg" : "border-transparent text-iso-textMuted hover:text-iso-text"
                }`}
              >
                <MessageSquare size={13} /> Greetings &amp; Prompts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("forms")}
                className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "forms" ? "border-iso-primary text-iso-primary font-bold bg-iso-cardBg" : "border-transparent text-iso-textMuted hover:text-iso-text"
                }`}
              >
                <FormInput size={13} /> Custom Forms &amp; Survey
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "json" ? "border-iso-primary text-iso-primary font-bold bg-iso-cardBg" : "border-transparent text-iso-textMuted hover:text-iso-text"
                }`}
              >
                <Code size={13} /> Advanced JSON
              </button>
            </div>

            {/* Form Panels */}
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-5">
              
              {/* TAB 1: GENERAL & TICKETING */}
              {activeTab === "general" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-100">
                  
                  {/* Basic Identifier Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                        Bot Display Name <span className="text-iso-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.botName || formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, botName: e.target.value, name: e.target.value })}
                        placeholder="e.g. Campus Assistant"
                        className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-md px-3 py-2 text-xs text-iso-text outline-none font-medium shadow-2xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                        Bot Identifier Code (botId) <span className="text-iso-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.botId || formData.code || ""}
                        onChange={(e) => setFormData({ ...formData, botId: e.target.value, code: e.target.value })}
                        placeholder="e.g. campus-bot"
                        disabled={formData._id !== null}
                        className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-md px-3 py-2 text-xs text-iso-text outline-none font-mono disabled:opacity-60 shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Bot Description
                    </label>
                    <input
                      type="text"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Handles general student inquiries, admissions guidance, and campus support."
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-md px-3 py-2 text-xs text-iso-text outline-none shadow-2xs"
                    />
                  </div>

                  {/* Operational Status & TICKETING TOGGLE CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    
                    {/* Bot Active Switch */}
                    <div className="p-4 bg-iso-bg rounded-lg border border-iso-border flex flex-col justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                            <BotIcon size={14} className="text-iso-accent" />
                            Operational Status
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            formData.botActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}>
                            {formData.botActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <p className="text-[11px] text-iso-textMuted mt-1 leading-relaxed">
                          Controls whether this bot is active and serving student inquiries on public web channels.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-1 border-t border-iso-border/40">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, botActive: !formData.botActive })}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formData.botActive ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.botActive ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                        <span className="text-xs font-semibold text-iso-text">
                          {formData.botActive ? "Bot is Online" : "Bot is Inactive / Offline"}
                        </span>
                      </div>
                    </div>

                    {/* TICKETING SYSTEM ON/OFF TOGGLE */}
                    <div className={`p-4 rounded-lg border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                      isTicketingEnabled 
                        ? "bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
                        : "bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                            <Ticket size={14} className={isTicketingEnabled ? "text-blue-600" : "text-slate-400"} />
                            Support &amp; Grievance Ticketing
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isTicketingEnabled 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {isTicketingEnabled ? "TICKETING ON" : "TICKETING OFF"}
                          </span>
                        </div>
                        <p className="text-[11px] text-iso-textMuted mt-1 leading-relaxed">
                          {isTicketingEnabled 
                            ? "Enabled: Users can submit support tickets & grievances directly through this chatbot." 
                            : "Disabled: This chatbot will operate purely in conversational Q&A mode and will NEVER create tickets."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-1 border-t border-iso-border/40">
                        <button
                          type="button"
                          onClick={handleToggleTicketing}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isTicketingEnabled ? "bg-blue-600" : "bg-slate-400"
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTicketingEnabled ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                        <span className={`text-xs font-semibold ${isTicketingEnabled ? "text-blue-900 dark:text-blue-300" : "text-slate-600 dark:text-slate-400"}`}>
                          {isTicketingEnabled ? "Allow Ticket Registration" : "Pure AI Mode (No Tickets)"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: THEME & COLORS */}
              {activeTab === "ui_theme" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-100">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Theme Color (Header &amp; Button)</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={themeColor} onChange={(e) => updateUIField("botThemeColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={themeColor} onChange={(e) => updateUIField("botThemeColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Header Title Text</label>
                      <input type="text" value={ui.botHeaderText || ""} onChange={(e) => updateUIField("botHeaderText", e.target.value)} placeholder="ISO AI" className="w-full bg-iso-cardBg border border-iso-border rounded px-2.5 py-1.5 text-xs text-iso-text outline-none" />
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Status Subtitle Text</label>
                      <input type="text" value={ui.botStatusText || ""} onChange={(e) => updateUIField("botStatusText", e.target.value)} placeholder="Online / 24/7 Available" className="w-full bg-iso-cardBg border border-iso-border rounded px-2.5 py-1.5 text-xs text-iso-text outline-none" />
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Widget Body Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={widgetBgColor} onChange={(e) => updateUIField("bgColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={widgetBgColor} onChange={(e) => updateUIField("bgColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Header Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={headerTextColor} onChange={(e) => updateUIField("botHeaderTextColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={headerTextColor} onChange={(e) => updateUIField("botHeaderTextColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Status Text Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={headerStatusColor} onChange={(e) => updateUIField("botHeaderStatusColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={headerStatusColor} onChange={(e) => updateUIField("botHeaderStatusColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Header Icons Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={headerIconColor} onChange={(e) => updateUIField("botHeaderIconColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={headerIconColor} onChange={(e) => updateUIField("botHeaderIconColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Avatar Icon Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={avatarIconColor} onChange={(e) => updateUIField("botAvatarIconColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={avatarIconColor} onChange={(e) => updateUIField("botAvatarIconColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Bot Bubble Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={botBubbleBg} onChange={(e) => updateUIField("botResponseBackgroundColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={botBubbleBg} onChange={(e) => updateUIField("botResponseBackgroundColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Bot Bubble Font Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={botBubbleTextColor} onChange={(e) => updateUIField("botResponseFontColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={botBubbleTextColor} onChange={(e) => updateUIField("botResponseFontColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">User Bubble Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={userBubbleBg} onChange={(e) => updateUIField("userQueryBackgroundColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={userBubbleBg} onChange={(e) => updateUIField("userQueryBackgroundColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">User Bubble Font Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={userBubbleTextColor} onChange={(e) => updateUIField("userQueryFontColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                        <input type="text" value={userBubbleTextColor} onChange={(e) => updateUIField("userQueryFontColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Logo Avatar URL (logoUrl)</label>
                      <input type="url" value={logoUrl} onChange={(e) => updateUIField("logoUrl", e.target.value)} placeholder="https://.../logo.png" className="w-full bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono" />
                    </div>
                    <div className="p-3 bg-iso-bg border border-iso-border rounded-md">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Start Screen Graphic URL (botChatStartImage)</label>
                      <input type="url" value={startImage} onChange={(e) => updateUIField("botChatStartImage", e.target.value)} placeholder="https://.../start-screen.png" className="w-full bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-iso-border">
                    <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-iso-bg rounded-md border border-iso-border hover:bg-iso-bgSecondary/40 transition-colors">
                      <input type="checkbox" checked={Boolean(ui.showHelpButton)} onChange={(e) => updateUIField("showHelpButton", e.target.checked)} className="w-4 h-4 accent-iso-primary rounded" />
                      <span className="font-semibold text-xs text-iso-text">Show Help Link</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-iso-bg rounded-md border border-iso-border hover:bg-iso-bgSecondary/40 transition-colors">
                      <input type="checkbox" checked={Boolean(ui.showThumbUpDownFeedbackform)} onChange={(e) => updateUIField("showThumbUpDownFeedbackform", e.target.checked)} className="w-4 h-4 accent-iso-primary rounded" />
                      <span className="font-semibold text-xs text-iso-text">Thumbs Rating Bar</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-iso-bg rounded-md border border-iso-border hover:bg-iso-bgSecondary/40 transition-colors">
                      <input type="checkbox" checked={Boolean(ui.botChatSubmitButton)} onChange={(e) => updateUIField("botChatSubmitButton", e.target.checked)} className="w-4 h-4 accent-iso-primary rounded" />
                      <span className="font-semibold text-xs text-iso-text">Send Button Visible</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: GREETINGS & PROMPTS */}
              {activeTab === "messages" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-100">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">
                      Greeting Messages (Rendered upon opening chat)
                    </label>
                    <div className="flex flex-col gap-2 p-3 bg-iso-bg border border-iso-border rounded-md">
                      {(formData.greetingMessage || []).map((msg, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-iso-cardBg border border-iso-border rounded px-3 py-2 shadow-2xs">
                          <span className="text-xs text-iso-text flex-1 leading-relaxed">{msg}</span>
                          <button type="button" onClick={() => removeGreeting(idx)} className="text-iso-textMuted hover:text-iso-error ml-2 p-1">
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={newGreeting} 
                          onChange={(e) => setNewGreeting(e.target.value)} 
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGreeting(); } }} 
                          placeholder="Add new greeting bubble..." 
                          className="flex-1 bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs outline-none" 
                        />
                        <button type="button" onClick={addGreeting} className="px-3 py-1.5 bg-iso-primary hover:bg-iso-primaryLight text-white rounded text-xs font-bold transition-all shadow-xs">
                          Add Greeting
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">
                      Quick Reply Chips / Starter Prompts
                    </label>
                    <div className="flex flex-col gap-2.5 p-3 bg-iso-bg border border-iso-border rounded-md">
                      <div className="flex flex-wrap gap-1.5">
                        {(formData.quickReplies || []).map((chip, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-iso-cardBg border border-iso-border rounded-full px-3 py-1 text-xs text-iso-text font-medium shadow-2xs">
                            {chip}
                            <button type="button" onClick={() => removeQuickReply(idx)} className="text-iso-textMuted hover:text-iso-error">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        {(formData.quickReplies || []).length === 0 && (
                          <span className="text-xs text-iso-textMuted italic">No quick reply chips added yet.</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={newQuickReply} 
                          onChange={(e) => setNewQuickReply(e.target.value)} 
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuickReply(); } }} 
                          placeholder="Add suggestion chip..." 
                          className="flex-1 bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs outline-none" 
                        />
                        <button type="button" onClick={addQuickReply} className="px-3 py-1.5 bg-iso-bgSecondary hover:bg-iso-accent hover:text-white border border-iso-border rounded text-xs font-bold transition-all">
                          Add Pill
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">
                      Notification Callout Message (Popup above launcher button)
                    </label>
                    <input 
                      type="text" 
                      value={ui.helpNotificationRenderMsg || ""} 
                      onChange={(e) => updateUIField("helpNotificationRenderMsg", e.target.value)} 
                      placeholder="Hi! I am an AI Assistant. How can I help you today?" 
                      className="w-full bg-iso-bg border border-iso-border rounded-md px-3 py-2 text-xs text-iso-text outline-none" 
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: FORMS & SURVEY */}
              {activeTab === "forms" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-100">
                  <div className="p-3.5 bg-iso-bg border border-iso-border rounded-md flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-iso-primary">End Chat &amp; Feedback Survey Button Styling</span>
                    <p className="text-[11px] text-iso-textMuted leading-relaxed">Customize the submit button text and color displayed on the end chat survey feedback form.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[9px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1">Submit Button Text</label>
                        <input 
                          type="text" 
                          value={ui.surveySubmitButtonText || ""} 
                          onChange={(e) => updateUIField("surveySubmitButtonText", e.target.value)} 
                          placeholder="e.g. Submit Feedback" 
                          className="w-full bg-iso-cardBg border border-iso-border rounded px-2.5 py-1.5 text-xs text-iso-text outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1">Button Background Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={surveyButtonColor} 
                            onChange={(e) => updateUIField("surveySubmitButtonColor", e.target.value)} 
                            className="w-7 h-7 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" 
                          />
                          <input 
                            type="text" 
                            value={ui.surveySubmitButtonColor || ""} 
                            onChange={(e) => updateUIField("surveySubmitButtonColor", e.target.value)} 
                            placeholder="#00306D" 
                            className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1">Button Text Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={surveyButtonTextColor} 
                            onChange={(e) => updateUIField("surveySubmitButtonTextColor", e.target.value)} 
                            className="w-7 h-7 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" 
                          />
                          <input 
                            type="text" 
                            value={ui.surveySubmitButtonTextColor || ""} 
                            onChange={(e) => updateUIField("surveySubmitButtonTextColor", e.target.value)} 
                            placeholder="#FFFFFF" 
                            className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block font-semibold mb-2">Registered Interactive Forms ({formData.customForms?.length || 0})</label>
                    <div className="flex flex-col gap-2">
                      {(formData.customForms || []).map((form, idx) => (
                        <div key={idx} className="p-3 bg-iso-cardBg border border-iso-border rounded-md flex flex-col gap-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-iso-primary text-xs">{form.title || form.name}</span>
                            <span className="font-mono text-[9px] text-iso-accent bg-iso-bgSecondary px-1.5 py-0.5 rounded border border-iso-border">{form.name}</span>
                          </div>
                          <p className="text-[10px] text-iso-textMuted font-mono">
                            Intents: {(form.intent || []).join(", ") || "none"} | Fields: {(form.payload?.fields || form.fields || []).length}
                          </p>
                        </div>
                      ))}
                      {(formData.customForms || []).length === 0 && (
                        <p className="text-xs text-iso-textMuted italic bg-iso-bgSecondary/20 p-4 rounded text-center">No interactive forms registered for this bot.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ADVANCED JSON */}
              {activeTab === "json" && (
                <div className="flex flex-col gap-2 animate-in fade-in duration-100">
                  {jsonError && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">{jsonError}</div>}
                  <textarea
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    rows={18}
                    className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-3.5 rounded-md border border-iso-border outline-none focus:border-iso-accent"
                    spellCheck={false}
                  />
                </div>
              )}

            </div>

            {/* Studio Bottom Bar */}
            <div className="px-6 py-3 border-t border-iso-border flex items-center justify-between bg-iso-bgSecondary/20 shrink-0">
              <span className="text-[11px] font-mono text-iso-textMuted truncate max-w-[240px]">
                {formData._id ? `Bot: ${formData.botId}` : "New Bot Instance"}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-1.5 bg-iso-bgSecondary hover:bg-iso-border/50 text-iso-text border border-iso-border rounded-md text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="px-5 py-1.5 bg-iso-primary hover:bg-iso-primaryLight text-white rounded-md text-xs font-bold border border-iso-primary flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-70"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>{saving ? "Saving..." : (formData._id ? "Save Changes" : "Create Chatbot")}</span>
                </button>
              </div>
            </div>

          </div>


          {/* ======================================================== */}
          {/* RIGHT COLUMN: 1:1 PIXEL-PERFECT WIDGET REPLICA (5 Cols)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col bg-slate-100 dark:bg-slate-950/70 border-l border-iso-border overflow-hidden">
            
            {/* View Switcher Controls */}
            <div className="px-4 py-2.5 border-b border-iso-border bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-serif">Live Widget Replica</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewView("window")}
                    className={`px-2.5 py-1 rounded transition-all font-medium ${
                      previewView === "window" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Window
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewView("launcher")}
                    className={`px-2.5 py-1 rounded transition-all font-medium ${
                      previewView === "launcher" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Launcher
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewView("survey")}
                    className={`px-2.5 py-1 rounded transition-all font-medium ${
                      previewView === "survey" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Survey
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetPreview}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  title="Reset Preview Simulation"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* PREVIEW CANVAS */}
            <div className="flex-1 p-3 sm:p-5 flex items-center justify-center overflow-y-auto relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
              
              {/* VIEW 1: EXPANDED CHATBOT WINDOW (EXACT CSS STRUCTURE) */}
              {previewView === "window" && (
                <div 
                  className="w-full max-w-[400px] h-[590px] max-h-[100%] rounded-[16px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
                  style={{ backgroundColor: widgetBgColor }}
                >
                  
                  {/* Exact .iso-header */}
                  <div 
                    className="px-[18px] py-[14px] flex items-center justify-between shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors border-b border-white/10"
                    style={{ backgroundColor: themeColor }}
                  >
                    <div className="flex items-center gap-[12px] min-w-0">
                      {/* Avatar with exact status dot */}
                      <div className="relative w-[38px] h-[38px] shrink-0">
                        <div 
                          className="w-[38px] h-[38px] rounded-full flex items-center justify-center overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] bg-white/15"
                          style={{ color: avatarIconColor }}
                        >
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <BotIcon size={22} style={{ stroke: headerIconColor }} />
                          )}
                        </div>
                        <span 
                          className="w-[10px] h-[10px] rounded-full absolute bottom-0 right-0 border-2"
                          style={{ 
                            backgroundColor: formData.botActive !== false ? "#10B981" : "#94A3B8",
                            borderColor: themeColor
                          }}
                        />
                      </div>

                      {/* Header Titles */}
                      <div className="min-w-0">
                        <div className="font-[600] text-[15px] tracking-[-0.2px] truncate leading-tight font-sans" style={{ color: headerTextColor }}>
                          {botHeaderText}
                        </div>
                        <div className="text-[11px] flex items-center gap-1.5 mt-0.5 leading-tight opacity-90 font-sans" style={{ color: headerStatusColor }}>
                          <span>{botStatusText}</span>
                          <span className="opacity-50">•</span>
                          <span className={`text-[10px] font-mono px-1 rounded ${isTicketingEnabled ? "bg-white/20" : "bg-black/20"}`}>
                            {isTicketingEnabled ? "🎟️ Tickets ON" : "🚫 No Tickets"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-[6px] shrink-0" style={{ color: headerIconColor }}>
                      {showHelp && (
                        <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" title="Help Resources">
                          <HelpCircle size={18} style={{ stroke: headerIconColor }} />
                        </button>
                      )}
                      <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" title="Minimize">
                        <Minus size={18} style={{ stroke: headerIconColor }} />
                      </button>
                      <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" title="Close">
                        <X size={18} style={{ stroke: headerIconColor }} />
                      </button>
                    </div>
                  </div>

                  {/* Exact .iso-body Messages Stream */}
                  <div ref={previewChatEndRef} className="flex-1 p-[16px] overflow-y-auto space-y-[12px] text-[13.5px] font-sans">
                    
                    {/* Start Screen Graphic */}
                    {startImage && (
                      <div className="flex justify-center my-2 animate-in fade-in">
                        <img 
                          src={startImage} 
                          alt="Start Graphic" 
                          className="max-h-[100px] max-w-[200px] object-contain rounded-lg drop-shadow-sm" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Bot Greeting Bubbles with exact shape: 18px 18px 18px 4px */}
                    {(formData.greetingMessage || ["Hi! How can I assist you today?"]).map((msg, idx) => (
                      <div key={idx} className="flex items-end gap-[8px] max-w-[88%] animate-in fade-in">
                        <div 
                          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.12)] overflow-hidden"
                          style={{ backgroundColor: themeColor, color: avatarIconColor }}
                        >
                          {logoUrl ? <img src={logoUrl} alt="Avatar" className="w-full h-full object-cover" /> : <BotIcon size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <div 
                            className="p-[12px_16px] leading-[1.55] shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-[18px_18px_18px_4px] border border-[#E2E8F0]"
                            style={{ 
                              backgroundColor: botBubbleBg, 
                              color: botBubbleTextColor 
                            }}
                          >
                            {msg}
                          </div>
                          <span className="text-[10px] text-[#94A3B8] mt-1 pl-1 font-mono">Just now</span>
                          
                          {/* Feedback Thumbs Row */}
                          {showFeedback && idx === (formData.greetingMessage?.length || 1) - 1 && (
                            <div className="flex items-center gap-1.5 mt-1.5 pl-1 text-[11px] text-[#64748B]">
                              <button type="button" className="p-1 hover:bg-black/5 rounded transition-colors text-[#64748B] hover:text-[#0F172A]"><ThumbsUp size={13} /></button>
                              <button type="button" className="p-1 hover:bg-black/5 rounded transition-colors text-[#64748B] hover:text-[#0F172A]"><ThumbsDown size={13} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Simulated Conversation Turns */}
                    {simulatedChat.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-end gap-[8px] max-w-[88%] ${
                          m.sender === "user" ? "self-end ml-auto flex-row-reverse" : "self-start"
                        } animate-in fade-in`}
                      >
                        {m.sender === "bot" && (
                          <div 
                            className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.12)] overflow-hidden"
                            style={{ backgroundColor: themeColor, color: avatarIconColor }}
                          >
                            {logoUrl ? <img src={logoUrl} alt="Avatar" className="w-full h-full object-cover" /> : <BotIcon size={16} />}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div 
                            className={`p-[12px_16px] leading-[1.55] shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${
                              m.sender === "user"
                                ? "rounded-[18px_18px_4px_18px] border border-transparent"
                                : "rounded-[18px_18px_18px_4px] border border-[#E2E8F0]"
                            }`}
                            style={{ 
                              backgroundColor: m.sender === "user" ? userBubbleBg : botBubbleBg,
                              color: m.sender === "user" ? userBubbleTextColor : botBubbleTextColor
                            }}
                          >
                            <div className="whitespace-pre-wrap">{m.text}</div>
                          </div>
                          <span className={`text-[10px] text-[#94A3B8] mt-1 font-mono ${m.sender === "user" ? "text-right pr-1" : "pl-1"}`}>{m.time}</span>
                        </div>
                      </div>
                    ))}

                    {/* Typing Animation */}
                    {isSimulatingTyping && (
                      <div className="flex items-end gap-[8px] max-w-[88%]">
                        <div 
                          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                          style={{ backgroundColor: themeColor, color: avatarIconColor }}
                        >
                          <BotIcon size={16} />
                        </div>
                        <div 
                          className="p-[10px_14px] rounded-[14px_14px_14px_3px] flex items-center gap-1 border border-[#E2E8F0]"
                          style={{ backgroundColor: botBubbleBg }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Exact .iso-quick-replies */}
                  {(formData.quickReplies || []).length > 0 && (
                    <div className="px-[16px] pb-[12px] bg-[#F8FAFC] flex gap-[6px] overflow-x-auto scrollbar-none shrink-0">
                      {(formData.quickReplies || []).map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendSimulatedMessage(chip)}
                          className="bg-white border border-[#E2E8F0] text-[#475569] hover:bg-slate-100 hover:text-blue-700 px-[12px] py-[6px] rounded-[16px] text-[12px] font-[500] whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Exact .iso-input-area */}
                  <div className="p-[12px_16px] border-t border-[#E2E8F0] bg-white flex items-center gap-[8px] shrink-0">
                    <div className="flex-1 flex items-center bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-blue-600 focus-within:bg-white rounded-[22px] px-[14px] transition-all">
                      <input 
                        type="text"
                        value={previewInput}
                        onChange={(e) => setPreviewInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendSimulatedMessage(); } }}
                        placeholder={placeholderText}
                        className="w-full bg-transparent border-none py-[9px] text-[13.5px] text-[#1E293B] outline-none placeholder-[#94A3B8]"
                      />
                      <button type="button" className="text-[#94A3B8] hover:text-[#475569] p-1 transition-colors">
                        <Mic size={16} />
                      </button>
                    </div>

                    {submitButtonVisible && (
                      <button 
                        type="button"
                        onClick={() => handleSendSimulatedMessage()}
                        disabled={!previewInput.trim()}
                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-all disabled:opacity-30 cursor-pointer"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Send size={15} />
                      </button>
                    )}
                  </div>

                  {/* Exact .iso-branding */}
                  <div className="py-[7px] border-t border-[#F1F5F9] text-[11px] text-[#94A3B8] text-center font-sans shrink-0 bg-[#F8FAFC]">
                    <span dangerouslySetInnerHTML={{ __html: poweredByText }} />
                  </div>

                </div>
              )}

              {/* VIEW 2: FLOATING LAUNCHER (EXACT CSS STRUCTURE) */}
              {previewView === "launcher" && (
                <div className="w-full max-w-[400px] h-[550px] rounded-[16px] shadow-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between relative overflow-hidden animate-in fade-in">
                  
                  {/* Mock Webpage Wireframe */}
                  <div className="space-y-3 opacity-60">
                    <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-48 h-6 bg-slate-300 dark:bg-slate-700 rounded" />
                    <div className="w-full h-24 bg-slate-100 dark:bg-slate-800/60 rounded p-3 text-[11px] text-slate-500 leading-relaxed">
                      This simulates how the floating launcher button and the help callout popup appear fixed in the lower corner of your institution's website.
                    </div>
                  </div>

                  {/* Floating Toggle & Callout */}
                  <div className="flex flex-col items-end gap-3 self-end relative">
                    
                    {/* Exact .iso-help-callout */}
                    {ui.helpNotificationRenderMsg && (
                      <div className="bg-white border border-black/10 rounded-[14px] p-[12px_34px_12px_14px] shadow-[0_10px_25px_-4px_rgba(0,0,0,0.15),0_4px_10px_rgba(0,0,0,0.06)] max-w-[285px] text-[12.5px] leading-[1.45] text-[#1E293B] relative animate-in slide-in-from-bottom-2">
                        <button type="button" className="absolute top-2 right-2 text-[#94A3B8] hover:text-[#1E293B] w-[22px] h-[22px] rounded-full flex items-center justify-center">
                          &times;
                        </button>
                        <div>{ui.helpNotificationRenderMsg}</div>
                        {/* Pointing triangle */}
                        <div className="absolute -bottom-[6px] right-6 w-3 h-3 bg-white border-r border-b border-black/10 transform rotate-45" />
                      </div>
                    )}

                    {/* Exact .iso-toggle Launcher Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewView("window")}
                      className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-white shadow-[0_8px_26px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform cursor-pointer relative"
                      style={{ backgroundColor: themeColor }}
                      title={ui.chatIconTitleText || "Chat with Us"}
                    >
                      {startImage ? (
                        <img src={startImage} alt="Launcher" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <BotIcon size={32} style={{ stroke: avatarIconColor }} />
                      )}
                      <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white absolute top-0 right-0 shadow-sm" />
                    </button>

                  </div>

                </div>
              )}

              {/* VIEW 3: SURVEY & FEEDBACK FORM (EXACT CUSTOM BUTTON STYLING) */}
              {previewView === "survey" && (
                <div 
                  className="w-full max-w-[400px] h-[550px] rounded-[16px] shadow-2xl border border-slate-300 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in"
                  style={{ backgroundColor: widgetBgColor }}
                >
                  {/* Header */}
                  <div className="px-[18px] py-[14px] flex items-center justify-between text-white" style={{ backgroundColor: themeColor }}>
                    <div className="font-bold text-sm font-sans">Session Ended: Feedback Survey</div>
                    <button onClick={() => setPreviewView("window")} className="p-1 hover:bg-white/20 rounded"><X size={16} /></button>
                  </div>

                  {/* Survey Form Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
                    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-xs flex flex-col gap-4">
                      <div>
                        <span className="font-bold text-sm text-[#1E293B]">How was your chat experience?</span>
                        <p className="text-xs text-[#64748B] mt-0.5">Please rate your interaction with {botHeaderText}.</p>
                      </div>

                      {/* 5-Star Rating */}
                      <div className="flex items-center gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            className={`p-1 text-2xl transition-transform hover:scale-125 ${
                              star <= selectedRating ? "text-[#F59E0B]" : "text-[#CBD5E1]"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#475569] block mb-1">Additional Feedback (Optional)</label>
                        <textarea 
                          rows={3} 
                          placeholder="Tell us what you liked or how we can improve..." 
                          className="w-full border border-[#CBD5E1] rounded-md p-2.5 text-xs text-[#1E293B] bg-[#F8FAFC] outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>

                      {/* Configured Survey Submit Button */}
                      <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-md text-xs font-bold transition-opacity hover:opacity-90 shadow-sm cursor-pointer"
                        style={{
                          backgroundColor: surveyButtonColor,
                          color: surveyButtonTextColor
                        }}
                      >
                        {surveyButtonText}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewView("window")}
                      className="mt-3 text-xs text-center text-blue-600 font-semibold hover:underline"
                    >
                      &larr; Back to Chat Window
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Live Settings Feedback Bar */}
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-iso-border flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: themeColor }} />
                <span>{themeColor}</span>
              </span>
              <span>Mode: <strong>{isTicketingEnabled ? "🎟️ Ticketing ON" : "🚫 Pure AI"}</strong></span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
