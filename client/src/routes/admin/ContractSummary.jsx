import React, { useState, useEffect, useMemo } from "react";
import {
  FileText, Calendar, DollarSign, Clock, ShieldCheck, UserCheck,
  AlertCircle, FileCheck, Tag, Info, Search, Filter, RefreshCw,
  Plus, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Download,
  CheckCircle2, AlertTriangle, Eye, Edit3, Building2, Check, X,
  Loader2, Globe, Shield, User, ChevronRight, Sparkles, Phone, Mail,
  CreditCard, Repeat, Layers, Award, BarChart3, HelpCircle, ArrowRight
} from "lucide-react";
import CustomDropdown from "../../components/CustomDropdown";
import TenantModal from "./components/TenantModal";
import { apiUrl } from "../../config/api";

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

const formatDateDisplay = (dateVal) => {
  if (!dateVal) return "Not Set";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Not Set";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return "Not Set";
  }
};

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

const calculateDaysRemaining = (endDateStr) => {
  if (!endDateStr) return null;
  try {
    const end = new Date(endDateStr);
    if (isNaN(end.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
};

const calculateProgressPercent = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;
  try {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  } catch (e) {
    return 0;
  }
};

export default function ContractSummary({
  tenants = [],
  selectedTenant,
  setSelectedTenant,
  fetchTenants,
  currentUser,
  showToast,
  setCurrentMenu
}) {
  const isGlobalAdmin = Boolean(
    currentUser?.role === "global_admin" ||
    currentUser?.role === "super_admin" ||
    currentUser?.role === "admin" ||
    currentUser?.isGlobalAdmin ||
    currentUser?.tenantId === "admin"
  );

  // Active Tenant state for viewing contract widgets
  const [activeTenantId, setActiveTenantId] = useState("");

  // Modals
  const [editingContract, setEditingContract] = useState(false);
  const [showFullTenantModal, setShowFullTenantModal] = useState(false);

  // Quick Renewal / Edit Form State
  const [renewalForm, setRenewalForm] = useState({
    contractNumber: "",
    contractStatus: "Active",
    startDate: "",
    endDate: "",
    renewedOn: "",
    contractTerm: "1 Year",
    contractValue: "",
    currency: "USD",
    billingCycle: "Annually",
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
  });
  const [isSavingRenewal, setIsSavingRenewal] = useState(false);

  // Initialize or align activeTenantId
  useEffect(() => {
    if (tenants && tenants.length > 0) {
      if (selectedTenant) {
        const tId = selectedTenant.tenantId || selectedTenant.code || selectedTenant._id;
        setActiveTenantId(tId);
      } else if (!activeTenantId) {
        const first = tenants[0];
        const tId = first.tenantId || first.code || first._id;
        setActiveTenantId(tId);
        if (setSelectedTenant) setSelectedTenant(first);
      }
    }
  }, [tenants, selectedTenant]);

  // Current active tenant object
  const activeTenant = useMemo(() => {
    if (!tenants || tenants.length === 0) return selectedTenant || null;
    if (!activeTenantId) return selectedTenant || tenants[0];
    const match = tenants.find(t => 
      (t.tenantId && t.tenantId.toLowerCase() === activeTenantId.toLowerCase()) ||
      (t.code && t.code.toLowerCase() === activeTenantId.toLowerCase()) ||
      (t._id && t._id.toString() === activeTenantId.toString())
    );
    return match || selectedTenant || tenants[0];
  }, [tenants, activeTenantId, selectedTenant]);

  // Populate renewal form when activeTenant changes
  useEffect(() => {
    if (activeTenant) {
      const c = activeTenant.contract || {};
      setRenewalForm({
        contractNumber: c.contractNumber || `ISO-CTR-${new Date().getFullYear()}-${(activeTenant.code || activeTenant.tenantId || "ORG").toUpperCase()}`,
        contractStatus: c.contractStatus || "Active",
        startDate: formatDateForInput(c.startDate) || new Date().toISOString().split("T")[0],
        endDate: formatDateForInput(c.endDate) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        renewedOn: formatDateForInput(c.renewedOn) || "",
        contractTerm: c.contractTerm || "1 Year",
        contractValue: c.contractValue || "",
        currency: c.currency || "USD",
        billingCycle: c.billingCycle || "Annually",
        paymentTerms: c.paymentTerms || "Net 30",
        paymentStatus: c.paymentStatus || "Current",
        autoRenew: Boolean(c.autoRenew),
        renewalNoticeDays: c.renewalNoticeDays !== undefined ? c.renewalNoticeDays : 30,
        slaTier: c.slaTier || "Standard (99.5% Uptime, 24h SLA)",
        maxBotsIncluded: c.maxBotsIncluded !== undefined ? c.maxBotsIncluded : 5,
        monthlyInquiryLimit: c.monthlyInquiryLimit || "50,000 inquiries",
        accountManager: c.accountManager || "",
        primaryContactName: c.primaryContactName || "",
        primaryContactEmail: c.primaryContactEmail || "",
        primaryContactPhone: c.primaryContactPhone || "",
        documentUrl: c.documentUrl || "",
        notes: c.notes || ""
      });
    }
  }, [activeTenant]);

  const handleCalculateEndDate = (start, term) => {
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

      nextDate.setDate(nextDate.getDate() - 1);
      setRenewalForm(prev => ({
        ...prev,
        endDate: nextDate.toISOString().split("T")[0]
      }));
    } catch (e) {}
  };

  const handleSaveRenewal = async (e) => {
    if (e) e.preventDefault();
    if (!activeTenant) return;

    setIsSavingRenewal(true);
    try {
      const tenantId = activeTenant._id || activeTenant.tenantId;
      const sessionId = localStorage.getItem("iso_session_id") || "";

      const res = await fetch(apiUrl(`/api/admin/tenants/${tenantId}/contract`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify(renewalForm)
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Contract for "${activeTenant.name || activeTenant.tenantName}" updated successfully.`);
        setEditingContract(false);
        if (fetchTenants) fetchTenants();
      } else {
        showToast(data.error || "Failed to update contract.", "error");
      }
    } catch (err) {
      showToast("Network error updating contract.", "error");
    } finally {
      setIsSavingRenewal(false);
    }
  };

  // Active Contract Metrics
  const contract = activeTenant?.contract || {};
  const daysRemaining = calculateDaysRemaining(contract.endDate);
  const progressPercent = calculateProgressPercent(contract.startDate, contract.endDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 60;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  // Export Summary as Text/JSON Report
  const handleExportSummary = () => {
    if (!activeTenant) return;
    try {
      const report = {
        organization: activeTenant.name || activeTenant.tenantName,
        tenantId: activeTenant.code || activeTenant.tenantId,
        databaseWorkspace: activeTenant.tenantDbName || `iso_${activeTenant.code}`,
        contract: {
          referenceNumber: contract.contractNumber || `ISO-CTR-${(activeTenant.code || "org").toUpperCase()}`,
          status: contract.contractStatus || (activeTenant.tenantActive !== false ? "Active" : "Inactive"),
          term: contract.contractTerm || "1 Year",
          startDate: formatDateDisplay(contract.startDate),
          endDate: formatDateDisplay(contract.endDate),
          daysRemaining: daysRemaining !== null ? daysRemaining : "N/A",
          renewedOn: formatDateDisplay(contract.renewedOn),
          autoRenew: contract.autoRenew ? "Enabled" : "Disabled",
          renewalNoticeWindowDays: contract.renewalNoticeDays ?? 30,
          contractValue: contract.contractValue ? `${contract.currency || "USD"} ${contract.contractValue}` : "N/A",
          billingCycle: contract.billingCycle || "Annually",
          paymentTerms: contract.paymentTerms || "Net 30",
          paymentStatus: contract.paymentStatus || "Current",
          slaTier: contract.slaTier || "Standard (99.5% Uptime, 24h SLA)",
          maxBotsIncluded: contract.maxBotsIncluded || 5,
          monthlyInquiryLimit: contract.monthlyInquiryLimit || "50,000 inquiries",
          signatory: {
            name: contract.primaryContactName || "N/A",
            email: contract.primaryContactEmail || "N/A",
            phone: contract.primaryContactPhone || "N/A"
          },
          accountManager: contract.accountManager || "Enterprise Lead",
          documentUrl: contract.documentUrl || "N/A",
          specialNotes: contract.notes || "None"
        },
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `contract_summary_${(activeTenant.code || activeTenant.tenantId || "org").toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Contract summary JSON downloaded.");
    } catch (e) {
      showToast("Failed to export summary.", "error");
    }
  };

  // Status Badge Helper
  const getStatusBadge = () => {
    const status = contract.contractStatus || (activeTenant?.tenantActive !== false ? "Active" : "Inactive");
    
    if (isExpired && status !== "Terminated") {
      return (
        <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
          EXPIRED CONTRACT
        </span>
      );
    }

    if (isExpiringSoon && status === "Active") {
      return (
        <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
          <Clock size={13} className="text-amber-600" />
          EXPIRING SOON ({daysRemaining} DAYS)
        </span>
      );
    }

    switch (status) {
      case "Active":
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            ACTIVE AGREEMENT
          </span>
        );
      case "Pending Renewal":
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
            <Repeat size={13} className="text-blue-600" />
            PENDING RENEWAL
          </span>
        );
      case "Under Review":
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-2xs">
            UNDER REVIEW
          </span>
        );
      case "Draft":
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs">
            DRAFT AGREEMENT
          </span>
        );
      case "Terminated":
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-red-100 text-red-800 border border-red-400 shadow-2xs">
            TERMINATED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  if (!activeTenant) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-iso-cardBg border border-dashed border-iso-border rounded-sm text-center max-w-lg mx-auto">
        <Building2 size={36} className="text-iso-textMuted/40 mb-3" />
        <h3 className="text-sm font-bold text-iso-primary">No Organization Selected</h3>
        <p className="text-xs text-iso-textMuted mt-1">Please select an organization or onboard a tenant to view contract specifications.</p>
        {isGlobalAdmin && (
          <button
            type="button"
            onClick={() => setShowFullTenantModal(true)}
            className="mt-4 px-4 py-2 bg-iso-primary text-white text-xs font-bold rounded-sm shadow-sm hover:bg-iso-primaryLight"
          >
            Onboard New Tenant
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* ========================================================================= */}
      {/* TOP HEADER & TENANT SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="border-b border-iso-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        
        {/* Title & Scope */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-iso-primary/10 border border-iso-primary/20 text-iso-primary text-[10px] font-mono font-bold uppercase rounded tracking-wider flex items-center gap-1">
              <FileCheck size={12} /> Enterprise Contract Lifecycle
            </span>
            <span className="text-xs text-iso-textMuted font-mono">
              {activeTenant.code || activeTenant.tenantId}
            </span>
          </div>
          <h1 className="text-2xl font-serif text-iso-primary font-bold">Contract Summary</h1>
          <p className="text-xs text-iso-textMuted">
            Dedicated enterprise service agreement, renewal milestones, SLA guarantees, and billing parameters.
          </p>
        </div>

        {/* Action Controls & Tenant Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Tenant Change Filter (Visible for Admin / Global Admin) */}
          {isGlobalAdmin && tenants && tenants.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-iso-textMuted font-semibold hidden sm:inline">Organization:</span>
              <CustomDropdown
                value={activeTenantId}
                onChange={(val) => {
                  setActiveTenantId(val);
                  const selected = tenants.find(t => (t.tenantId || t.code) === val);
                  if (selected && setSelectedTenant) {
                    setSelectedTenant(selected);
                  }
                }}
                options={tenants.map(t => ({
                  value: t.tenantId || t.code,
                  label: t.name || t.tenantName || t.tenantId,
                  badge: t.tenantId || t.code
                }))}
                icon={Building2}
                placeholder="Change Tenant..."
                className="min-w-[200px]"
              />
            </div>
          )}

          {/* Export Summary Button */}
          <button
            type="button"
            onClick={handleExportSummary}
            className="px-3 py-1.5 bg-iso-cardBg hover:bg-iso-bgSecondary border border-iso-border text-iso-primary text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Export Contract Summary JSON"
          >
            <Download size={13} /> Export JSON
          </button>

          {/* Quick Renew / Edit Button (Admin only) */}
          {isGlobalAdmin && (
            <button
              type="button"
              onClick={() => setEditingContract(true)}
              className="px-3.5 py-1.5 bg-iso-primary hover:bg-iso-primaryLight text-white text-xs font-bold rounded-sm border border-iso-primary flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Repeat size={13} /> Quick Renew / Edit
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              if (fetchTenants) fetchTenants();
              showToast("Refreshing contract data...");
            }}
            className="p-1.5 bg-iso-cardBg hover:bg-iso-bgSecondary border border-iso-border text-iso-textMuted hover:text-iso-primary rounded-sm transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* HERO BANNER WIDGET: ACTIVE CONTRACT OVERVIEW */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 bg-iso-cardBg border border-iso-border rounded-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Background Accent glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-iso-primary/5 -skew-x-12 pointer-events-none" />

        {/* Organization Identity & Title */}
        <div className="flex items-start gap-4 z-10">
          <div className="w-13 h-13 rounded-md bg-iso-primary/10 border border-iso-primary/20 flex items-center justify-center text-iso-primary shrink-0 shadow-inner">
            <Building2 size={24} />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-serif font-bold text-iso-primary">
                {activeTenant.name || activeTenant.tenantName}
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-iso-bgSecondary border border-iso-border text-iso-accent">
                {activeTenant.code || activeTenant.tenantId}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-iso-textMuted font-mono flex-wrap">
              <span>Ref: <strong>{contract.contractNumber || `ISO-CTR-${(activeTenant.code || "org").toUpperCase()}`}</strong></span>
              <span>·</span>
              <span>Term: <strong>{contract.contractTerm || "1 Year"}</strong></span>
              <span>·</span>
              <span>Workspace: <strong>{activeTenant.tenantDbName || `iso_${activeTenant.code}`}</strong></span>
            </div>
          </div>
        </div>

        {/* Status & Validity Badge Box */}
        <div className="flex flex-col md:items-end gap-2 z-10 w-full md:w-auto">
          {getStatusBadge()}
          
          <div className="text-xs font-mono text-iso-textMuted flex items-center gap-1.5">
            <Calendar size={13} className="text-iso-accent" />
            <span>Valid: <strong>{formatDateDisplay(contract.startDate)}</strong> to <strong>{formatDateDisplay(contract.endDate)}</strong></span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIMELINE PROGRESS BAR WIDGET */}
      {/* ========================================================================= */}
      <div className="p-4 bg-iso-cardBg border border-iso-border rounded-sm shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-iso-accent" />
            <span className="text-xs font-bold text-iso-primary uppercase font-mono tracking-wider">Contract Timeline Progress</span>
          </div>
          <div className="text-xs font-mono">
            {daysRemaining !== null ? (
              daysRemaining < 0 ? (
                <span className="text-rose-600 font-bold">Term expired {Math.abs(daysRemaining)} days ago</span>
              ) : daysRemaining === 0 ? (
                <span className="text-rose-600 font-bold">Expires today</span>
              ) : (
                <span className={isExpiringSoon ? "text-amber-600 font-bold" : "text-iso-text font-semibold"}>
                  {daysRemaining} Days Remaining Until Expiration
                </span>
              )
            ) : (
              <span className="text-iso-textMuted italic">Timeline dates not set</span>
            )}
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-iso-border/40">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isExpired ? "bg-rose-500" : isExpiringSoon ? "bg-amber-500" : "bg-iso-primary"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline endpoints */}
        <div className="flex items-center justify-between text-[11px] font-mono text-iso-textMuted">
          <div className="flex items-center gap-1">
            <span>Started:</span>
            <span className="font-semibold text-iso-text">{formatDateDisplay(contract.startDate)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="font-bold text-iso-primary">{progressPercent}% Elapsed</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Expires:</span>
            <span className={`font-semibold ${isExpired ? "text-rose-600 font-bold" : "text-iso-text"}`}>
              {formatDateDisplay(contract.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE CONTRACT WIDGETS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* WIDGET 1: 📅 LIFECYCLE & RENEWAL PARAMETERS */}
        <div className="p-5 bg-iso-cardBg border border-iso-border rounded-md shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-iso-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Calendar size={15} />
                </div>
                <h3 className="text-sm font-serif font-bold text-iso-primary">Lifecycle &amp; Renewal Milestone</h3>
              </div>
              <span className="text-[10px] font-mono text-iso-textMuted uppercase font-semibold">Terms</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Contract Start</span>
                <span className="font-bold text-iso-text">{formatDateDisplay(contract.startDate)}</span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Contract End (Expiry)</span>
                <span className={`font-bold ${isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-iso-text"}`}>
                  {formatDateDisplay(contract.endDate)}
                </span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Contract Renewed On</span>
                <span className="font-bold text-emerald-700">
                  {contract.renewedOn ? formatDateDisplay(contract.renewedOn) : "Initial Term"}
                </span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Agreement Duration</span>
                <span className="font-bold text-iso-primary">{contract.contractTerm || "1 Year"}</span>
              </div>
            </div>
          </div>

          {/* Auto Renewal Strip */}
          <div className="p-3 bg-iso-bgSecondary/60 border border-iso-border rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat size={14} className={contract.autoRenew ? "text-emerald-600" : "text-iso-textMuted"} />
              <div>
                <span className="text-xs font-semibold text-iso-primary block">Automatic Renewal Policy</span>
                <span className="text-[10px] font-mono text-iso-textMuted">{contract.renewalNoticeDays ?? 30} Days termination/renewal notice</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
              contract.autoRenew ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-300"
            }`}>
              {contract.autoRenew ? "AUTO-RENEW ON" : "MANUAL RENEWAL"}
            </span>
          </div>
        </div>

        {/* WIDGET 2: 💳 COMMERCIALS & BILLING TERMS */}
        <div className="p-5 bg-iso-cardBg border border-iso-border rounded-md shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-iso-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <DollarSign size={15} />
                </div>
                <h3 className="text-sm font-serif font-bold text-iso-primary">Commercials &amp; Billing Terms</h3>
              </div>
              <span className="text-[10px] font-mono text-iso-textMuted uppercase font-semibold">Financials</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Contract Value</span>
                <span className="font-bold text-iso-primary text-sm">
                  {contract.contractValue ? `${contract.currency || "USD"} ${contract.contractValue}` : "Custom Enterprise"}
                </span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Billing Frequency</span>
                <span className="font-bold text-iso-text">{contract.billingCycle || "Annually"}</span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Payment Terms</span>
                <span className="font-bold text-iso-text">{contract.paymentTerms || "Net 30"}</span>
              </div>

              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted">Payment Status</span>
                <span className="font-bold text-emerald-700">{contract.paymentStatus || "Current"}</span>
              </div>
            </div>
          </div>

          {/* Account Manager bar */}
          <div className="p-3 bg-iso-bgSecondary/60 border border-iso-border rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-iso-accent" />
              <div>
                <span className="text-xs font-semibold text-iso-primary block">Currency: {contract.currency || "USD"}</span>
                <span className="text-[10px] font-mono text-iso-textMuted">Invoicing cycle active</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-iso-primary">
              {contract.paymentTerms || "Net 30"}
            </span>
          </div>
        </div>

        {/* WIDGET 3: 🛡️ SLA GUARANTEES & BOT ENTITLEMENTS */}
        <div className="p-5 bg-iso-cardBg border border-iso-border rounded-md shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-iso-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <ShieldCheck size={15} />
                </div>
                <h3 className="text-sm font-serif font-bold text-iso-primary">Service Level Agreement (SLA) &amp; Quotas</h3>
              </div>
              <span className="text-[10px] font-mono text-iso-textMuted uppercase font-semibold">Guarantees</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs font-mono">
              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-iso-textMuted block">SLA Availability Tier</span>
                  <span className="font-bold text-iso-primary text-xs">{contract.slaTier || "Standard (99.5% Uptime, 24h SLA)"}</span>
                </div>
                <Award size={18} className="text-purple-600 shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-iso-textMuted">Included Chatbots</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-iso-primary text-sm">{contract.maxBotsIncluded || 5}</span>
                    <span className="text-[10px] text-iso-textMuted">Bots Allowed</span>
                  </div>
                </div>

                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-iso-textMuted">Monthly Inquiries</span>
                  <span className="font-bold text-iso-text truncate">{contract.monthlyInquiryLimit || "50,000 queries"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-iso-bgSecondary/60 border border-iso-border rounded-sm flex items-center justify-between text-xs font-mono">
            <span className="text-iso-textMuted">Assigned Account Manager:</span>
            <span className="font-bold text-iso-primary">{contract.accountManager || "Enterprise Operations Team"}</span>
          </div>
        </div>

        {/* WIDGET 4: 👤 CLIENT SIGNATORY & STAKEHOLDERS */}
        <div className="p-5 bg-iso-cardBg border border-iso-border rounded-md shadow-2xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-iso-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <UserCheck size={15} />
                </div>
                <h3 className="text-sm font-serif font-bold text-iso-primary">Client Signatory &amp; Contacts</h3>
              </div>
              <span className="text-[10px] font-mono text-iso-textMuted uppercase font-semibold">Stakeholders</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase text-iso-textMuted font-mono">Primary Signatory Name</span>
                <span className="font-bold text-iso-text">{contract.primaryContactName || "Signatory on file"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-iso-textMuted font-mono">Billing Email</span>
                  {contract.primaryContactEmail ? (
                    <a href={`mailto:${contract.primaryContactEmail}`} className="font-mono text-iso-accent hover:underline truncate flex items-center gap-1 font-semibold">
                      <Mail size={11} /> {contract.primaryContactEmail}
                    </a>
                  ) : (
                    <span className="font-mono text-iso-textMuted">Not configured</span>
                  )}
                </div>

                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-iso-textMuted font-mono">Phone Number</span>
                  {contract.primaryContactPhone ? (
                    <a href={`tel:${contract.primaryContactPhone}`} className="font-mono text-iso-text hover:underline flex items-center gap-1">
                      <Phone size={11} /> {contract.primaryContactPhone}
                    </a>
                  ) : (
                    <span className="font-mono text-iso-textMuted">Not configured</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Link */}
          <div className="p-3 bg-iso-bgSecondary/60 border border-iso-border rounded-sm flex items-center justify-between text-xs">
            <span className="text-iso-textMuted font-mono">Executed Agreement:</span>
            {contract.documentUrl ? (
              <a
                href={contract.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-iso-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <ExternalLink size={12} /> View Document PDF
              </a>
            ) : (
              <span className="text-iso-textMuted italic font-mono text-[11px]">No external URL attached</span>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* WIDGET 5: SPECIAL PROVISIONS & CONTRACT NOTES */}
      {/* ========================================================================= */}
      {contract.notes && (
        <div className="p-4 bg-iso-cardBg border border-iso-border rounded-md shadow-2xs flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-amber-600" />
            <span className="text-xs font-bold text-iso-primary uppercase font-mono tracking-wider">
              Special Provisions &amp; Contract Notes
            </span>
          </div>
          <div className="p-3 bg-iso-bg border border-iso-border rounded-sm text-xs text-iso-text font-sans whitespace-pre-wrap leading-relaxed">
            {contract.notes}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK RENEW / EDIT CONTRACT */}
      {/* ========================================================================= */}
      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-iso-border flex items-center justify-between bg-iso-bgSecondary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-iso-primary/10 border border-iso-primary/20 flex items-center justify-center text-iso-primary">
                  <Repeat size={16} />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-iso-primary">
                    Renew / Edit Contract: {activeTenant.name || activeTenant.tenantName}
                  </h2>
                  <p className="text-[11px] text-iso-textMuted font-mono">Extend validity dates, update contract term, and record renewal milestone.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingContract(false)}
                className="p-1.5 text-iso-textMuted hover:text-iso-primary hover:bg-iso-bgSecondary rounded-sm transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRenewal} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] flex flex-col gap-4 text-xs">
                
                {/* Status & Term */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Status <span className="text-iso-error">*</span>
                    </label>
                    <select
                      value={renewalForm.contractStatus}
                      onChange={(e) => setRenewalForm({ ...renewalForm, contractStatus: e.target.value })}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none cursor-pointer font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Renewal">Pending Renewal</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Draft">Draft</option>
                      <option value="Expired">Expired</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Term Duration
                    </label>
                    <select
                      value={renewalForm.contractTerm}
                      onChange={(e) => {
                        setRenewalForm({ ...renewalForm, contractTerm: e.target.value });
                        handleCalculateEndDate(renewalForm.startDate, e.target.value);
                      }}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      {CONTRACT_TERMS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timeline Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Start Date <span className="text-iso-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={renewalForm.startDate}
                      onChange={(e) => {
                        setRenewalForm({ ...renewalForm, startDate: e.target.value });
                        handleCalculateEndDate(e.target.value, renewalForm.contractTerm);
                      }}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      End Date (Expiry) <span className="text-iso-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={renewalForm.endDate}
                      onChange={(e) => setRenewalForm({ ...renewalForm, endDate: e.target.value })}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono cursor-pointer"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted font-semibold">
                        Renewed On Date
                      </label>
                      <button
                        type="button"
                        onClick={() => setRenewalForm({ ...renewalForm, renewedOn: new Date().toISOString().split("T")[0] })}
                        className="text-[9px] text-iso-accent hover:underline cursor-pointer"
                      >
                        Set Today
                      </button>
                    </div>
                    <input
                      type="date"
                      value={renewalForm.renewedOn}
                      onChange={(e) => setRenewalForm({ ...renewalForm, renewedOn: e.target.value })}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono cursor-pointer"
                    />
                  </div>
                </div>

                {/* Auto Renew Strip */}
                <div className="p-3 bg-iso-bg border border-iso-border rounded-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-iso-primary block">Automatic Term Renewal</span>
                    <span className="text-[11px] text-iso-textMuted">Evergreen renewal unless cancelled within notice window</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRenewalForm({ ...renewalForm, autoRenew: !renewalForm.autoRenew })}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        renewalForm.autoRenew ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        renewalForm.autoRenew ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                    <span className="text-[10px] font-mono font-bold">{renewalForm.autoRenew ? "ENABLED" : "OFF"}</span>
                  </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Contract Value
                    </label>
                    <input
                      type="text"
                      value={renewalForm.contractValue}
                      onChange={(e) => setRenewalForm({ ...renewalForm, contractValue: e.target.value })}
                      placeholder="e.g. 24,000"
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Currency
                    </label>
                    <select
                      value={renewalForm.currency}
                      onChange={(e) => setRenewalForm({ ...renewalForm, currency: e.target.value })}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                      Billing Cycle
                    </label>
                    <select
                      value={renewalForm.billingCycle}
                      onChange={(e) => setRenewalForm({ ...renewalForm, billingCycle: e.target.value })}
                      className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none cursor-pointer"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Semi-Annually">Semi-Annually</option>
                      <option value="Annually">Annually</option>
                      <option value="Multi-Year Pre-paid">Multi-Year Pre-paid</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider text-iso-textMuted block mb-1 font-semibold">
                    Renewal &amp; Contract Notes
                  </label>
                  <textarea
                    rows={2}
                    value={renewalForm.notes}
                    onChange={(e) => setRenewalForm({ ...renewalForm, notes: e.target.value })}
                    placeholder="Add any renewal notes, discount codes, or special provisions..."
                    className="w-full bg-iso-bg border border-iso-border focus:border-iso-accent rounded-sm px-3 py-2 text-xs text-iso-text outline-none"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-iso-border flex items-center justify-between bg-iso-bgSecondary/20">
                <span className="text-[10px] font-mono text-iso-textMuted">Ref: {renewalForm.contractNumber}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingContract(false)}
                    className="px-4 py-1.5 bg-iso-bgSecondary hover:bg-iso-border/40 text-iso-text border border-iso-border rounded-sm text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRenewal}
                    className="px-5 py-1.5 bg-iso-primary hover:bg-iso-primaryLight text-white rounded-sm text-xs font-bold border border-iso-primary flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isSavingRenewal ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>{isSavingRenewal ? "Saving..." : "Save Contract Updates"}</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL TENANT MODAL */}
      {/* ========================================================================= */}
      {showFullTenantModal && (
        <TenantModal
          isOpen={showFullTenantModal}
          onClose={() => setShowFullTenantModal(false)}
          tenantData={activeTenant}
          onSaved={() => {
            if (fetchTenants) fetchTenants();
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
