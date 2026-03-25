'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContexts';
import axios from 'axios';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

// Static navigation data
const navItems = [
  { id: 'all', title: 'All Documents', icon: DashboardIcon, path: '/documents' },
  { id: 'recent', title: 'Recent', icon: AccessTimeIcon, path: '/documents/recent' },
  { id: 'starred', title: 'Starred', icon: StarIcon, path: '/documents/starred' },
  { id: 'trash', title: 'Trash', icon: DeleteIcon, path: '/documents/trash' }
];

const bottomItems = [
  { id: 'settings', title: 'Settings', icon: SettingsIcon, path: '/settings' },
  { id: 'help', title: 'Help', icon: HelpIcon, path: '/help' }
];

export default function Sidebar() {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [unfiledDocs, setUnfiledDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentDays, setRecentDays] = useState(7);
  
  const { user, logout, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      fetchDocuments();
    }
  }, [user, token]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`);
      const docs = response.data.documents || [];
      
      const folderList = docs.filter(doc => doc.isFolder);
      const docList = docs.filter(doc => !doc.isFolder && !doc.parentId);
      
      setFolders(folderList);
      setUnfiledDocs(docList);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hide sidebar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateNew = () => {
    router.push('/documents?new=true');
  };

  const filteredDocs = unfiledDocs.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.aiMetadata?.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        flex flex-col h-screen
        bg-[rgb(var(--card))] 
        border-r border-[rgb(var(--border))]
        transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        md:translate-x-0 w-64
      `}>
        
        {/* Header - Logo & Collapse */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[rgb(var(--border))]">
          <Link href="/documents" className="flex items-center space-x-2">
            <DescriptionIcon className="w-6 h-6 text-[rgb(var(--primary))]" />
            <span className="text-lg font-bold text-[rgb(var(--text-primary))]">SaaS Docs</span>
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-[rgb(var(--surface))] md:hidden"
          >
            <CloseIcon className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="flex items-center px-4 py-3 border-b border-[rgb(var(--border))]">
            <div className="w-8 h-8 bg-[rgb(var(--primary)_/_0.1)] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-[rgb(var(--primary))]">
                {getUserInitials()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                {user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-[rgb(var(--text-secondary))] capitalize">
                {user.role || 'Member'}
              </p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--text-tertiary))] w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)_/_0.5)] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))]"
            />
          </div>
        </div>

        {/* New Document Button */}
        <div className="px-4 mb-4">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center justify-center px-4 py-2 bg-[rgb(var(--primary))] text-white text-sm font-medium rounded-md hover:bg-[rgb(var(--primary-hover))] transition-colors"
          >
            <AddIcon className="w-4 h-4 mr-2" />
            New Document
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3">
          
          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.id === 'recent') {
                return (
                  <div key={item.id} className="space-y-2">
                    <Link
                      href={`/documents/recent?days=${recentDays}`}
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-md transition-colors
                        ${pathname === '/documents/recent' 
                          ? 'bg-[rgb(var(--primary)_/_0.1)] text-[rgb(var(--primary))]' 
                          : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="flex-1">{item.title}</span>
                    </Link>
                    
                    {pathname === '/documents/recent' && (
                      <div className="px-3 py-2">
                        <div className="flex justify-between text-xs text-[rgb(var(--text-tertiary))] mb-1">
                          <span>1d</span>
                          <span>3d</span>
                          <span>7d</span>
                          <span>14d</span>
                          <span>30d</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={recentDays}
                          onChange={(e) => setRecentDays(e.target.value)}
                          className="w-full accent-[rgb(var(--primary))]"
                        />
                        <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                          Last {recentDays} days
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-md transition-colors
                    ${pathname === item.path 
                      ? 'bg-[rgb(var(--primary)_/_0.1)] text-[rgb(var(--primary))]' 
                      : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">
                Folders ({folders.length})
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <Link
                    key={folder._id}
                    href={`/folders/${folder._id}`}
                    className="flex items-center px-3 py-2 text-sm text-[rgb(var(--text-secondary))] rounded-md hover:bg-[rgb(var(--surface))]"
                  >
                    <FolderIcon className="w-4 h-4 mr-3 text-[rgb(var(--primary))]" />
                    <span className="flex-1 truncate">{folder.title}</span>
                    <span className="text-xs text-[rgb(var(--text-tertiary))]">
                      {folder.documentCount || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">
                Documents ({filteredDocs.length})
              </h3>
              <div className="space-y-1">
                {filteredDocs.slice(0, 8).map((doc) => (
                  <Link
                    key={doc._id}
                    href={`/documents/${doc._id}`}
                    className={`
                      flex items-center px-3 py-2 text-sm rounded-md group
                      ${pathname === `/documents/${doc._id}`
                        ? 'bg-[rgb(var(--primary)_/_0.1)] text-[rgb(var(--primary))]'
                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))]'
                      }
                    `}
                  >
                    <DescriptionIcon className="w-4 h-4 mr-3 text-[rgb(var(--text-tertiary))]" />
                    <span className="flex-1 truncate">{doc.title}</span>
                    {doc.aiMetadata?.tags?.length > 0 && (
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-[rgb(var(--primary))]">
                        🤖
                      </span>
                    )}
                  </Link>
                ))}
                {filteredDocs.length > 8 && (
                  <Link
                    href="/documents"
                    className="block px-3 py-2 text-xs text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))]"
                  >
                    View all {filteredDocs.length} documents →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(var(--primary))]"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredDocs.length === 0 && folders.length === 0 && (
            <div className="text-center py-8 px-3">
              <DescriptionIcon className="w-8 h-8 text-[rgb(var(--text-tertiary))] mx-auto mb-2" />
              <p className="text-sm text-[rgb(var(--text-secondary))]">No documents yet</p>
              <button
                onClick={handleCreateNew}
                className="mt-3 text-xs text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))]"
              >
                Create your first document →
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[rgb(var(--border))]">
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-md
                    ${isActive 
                      ? 'bg-[rgb(var(--primary)_/_0.1)] text-[rgb(var(--primary))]' 
                      : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}
            
            {/* Logout Button - Now using theme variables */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger)_/_0.1)]"
            >
              <LogoutIcon className="w-4 h-4 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}