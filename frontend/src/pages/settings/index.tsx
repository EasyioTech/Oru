/**
 * Settings Page
 * Main orchestrator for settings functionality
 * Refactored from 1,733 lines to ~150 lines
 */

import { useState } from "react";
import { Loader2, Bell, Shield, User, Building, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAgencySettings } from "@/hooks/useAgencySettings";
import { ProfileSettingsTab } from "./components/ProfileSettingsTab";
import { AgencySettingsTab } from "./components/AgencySettingsTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { SecuritySettingsTab } from "./components/SecuritySettingsTab";
import { DisplayTitle, MicroLabel, FloatingCard } from "@/components/ui/design-tokens";

const Settings = () => {
  const { userRole } = useAuth();
  const { loading: loadingAgencyData } = useAgencySettings();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Check if user is admin or super_admin
  const isAdmin = userRole === 'agency_admin' || userRole === 'super_admin';

  if (loadingAgencyData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const navItems = [
    { id: "profile", label: "Profile", icon: User, description: "Personal details and preferences" },
    ...(isAdmin ? [{ id: "agency", label: "Agency", icon: Building, description: "Company branding and details" }] : []),
    { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts and email preferences" },
    { id: "security", label: "Security", icon: Shield, description: "Passwords and authentication" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto min-h-screen pb-24 animate-in fade-in duration-500">
      <div className="mb-8">
        <DisplayTitle>Settings</DisplayTitle>
        <MicroLabel className="text-gray-500 dark:text-gray-400 mt-2">Manage your account, agency, and preferences</MicroLabel>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Sidebar Navigation */}
        <div className="w-full md:w-72 shrink-0 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 text-left group ${
                  isActive 
                    ? "bg-[#DBFBA1] dark:bg-[#DBFBA1] shadow-sm border border-[#DBFBA1]" 
                    : "hover:bg-[#96D8D0]/20 dark:hover:bg-[#96D8D0]/20 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-black text-[#DBFBA1] dark:bg-black dark:text-[#DBFBA1]" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:text-black dark:group-hover:text-white"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isActive ? "text-black dark:text-black" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"}`}>{item.label}</p>
                    <p className={`text-xs mt-0.5 ${isActive ? "text-black/70 dark:text-black/70" : "text-gray-400 dark:text-gray-500"}`}>{item.description}</p>
                  </div>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-black/50 dark:text-black/50" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
            {activeTab === "profile" && <ProfileSettingsTab />}
            {activeTab === "agency" && isAdmin && <AgencySettingsTab />}
            {activeTab === "notifications" && <NotificationSettingsTab />}
            {activeTab === "security" && <SecuritySettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
