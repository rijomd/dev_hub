import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../utils/gql-client';
import { LIST_ORGANIZATIONS_QUERY, REQUEST_JOIN_ORG_MUTATION } from '../auth/query';
import { CREATED_BY } from '../utils/authConstants';

type Org = { id: number; name: string; email: string };

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function OrganizationsTab() {
  const qc = useQueryClient();
  const createdBy = localStorage.getItem(CREATED_BY);
  const isOrgCreated = createdBy !== null && createdBy !== '';
  const [selected, setSelected] = useState<number[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['listOrganizations'],
    queryFn: () => gqlRequest<{ listOrganizations: Org[] }>(LIST_ORGANIZATIONS_QUERY),
    // Only fetch if dev is self-registered
    enabled: !isOrgCreated,
  });

  const organizations: Org[] = data?.listOrganizations || [];

  const joinMutation = useMutation({
    mutationFn: (orgId: number) => gqlRequest(REQUEST_JOIN_ORG_MUTATION, { orgId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listOrganizations'] });
    },
  });

  const handleSendRequests = async () => {
    setSuccess(null);
    setError(null);
    try {
      await Promise.all(selected.map((orgId) => joinMutation.mutateAsync(orgId)));
      setSuccess(`Join request${selected.length > 1 ? 's' : ''} sent to ${selected.length} organization${selected.length > 1 ? 's' : ''}.`);
      setSelected([]);
    } catch (err: any) {
      setError(err?.response?.errors?.[0]?.message || 'Failed to send request(s)');
    }
  };

  const toggleOrg = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- Org-created dev: only sees their single org ---
  if (isOrgCreated) {
    return (
      <div className="space-y-4">
        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Your Organization</h3>
          <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
              Org
            </div>
            <div>
              <p className="text-sm font-medium text-white">Organization ID: {createdBy}</p>
              <p className="text-xs text-gray-500">You were created by this organization</p>
            </div>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Managed
            </span>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Since your account was created by an organization, you cannot join additional organizations.
          </p>
        </div>
      </div>
    );
  }

  // --- Self-registered dev: can request to join multiple orgs ---
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Join Organizations</h3>
          <p className="text-xs text-gray-500 mt-0.5">Select organizations to send a join request. They will review and approve.</p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={handleSendRequests}
            disabled={joinMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {joinMutation.isPending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            Send Request{selected.length > 1 ? 's' : ''} ({selected.length})
          </button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-emerald-400 text-sm">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : organizations.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">No organizations available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => {
            const isSelected = selected.includes(org.id);
            return (
              <div
                key={org.id}
                onClick={() => toggleOrg(org.id)}
                className={`flex items-center justify-between bg-[#1e1e1e] border rounded-xl px-5 py-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isSelected ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      org.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.email}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
