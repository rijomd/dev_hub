import React, { useState } from 'react';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any; // Type this properly later based on your user context
}

export const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [orgId, setOrgId] = useState('');

  // Hide entirely if the dev was created by an org
  if (currentUser?.createdBy !== null && currentUser?.createdBy !== undefined) {
    return null; 
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // call requestToJoinOrganizationMutation({ variables: { orgId: parseInt(orgId) } })
    console.log('Sending request to join org:', orgId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Join an Organization
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            Enter the ID of the organization you wish to join. They will need to approve your request.
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 sm:flex sm:flex-col sm:gap-3">
          <input
            type="number"
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border outline-none"
            placeholder="Organization ID"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
          />
          <div className="mt-3 flex space-x-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:text-sm"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
