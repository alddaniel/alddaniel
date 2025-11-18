import React, { useState, useMemo } from 'react';
import { Supplier } from '../types';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { EditIcon, TrashIcon, EyeIcon, SearchIcon, WarningIcon, PlusIcon, UserProfile } from './Icons';
import { Modal } from './Modal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import Breadcrumbs from './Breadcrumbs';
import FloatingActionButton from './FloatingActionButton';
import { validateCNPJ, validateCUIT, validateCPA } from '../services/validationService';
import { fetchBrazilianCompanyData, fetchArgentinianCompanyData } from '../services/cnpjService';
import { fetchBrazilianAddress, fetchArgentinianAddress } from '../services/cepService';
import { maskCNPJ, maskCUIT } from '../services/maskService';

// --- Supplier Form ---
interface SupplierFormProps {
    supplier?: Supplier | null;
    onSave: (supplierData: Omit<Supplier, 'id' | 'companyId'>) => void;
    onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSave, onCancel }) => {
    const { t, locale } = useLocalization();
    const { dispatch } = useAppState();
    const isArgentina = locale.startsWith('es');
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        cnpj: supplier?.cnpj || '',
        contactPerson: supplier?.contactPerson || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        services: supplier?.services.join(', ') || '',
        logoUrl: supplier?.logoUrl || '',
        contactAvatarUrl: supplier?.contactAvatarUrl || '',
        cep: supplier?.cep || '',
        address: supplier?.address || '',
    });
    const [errors, setErrors] = useState<{ cnpj?: string, cep?: string }>({});
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const handleIdentifierChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, '');
        const maskedValue = isArgentina ? maskCUIT(cleanedValue) : maskCNPJ(cleanedValue);
        setFormData(prev => ({ ...prev, cnpj: maskedValue }));
        if (errors.cnpj) setErrors(prev => ({ ...prev, cnpj: undefined }));
    };

    const handleIdentifierBlur = async () => {
        const cleanedIdentifier = formData.cnpj.replace(/\D/g, '');
        setErrors(prev => ({ ...prev, cnpj: undefined }));
        if (!cleanedIdentifier) return;

        let companyData = null;
        dispatch({ type: 'SHOW_LOADING' });
        try {
            if (isArgentina) {
                if (cleanedIdentifier.length === 11) {
                    if (validateCUIT(cleanedIdentifier)) {
                        companyData = await fetchArgentinianCompanyData(cleanedIdentifier);
                        if (!companyData) {
                            setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.cnpjNotFound')}));
                        }
                    } else {
                        setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.invalidCuit')}));
                    }
                } else {
                     setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.invalidCuit')}));
                }
            } else { // Brazil
                if (cleanedIdentifier.length === 14) {
                     if (validateCNPJ(cleanedIdentifier)) {
                        companyData = await fetchBrazilianCompanyData(cleanedIdentifier);
                        if (!companyData) {
                            setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.cnpjNotFound')}));
                        }
                    } else {
                        setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.invalidCnpj')}));
                    }
                } else {
                    setErrors(prev => ({...prev, cnpj: t('suppliers.form.errors.invalidCnpj')}));
                }
            }

            if (companyData) {
                setFormData(prev => ({
                    ...prev,
                    name: companyData.name || prev.name,
                    phone: companyData.phone || prev.phone,
                    email: companyData.email || prev.email,
                    cep: companyData.cep || prev.cep,
                    address: companyData.address || prev.address,
                }));
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.companyDataFetched', type: 'success' } });
            }
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };
    
    const handlePostalCodeBlur = async () => {
        if (!formData.cep) return;
        setErrors(prev => ({ ...prev, cep: undefined }));
        dispatch({ type: 'SHOW_LOADING' });
        try {
            if (isArgentina) {
                if (!validateCPA(formData.cep)) {
                    setErrors(prev => ({ ...prev, cep: t('suppliers.form.errors.invalidCpa') }));
                    return;
                }
                const addressData = await fetchArgentinianAddress(formData.cep);
                if (addressData) {
                    setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}` }));
                } else {
                    setErrors(prev => ({ ...prev, cep: t('suppliers.form.errors.cepNotFound') }));
                }
            } else {
                const cleanedPostalCode = formData.cep.replace(/\D/g, '');
                if (cleanedPostalCode.length === 8) {
                    const addressData = await fetchBrazilianAddress(cleanedPostalCode);
                    if (addressData) {
                        setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}` }));
                    } else {
                        setErrors(prev => ({ ...prev, cep: t('suppliers.form.errors.cepNotFound') }));
                    }
                }
            }
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedIdentifier = formData.cnpj.replace(/\D/g, '');
        
        const isValid = isArgentina ? validateCUIT(cleanedIdentifier) : validateCNPJ(cleanedIdentifier);

        if (!isValid) {
            setErrors({ cnpj: t(isArgentina ? 'suppliers.form.errors.invalidCuit' : 'suppliers.form.errors.invalidCnpj') });
            return;
        }
        setErrors({});
        onSave({ ...formData, services: formData.services.split(',').map(s => s.trim()).filter(Boolean) });
    };

    const identifierLabel = useMemo(() => {
        return t('suppliers.form.cnpj');
    }, [t]);

    const postalCodeLabel = useMemo(() => t('suppliers.form.cep'), [t]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('suppliers.form.companyData')}</legend>
                 <div className="flex items-center gap-4">
                    <UserProfile user={{ name: formData.name, avatarUrl: formData.logoUrl }} className="w-16 h-16 rounded-md" />
                    <button type="button" onClick={() => setIsLogoModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">{t('suppliers.form.uploadLogo')}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('suppliers.form.companyName')}</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{identifierLabel}</label>
                        <input type="text" value={formData.cnpj} onChange={e => handleIdentifierChange(e.target.value)} onBlur={handleIdentifierBlur} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.cnpj ? 'border-red-500' : ''}`} />
                        {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{postalCodeLabel}</label>
                        <input type="text" value={formData.cep} onChange={e => setFormData({ ...formData, cep: e.target.value })} onBlur={handlePostalCodeBlur} className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.cep ? 'border-red-500' : ''}`} />
                         {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">{t('suppliers.form.address')}</label>
                        <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('suppliers.form.contactInfo')}</legend>
                <div className="flex items-center gap-4">
                    <UserProfile user={{ name: formData.contactPerson, avatarUrl: formData.contactAvatarUrl }} className="w-16 h-16" />
                    <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">{t('suppliers.form.changeAvatar')}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('suppliers.form.contactPerson')}</label>
                        <input type="text" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('suppliers.form.email')}</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('suppliers.form.phone')}</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">{t('suppliers.form.services')}</label>
                        <input type="text" value={formData.services} onChange={e => setFormData({ ...formData, services: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                    </div>
                </div>
            </fieldset>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{supplier ? t('common.saveChanges') : t('suppliers.add')}</button>
            </div>
            <AvatarSelectionModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} onSelectAvatar={url => setFormData({ ...formData, logoUrl: url })} />
            <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} onSelectAvatar={url => setFormData({ ...formData, contactAvatarUrl: url })} />
        </form>
    );
};

// --- Main Component ---
const SupplierManagement: React.FC = () => {
    // FIX: Destructure properties from `state` correctly. `currentUser` is nested inside the `state` object.
    const { state, dispatch, hasPermission } = useAppState();
    const { suppliers, currentUser } = state;
    const { t } = useLocalization();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const companySuppliers = useMemo(() => {
        if (!currentUser) return [];
        return hasPermission('MANAGE_ALL_COMPANIES') ? suppliers : suppliers.filter(s => s.companyId === currentUser.companyId);
    }, [suppliers, currentUser, hasPermission]);

    const filteredSuppliers = useMemo(() => {
        return companySuppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [companySuppliers, searchTerm]);

    const handleSaveSupplier = (supplierData: Omit<Supplier, 'id' | 'companyId'>) => {
        if (editingSupplier) {
            const updatedSupplier = { ...editingSupplier, ...supplierData };
            dispatch({ type: 'UPDATE_SUPPLIER', payload: updatedSupplier });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.supplierUpdated', type: 'success' } });
        } else {
            const newSupplier: Supplier = {
                id: `sup-${Date.now()}`,
                companyId: currentUser!.companyId,
                ...supplierData
            };
            dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.supplierAdded', type: 'success' } });
        }
        setIsFormOpen(false);
    };

    const handleDeleteSupplier = () => {
        if (supplierToDelete) {
            dispatch({ type: 'DELETE_SUPPLIER', payload: supplierToDelete.id });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.supplierRemoved', type: 'success' } });
            setSupplierToDelete(null);
        }
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('suppliers.title')}</h1>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('suppliers.searchPlaceholder')} className="pl-10 pr-4 py-2 w-full sm:w-64 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:ring-primary focus:border-primary" />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('suppliers.companyName')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('suppliers.contact')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('suppliers.services')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserProfile user={{ name: supplier.name, avatarUrl: supplier.logoUrl }} className="w-10 h-10 rounded-md" />
                                            <div className="ml-4 font-medium text-gray-900 dark:text-gray-100">{supplier.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{supplier.contactPerson}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {supplier.services.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            {hasPermission('MANAGE_SUPPLIERS') && <button onClick={() => { setEditingSupplier(supplier); setIsFormOpen(true); }} title={t('common.edit')} className="text-gray-400 hover:text-primary"><EditIcon className="w-5 h-5" /></button>}
                                            {hasPermission('DELETE_SUPPLIERS') && <button onClick={() => setSupplierToDelete(supplier)} title={t('common.delete')} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {hasPermission('MANAGE_SUPPLIERS') && <FloatingActionButton label={t('suppliers.add')} icon={PlusIcon} onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }} />}

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingSupplier ? t('suppliers.edit') : t('suppliers.addNew')}>
                <SupplierForm supplier={editingSupplier} onSave={handleSaveSupplier} onCancel={() => setIsFormOpen(false)} />
            </Modal>
            
            <Modal isOpen={!!supplierToDelete} onClose={() => setSupplierToDelete(null)} title={t('suppliers.confirmDelete.header')}>
                <div className="text-center p-4">
                    <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('suppliers.confirmDelete.body', { name: supplierToDelete?.name }) }} />
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setSupplierToDelete(null)} className="px-6 py-2 bg-white border dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                        <button onClick={handleDeleteSupplier} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierManagement;