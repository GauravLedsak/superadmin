import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { T, cx } from "../theme.js";
import { useStore } from "../store/StoreContext.jsx";
import { Toast } from "../components/ui.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { ImpersonationBanner } from "./ImpersonationBanner.jsx";
import { ID_TO_PATH, PATH_TO_ID, FIXED_HEIGHT_PAGES } from "../routes.js";
import { useTheme } from "../hooks/useTheme.js";

import { DashboardPage } from "../pages/DashboardPage.jsx";
import { ClientsPage, Tenant360 } from "../pages/ClientsPage.jsx";
import { OnboardingPage } from "../pages/OnboardingPage.jsx";
import { UsersPage } from "../pages/UsersPage.jsx";
import { SubsPlansPage } from "../pages/SubscriptionsPage.jsx";
import { CsPage } from "../pages/CustomerSuccessPage.jsx";
import { LeadsPage } from "../pages/LeadsPage.jsx";
import { AutomationPage } from "../pages/AutomationPage.jsx";
import { AiPage } from "../pages/AiPage.jsx";
import { IntegrationsPage } from "../pages/IntegrationsPage.jsx";
import { CommsPage } from "../pages/CommsPage.jsx";
import { ReportsPage } from "../pages/ReportsPage.jsx";
import { QueuesPage } from "../pages/QueuesPage.jsx";
import { LogsPage } from "../pages/LogsPage.jsx";
import { HealthPage } from "../pages/HealthPage.jsx";
import { SecurityPage } from "../pages/SecurityPage.jsx";
import { SupportPage } from "../pages/SupportPage.jsx";
import { IndustriesPage } from "../pages/IndustriesPage.jsx";
import { SettingsPage } from "../pages/SettingsPage.jsx";

export function Layout() {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [tenantForCs, setTenantForCs] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const active = PATH_TO_ID[location.pathname] || "dashboard";
  const go = (id, params) => { navigate(ID_TO_PATH[id] || "/", { state: params || null }); window.scrollTo(0, 0); };
  const filter = location.state || null;

  return (
    <div className="flex min-h-screen font-sans" style={{ background: T.bg, color: T.text }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}} aside nav::-webkit-scrollbar{width:4px} aside nav::-webkit-scrollbar-thumb{background:${T.sidebarHover};border-radius:4px}`}</style>
      {/* Sidebar */}
      <div className="shrink-0 py-3" style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Sidebar active={active} onNav={go} collapsed={sidebarCollapsed} />
      </div>
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <ImpersonationBanner />
        {/* Floating topbar */}
        <div className="px-3 pt-3 shrink-0">
          <Topbar onGo={go} active={active} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((c) => !c)} theme={theme} onToggleTheme={toggleTheme} />
        </div>
        <div className={cx("flex-1 min-h-0 px-3 py-3", FIXED_HEIGHT_PAGES.has(active) ? "overflow-hidden flex flex-col" : "overflow-y-auto")}>
          <Routes>
            <Route path="/" element={<DashboardPage go={go} />} />
            <Route path="/clients" element={<ClientsPage go={go} />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/subscriptions" element={<SubsPlansPage />} />
            <Route path="/customer-success" element={<CsPage openTenant={setTenantForCs} />} />
            <Route path="/leads" element={<LeadsPage go={go} />} />
            <Route path="/automation" element={<AutomationPage key={filter ? JSON.stringify(filter) : "default"} go={go} openTenant={setTenantForCs} filter={filter} />} />
            <Route path="/ai" element={<AiPage />} />
            <Route path="/integrations" element={<IntegrationsPage filter={filter} />} />
            <Route path="/communications" element={<CommsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/queues" element={<QueuesPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage go={go} />} />
          </Routes>
        </div>
      </main>
      <Toast msg={store.toast} />
      <Tenant360 tenant={tenantForCs} onClose={() => setTenantForCs(null)} go={go} />
    </div>
  );
}
