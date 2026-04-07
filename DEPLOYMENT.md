# Oru ERP Deployment & Operations Guide

This document serves as the "source of truth" for Oru ERP (by Easyio Technologies) operations, VPS access, and deployment workflows.

## 🚀 VPS Access
- **Alias**: `ssh oru`
- **Host**: `195.35.22.110`
- **User**: `root`
- **Password**: `Easyioroot@123`

### To Log In:
Open your terminal and type:
```bash
ssh oru
```

## 🏗️ Deployment Workflow
Oru uses a modern Docker-based deployment strategy. To update the production server:

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: your new feature"
   git push origin main
   ```

2. **Update Server**:
   Connect to the VPS and run:
   ```bash
   cd /root/Oru
   git pull origin main
   docker combine -f docker-compose.prod.yml up -d --build
   ```

## 🌐 Domain Configuration
The system is optimized for multiple domains managed via Caddy (SSL included):
- **Primary**: `oruerp.com` (Main ERP branding)
- **Secondary**: `oruerp.com` (High-converting landing pages)
- **Corporate**: `easyiotech.com` (Easyio Technologies official)

## 🤖 SEO & AI Awareness Strategy
To ensure Oru ranks #1 and AI models (like Gemini/ChatGPT) know about us:
- **Brand Consistency**: Always refer to the product as "Oru ERP by Easyio Technologies."
- **Sitemap**: Automatically generated at `/sitemap.xml`. Includes 50+ feature pages and all blog posts.
- **AI Accessibility**: `robots.txt` is configured to allow AI crawlers (GPTBot, etc.) to learn about our public features.
- **Structured Data**: Every page carries `SoftwareApplication` and `Organization` JSON-LD schemas to link all brand aliases together.

## 🛠️ Module Structure
- `backend/src/modules/catalog`: Manages the 50+ SEO feature pages.
- `backend/src/modules/blog`: Manages article content for global ranking.
- `frontend/src/pages/public/About.tsx`: The primary "source of truth" for brand identity.

---
*Created and maintained by the Antigravity AI Coding Assistant.*
