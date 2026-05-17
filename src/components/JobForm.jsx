import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import TagInput from './TagInput';

const JobForm = ({ onBasicMatch, onAIMatch, isLoadingBasic, isLoadingAI }) => {
  const [formData, setFormData] = useState({
    requiredSkills: [],
    minExperience: '',
    preferredSkills: []
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.requiredSkills.length === 0) newErrors.requiredSkills = 'Required skills cannot be empty';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicMatch = () => {
    if (validate()) {
      onBasicMatch({
        ...formData,
        minExperience: Number(formData.minExperience) || 0
      });
    }
  };

  const handleAIMatch = () => {
    if (validate()) {
      onAIMatch({
        ...formData,
        minExperience: Number(formData.minExperience) || 0
      });
    }
  };

  return (
    <div className="bg-white rounded-card p-6 border border-border shadow-sm mb-8 sticky top-8 z-10">
      <h2 className="text-xl font-bold text-navy-heading mb-6">Job Requirements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Required Skills *</label>
          <TagInput
            tags={formData.requiredSkills}
            onChange={(skills) => {
              setFormData({ ...formData, requiredSkills: skills });
              if (skills.length > 0 && errors.requiredSkills) {
                setErrors({ ...errors, requiredSkills: null });
              }
            }}
            placeholder="React, Node.js"
          />
          {errors.requiredSkills && <p className="text-red-500 text-xs mt-1">{errors.requiredSkills}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Preferred Skills (Nice to have)</label>
          <TagInput
            tags={formData.preferredSkills}
            onChange={(skills) => setFormData({ ...formData, preferredSkills: skills })}
            placeholder="AWS, Docker"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Minimum Experience (Years)</label>
          <input
            type="number"
            min="0"
            className="w-full p-2.5 rounded-lg border border-border focus:border-brand outline-none transition-colors text-sm text-text-body"
            value={formData.minExperience}
            onChange={e => setFormData({ ...formData, minExperience: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleBasicMatch}
          disabled={isLoadingBasic || isLoadingAI}
          className="flex-1 md:flex-none border-[1.5px] border-navy-heading text-navy-heading bg-transparent px-6 py-2.5 rounded-pill font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoadingBasic && <Loader2 size={16} className="animate-spin" />}
          Run Basic Match
        </button>
        <button
          onClick={handleAIMatch}
          disabled={isLoadingBasic || isLoadingAI}
          className="flex-1 md:flex-none bg-brand text-white px-6 py-2.5 rounded-pill font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoadingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isLoadingAI ? 'Analyzing...' : 'Run AI Match ✦'}
        </button>
      </div>
    </div>
  );
};

export default JobForm;
