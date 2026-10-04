import React, { useState } from 'react';

// You will need to wire up these hooks with your generated GraphQL queries/mutations
// import { useGetOrganizationDevsQuery, useApproveJoinRequestMutation, useRemoveDeveloperMutation } from '../graphql/generated';

export const OrganizationDevs = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');
  
  // Placeholder data
  const members = [{ id: 1, name: 'Alice Developer', email: 'alice@example.com' }];
  const pendingRequests = [{ id: 101, name: 'Bob Newcomer', email: 'bob@example.com', status: 'PENDING' }];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Developers</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2 px-1 ${activeTab === 'members' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Current Members
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pending Approvals
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Members List */}
      {activeTab === 'members' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {members.map((dev) => (
              <li key={dev.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{dev.name}</p>
                  <p className="text-sm text-gray-500">{dev.email}</p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-900 font-medium px-3 py-1 border border-transparent rounded hover:bg-red-50">
                  Remove
                </button>
              </li>
            ))}
            {members.length === 0 && (
               <li className="px-6 py-4 text-gray-500 text-sm text-center">No members found.</li>
            )}
          </ul>
        </div>
      )}

      {/* Pending Approvals List */}
      {activeTab === 'pending' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pendingRequests.map((req) => (
              <li key={req.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.name}</p>
                  <p className="text-sm text-gray-500">{req.email}</p>
                </div>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Approve
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Reject
                  </button>
                </div>
              </li>
            ))}
            {pendingRequests.length === 0 && (
               <li className="px-6 py-4 text-gray-500 text-sm text-center">No pending requests.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
