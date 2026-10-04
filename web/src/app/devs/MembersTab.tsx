import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../utils/gql-client';
import {
  LIST_DEVELOPERS_QUERY,
  LIST_PENDING_REQUESTS_QUERY,
  CREATE_DEVELOPER_MUTATION,
  REMOVE_DEVELOPER_MUTATION,
  APPROVE_JOIN_REQUEST_MUTATION,
  REJECT_JOIN_REQUEST_MUTATION
} from './query';

type Developer = { id: number; name: string; email: string; createdBy: number | null };
type JoinRequest = { id: number; developerId: number; status: string; developer: { id: number; name: string; email: string } };

type SubTab = 'members' | 'pending';

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function MembersTab() {
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<SubTab>('members');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: devsData, isLoading: devsLoading } = useQuery({
    queryKey: ['listDevelopers'],
    queryFn: () => gqlRequest<{ listDevelopers: Developer[] }>(LIST_DEVELOPERS_QUERY),
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['listPendingRequests'],
    queryFn: () => gqlRequest<{ listPendingRequests: JoinRequest[] }>(LIST_PENDING_REQUESTS_QUERY),
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      gqlRequest(CREATE_DEVELOPER_MUTATION, { input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listDevelopers'] });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      setFormError(null);
    },
    onError: (err: any) => setFormError(err?.response?.errors?.[0]?.message || 'Failed to create developer'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => gqlRequest(REMOVE_DEVELOPER_MUTATION, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listDevelopers'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => gqlRequest(APPROVE_JOIN_REQUEST_MUTATION, { requestId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listPendingRequests'] });
      qc.invalidateQueries({ queryKey: ['listDevelopers'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => gqlRequest(REJECT_JOIN_REQUEST_MUTATION, { requestId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listPendingRequests'] }),
  });

  const developers = devsData?.listDevelopers || [];
  const pendingRequests = pendingData?.listPendingRequests || [];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[#1a1a1a] p-1 rounded-xl">
          <button
            onClick={() => setSubTab('members')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${subTab === 'members'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Members
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/10">{developers.length}</span>
          </button>
          <button
            onClick={() => setSubTab('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${subTab === 'pending'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Pending Approvals
            {pendingRequests.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {subTab === 'members' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Developer
          </button>
        )}
      </div>

      {/* Create Developer Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create Developer</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormError(null);
                createMutation.mutate(form);
              }}
              className="space-y-4"
            >
              {['name', 'email', 'password'].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">{field}</label>
                  <input
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    required
                    value={(form as any)[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder={field === 'email' ? 'dev@example.com' : field === 'name' ? 'Full Name' : '••••••••'}
                  />
                </div>
              ))}
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setFormError(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      {subTab === 'members' && (
        <>
          {devsLoading ? <Spinner /> : developers.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              <p className="text-sm">No developers yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {developers.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between bg-[#1e1e1e] border border-white/5 rounded-xl px-5 py-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                      {dev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{dev.name}</p>
                      <p className="text-xs text-gray-500">{dev.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {dev.createdBy ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Org Created</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">Self Registered</span>
                    )}
                    <button
                      onClick={() => removeMutation.mutate(dev.id)}
                      disabled={removeMutation.isPending}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pending Approvals */}
      {subTab === 'pending' && (
        <>
          {pendingLoading ? <Spinner /> : pendingRequests.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between bg-[#1e1e1e] border border-yellow-500/10 rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-bold">
                      {req.developer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{req.developer.name}</p>
                      <p className="text-xs text-gray-500">{req.developer.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => approveMutation.mutate(req.id)}
                      disabled={approveMutation.isPending}
                      className="text-xs px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(req.id)}
                      disabled={rejectMutation.isPending}
                      className="text-xs px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
