import { motion } from 'framer-motion';
import { Hash, Send, Plus, Phone } from 'lucide-react';

export const ChatView = () => (
    <div className="flex h-full bg-zinc-900/40">
        {/* Channels Sidebar */}
        <div className="w-24 sm:w-40 border-r border-white/[0.04] p-3 hidden sm:block">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Channels</div>
            <div className="space-y-1">
                {['general', 'design-ops', 'dev-stack', 'client-feedback'].map(channel => (
                    <div key={channel} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${channel === 'design-ops' ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <Hash className="w-3 h-3" />
                        <span className="truncate">{channel}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-semibold text-white">design-ops</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-zinc-500 cursor-pointer" />
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800 text-[8px] flex items-center justify-center text-white">U{i}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[
                    { user: 'Sarah Chen', message: 'Have we finalized the color palette for the new dashboard?', time: '10:24 AM' },
                    { user: 'Burhan', message: 'Almost there. I added the HSL variants in the shared file.', time: '10:26 AM' },
                    { user: 'Anna Smith', message: 'Checked them, looks premium. The glassmorphism effects are a nice touch!', time: '10:28 AM' },
                ].map((chat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col"
                    >
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400">{chat.user}</span>
                            <span className="text-[8px] text-zinc-600">{chat.time}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed max-w-[85%]">{chat.message}</p>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 pt-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/[0.04]">
                    <Plus className="w-4 h-4 text-zinc-500" />
                    <input type="text" placeholder="Message #design-ops" className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none" />
                    <div className="p-1.5 rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                        <Send className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
