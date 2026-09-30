import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Sidebar from './components/Sidebar';
import Performance from './routes/admin/Performance';
import Grievances from './routes/admin/Grievances';
import SystemSettings from './routes/admin/SystemSettings';
import TenantsList from './routes/admin/TenantsList';
import Ingestion from './routes/admin/Ingestion';
import ConversationHistory from './routes/admin/ConversationHistory';
import ChatPlayground from './routes/client/ChatPlayground';
import GenAISettingsModal from './routes/admin/components/GenAISettingsModal';
import { adminRoutes } from './routes/admin/routes';

// Mock Fetch Interceptor for Pristine Offline Screenshots
window.fetch = async function (url, options = {}) {
  const urlStr = typeof url === 'string' ? url : url.toString();

  // 1. Performance Telemetry API
  if (urlStr.includes('/api/admin/performance')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        summary: {
          avgLatency: 385,
          p50Latency: 320,
          p90Latency: 540,
          p95Latency: 680,
          p99Latency: 950,
          ttftMs: 180,
          throughputTps: 94.2,
          vectorSearchLatency: 62,
          cacheHitRatio: 41.5,
          errorRate: 0.12,
          uptimeSla: 99.98,
          activeConcurrency: 16,
          totalRequests: 14820,
          totalTokens: 3840900,
          promptTokens: 2120400,
          completionTokens: 1720500,
          estimatedCostUsd: 14.82
        },
        dailyTimeline: [
          { date: 'Sep 24', avgLatency: 410, p95Latency: 710, requests: 1840 },
          { date: 'Sep 25', avgLatency: 395, p95Latency: 690, requests: 2120 },
          { date: 'Sep 26', avgLatency: 380, p95Latency: 670, requests: 2450 },
          { date: 'Sep 27', avgLatency: 420, p95Latency: 730, requests: 2280 },
          { date: 'Sep 28', avgLatency: 370, p95Latency: 650, requests: 2600 },
          { date: 'Sep 29', avgLatency: 365, p95Latency: 640, requests: 2790 },
          { date: 'Sep 30', avgLatency: 350, p95Latency: 620, requests: 2940 }
        ],
        latencyBreakdown: [
          { component: 'Embedding Vectorization', timeMs: 42, percentage: 11, color: '#3b82f6', description: 'Query text vector embedding generation' },
          { component: 'Vector DB KNN Retrieval', timeMs: 62, percentage: 16, color: '#6366f1', description: 'MongoDB Atlas vector similarity search' },
          { component: 'LLM Inference & Generation', timeMs: 245, percentage: 64, color: '#00306D', description: 'Groq / Llama 3.3 streaming token completion' },
          { component: 'API Gateway & Serialization', timeMs: 36, percentage: 9, color: '#10b981', description: 'Network serialization and middleware hooks' }
        ],
        latencyHistogram: [
          { range: '< 200ms', label: 'Ultra Fast', count: 68, percentage: 28, color: '#10b981' },
          { range: '200 - 500ms', label: 'Fast (Optimal)', count: 135, percentage: 56, color: '#00306D' },
          { range: '500ms - 1.0s', label: 'Acceptable', count: 32, percentage: 13, color: '#f59e0b' },
          { range: '1.0s - 2.0s', label: 'Degraded', count: 6, percentage: 2.5, color: '#f97316' },
          { range: '> 2.0s', label: 'Critical / Slow', count: 1, percentage: 0.5, color: '#ef4444' }
        ],
        cacheBreakdown: [
          { label: 'Redis Query Cache Hits', count: 38, percentage: 38, color: '#10b981' },
          { label: 'Semantic Similarity Matches', count: 18, percentage: 18, color: '#3b82f6' },
          { label: 'Direct LLM Completions', count: 44, percentage: 44, color: '#64748b' }
        ],
        errorClassification: [
          { type: 'Rate Limit (429)', count: 2, percentage: 40, status: 'Handled via Backoff' },
          { type: 'Context Truncation', count: 1, percentage: 20, status: 'Auto-chunked' },
          { type: 'Network Timeout', count: 1, percentage: 20, status: 'Recovered on Retry' },
          { type: 'Guardrail Safety Trigger', count: 1, percentage: 20, status: 'Blocked gracefully' }
        ],
        apiEndpoints: [
          { endpoint: '/api/chat/stream', method: 'POST', calls: 8940, avgLatencyMs: 385, p95LatencyMs: 680, errorRate: '0.08%', status: 'Healthy' },
          { endpoint: '/api/chat', method: 'POST', calls: 2450, avgLatencyMs: 440, p95LatencyMs: 720, errorRate: '0.12%', status: 'Healthy' },
          { endpoint: '/api/ingestion/embed', method: 'POST', calls: 1280, avgLatencyMs: 82, p95LatencyMs: 120, errorRate: '0.00%', status: 'Healthy' },
          { endpoint: '/api/admin/analytics', method: 'GET', calls: 1420, avgLatencyMs: 54, p95LatencyMs: 92, errorRate: '0.00%', status: 'Healthy' },
          { endpoint: '/api/admin/conversations', method: 'GET', calls: 730, avgLatencyMs: 68, p95LatencyMs: 110, errorRate: '0.00%', status: 'Healthy' }
        ],
        slowestQueries: [
          { query: 'Explain full eligibility criteria for federal financial aid FAFSA with work-study exceptions', model: 'llama-3.3-70b', latencyMs: 890, vectorMs: 78, llmMs: 760, timestamp: '2026-09-30 08:42:10' },
          { query: 'List all prerequisite courses required for CS-480 Distributed Cloud Systems syllabus', model: 'llama-3.3-70b', latencyMs: 740, vectorMs: 64, llmMs: 630, timestamp: '2026-09-30 08:35:19' }
        ]
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // 2. Grievances & Tickets API
  if (urlStr.includes('/api/grievances/stats')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        total: 184,
        open: 14,
        in_progress: 8,
        resolved: 112,
        closed: 50,
        overdue: 2,
        urgent: 3,
        byCategory: {
          'Examination': 42,
          'Fees & Finance': 58,
          'Scholarship': 36,
          'Hostel & Housing': 24,
          'Academics & Faculty': 16,
          'Technical & Portal': 8
        }
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (urlStr.includes('/api/grievances/staff')) {
    return new Response(JSON.stringify({
      success: true,
      data: [
        { _id: 'u1', username: 'sarah.dean', fullName: 'Sarah Dean (Registrar Office)', role: 'staff' },
        { _id: 'u2', username: 'marcus.vance', fullName: 'Marcus Vance (Finance & Accounts)', role: 'staff' },
        { _id: 'u3', username: 'elena.rostova', fullName: 'Elena Rostova (Student Welfare)', role: 'staff' }
      ]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (urlStr.includes('/api/grievances')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        tickets: [
          {
            _id: 't-1092',
            ticketId: 'ESC-2026-1092',
            title: 'Tuition Fee Installment & Scholarship Waiver Discrepancy',
            category: 'Fees & Finance',
            department: 'Accounts & Finance Department',
            priority: 'urgent',
            status: 'open',
            studentName: 'Aarav Mehta',
            studentEmail: 'aarav.m@campus.edu',
            studentId: 'STU-2026-8812',
            assignedTo: 'Marcus Vance',
            createdAt: '2026-09-30T07:15:00.000Z',
            tags: ['Escalated by Bot', 'Tuition', 'Payment Portal']
          },
          {
            _id: 't-1091',
            ticketId: 'ESC-2026-1091',
            title: 'End-Semester Examination Hall Ticket Barcode Issue',
            category: 'Examination',
            department: 'Examination Cell',
            priority: 'high',
            status: 'in_progress',
            studentName: 'Priya Sharma',
            studentEmail: 'priya.s@campus.edu',
            studentId: 'STU-2026-7490',
            assignedTo: 'Sarah Dean',
            createdAt: '2026-09-29T18:40:00.000Z',
            tags: ['Admit Card', 'Barcode', 'Exam Cell']
          },
          {
            _id: 't-1090',
            ticketId: 'ESC-2026-1090',
            title: 'Hostel Room Reallocation Request for Fall Semester',
            category: 'Hostel & Housing',
            department: 'Hostel Administration',
            priority: 'medium',
            status: 'open',
            studentName: 'Daniel Kim',
            studentEmail: 'daniel.k@campus.edu',
            studentId: 'STU-2026-5120',
            assignedTo: 'Unassigned',
            createdAt: '2026-09-29T14:20:00.000Z',
            tags: ['Hostel', 'Room Swap']
          },
          {
            _id: 't-1089',
            ticketId: 'ESC-2026-1089',
            title: 'Merit Scholarship Renewal Verification Form',
            category: 'Scholarship',
            department: 'Scholarship & Financial Aid Office',
            priority: 'medium',
            status: 'resolved',
            studentName: 'Chloe Bennett',
            studentEmail: 'chloe.b@campus.edu',
            studentId: 'STU-2026-3391',
            assignedTo: 'Elena Rostova',
            createdAt: '2026-09-28T11:05:00.000Z',
            tags: ['Scholarship', 'Merit Renewal']
          },
          {
            _id: 't-1088',
            ticketId: 'ESC-2026-1088',
            title: 'LMS Portal Password Reset Authentication Loop',
            category: 'Technical & Portal',
            department: 'Student Records & Registrar Office',
            priority: 'low',
            status: 'closed',
            studentName: 'Rohan Gupta',
            studentEmail: 'rohan.g@campus.edu',
            studentId: 'STU-2026-1944',
            assignedTo: 'Sarah Dean',
            createdAt: '2026-09-27T09:30:00.000Z',
            tags: ['LMS Login', 'IT Helpdesk']
          }
        ],
        pagination: {
          total: 184,
          page: 1,
          limit: 15,
          totalPages: 13
        }
      }
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // 3. System Roles & Settings API
  if (urlStr.includes('/api/admin/roles')) {
    return new Response(JSON.stringify([
      { roleId: 'super_admin', roleName: 'Super Administrator', description: 'Full root access to all organizations, multi-tenant databases, system RBAC, and Gen AI engine settings.', allowedMenus: ['tenants', 'system_settings', 'grievances', 'analytics', 'performance', 'ingestion', 'conversations', 'chat'], allowedWidgets: ['avg_response_latency', 'ttft_metric', 'throughput_metric', 'vector_latency', 'uptime_sla', 'cache_hit_ratio', 'error_rate', 'tail_latency', 'cost_burn', 'latency_timeline_chart', 'latency_waterfall_chart'], isSystemRole: true },
      { roleId: 'tenant_admin', roleName: 'Tenant Administrator', description: 'Administrative access scoped to organizational bots, data vector pipelines, and support staff.', allowedMenus: ['grievances', 'analytics', 'performance', 'ingestion', 'conversations', 'chat'], allowedWidgets: ['avg_response_latency', 'ttft_metric', 'uptime_sla', 'cache_hit_ratio', 'daily_trend_chart', 'top_intents_chart'], isSystemRole: false },
      { roleId: 'support_lead', roleName: 'Support & Grievance Manager', description: 'Manages ticket escalations, assigns advisors, and inspects full conversation audit logs.', allowedMenus: ['grievances', 'conversations', 'analytics'], allowedWidgets: ['total_questions', 'total_sessions', 'csat_score', 'thumbs_up_score'], isSystemRole: false },
      { roleId: 'support_agent', roleName: 'Support Agent / Advisor', description: 'Claims user escalation tickets, answers student queries, and adds internal resolution notes.', allowedMenus: ['grievances'], allowedWidgets: [], isSystemRole: false },
      { roleId: 'analyst_viewer', roleName: 'Analytics & Read-Only Viewer', description: 'Read-only access to deflection dashboards, performance charts, and CSAT telemetry.', allowedMenus: ['analytics', 'performance'], allowedWidgets: ['total_questions', 'total_sessions', 'daily_trend_chart', 'avg_response_latency'], isSystemRole: false }
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (urlStr.includes('/api/admin/menus')) {
    return new Response(JSON.stringify([
      { path: 'tenants', label: 'Tenants & Bots', icon: 'Building2' },
      { path: 'system_settings', label: 'Roles & Pages', icon: 'Shield' },
      { path: 'grievances', label: 'Grievances & Tickets', icon: 'Ticket' },
      { path: 'analytics', label: 'Bot Analytics', icon: 'BarChart3' },
      { path: 'performance', label: 'Bot Performance', icon: 'Zap' },
      { path: 'ingestion', label: 'Ingestion Manager', icon: 'Database' },
      { path: 'conversations', label: 'Conversation History', icon: 'History' },
      { path: 'chat', label: 'Chat Playground', icon: 'MessageSquare' }
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // 4. GenAI Settings API
  if (urlStr.includes('/api/admin/genai-settings')) {
    return new Response(JSON.stringify({
      botId: 'isobot',
      tenantFullName: 'OneStop AI University',
      genAiEnabled: true,
      textGenerationModel: 'us.meta.llama3-3-70b-instruct-v1:0',
      embeddingsGenerationModel: 'amazon.titan-embed-text-v2:0',
      embeddingsModelDimentions: 1024,
      chunkSize: 3000,
      chunkOverlapSize: 1000,
      maxTokens: 350,
      temperature: 0.1,
      systemPrompt: 'You are the official OneStop AI Campus Assistant. Answer student inquiries with precision, professional warmth, and verified citations strictly from indexed campus documentation.',
      answerGenerationPrompt: '<context>\n$$context\n</context>\n\nStudent Inquiry: $$userQuery\n\nVerified Answer with Citations:',
      improvedQueryRewriter: true,
      improvedQueryRewriterPrompt: 'You are a query rewriting assistant for campus vector retrieval. Expand acronyms (e.g., FAFSA -> Free Application for Federal Student Aid).',
      searchConfig: { type: 'hybrid', weights: { knn: 0.75, multiMatch: 0.25 } },
      fallbackTexts: ['I do not find that in the official database.', 'Let me connect you to a student advisor.'],
      defaultFallbackAnswer: 'I could not find verified information for your query. Would you like me to connect you directly to an advisor?'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // 5. Bots & Tenants API
  if (urlStr.includes('/api/admin/bots')) {
    return new Response(JSON.stringify([
      { _id: 'b1', name: 'Student Services AI', code: 'isobot', botId: 'isobot', status: 'Active', model: 'llama-3.3-70b' },
      { _id: 'b2', name: 'Admissions & Financial Aid Bot', code: 'admissions-bot', botId: 'admissions-bot', status: 'Active', model: 'claude-3-5-sonnet' }
    ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

const mockUser = {
  username: 'admin@isomorphic.in',
  role: 'super_admin',
  tenantName: 'OneStop AI University',
  tenantId: 'onestop',
  isGlobalAdmin: true,
  allowedMenus: ['tenants', 'system_settings', 'grievances', 'analytics', 'performance', 'ingestion', 'conversations', 'chat'],
  allowedWidgets: []
};

const mockTenants = [
  { _id: '654321', tenantId: 'onestop', name: 'OneStop AI University', code: 'onestop', active: true, createdAt: '2026-08-15T10:00:00.000Z' },
  { _id: '654322', tenantId: 'healthcorp', name: 'HealthCorp Global Hospital', code: 'healthcorp', active: true, createdAt: '2026-08-20T10:00:00.000Z' },
  { _id: '654323', tenantId: 'finserve', name: 'FinServe Capital AI', code: 'finserve', active: true, createdAt: '2026-09-01T10:00:00.000Z' }
];

const mockBots = [
  { _id: 'b1', name: 'Student Services AI', code: 'isobot', botId: 'isobot', status: 'Active', model: 'us.meta.llama3-3-70b-instruct-v1:0', deflectionRate: '87.4%' },
  { _id: 'b2', name: 'Admissions & Financial Aid Bot', code: 'admissions-bot', botId: 'admissions-bot', status: 'Active', model: 'claude-3-5-sonnet', deflectionRate: '91.2%' }
];

function CaptureShell() {
  const urlParams = new URLSearchParams(window.location.search);
  const routeParam = urlParams.get('route') || 'performance';
  const showModalParam = urlParams.get('modal') || '';

  const [activeRoutePath, setActiveRoutePath] = useState(routeParam);
  const [selectedTenant, setSelectedTenant] = useState(mockTenants[0]);
  const [selectedBot, setSelectedBot] = useState(mockBots[0]);
  const [showGenAiModal, setShowGenAiModal] = useState(showModalParam === 'genai');

  const handleNavigate = (path) => {
    setActiveRoutePath(path);
  };

  const renderContent = () => {
    switch (activeRoutePath) {
      case 'performance':
        return (
          <Performance 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            setSelectedTenant={setSelectedTenant}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            tenants={mockTenants}
            bots={mockBots}
            showToast={() => {}}
          />
        );
      case 'grievances':
        return (
          <Grievances 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            showToast={() => {}}
          />
        );
      case 'system_settings':
        return (
          <SystemSettings 
            showToast={() => {}}
          />
        );
      case 'tenants':
        return (
          <>
            <TenantsList 
              currentUser={mockUser}
              selectedTenant={selectedTenant}
              setSelectedTenant={setSelectedTenant}
              tenants={mockTenants}
              fetchTenants={() => {}}
              showToast={() => {}}
            />
            {showGenAiModal && (
              <GenAISettingsModal 
                isOpen={true}
                onClose={() => setShowGenAiModal(false)}
                activeTenant={selectedTenant}
                selectedBot={selectedBot}
                showToast={() => {}}
              />
            )}
          </>
        );
      case 'ingestion':
        return (
          <Ingestion 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            setSelectedTenant={setSelectedTenant}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            tenants={mockTenants}
            bots={mockBots}
            showToast={() => {}}
          />
        );
      case 'conversations':
        return (
          <ConversationHistory 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            setSelectedTenant={setSelectedTenant}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            tenants={mockTenants}
            bots={mockBots}
            showToast={() => {}}
          />
        );
      case 'chat':
        return (
          <ChatPlayground 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            selectedBot={selectedBot}
            showToast={() => {}}
          />
        );
      default:
        return (
          <Performance 
            currentUser={mockUser}
            selectedTenant={selectedTenant}
            showToast={() => {}}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-iso-bg text-iso-text font-sans flex overflow-hidden">
      <Sidebar
        selectedPortal="admin"
        setSelectedPortal={() => {}}
        activeRoutePath={activeRoutePath}
        setActiveRoutePath={setActiveRoutePath}
        portalRoutes={adminRoutes}
        currentUser={mockUser}
        setCurrentUser={() => {}}
        selectedTenant={selectedTenant}
        showToast={() => {}}
        onLogout={() => {}}
        onNavigate={handleNavigate}
        mobileOpen={false}
        setMobileOpen={() => {}}
      />
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <div className="flex-1 p-6 sm:p-8 min-h-0 flex flex-col overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CaptureShell />
  </React.StrictMode>
);
