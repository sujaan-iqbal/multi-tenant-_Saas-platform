'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContexts';

export default function TrashPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchTrash();
  }, [token]);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/trash/all`
      );
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}/restore`);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Failed to restore:', error);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm('Permanently delete this document? This cannot be undone.')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}/permanent`);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[rgb(var(--text-primary))]">
      <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">Trash</h1>
      
      {documents.length === 0 ? (
        <p className="text-[rgb(var(--text-tertiary))]">Trash is empty</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div 
              key={doc._id} 
              className="flex items-center justify-between p-4 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg hover:bg-[rgb(var(--surface))] transition-colors"
            >
              <div>
                <h3 className="font-medium text-[rgb(var(--text-primary))]">{doc.title}</h3>
                <p className="text-sm text-[rgb(var(--text-tertiary))]">
                  Deleted: {new Date(doc.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleRestore(doc._id)}
                  className="px-3 py-1 text-sm bg-[rgb(var(--success)_/_0.1)] text-[rgb(var(--success))] rounded hover:bg-[rgb(var(--success)_/_0.2)] transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(doc._id)}
                  className="px-3 py-1 text-sm bg-[rgb(var(--danger)_/_0.1)] text-[rgb(var(--danger))] rounded hover:bg-[rgb(var(--danger)_/_0.2)] transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}