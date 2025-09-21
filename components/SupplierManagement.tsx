

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Supplier } from '../types';
import { useAppState } from '../state/AppContext';
import { Modal } from './Modal';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, UserProfile, SearchIcon, WarningIcon, AlertTriangleIcon } from './Icons';
import Breadcrumbs from './Breadcrumbs';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { validateCNPJ } from '../services/validationService';
import { fetchAddress } from '../services/cepService';
import { fetchCompanyData } from '../services/cnpjService';
import FloatingActionButton from './FloatingActionButton';

interface SupplierFormProps {
    supplier?: Supplier | null;
    onSave: (supplier: Omit<Supplier, 'id' | 'companyId'> | Supplier) => void;
    onCancel: () => void;
}

const formatCNPJ = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const formatCEP = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2');
};

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSave, onCancel }) => {
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [isFetchingCNPJ, setIsFetchingCNPJ] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        contactPerson: '',
        phone: '',
        email: '',
        services: '',
        logoUrl: '',
        contactAvatarUrl: '',
        cep: '',
        address: '',
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                cnpj: supplier.cnpj,
                contactPerson: supplier.contactPerson,
                phone: supplier.phone,
                email: supplier.email,
                services: supplier.services.join(', '),
                logoUrl: supplier.logoUrl || '',
                contactAvatarUrl: supplier.contactAvatarUrl || '',
                cep: supplier.cep,
                address: supplier.address,
            });
        } else {
             setFormData({
                name: '',
                cnpj: '',
                contactPerson: '',
                phone: '',
                email: '',
                services: '',
                logoUrl: '',
                contactAvatarUrl: '',
                cep: '',
                address: '',
            });
        }
    }, [supplier]);

    // Effect to fetch company data from CNPJ
    useEffect(() => {
        const cleanedCnpj = formData.cnpj.replace(/\D/g, '');
        if (cleanedCnpj.length === 14) {
            const fetchCompanyInfo = async () => {
                setIsFetchingCNPJ(true);
                setError('');
                try {
                    const companyData = await fetchCompanyData(cleanedCnpj);
                    if (companyData) {
                        setFormData(prev => ({
                            ...prev,
                            name: companyData.name,
                            phone: companyData.phone,
                            email: companyData.email,
                            cep: formatCEP(companyData.cep),
                            address: companyData.address,
                        }));
                    } else {
                        setError('CNPJ não encontrado em nossa base de dados.');
                    }
                } catch (err) {
                    console.error("Failed to fetch CNPJ data", err);
                    setError('Falha ao buscar dados do CNPJ. Tente novamente.');
                } finally {
                    setIsFetchingCNPJ(false);
                }
            };
            fetchCompanyInfo();
        }
    }, [formData.cnpj]);
    
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


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, cnpj: formatCNPJ(value) }));
        } else if (name === 'cep') {
            setFormData(prev => ({ ...prev, cep: formatCEP(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, logoUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setFormData(prev => ({ ...prev, contactAvatarUrl: avatarUrl }));
        setIsAvatarModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateCNPJ(formData.cnpj)) {
            setError('CNPJ inválido. Por favor, verifique o número digitado.');
            return;
        }

        const finalData = {
            ...formData,
            services: formData.services.split(',').map(s => s.trim()).filter(Boolean)
        };
        onSave(supplier ? { ...supplier, ...finalData } : finalData);
    };

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">{error}</div>}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-secondary dark:text-gray-200 mb-4">Dados da Empresa</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <UserProfile user={{name: formData.name, avatarUrl: formData.logoUrl}} className="w-20 h-20 flex-shrink-0" />
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo da Empresa</label>
                            <div className="mt-2">
                                <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    Carregar Logo
                                </label>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/*" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Se nenhum logo for enviado, as iniciais serão usadas.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Razão Social</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                             <div className="relative">
                                <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} required maxLength={18} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                                {isFetchingCNPJ && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                            <div className="relative">
                                <input type="text" name="cep" id="cep" value={formData.cep} onChange={handleChange} placeholder="XXXXX-XXX" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                                {isFetchingAddress && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                             <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                 <h3 className="text-lg font-semibold text-secondary dark:text-gray-200 mb-4">Pessoa de Contato</h3>
                 <div className="space-y-4">
                     <div className="flex items-start gap-4">
                         <UserProfile user={{name: formData.contactPerson, avatarUrl: formData.contactAvatarUrl}} className="w-20 h-20 flex-shrink-0" />
                         <div className="flex-grow space-y-3">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar do Contato</label>
                                 <div className="mt-2 flex items-center gap-2 flex-wrap">
                                     <button type="button" onClick={() => setIsAvatarModalOpen(true)} className="bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                         Alterar Avatar
                                     </button>
                                 </div>
                             </div>
                         </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                           <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                       </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1">
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                 </div>
            </div>

            <div>
                <label htmlFor="services" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serviços (separados por vírgula)</label>
                <textarea name="services" id="services" value={formData.services} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"></textarea>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{supplier ? 'Salvar Alterações' : 'Adicionar Fornecedor'}</button>
            </div>
        </form>
         <AvatarSelectionModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            onSelectAvatar={handleAvatarSelect}
        />
      </>
    );
}

const SupplierManagement: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { suppliers, appointments } = state;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [deletionError, setDeletionError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    const handleOpenModal = (supplier: Supplier | null = null) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
        if (searchQuery) {
            setSearchTerm(searchQuery);
        }
    }, [location.search]);

    const filteredSuppliers = useMemo(() => {
        const userSuppliers = state.currentUser?.email === 'ddarruspe@gmail.com'
            ? suppliers
            : suppliers.filter(s => s.companyId === state.currentUser?.companyId);

        if (!searchTerm) {
            return userSuppliers;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return userSuppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(lowercasedTerm) ||
            supplier.contactPerson.toLowerCase().includes(lowercasedTerm)
        );
    }, [suppliers, searchTerm, state.currentUser]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSaveSupplier = (supplierData: Omit<Supplier, 'id' | 'companyId'> | Supplier) => {
        if ('id' in supplierData) {
            dispatch({ type: 'UPDATE_SUPPLIER', payload: supplierData });
        } else {
            dispatch({ type: 'ADD_SUPPLIER', payload: supplierData });
        }
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: `Fornecedor ${'id' in supplierData ? 'atualizado' : 'adicionado'} com sucesso!`, type: 'success' } });
        handleCloseModal();
    };

    const handleDeleteSupplier = (supplierId: string) => {
        dispatch({ type: 'DELETE_SUPPLIER', payload: supplierId });
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'Fornecedor removido com sucesso!', type: 'success' } });
    };

    const handleAttemptDelete = (supplier: Supplier) => {
        const relatedAppointments = appointments.filter(app => app.supplierId === supplier.id);
        if (relatedAppointments.length > 0) {
            setDeletionError(`Este fornecedor não pode ser excluído. Ele está associado a ${relatedAppointments.length} compromisso(s). Remova a associação antes de excluí-lo.`);
        } else {
            setSupplierToDelete(supplier);
        }
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">Fornecedores</h1>
            </div>
            <div className="mb-6">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome da empresa ou contato..."
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Razão Social</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contato</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serviços</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <UserProfile user={{...supplier, avatarUrl: supplier.logoUrl}} className="w-10 h-10 mr-4" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{supplier.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.cnpj}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">{supplier.contactPerson}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{supplier.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {supplier.services.join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setViewingSupplier(supplier)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Visualizar Detalhes">
                                                <EyeIcon />
                                            </button>
                                            {hasPermission('MANAGE_SUPPLIERS') && (
                                                <button onClick={() => handleOpenModal(supplier)} className="text-primary hover:text-primary-hover" title="Editar">
                                                    <EditIcon />
                                                </button>
                                            )}
                                            {hasPermission('DELETE_SUPPLIERS') && (
                                                <button onClick={() => handleAttemptDelete(supplier)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400" title="Deletar">
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    Nenhum fornecedor encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {hasPermission('MANAGE_SUPPLIERS') && (
                <FloatingActionButton
                    label="Adicionar Fornecedor"
                    icon={PlusIcon}
                    onClick={() => handleOpenModal()}
                />
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}>
                <SupplierForm
                    supplier={editingSupplier}
                    onSave={handleSaveSupplier}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {viewingSupplier && (
                <Modal isOpen={!!viewingSupplier} onClose={() => setViewingSupplier(null)} title={`Detalhes de ${viewingSupplier.name}`}>
                    <div className="space-y-6 text-sm">
                        <div className="p-4 border dark:border-gray-700 rounded-lg">
                            <h3 className="text-base font-semibold text-secondary dark:text-gray-200 mb-3">Informações da Empresa</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <UserProfile user={{name: viewingSupplier.name, avatarUrl: viewingSupplier.logoUrl}} className="w-16 h-16 flex-shrink-0" />
                                <div>
                                    <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Razão Social:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.name}</span></div>
                                    <div><strong className="font-semibold text-gray-700 dark:text-gray-300">CNPJ:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.cnpj}</span></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t dark:border-gray-600">
                                <div><strong className="font-semibold text-gray-700 dark:text-gray-300">CEP:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.cep}</span></div>
                                <div className="col-span-2"><strong className="font-semibold text-gray-700 dark:text-gray-300">Endereço:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.address}</span></div>
                            </div>
                        </div>

                         <div className="p-4 border dark:border-gray-700 rounded-lg">
                             <h3 className="text-base font-semibold text-secondary dark:text-gray-200 mb-3">Informações de Contato</h3>
                            <div className="flex items-center gap-4">
                                <UserProfile user={{name: viewingSupplier.contactPerson, avatarUrl: viewingSupplier.contactAvatarUrl}} className="w-16 h-16 flex-shrink-0" />
                               <div>
                                    <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Pessoa de Contato:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.contactPerson}</span></div>
                                    <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Email:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.email}</span></div>
                                    <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Telefone:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.phone}</span></div>
                               </div>
                            </div>
                        </div>

                        <div><strong className="font-semibold text-gray-700 dark:text-gray-300">Serviços:</strong> <span className="text-gray-600 dark:text-gray-400">{viewingSupplier.services.join(', ')}</span></div>
                    </div>
                </Modal>
            )}

            {supplierToDelete && (
                <Modal isOpen={!!supplierToDelete} onClose={() => setSupplierToDelete(null)} title="Confirmar Exclusão">
                    <div>
                        <div className="text-center p-4">
                            <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-secondary dark:text-gray-100 mb-2">Excluir Fornecedor</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Você tem certeza que deseja excluir <strong>{supplierToDelete.name}</strong>? Esta ação é permanente e não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex justify-center gap-4 pt-4 mt-4 border-t dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setSupplierToDelete(null)}
                                className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleDeleteSupplier(supplierToDelete.id);
                                    setSupplierToDelete(null);
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
        </div>
    );
};

export default SupplierManagement;