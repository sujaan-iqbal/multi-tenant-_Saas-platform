// frontend/app/documents/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function DocumentDetailPage() {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchDocument();
    }
  }, [isAuthenticated, params.id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${params.id}`
      );
      setDocument(response.data.document);
      setEditData({
        title: response.data.document.title,
        content: response.data.document.content
      });
      setError('');
    } catch (err) {
      setError('Document not found or access denied');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${params.id}`,
        editData
      );
      setDocument(response.data.document);
      setEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update document');
    }
  };

  const handleAnalyze = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${params.id}/analyze`
      );
      alert('Document sent for AI analysis. Refresh to see updates.');
    } catch (err) {
      setError('Analysis failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Document Not Found</h2>
        <Link href="/documents" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          ← Back to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/documents" 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Documents
        </Link>
        <div className="flex space-x-3">
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            🤖 Analyze with AI
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editing ? 'Cancel Edit' : 'Edit Document'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Document Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {editing ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={editData.content}
                onChange={(e) => setEditData({...editData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="10"
              />
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>
            
            {/* AI Insights */}
            {document.aiMetadata && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">🤖 AI Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-blue-700">Summary</h4>
                    <p className="text-sm text-blue-600 mt-1">{document.aiMetadata.summary || 'Not analyzed yet'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-700">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {document.aiMetadata.tags?.map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      )) || 'No tags'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-700">Sentiment</h4>
                    <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      document.aiMetadata.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : document.aiMetadata.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {document.aiMetadata.sentiment || 'neutral'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Document Content */}
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {document.content || <em className="text-gray-500">No content</em>}
              </pre>
            </div>
            
            {/* Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 space-y-2">
                <p>Created: {new Date(document.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(document.updatedAt).toLocaleString()}</p>
                {document.aiMetadata?.lastAnalyzed && (
                  <p>AI analyzed: {new Date(document.aiMetadata.lastAnalyzed).toLocaleString()}</p>
                )}
                <p>Word count: {document.content?.split(/\s+/).length || 0} words</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}