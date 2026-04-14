import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, CheckCircle2, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeamCollaboration = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Team Collaboration Software for Agencies | Oru ERP"
        description="Unified collaboration platform for agencies. Real-time communication, file sharing, and team alignment."
        keywords="team collaboration software, collaboration tools, team communication, project collaboration"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">TEAM COLLABORATION</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Keep your team aligned.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Collaborate in real-time with integrated messaging, file sharing, and task commenting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-base bg-black text-white hover:bg-gray-900">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base border-gray-300 text-black hover:bg-gray-50">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Features</h2>
            <p className="text-lg text-gray-600">Everything teams need to work together.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <MessageSquare className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Team Messaging</h3>
              <p className="text-gray-600 leading-relaxed">Unified messaging within projects and tasks. No context switching between Slack and your ERP.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Share2 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">File Management</h3>
              <p className="text-gray-600 leading-relaxed">Share and organize project files. Track versions and maintain complete document history.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <CheckCircle2 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Task Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">Comment on tasks, tag teammates, and keep all work-related discussion in context.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Users className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Team Spaces</h3>
              <p className="text-gray-600 leading-relaxed">Create team channels for departments or projects to organize conversations by topic.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Unified collaboration, unified platform.</h2>
          <Link to="/agency-signup?feature=team-collaboration">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TeamCollaboration;
