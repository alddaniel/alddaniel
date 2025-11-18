import React, { useState, useEffect } from 'react';
import type { User, Customer, Supplier } from '../types';

type IconProps = {
  className?: string;
  [key: string]: any;
};

// --- Icon Library (Heroicons Style) ---

const Icon: React.FC<IconProps & { path: React.ReactNode }> = ({ className = 'w-6 h-6', path, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
    {path}
  </svg>
);


export const FileIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625a1.875 1.875 0 00-1.875 1.875v17.25a1.875 1.875 0 001.875 1.875h12.75a1.875 1.875 0 001.875-1.875V11.25a1.875 1.875 0 00-1.875-1.875h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5" />} />
);


// FIX: Moved CustomerIcon definition before its usage in genericIcons to fix a block-scoped variable error.
export const CustomerIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />} />
);


// --- User Profile Component ---

// Helper to get initials
const getInitials = (name: string = ''): string => {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// A simple color hashing for consistent initial backgrounds
const nameToColor = (name: string = ''): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 50%, 70%)`;
  return color;
};

interface UserProfileProps {
  user?: Partial<User | Customer | Supplier> & { name: string; avatarUrl?: string; };
  className?: string;
  title?: string;
  isLoading?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, className = 'w-8 h-8', title, isLoading = false }) => {
  const [hasError, setHasError] = useState(false);
  const { name = 'Usuário', avatarUrl } = user || {};
  const effectiveTitle = title || name;

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  if (isLoading) {
    return <div className={`${className} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>
  }

  if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image')) && !hasError) {
    const imgClassName = className.includes('rounded-') ? `${className} object-cover` : `${className} rounded-full object-cover`;
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={imgClassName}
        title={effectiveTitle}
        onError={() => setHasError(true)}
      />
    );
  }

  const divClassName = className.includes('rounded-') ? `${className} flex items-center justify-center font-bold text-white text-xs` : `${className} rounded-full flex items-center justify-center font-bold text-white text-xs`;
  return (
    <div
      title={effectiveTitle}
      className={divClassName}
      style={{ backgroundColor: nameToColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};

export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />} />
);


// --- Icon Library (Existing Icons) ---
export const DashboardIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />} />
);

export const SupplierIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" />} />
);

export const AgendaIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />} />
);

export const ReportsIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125-1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />} />
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226M12 20.25a12.25 12.25 0 01-3.375-1.226M15.312 6.22c-1.07-1.07-2.5-1.72-4.062-1.72s-2.992.65-4.062 1.72m10.125 8.106a12.25 12.25 0 01-10.125 0M12 3.75v16.5M3.75 6.22c-1.07 1.07-1.72 2.5-1.72 4.062s.65 2.992 1.72 4.062m16.5-8.106c1.07 1.07 1.72 2.5 1.72 4.062s-.65 2.992-1.72 4.062" />} />
);

export const BellIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />} />
);

export const SearchIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />} />
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />} />
);

export const KeyIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0-1.036.84-1.875 1.875-1.875s1.875.84 1.875 1.875S12.66 11.625 11.625 11.625s-1.875-.84-1.875-1.875zM10.5 13.5L9 15" />} />
);

export const LockIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />} />
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />} />
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />} />
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09c-1.18 0-2.09.954-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />} />
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>} />
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} className='w-5 h-5' path={<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 00-1.471-1.471L13.5 18.75l1.188-.648a2.25 2.25 0 001.471-1.471L16.25 15.75l.648 1.188a2.25 2.25 0 001.471 1.471L18.75 18l-1.188.648a2.25 2.25 0 00-1.471 1.471z" />} />
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} className='w-5 h-5' path={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />} />
);
export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} className='w-5 h-5' path={<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />} />
);

export const ClockIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} className='w-4 h-4' path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />} />
);

export const ClockRewindIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path  strokeLinecap="round" strokeLinejoin="round" d="M9 5.065A7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 7.5 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 5.065 7.5 6.5M9 5.065 10.5 6.5" /></>} />
);

export const LocationPinIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} className='w-4 h-4' path={<><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>} />
);

export const BoardIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
);

export const CloseIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />} />
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493m-2.51 2.493a9.337 9.337 0 01-4.121-.952 4.125 4.125 0 01-7.533 2.493m14.164-2.493a12.318 12.318 0 00-14.164 0m14.164 0a12.318 12.318 0 00-14.164 0M9 12.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />} />
);

export const BriefcaseIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v-2.1a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v2.1m0 0-2.25 2.25m2.25-2.25a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-2.1a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v2.1m-4.5 2.25a2.25 2.25 0 00-2.25 2.25v3.375c0 .621.504 1.125 1.125 1.125h10.25c.621 0 1.125-.504 1.125-1.125v-3.375a2.25 2.25 0 00-2.25-2.25h-1.5m-4.5-2.25a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v2.1a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25m-4.5 2.25 2.25-2.25" />} />
);

export const TagIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l6.472 6.471a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></>} />
);

export const HeartIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />} />
);

export const HelpIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />} />
);

export const WarningIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />} />
);

export const AlertTriangleIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />} />
);

export const PhoneIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />} />
);

export const EnvelopeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />} />
);

export const PaperClipIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.735l-7.662 7.662a4.5 4.5 0 01-6.364-6.364l7.662-7.662a3 3 0 014.242 4.242l-7.662 7.662a1.5 1.5 0 01-2.121-2.121l7.662-7.662" />} />
);

export const SunIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />} />
);

export const MoonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />} />
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />} />
);

export const CalendarCheckIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} path={<><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 16l2 2 4-4" /></>} />
);

export const GlobeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m9 9a9 9 0 009-9" />} />
);

export const GoogleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={props.className || 'w-6 h-6'} {...props}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.356-11.303-7.918l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C41.389 36.372 44 30.655 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export const MicrosoftIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className={props.className || 'w-6 h-6'} {...props}>
    <path fill="#f25022" d="M1 1h9v9H1z"/>
    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />} />
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} path={<path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />} />
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} strokeWidth={2} path={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
);

export const InformationCircleIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} strokeWidth={2} path={<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />} />
);


export const iconMap: { [key: string]: React.FC<IconProps> } = {
    CustomerIcon,
    UsersIcon,
    SupplierIcon,
    BriefcaseIcon,
    TagIcon,
    HeartIcon,
    AgendaIcon,
    DashboardIcon,
    ReportsIcon,
    SettingsIcon,
    HelpIcon,
    CalendarCheckIcon,
    WhatsAppIcon,
    KeyIcon,
};