import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Ticket, Search, Filter, RefreshCw, Plus, Clock, AlertTriangle,
  CheckCircle2, AlertCircle, UserCheck, MessageSquare, Send,
  ChevronRight, ArrowUpDown, X, Loader2, Shield, User,
  Building, Calendar, Tag, ExternalLink, HelpCircle
} from "lucide-react";
import TablePagination from "../../components/TablePagination";
import ConfirmModal from "../../components/ConfirmModal";
import { apiUrl } from "../../config/api";

const CATEGORIES = [
  "Examination",
  "Fees & Finance",
  "Scholarship",
  "Hostel & Housing",
  "Attendance",
  "Academics & Faculty",
  "Certificates & Documents",
  "Technical & Portal",
  "Other"
];

const DEPARTMENTS = [
  "Examination Cell",
  "Accounts & Finance Department",
  "Scholarship & Financial Aid Office",
  "Hostel Administration",
  "Academic Affairs",
  "Student Records & Registrar Office",
  "Student Welfare & Grievance Cell",
  "Administration"
];

const PRIORITIES = ["urgent", "high", "medium", "low"];
const STATUSES = ["open", "in_progress", "resolved", "closed"];

export default function Grievances({
  selectedTenant,
  currentUser,
  showToast
}) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    overdue: 0,
    urgent: 0,
    byCategory: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // Selected Ticket for Details Modal
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeTab, setActiveTab] = useState("transcript"); // transcript | comments | history | meta
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // New Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "Scholarship",
    department: "Scholarship & Financial Aid Office",
    priority: "medium",
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    rollNumber: ""
  });

  // Assign Staff Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState(null);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Quick Status/Resolution
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("resolved");
  const [customResolutionNotes, setCustomResolutionNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Internal Comment Input
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const activeTenantId = selectedTenant?.tenantId || selectedTenant?.code || currentUser?.tenantId || "admin";
  const isGlobalAdmin = Boolean(
    currentUser?.role === "global_admin" ||
    currentUser?.role === "super_admin" ||
    currentUser?.isGlobalAdmin ||
    currentUser?.tenantId === "admin"
  );

  const canAssignTicket = Boolean(
    isGlobalAdmin ||
    currentUser?.role === "tenant_admin" ||
    currentUser?.role === "admin" ||
    currentUser?.isAdmin ||
    (typeof currentUser?.role === "string" && currentUser?.role.toLowerCase().includes("admin")) ||
    (typeof currentUser?.role === "string" && currentUser?.role.toLowerCase().includes("manager"))
  );

  // Fetch Tickets List
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const params = new URLSearchParams({
        tenantId: activeTenantId,
        page: currentPage.toString(),
        limit: pageSize.toString()
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedPriority !== "all") params.append("priority", selectedPriority);
      if (selectedDepartment !== "all") params.append("department", selectedDepartment);
      if (selectedAssignee !== "all") {
        if (selectedAssignee === "me") {
          params.append("assignedTo", currentUser?.username || "");
        } else if (selectedAssignee === "unassigned") {
          params.append("assignedTo", "unassigned");
        }
      }

      const res = await fetch(apiUrl(`/api/grievances?${params.toString()}`), {
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.data.tickets || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalCount(data.data.pagination?.total || 0);
      } else {
        if (showToast) showToast(data.message || "Failed to load tickets.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error connecting to grievance service.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeTenantId, currentPage, searchQuery, selectedStatus, selectedCategory, selectedPriority, selectedDepartment, selectedAssignee, currentUser, showToast]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/stats?tenantId=${encodeURIComponent(activeTenantId)}`), {
        headers: { "x-session-id": sessionId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      }
    } catch (err) {
      // ignore silently
    }
  }, [activeTenantId, currentUser]);

  // Fetch Staff Users for Assignment (Tenant Scoped, excluding Super Admin)
  const fetchStaffUsers = useCallback(async () => {
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/staff?tenantId=${encodeURIComponent(activeTenantId)}`), {
        headers: { "x-session-id": sessionId }
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setStaffUsers(data.data);
      } else if (res.ok && Array.isArray(data)) {
        setStaffUsers(data);
      }
    } catch (err) {
      // fallback
    }
  }, [activeTenantId, currentUser]);

  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchStaffUsers();
  }, [fetchTickets, fetchStats, fetchStaffUsers]);

  // Open Detailed Modal & Fetch full details
  const handleOpenTicketDetails = async (ticket) => {
    setActiveTicket(ticket);
    setActiveTab("transcript");
    setResolutionNotes(ticket.resolution?.notes || "");
    setIsLoadingDetails(true);

    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/${ticket.ticketId || ticket._id}?tenantId=${encodeURIComponent(activeTenantId)}`), {
        headers: { "x-session-id": sessionId }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveTicket(data.data);
        setResolutionNotes(data.data.resolution?.notes || "");
      }
    } catch (err) {
      // keep initial ticket
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Claim Ticket ("Assign to Me")
  const handleClaimTicket = async (ticketId, e) => {
    if (e) e.stopPropagation();
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/${ticketId}/claim`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          username: currentUser?.username,
          fullName: currentUser?.fullName || currentUser?.username,
          userId: currentUser?._id || currentUser?.userId,
          userRole: currentUser?.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast(`Ticket ${ticketId} claimed successfully!`, "success");
        fetchTickets();
        fetchStats();
        if (activeTicket && activeTicket.ticketId === ticketId) {
          setActiveTicket(data.data);
        }
      } else {
        if (showToast) showToast(data.message || "Failed to claim ticket.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error claiming ticket.", "error");
    }
  };

  // Assign Ticket to Staff
  const handleAssignTicketSubmit = async () => {
    if (!ticketToAssign || !selectedStaffToAssign) return;
    setIsAssigning(true);
    try {
      const staffUser = staffUsers.find(u => u.username === selectedStaffToAssign) || {
        username: selectedStaffToAssign,
        fullName: selectedStaffToAssign
      };

      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/${ticketToAssign.ticketId || ticketToAssign._id}/assign`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          assignee: {
            username: staffUser.username,
            fullName: staffUser.fullName || staffUser.username,
            userId: staffUser._id || staffUser.userId
          },
          username: currentUser?.username,
          fullName: currentUser?.fullName || currentUser?.username
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast(`Ticket assigned to ${staffUser.fullName || staffUser.username}`, "success");
        setShowAssignModal(false);
        setTicketToAssign(null);
        fetchTickets();
        fetchStats();
        if (activeTicket && activeTicket.ticketId === (ticketToAssign.ticketId || ticketToAssign._id)) {
          setActiveTicket(data.data);
        }
      } else {
        if (showToast) showToast(data.message || "Failed to assign ticket.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error assigning ticket.", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus, notes = "") => {
    if (!activeTicket) return;
    setIsUpdatingStatus(true);
    try {
      const finalNotes = notes || customResolutionNotes || resolutionNotes;
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/${activeTicket.ticketId || activeTicket._id}/status`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: finalNotes,
          username: currentUser?.username,
          fullName: currentUser?.fullName || currentUser?.username
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast(`Ticket status updated to ${newStatus}`, "success");
        setActiveTicket(data.data);
        setShowResolveModal(false);
        setCustomResolutionNotes("");
        fetchTickets();
        fetchStats();
      } else {
        if (showToast) showToast(data.message || "Failed to update status.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error updating status.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!activeTicket || !commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl(`/api/grievances/${activeTicket.ticketId || activeTicket._id}/comments`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          comment: commentText.trim(),
          isInternal: true,
          username: currentUser?.username,
          fullName: currentUser?.fullName || currentUser?.username,
          userRole: currentUser?.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast("Note added to ticket.", "success");
        setCommentText("");
        setActiveTicket(data.data);
      } else {
        if (showToast) showToast(data.message || "Failed to add comment.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error adding comment.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Create Manual Ticket Submit
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      if (showToast) showToast("Title and description are required.", "error");
      return;
    }
    setIsSubmittingTicket(true);
    try {
      const sessionId = currentUser?.sessionId || localStorage.getItem("iso_session_id") || "";
      const res = await fetch(apiUrl("/api/grievances"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          tenantId: activeTenantId,
          title: newTicketForm.title.trim(),
          description: newTicketForm.description.trim(),
          category: newTicketForm.category,
          department: newTicketForm.department,
          priority: newTicketForm.priority,
          student: {
            name: newTicketForm.studentName.trim() || "Walk-in Student",
            email: newTicketForm.studentEmail.trim(),
            phone: newTicketForm.studentPhone.trim(),
            rollNumber: newTicketForm.rollNumber.trim(),
            department: newTicketForm.department
          },
          source: "admin_manual",
          username: currentUser?.username,
          fullName: currentUser?.fullName || currentUser?.username
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast(`Ticket ${data.data.ticketId} created successfully!`, "success");
        setShowCreateModal(false);
        setNewTicketForm({
          title: "",
          description: "",
          category: "Scholarship",
          department: "Scholarship & Financial Aid Office",
          priority: "medium",
          studentName: "",
          studentEmail: "",
          studentPhone: "",
          rollNumber: ""
        });
        fetchTickets();
        fetchStats();
      } else {
        if (showToast) showToast(data.message || "Failed to create ticket.", "error");
      }
    } catch (err) {
      if (showToast) showToast("Error creating ticket.", "error");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Helpers for Status & Priority Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">OPEN</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">IN PROGRESS</span>;
      case "resolved":
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case "closed":
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 text-slate-700 border border-slate-300">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">URGENT</span>;
      case "high":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-orange-50 text-orange-700 border border-orange-200">HIGH</span>;
      case "medium":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">MEDIUM</span>;
      case "low":
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-50 text-slate-600 border border-slate-200">LOW</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100">{priority}</span>;
    }
  };

  const formatSlaRemaining = (deadline, isOverdue, status) => {
    if (status === "resolved" || status === "closed") {
      return <span className="text-emerald-600 font-mono text-[10px] flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
    }
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const hours = Math.round(diff / (1000 * 60 * 60));

    if (isOverdue || hours <= 0) {
      return (
        <span className="text-rose-600 font-mono text-[10px] font-bold flex items-center gap-1">
          <AlertCircle size={12} className="animate-pulse" /> Overdue ({Math.abs(hours)}h ago)
        </span>
      );
    }
    return (
      <span className="text-iso-textMuted font-mono text-[10px] flex items-center gap-1">
        <Clock size={12} /> {hours}h left
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-iso-bg overflow-hidden">
      
      {/* Top Header */}
      <div className="p-4 border-b border-iso-border bg-iso-cardBg shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Ticket size={20} className="text-iso-accent" />
            <h1 className="text-lg font-bold font-serif text-iso-primary">AI Grievance &amp; Ticket System</h1>
          </div>
          <p className="text-xs font-mono text-iso-textMuted mt-0.5">
            AI-powered issue ingestion, intelligent SLA routing, and staff resolution workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchTickets(); fetchStats(); }}
            disabled={isLoading}
            className="px-3 py-1.5 bg-iso-bg hover:bg-iso-bgSecondary border border-iso-border rounded text-xs font-bold text-iso-primary flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-iso-primary hover:bg-iso-primary/90 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-b border-iso-border bg-iso-bgSecondary/20 shrink-0">
        <div className="bg-iso-cardBg border border-iso-border p-3 rounded shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-iso-textMuted tracking-wider">Total Tickets</span>
          <span className="text-xl font-bold font-mono text-iso-primary mt-1">{stats.total || 0}</span>
        </div>

        <div className="bg-iso-cardBg border border-amber-200 p-3 rounded shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-700 tracking-wider">Open (Unclaimed)</span>
          <span className="text-xl font-bold font-mono text-amber-700 mt-1">{stats.open || 0}</span>
        </div>

        <div className="bg-iso-cardBg border border-blue-200 p-3 rounded shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-700 tracking-wider">In Progress</span>
          <span className="text-xl font-bold font-mono text-blue-700 mt-1">{stats.in_progress || 0}</span>
        </div>

        <div className="bg-iso-cardBg border border-emerald-200 p-3 rounded shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 tracking-wider">Resolved</span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1">{stats.resolved || 0}</span>
        </div>

        <div className="bg-iso-cardBg border border-rose-200 p-3 rounded shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase font-bold text-rose-700 tracking-wider flex items-center gap-1">
            <AlertTriangle size={12} className="animate-pulse" /> Overdue SLA
          </span>
          <span className="text-xl font-bold font-mono text-rose-700 mt-1">{stats.overdue || 0}</span>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="p-3 border-b border-iso-border bg-iso-cardBg flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-iso-textMuted" />
          <input
            type="text"
            placeholder="Search ticket ID, student, roll no, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary placeholder-iso-textMuted focus:outline-hidden focus:border-iso-accent"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="overdue">⚠️ Overdue SLA</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee Scope */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden font-semibold"
          >
            <option value="all">All Assignees</option>
            <option value="me">🙋 Assigned to Me</option>
            <option value="unassigned">⏳ Unassigned (Open to Claim)</option>
          </select>
        </div>
      </div>

      {/* Main Tickets Table Area */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-iso-textMuted font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-iso-accent" />
            <span>Loading tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-iso-textMuted border border-dashed border-iso-border rounded p-8 bg-iso-cardBg/50">
            <Ticket size={36} className="text-iso-textMuted/40" />
            <div className="text-center">
              <p className="text-sm font-bold font-serif text-iso-primary">No grievance tickets found</p>
              <p className="text-xs font-mono text-iso-textMuted mt-1">
                Student complaints and manual tickets will automatically show up here.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-iso-primary text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-iso-primary/90 cursor-pointer"
            >
              <Plus size={13} />
              <span>Create First Ticket</span>
            </button>
          </div>
        ) : (
          <div className="border border-iso-border rounded bg-iso-cardBg overflow-x-auto shadow-2xs w-full">
            <table className="w-full text-left border-collapse text-xs table-fixed min-w-[760px]">
              <thead>
                <tr className="bg-iso-bgSecondary border-b border-iso-border text-[11px] font-mono text-iso-textMuted uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-[20%]">Ticket &amp; Student</th>
                  <th className="py-2.5 px-3 w-[32%]">Issue &amp; Category</th>
                  <th className="py-2.5 px-3 w-[18%]">Status &amp; SLA</th>
                  <th className="py-2.5 px-3 w-[13%]">Assigned</th>
                  <th className="py-2.5 px-3 w-[17%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iso-border/60">
                {tickets.map((t) => {
                  const isAssignedToMe = t.assignedTo?.username === currentUser?.username;
                  const isUnassigned = !t.assignedTo?.username;

                  return (
                    <tr
                      key={t._id || t.ticketId}
                      onClick={() => handleOpenTicketDetails(t)}
                      className="hover:bg-iso-bgSecondary/40 transition-colors cursor-pointer"
                    >
                      {/* 1. Ticket ID & Student Info */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1 font-mono font-bold text-iso-accent text-xs">
                            <Ticket size={12} className="shrink-0" />
                            <span className="truncate">{t.ticketId}</span>
                          </div>
                          <span className="font-bold text-iso-primary truncate text-[11px] mt-0.5">
                            {t.student?.name || "Anonymous Student"}
                          </span>
                          <span className="text-[10px] font-mono text-iso-textMuted truncate">
                            {t.student?.rollNumber ? `Roll: ${t.student.rollNumber}` : (t.student?.email || "No contact info")}
                          </span>
                        </div>
                      </td>

                      {/* 2. Issue Title & Category / Department */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-iso-primary truncate text-xs" title={t.title}>
                            {t.title}
                          </span>
                          <span className="text-[10px] text-iso-accent font-mono truncate mt-0.5" title={`${t.category} • ${t.department}`}>
                            {t.category} • {t.department}
                          </span>
                        </div>
                      </td>

                      {/* 3. Status, Priority & SLA */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getStatusBadge(t.status)}
                            {getPriorityBadge(t.priority)}
                          </div>
                          <div className="truncate">
                            {formatSlaRemaining(t.slaDeadline, t.isOverdue, t.status)}
                          </div>
                        </div>
                      </td>

                      {/* 4. Assigned Staff */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        {t.assignedTo?.fullName || t.assignedTo?.username ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-iso-accent/20 text-iso-primary font-bold text-[9px] flex items-center justify-center shrink-0">
                              {(t.assignedTo.fullName || t.assignedTo.username)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-iso-primary truncate text-[11px]" title={t.assignedTo.fullName || t.assignedTo.username}>
                              {t.assignedTo.fullName || t.assignedTo.username}
                              {isAssignedToMe && <span className="ml-1 text-[9px] text-emerald-600 font-mono font-bold">(You)</span>}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-600 font-semibold flex items-center gap-1">
                            <Clock size={11} className="shrink-0" />
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>

                      {/* 5. Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap shrink-0">
                          {isUnassigned && (
                            <button
                              onClick={(e) => handleClaimTicket(t.ticketId, e)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                              title="Claim ticket"
                            >
                              <UserCheck size={11} />
                              <span>Claim</span>
                            </button>
                          )}

                          {canAssignTicket && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTicketToAssign(t);
                                setSelectedStaffToAssign(t.assignedTo?.username || "");
                                setShowAssignModal(true);
                              }}
                              className="px-2 py-1 bg-iso-bg hover:bg-iso-bgSecondary text-iso-primary border border-iso-border rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                              title="Assign to staff"
                            >
                              <User size={11} />
                              <span>Assign</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenTicketDetails(t)}
                            className="p-1 text-iso-textMuted hover:text-iso-primary hover:bg-iso-bgSecondary border border-transparent hover:border-iso-border rounded transition-colors cursor-pointer shrink-0"
                            title="View details & transcript"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-iso-border bg-iso-cardBg shrink-0">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalCount}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TICKET DETAILS, FULL CHAT TRANSCRIPT & STAFF RESOLUTION */}
      {/* ========================================================================= */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-iso-bgSecondary border-b border-iso-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-iso-accent/15 border border-iso-accent/30 flex items-center justify-center text-iso-accent">
                  <Ticket size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-iso-primary">{activeTicket.ticketId}</span>
                    {getStatusBadge(activeTicket.status)}
                    {getPriorityBadge(activeTicket.priority)}
                  </div>
                  <h2 className="text-sm font-bold font-serif text-iso-primary mt-0.5 truncate max-w-lg">
                    {activeTicket.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setActiveTicket(null)}
                className="p-1.5 text-iso-textMuted hover:text-iso-primary rounded hover:bg-iso-bg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Summary & Meta Strip */}
            <div className="px-5 py-2.5 bg-iso-bg border-b border-iso-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-4">
                <span><strong>Student:</strong> {activeTicket.student?.name} ({activeTicket.student?.rollNumber || "N/A"})</span>
                <span><strong>Dept:</strong> {activeTicket.department}</span>
                <span><strong>Category:</strong> {activeTicket.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span><strong>Assigned:</strong> {activeTicket.assignedTo?.fullName || activeTicket.assignedTo?.username || "Unassigned"}</span>
                {formatSlaRemaining(activeTicket.slaDeadline, activeTicket.isOverdue, activeTicket.status)}
              </div>
            </div>

            {/* Resolution Banner if Ticket is Resolved / Closed with Notes */}
            {activeTicket.resolution?.notes && (
              <div className="mx-5 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs flex flex-col gap-1 text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Resolution &amp; Officer Feedback (by {activeTicket.resolution.resolvedBy || activeTicket.assignedTo?.fullName || "Staff"})
                  </span>
                  {activeTicket.resolution.resolvedAt && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                      {new Date(activeTicket.resolution.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap mt-0.5">
                  {activeTicket.resolution.notes}
                </p>
              </div>
            )}

            {/* Ownership Warning / Action Banner if not assigned to current user */}
            {(() => {
              const isAssignedToMe = Boolean(
                activeTicket.assignedTo?.username && (
                  activeTicket.assignedTo.username === currentUser?.username ||
                  activeTicket.assignedTo.userId === currentUser?._id ||
                  activeTicket.assignedTo.userId === currentUser?.userId
                )
              );
              const canWork = isAssignedToMe || isGlobalAdmin;

              if (canWork) return null;

              return (
                <div className="mx-5 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {activeTicket.assignedTo?.username
                        ? `This ticket is currently assigned to ${activeTicket.assignedTo.fullName || activeTicket.assignedTo.username}. Only the assigned owner can work on this ticket.`
                        : "This ticket is currently unassigned. You must claim this ticket before working on it."}
                    </span>
                  </div>
                  {!activeTicket.assignedTo?.username && (
                    <button
                      onClick={() => handleClaimTicket(activeTicket.ticketId)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shrink-0 flex items-center gap-1 cursor-pointer text-xs shadow-2xs"
                    >
                      <UserCheck size={12} />
                      <span>Claim Ticket</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Tabs Navigation */}
            <div className="flex border-b border-iso-border bg-iso-cardBg px-5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("transcript")}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "transcript"
                    ? "border-iso-primary text-iso-primary"
                    : "border-transparent text-iso-textMuted hover:text-iso-primary"
                }`}
              >
                <MessageSquare size={13} />
                <span>Chat Transcript ({(activeTicket.chatTranscript || activeTicket.conversationSnapshot)?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "comments"
                    ? "border-iso-primary text-iso-primary"
                    : "border-transparent text-iso-textMuted hover:text-iso-primary"
                }`}
              >
                <UserCheck size={13} />
                <span>Staff Notes &amp; Discussion ({activeTicket.comments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === "history"
                    ? "border-iso-primary text-iso-primary"
                    : "border-transparent text-iso-textMuted hover:text-iso-primary"
                }`}
              >
                <Clock size={13} />
                <span>Audit Trail ({activeTicket.history?.length || 0})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-iso-bg/50 flex flex-col gap-4 min-h-[300px]">
              
              {/* TAB 1: CHAT TRANSCRIPT */}
              {activeTab === "transcript" && (
                <div className="flex flex-col gap-3">
                  <div className="bg-iso-cardBg border border-iso-border p-3.5 rounded text-xs">
                    <span className="font-bold text-iso-primary font-mono text-[11px] uppercase tracking-wider block mb-1">Issue Description</span>
                    <p className="text-iso-text leading-relaxed whitespace-pre-wrap">{activeTicket.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[11px] font-bold text-iso-textMuted uppercase tracking-wider">
                      Session Conversation Transcript
                    </span>
                    {activeTicket.sessionId && (
                      <span className="text-[10px] font-mono text-iso-textMuted">
                        Session: {activeTicket.sessionId}
                      </span>
                    )}
                  </div>

                  {isLoadingDetails ? (
                    <div className="p-8 text-center bg-iso-cardBg border border-dashed border-iso-border rounded text-iso-textMuted text-xs font-mono flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-iso-accent" />
                      <span>Loading session chat history...</span>
                    </div>
                  ) : (() => {
                    const transcriptList = activeTicket.chatTranscript || activeTicket.conversationSnapshot || [];
                    if (transcriptList.length === 0) {
                      return (
                        <div className="p-8 text-center bg-iso-cardBg border border-dashed border-iso-border rounded text-iso-textMuted text-xs font-mono">
                          No linked chat messages recorded for this ticket session.
                        </div>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-2.5 bg-iso-cardBg border border-iso-border p-4 rounded max-h-[350px] overflow-y-auto">
                        {transcriptList.map((msg, idx) => {
                          const isUser = msg.sender === "user";
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col max-w-[85%] ${
                                isUser ? "ml-auto items-end" : "mr-auto items-start"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5 text-[10px] font-mono text-iso-textMuted">
                                <span>{isUser ? (activeTicket.student?.name || "Student") : "AI Assistant"}</span>
                                <span>•</span>
                                <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <div
                                className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                                  isUser
                                    ? "bg-iso-primary text-white rounded-br-none"
                                    : "bg-iso-bgSecondary border border-iso-border text-iso-primary rounded-bl-none"
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: STAFF NOTES & COMMENTS */}
              {activeTab === "comments" && (() => {
                const isAssignedToMe = Boolean(
                  activeTicket.assignedTo?.username && (
                    activeTicket.assignedTo.username === currentUser?.username ||
                    activeTicket.assignedTo.userId === currentUser?._id ||
                    activeTicket.assignedTo.userId === currentUser?.userId
                  )
                );
                const canWork = isAssignedToMe || isGlobalAdmin;

                return (
                  <div className="flex flex-col gap-4">
                    {canWork ? (
                      <form onSubmit={handleAddComment} className="bg-iso-cardBg border border-iso-border p-3 rounded flex flex-col gap-2">
                        <label className="text-xs font-bold text-iso-primary">Add Internal Staff Note</label>
                        <textarea
                          rows={3}
                          placeholder="Write internal notes or steps taken towards resolving this ticket..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full p-2.5 text-xs bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden focus:border-iso-accent"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmittingComment || !commentText.trim()}
                            className="px-3.5 py-1.5 bg-iso-primary text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-iso-primary/90 disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingComment ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            <span>Post Staff Note</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-iso-bg border border-dashed border-iso-border rounded text-xs text-iso-textMuted flex items-center gap-2 font-mono">
                        <AlertCircle size={14} className="text-iso-textMuted shrink-0" />
                        <span>Claim this ticket or be assigned as owner to post internal notes.</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                      {(!activeTicket.comments || activeTicket.comments.length === 0) ? (
                        <div className="p-6 text-center bg-iso-cardBg border border-dashed border-iso-border rounded text-iso-textMuted text-xs font-mono">
                          No internal staff notes yet.
                        </div>
                      ) : (
                        activeTicket.comments.map((c, idx) => (
                          <div key={idx} className="p-3 bg-iso-cardBg border border-iso-border rounded text-xs">
                            <div className="flex items-center justify-between text-iso-textMuted font-mono text-[10px] mb-1">
                              <span className="font-bold text-iso-primary">{c.author?.fullName || c.author?.username} ({c.author?.role || 'Staff'})</span>
                              <span>{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-iso-text whitespace-pre-wrap">{c.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 3: AUDIT HISTORY */}
              {activeTab === "history" && (
                <div className="flex flex-col gap-2.5">
                  {(!activeTicket.history || activeTicket.history.length === 0) ? (
                    <div className="p-6 text-center bg-iso-cardBg border border-dashed border-iso-border rounded text-iso-textMuted text-xs font-mono">
                      No audit history entries recorded.
                    </div>
                  ) : (
                    activeTicket.history.map((h, idx) => (
                      <div key={idx} className="p-3 bg-iso-cardBg border border-iso-border rounded text-xs flex items-start gap-3">
                        <div className="p-1 bg-iso-bgSecondary rounded text-iso-primary mt-0.5">
                          <Clock size={12} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-iso-textMuted">
                            <span className="font-bold text-iso-primary">{h.action}</span>
                            <span>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-iso-text mt-0.5">{h.details}</p>
                          <span className="text-[10px] text-iso-textMuted">by {h.performedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer: Action Bar for Status & Assignment */}
            {(() => {
              const isAssignedToMe = Boolean(
                activeTicket.assignedTo?.username && (
                  activeTicket.assignedTo.username === currentUser?.username ||
                  activeTicket.assignedTo.userId === currentUser?._id ||
                  activeTicket.assignedTo.userId === currentUser?.userId
                )
              );
              const canWork = isAssignedToMe || isGlobalAdmin;

              return (
                <div className="px-5 py-3 bg-iso-bgSecondary border-t border-iso-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!activeTicket.assignedTo?.username && (
                      <button
                        onClick={() => handleClaimTicket(activeTicket.ticketId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <UserCheck size={13} />
                        <span>Claim Ticket</span>
                      </button>
                    )}

                    {canAssignTicket && (
                      <button
                        onClick={() => {
                          setTicketToAssign(activeTicket);
                          setSelectedStaffToAssign(activeTicket.assignedTo?.username || "");
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1.5 bg-iso-bg hover:bg-iso-cardBg border border-iso-border rounded text-xs font-bold text-iso-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <User size={13} />
                        <span>Assign Staff</span>
                      </button>
                    )}
                  </div>

                  {/* Status Update Quick Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-iso-textMuted mr-1">Move Status:</span>
                    {activeTicket.status !== "in_progress" && (
                      <button
                        onClick={() => handleUpdateStatus("in_progress")}
                        disabled={isUpdatingStatus || !canWork}
                        title={!canWork ? "Claim or be assigned this ticket first to change status" : ""}
                        className={`px-2.5 py-1.5 border rounded text-xs font-bold transition-colors ${
                          canWork
                            ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cursor-pointer"
                            : "bg-iso-bg text-iso-textMuted border-iso-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        In Progress
                      </button>
                    )}
                    {activeTicket.status !== "resolved" && (
                      <button
                        onClick={() => {
                          setPendingStatus("resolved");
                          setCustomResolutionNotes(activeTicket.resolution?.notes || "");
                          setShowResolveModal(true);
                        }}
                        disabled={isUpdatingStatus || !canWork}
                        title={!canWork ? "Claim or be assigned this ticket first to change status" : ""}
                        className={`px-2.5 py-1.5 border rounded text-xs font-bold transition-colors ${
                          canWork
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer"
                            : "bg-iso-bg text-iso-textMuted border-iso-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        Resolve Ticket
                      </button>
                    )}
                    {activeTicket.status !== "closed" && (
                      <button
                        onClick={() => {
                          setPendingStatus("closed");
                          setCustomResolutionNotes(activeTicket.resolution?.notes || "");
                          setShowResolveModal(true);
                        }}
                        disabled={isUpdatingStatus || !canWork}
                        title={!canWork ? "Claim or be assigned this ticket first to change status" : ""}
                        className={`px-2.5 py-1.5 border rounded text-xs font-bold transition-colors ${
                          canWork
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer"
                            : "bg-iso-bg text-iso-textMuted border-iso-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE MANUAL TICKET */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-iso-bgSecondary border-b border-iso-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket size={18} className="text-iso-accent" />
                <h3 className="text-sm font-bold font-serif text-iso-primary">Create New Grievance Ticket</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-iso-textMuted hover:text-iso-primary rounded hover:bg-iso-bg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-bold text-iso-primary block mb-1">Issue Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scholarship payment not received for Semester 4"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                  className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden focus:border-iso-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-iso-primary block mb-1">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-iso-primary block mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden font-semibold"
                  >
                    <option value="low">Low (72h SLA)</option>
                    <option value="medium">Medium (48h SLA)</option>
                    <option value="high">High (24h SLA)</option>
                    <option value="urgent">Urgent (12h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-iso-primary block mb-1">Target Department</label>
                <select
                  value={newTicketForm.department}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, department: e.target.value })}
                  className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-iso-primary block mb-1">Student Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newTicketForm.studentName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, studentName: e.target.value })}
                    className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-iso-primary block mb-1">Roll / Registration Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-CSE-042"
                    value={newTicketForm.rollNumber}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, rollNumber: e.target.value })}
                    className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-iso-primary block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all context and student background..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full p-2 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden focus:border-iso-accent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-iso-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 bg-iso-bg hover:bg-iso-bgSecondary text-iso-primary border border-iso-border rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="px-4 py-1.5 bg-iso-primary text-white rounded font-bold hover:bg-iso-primary/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingTicket ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Generate Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN TICKET TO STAFF */}
      {/* ========================================================================= */}
      {showAssignModal && ticketToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-iso-bgSecondary border-b border-iso-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-iso-accent" />
                <h3 className="text-sm font-bold font-serif text-iso-primary">Assign Ticket to Staff</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 text-iso-textMuted hover:text-iso-primary rounded hover:bg-iso-bg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-xs">
              <div className="p-2.5 bg-iso-bg border border-iso-border rounded font-mono text-[11px]">
                <div><strong>Ticket:</strong> {ticketToAssign.ticketId}</div>
                <div><strong>Subject:</strong> {ticketToAssign.title}</div>
                <div><strong>Department:</strong> {ticketToAssign.department}</div>
              </div>

              <div>
                <label className="font-bold text-iso-primary block mb-1">Select Tenant Staff Member</label>
                {staffUsers.length === 0 ? (
                  <div className="p-3 bg-iso-bg border border-dashed border-iso-border rounded text-[11px] text-iso-textMuted font-mono">
                    No staff accounts found for this tenant yet. You can create staff accounts under <strong>Tenants → Roles &amp; Users</strong>.
                  </div>
                ) : (
                  <select
                    value={selectedStaffToAssign}
                    onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                    className="w-full p-2.5 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden font-medium"
                  >
                    <option value="">-- Choose Staff User ({staffUsers.length} available) --</option>
                    {staffUsers.map((u) => (
                      <option key={u._id || u.username} value={u.username}>
                        {u.fullName || u.username} ({u.role || 'Staff'}) {u.email ? `• ${u.email}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-iso-border">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 bg-iso-bg hover:bg-iso-bgSecondary text-iso-primary border border-iso-border rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignTicketSubmit}
                  disabled={isAssigning || !selectedStaffToAssign}
                  className="px-4 py-1.5 bg-iso-primary text-white rounded font-bold hover:bg-iso-primary/90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isAssigning ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESOLVE / CLOSE TICKET WITH NOTES */}
      {/* ========================================================================= */}
      {showResolveModal && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-iso-cardBg border border-iso-border rounded-md shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-iso-bgSecondary border-b border-iso-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className={pendingStatus === "resolved" ? "text-emerald-600" : "text-slate-600"} />
                <h3 className="text-sm font-bold font-serif text-iso-primary">
                  {pendingStatus === "resolved" ? "Mark Ticket as Resolved" : "Close Ticket"}
                </h3>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 text-iso-textMuted hover:text-iso-primary rounded hover:bg-iso-bg"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStatus(pendingStatus, customResolutionNotes);
              }}
              className="p-5 flex flex-col gap-3.5 text-xs"
            >
              <div className="p-2.5 bg-iso-bg border border-iso-border rounded font-mono text-[11px]">
                <div><strong>Ticket:</strong> {activeTicket.ticketId}</div>
                <div><strong>Subject:</strong> {activeTicket.title}</div>
                <div><strong>Assigned To:</strong> {activeTicket.assignedTo?.fullName || activeTicket.assignedTo?.username || "You"}</div>
              </div>

              <div>
                <label className="font-bold text-iso-primary block mb-1">
                  Resolution Notes &amp; Feedback for Student *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the resolution steps taken or feedback provided (e.g. Plumbing team visited room 304 and repaired leaking tap valve)..."
                  value={customResolutionNotes}
                  onChange={(e) => setCustomResolutionNotes(e.target.value)}
                  className="w-full p-2.5 bg-iso-bg border border-iso-border rounded text-iso-primary focus:outline-hidden focus:border-iso-accent"
                />
                <span className="text-[10px] text-iso-textMuted mt-1 block">
                  This feedback will be visible to the student when they check the status of their ticket.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-iso-border">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 bg-iso-bg hover:bg-iso-bgSecondary text-iso-primary border border-iso-border rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus || !customResolutionNotes.trim()}
                  className={`px-4 py-1.5 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm ${
                    pendingStatus === "resolved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {isUpdatingStatus ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>{pendingStatus === "resolved" ? "Confirm Resolution" : "Confirm Close"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
