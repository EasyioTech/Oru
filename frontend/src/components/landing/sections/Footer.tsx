import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations-info' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers', badge: 'Hiring' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Templates', href: '/templates' },
      { label: 'Community', href: '/community' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/Oru', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/Oru', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/Oru', label: 'Instagram' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.03),transparent_50%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">D</span>
              </div>
              <span className="text-lg font-display font-semibold text-foreground">Oru</span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              The all-in-one platform for modern agencies. Manage projects, track finances, and scale your business.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@Oru.io" className="hover:text-foreground transition-colors">
                  hello@Oru.io
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Mumbai, India</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border/80 transition-all font-medium"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-current" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-sm font-medium text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-medium">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground/60">
              <span>&copy; {currentYear} Oru. All rights reserved.</span>
              <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
              <span className="hidden md:flex items-center gap-1">
                Made with care in India
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>

              <a
                href="https://status.Oru.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Status
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
