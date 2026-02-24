import { motion } from 'framer-motion';

export const TeamView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white font-display">Team Members</h3>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-medium whitespace-nowrap">8 members active</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {[
                { name: 'Sarah Chen', role: 'Project Lead', tasks: 12, status: 'online', color: 'bg-blue-500' },
                { name: 'Mike Wilson', role: 'Developer', tasks: 8, status: 'online', color: 'bg-emerald-500' },
                { name: 'Anna Smith', role: 'Designer', tasks: 6, status: 'away', color: 'bg-purple-500' },
                { name: 'John Davis', role: 'Marketing', tasks: 4, status: 'online', color: 'bg-orange-500' },
                { name: 'Lisa Park', role: 'Content', tasks: 5, status: 'online', color: 'bg-pink-500' },
                { name: 'Tom Brown', role: 'Developer', tasks: 9, status: 'offline', color: 'bg-cyan-500' },
            ].map((member, i) => (
                <motion.div
                    key={member.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-shrink-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${member.color} flex items-center justify-center text-[10px] sm:text-sm font-medium text-white shadow-lg shadow-black/20`}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-zinc-900 ${member.status === 'online' ? 'bg-emerald-400' :
                                    member.status === 'away' ? 'bg-yellow-400' : 'bg-zinc-500'
                                }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-white truncate">{member.name}</div>
                            <div className="text-[10px] sm:text-xs text-zinc-500">{member.role}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-xs sm:text-sm font-medium text-zinc-400">{member.tasks}</div>
                            <div className="text-[8px] sm:text-[10px] text-zinc-600">tasks</div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);
