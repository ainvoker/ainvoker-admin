import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GuestRoute, PlatformAdminRoute, VerifyEmailRoute } from './layouts/RouteGuards';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import BusinessPage from './pages/business/BusinessPage';
import BillingPage from './pages/billing/BillingPage';
import ModelsPage from './pages/models/ModelsPage';
import OrganizationsPage from './pages/customers/OrganizationsPage';
import OrganizationDetailPage from './pages/customers/OrganizationDetailPage';
import UsersPage from './pages/customers/UsersPage';
import UserDetailPage from './pages/customers/UserDetailPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import FinanceOverviewPage from './pages/finance/FinanceOverviewPage';
import FinanceExpensesPage from './pages/finance/FinanceExpensesPage';
import FinanceReconciliationPage from './pages/finance/FinanceReconciliationPage';
import UsagePage from './pages/usage/UsagePage';
import SafetyPage from './pages/safety/SafetyPage';
import { DashboardStub } from './pages/stubs/sectionStubs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<VerifyEmailRoute />}>
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>
          <Route element={<PlatformAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardStub />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="business" element={<BusinessPage />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:userId" element={<UserDetailPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="finance" element={<Navigate to="/finance/overview" replace />} />
              <Route path="finance/overview" element={<FinanceOverviewPage />} />
              <Route path="finance/expenses" element={<FinanceExpensesPage />} />
              <Route path="finance/reconciliation" element={<FinanceReconciliationPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="usage" element={<UsagePage />} />
              <Route path="safety" element={<SafetyPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
