import { motion } from 'framer-motion';
import { Folder, File, Search, Upload, MoreVertical, HardDrive } from 'lucide-react';

export const FileManagementView = () => (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-white font-display">Cloud Files</h3>
                <p className="text-xs sm:text-sm text-zinc-500">Shared assets & documentation</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-white border border-white/[0.04] active:scale-95 transition-transform">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="sm:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { name: 'Branding Kit', items: 24, size: '450 MB', color: 'text-blue-400' },
                    { name: 'Legal Docs', items: 12, size: '25 MB', color: 'text-orange-400' },
                    { name: 'Contract Drafts', items: 8, size: '12 MB', color: 'text-emerald-400' },
                ].map((folder, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl bg-zinc-800/40 border border-white/[0.04] cursor-pointer group"
                    >
                        <Folder className={`w-8 h-8 mb-3 fill-current ${folder.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className="text-xs font-semibold text-white mb-1">{folder.name}</div>
                        <div className="text-[10px] text-zinc-500">{folder.items} files • {folder.size}</div>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/50 border border-white/[0.06] flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-white">Storage</span>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-blue-500 w-[65%]" />
                    </div>
                    <div className="text-[10px] text-zinc-500">65.4 GB of 100 GB used</div>
                </div>
                <button className="text-[10px] text-blue-400 font-semibold hover:underline mt-4">Upgrade Plan</button>
            </div>
        </div>

        <div className="space-y-1">
            <div className="grid grid-cols-12 px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                <div className="col-span-6">File Name</div>
                <div className="col-span-3">Owner</div>
                <div className="col-span-2 text-right">Size</div>
                <div className="col-span-1 text-right"></div>
            </div>
            {[
                { name: 'StyleGuide.pdf', owner: 'Anna Smith', size: '4.2 MB' },
                { name: 'Q1_Report.xlsx', owner: 'Burhan', size: '1.8 MB' },
                { name: 'Project_Alpha_Logo.svg', owner: 'Sarah Chen', size: '125 KB' },
            ].map((file, i) => (
                <div key={i} className="grid grid-cols-12 px-3 py-3 items-center text-xs text-zinc-300 hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer group">
                    <div className="col-span-6 flex items-center gap-3">
                        <File className="w-4 h-4 text-zinc-500" />
                        <span className="truncate group-hover:text-white transition-colors">{file.name}</span>
                    </div>
                    <div className="col-span-3 text-[10px] text-zinc-500">{file.owner}</div>
                    <div className="col-span-2 text-right text-[10px] text-zinc-500">{file.size}</div>
                    <div className="col-span-1 text-right">
                        <MoreVertical className="w-3.5 h-3.5 text-zinc-600 inline ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);
