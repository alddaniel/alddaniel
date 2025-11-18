import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';
import Breadcrumbs from './Breadcrumbs';
import { Company, User, UserRole, Permission, Plan, CompanyHistory } from '../types';
import { Modal } from './Modal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { IconPickerModal } from './IconPickerModal';
import { iconMap, PlusIcon, TrashIcon, EditIcon, UserProfile, WarningIcon, ClockRewindIcon, SearchIcon, BriefcaseIcon, UsersIcon, CustomerIcon, CheckCircleIcon, CloseIcon, WhatsAppIcon, SparklesIcon, LockIcon, KeyIcon } from './Icons';
import { USER_MANAGEABLE_PERMISSIONS, COLLABORATOR_PERMISSIONS, MANAGER_PERMISSIONS, ADMIN_PERMISSIONS, ALL_PERMISSIONS, APPOINTMENT_CATEGORIES } from '../constants';
import * as authService from '../services/authService';
import { validateCNPJ } from '../services/validationService';
import { maskCNPJ } from '../services/maskService';
import { fetchBrazilianCompanyData as fetchCompanyData } from '../services/cnpjService';
import { useLocation } from 'react-router-dom';
import { IconPicker } from './ui/IconPicker';

// --- Tab Navigation ---
type SettingsTab = 'myCompany' | 'users' | 'categories' | 'companies' | 'permissions' | 'plans' | 'systemCustomization' | 'integrations';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        {label}
    </button>
);


// --- My Company Tab ---
const MyCompanyTab: React.FC<{ onEdit: () => void }> = ({ onEdit }) => {
    const { state, hasPermission } = useAppState();
    const { currentUser, companies } = state;
    const { t } = useLocalization();
    
    const myCompany = useMemo(() => companies.find(c => c.id === currentUser?.companyId), [companies, currentUser]);

    if (!myCompany) return <div>{t('common.error')}</div>;
    
    const identifierLabel = useMemo(() => {
        return t('settings.company.cnpj');
    }, [t]);


    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex items-center gap-4">
                    <UserProfile user={{ name: myCompany.name, avatarUrl: myCompany.logoUrl }} className="w-20 h-20 rounded-md" />
                    <div>
                        <h2 className="text-2xl font-bold text-secondary dark:text-gray-100">{myCompany.name}</h2>
                        <p className="text-medium dark:text-gray-400">{myCompany.email}</p>
                    </div>
                </div>
                {hasPermission('MANAGE_COMPANY_INFO') && (
                    <button onClick={onEdit} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover self-start sm:self-auto">
                        <EditIcon className="w-4 h-4" />
                        {t('settings.company.editButton')}
                    </button>
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                <div><strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">{identifierLabel}</strong><span className="text-secondary dark:text-gray-200">{myCompany.cnpj}</span></div>
                <div><strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings.company.phone')}</strong><span className="text-secondary dark:text-gray-200">{myCompany.phone}</span></div>
                <div className="md:col-span-2"><strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('settings.company.address')}</strong><span className="text-secondary dark:text-gray-200">{myCompany.address}</span></div>
            </div>
        </div>
    );
};

// --- Users Tab ---
const UsersTab: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { users, companies, currentUser } = state;
    const { t } = useLocalization();
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const visibleUsers = useMemo(() => {
        if (!currentUser) return [];
        return hasPermission('MANAGE_ALL_USERS') ? users : users.filter(u => u.companyId === currentUser.companyId);
    }, [users, currentUser, hasPermission]);
    
    const handleSaveUser = async (userData: any) => {
        const rolePermissions = userData.role === UserRole.ADMIN ? ADMIN_PERMISSIONS : userData.role === UserRole.MANAGER ? MANAGER_PERMISSIONS : COLLABORATOR_PERMISSIONS;
        
        if (editingUser) {
            const updatedUser = { ...editingUser, ...userData, permissions: editingUser.role !== userData.role ? rolePermissions : editingUser.permissions };
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.userUpdated', type: 'success' } });
        } else {
            const newUser = await authService.adminCreateUser({
                ...userData,
                status: 'pending',
                permissions: rolePermissions
            });
            dispatch({ type: 'ADD_USER', payload: newUser });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.userAddedWithReset', type: 'info' } });
        }
        setIsUserFormOpen(false);
    };

    const handleSendPasswordReset = async (email: string) => {
        dispatch({ type: 'SHOW_LOADING' });
        try {
            await authService.sendPasswordResetEmail(email);
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.passwordResetSent', type: 'success' } });
        } catch (error) {
            console.error(error);
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'common.error', type: 'error' } });
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setEditingUser(null); setIsUserFormOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover"><PlusIcon className="w-4 h-4" />{t('settings.users.add')}</button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.users.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.users.table.role')}</th>
                            {hasPermission('MANAGE_ALL_USERS') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.users.table.company')}</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {visibleUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <UserProfile user={user} className="w-10 h-10" />
                                        <div>
                                            <div className="font-medium text-secondary dark:text-gray-100">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{t(`settings.users.form.roles.${user.role.toLowerCase()}`)}</td>
                                {hasPermission('MANAGE_ALL_USERS') && <td className="px-6 py-4">{companies.find(c => c.id === user.companyId)?.name}</td>}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleSendPasswordReset(user.email)} title={t('settings.users.sendPasswordReset')} className="text-gray-400 hover:text-primary"><KeyIcon className="w-5 h-5"/></button>
                                        <button onClick={() => { setEditingUser(user); setIsUserFormOpen(true); }} className="text-gray-400 hover:text-primary"><EditIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isUserFormOpen && <UserFormModal isOpen={isUserFormOpen} onClose={() => setIsUserFormOpen(false)} onSave={handleSaveUser} user={editingUser} />}
        </div>
    );
};

const UserFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, user: User | null }> = ({ isOpen, onClose, onSave, user }) => {
    const { state, hasPermission } = useAppState();
    const { companies, currentUser } = state;
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || UserRole.COLLABORATOR,
        companyId: user?.companyId || currentUser?.companyId || '',
        avatarUrl: user?.avatarUrl || '',
    });
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? t('settings.users.edit') : t('settings.users.add')}>
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex items-center gap-4">
                    <UserProfile user={{ name: formData.name, avatarUrl: formData.avatarUrl }} className="w-16 h-16" />
                     <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                        {t('settings.users.form.avatar')}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">{t('settings.users.form.fullName')}</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('settings.users.form.email')}</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required readOnly={!!user} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 read-only:bg-gray-100 dark:read-only:bg-gray-700" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('settings.users.form.role')}</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                            <option value={UserRole.COLLABORATOR}>{t('settings.users.form.roles.collaborator')}</option>
                            <option value={UserRole.MANAGER}>{t('settings.users.form.roles.manager')}</option>
                            <option value={UserRole.ADMIN}>{t('settings.users.form.roles.admin')}</option>
                        </select>
                    </div>
                    {hasPermission('MANAGE_ALL_USERS') && <div>
                        <label className="block text-sm font-medium">{t('settings.users.form.company')}</label>
                        <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>}
                </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{t('common.save')}</button>
                </div>
            </form>
            <AvatarSelectionModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSelectAvatar={url => {
                    setFormData({...formData, avatarUrl: url});
                    setIsAvatarModalOpen(false);
                }}
            />
        </Modal>
    );
}

// --- Company Management Tab ---
const CompaniesManagementTab: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t } = useLocalization();
    const { companies, users, plans } = state;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
    const [viewingHistoryCompany, setViewingHistoryCompany] = useState<Company | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = useMemo(() => {
        return companies.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.cnpj.includes(searchTerm)
        );
    }, [companies, searchTerm]);

    const handleSaveCompany = async (companyData: any, adminUserData: any) => {
        if (editingCompany) {
            dispatch({ type: 'UPDATE_COMPANY', payload: { company: {...editingCompany, ...companyData}, reason: companyData.reasonForChange } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyUpdated', type: 'success' } });
        } else {
            const newCompanyId = `company-${Date.now()}`;
            const newCompany: Company = {
                id: newCompanyId,
                ...companyData,
                history: []
            };
            const newAdmin = await authService.adminCreateUser({
                ...adminUserData,
                companyId: newCompanyId,
                role: UserRole.ADMIN,
                permissions: ADMIN_PERMISSIONS, 
                status: 'pending'
            });
            dispatch({ type: 'ADD_COMPANY', payload: { company: newCompany, adminUser: newAdmin } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyAdded', type: 'success' } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.userAddedWithReset', type: 'info' } });
        }
        setIsFormOpen(false);
    };
    
    const handleDeleteCompany = () => {
        if(companyToDelete) {
             if (companyToDelete.id === 'company-1') {
                alert(t('settings.companies.deleteWarning'));
                setCompanyToDelete(null);
                return;
            }
            dispatch({ type: 'DELETE_COMPANY', payload: companyToDelete.id });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyRemoved', type: 'success' } });
            setCompanyToDelete(null);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('settings.companies.searchPlaceholder')} className="pl-10 pr-4 py-2 w-full sm:w-64 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-primary focus:border-primary" />
                </div>
                <button onClick={() => { setEditingCompany(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">
                    <PlusIcon className="w-4 h-4" />{t('settings.companies.add')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.table.name')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCompanies.map(company => (
                            <tr key={company.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-secondary dark:text-gray-100">{company.name}</div>
                                    <div className="text-sm text-gray-500">{company.cnpj}</div>
                                </td>
                                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{t(`companyStatus.${company.status}`)}</span></td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <button onClick={() => setViewingHistoryCompany(company)} title={t('settings.companies.historyTab')}><ClockRewindIcon className="w-5 h-5 text-gray-400 hover:text-primary"/></button>
                                    <button onClick={() => { setEditingCompany(company); setIsFormOpen(true); }} title={t('common.edit')} className="text-gray-400 hover:text-primary"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setCompanyToDelete(company)} title={t('common.delete')} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isFormOpen && <CompanyManagementFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveCompany} company={editingCompany} plans={plans} />}
             {viewingHistoryCompany && <CompanyHistoryModal company={viewingHistoryCompany} users={users} onClose={() => setViewingHistoryCompany(null)} />}
             <Modal isOpen={!!companyToDelete} onClose={() => setCompanyToDelete(null)} title={t('settings.companies.confirmDeleteTitle')}>
                <div className="text-center p-4">
                    <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('settings.companies.confirmDelete', { name: companyToDelete?.name }) }} />
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setCompanyToDelete(null)} className="px-6 py-2 bg-white border dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                        <button onClick={handleDeleteCompany} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const CompanyHistoryModal: React.FC<{ company: Company, users: User[], onClose: () => void }> = ({ company, users, onClose }) => {
    const { t } = useLocalization();
    return (
        <Modal isOpen={true} onClose={onClose} title={`${t('settings.companies.historyTab')}: ${company.name}`}>
            {(company.history || []).length > 0 ? (
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.historyTable.date')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.historyTable.changedBy')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.historyTable.newStatus')}</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('settings.companies.historyTable.reason')}</th></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {company.history?.map((entry, idx) => {
                            const user = users.find(u => u.id === entry.changedById);
                            return (
                                <tr key={idx}>
                                    <td className="px-6 py-4">{new Date(entry.changedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4">{user?.name || 'Sistema'}</td>
                                    <td className="px-6 py-4" dangerouslySetInnerHTML={{ __html: t('settings.companies.history.changedStatus', { old: t(`companyStatus.${entry.oldStatus}`), new: t(`companyStatus.${entry.newStatus}`) }) }}></td>
                                    <td className="px-6 py-4">{entry.reason}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            ) : <p>{t('settings.companies.noHistory')}</p>}
        </Modal>
    );
};

const CompanyManagementFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (companyData: any, adminUserData?: any) => void, company: Company | null, plans: Plan[] }> = ({ isOpen, onClose, onSave, company, plans }) => {
    const { t } = useLocalization();
    const { hasPermission, dispatch } = useAppState();

    const getTrialDays = (trialDate: Date | null): number => {
        if (!trialDate) return 30;
        const remaining = Math.ceil((new Date(trialDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return remaining > 0 ? remaining : 30;
    };

    const [formData, setFormData] = useState({
        name: company?.name || '',
        cnpj: company?.cnpj || '',
        address: company?.address || '',
        phone: company?.phone || '',
        email: company?.email || '',
        logoUrl: company?.logoUrl || '',
        cep: company?.cep || '',
        status: company?.status || 'active',
        planId: company?.planId || plans[0]?.id || '',
        trialDuration: getTrialDays(company?.trialEndsAt || null),
        reasonForChange: '',
    });
    const [adminData, setAdminData] = useState({ name: '', email: '' });
    const [isCnpjLoading, setIsCnpjLoading] = useState(false);
    const [cnpjError, setCnpjError] = useState('');
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

    const companyPlan = useMemo(() => plans.find(p => p.id === formData.planId), [plans, formData.planId]);
    const canChangeLogo = useMemo(() => (companyPlan?.allowBranding ?? false) || hasPermission('MANAGE_ALL_COMPANIES'), [companyPlan, hasPermission]);
    
    const identifierLabel = useMemo(() => {
        return t('settings.company.cnpj');
    }, [t]);

    const handleCnpjChange = (value: string) => {
        const maskedValue = maskCNPJ(value);
        setFormData(prev => ({...prev, cnpj: maskedValue}));
        if (cnpjError) setCnpjError('');
    };


    const handleCnpjBlur = async () => {
        const cleanedCnpj = formData.cnpj.replace(/\D/g, '');
        setCnpjError('');
    
        if (!cleanedCnpj) return;
    
        if (cleanedCnpj.length !== 14 || !validateCNPJ(cleanedCnpj)) {
            setCnpjError(t('suppliers.form.errors.invalidCnpj'));
            return;
        }
    
        dispatch({ type: 'SHOW_LOADING' });
        setIsCnpjLoading(true);
        try {
            const companyData = await fetchCompanyData(cleanedCnpj);
            if (companyData) {
                setFormData(prev => ({
                    ...prev,
                    name: companyData.name || prev.name,
                    address: companyData.address || prev.address,
                    phone: companyData.phone || prev.phone,
                    email: companyData.email || prev.email,
                    cep: companyData.cep || prev.cep,
                }));
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyDataFetched', type: 'success' } });
            } else {
                setCnpjError(t('suppliers.form.errors.cnpjNotFound'));
            }
        } finally {
            setIsCnpjLoading(false);
            dispatch({ type: 'HIDE_LOADING' });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { trialDuration, ...restOfData } = formData;
        const dataToSend: any = { ...restOfData };
        
        if (formData.status === 'trial') {
            dataToSend.trialEndsAt = new Date(Date.now() + formData.trialDuration * 24 * 60 * 60 * 1000);
        } else {
            dataToSend.trialEndsAt = null;
        }
        
        onSave(dataToSend, company ? undefined : adminData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={company ? t('settings.companies.edit') : t('settings.companies.add')}>
           <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                    <legend className="text-lg font-semibold px-2">{t('settings.companies.detailsTab')}</legend>
                    <div className="flex items-center gap-4">
                        <UserProfile user={{ name: formData.name, avatarUrl: formData.logoUrl }} className="w-16 h-16 rounded-md" />
                        {canChangeLogo && (
                             <button type="button" onClick={() => setIsLogoModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                                {t('settings.company.changeLogo')}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t('settings.company.name')}</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                        <div>
                            <label className="block text-sm font-medium">{identifierLabel}</label>
                            <input type="text" value={formData.cnpj} onChange={e => handleCnpjChange(e.target.value)} onBlur={handleCnpjBlur} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${cnpjError ? 'border-red-500' : ''}`} />
                            {isCnpjLoading && <p className="text-blue-500 text-xs mt-1">Buscando...</p>}
                            {cnpjError && <p className="text-red-500 text-xs mt-1">{cnpjError}</p>}
                        </div>
                        <div><label className="block text-sm font-medium">{t('settings.company.phone')}</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                        <div><label className="block text-sm font-medium">{t('settings.company.contactEmail')}</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium">{t('settings.company.address')}</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                         <div><label className="block text-sm font-medium">{t('settings.companies.table.plan')}</label><select value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                        {company ? (
                            <div>
                                <label className="block text-sm font-medium">{t('settings.companies.table.status')}</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                                    {['active', 'trial', 'suspended'].map(s => <option key={s} value={s}>{t(`companyStatus.${s}`)}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-end pb-2">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={formData.status === 'trial'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'trial' : 'active' })} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.companies.enableTrial')}</span>
                                </label>
                            </div>
                        )}
                        {formData.status === 'trial' && (
                            <div>
                                <label className="block text-sm font-medium">{t('settings.companies.trialDuration')}</label>
                                <input type="number" min="1" value={formData.trialDuration} onChange={e => setFormData({...formData, trialDuration: Number(e.target.value)})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/>
                            </div>
                        )}
                         {company && company.status !== formData.status && (
                             <div className="md:col-span-2"><label className="block text-sm font-medium">{t('settings.companies.reasonForChange')}</label><input type="text" value={formData.reasonForChange} onChange={e => setFormData({...formData, reasonForChange: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                         )}
                    </div>
                </fieldset>
                {!company && (
                    <fieldset className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                        <legend className="text-lg font-semibold px-2">{t('settings.companies.adminInfo')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium">{t('settings.users.form.fullName')}</label><input type="text" value={adminData.name} onChange={e => setAdminData({...adminData, name: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                            <div><label className="block text-sm font-medium">{t('settings.users.form.email')}</label><input type="email" value={adminData.email} onChange={e => setAdminData({...adminData, email: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>
                        </div>
                    </fieldset>
                )}
                <div className="flex justify-end gap-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t('common.cancel')}</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">{t('common.save')}</button></div>
           </form>
           <AvatarSelectionModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} onSelectAvatar={url => setFormData({...formData, logoUrl: url})} />
        </Modal>
    );
};


const PermissionsTab: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t } = useLocalization();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        if (selectedUserId) {
            const user = state.users.find(u => u.id === selectedUserId);
            setUserPermissions(user?.permissions || []);
        } else {
            setUserPermissions([]);
        }
    }, [selectedUserId, state.users]);

    const handleTogglePermission = (permission: Permission) => {
        setUserPermissions(prev => prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]);
    };

    const handleSave = () => {
        if (selectedUserId) {
            dispatch({ type: 'UPDATE_USER_PERMISSIONS', payload: { userId: selectedUserId, permissions: userPermissions } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.permissionsSaved', type: 'success' } });
        }
    };

    const permissionGroups = {
        dashboard: ['VIEW_DASHBOARD'],
        customers: ['VIEW_CUSTOMERS', 'MANAGE_CUSTOMERS', 'DELETE_CUSTOMERS'],
        suppliers: ['VIEW_SUPPLIERS', 'MANAGE_SUPPLIERS', 'DELETE_SUPPLIERS'],
        agenda: ['VIEW_AGENDA', 'MANAGE_AGENDA'],
        reports: ['VIEW_REPORTS'],
        settings: ['VIEW_SETTINGS', 'MANAGE_COMPANY_INFO', 'MANAGE_USERS', 'MANAGE_CATEGORIES'],
        superAdmin: ['MANAGE_ALL_USERS', 'MANAGE_PLANS']
    };

    const selectedUser = state.users.find(u => u.id === selectedUserId);

    return (
        <div>
            <select onChange={e => setSelectedUserId(e.target.value || null)} className="mb-4 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                <option value="">{t('settings.permissions.selectUser')}</option>
                {state.users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
            </select>

            {selectedUser ? (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">{t('settings.permissions.editingFor', { name: selectedUser.name })}</h3>
                    {Object.entries(permissionGroups).map(([group, permissions]) => (
                        <fieldset key={group} className="border dark:border-gray-700 p-4 rounded-lg">
                            <legend className="font-semibold px-2 text-lg text-secondary dark:text-gray-200">{t(`settings.permissions.groups.${group}`)}</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                {(permissions as Permission[]).map(permission => (
                                     <label key={permission} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                        <input
                                            type="checkbox"
                                            checked={userPermissions.includes(permission)}
                                            onChange={() => handleTogglePermission(permission)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{t(`settings.permissions.descriptions.${permission}`, {defaultValue: permission})}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                    <div className="flex justify-end">
                        <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-hover">{t('settings.permissions.save')}</button>
                    </div>
                </div>
            ) : <p className="text-center text-gray-500 py-8">{t('settings.permissions.selectUserPrompt')}</p>}
        </div>
    );
};

// --- Plans Tab ---
const PlanCard: React.FC<{
    plan: Plan;
    isCurrent: boolean;
    onEdit: () => void;
    onDelete: () => void;
    canManage: boolean;
}> = ({ plan, isCurrent, onEdit, onDelete, canManage }) => {
    const { t } = useLocalization();

    return (
        <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 ${isCurrent ? 'border-2 border-primary' : 'border-2 border-transparent dark:border-gray-700'}`}>
            {isCurrent && (
                <div className="absolute top-0 right-0 mt-4 mr-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {t('settings.plans.currentPlan')}
                </div>
            )}
            <h3 className="text-xl font-bold text-secondary dark:text-gray-100">{plan.name}</h3>
            <div className="my-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-secondary dark:text-gray-100">${plan.price.toFixed(2)}</span>
                <span className="ml-1 text-lg font-medium text-gray-500 dark:text-gray-400">{t('settings.plans.perMonth')}</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 flex-grow">
                <li className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <span>{t('settings.plans.userLimit', { count: plan.userLimit })}</span>
                </li>
                <li className="flex items-center gap-3">
                    <CustomerIcon className="w-5 h-5 text-primary" />
                    <span>{t('settings.plans.customerLimit', { count: plan.customerLimit })}</span>
                </li>
                <li className="flex items-center gap-3">
                    {plan.hasWhatsApp ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CloseIcon className="w-5 h-5 text-red-500" />}
                    <span>{t('settings.plans.features.whatsApp')}</span>
                </li>
                 <li className="flex items-center gap-3">
                    {plan.hasAI ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CloseIcon className="w-5 h-5 text-red-500" />}
                    <span>{t('settings.plans.features.ai')}</span>
                </li>
                 <li className="flex items-center gap-3">
                    {plan.allowBranding ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CloseIcon className="w-5 h-5 text-red-500" />}
                    <span>{t('settings.plans.features.branding')}</span>
                </li>
            </ul>
            {canManage && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <button onClick={onEdit} className="flex-1 text-center bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        {t('common.edit')}
                    </button>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};


const PlansTab: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { plans, companies, currentUser } = state;
    const { t } = useLocalization();
    const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

    const canManagePlans = hasPermission('MANAGE_PLANS');
    const myCompany = useMemo(() => companies.find(c => c.id === currentUser?.companyId), [companies, currentUser]);

    const handleSavePlan = (planData: Omit<Plan, 'id'>) => {
        if (editingPlan) {
            dispatch({ type: 'UPDATE_PLAN', payload: { ...editingPlan, ...planData } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.planUpdated', type: 'success' } });
        } else {
            dispatch({ type: 'ADD_PLAN', payload: { id: `plan-${Date.now()}`, ...planData } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.planAdded', type: 'success' } });
        }
        setIsPlanFormOpen(false);
    };

    const handleDeletePlan = () => {
        if (planToDelete) {
            const isPlanInUse = state.companies.some(c => c.planId === planToDelete.id);
            dispatch({ type: 'DELETE_PLAN', payload: planToDelete.id });
            if (!isPlanInUse) {
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.planRemoved', type: 'success' } });
            }
            setPlanToDelete(null);
        }
    };
    
    const openAddForm = () => {
        setEditingPlan(null);
        setIsPlanFormOpen(true);
    };

    return (
        <div>
            {canManagePlans && (
                <div className="flex justify-end mb-6">
                    <button onClick={openAddForm} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">
                        <PlusIcon className="w-4 h-4" />{t('settings.plans.add')}
                    </button>
                </div>
            )}
            
            {plans.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <PlanCard 
                            key={plan.id}
                            plan={plan}
                            isCurrent={!canManagePlans && myCompany?.planId === plan.id}
                            onEdit={() => { setEditingPlan(plan); setIsPlanFormOpen(true); }}
                            onDelete={() => setPlanToDelete(plan)}
                            canManage={canManagePlans}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-200">{t('settings.plans.noPlansTitle')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('settings.plans.noPlansDescription')}</p>
                    {canManagePlans && (
                        <div className="mt-6">
                            <button onClick={openAddForm} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover">
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                {t('settings.plans.createFirstPlan')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isPlanFormOpen && <PlanFormModal isOpen={isPlanFormOpen} onClose={() => setIsPlanFormOpen(false)} onSave={handleSavePlan} plan={editingPlan} />}
            
            <Modal isOpen={!!planToDelete} onClose={() => setPlanToDelete(null)} title={t('settings.plans.confirmDeleteTitle')}>
                <div className="text-center p-4">
                    <p className="text-gray-600 dark:text-gray-300">{t('settings.plans.confirmDeleteBody', { name: planToDelete?.name })}</p>
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setPlanToDelete(null)} className="px-6 py-2 bg-white border dark:bg-gray-700 dark:border-gray-600 rounded-md">{t('common.cancel')}</button>
                        <button onClick={handleDeletePlan} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const PlanFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Plan, 'id'>) => void;
    plan: Plan | null;
}> = ({ isOpen, onClose, onSave, plan }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: plan?.name || '',
        price: plan?.price || 0,
        userLimit: plan?.userLimit || 1,
        customerLimit: plan?.customerLimit || 10,
        hasWhatsApp: plan?.hasWhatsApp || false,
        hasAI: plan?.hasAI || false,
        allowBranding: plan?.allowBranding || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const FeatureToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; icon: React.FC<any> }> = ({ label, checked, onChange, icon: Icon }) => (
        <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${checked ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${checked ? 'text-primary' : 'text-gray-400'}`} />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{label}</span>
            </div>
            <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        </label>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={plan ? t('settings.plans.edit') : t('settings.plans.addNew')}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('settings.plans.form.name')}</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('settings.plans.form.price')}</label>
                        <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('settings.plans.form.userLimit')}</label>
                        <input type="number" min="1" value={formData.userLimit} onChange={e => setFormData({...formData, userLimit: parseInt(e.target.value, 10) || 1})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('settings.plans.form.customerLimit')}</label>
                        <input type="number" min="1" value={formData.customerLimit} onChange={e => setFormData({...formData, customerLimit: parseInt(e.target.value, 10) || 1})} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                </div>
                <div className="space-y-3">
                    <FeatureToggle label={t('settings.plans.form.hasWhatsApp')} icon={WhatsAppIcon} checked={formData.hasWhatsApp} onChange={checked => setFormData({...formData, hasWhatsApp: checked})} />
                    <FeatureToggle label={t('settings.plans.form.hasAI')} icon={SparklesIcon} checked={formData.hasAI} onChange={checked => setFormData({...formData, hasAI: checked})} />
                    <FeatureToggle label={t('settings.plans.form.allowBranding')} icon={LockIcon} checked={formData.allowBranding} onChange={checked => setFormData({...formData, allowBranding: checked})} />
                </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{t('common.save')}</button>
                </div>
            </form>
        </Modal>
    );
};

// --- System Customization ---
const SystemCustomizationTab: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t } = useLocalization();
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

    const handleSelectLogo = (url: string) => {
        dispatch({ type: 'UPDATE_SYSTEM_LOGO', payload: url });
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.systemLogoUpdated', type: 'success' }});
        setIsLogoModalOpen(false);
    };

    const handleRemoveLogo = () => {
        if (window.confirm("Are you sure you want to remove the system logo?")) {
            dispatch({ type: 'REMOVE_SYSTEM_LOGO' });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.systemLogoRemoved', type: 'info' }});
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary dark:text-gray-100">{t('settings.customization.title')}</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-secondary dark:text-gray-200">{t('settings.customization.logoTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.customization.logoDescription')}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border-2 border-dashed dark:border-gray-600 rounded-lg">
                    {state.systemLogoUrl ? (
                        <img src={state.systemLogoUrl} alt="System Logo" className="max-w-xs h-auto max-h-16 object-contain bg-gray-100 dark:bg-gray-700 p-2 rounded-md" />
                    ) : (
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 text-sm">
                            {t('settings.customization.noLogo')}
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsLogoModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">{t('settings.customization.changeLogo')}</button>
                        {state.systemLogoUrl && (
                             <button onClick={handleRemoveLogo} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">{t('settings.customization.removeLogo')}</button>
                        )}
                    </div>
                </div>
            </div>
            <AvatarSelectionModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} onSelectAvatar={handleSelectLogo} />
        </div>
    );
};

// --- Categories Tab ---
const CategoriesTab: React.FC = () => {
    const { state, dispatch } = useAppState();
    const { t } = useLocalization();
    // FIX: Explicitly type the localCategories state to resolve multiple 'property does not exist on type unknown' errors.
    // This ensures that values from localCategories are correctly typed as objects with name, color, and icon properties.
    const [localCategories, setLocalCategories] = useState<Record<string, { name?: string; color: string; icon: string; }>>(state.appointmentCategoryConfig);
    const [errors, setErrors] = useState<string[]>([]);
    const originalKeys = Object.values(APPOINTMENT_CATEGORIES);

    const handleUpdate = (key: string, field: 'name' | 'color' | 'icon', value: string) => {
        setLocalCategories(prev => ({
            ...prev,
            [key]: { ...(prev[key] as object), [field]: value }
        }));
    };

    const handleAddNew = () => {
        const newKey = `CUSTOM_${Date.now()}`;
        setLocalCategories(prev => ({
            ...prev,
            [newKey]: { name: t('settings.categories.new'), color: '#cccccc', icon: 'TagIcon' }
        }));
    };

    const handleDelete = (key: string) => {
        if (Object.keys(localCategories).length <= 1) {
            alert(t('settings.categories.deleteWarning'));
            return;
        }
        if (window.confirm(t('settings.categories.confirmDelete', { name: (localCategories[key] as any)?.name || key }))) {
            setLocalCategories(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        }
    };

    const handleSaveChanges = () => {
        const currentErrors: string[] = [];
        const names = new Set();
        Object.entries(localCategories).forEach(([key, value]) => {
            const categoryValue = value as { name?: string };
            if (!categoryValue.name || categoryValue.name.trim() === '') {
                currentErrors.push(t('settings.categories.errors.emptyName'));
            }
            if (names.has(categoryValue.name)) {
                currentErrors.push(t('settings.categories.errors.duplicateName', { name: categoryValue.name! }));
            }
            names.add(categoryValue.name);
        });

        if (currentErrors.length > 0) {
            setErrors([...new Set(currentErrors)]);
            return;
        }

        setErrors([]);
        dispatch({ type: 'UPDATE_CATEGORY_CONFIG', payload: localCategories });
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.categoriesSaved', type: 'success' } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-secondary dark:text-gray-100">{t('settings.categories.title')}</h2>
                <div className="flex gap-2">
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">
                        <PlusIcon className="w-4 h-4" />
                        {t('settings.categories.new')}
                    </button>
                    <button onClick={handleSaveChanges} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">
                        {t('settings.categories.save')}
                    </button>
                </div>
            </div>
            {errors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600 px-4 py-3 rounded space-y-1">
                    {errors.map((error, i) => <p key={i}>{error}</p>)}
                </div>
            )}
            <div className="space-y-4">
                {Object.entries(localCategories).map(([key, config]) => {
                    const isDefault = originalKeys.includes(key);
                    const typedConfig = config as { name?: string; color: string; icon: string; };
                    return (
                        <div key={key} className="flex flex-col md:flex-row items-center gap-3 p-3 border dark:border-gray-700 rounded-lg">
                            <IconPicker value={typedConfig.icon} onChange={(icon) => handleUpdate(key, 'icon', icon)} />
                            <input type="color" value={typedConfig.color} onChange={(e) => handleUpdate(key, 'color', e.target.value)} className="w-12 h-12 p-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md cursor-pointer" />
                            <input type="text" value={typedConfig.name || t(`appointment.category.${key}`)} onChange={(e) => handleUpdate(key, 'name', e.target.value)}
                                readOnly={isDefault}
                                title={isDefault ? t('settings.categories.tooltips.cannotEditName') : ''}
                                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary read-only:bg-gray-100 dark:read-only:bg-gray-700 read-only:cursor-not-allowed"
                            />
                            <button onClick={() => handleDelete(key)} disabled={isDefault} title={isDefault ? t('settings.categories.tooltips.cannotDelete') : ''} className="text-gray-400 hover:text-red-500 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed">
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- Integrations Tab ---
const IntegrationsTab: React.FC = () => {
    const { t } = useLocalization();
    const { dispatch } = useAppState();
    const [whatsAppPhoneId, setWhatsAppPhoneId] = useState(() => localStorage.getItem('wa_phone_id') || '');
    const [whatsAppToken, setWhatsAppToken] = useState(() => localStorage.getItem('wa_access_token') || '');

    const handleSave = () => {
        localStorage.setItem('wa_phone_id', whatsAppPhoneId);
        localStorage.setItem('wa_access_token', whatsAppToken);
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'settings.integrations.savedSuccess', type: 'success' } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary dark:text-gray-100">{t('settings.integrations.title')}</h2>
            <p className="text-medium dark:text-gray-400">{t('settings.integrations.description')}</p>
            
            <div className="p-6 border dark:border-gray-700 rounded-lg space-y-4">
                 <h3 className="text-xl font-semibold text-secondary dark:text-gray-200 flex items-center gap-2">
                    <WhatsAppIcon className="w-6 h-6 text-green-500" />
                    WhatsApp Cloud API
                </h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.integrations.whatsApp.phoneId')}</label>
                    <input type="text" value={whatsAppPhoneId} onChange={e => setWhatsAppPhoneId(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.integrations.whatsApp.token')}</label>
                    <input type="password" value={whatsAppToken} onChange={e => setWhatsAppToken(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/>
                </div>
                 <div className="flex justify-end">
                    <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover">
                        {t('common.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const Settings: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { t } = useLocalization();
    const location = useLocation();

    const initialTab = (location.state as { tab?: SettingsTab })?.tab || 'myCompany';
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
    const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);

    const handleSaveCompany = (companyData: any) => {
        const { reasonForChange, ...data } = companyData;
        dispatch({ type: 'UPDATE_COMPANY', payload: { company: data, reason: reasonForChange } });
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyUpdated', type: 'success' } });
        setIsCompanyFormOpen(false);
    };
    
    const tabs = useMemo(() => {
        const availableTabs: { key: SettingsTab; label: string; permission?: Permission }[] = [
            { key: 'myCompany', label: t('settings.tabs.myCompany') },
        ];
        if (hasPermission('MANAGE_USERS')) {
            availableTabs.push({ key: 'users', label: t('settings.tabs.users') });
        }
         if (hasPermission('MANAGE_CATEGORIES')) {
            availableTabs.push({ key: 'categories', label: t('settings.tabs.categories') });
        }
        availableTabs.push({ key: 'integrations', label: t('settings.tabs.integrations') });

        if (hasPermission('MANAGE_ALL_COMPANIES')) {
             availableTabs.push({ key: 'companies', label: t('settings.tabs.companies') });
             availableTabs.push({ key: 'plans', label: t('settings.tabs.plans'), permission: 'MANAGE_PLANS' });
             availableTabs.push({ key: 'permissions', label: t('settings.tabs.permissions'), permission: 'MANAGE_PERMISSIONS' });
             availableTabs.push({ key: 'systemCustomization', label: t('settings.tabs.systemCustomization'), permission: 'MANAGE_ALL_COMPANIES' });
        }
        
        return availableTabs.filter(tab => !tab.permission || hasPermission(tab.permission));
    }, [t, hasPermission]);
    
    useEffect(() => {
        if (!tabs.some(t => t.key === initialTab)) {
            setActiveTab(tabs[0]?.key || 'myCompany');
        }
    }, [tabs, initialTab]);


    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">{t('settings.title')}</h1>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => <TabButton key={tab.key} label={tab.label} isActive={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />)}
                </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {activeTab === 'myCompany' && <MyCompanyTab onEdit={() => setIsCompanyFormOpen(true)} />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'categories' && hasPermission('MANAGE_CATEGORIES') && <CategoriesTab />}
                {activeTab === 'integrations' && <IntegrationsTab />}
                {activeTab === 'companies' && hasPermission('MANAGE_ALL_COMPANIES') && <CompaniesManagementTab />}
                {activeTab === 'permissions' && hasPermission('MANAGE_PERMISSIONS') && <PermissionsTab />}
                {activeTab === 'plans' && hasPermission('MANAGE_PLANS') && <PlansTab />}
                {activeTab === 'systemCustomization' && hasPermission('MANAGE_ALL_COMPANIES') && <SystemCustomizationTab />}
            </div>

            {isCompanyFormOpen && <CompanyManagementFormModal isOpen={isCompanyFormOpen} onClose={() => setIsCompanyFormOpen(false)} onSave={handleSaveCompany} company={state.companies.find(c => c.id === state.currentUser?.companyId) || null} plans={state.plans} />}
        </div>
    );
};

export default Settings;