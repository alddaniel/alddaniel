

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Customer, Interaction, User } from '../types';
import { useAppState } from '../state/AppContext';
import { analyzeCustomerInteractions } from '../services/geminiService';
import { fetchAddress } from '../services/cepService';
import { Modal } from './Modal';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, UserProfile, WarningIcon, AlertTriangleIcon, SparklesIcon, PhoneIcon, EnvelopeIcon, UsersIcon, TagIcon } from './Icons';
import Breadcrumbs from './Breadcrumbs';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { validateCPF, validateCNPJ } from '../services/validationService';
import FloatingActionButton from './FloatingActionButton';

interface CustomerFormProps {
    customer?: Customer | null;
    onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'> | Customer) => void;
    onCancel: () => void;
}

const formatIdentifier = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) { // CPF format
        return cleaned
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else { // CNPJ format
        return cleaned
            .slice(0, 14) // Limit to 14 digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
};

const formatCEP = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2');
};


const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Company' as 'Individual' | 'Company',
        identifier: '',
        phone: '',
        email: '',
        cep: '',
        address: '',
        status: 'Active' as 'Active' | 'Inactive',
        avatarUrl: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                type: customer.type,
                identifier: customer.identifier,
                phone: customer.phone,
                email: customer.email,
                cep: customer.cep,
                address: customer.address,
                status: customer.status,
                avatarUrl: customer.avatarUrl || '',
            });
        } else {
             setFormData({
                name: '',
                type: 'Company',
                identifier: '',
                phone: '',
                email: '',
                cep: '',
                address: '',
                status: 'Active',
                avatarUrl: '',
            });
        }
    }, [customer]);

    // Effect to fetch address from CEP
    useEffect(() => {
        const cleanedCep = formData.cep.replace(/\D/g, '');
        if (cleanedCep.length === 8) {
            const fetchAddressData = async () => {
                setIsFetchingAddress(true);
                setError('');
                try {
                    const addressData = await fetchAddress(cleanedCep);
                    if (addressData) {
                        const fullAddress = `${addressData.logradouro}, ${addressData.bairro} - ${addressData.localidade}/${addressData.uf}`;
                        setFormData(prev => ({ ...prev, address: fullAddress }));
                    } else {
                         setError('CEP não encontrado. Por favor, verifique o número.');
                    }
                } catch (error) {
                    console.error("Failed to fetch address", error);
                    setError('Falha ao buscar o CEP. Tente novamente.');
                } finally {
                    setIsFetchingAddress(false);
                }
            };
            fetchAddressData();
        }
    }, [formData.cep]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'identifier') {
            setFormData(prev => ({ ...prev, [name]: formatIdentifier(value) }));
        } else if (name === 'cep') {
            setFormData(prev => ({ ...prev, [name]: formatCEP(value) }));
        } else {
            setFormData(prev => {
                const newState = { ...prev, [name]: value };
                if (name === 'type' && value === 'Company') {
                    newState.avatarUrl = ''; // Clear avatar when switching to Company
                }
                return newState;
            });
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, avatarUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setFormData(prev => ({ ...prev, avatarUrl }));
        setIsAvatarModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { type, identifier } = formData;
        if (type === 'Individual' && !validateCPF(identifier)) {
            setError('CPF inválido. Por favor, verifique o número digitado.');
            return;
        }
        if (type === 'Company' && !validateCNPJ(identifier)) {
            setError('CNPJ inválido. Por favor, verifique o número digitado.');
            return;
        }

        onSave(customer ? { ...customer, ...formData } : formData);
    };

    return (
        <>
         <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">{error}</div>}
            <div className="flex items-start gap-4">
                <UserProfile user={{name: formData.name, avatarUrl: formData.avatarUrl}} className="w-20 h-20 flex-shrink-0" />
                <div className="flex-grow space-y-3">
                    {formData.type === 'Company' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Empresa</label>
                            <div className="mt-2">
                                <label htmlFor="avatar-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    Carregar Logo
                                </label>
                                <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Se nenhum logo for enviado, as iniciais da empresa serão usadas.</p>
                            </div>
                        </div>
                    ) : (
                         <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
                             <div className="mt-2 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 h-fit"
                                >
                                    Alterar Avatar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{formData.type === 'Company' ? 'Razão Social' : 'Nome Completo'}</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                        <option value="Company">Empresa</option>
                        <option value="Individual">Pessoa Física</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{formData.type === 'Company' ? 'CNPJ' : 'CPF'}</label>
                    <input type="text" name="identifier" id="identifier" value={formData.identifier} onChange={handleChange} required maxLength={18} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-1">
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                    <input type="text" name="cep" id="cep" value={formData.cep} onChange={handleChange} placeholder="XXXXX-XXX" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                    <div className="relative">
                        <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={1} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"></textarea>
                         {isFetchingAddress && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                    <option value="Active">Ativo</option>
                    <option value="Inactive">Inativo</option>
                </select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{customer ? 'Salvar Alterações' : 'Adicionar Cliente'}</button>
            </div>
        </form>
         <AvatarSelectionModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            onSelectAvatar={handleAvatarSelect}
        />
        </>
    );
};

const CustomerManagement: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { customers, appointments, users } = state;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [deletionError, setDeletionError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    // AI Analysis State
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    const handleOpenModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [location.search]);

    const filteredCustomers = useMemo(() => {
        const userCustomers = state.currentUser?.email === 'ddarruspe@gmail.com'
            ? customers
            : customers.filter(c => c.companyId === state.currentUser?.companyId);

        if (!searchTerm) {
            return userCustomers;
        }
        return userCustomers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm, state.currentUser]);

    const translateStatus = (status: 'Active' | 'Inactive') => status === 'Active' ? 'Ativo' : 'Inativo';

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'interactions' | 'documents' | 'companyId'> | Customer) => {
        if ('id' in customerData) {
            dispatch({ type: 'UPDATE_CUSTOMER', payload: customerData });
        } else {
            dispatch({ type: 'ADD_CUSTOMER', payload: customerData });
        }
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: `Cliente ${'id' in customerData ? 'atualizado' : 'adicionado'} com sucesso!`, type: 'success' } });
        handleCloseModal();
    };

    const handleDeleteCustomer = (customerId: string) => {
        dispatch({ type: 'DELETE_CUSTOMER', payload: customerId });
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'Cliente removido com sucesso!', type: 'success' } });
    };

    const handleAttemptDelete = (customer: Customer) => {
        const relatedAppointments = appointments.filter(app => app.customerId === customer.id);
        if (relatedAppointments.length > 0) {
            setDeletionError(`Este cliente não pode ser excluído. Ele está associado a ${relatedAppointments.length} compromisso(s). Remova-o dos compromissos antes de excluí-lo.`);
        } else {
            setCustomerToDelete(customer);
        }
    };

    const handleAnalyzeInteractions = async (customer: Customer) => {
        setIsAnalysisModalOpen(true);
        setIsAnalysisLoading(true);
        setAnalysisResult('');
        const result = await analyzeCustomerInteractions(customer.interactions, customer.name, users);
        setAnalysisResult(result);
        setIsAnalysisLoading(false);
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">Clientes</h1>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente Desde</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} onClick={() => setViewingCustomer(customer)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserProfile user={customer} className="w-10 h-10 mr-4" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{customer.type === 'Individual' ? 'Pessoa Física' : 'Empresa'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{customer.email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                        }`}>
                                            {translateStatus(customer.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {customer.createdAt.toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                       <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                            {hasPermission('MANAGE_CUSTOMERS') && (
                                                <button onClick={() => handleOpenModal(customer)} className="text-primary hover:text-primary-hover" title="Editar">
                                                    <EditIcon />
                                                </button>
                                            )}
                                            {hasPermission('DELETE_CUSTOMERS') && (
                                                <button onClick={() => handleAttemptDelete(customer)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400" title="Deletar">
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    Nenhum cliente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {hasPermission('MANAGE_CUSTOMERS') && (
                <FloatingActionButton
                    label="Adicionar Cliente"
                    icon={PlusIcon}
                    onClick={() => handleOpenModal()}
                />
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}>
                <CustomerForm
                    customer={editingCustomer}
                    onSave={handleSaveCustomer}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {viewingCustomer && (
                <Modal isOpen={!!viewingCustomer} onClose={() => setViewingCustomer(null)} title={`Detalhes de ${viewingCustomer.name}`}>
                    <CustomerDetailView
                        customer={viewingCustomer}
                        users={users}
                        dispatch={dispatch}
                        onAnalyze={handleAnalyzeInteractions}
                    />
                </Modal>
            )}

            {customerToDelete && (
                <Modal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} title="Confirmar Exclusão">
                    <div>
                        <div className="text-center p-4">
                            <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-2">Excluir Cliente</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Você tem certeza que deseja excluir <strong>{customerToDelete.name}</strong>? Esta ação é permanente e não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex justify-center gap-4 pt-4 mt-4 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setCustomerToDelete(null)}
                                className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleDeleteCustomer(customerToDelete.id);
                                    setCustomerToDelete(null);
                                }}
                                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {deletionError && (
                <Modal isOpen={!!deletionError} onClose={() => setDeletionError(null)} title="Exclusão Bloqueada">
                    <div className="text-center p-4">
                        <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">{deletionError}</p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setDeletionError(null)}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isAnalysisModalOpen && (
                <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title={`Análise de Interações com ${viewingCustomer?.name}`}>
                     {isAnalysisLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>
                    )}
                </Modal>
            )}


        </div>
    );
};


const CustomerDetailView: React.FC<{customer: Customer, users: User[], dispatch: any, onAnalyze: (customer: Customer) => void}> = ({ customer, users, dispatch, onAnalyze }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [interactionNotes, setInteractionNotes] = useState('');
    const [interactionType, setInteractionType] = useState<Interaction['type']>('note');
    const translateType = (type: 'Individual' | 'Company') => type === 'Individual' ? 'Pessoa Física' : 'Empresa';
    const translateStatus = (status: 'Active' | 'Inactive') => status === 'Active' ? 'Ativo' : 'Inativo';

    const handleAddInteraction = () => {
        if (interactionNotes.trim()) {
            dispatch({ type: 'ADD_INTERACTION', payload: { customerId: customer.id, notes: interactionNotes, type: interactionType } });
            setInteractionNotes('');
            setInteractionType('note');
        }
    };

    const interactionTypeIcons: Record<Interaction['type'], React.FC<{className?: string}>> = {
        call: PhoneIcon,
        email: EnvelopeIcon,
        meeting: UsersIcon,
        note: TagIcon,
    };

    const interactionTypeLabels: Record<Interaction['type'], string> = {
        call: 'Chamada',
        email: 'E-mail',
        meeting: 'Reunião',
        note: 'Anotação',
    };

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Detalhes
                    </button>
                    <button onClick={() => setActiveTab('interactions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'interactions' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Interações
                    </button>
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'details' && (
                     <div className="space-y-4 text-sm">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                             <UserProfile user={customer} className="w-20 h-20" />
                             <div className="space-y-1">
                                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Nome:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.name}</span></div>
                                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Email:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.email}</span></div>
                                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Telefone:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span></div>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Tipo:</strong> <span className="text-gray-600 dark:text-gray-400">{translateType(customer.type)}</span></div>
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300">{customer.type === 'Company' ? 'CNPJ:' : 'CPF:'}</strong> <span className="text-gray-600 dark:text-gray-400">{customer.identifier}</span></div>
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>{translateStatus(customer.status)}</span></div>
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Cliente Desde:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.createdAt.toLocaleDateString('pt-BR')}</span></div>
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300">CEP:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.cep}</span></div>
                        </div>
                        <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Endereço:</strong> <span className="text-gray-600 dark:text-gray-400">{customer.address}</span></div>
                    </div>
                )}
                {activeTab === 'interactions' && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Registrar Nova Interação</h4>
                            <textarea
                                value={interactionNotes}
                                onChange={(e) => setInteractionNotes(e.target.value)}
                                rows={3}
                                placeholder="Descreva a interação aqui..."
                                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-primary focus:border-primary"
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo:</span>
                                    <div className="flex items-center gap-2">
                                        {(Object.keys(interactionTypeLabels) as Array<Interaction['type']>).map(type => (
                                            <button key={type} onClick={() => setInteractionType(type)} className={`p-2 rounded-full transition-colors ${interactionType === type ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`} title={interactionTypeLabels[type]}>
                                                {React.createElement(interactionTypeIcons[type], { className: 'w-5 h-5' })}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleAddInteraction} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover disabled:bg-primary/50 self-end sm:self-center" disabled={!interactionNotes.trim()}>Salvar</button>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {customer.interactions && customer.interactions.length > 0 ? (
                                customer.interactions.map(interaction => {
                                    const user = users.find(u => u.id === interaction.userId);
                                    const IconComponent = interactionTypeIcons[interaction.type];
                                    return (
                                        <div key={interaction.id} className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <UserProfile user={user} className="w-10 h-10" />
                                                <div className={`mt-2 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400`} title={interactionTypeLabels[interaction.type]}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>{user?.name || 'Usuário desconhecido'}</span>
                                                    <span>{interaction.date.toLocaleString('pt-BR')}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{interaction.notes}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma interação registrada.</p>
                            )}
                        </div>
                        {customer.interactions && customer.interactions.length >= 2 && (
                             <div className="pt-4 border-t dark:border-gray-700 flex justify-center">
                                <button onClick={() => onAnalyze(customer)} className="flex items-center gap-2 bg-indigo-100 text-primary dark:bg-indigo-900/40 dark:text-indigo-300 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
                                    <SparklesIcon />
                                    Analisar com IA
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default CustomerManagement;