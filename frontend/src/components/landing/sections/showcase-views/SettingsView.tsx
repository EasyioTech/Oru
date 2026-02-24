import { motion } from 'framer-motion';

export const SettingsView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <h3 className="text-base sm:text-lg font-semibold text-white font-display mb-4 sm:mb-6">Settings</h3>

        <div className="space-y-2 sm:space-y-4">
            {[
                { label: 'Notifications', description: 'Email and push notification preferences', enabled: true },
                { label: 'Two-Factor Auth', description: 'Add extra security to your account', enabled: true },
                { label: 'Auto-save', description: 'Automatically save changes', enabled: true },
                { label: 'Dark Mode', description: 'Use dark theme across the app', enabled: true },
                { label: 'Analytics', description: 'Share usage data to improve the product', enabled: false },
            ].map((setting, i) => (
                <motion.div
                    key={setting.label}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04]"
                >
                    <div className="flex-1 min-w-0 mr-3">
                        <div className="text-xs sm:text-sm font-medium text-white">{setting.label}</div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 truncate leading-relaxed">{setting.description}</div>
                    </div>
                    <div className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full p-0.5 sm:p-1 transition-colors flex-shrink-0 cursor-pointer ${setting.enabled ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                        <motion.div
                            className="w-4 h-4 rounded-full bg-white shadow-sm"
                            animate={{ x: setting.enabled ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 16) : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);
