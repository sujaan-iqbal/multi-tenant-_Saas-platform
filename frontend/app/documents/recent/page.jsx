'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContexts';

export default function RecentDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const days = searchParams.get('days') || 7;
  const { token } = useAuth();

  useEffect(() => {
    fetchRecent();
  }, [days, token]);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/recent?days=${days}`
      );
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch recent:', error);
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
        Recent Documents (Last {days} days)
      </h1>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No documents found in the last {days} days</p>
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
                {doc.isStarred && <span className="text-yellow-500">⭐</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}