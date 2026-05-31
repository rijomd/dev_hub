import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { InputBox, Button } from '@dev-hub/ui';
import { client } from '../utils/gql-client';
import { CREATE_PROJECT_MUTATION } from './query';

const initialData = {
  name: '',
  language: '',
  framework: '',
  isLocal: true,
  localPath: '',
  gitUrl: '',
  envVersion: '',
  installCommand: '',
  runCommand: '',
  buildCommand: '',
  stopCommand: '',
  port: 3000,
}

export function CreateProject({ onProjectCreated }: { onProjectCreated?: () => void }) {
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: typeof formData) => {
      const payload = {
        ...input,
        port: Number(input.port),
      };
      return await client.request(CREATE_PROJECT_MUTATION, { input: payload });
    },
    onSuccess: () => {
      if (onProjectCreated) onProjectCreated();
      setFormData(initialData);
    },
    onError: (err: any) => {
      setError(err.response?.errors?.[0]?.message || 'Failed to create project.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(formData);
  };

  return (
    <div className="p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-teal-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Project Name</label>
            <InputBox
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. My Awesome App"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>

          {/* Language & Framework */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Language</label>
            <InputBox
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Node js / TS"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Framework</label>
            <InputBox
              type="text"
              name="framework"
              value={formData.framework}
              onChange={handleChange}
              placeholder="Next JS"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 backdrop-blur-sm"
            />
          </div>

          {/* isLocal & Local Path */}
          <div className='flex justify-items-start gap-1 align-middle'>
            <InputBox
              type="checkbox"
              name="isLocal"
              checked={formData.isLocal}
              onChange={handleChange}
              className="w-5 h-5 bg-gray-800 text-emerald-500 accent-emerald-500 rounded focus:ring-emerald-500 focus:ring-offset-gray-900"
            />
            <label className="w-full block text-sm font-semibold text-gray-300 ">This is a local project</label>
          </div>

          {formData.isLocal ? (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Local Path</label>
              <InputBox
                type="text"
                name="localPath"
                value={formData.localPath}
                onChange={handleChange}
                placeholder="/Users/username/projects/my-app"
                className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 placeholder-gray-500 backdrop-blur-sm"
              />
            </div>
          ) : (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Git URL</label>
              <InputBox
                type="text"
                name="gitUrl"
                value={formData.gitUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repo.git"
                className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 placeholder-gray-500 backdrop-blur-sm"
              />
            </div>
          )}

          {/* Commands */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Install Command</label>
            <InputBox
              type="text"
              name="installCommand"
              value={formData.installCommand}
              onChange={handleChange}
              placeholder="npm install"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 font-mono text-sm backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Build Command</label>
            <InputBox
              type="text"
              name="buildCommand"
              value={formData.buildCommand}
              onChange={handleChange}
              placeholder="npm run build"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 font-mono text-sm backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Run Command</label>
            <InputBox
              type="text"
              name="runCommand"
              value={formData.runCommand}
              onChange={handleChange}
              placeholder="npm run dev"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 font-mono text-sm backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Stop Command</label>
            <InputBox
              type="text"
              name="stopCommand"
              value={formData.stopCommand}
              onChange={handleChange}
              placeholder="npm run stop"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 font-mono text-sm backdrop-blur-sm"
            />
          </div>

          {/* Environment Version & Port */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Env Version</label>
            <InputBox
              type="text"
              name="envVersion"
              value={formData.envVersion}
              onChange={handleChange}
              placeholder="e.g. 18.17.0"
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 placeholder-gray-500 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Port</label>
            <InputBox
              type="number"
              name="port"
              value={formData.port}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl  transition-all outline-none bg-[#2a2a2a]/80 text-gray-200 backdrop-blur-sm"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-xl mt-4">
            {error}
          </div>
        )}

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/20 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {mutation.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
