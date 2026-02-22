import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
// import SearchIcon from '@mui/icons-material/Search';
// import LogoutIcon from '@mui/icons-material/Logout';

export const navItems = [
    {
        id: 'all',
        title: 'All Documents' ,
        icon: DashboardIcon,
        path: '/documents',
        section: 'main'
    },
    {
        id: 'recent',
        title: 'Recent',
        icon: AccessTimeIcon,
        path: '/documents/recent',
        section: 'main'
    },
    {
        id: 'starred',
        title: 'Starred',
        icon: StarIcon,
        path: '/documents/starred',
        section: 'main'
    },
    {
        id: 'trash',
        title: 'Trash',
        icon: DeleteIcon,
        path: '/documents/trash',
        section: 'main'
    },
];

export const bottonItem= [
    {
        id: 'setting',
        title: 'Setting',
        icon: SettingsIcon,
        path: '/setting',
        section: 'bottom'
    },
    {
        id: 'help',
        title: 'Help & Support',
        icon: HelpIcon,
        path: '/help',
        section: 'bottom'
    }
];
export const quickActions= [
    {
        id: 'newdoc',
        title: 'New Document',
        icon: AddIcon,
        action: 'create',
        section: 'primary'
    }
];

export const getDocumentIcon = (doc)=>{
    if (doc.isFolder) return FolderIcon;
    return DescriptionIcon;
};