import { motion } from 'framer-motion';
import {
    Send,
    Smartphone,
    Video,
    Phone,
    MoreVertical,
    CheckCheck,
    Search,
    Hash,
    AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatView = () => {
    const messages = [
        { sender: 'Zoya Khan', text: 'Hey team, did we finalize the design tokens for the new theme?', time: '10:12 AM', avatar: 'ZK' },
        { sender: 'You', text: 'Yes, just pushed the PR. Check the #design-system channel.', time: '10:14 AM', isSelf: true },
        { sender: 'Rohan', text: 'Looks great! I will review it in 5 mins.', time: '10:15 AM', avatar: 'RD' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Hash className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Engineering Team</h3>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-success" />
                            <span className="text-[10px] text-muted-foreground font-medium">12 Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                    <Phone className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                    <MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("flex flex-col", msg.isSelf ? "items-end" : "items-start")}
                    >
                        {!msg.isSelf && (
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                <span className="text-[10px] font-bold text-foreground">{msg.sender}</span>
                                <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                            </div>
                        )}
                        <div className={cn(
                            "max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed",
                            msg.isSelf
                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10"
                                : "bg-muted border border-border rounded-tl-none shadow-sm"
                        )}>
                            {msg.text}
                            {msg.isSelf && (
                                <div className="flex justify-end mt-1">
                                    <CheckCheck className="w-3 h-3 opacity-70" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 border-t border-border bg-card/50">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Message #engineering-team"
                        className="w-full bg-muted border border-border rounded-xl py-2.5 pl-4 pr-12 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all">
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-4">
                        <AtSign className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium">Shift + Enter for new line</span>
                </div>
            </div>
        </div>
    );
};
