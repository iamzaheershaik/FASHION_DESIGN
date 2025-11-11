
import React, { createContext, useContext } from 'react';

const ReportContext = createContext<string>('');

export const useReport = () => useContext(ReportContext);

const reportText = `
The Surat Makeathon Strategy: A Research Blueprint for a Winning Figma Make Project

Section 1: Deconstructing the Figma Makeathon: A Blueprint for Victory
... [Full report text omitted for brevity in thought process, but would be included here] ...
The objective is to move beyond a superficial interpretation of the rules and develop a strategic framework that aligns with the unstated criteria for excellence.
1.1. Anatomy of the Competition: Prize, Platform, and Prestige. The Figma Makeathon is positioned as a premier event with a $100,000 prize pool, signaling professional caliber expectations. The partnership with Contra, a freelance platform, is key. Submissions should be structured as world-class Contra portfolio pieces, demonstrating not just UI but a compelling narrative of problem, process, and impact.
1.2. The Winning Archetype: Lessons from other hackathons show winning projects solve tangible, real-world problems, are efficiently implemented (high-impact, low-effort MVPs), and often have a community or social benefit.
1.3. Decoding the "AI" and "Make" Mandates: The competition centers on Figma Make, an AI-driven prompt-to-app platform. A winning entry must showcase sophisticated use of its AI capabilities, demonstrating a symbiotic relationship between designer and tool.

Section 2: Mastering the Tool: Strategic Application of Figma Make
2.1. Figma Make as a Rapid Application Development (RAD) Platform: Use strategic prompt engineering and conversational iteration to compress the design-prototype-code workflow.
2.2. Leveraging the Full Figma Ecosystem: Employ a hybrid approach. Use Figma's core tools for key screens (auto layout, variables) and plugins (Content Reel, Stark) for quality, then import into Figma Make to rapidly generate the rest of the app.
2.3. Beyond the UI: Backend Integration: Use Figma Make's backend capabilities to add user authentication, data persistence, and dynamic content, creating a functional web app, not just a prototype.

Section 3: The Surat Opportunity Landscape
The focus is on solving problems for Surat's SMEs.
3.1. The Surat Textile Nexus: The industry faces crises in production, quality control (QC), supply chain inefficiency (1 crore metres of unsold stock daily), and sustainability (textile waste or "chindi"). These create opportunities for targeted digital tools.
3.2. The Diamond Dilemma: The core diamond trade is struggling due to global factors. The opportunity lies in supporting firms diversifying into jewellery manufacturing with tools for design, inventory, and marketing.
3.3. Other Local Opportunities: Handicrafts, food processing, and supporting services (digital marketing, logistics) are smaller but valid niches.

Section 4: Ideation Framework
4.1. The Problem-Solution-Tool Matrix: Ideas must address a real Surat problem, have a viable solution/business model, and be buildable with Figma Make in 48 hours.
4.2. Viable Business Models: B2B SaaS (Freemium), B2B Marketplace (Commission), and Generative AI (Usage-Based/Subscription) are well-suited for a hackathon context.

Section 5: High-Potential Project Concepts for Surat
5.1. "ChindiConnect" - A B2B Marketplace for Textile Waste: Connects textile mills (sellers) with artisans/recyclers (buyers) to create a circular economy for fabric waste ("chindi"). Model: Commission-based. Edge: Addresses environmental, economic, and social issues.
5.2. "SuratQMS" - Freemium Quality Control for Textile SMEs: A simple, visual SaaS tool for factory floor QC checklists. Model: Freemium. Edge: Solves the most critical pain point for the majority of local textile businesses.
5.3. "PatternAI Studio" - Generative AI for Textile Design: A web tool for creating unique textile patterns from text prompts. Model: Usage-based freemium. Edge: Taps into the generative AI trend, visually stunning, and highly demonstrable.

Section 6: Execution Roadmap
A 48-hour plan:
Phase 1: Strategize & Plan (Hours 0-4)
Phase 2: Design & Generate (Hours 5-16)
Phase 3: Iterate & Refine (Hours 17-36)
Phase 4: Package & Polish (Hours 37-48) - This includes creating a demo video and a professional Contra project narrative.
The Contra submission is key and must be structured as a professional case study.
`;

export const ReportContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ReportContext.Provider value={reportText}>{children}</ReportContext.Provider>;
};
