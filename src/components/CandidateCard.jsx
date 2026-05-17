import { Bookmark, Trash2 } from 'lucide-react';

const CandidateCard = ({ candidate, onToggleSave, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const visibleSkills = candidate.skills.slice(0, 6);
  const extraSkillsCount = candidate.skills.length - 6;

  return (
    <div className="bg-white rounded-card p-6 border border-border hover:border-brand-mid transition-colors group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-lg">
            {getInitials(candidate.name)}
          </div>
          <div>
            <h3 className="font-bold text-navy-heading text-lg leading-tight">{candidate.name}</h3>
            <p className="text-text-muted text-sm">{candidate.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleSave(candidate._id)}
            className={`p-2 rounded-full transition-colors ${
              candidate.savedToShortlist
                ? 'bg-brand-light text-brand-dark'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={candidate.savedToShortlist ? 'Remove from shortlist' : 'Save to shortlist'}
          >
            <Bookmark size={18} fill={candidate.savedToShortlist ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this candidate?')) {
                onDelete(candidate._id);
              }
            }}
            className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete candidate"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand bg-brand-light px-2.5 py-1 rounded-pill">
          {candidate.experience} {candidate.experience === 1 ? 'year' : 'years'} exp
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {visibleSkills.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-pill"
          >
            {skill}
          </span>
        ))}
        {extraSkillsCount > 0 && (
          <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-pill">
            +{extraSkillsCount} more
          </span>
        )}
      </div>

      {candidate.bio && (
        <p className="text-sm text-text-body line-clamp-2">{candidate.bio}</p>
      )}
    </div>
  );
};

export default CandidateCard;
