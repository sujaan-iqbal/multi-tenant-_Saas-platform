'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContexts';

// Component that uses useSearchParams
function StarredContent() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchStarred();
  }, [token]);

  const fetchStarred = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/starred/all`
      );
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch starred:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Starred Documents
      </h1>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No starred documents yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc._id}
              href={`/documents/${doc._id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-yellow-500">⭐</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page with Suspense boundary
export default function StarredDocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <StarredContent />
    </Suspense>
  );
}