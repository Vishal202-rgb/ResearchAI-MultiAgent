import React from 'react';
import { 
  Search, ShieldCheck, Swords, Gavel, 
  GitCompare, ShieldAlert, AlertTriangle, 
  History, Clock, Target, Database, Network, 
  MessageSquare, FileText, ArrowRight, Sparkles 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, label, onClick, disabled, bgClass, iconClass }) => {
  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 border transition-all duration-300 ${
        disabled 
        ? 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed' 
        : `bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:-translate-y-1 cursor-pointer`
      }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="flex flex-col h-full justify-between gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
              {label}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{description}</p>
        </div>

        <div className="mt-auto pt-4 flex items-center text-sm font-bold transition-colors">
          {disabled ? (
            <span className="text-gray-400 dark:text-gray-600">Requires Research Results</span>
          ) : (
            <span className={`flex items-center gap-2 group-hover:gap-3 transition-all ${iconClass.split(' ')[2]}`}>
              Explore Feature <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SecondaryPill = ({ icon: Icon, title, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm w-full sm:w-auto"
  >
    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
    <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto sm:ml-2" />
  </button>
);

const ResearchIntelligence = ({ 
  hasResults, 
  onTraceEvidence, 
  onDebate, 
  onContradictions, 
  onWhatChanged,
  onNavigateTab
}) => {
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Premium Capabilities</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">Research Intelligence</h2>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
          Go beyond AI-generated answers — verify, challenge, and understand your research with advanced adversarial agents and knowledge graph traversal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <FeatureCard 
          icon={Search}
          title="Trace Evidence"
          description="Connect every important claim to the explicit sources, documents, and publisher origins behind it."
          label="Claim → Source"
          disabled={!hasResults}
          onClick={onTraceEvidence}
          bgClass="bg-emerald-500"
          iconClass="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        />
        
        <FeatureCard 
          icon={Swords}
          title="Debate Findings"
          description="Challenge a finding by pitting adversarial AI agents against each other to uncover nuance and bias."
          label="Pro vs Counter"
          disabled={!hasResults}
          onClick={onDebate}
          bgClass="bg-indigo-500"
          iconClass="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
        />

        <FeatureCard 
          icon={ShieldAlert}
          title="Detect Contradictions"
          description="Automatically cross-reference all claims and evidence to find logical conflicts across your research."
          label="Conflict Detection"
          disabled={!hasResults}
          onClick={onContradictions}
          bgClass="bg-amber-500"
          iconClass="bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
        />

        <FeatureCard 
          icon={History}
          title="What Changed?"
          description="Compare historical research runs to effortlessly discover new findings, retracted claims, and evolving evidence."
          label="Research Updates"
          disabled={!hasResults}
          onClick={onWhatChanged}
          bgClass="bg-rose-500"
          iconClass="bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="bg-gray-50/50 dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">More Research Tools</h4>
          <p className="text-xs text-gray-500 font-medium">Explore the complete toolchain available inside this workspace.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <SecondaryPill icon={Target} title="Deep Dive" onClick={() => onTraceEvidence()} />
          <SecondaryPill icon={Database} title="Documents & RAG" onClick={() => onNavigateTab('documents')} />
          <SecondaryPill icon={Network} title="Knowledge Graph" onClick={() => onNavigateTab('graph')} />
          <SecondaryPill icon={MessageSquare} title="Research Chat" onClick={() => onNavigateTab('chat')} />
          <SecondaryPill icon={Clock} title="Timeline" onClick={() => onNavigateTab('timeline')} />
          <SecondaryPill icon={FileText} title="Final Report" onClick={() => onNavigateTab('report')} />
        </div>
      </div>
      
    </div>
  );
};

export default ResearchIntelligence;