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
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trash</h1>
      
      {documents.length === 0 ? (
        <p className="text-gray-500">Trash is empty</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  Deleted: {new Date(doc.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleRestore(doc._id)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(doc._id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
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