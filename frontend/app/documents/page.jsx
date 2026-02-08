// frontend/app/documents/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocument, setNewDocument] = useState({ title: '', content: '', isFolder: false });
  
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`);
      setDocuments(response.data.documents || []);
      setError('');
    } catch (err) {
      setError('Failed to load documents');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newDocument.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents`,
        newDocument
      );
      
      setDocuments([response.data.document, ...documents]);
      setNewDocument({ title: '', content: '', isFolder: false });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create document');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this document?')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.email} • {documents.length} documents
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New Document
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Create New Document</h2>
          <form onSubmit={handleCreateDocument} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newDocument.title}
                onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={newDocument.content}
                onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Start writing..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFolder"
                checked={newDocument.isFolder}
                onChange={(e) => setNewDocument({...newDocument, isFolder: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFolder" className="ml-2 text-sm text-gray-700">
                This is a folder (no content)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500">Create your first document to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Document
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      {doc.isFolder ? (
                        <span className="text-yellow-500 mr-3">📁</span>
                      ) : (
                        <span className="text-blue-500 mr-3">📄</span>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {doc.title}
                        </h3>
                        {doc.aiMetadata?.summary && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {doc.aiMetadata.summary}
                          </p>
                        )}
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                          {doc.aiMetadata?.tags && doc.aiMetadata.tags.length > 0 && (
                            <div className="flex items-center">
                              <span className="mr-2">Tags:</span>
                              {doc.aiMetadata.tags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/documents/${doc._id}`)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Features Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-xl">🤖</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">AI-Powered Features</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Your documents are automatically analyzed by AI to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Generate summaries</li>
                <li>Extract relevant tags</li>
                <li>Analyze sentiment</li>
                <li>Enable smart search</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}