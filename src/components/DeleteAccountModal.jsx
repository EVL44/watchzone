import { useState } from 'react';

export default function DeleteAccountModal({ userIdentifier, onClose, onConfirm, isUpdating, message }) {
  const [input, setInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-lg w-full max-w-sm p-6 relative shadow-2xl">
        <h2 className="text-xl font-bold text-red-500 mb-4">Confirm Account Deletion</h2>
        <p className="text-foreground/80 mb-6">
          This action is permanent. To confirm, please type your username: <strong className="text-foreground">{userIdentifier}</strong>
        </p>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-secondary p-3 rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4"
          placeholder={`Type "${userIdentifier}" to confirm`}
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isUpdating} 
            className="bg-secondary text-foreground px-4 py-2 rounded-md hover:bg-secondary/70 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isUpdating || input !== userIdentifier} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </div>
        {message?.text && message?.type === 'error' && <p className={`mt-4 text-sm text-red-500`}>{message.text}</p>}
      </div>
    </div>
  );
}
