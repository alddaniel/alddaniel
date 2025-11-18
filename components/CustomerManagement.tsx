import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Appointment } from '../types';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { EditIcon, TrashIcon, EyeIcon, SearchIcon, WarningIcon, PlusIcon, UserProfile } from './Icons';
import { Modal } from './Modal';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import Breadcrumbs from './Breadcrumbs';
import FloatingActionButton from './FloatingActionButton';
import { validateCPF, validateCNPJ, validateDNI, validateCUIT, validateCPA } from '../services/validationService';
import { fetchBrazilianAddress, fetchArgentinianAddress } from '../services/cepService';
import { fetchBrazilianCompanyData, fetchArgentinianCompanyData } from '../services/cnpjService';
import { maskCPF, maskCNPJ, maskCUIT } from '../services/maskService';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Customer Form ---
interface CustomerFormProps {
    customer?: Customer | null;
    onSave: (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'>) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
    const { t, locale } = useLocalization();
    const { dispatch } = useAppState();
    const isArgentina = locale.startsWith('es');
    const [formData, setFormData] = useState({
        name: customer?.name || '',
        type: customer?.type || 'Company',
        identifier: customer?.identifier || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        cep: customer?.cep || '',
        address: customer?.address || '',
        status: customer?.status || 'Active',
        avatarUrl: customer?.avatarUrl || '',
    });
    const [errors, setErrors] = useState<{ identifier?: string, cep?: string }>({});
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const handleIdentifierChange = (value: string) => {
        const cleanedValue = value.replace(/\D/g, '');
        let maskedValue = value;

        if (isArgentina) {
            if (formData.type === 'Company') { // CUIT
                maskedValue = maskCUIT(cleanedValue);
            } else { // Individual (DNI)
                maskedValue = cleanedValue.substring(0, 8);
            }
        } else { // Brazil
             if (formData.type === 'Company') { // CNPJ
                maskedValue = maskCNPJ(cleanedValue);
            } else { // Individual (CPF)
                maskedValue = maskCPF(cleanedValue);
            }
        }

        setFormData(prev => ({ ...prev, identifier: maskedValue }));
        if (errors.identifier) setErrors(prev => ({ ...prev, identifier: undefined }));
    };

    const handleIdentifierBlur = async () => {
        if (formData.type !== 'Company') return; // Only for companies

        const cleanedIdentifier = formData.identifier.replace(/\D/g, '');
        setErrors(prev => ({ ...prev, identifier: undefined }));
        if (!cleanedIdentifier) return;

        let companyData = null;
        dispatch({ type: 'SHOW_LOADING' });
        try {
            if (isArgentina) {
                if (validateCUIT(cleanedIdentifier)) {
                    companyData = await fetchArgentinianCompanyData(cleanedIdentifier);
                    if (!companyData) {
                        setErrors(prev => ({...prev, identifier: t('suppliers.form.errors.cnpjNotFound')}));
                    }
                } else {
                    setErrors(prev => ({...prev, identifier: t('customers.form.errors.invalidCuit')}));
                }
            } else { // Brazil
                if (validateCNPJ(cleanedIdentifier)) {
                    companyData = await fetchBrazilianCompanyData(cleanedIdentifier);
                     if (!companyData) {
                        setErrors(prev => ({...prev, identifier: t('suppliers.form.errors.cnpjNotFound')}));
                    }
                } else {
                    setErrors(prev => ({...prev, identifier: t('customers.form.errors.invalidCnpj')}));
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
                    setErrors(prev => ({ ...prev, cep: t('customers.form.errors.invalidCpa') }));
                    return;
                }
                const addressData = await fetchArgentinianAddress(formData.cep);
                if (addressData) {
                    setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}` }));
                } else {
                    setErrors(prev => ({ ...prev, cep: t('customers.form.errors.cepNotFound') }));
                }
            } else {
                const cleanedPostalCode = formData.cep.replace(/\D/g, '');
                if (cleanedPostalCode.length === 8) {
                    const addressData = await fetchBrazilianAddress(cleanedPostalCode);
                    if (addressData) {
                        setFormData(prev => ({ ...prev, address: `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}` }));
                    } else {
                        setErrors(prev => ({ ...prev, cep: t('customers.form.errors.cepNotFound') }));
                    }
                }
            }
        } finally {
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newErrors: { identifier?: string } = {};

        const identifierValue = formData.identifier.replace(/\D/g, '');
        
        if (isArgentina) {
             if (formData.type === 'Individual' && !validateDNI(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidDni');
            } else if (formData.type === 'Company' && !validateCUIT(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCuit');
            }
        } else {
            if (formData.type === 'Individual' && !validateCPF(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCpf');
            } else if (formData.type === 'Company' && !validateCNPJ(identifierValue)) {
                newErrors.identifier = t('customers.form.errors.invalidCnpj');
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave({ ...formData, identifier: identifierValue });
    };
    
    const identifierLabel = useMemo(() => {
        return formData.type === 'Company' ? t('customers.form.cnpj') : t('customers.form.cpf');
    }, [formData.type, t]);

    const postalCodeLabel = useMemo(() => t('customers.form.cep'), [t]);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
                <UserProfile user={{ name: formData.name, avatarUrl: formData.avatarUrl }} className="w-16 h-16" />
                <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                    {t('customers.form.changeAvatar')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{formData.type === 'Company' ? t('customers.form.companyName') : t('customers.form.fullName')}</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.email')}</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.type')}</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'Individual' | 'Company', identifier: '' })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                        <option value="Company">{t('customers.typeCompany')}</option>
                        <option value="Individual">{t('customers.typePerson')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{identifierLabel}</label>
                    <input type="text" value={formData.identifier} onChange={e => handleIdentifierChange(e.target.value)} onBlur={handleIdentifierBlur} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.identifier ? 'border-red-500' : ''}`} />
                    {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.phone')}</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{postalCodeLabel}</label>
                    <input type="text" value={formData.cep} onChange={e => setFormData({ ...formData, cep: e.target.value })} onBlur={handlePostalCodeBlur} className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 ${errors.cep ? 'border-red-500' : ''}`} />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.address')}</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customers.form.status')}</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                        <option value="Active">{t('customers.statusActive')}</option>
                        <option value="Inactive">{t('customers.statusInactive')}</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{customer ? t('common.saveChanges') : t('customers.add')}</button>
            </div>
            <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} onSelectAvatar={url => setFormData({...formData, avatarUrl: url})} />
        </form>
    );
};

// --- Main Component ---
const CustomerManagement: React.FC = () => {
    // FIX: Destructure properties from `state` correctly. `currentUser` is nested inside the `state` object.
    const { state, dispatch, hasPermission } = useAppState();
    const { customers, appointments, currentUser } = state;
    const { t, locale } = useLocalization();
    const navigate = useNavigate();
    const location = useLocation();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    const companyCustomers = useMemo(() => {
        if (!currentUser) return [];
        return hasPermission('MANAGE_ALL_COMPANIES') ? customers : customers.filter(c => c.companyId === currentUser.companyId);
    }, [customers, currentUser, hasPermission]);
    
    const filteredCustomers = useMemo(() => {
        return companyCustomers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.identifier.includes(searchTerm)
        );
    }, [companyCustomers, searchTerm]);

    const openFormToAdd = () => {
        setEditingCustomer(null);
        setIsFormOpen(true);
    };

    const openFormToEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'>) => {
        if (editingCustomer) {
            const updatedCustomer = { ...editingCustomer, ...customerData };
            dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerUpdated', type: 'success' } });
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                createdAt: new Date(),
                interactions: [],
                documents: [],
                companyId: currentUser!.companyId,
                ...customerData
            };
            dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerAdded', type: 'success' } });
            dispatch({ type: 'ADD_ACTIVITY_LOG', payload: { id: `log-${Date.now()}`, date: new Date(), type: 'Cliente', descriptionKey: 'activityLog.NEW_CUSTOMER', descriptionParams: { name: newCustomer.name }, companyId: currentUser!.companyId }});
        }
        setIsFormOpen(false);
    };

    const handleDeleteCustomer = () => {
        if (customerToDelete) {
            dispatch({ type: 'DELETE_CUSTOMER', payload: customerToDelete.id });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customerRemoved', type: 'success' } });
            setCustomerToDelete(null);
        }
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('customers.title')}</h1>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('customers.searchPlaceholder')} className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.contact')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('customers.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserProfile user={customer} className="w-10 h-10" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{t(customer.type === 'Individual' ? 'customers.typePerson' : 'customers.typeCompany')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div>{customer.email}</div>
                                        <div>{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                            {t(customer.status === 'Active' ? 'customers.statusActive' : 'customers.statusInactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => navigate(`/customers/${customer.id}`)} title={t('suppliers.viewDetails')} className="text-gray-400 hover:text-primary"><EyeIcon className="w-5 h-5" /></button>
                                            {hasPermission('MANAGE_CUSTOMERS') && <button onClick={() => openFormToEdit(customer)} title={t('common.edit')} className="text-gray-400 hover:text-primary"><EditIcon className="w-5 h-5" /></button>}
                                            {hasPermission('DELETE_CUSTOMERS') && <button onClick={() => setCustomerToDelete(customer)} title={t('common.delete')} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {hasPermission('MANAGE_CUSTOMERS') && <FloatingActionButton label={t('customers.add')} icon={PlusIcon} onClick={openFormToAdd} />}
            
            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingCustomer ? t('customers.edit') : t('customers.addNew')}>
                <CustomerForm customer={editingCustomer} onSave={handleSaveCustomer} onCancel={() => setIsFormOpen(false)} />
            </Modal>
            
            <Modal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} title={t('customers.confirmDelete.header')}>
                <div className="text-center p-4">
                    <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('customers.confirmDelete.body', { name: customerToDelete?.name }) }} />
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setCustomerToDelete(null)} className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                        <button onClick={handleDeleteCustomer} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomerManagement;