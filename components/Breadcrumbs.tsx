import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { navItems } from '../constants';
import { ChevronRightIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAppState } from '../state/AppContext';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const { t } = useLocalization();
    const { state } = useAppState();
    
    const pathParts = location.pathname.split('/').filter(p => p);

    if (pathParts.length === 0 && location.pathname !== '/') {
        return null;
    }

    const crumbs = [
        <li key="home">
            <div className="flex items-center">
                <Link to="/" className="font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                    {t('sidebar.dashboard')}
                </Link>
            </div>
        </li>
    ];

    if (pathParts.length > 0) {
        const currentTopLevel = navItems.find(item => `/${pathParts[0]}` === item.path);

        if (currentTopLevel) {
            crumbs.push(
                <li key={currentTopLevel.path}>
                    <div className="flex items-center">
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        {pathParts.length > 1 ? (
                             <Link to={currentTopLevel.path} className="ml-1 font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                                {t(currentTopLevel.nameKey)}
                            </Link>
                        ) : (
                            <span className="ml-1 font-medium text-gray-500 dark:text-gray-400">{t(currentTopLevel.nameKey)}</span>
                        )}
                    </div>
                </li>
            );
        }

        if (pathParts[0] === 'customers' && pathParts[1]) {
            const customer = state.customers.find(c => c.id === pathParts[1]);
            if (customer) {
                crumbs.push(
                    <li key={customer.id}>
                        <div className="flex items-center">
                            <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <span className="ml-1 font-medium text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">{customer.name}</span>
                        </div>
                    </li>
                );
            }
        }
    }


    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 text-sm">
                {crumbs}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;