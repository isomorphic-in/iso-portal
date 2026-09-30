import React, { useState, useEffect } from "react";
import { 
  X, Building2, Sliders, Palette, Image as ImageIcon, 
  CheckCircle, Code, Save, Loader2, Bot as BotIcon, Eye,
  Sparkles, Globe, RefreshCw, Copy, ExternalLink, Check,
  FileText, Calendar, DollarSign, Clock, ShieldCheck, UserCheck, 
  AlertCircle, FileCheck, Tag, Info
} from "lucide-react";
import { apiUrl } from "../../../config/api";
import { updateFavicon } from "../../../utils/theme";

const TIMEZONE_OPTIONS = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Asia/Tokyo", "Australia/Sydney", "UTC"
];

const DEFAULT_TENANT_CONFIG = {
  instituteName: "",
  timeZone: "America/New_York",
  loginBackgroundColor: "#fdf7f7",
  ButtonandLeftBarColor: "#00306D",
  buttonFontColor: "#ffffff",
  BordersColor: "#578b96",
  disableButtonColor: "#c1c1c1",
  forgotFontColor: "#373737",
  allHeaderFontSize: "1.2rem",
  allTitleFontSize: "1rem",
  backgroudImageUrl: "",
  logoBigUrl: "",
  logoSmallUrl: "",
  faviconUrl: "",
  showIntegrationTypeInChatHistory: true,
  showJobQueueNotificationIcon: true,
  enableGrievanceSystem: true
};

const DEFAULT_CONTRACT = {
  contractNumber: "",
  startDate: "",
  endDate: "",
  renewedOn: "",
  contractTerm: "1 Year",
  contractStatus: "Active",
  billingCycle: "Annually",
  contractValue: "",
  currency: "USD",
  paymentTerms: "Net 30",
  paymentStatus: "Current",
  autoRenew: false,
  renewalNoticeDays: 30,
  slaTier: "Standard (99.5% Uptime, 24h SLA)",
  maxBotsIncluded: 5,
  monthlyInquiryLimit: "50,000 inquiries",
  accountManager: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  documentUrl: "",
  notes: ""
};

const CONTRACT_TERMS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "1 Year",
  "2 Years",
  "3 Years",
  "5 Years",
  "Custom"
];

const CONTRACT_STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Pending Renewal", label: "Pending Renewal" },
  { value: "Under Review", label: "Under Review" },
  { value: "Draft", label: "Draft" },
  { value: "Expired", label: "Expired" },
  { value: "Terminated", label: "Terminated" }
];

const BILLING_CYCLES = [
  "Monthly",
  "Quarterly",
  "Semi-Annually",
  "Annually",
  "Multi-Year Pre-paid",
  "One-time"
];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "INR", symbol: "₹" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "AED", symbol: "د.إ" },
  { code: "CAD", symbol: "$" },
  { code: "AUD", symbol: "$" },
  { code: "SGD", symbol: "$" }
];

const SLA_TIERS = [
  "Standard (99.5% Uptime, 24h SLA)",
  "Business (99.9% Uptime, 8h SLA)",
  "Enterprise Platinum (99.99% Uptime, 1h SLA, 24/7 Dedicated Support)"
];

const PAYMENT_TERMS = [
  "Due on Receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Prepaid"
];

const PAYMENT_STATUSES = [
  "Current",
  "Pending Invoice",
  "Overdue",
  "Grace Period",
  "Paid in Full"
];

const formatDateForInput = (dateVal) => {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export default function TenantModal({
  isOpen,
  onClose,
  tenantData,
  onSaved,
  showToast
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [newBotTag, setNewBotTag] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (tenantData) {
        setFormData({
          id: tenantData._id,
          name: tenantData.name || tenantData.tenantName || "",
          tenantName: tenantData.tenantName || tenantData.name || "",
          code: tenantData.code || tenantData.tenantId || "",
          tenantId: tenantData.tenantId || tenantData.code || "",
          tenantDbName: tenantData.tenantDbName || (tenantData.tenantId ? `iso_${tenantData.tenantId}` : ""),
          tenantActive: tenantData.tenantActive !== false,
          Bots: Array.isArray(tenantData.Bots) ? [...tenantData.Bots] : [],
          tenantConfig: {
            ...DEFAULT_TENANT_CONFIG,
            ...(tenantData.tenantConfig || {})
          },
          contract: {
            ...DEFAULT_CONTRACT,
            contractNumber: tenantData.contract?.contractNumber || `ISO-CTR-${new Date().getFullYear()}-${(tenantData.code || tenantData.tenantId || 'org').toUpperCase()}`,
            ...(tenantData.contract || {})
          }
        });
      } else {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormData({
          id: null,
          name: "",
          tenantName: "",
          code: "",
          tenantId: "",
          tenantDbName: "",
          tenantActive: true,
          Bots: [],
          tenantConfig: { ...DEFAULT_TENANT_CONFIG },
          contract: {
            ...DEFAULT_CONTRACT,
            contractNumber: `ISO-CTR-${new Date().getFullYear()}-${randomNum}`,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          }
        });
      }
      setActiveTab("general");
      setJsonError(null);
    }
  }, [isOpen, tenantData]);

  useEffect(() => {
    if (activeTab === "json") {
      setRawJson(JSON.stringify(formData, null, 2));
      setJsonError(null);
    }
  }, [activeTab]);

  const updateConfigField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      tenantConfig: {
        ...(prev.tenantConfig || {}),
        [field]: value
      }
    }));
  };

  const updateContractField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contract: {
        ...(prev.contract || {}),
        [field]: value
      }
    }));
  };

  const calculateEndDateFromTerm = (start, term) => {
    if (!start) return;
    try {
      const d = new Date(start);
      if (isNaN(d.getTime())) return;
      
      let nextDate = new Date(d);
      if (term === "1 Month") nextDate.setMonth(nextDate.getMonth() + 1);
      else if (term === "3 Months") nextDate.setMonth(nextDate.getMonth() + 3);
      else if (term === "6 Months") nextDate.setMonth(nextDate.getMonth() + 6);
      else if (term === "1 Year") nextDate.setFullYear(nextDate.getFullYear() + 1);
      else if (term === "2 Years") nextDate.setFullYear(nextDate.getFullYear() + 2);
      else if (term === "3 Years") nextDate.setFullYear(nextDate.getFullYear() + 3);
      else if (term === "5 Years") nextDate.setFullYear(nextDate.getFullYear() + 5);
      else return;

      // Deduct 1 day for standard contract end alignment (e.g. Oct 1 2026 to Sep 30 2027)
      nextDate.setDate(nextDate.getDate() - 1);
      updateContractField("endDate", nextDate.toISOString().split("T")[0]);
    } catch (e) {}
  };

  const addBotTag = () => {
    if (!newBotTag.trim()) return;
    const tag = newBotTag.trim();
    if (!formData.Bots?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        Bots: [...(prev.Bots || []), tag]
      }));
    }
    setNewBotTag("");
  };

  const removeBotTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      Bots: (prev.Bots || []).filter(b => b !== tag)
    }));
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
        setJsonError("Invalid JSON: " + err.message);
        showToast("Cannot save invalid JSON schema.", "error");
        return;
      }
    }

    const finalName = (payload.tenantName || payload.name || "").trim();
    const finalCode = (payload.tenantId || payload.code || "").trim();

    if (!finalName || !finalCode) {
      showToast("Corporate Name and Tenant Identifier are required.", "error");
      return;
    }

    const method = payload.id ? "PUT" : "POST";
    const endpoint = payload.id ? `/api/admin/tenants/${payload.id}` : "/api/admin/tenants";

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
          name: finalName,
          tenantName: finalName,
          code: finalCode.toLowerCase(),
          tenantId: finalCode.toLowerCase(),
          tenantDbName: payload.tenantDbName?.trim() || `iso_${finalCode.toLowerCase()}`,
          tenantActive: payload.tenantActive !== false,
          Bots: Array.isArray(payload.Bots) ? payload.Bots : [],
          tenantConfig: payload.tenantConfig || {},
          contract: payload.contract || {}
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(payload.id ? "Organization profile & contract updated successfully." : `Organization "${data.name || data.tenantName}" onboarded with contract.`);
        onSaved();
        onClose();
      } else {
        showToast(data.error || "Failed to save organization profile.", "error");
      }
    } catch (err) {
      showToast("Network error submitting organization configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const cfg = formData.tenantConfig || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-iso-border flex items-center justify-between bg-iso-bgSecondary/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-iso-primary/10 border border-iso-primary/20 flex items-center justify-center text-iso-primary">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-iso-primary">
                {formData.id ? `Edit Tenant: ${formData.tenantName || formData.name}` : "Onboard New Tenant Environment"}
              </h2>
              <p className="text-[11px] text-iso-textMuted font-mono">Organization Profile, Branding & Login Customization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-iso-textMuted hover:text-iso-primary hover:bg-iso-bgSecondary rounded-sm transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-iso-border flex gap-1 bg-iso-bg text-xs overflow-x-auto">
          <button type="button" onClick={() => setActiveTab("general")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "general" ? "border-iso-primary text-iso-primary font-bold" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <Sliders size={13} /> General &amp; Profile
          </button>
          <button type="button" onClick={() => setActiveTab("contract")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "contract" ? "border-iso-primary text-iso-primary font-bold bg-iso-primary/5" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <FileText size={13} /> Contract &amp; SLA
          </button>
          <button type="button" onClick={() => setActiveTab("branding")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "branding" ? "border-iso-primary text-iso-primary font-bold" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <ImageIcon size={13} /> Logos &amp; Background
          </button>
          <button type="button" onClick={() => setActiveTab("theme")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "theme" ? "border-iso-primary text-iso-primary font-bold" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <Palette size={13} /> Theme Colors &amp; Preview
          </button>
          <button type="button" onClick={() => setActiveTab("behavior")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "behavior" ? "border-iso-primary text-iso-primary font-bold" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <CheckCircle size={13} /> Features &amp; Flags
          </button>
          <button type="button" onClick={() => setActiveTab("json")} className={`px-3.5 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "json" ? "border-iso-primary text-iso-primary font-bold" : "border-transparent text-iso-textMuted hover:text-iso-text"}`}>
            <Code size={13} /> Advanced Schema (JSON)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] flex-1 text-xs">
          
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Corporate Name <span className="text-iso-error">*</span></label>
                  <input type="text" value={formData.tenantName || formData.name || ""} onChange={(e) => setFormData({ ...formData, tenantName: e.target.value, name: e.target.value })} placeholder="e.g. Onestop Enterprise" className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Tenant Identifier (Slug) <span className="text-iso-error">*</span></label>
                  <input type="text" value={formData.tenantId || formData.code || ""} onChange={(e) => setFormData({ ...formData, tenantId: e.target.value, code: e.target.value })} placeholder="e.g. onestop" disabled={formData.id !== null} className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono disabled:opacity-60" required />
                  <div className="mt-1 text-[10px] text-iso-accent font-mono flex items-center gap-1 truncate">
                    <span>Domain:</span>
                    <span className="font-bold underline">https://{(formData.tenantId || formData.code || 'tenant').toLowerCase().trim()}.isomorphic.in</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Workspace Identifier</label>
                  <input type="text" value={formData.tenantDbName || (formData.tenantId ? `iso_${formData.tenantId.toLowerCase()}` : "")} onChange={(e) => setFormData({ ...formData, tenantDbName: e.target.value })} placeholder="e.g. iso_onestop" className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono font-semibold text-iso-accent" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Operational Status</label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button type="button" onClick={() => setFormData({ ...formData, tenantActive: !formData.tenantActive })} className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.tenantActive ? "bg-emerald-600" : "bg-slate-300"}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.tenantActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className="text-xs font-bold font-mono">{formData.tenantActive ? <span className="text-emerald-700">ACTIVE ENVIRONMENT</span> : <span className="text-slate-500">INACTIVE / DISABLED</span>}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Institute / Brand Display Name</label>
                  <input type="text" value={formData.tenantConfig?.instituteName || ""} onChange={(e) => updateConfigField("instituteName", e.target.value)} placeholder="e.g. Onestop Academy" className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Timezone</label>
                  <select value={formData.tenantConfig?.timeZone || "America/New_York"} onChange={(e) => updateConfigField("timeZone", e.target.value)} className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none cursor-pointer">
                    {TIMEZONE_OPTIONS.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>

              {/* Assigned Chatbots */}
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">Assigned Chatbot Slugs (Bots Array)</label>
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.Bots || []).map(b => (
                      <span key={b} className="px-2.5 py-1 bg-iso-bgSecondary border border-iso-border rounded-sm text-xs font-mono font-semibold text-iso-primary flex items-center gap-1.5">
                        <BotIcon size={12} className="text-iso-accent" />
                        <span>{b}</span>
                        <button type="button" onClick={() => removeBotTag(b)} className="text-iso-textMuted hover:text-iso-error cursor-pointer"><X size={12} /></button>
                      </span>
                    ))}
                    {(formData.Bots || []).length === 0 && <span className="text-xs text-iso-textMuted italic">No chatbots assigned yet.</span>}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={newBotTag} onChange={(e) => setNewBotTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBotTag(); } }} placeholder="Add chatbot slug (e.g. support-desk)" className="flex-1 bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-1.5 text-xs text-iso-text outline-none font-mono" />
                    <button type="button" onClick={addBotTag} className="px-3 py-1.5 bg-iso-bgSecondary hover:bg-iso-accent hover:text-white border border-iso-border text-xs font-bold rounded-sm transition-all cursor-pointer">Add Bot Slug</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTRACT & SLA */}
          {activeTab === "contract" && (
            <div className="flex flex-col gap-5">
              
              {/* Top Contract Status & Summary Bar */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-iso-primary/10 border border-iso-primary/20 flex items-center justify-center text-iso-primary shrink-0">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-iso-primary font-serif">Tenant Enterprise Agreement &amp; Contract Terms</h3>
                    <p className="text-[11px] text-iso-textMuted">Lifecycle timeline, billing model, SLA commitment, and renewal parameters.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-iso-textMuted uppercase font-semibold">Status:</span>
                  <select
                    value={formData.contract?.contractStatus || "Active"}
                    onChange={(e) => updateContractField("contractStatus", e.target.value)}
                    className="bg-iso-cardBg border border-iso-border rounded px-2.5 py-1 text-xs font-bold outline-none cursor-pointer text-iso-primary"
                  >
                    {CONTRACT_STATUSES.map(st => (
                      <option key={st.value} value={st.value}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. CONTRACT TIMELINE & LIFECYCLE */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-iso-border pb-2">
                  <h4 className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                    <Calendar size={13} className="text-iso-accent" />
                    Contract Lifecycle &amp; Validity Dates
                  </h4>
                  <span className="text-[10px] font-mono text-iso-textMuted">Core timeline definitions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Contract Number / Reference */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Ref # / PO Number
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.contractNumber || ""}
                      onChange={(e) => updateContractField("contractNumber", e.target.value)}
                      placeholder="e.g. ISO-CTR-2026-001"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>

                  {/* Contract Term Duration */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted font-semibold">
                        Contract Term Duration
                      </label>
                      {formData.contract?.startDate && (
                        <button
                          type="button"
                          onClick={() => calculateEndDateFromTerm(formData.contract?.startDate, formData.contract?.contractTerm || "1 Year")}
                          className="text-[9px] text-iso-accent hover:underline cursor-pointer"
                          title="Auto-calculate end date based on term"
                        >
                          Recalculate End
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.contract?.contractTerm || "1 Year"}
                      onChange={(e) => {
                        updateContractField("contractTerm", e.target.value);
                        calculateEndDateFromTerm(formData.contract?.startDate, e.target.value);
                      }}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {CONTRACT_TERMS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contract Start Date */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Start Date <span className="text-iso-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.contract?.startDate)}
                      onChange={(e) => {
                        updateContractField("startDate", e.target.value);
                        if (formData.contract?.contractTerm) {
                          calculateEndDateFromTerm(e.target.value, formData.contract.contractTerm);
                        }
                      }}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono cursor-pointer"
                    />
                  </div>

                  {/* Contract End Date / Expiry */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract End Date (Expiry) <span className="text-iso-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.contract?.endDate)}
                      onChange={(e) => updateContractField("endDate", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono cursor-pointer"
                    />
                  </div>

                  {/* Contract Renewed On */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Renewed On Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.contract?.renewedOn)}
                      onChange={(e) => updateContractField("renewedOn", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono cursor-pointer"
                    />
                    <span className="text-[9px] text-iso-textMuted block mt-0.5">Leave blank if this is the initial contract term.</span>
                  </div>

                  {/* Renewal Notice Window */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Renewal Notice Window (Days)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={formData.contract?.renewalNoticeDays ?? 30}
                        onChange={(e) => updateContractField("renewalNoticeDays", parseInt(e.target.value) || 0)}
                        className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                      />
                      <span className="text-xs text-iso-textMuted shrink-0">Days prior</span>
                    </div>
                  </div>
                </div>

                {/* Auto Renew Toggle */}
                <div className="pt-2 border-t border-iso-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-iso-primary block">Automatic Term Renewal (Evergreen)</span>
                    <span className="text-[11px] text-iso-textMuted font-mono">Contract automatically renews for consecutive equal periods unless terminated within notice window.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateContractField("autoRenew", !formData.contract?.autoRenew)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.contract?.autoRenew ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.contract?.autoRenew ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                    <span className="text-[10px] font-mono font-bold">{formData.contract?.autoRenew ? "AUTO-RENEW ON" : "MANUAL"}</span>
                  </div>
                </div>
              </div>

              {/* 2. COMMERCIALS & BILLING */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-iso-border pb-2">
                  <h4 className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                    <DollarSign size={13} className="text-emerald-600" />
                    Commercials &amp; Billing Terms
                  </h4>
                  <span className="text-[10px] font-mono text-iso-textMuted">Financial agreements &amp; invoices</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Contract Value */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Value (ACV / Total)
                    </label>
                    <div className="flex items-center">
                      <span className="px-2 py-1.5 bg-iso-bgSecondary border border-r-0 border-iso-border rounded-l text-xs font-mono text-iso-textMuted">
                        {formData.contract?.currency || "USD"}
                      </span>
                      <input
                        type="text"
                        value={formData.contract?.contractValue || ""}
                        onChange={(e) => updateContractField("contractValue", e.target.value)}
                        placeholder="e.g. 24,000"
                        className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded-r px-3 py-1.5 text-xs text-iso-text outline-none font-mono font-semibold"
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Billing Currency
                    </label>
                    <select
                      value={formData.contract?.currency || "USD"}
                      onChange={(e) => updateContractField("currency", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                  </div>

                  {/* Billing Frequency */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Billing Frequency / Cycle
                    </label>
                    <select
                      value={formData.contract?.billingCycle || "Annually"}
                      onChange={(e) => updateContractField("billingCycle", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {BILLING_CYCLES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Payment Terms
                    </label>
                    <select
                      value={formData.contract?.paymentTerms || "Net 30"}
                      onChange={(e) => updateContractField("paymentTerms", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {PAYMENT_TERMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Payment Status
                    </label>
                    <select
                      value={formData.contract?.paymentStatus || "Current"}
                      onChange={(e) => updateContractField("paymentStatus", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer font-semibold"
                    >
                      {PAYMENT_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Dedicated Account Manager
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.accountManager || ""}
                      onChange={(e) => updateContractField("accountManager", e.target.value)}
                      placeholder="e.g. Sarah Jenkins (Enterprise Lead)"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. SERVICE LEVEL AGREEMENT (SLA) & BOT LIMITS */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-iso-border pb-2">
                  <h4 className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-blue-600" />
                    Service Level Agreement (SLA) &amp; Platform Quotas
                  </h4>
                  <span className="text-[10px] font-mono text-iso-textMuted">Operational guarantees</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* SLA Tier */}
                  <div className="sm:col-span-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      SLA Tier Commitment
                    </label>
                    <select
                      value={formData.contract?.slaTier || "Standard (99.5% Uptime, 24h SLA)"}
                      onChange={(e) => updateContractField("slaTier", e.target.value)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {SLA_TIERS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Included Chatbots Limit */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Max Included AI Chatbots
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.contract?.maxBotsIncluded ?? 5}
                      onChange={(e) => updateContractField("maxBotsIncluded", parseInt(e.target.value) || 1)}
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>

                  {/* Monthly Inquiries Limit */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Monthly Inquiry / Token Allowance
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.monthlyInquiryLimit || "50,000 inquiries"}
                      onChange={(e) => updateContractField("monthlyInquiryLimit", e.target.value)}
                      placeholder="e.g. 100,000 inquiries / Unlimited"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. CLIENT SIGNATORY & STAKEHOLDERS */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-iso-border pb-2">
                  <h4 className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                    <UserCheck size={13} className="text-purple-600" />
                    Client Signatory &amp; Billing Contacts
                  </h4>
                  <span className="text-[10px] font-mono text-iso-textMuted">Official communication channel</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Primary Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.primaryContactName || ""}
                      onChange={(e) => updateContractField("primaryContactName", e.target.value)}
                      placeholder="e.g. Johnathan Davis"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Primary Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contract?.primaryContactEmail || ""}
                      onChange={(e) => updateContractField("primaryContactEmail", e.target.value)}
                      placeholder="billing@organization.com"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Primary Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contract?.primaryContactPhone || ""}
                      onChange={(e) => updateContractField("primaryContactPhone", e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 5. EXECUTED DOCUMENT & SPECIAL TERMS */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-iso-border pb-2">
                  <h4 className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                    <Tag size={13} className="text-amber-600" />
                    Agreement Document &amp; Special Clauses
                  </h4>
                  <span className="text-[10px] font-mono text-iso-textMuted">Reference links &amp; provisions</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                    Signed Agreement PDF / Cloud Document URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.contract?.documentUrl || ""}
                      onChange={(e) => updateContractField("documentUrl", e.target.value)}
                      placeholder="https://drive.google.com/... or https://docusign.net/..."
                      className="flex-1 bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-1.5 text-xs text-iso-text outline-none font-mono"
                    />
                    {formData.contract?.documentUrl && (
                      <a
                        href={formData.contract.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-iso-bgSecondary hover:bg-iso-cardBg border border-iso-border rounded text-xs font-mono text-iso-primary flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                    Special Terms, Amendments &amp; Contract Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.contract?.notes || ""}
                    onChange={(e) => updateContractField("notes", e.target.value)}
                    placeholder="e.g. Custom vector embedding storage clause included. 60-day trial extension applied for semester onboarding."
                    className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-2 text-xs text-iso-text outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BRANDING & ASSETS */}
          {activeTab === "branding" && (
            <div className="flex flex-col gap-5">
              
              {/* Login Big Logo */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-iso-primary block">Header &amp; Login Screen Logo (Big Logo)</label>
                    <p className="text-[11px] text-iso-textMuted">Displayed prominently on the tenant's login screen and portal header.</p>
                  </div>
                  {cfg.logoBigUrl && (
                    <button 
                      type="button" 
                      onClick={() => updateConfigField("logoBigUrl", "")} 
                      className="text-[10px] text-iso-error hover:underline cursor-pointer"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <input 
                      type="url" 
                      value={cfg.logoBigUrl || ""} 
                      onChange={(e) => updateConfigField("logoBigUrl", e.target.value)} 
                      placeholder="https://example.com/branding/tenant-logo.png" 
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-2 text-xs text-iso-text outline-none font-mono" 
                    />
                  </div>
                  <div className="w-48 h-16 border border-dashed border-iso-border rounded flex items-center justify-center p-2 bg-iso-cardBg shrink-0 overflow-hidden">
                    {cfg.logoBigUrl ? (
                      <img 
                        src={cfg.logoBigUrl} 
                        alt="Logo Preview" 
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-[10px] text-iso-textMuted font-mono italic">No logo provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Login Screen Background Image */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-iso-primary block">Login Screen Background Image URL</label>
                    <p className="text-[11px] text-iso-textMuted">Full-resolution backdrop image rendered behind the tenant login screen.</p>
                  </div>
                  {cfg.backgroudImageUrl && (
                    <button 
                      type="button" 
                      onClick={() => updateConfigField("backgroudImageUrl", "")} 
                      className="text-[10px] text-iso-error hover:underline cursor-pointer"
                    >
                      Clear Background Image
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <input 
                      type="url" 
                      value={cfg.backgroudImageUrl || ""} 
                      onChange={(e) => updateConfigField("backgroudImageUrl", e.target.value)} 
                      placeholder="https://example.com/branding/login-backdrop.jpg" 
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-2 text-xs text-iso-text outline-none font-mono" 
                    />
                  </div>
                  <div className="w-48 h-20 border border-dashed border-iso-border rounded flex items-center justify-center p-1 bg-iso-cardBg shrink-0 overflow-hidden relative">
                    {cfg.backgroudImageUrl ? (
                      <img 
                        src={cfg.backgroudImageUrl} 
                        alt="Background Preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-[10px] text-iso-textMuted font-mono italic text-center">No backdrop URL<br />(uses bg color)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Small Logo */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-iso-primary block">Sidebar / Compact Brand Logo URL</label>
                    <p className="text-[11px] text-iso-textMuted">Displayed at top left of navigation drawer &amp; collapsed mobile headers.</p>
                  </div>
                  {cfg.logoSmallUrl && (
                    <button 
                      type="button" 
                      onClick={() => updateConfigField("logoSmallUrl", "")} 
                      className="text-[10px] text-iso-error hover:underline cursor-pointer"
                    >
                      Clear Small Logo
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <input 
                      type="url" 
                      value={cfg.logoSmallUrl || ""} 
                      onChange={(e) => updateConfigField("logoSmallUrl", e.target.value)} 
                      placeholder="https://example.com/branding/small-logo.png" 
                      className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-2 text-xs text-iso-text outline-none font-mono" 
                    />
                  </div>
                  <div className="w-32 h-14 border border-dashed border-iso-border rounded flex items-center justify-center p-2 bg-iso-cardBg shrink-0 overflow-hidden">
                    {cfg.logoSmallUrl ? (
                      <img 
                        src={cfg.logoSmallUrl} 
                        alt="Small Logo Preview" 
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-[10px] text-iso-textMuted font-mono italic">No small logo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comprehensive Browser Favicon Section */}
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-iso-primary flex items-center gap-1.5">
                      <Globe size={13} className="text-iso-accent" />
                      Browser Tab Favicon URL (.ico / .png / .svg / .webp)
                    </label>
                    <p className="text-[11px] text-iso-textMuted">
                      Appears in browser tabs, bookmarks bar, and shortcut icons across all user devices.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cfg.logoSmallUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfigField("faviconUrl", cfg.logoSmallUrl);
                          if (showToast) showToast("Copied small logo URL to favicon.");
                        }}
                        className="px-2 py-1 bg-iso-bgSecondary hover:bg-iso-cardBg border border-iso-border rounded text-[11px] font-mono text-iso-text flex items-center gap-1 cursor-pointer transition-colors"
                        title="Use Small Logo URL as Favicon"
                      >
                        <Copy size={11} />
                        Use Small Logo
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const iconToTest = cfg.faviconUrl || cfg.logoSmallUrl || '/isomorphic-icon.png';
                        updateFavicon(iconToTest);
                        if (showToast) showToast("Live preview: Tab favicon updated in your browser!");
                      }}
                      className="px-2 py-1 bg-iso-primary/10 hover:bg-iso-primary/20 text-iso-primary border border-iso-primary/30 rounded text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Test how this icon looks in your current browser tab right now"
                    >
                      <RefreshCw size={11} />
                      Test in Browser Tab
                    </button>

                    {cfg.faviconUrl && (
                      <button
                        type="button"
                        onClick={() => updateConfigField("faviconUrl", "")}
                        className="text-[11px] text-iso-error hover:underline cursor-pointer ml-1"
                      >
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Favicon URL Input */}
                <div>
                  <input
                    type="url"
                    value={cfg.faviconUrl || ""}
                    onChange={(e) => updateConfigField("faviconUrl", e.target.value)}
                    placeholder="https://example.com/branding/favicon.ico or .png"
                    className="w-full bg-iso-cardBg border border-iso-border focus:border-iso-accent rounded px-3 py-2 text-xs text-iso-text outline-none font-mono"
                  />
                </div>

                {/* Live Browser Tab Preview Mockup */}
                <div className="mt-1 bg-slate-900 rounded-md border border-slate-700/80 p-3 flex flex-col gap-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1">
                      <Eye size={11} /> Browser Tab Rendering Mockup
                    </span>
                    <span className="text-slate-500">32x32 / 64x64 / SVG</span>
                  </div>

                  {/* Browser Chrome Bar Mockup */}
                  <div className="bg-slate-800/90 rounded border border-slate-700 p-2 flex flex-col gap-2">
                    {/* Top Tab Strip */}
                    <div className="flex items-center gap-1">
                      {/* Active Mock Tab */}
                      <div className="bg-slate-900 text-slate-100 border-t border-l border-r border-slate-600 rounded-t px-3 py-1.5 flex items-center gap-2 max-w-xs shadow-sm">
                        <img
                          src={cfg.faviconUrl || cfg.logoSmallUrl || "/isomorphic-icon.png"}
                          alt="Tab Favicon"
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 object-contain shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/isomorphic-icon.png";
                          }}
                        />
                        <span className="text-xs font-sans font-medium text-slate-200 truncate">
                          {cfg.instituteName || formData.tenantName || "Organization"} | Isomorphic Portal
                        </span>
                        <span className="text-slate-400 text-[10px] hover:text-slate-200 cursor-default ml-1">✕</span>
                      </div>

                      {/* Inactive Dummy Tab */}
                      <div className="text-slate-400 px-3 py-1.5 text-xs font-sans truncate hidden sm:flex items-center gap-2 opacity-60">
                        <span className="w-3 h-3 rounded-full bg-slate-600 inline-block"></span>
                        <span className="text-[11px]">Analytics Dashboard</span>
                      </div>
                    </div>

                    {/* Address / URL Bar */}
                    <div className="bg-slate-900/90 rounded border border-slate-700/80 px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-slate-300">
                      <span className="text-emerald-400 text-xs">🔒</span>
                      <span className="text-slate-500">https://</span>
                      <span className="text-emerald-300 font-bold">{(formData.tenantId || formData.code || "tenant").toLowerCase().trim()}.isomorphic.in</span>
                      <span className="text-slate-500">/dashboard</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: THEME & LIVE LOGIN PREVIEW */}
          {activeTab === "theme" && (
            <div className="flex flex-col gap-5">
              
              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* Primary Button & Brand Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Primary Theme / Button Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.ButtonandLeftBarColor || "#00306D"} onChange={(e) => updateConfigField("ButtonandLeftBarColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.ButtonandLeftBarColor || "#00306D"} onChange={(e) => updateConfigField("ButtonandLeftBarColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Login Background Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Login Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.loginBackgroundColor || "#fdf7f7"} onChange={(e) => updateConfigField("loginBackgroundColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.loginBackgroundColor || "#fdf7f7"} onChange={(e) => updateConfigField("loginBackgroundColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Button Font Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Button Text / Font Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.buttonFontColor || "#ffffff"} onChange={(e) => updateConfigField("buttonFontColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.buttonFontColor || "#ffffff"} onChange={(e) => updateConfigField("buttonFontColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Borders Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Border &amp; Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.BordersColor || "#578b96"} onChange={(e) => updateConfigField("BordersColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.BordersColor || "#578b96"} onChange={(e) => updateConfigField("BordersColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Subtext / Link Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Subtext &amp; Link Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.forgotFontColor || "#373737"} onChange={(e) => updateConfigField("forgotFontColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.forgotFontColor || "#373737"} onChange={(e) => updateConfigField("forgotFontColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Disabled Button Color */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Disabled / Loading Button Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={cfg.disableButtonColor || "#c1c1c1"} onChange={(e) => updateConfigField("disableButtonColor", e.target.value)} className="w-8 h-8 rounded border border-iso-border cursor-pointer p-0 bg-transparent shrink-0" />
                    <input type="text" value={cfg.disableButtonColor || "#c1c1c1"} onChange={(e) => updateConfigField("disableButtonColor", e.target.value)} className="w-full bg-iso-cardBg border border-iso-border rounded px-2 py-1 text-xs font-mono text-iso-text outline-none" />
                  </div>
                </div>

                {/* Header Font Size */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Header / Brand Title Font Size</label>
                  <input type="text" value={cfg.allHeaderFontSize || "1.6rem"} onChange={(e) => updateConfigField("allHeaderFontSize", e.target.value)} placeholder="e.g. 1.6rem, 24px" className="w-full bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs font-mono text-iso-text outline-none" />
                </div>

                {/* Subtitle / Title Font Size */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1.5 font-semibold">Subtitle / Body Font Size</label>
                  <input type="text" value={cfg.allTitleFontSize || "0.75rem"} onChange={(e) => updateConfigField("allTitleFontSize", e.target.value)} placeholder="e.g. 0.75rem, 12px" className="w-full bg-iso-cardBg border border-iso-border rounded px-3 py-1.5 text-xs font-mono text-iso-text outline-none" />
                </div>

              </div>

              {/* LIVE LOGIN SCREEN PREVIEW CARD */}
              <div className="border border-iso-border rounded-sm p-4 bg-iso-bg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-iso-primary flex items-center gap-1.5">
                    <Eye size={13} className="text-iso-accent" /> Live Login Screen Mockup Preview
                  </span>
                  <span className="text-[10px] font-mono text-iso-textMuted">Updates in real-time</span>
                </div>

                {/* Mockup Canvas */}
                <div 
                  className="w-full h-72 rounded-sm border border-iso-border relative overflow-hidden flex items-center justify-center p-4 transition-all duration-300"
                  style={{
                    backgroundColor: cfg.loginBackgroundColor || '#fdf7f7',
                    backgroundImage: cfg.backgroudImageUrl ? `url(${cfg.backgroudImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Subtle dark backdrop overlay if background image exists */}
                  {cfg.backgroudImageUrl && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                  )}

                  {/* Mockup Login Dialog Card */}
                  <div 
                    className="relative z-10 w-full max-w-xs backdrop-blur-md rounded-md p-5 shadow-xl border flex flex-col gap-3"
                    style={{
                      backgroundColor: cfg.loginBackgroundColor || '#ffffff',
                      borderColor: cfg.BordersColor ? (cfg.BordersColor.length === 7 ? `${cfg.BordersColor}50` : cfg.BordersColor) : '#E2DFD6'
                    }}
                  >
                    {/* Mock Logo */}
                    <div className="flex flex-col items-center text-center">
                      {cfg.logoBigUrl ? (
                        <img 
                          src={cfg.logoBigUrl} 
                          alt="Logo" 
                          referrerPolicy="no-referrer"
                          className="max-h-10 max-w-[160px] object-contain mb-1"
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      ) : (
                        <span className="text-base font-serif font-bold text-slate-800 dark:text-slate-100">
                          {cfg.instituteName || formData.tenantName || 'isomorphic'}
                        </span>
                      )}
                      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500" style={{ color: cfg.forgotFontColor || '#64748b' }}>
                        {cfg.instituteName ? `${cfg.instituteName} Portal` : 'Tenant Administration Console'}
                      </span>
                    </div>

                    {/* Mock Inputs */}
                    <div className="flex flex-col gap-2">
                      <div className="h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 flex items-center text-[10px] text-slate-400 font-mono">
                        username
                      </div>
                      <div className="h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 flex items-center text-[10px] text-slate-400 font-mono">
                        ••••••••
                      </div>
                    </div>

                    {/* Mock Button */}
                    <button
                      type="button"
                      className="w-full py-1.5 rounded text-xs font-bold shadow-sm transition-transform cursor-default"
                      style={{
                        backgroundColor: cfg.ButtonandLeftBarColor || '#00306D',
                        color: cfg.buttonFontColor || '#ffffff',
                        borderColor: cfg.BordersColor || cfg.ButtonandLeftBarColor || '#00306D'
                      }}
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BEHAVIOR */}
          {activeTab === "behavior" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-iso-primary">Show Integration Type in Chat History</h4>
                  <p className="text-[11px] text-iso-textMuted font-mono">Enables origin badges on session transcripts.</p>
                </div>
                <input type="checkbox" checked={Boolean(cfg.showIntegrationTypeInChatHistory)} onChange={(e) => updateConfigField("showIntegrationTypeInChatHistory", e.target.checked)} className="w-4 h-4 accent-iso-primary cursor-pointer" />
              </div>
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-iso-primary">Show Job Queue Notification Icon</h4>
                  <p className="text-[11px] text-iso-textMuted font-mono">Displays ingestion processing icon in navbar.</p>
                </div>
                <input type="checkbox" checked={Boolean(cfg.showJobQueueNotificationIcon)} onChange={(e) => updateConfigField("showJobQueueNotificationIcon", e.target.checked)} className="w-4 h-4 accent-iso-primary cursor-pointer" />
              </div>
              <div className="p-4 bg-iso-bg border border-iso-border rounded-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-iso-primary">Enable AI Grievance &amp; Student Ticket System</h4>
                  <p className="text-[11px] text-iso-textMuted font-mono">Enables automatic grievance ticket generation in student chatbot and activates the Grievances &amp; Tickets portal menu.</p>
                </div>
                <input type="checkbox" checked={cfg.enableGrievanceSystem !== false} onChange={(e) => updateConfigField("enableGrievanceSystem", e.target.checked)} className="w-4 h-4 accent-iso-primary cursor-pointer" />
              </div>
            </div>
          )}

          {/* TAB 5: ADVANCED JSON */}
          {activeTab === "json" && (
            <div className="flex flex-col gap-2">
              {jsonError && <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">{jsonError}</div>}
              <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} rows={16} className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-3 rounded-sm border border-iso-border outline-none focus:border-iso-accent" spellCheck={false} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-iso-border flex items-center justify-between bg-iso-bgSecondary/20">
          <span className="text-[10px] font-mono text-iso-textMuted">{formData.id ? `Tenant: ${formData.id}` : "New Organization"}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-1.5 bg-iso-bgSecondary hover:bg-iso-border/40 text-iso-text border border-iso-border rounded-sm text-xs font-semibold transition-all cursor-pointer">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-1.5 bg-iso-primary hover:bg-iso-primaryLight text-white rounded-sm text-xs font-bold border border-iso-primary flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-70 cursor-pointer">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{saving ? "Saving..." : (formData.id ? "Save Changes" : "Onboard Organization")}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
