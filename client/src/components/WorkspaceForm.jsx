import { useState, useEffect } from 'react';
import { FileText, HelpCircle, Target, Globe, Type } from 'lucide-react';

const WorkspaceForm = ({ initialData, onSubmit, submitting, submitLabel = 'Create Workspace' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    researchQuestion: '',
    researchObjective: '',
    researchDomain: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        researchQuestion: initialData.researchQuestion || '',
        researchObjective: initialData.researchObjective || '',
        researchDomain: initialData.researchDomain || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const fields = [
    {
      name: 'title',
      label: 'Title',
      icon: Type,
      placeholder: 'e.g. Impact of AI on Healthcare',
      required: true,
      type: 'input',
    },
    {
      name: 'description',
      label: 'Description',
      icon: FileText,
      placeholder: 'Brief description of your research workspace...',
      required: false,
      type: 'textarea',
    },
    {
      name: 'researchQuestion',
      label: 'Research Question',
      icon: HelpCircle,
      placeholder: 'What is the primary question your research aims to answer?',
      required: false,
      type: 'textarea',
    },
    {
      name: 'researchObjective',
      label: 'Research Objective',
      icon: Target,
      placeholder: 'What do you aim to achieve with this research?',
      required: false,
      type: 'textarea',
    },
    {
      name: 'researchDomain',
      label: 'Research Domain',
      icon: Globe,
      placeholder: 'e.g. Healthcare, Machine Learning, Economics',
      required: false,
      type: 'input',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <field.icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none shadow-sm"
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white transition-shadow shadow-sm"
              />
            )}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting || !formData.title.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {submitting ? (
          <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
};

export default WorkspaceForm;
