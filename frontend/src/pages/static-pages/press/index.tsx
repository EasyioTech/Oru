import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '../components/PageWrapper';
import { SEO } from '../../../components/shared/SEO';
import { Download, Megaphone, Share2, Mail } from 'lucide-react';

export default function PressPage() {
  return (
    <>
      <SEO
        title="Press | Oru ERP Media Resources"
        description="Press resources, media inquiries, and company news for Oru ERP from Easyio Technologies. High-velocity brand assets."
        keywords="press, media, news, company news, press contact, brand assets"
      />
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-24 relative">
              <div className="absolute top-0 left-0 w-80 h-80 bg-zinc-400/10 dark:bg-zinc-900/10 blur-[120px] rounded-full -z-10 transition-colors" />
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 leading-[0.9] transition-colors uppercase">
                MEDIA <span className="text-zinc-300 dark:text-zinc-800 italic transition-colors">ASSETS.</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-xl transition-colors">
                Official company reports, brand protocols, and media coordinates for Easyio Technologies and the Oru ecosystem.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 shadow-sm dark:shadow-none transition-all duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white transition-all">
                    <Mail className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-white dark:group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight transition-colors">Press Contact</h3>
                </div>
                <p className="text-zinc-500 dark:text-zinc-500 font-medium mb-8 leading-relaxed transition-colors">For media inquiries, coordinate with our communication department.</p>
                <a href="mailto:press@easyio.tech" className="text-xl font-bold text-zinc-950 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors uppercase tracking-tight italic">press@easyio.tech</a>
              </div>

              <div className="group p-10 rounded-[2.5rem] bg-zinc-950 dark:bg-white border border-zinc-900 dark:border-zinc-100 shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Download className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    <h3 className="text-lg font-black text-white dark:text-black uppercase tracking-tight">Brand Assets</h3>
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 font-medium mb-12 leading-relaxed transition-colors">High-fidelity logos, product manifests, and system screenshots.</p>
                  <Button className="w-full h-14 bg-white dark:bg-black text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:scale-[1.02]">
                    Download Kit
                  </Button>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.1] -z-0 group-hover:rotate-12 transition-all duration-1000 transform translate-x-12 -translate-y-12">
                   <Megaphone className="w-40 h-40 text-white dark:text-black" />
                </div>
              </div>
            </div>

            <div className="mt-32 p-12 rounded-[3.5rem] border border-zinc-100 dark:border-zinc-900 text-center transition-colors">
               <p className="text-zinc-300 dark:text-zinc-800 font-black uppercase tracking-[0.4em] text-[10px]">Easyio Technologies Media Registry &copy; 2024</p>
            </div>
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}

