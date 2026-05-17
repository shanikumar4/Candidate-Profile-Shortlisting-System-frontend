import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import TagInput from './TagInput';

const CandidateForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: [],
    experience: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
    if (formData.experience === '') {
      newErrors.experience = 'Experience is required';
    } else if (Number(formData.experience) < 0) {
      newErrors.experience = 'Experience cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const success = await onSubmit({
        ...formData,
        experience: Number(formData.experience)
      });
      if (success) {
        setFormData({ name: '', email: '', skills: [], experience: '', bio: '' });
        setErrors({});
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card p-6 border border-border shadow-sm mb-8">
      <h2 className="text-xl font-bold text-navy-heading mb-6">Add Candidate</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Full Name *</label>
          <input
            type="text"
            className={`w-full p-2.5 rounded-lg border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand'} outline-none transition-colors text-sm text-text-body`}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Email *</label>
          <input
            type="email"
            className={`w-full p-2.5 rounded-lg border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand'} outline-none transition-colors text-sm text-text-body`}
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Skills *</label>
          <TagInput
            tags={formData.skills}
            onChange={(skills) => {
              setFormData({ ...formData, skills });
              if (skills.length > 0 && errors.skills) {
                setErrors({ ...errors, skills: null });
              }
            }}
            placeholder="Type a skill and press Enter"
          />
          {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Experience (Years) *</label>
          <input
            type="number"
            min="0"
            max="50"
            className={`w-full p-2.5 rounded-lg border ${errors.experience ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand'} outline-none transition-colors text-sm text-text-body`}
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: e.target.value })}
            placeholder="e.g. 3"
          />
          {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-navy-heading mb-1.5">Bio</label>
          <textarea
            rows="3"
            className="w-full p-2.5 rounded-lg border border-border focus:border-brand outline-none transition-colors text-sm text-text-body resize-none"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Brief professional background..."
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-navy-heading text-white px-6 py-2.5 rounded-pill font-semibold text-sm flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? 'Adding...' : 'Add Candidate'}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;
