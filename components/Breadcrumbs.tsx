
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { navItems } from '../constants';
import { ChevronRightIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { t } = useLocalization();
    
    // Don't render anything on the dashboard
    if (location.pathname === '/') {
        return null;
    }

    const currentNavItem = navItems.find(item => location.pathname.startsWith(item.path) && item.path !== '/');
    
    // If we're on a path that doesn't match a main nav item, don't render.
    if (!currentNavItem) {
        return null;
    }

    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 text-sm">
                <li>
                    <div className="flex items-center">
                        <Link to="/" className="font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                            {t('sidebar.dashboard')}
                        </Link>
                    </div>
                </li>
                <li>
                    <div className="flex items-center">
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="ml-1 font-medium text-gray-500 dark:text-gray-400">{t(currentNavItem.nameKey)}</span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};

export default Breadcrumbs;