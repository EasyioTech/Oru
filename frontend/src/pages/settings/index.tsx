/**
 * Settings Page
 * Main orchestrator for settings functionality
 * Refactored from 1,733 lines to ~150 lines
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Bell, Shield, User, Building, ChevronRight, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { AgencySettingsTab } from "./components/AgencySettingsTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { SecuritySettingsTab } from "./components/SecuritySettingsTab";
import { DocumentManager } from "@/components/documents/DocumentManager";
import { DisplayTitle, MicroLabel, FloatingCard } from "@/components/ui/design-tokens";

const Settings = () => {
  const { userRole } = useAuth();
  const { loading: loadingAgencyData } = useAgencySettings();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Check if user is admin or super_admin
  const isAdmin = userRole === 'agency_admin' || userRole === 'super_admin';

  const navItems = [
    ...(isAdmin ? [{ id: "agency", label: "Agency", icon: Building, description: "Company branding and details" }] : []),
    { id: "profile", label: "Profile", icon: User, description: "Personal details and preferences" },
    { id: "documents", label: "Documents", icon: FileText, description: "Files, folders & document settings" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts and email preferences" },
    { id: "security", label: "Security", icon: Shield, description: "Passwords and authentication" },
  ];

  // Resolve active tab from URL query param (?tab=agency) or fallback
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam && navItems.some((n) => n.id === tabParam)
    ? tabParam
    : (isAdmin ? "agency" : "profile");

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL parameter changes
  useEffect(() => {
    if (tabParam && navItems.some((n) => n.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, isAdmin]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  if (loadingAgencyData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="mb-6">
        <DisplayTitle>Settings</DisplayTitle>
        <MicroLabel className="text-gray-500 dark:text-gray-400 mt-2">Manage your account, agency, and preferences</MicroLabel>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start w-full">
        {/* Vertical Sub-Sidebar Navigation */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-2 sticky top-4 self-start">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all duration-300 text-left group ${
                  isActive 
                    ? "bg-[#DBFBA1] dark:bg-[#DBFBA1] shadow-sm border border-[#DBFBA1]" 
                    : "hover:bg-[#96D8D0]/20 dark:hover:bg-[#96D8D0]/20 bg-white/40 dark:bg-slate-900/40 border border-transparent hover:border-gray-200/50 dark:hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive 
                      ? "bg-black text-[#DBFBA1] dark:bg-black dark:text-[#DBFBA1]" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:text-black dark:group-hover:text-white"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? "text-black dark:text-black font-bold" : "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white"}`}>{item.label}</p>
                    <p className={`text-xs mt-0.5 truncate ${isActive ? "text-black/70 dark:text-black/70" : "text-gray-400 dark:text-gray-500"}`}>{item.description}</p>
                  </div>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 shrink-0 text-black/60 dark:text-black/60" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 w-full">
            {activeTab === "profile" && <ProfileSettingsTab />}
            {activeTab === "agency" && isAdmin && <AgencySettingsTab />}
            {activeTab === "documents" && (
              <FloatingCard className="p-6 sm:p-8">
                <DocumentManager embedded />
              </FloatingCard>
            )}
            {activeTab === "notifications" && <NotificationSettingsTab />}
            {activeTab === "security" && <SecuritySettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
