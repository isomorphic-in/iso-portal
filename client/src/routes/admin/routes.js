import TenantsList from './TenantsList';
import ContractSummary from './ContractSummary';
import SystemSettings from './SystemSettings';
import Analytics from './Analytics';
import Performance from './Performance';
import Ingestion from './Ingestion';
import ConversationHistory from './ConversationHistory';
import Grievances from './Grievances';
import ChatPlayground from '../client/ChatPlayground';
import { Building2, BarChart3, Database, MessageSquare, History, Shield, Ticket, Zap, FileText } from 'lucide-react';

export const adminRoutes = [
  {
    path: 'tenants',
    label: 'Tenants',
    icon: Building2,
    component: TenantsList,
    superAdminOnly: true
  },
  {
    path: 'contract_summary',
    label: 'Contract Summary',
    icon: FileText,
    component: ContractSummary
  },
  {
    path: 'system_settings',
    label: 'Roles & Pages',
    icon: Shield,
    component: SystemSettings,
    superAdminOnly: true
  },
  {
    path: 'grievances',
    label: 'Grievances & Tickets',
    icon: Ticket,
    component: Grievances
  },
  {
    path: 'analytics',
    label: 'Bot Analytics',
    icon: BarChart3,
    component: Analytics
  },
  {
    path: 'performance',
    label: 'Bot Performance',
    icon: Zap,
    component: Performance
  },
  {
    path: 'ingestion',
    label: 'Ingestion Manager',
    icon: Database,
    component: Ingestion
  },
  {
    path: 'conversations',
    label: 'Conversation History',
    icon: History,
    component: ConversationHistory
  },
  {
    path: 'chat',
    label: 'Chat Playground',
    icon: MessageSquare,
    component: ChatPlayground
  }
];


