# AI UI/UX Implementation Protocol

## Purpose

This document defines the engineering workflow, design standards, decision-making process, and quality gates that every AI agent must follow before modifying any UI.

The objective is to produce interfaces that look professionally designed by experienced product designers—not AI-generated.

---

# Core Rule

> **Never immediately implement requested UI changes.**

Instead follow this workflow every single time:

```
Understand
      ↓
Research Existing UI
      ↓
Analyze UX Problems
      ↓
Select Applicable Principles
      ↓
Create Improvement Plan
      ↓
Validate Plan
      ↓
Implement Incrementally
      ↓
Review
      ↓
Refine
```

---

# Phase 1 — Understand the Feature

Before touching any code, determine:

* What is the screen trying to accomplish?
* Who is using it?
* What is the primary action?
* What is secondary?
* What information is most important?
* What is causing friction?
* What should the user feel?

---

# Phase 2 — Explore Existing Codebase

Before editing:

Inspect

* page structure
* component hierarchy
* design system
* typography
* spacing
* color tokens
* animations
* responsiveness
* reusable components
* state management

---

# Phase 3 — Create an Improvement Plan

Before writing code, create a plan including

* Current problems
* UX issues
* UI inconsistencies
* Applicable psychology principles
* Accessibility improvements
* Responsive improvements
* Animation opportunities
* Performance considerations

---

# Phase 4 — Apply Only Relevant UX Principles

Do **NOT** blindly apply every principle.

Select only those that improve this specific interface.

Possible principles: Hick's Law, Fitts' Law, Progressive Disclosure, Goal Gradient, Endowment Effect, IKEA Effect, Recognition over Recall, Chunking, Visual Hierarchy, White Space, Gestalt Principles, Smart Defaults, Inline Validation, Error Prevention, Skeleton Loading, Optimistic UI, Empty States, Loss Framing, Social Proof, Trust Signals, Cognitive Load Reduction, Default Bias, Peak-End Rule, Microinteractions, Progressive Onboarding.

---

# Phase 5 — Professional Visual Design

Never generate generic AI interfaces.

Avoid: Random gradients, Neon colors, Oversized rounded buttons, Random shadows, Generic hero sections, Stock AI layouts, Glassmorphism, Excessive blur, Inconsistent spacing, Cartoon icons, Fancy animations without purpose.

Design like: Stripe, Linear, Notion, Apple, Vercel, Figma, Framer, Shopify, GitHub.

Characteristics: restraint, consistency, precision, alignment, rhythm, simplicity.

---

# Color System

Never invent colors. Build a semantic system:
- Primary, Secondary, Success, Warning, Danger, Muted, Surface, Background, Border, Text Primary, Text Secondary, Interactive, Hover, Active, Disabled

Every color must have a purpose.

---

# Typography Rules

- Consistent font scale
- Consistent line height
- Readable paragraph width
- Logical heading order
- Proper font weight hierarchy

---

# Spacing Rules

Use a spacing system: 4, 8, 12, 16, 24, 32, 48, 64.

Never use arbitrary spacing.

---

# Component Consistency

Buttons, Cards, Inputs, Dropdowns, Badges, Dialogs, Tables, Tooltips, Navigation must all follow the same visual language.

---

# Buttons

Communicate importance:
- Primary: One only
- Secondary: Supportive
- Ghost: Low emphasis
- Danger: Destructive

Never create multiple competing primary buttons.

---

# Forms

Prefer step-by-step over large forms. Maximum 3–4 inputs per section.

Use: Inline validation, Helpful examples, Smart defaults, Auto-complete, Real-time feedback.

---

# Dashboard Design

Prioritize: Current status, Critical actions, Insights, Recent activity, Analytics.

Hide secondary information.

---

# Tables

- Consistent row height
- Sticky headers
- Search
- Sorting
- Filters
- Bulk actions
- Responsive behavior

---

# Empty States

Never leave empty screens. Explain why empty, what to do, provide CTA.

---

# Loading States

Prefer: Skeleton loading, Optimistic updates, Incremental rendering.

---

# Microinteractions

Keep animations subtle. Never distract. Preferred 150–250ms, natural easing, consistent timing.

---

# Responsiveness

Support: Mobile (320px), Tablet (375px, 768px), Laptop (1024px), Desktop (1440px), Ultra-wide (1920px).

No horizontal scrolling, overlapping elements, or clipped text.

---

# Accessibility

Always include: Keyboard navigation, Visible focus, ARIA where needed, Proper contrast, Readable font sizes, Accessible labels.

Never sacrifice usability for appearance.

---

# Performance

Prefer: lazy loading, code splitting, virtualization, optimized rendering, minimal re-renders, small bundles.

---

# Design Review Checklist

Before considering implementation complete, verify:

□ Visual hierarchy is obvious
□ Primary action is clear
□ No visual clutter
□ Consistent spacing
□ Consistent typography
□ Consistent colors
□ Responsive everywhere
□ Accessible
□ Fast
□ Microinteractions added
□ Loading states added
□ Empty states added
□ Error states added
□ Success states added
□ Hover states added
□ Focus states added
□ Animations polished
□ UX principles applied intentionally
□ No AI-generated appearance

---

# Self-Critique Phase

Ask: Would Stripe ship this? Would Linear ship this? Would Apple approve this? Would this look out of place in a premium SaaS?

---

# Final Standard

The finished interface should be:

* clean
* elegant
* balanced
* intentional
* highly usable
* psychologically optimized
* responsive
* accessible
* performant
* production-ready

It should never look AI-generated. Quality is measured by restraint, consistency, usability, and craftsmanship—not by visual complexity.
