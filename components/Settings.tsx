

import React, { useState, useEffect } from 'react';
import { Company, User, UserRole, Permission } from '../types';
import { useAppState } from '../state/AppContext';
import { Modal } from './Modal';
import { PlusIcon, EditIcon, TrashIcon, UserProfile } from './Icons';
import Breadcrumbs from './Breadcrumbs';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { iconMap } from './Icons';
import { IconPicker } from './ui/IconPicker';
import { validateCNPJ } from '../services/validationService';
import { USER_MANAGEABLE_PERMISSIONS } from '../constants';
import { useLocalization } from '../contexts/LocalizationContext';

const formatCNPJ = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const UserForm: React.FC<{
    user?: User | null;
    onSave: (user: Omit<User, 'id' | 'permissions'> | User) => void;
    onCancel: () => void;
    isSuperAdmin: boolean;
    allCompanies: Company[];
    currentUser: User;
}> = ({ user, onSave, onCancel, isSuperAdmin, allCompanies, currentUser }) => {
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: UserRole.COLLABORATOR,
        companyId: '',
        avatarUrl: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                avatarUrl: user.avatarUrl || '',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                role: UserRole.COLLABORATOR,
                companyId: isSuperAdmin ? '' : currentUser.companyId,
                avatarUrl: '',
            });
        }
    }, [user, isSuperAdmin, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setFormData(prev => ({...prev, avatarUrl}));
        setIsAvatarModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSuperAdmin && !user && !formData.companyId) {
            alert("Por favor, selecione uma empresa para o novo usuário.");
            return;
        }
        onSave(user ? { ...user, ...formData } : formData);
    };

    const companyName = user ? allCompanies.find(c => c.id === user.companyId)?.name : '';

    return (
        <>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="flex flex-col items-center gap-4 pt-2 pb-4 border-b dark:border-gray-700">
                <UserProfile user={{ name: formData.name, avatarUrl: formData.avatarUrl }} className="w-24 h-24" />
                <div className="flex items-end gap-4">
                    <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 h-fit"
                    >
                        Alterar Avatar
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Por favor, insira um endereço de e-mail válido." className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permissão</label>
                <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                    {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            {isSuperAdmin && !user && (
                <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Empresa</label>
                    <select name="companyId" id="companyId" value={formData.companyId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                        <option value="" disabled>Selecione uma empresa</option>
                        {allCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}

            {user && (
                 <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Empresa</label>
                    <input type="text" name="companyName" id="companyName" value={companyName} disabled className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                </div>
            )}


            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{user ? 'Salvar Alterações' : 'Adicionar Usuário'}</button>
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

const CompanyForm: React.FC<{
    company?: Company | null;
    onSave: (company: any) => void;
    onCancel: () => void;
}> = ({ company, onSave, onCancel }) => {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
    });

    useEffect(() => {
        setFormData({
            name: company?.name || '',
            cnpj: company?.cnpj || '',
            address: company?.address || '',
            phone: company?.phone || '',
            email: company?.email || '',
            logoUrl: company?.logoUrl || '',
        });
    }, [company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, cnpj: formatCNPJ(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateCNPJ(formData.cnpj)) {
            setError('CNPJ inválido. Por favor, verifique o número digitado.');
            return;
        }

        onSave(company ? { ...company, ...formData } : formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/20 dark:text-red-300 dark:border-red-600" role="alert">{error}</div>}
            
             <div className="flex flex-col items-center gap-4 pt-2 pb-6 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-secondary dark:text-gray-200">Logo da Empresa</h3>
                <UserProfile user={{ name: formData.name, avatarUrl: formData.logoUrl }} className="w-24 h-24 rounded-md object-contain" />
                <input type="file" id="company-logo-upload" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                <label htmlFor="company-logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Alterar Logo
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="comp-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</label>
                    <input type="text" name="name" id="comp-name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="comp-cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                    <input type="text" name="cnpj" id="comp-cnpj" value={formData.cnpj} onChange={handleChange} required maxLength={18} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div>
                <label htmlFor="comp-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                <input type="text" name="address" id="comp-address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="comp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail de Contato</label>
                    <input type="email" name="email" id="comp-email" value={formData.email} onChange={handleChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Por favor, insira um endereço de e-mail válido." className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="comp-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                    <input type="tel" name="phone" id="comp-phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{company ? 'Salvar Alterações' : 'Adicionar Empresa'}</button>
            </div>
        </form>
    );
}

// Helper function to generate a description of changes for a company
const generateCompanyChangesDescription = (oldCompany: Company, newCompany: Company): string => {
    const changes: string[] = [];
    if (oldCompany.name !== newCompany.name) {
        changes.push(`nome de "${oldCompany.name}" para "${newCompany.name}"`);
    }
    if (oldCompany.cnpj !== newCompany.cnpj) {
        changes.push(`CNPJ alterado`);
    }
    if (oldCompany.address !== newCompany.address) {
        changes.push(`endereço alterado`);
    }
    if (oldCompany.phone !== newCompany.phone) {
        changes.push(`telefone alterado`);
    }
     if (oldCompany.email !== newCompany.email) {
        changes.push(`email alterado`);
    }
    if (oldCompany.logoUrl !== newCompany.logoUrl) {
        changes.push('logo alterado');
    }

    if (changes.length === 0) {
        return `Nenhuma alteração detectada para a empresa "${newCompany.name}".`;
    }

    return `Empresa "${newCompany.name}" atualizada: ${changes.join(', ')}.`;
};

// Helper function to generate a description of changes for a user
const generateUserChangesDescription = (oldUser: User, newUser: Omit<User, 'id' | 'permissions'> | User): string => {
    const changes: string[] = [];
    if (oldUser.name !== newUser.name) {
        changes.push(`nome de "${oldUser.name}" para "${newUser.name}"`);
    }
    if (oldUser.email !== newUser.email) {
        changes.push(`email de "${oldUser.email}" para "${newUser.email}"`);
    }
    if (oldUser.role !== newUser.role) {
        changes.push(`permissão de "${oldUser.role}" para "${newUser.role}"`);
    }

    if (changes.length === 0) {
        return `Nenhuma alteração detectada para o usuário "${newUser.name}".`;
    }

    return `Usuário "${newUser.name}" atualizado: ${changes.join(', ')}.`;
};

const permissionGroups = [
  {
    title: 'Painel',
    permissions: ['VIEW_DASHBOARD']
  },
  {
    title: 'Clientes',
    permissions: ['VIEW_CUSTOMERS', 'MANAGE_CUSTOMERS', 'DELETE_CUSTOMERS']
  },
  {
    title: 'Fornecedores',
    permissions: ['VIEW_SUPPLIERS', 'MANAGE_SUPPLIERS', 'DELETE_SUPPLIERS']
  },
  {
    title: 'Agenda',
    permissions: ['VIEW_AGENDA', 'MANAGE_AGENDA']
  },
  {
    title: 'Relatórios',
    permissions: ['VIEW_REPORTS']
  },
  {
    title: 'Configurações',
    permissions: ['VIEW_SETTINGS', 'MANAGE_COMPANY_INFO', 'MANAGE_USERS', 'MANAGE_CATEGORIES']
  },
  {
    title: 'Administração Geral',
    permissions: ['MANAGE_ALL_USERS']
  }
];

const permissionDescriptions: Record<Permission, string> = {
    'VIEW_DASHBOARD': 'Visualizar painel',
    'VIEW_CUSTOMERS': 'Visualizar clientes',
    'MANAGE_CUSTOMERS': 'Adicionar/Editar clientes',
    'DELETE_CUSTOMERS': 'Excluir clientes',
    'VIEW_SUPPLIERS': 'Visualizar fornecedores',
    'MANAGE_SUPPLIERS': 'Adicionar/Editar fornecedores',
    'DELETE_SUPPLIERS': 'Excluir fornecedores',
    'VIEW_AGENDA': 'Visualizar agenda',
    'MANAGE_AGENDA': 'Gerenciar agenda (criar/editar eventos)',
    'VIEW_REPORTS': 'Visualizar relatórios',
    'VIEW_SETTINGS': 'Acessar configurações',
    'MANAGE_COMPANY_INFO': 'Editar informações da própria empresa',
    'MANAGE_USERS': 'Gerenciar usuários da própria empresa',
    'MANAGE_CATEGORIES': 'Gerenciar categorias de compromissos',
    'MANAGE_ALL_USERS': 'Gerenciar usuários de QUALQUER empresa',
    'MANAGE_ALL_COMPANIES': 'Gerenciar todas as empresas',
    'MANAGE_PERMISSIONS': 'Gerenciar permissões detalhadas dos usuários',
};


const Settings: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { t } = useLocalization();
    const { currentUser, users, companies, appointmentCategoryConfig } = state;
    if (!currentUser) return null;

    const company = companies.find(c => c.id === currentUser.companyId)!;
    const isSuperAdmin = currentUser.email === 'ddarruspe@gmail.com';

    const userUsers = isSuperAdmin ? users : users.filter(u => u.companyId === currentUser.companyId);

    type SettingsTab = 'company' | 'users' | 'companies' | 'categories' | 'permissions' | 'systemCustomization';
    const [activeTab, setActiveTab] = useState<SettingsTab>(isSuperAdmin ? 'companies' : 'company');
    const [companyData, setCompanyData] = useState<Company>(company);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    // State for permissions tab
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [userPermissions, setUserPermissions] = useState<Set<Permission>>(new Set());
    const [initialPermissions, setInitialPermissions] = useState<Set<Permission>>(new Set());
    
    // State for System Customization
    const [systemLogo, setSystemLogo] = useState<string | null>(null);
    const [initialSystemLogo, setInitialSystemLogo] = useState<string | null>(null);


    type LocalCategory = { id: string; name: string; icon: string; color: string; isNew?: boolean; isDeleting?: boolean; };

    const [localCategories, setLocalCategories] = useState<LocalCategory[]>(() =>
        Object.entries(appointmentCategoryConfig).map(([name, value], index) => ({
            id: `initial-cat-${index}`,
            name,
            ...value
        }))
    );
    const [isDirty, setIsDirty] = useState(false);

    const availableColors = ['blue', 'green', 'purple', 'yellow', 'pink', 'gray'];
    const colorClasses: { [key: string]: string } = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
        gray: 'bg-gray-500'
    };

    const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: message, type } });
    };

    useEffect(() => {
        setCompanyData(company);
    }, [company]);
    
     useEffect(() => {
        if (activeTab === 'systemCustomization') {
            const logo = localStorage.getItem('system_logo_url');
            setSystemLogo(logo);
            setInitialSystemLogo(logo);
        }
    }, [activeTab]);


    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'cnpj') {
            setCompanyData(prev => ({ ...prev, cnpj: formatCNPJ(value) }));
        } else {
            setCompanyData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompanyData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCompanySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const description = generateCompanyChangesDescription(company, companyData);
        dispatch({ type: 'UPDATE_COMPANY', payload: { company: companyData, description } });
        showNotification('Informações da empresa atualizadas com sucesso!');
    };

    const handleOpenUserModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (user: User | Omit<User, 'id' | 'permissions'>) => {
        if ('id' in user && editingUser) {
            const description = generateUserChangesDescription(editingUser, user);
            dispatch({ type: 'UPDATE_USER', payload: { user: user as User, description } });
        } else {
            dispatch({ type: 'ADD_USER', payload: user as Omit<User, 'id' | 'permissions'> });
        }
        showNotification(`Usuário ${'id' in user ? 'atualizado' : 'adicionado'} com sucesso!`);
        setIsUserModalOpen(false);
        setEditingUser(null);
    };

    const handleOpenCompanyModal = (company: Company | null = null) => {
        setEditingCompany(company);
        setIsCompanyModalOpen(true);
    };

    const handleSaveCompany = (companyData: Company | Omit<Company, 'id'>) => {
        if ('id' in companyData && editingCompany) {
            const description = generateCompanyChangesDescription(editingCompany, companyData);
            dispatch({ type: 'UPDATE_COMPANY', payload: { company: companyData, description } });
        } else {
            dispatch({ type: 'ADD_COMPANY', payload: companyData as Omit<Company, 'id'> });
        }
        showNotification(`Empresa ${'id' in companyData ? 'atualizada' : 'adicionada'} com sucesso!`);
        setIsCompanyModalOpen(false);
        setEditingCompany(null);
    };

    const handleDeleteCompany = (companyId: string) => {
        if (companyId === 'company-1') {
            alert("A empresa principal 'Business Hub Pro Inc.' não pode ser removida por segurança.");
            return;
        }
        const companyToDelete = companies.find(c => c.id === companyId);
        if (companyToDelete && window.confirm(`Tem certeza que deseja deletar a empresa "${companyToDelete.name}"? Todos os dados associados serão removidos.`)) {
            dispatch({ type: 'DELETE_COMPANY', payload: companyId });
            showNotification('Empresa removida com sucesso!');
        }
    };

    const handleCategoryChange = (id: string, field: 'name' | 'icon' | 'color', value: string) => {
        setLocalCategories(prevCategories => {
            setIsDirty(true);
            return prevCategories.map(cat =>
                cat.id === id ? { ...cat, [field]: value, isNew: false } : cat
            );
        });
    };

    const handleAddNewCategory = () => {
        setLocalCategories(prevCategories => {
            setIsDirty(true);
            return [
                ...prevCategories,
                {
                    id: `new-cat-${Date.now()}`,
                    name: 'Nova Categoria',
                    icon: 'TagIcon',
                    color: 'gray',
                    isNew: true
                }
            ];
        });
    };

    const handleCategoryDelete = (idToDelete: string) => {
        setLocalCategories(prevCategories => {
            if (prevCategories.length <= 1) {
                alert("Deve haver pelo menos uma categoria.");
                return prevCategories;
            }

            const categoryName = prevCategories.find(c => c.id === idToDelete)?.name || 'esta categoria';

            if (window.confirm(`Tem certeza que deseja remover a categoria "${categoryName}"?`)) {
                setIsDirty(true);
                return prevCategories.filter(cat => cat.id !== idToDelete);
            }

            return prevCategories;
        });
    };

    const handleSaveChangesToCategories = () => {
        const nameSet = new Set<string>();
        for (const cat of localCategories) {
            if (!cat.name.trim()) {
                alert("O nome da categoria não pode estar vazio.");
                return;
            }
            if (nameSet.has(cat.name.trim())) {
                alert(`O nome da categoria "${cat.name.trim()}" está duplicado.`);
                return;
            }
            nameSet.add(cat.name.trim());
        }

        const newConfig = localCategories.reduce((acc, cat) => {
            acc[cat.name.trim()] = { icon: cat.icon, color: cat.color };
            return acc;
        }, {} as { [key: string]: { icon: string; color: string; } });

        dispatch({ type: 'UPDATE_CATEGORY_CONFIG', payload: newConfig });

        setLocalCategories(prev => prev.map(cat => ({ ...cat, name: cat.name.trim() })));

        showNotification('Categorias salvas com sucesso!', 'success');
        setIsDirty(false);
    };

    const handleTabClick = (tab: SettingsTab) => {
        if (activeTab === 'categories' && tab !== 'categories' && isDirty) {
            if (window.confirm('Você tem alterações não salvas. Deseja descartá-las?')) {
                setLocalCategories(Object.entries(appointmentCategoryConfig).map(([name, value], index) => ({
                    id: `initial-cat-${index}`,
                    name,
                    ...value,
                })));
                setIsDirty(false);
                setActiveTab(tab);
            }
        } else {
            setActiveTab(tab);
        }
    };
    
    // --- System Customization Handlers ---
    const handleSystemLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSystemLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveSystemLogo = () => {
        if (systemLogo) {
            localStorage.setItem('system_logo_url', systemLogo);
        } else {
            localStorage.removeItem('system_logo_url');
        }
        setInitialSystemLogo(systemLogo);
        showNotification(t('notifications.systemLogoUpdated'), 'success');
    };
    
    const handleRemoveSystemLogo = () => {
        setSystemLogo(null);
    };


    // --- Permission Handlers ---
    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId);
            if (user) {
                const currentPermissions = new Set(user.permissions);
                setUserPermissions(currentPermissions);
                setInitialPermissions(currentPermissions);
            }
        } else {
            setUserPermissions(new Set());
            setInitialPermissions(new Set());
        }
    }, [selectedUserId, users]);

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setUserPermissions(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(permission);
            } else {
                newSet.delete(permission);
            }
            return newSet;
        });
    };

    const handleSavePermissions = () => {
        if (!selectedUserId) return;
        const permissionsArray = Array.from(userPermissions);
        dispatch({
            type: 'UPDATE_USER_PERMISSIONS',
            payload: { userId: selectedUserId, permissions: permissionsArray }
        });
        setInitialPermissions(new Set(permissionsArray)); // Update initial state after saving
        showNotification('Permissões salvas com sucesso!');
    };

    const areSetsEqual = (a: Set<any>, b: Set<any>) => {
        if (a.size !== b.size) return false;
        for (const item of a) {
            if (!b.has(item)) return false;
        }
        return true;
    };

    const hasPermissionChanges = !areSetsEqual(initialPermissions, userPermissions);


    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">Configurações</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => handleTabClick('company')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'company' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('settings.tabs.myCompany')}
                    </button>
                    {hasPermission('MANAGE_USERS') && (
                        <button onClick={() => handleTabClick('users')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            {t('settings.tabs.users')}
                        </button>
                    )}
                    {hasPermission('MANAGE_CATEGORIES') && (
                        <button onClick={() => handleTabClick('categories')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            {t('settings.tabs.categories')}
                        </button>
                    )}
                    {isSuperAdmin && hasPermission('MANAGE_ALL_COMPANIES') && (
                        <button onClick={() => handleTabClick('companies')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'companies' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            {t('settings.tabs.companies')}
                        </button>
                    )}
                     {isSuperAdmin && hasPermission('MANAGE_PERMISSIONS') && (
                        <button onClick={() => handleTabClick('permissions')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                           {t('settings.tabs.permissions')}
                        </button>
                    )}
                    {isSuperAdmin && (
                        <button onClick={() => handleTabClick('systemCustomization')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'systemCustomization' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                           {t('settings.tabs.systemCustomization')}
                        </button>
                    )}
                </nav>
            </div>

            {activeTab === 'company' && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-6">Informações da Empresa</h2>
                    <form onSubmit={handleCompanySubmit} className="space-y-6 max-w-3xl">
                        <div className="flex flex-col items-center gap-4 pt-2 pb-6 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-secondary dark:text-gray-200">Logo da Empresa</h3>
                            <UserProfile user={{ name: companyData.name, avatarUrl: companyData.logoUrl }} className="w-24 h-24 rounded-md object-contain" />
                            {hasPermission('MANAGE_COMPANY_INFO') && (
                                <>
                                    <input type="file" id="logo-upload" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                                    <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                        Alterar Logo
                                    </label>
                                </>
                            )}
                        </div>
                        <fieldset disabled={!hasPermission('MANAGE_COMPANY_INFO')} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Empresa</label>
                                    <input type="text" name="name" id="name" value={companyData.name} onChange={handleCompanyChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                                </div>
                                <div>
                                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                                    <input type="text" name="cnpj" id="cnpj" value={companyData.cnpj} onChange={handleCompanyChange} required maxLength={18} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                                <input type="text" name="address" id="address" value={companyData.address} onChange={handleCompanyChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail de Contato</label>
                                    <input type="email" name="email" id="email" value={companyData.email} onChange={handleCompanyChange} required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Por favor, insira um endereço de e-mail válido." className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                                    <input type="tel" name="phone" id="phone" value={companyData.phone} onChange={handleCompanyChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary disabled:bg-gray-100 dark:disabled:bg-gray-700" />
                                </div>
                            </div>
                        </fieldset>
                         {hasPermission('MANAGE_COMPANY_INFO') && (
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">Salvar Alterações</button>
                            </div>
                        )}
                    </form>
                </div>
            )}
            
            {activeTab === 'users' && (
                <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-secondary dark:text-gray-100">Gerenciamento de Usuários</h2>
                        <button onClick={() => handleOpenUserModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Adicionar Usuário
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Permissão</th>
                                    {isSuperAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Empresa</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {userUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserProfile user={user} className="w-10 h-10 mr-4"/>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                                        {isSuperAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{companies.find(c => c.id === user.companyId)?.name}</td>}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleOpenUserModal(user)} className="text-primary hover:text-primary-hover">
                                                <EditIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
             {activeTab === 'companies' && isSuperAdmin && (
                 <div className="mt-8">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-secondary dark:text-gray-100">Gerenciamento de Empresas</h2>
                        <button onClick={() => handleOpenCompanyModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Adicionar Empresa
                        </button>
                    </div>
                     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nome da Empresa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CNPJ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {companies.map(comp => (
                                    <tr key={comp.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{comp.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{comp.cnpj}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="flex items-center gap-4">
                                                <button onClick={() => handleOpenCompanyModal(comp)} className="text-primary hover:text-primary-hover"><EditIcon /></button>
                                                <button onClick={() => handleDeleteCompany(comp.id)} className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'categories' && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-secondary dark:text-gray-100">Categorias de Compromissos</h2>
                        <div className="flex items-center gap-4">
                             {isDirty && (
                                <button onClick={handleSaveChangesToCategories} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                    Salvar Alterações
                                </button>
                            )}
                            <button onClick={handleAddNewCategory} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors">
                                <PlusIcon className="w-5 h-5" />
                                Nova Categoria
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {localCategories.map(cat => {
                            const IconComponent = iconMap[cat.icon] || null;
                            return (
                                <div key={cat.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-fade-in-up">
                                    <div className="md:col-span-1 flex items-center justify-center">
                                         {IconComponent && <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
                                    </div>
                                    <div className="md:col-span-4">
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                                            className="w-full border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <IconPicker value={cat.icon} onChange={(iconName) => handleCategoryChange(cat.id, 'icon', iconName)} />
                                    </div>
                                     <div className="md:col-span-2 flex items-center justify-center gap-2">
                                        {availableColors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleCategoryChange(cat.id, 'color', color)}
                                                className={`w-6 h-6 rounded-full transition-transform duration-150 ${colorClasses[color]} ${cat.color === color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary' : ''}`}
                                                aria-label={`Selecionar cor ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <button onClick={() => handleCategoryDelete(cat.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
             {activeTab === 'permissions' && isSuperAdmin && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-6">Permissões Detalhadas por Usuário</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* User List */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione um Usuário</label>
                            <ul className="space-y-1 max-h-96 overflow-y-auto border dark:border-gray-700 rounded-md p-2">
                                {users.filter(user => user.id !== currentUser.id).map(user => (
                                    <li key={user.id}>
                                        <button
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`w-full text-left p-2 rounded-md transition-colors ${selectedUserId === user.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            {user.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Permission List */}
                        <div className="md:col-span-2">
                             {selectedUserId ? (
                                <div>
                                    <h3 className="font-semibold text-lg text-secondary dark:text-gray-200 mb-4">Editando permissões para: {users.find(u => u.id === selectedUserId)?.name}</h3>
                                    <div className="space-y-6 max-h-[28rem] overflow-y-auto pr-2">
                                        {permissionGroups.map(group => {
                                            const manageablePermissionsInGroup = group.permissions.filter(p => USER_MANAGEABLE_PERMISSIONS.includes(p as Permission));
                                            if (manageablePermissionsInGroup.length === 0) return null;

                                            return (
                                                <div key={group.title}>
                                                    <h4 className="text-md font-semibold text-secondary dark:text-gray-300 border-b dark:border-gray-600 pb-2 mb-3">{group.title}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                                        {manageablePermissionsInGroup.map(permission => (
                                                            <label key={permission} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={userPermissions.has(permission as Permission)}
                                                                    onChange={(e) => handlePermissionChange(permission as Permission, e.target.checked)}
                                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-primary focus:ring-primary bg-gray-100 dark:bg-gray-900"
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">{permissionDescriptions[permission as Permission]}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                          onClick={handleSavePermissions} 
                                          disabled={!hasPermissionChanges}
                                          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed"
                                        >
                                            Salvar Permissões
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <p>Selecione um usuário para ver e editar suas permissões.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'systemCustomization' && isSuperAdmin && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-2">{t('settings.customization.title')}</h2>
                    <p className="text-medium dark:text-gray-400 mb-6">{t('settings.customization.logoDescription')}</p>

                    <div className="pt-6 border-t dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-secondary dark:text-gray-200">{t('settings.customization.logoTitle')}</h3>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-48 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                                {systemLogo ? (
                                    <img src={systemLogo} alt="Pré-visualização do Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-gray-500 text-sm text-center">{t('app.title.full')}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="file" id="system-logo-upload" className="sr-only" onChange={handleSystemLogoFileChange} accept="image/png, image/jpeg, image/svg+xml" />
                                <label htmlFor="system-logo-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {t('settings.customization.changeLogo')}
                                </label>
                                {systemLogo && (
                                    <button onClick={handleRemoveSystemLogo} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60">
                                        {t('settings.customization.removeLogo')}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700">
                            <button
                                onClick={handleSaveSystemLogo}
                                disabled={systemLogo === initialSystemLogo}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed">
                                {t('common.saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={() => setIsUserModalOpen(false)} isSuperAdmin={isSuperAdmin} allCompanies={companies} currentUser={currentUser} />
            </Modal>
             <Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} title={editingCompany ? 'Editar Empresa' : 'Adicionar Empresa'}>
                <CompanyForm company={editingCompany} onSave={handleSaveCompany} onCancel={() => setIsCompanyModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Settings;