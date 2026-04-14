import { motion } from 'framer-motion';
import { Users, ExternalLink, MessageSquare, Github } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';

export default function CommunityPage() {
  return (
    <>
      <SEO
        title="Community | Join Oru Users"
        description="Join the Oru community. Connect with other agency professionals, share tips, and get support at Easyio Technologies."
        keywords="community, discord, forum, users, support, networking"
      />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-24 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-zinc-400/10 dark:bg-zinc-900/10 blur-[120px] rounded-full -z-10 transition-colors" />
              <div className="w-20 h-20 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-sm dark:shadow-none transition-all">
                <Users className="w-10 h-10 text-zinc-900 dark:text-white transition-colors" />
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[0.9] transition-colors uppercase">
                GLOBAL <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">CLUSTER.</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-xl mx-auto transition-colors">
                Join thousands of agency professionals sharing tips, tricks, and best practices in the Oru ecosystem.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                { 
                  name: 'Discord', 
                  icon: MessageSquare, 
                  href: 'https://discord.gg/Oru', 
                  desc: 'Chat with the community in real-time',
                  theme: 'zinc'
                },
                { 
                  name: 'GitHub', 
                  icon: Github, 
                  href: 'https://github.com/Oru', 
                  desc: 'Contribute to our open-source projects',
                  theme: 'zinc'
                }
              ].map((item, i) => (
                <a 
                  key={item.name}
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group relative p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all duration-500 overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors">
                      <item.icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 flex items-center justify-center gap-2 transition-colors uppercase tracking-tight">
                      {item.name} 
                      <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="text-zinc-500 font-medium leading-relaxed transition-colors">{item.desc}</p>
                  </div>
                  
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.02] scale-150 group-hover:scale-100 group-hover:rotate-12 transition-all duration-1000">
                    <item.icon className="w-32 h-32 text-zinc-950 dark:text-white" />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-900">
               <p className="text-zinc-300 dark:text-zinc-800 font-black uppercase tracking-[0.4em] text-[10px]">Ecosystem Loyalty Protocol &copy; 2024</p>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}

