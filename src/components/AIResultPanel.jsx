const AIResultPanel = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="bg-brand-light border-l-4 border-brand p-6 rounded-r-card mb-8">
      <div className="flex gap-3">
        <div className="text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
        </div>
        <div>
          <h3 className="font-bold text-navy-heading mb-2">AI Analysis Summary</h3>
          <p className="text-text-body text-sm leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
};

export default AIResultPanel;
