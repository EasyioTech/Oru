import { motion } from 'framer-motion';
import {
    Folder,
    File,
    HardDrive,
    Cloud,
    Search,
    Grid,
    List,
    MoreHorizontal,
    ChevronRight,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileManagementView = () => {
    const files = [
        { name: 'Brand Guidelines.pdf', size: '2.4 MB', type: 'PDF', color: 'text-error' },
        { name: 'Project Assets', size: '1.2 GB', type: 'Folder', color: 'text-amber-500' },
        { name: 'Revenue Q4.xlsx', size: '840 KB', type: 'Excel', color: 'text-success' },
        { name: 'Product Demo.mp4', size: '42 MB', type: 'Video', color: 'text-primary' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border bg-card/50">
                <div>
                    <h3 className="text-base font-bold text-foreground">Cloud Storage</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Cloud className="w-3 h-3 text-primary" />
                        <span className="text-[10px] text-muted-foreground font-medium">85% of 100GB used</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="bg-muted border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none w-32 sm:w-48 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        <Plus className="w-3 h-3" />
                        Upload
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 overflow-y-auto">
                {files.map((file, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-card border border-border group hover:border-primary/30 transition-all cursor-pointer text-center flex flex-col items-center"
                    >
                        <div className={cn("w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm", file.color)}>
                            {file.type === 'Folder' ? <Folder className="w-6 h-6" /> : <File className="w-6 h-6" />}
                        </div>
                        <h4 className="text-[11px] font-bold text-foreground truncate w-full mb-1">{file.name}</h4>
                        <span className="text-[9px] text-muted-foreground font-medium">{file.size}</span>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                    </motion.div>
                ))}

                <div className="lg:col-span-4 mt-6">
                    <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-4 px-2">Recent Folders</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: 'Marketing Assets', items: 242, color: 'text-indigo-500' },
                            { name: 'Client Deliverables', items: 56, color: 'text-emerald-500' },
                        ].map((folder, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between hover:bg-muted transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Folder className={cn("w-5 h-5", folder.color)} />
                                    <div>
                                        <div className="text-xs font-bold text-foreground">{folder.name}</div>
                                        <div className="text-[9px] text-muted-foreground">{folder.items} items</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
