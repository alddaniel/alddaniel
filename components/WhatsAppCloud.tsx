import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useLocalization } from '../contexts/LocalizationContext';
import Breadcrumbs from './Breadcrumbs';
import { CheckCircleIcon, InformationCircleIcon, TrashIcon, LockIcon, EditIcon, PlusIcon, SearchIcon, UserProfile, AlertTriangleIcon } from './Icons';
import { Modal } from './Modal';
import { useAppState } from '../state/AppContext';
import { Customer } from '../types';
import { Link } from 'react-router-dom';

type Contact = { id: string; name: string; phone: string };
type Log = { id: string; message: string; type: 'success' | 'error' };
type Template = { id: string; apiName: string; name: string; body: string; params: number; isDefault?: boolean };

const cleanPhoneNumber = (phone: string) => phone.replace(/\D/g, '');

// --- Template Form Modal ---
interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: Omit<Template, 'id' | 'params' | 'isDefault'>) => void;
    template: Template | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, onSave, template }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({ name: '', apiName: '', body: '' });
    const [apiNameError, setApiNameError] = useState('');

    useEffect(() => {
        if (template) {
            setFormData({ name: template.name, apiName: template.apiName, body: template.body });
        } else {
            setFormData({ name: '', apiName: '', body: '' });
        }
        setApiNameError('');
    }, [template, isOpen]);
    
    const paramCount = useMemo(() => {
        const matches = formData.body.match(/\{\{[0-9]+\}\}/g) || [];
        if (matches.length === 0) return 0;
        
        const paramNumbers = matches.map(m => parseInt(m.replace(/\{|\}/g, ''), 10));
        return paramNumbers.length > 0 ? Math.max(0, ...paramNumbers) : 0;

    }, [formData.body]);


    const handleApiNameChange = (value: string) => {
        const cleanedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setFormData(prev => ({ ...prev, apiName: cleanedValue }));
        if (value !== cleanedValue) {
            setApiNameError(t('whatsapp.templates.form.apiNameError'));
        } else {
            setApiNameError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiNameError) return;
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={template ? t('whatsapp.templates.modalTitleEdit') : t('whatsapp.templates.modalTitleCreate')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.templates.form.nameLabel')}</label>
                    <input id="templateName" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="apiName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.templates.form.apiNameLabel')}</label>
                    <input id="apiName" type="text" value={formData.apiName} onChange={e => handleApiNameChange(e.target.value)} required placeholder={t('whatsapp.templates.form.apiNamePlaceholder')} readOnly={!!template} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary read-only:bg-gray-100 dark:read-only:bg-gray-700 read-only:cursor-not-allowed"/>
                    {apiNameError && <p className="text-red-500 text-xs mt-1">{apiNameError}</p>}
                </div>
                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.templates.form.bodyLabel')}</label>
                    <textarea id="body" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} required rows={4} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"></textarea>
                    <p className="text-xs text-gray-500 mt-1">{t('whatsapp.templates.form.bodyHint')}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.templates.form.paramsLabel')}</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-200 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{paramCount}</p>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{t('common.save')}</button>
                </div>
            </form>
        </Modal>
    );
};


const WhatsAppSender: React.FC = () => {
    const { t } = useLocalization();
    const { state, dispatch } = useAppState();
    const { currentUser, customers } = state;
    const logEndRef = useRef<HTMLDivElement>(null);
    
    const [apiConfig, setApiConfig] = useState<{ phoneId: string; token: string } | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [params, setParams] = useState<string[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [contactsToSave, setContactsToSave] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');
    const [manualName, setManualName] = useState('');
    const [manualPhone, setManualPhone] = useState('');
    const [rate, setRate] = useState(4);
    const [isSending, setIsSending] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const isSendingRef = useRef(false);
    
    const [searchTerm, setSearchTerm] = useState('');

    // Template Management State
    const [customTemplates, setCustomTemplates] = useState<Template[]>(() => {
        const saved = localStorage.getItem('wa_custom_templates');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return [];
            }
        }
        return [];
    });
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    
    const templates = useMemo(() => {
        const defaultTemplates: Template[] = [
            { id: 't1', apiName: 'hello_world', name: t('whatsapp.templates.hello_world.name'), body: t('whatsapp.templates.hello_world.body'), params: 1, isDefault: true },
            { id: 't2', apiName: 'order_update', name: t('whatsapp.templates.order_update.name'), body: t('whatsapp.templates.order_update.body'), params: 3, isDefault: true },
            { id: 't3', apiName: 'appointment_reminder', name: t('whatsapp.templates.appointment_reminder.name'), body: t('whatsapp.templates.appointment_reminder.body'), params: 2, isDefault: true },
        ];
        return [...defaultTemplates, ...customTemplates];
    }, [t, customTemplates]);

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        return contacts.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.phone.includes(searchTerm)
        );
    }, [contacts, searchTerm]);

    useEffect(() => {
        localStorage.setItem('wa_custom_templates', JSON.stringify(customTemplates));
    }, [customTemplates]);

    useEffect(() => {
        const savedPhoneId = localStorage.getItem('wa_phone_id');
        const savedToken = localStorage.getItem('wa_access_token');
        if (savedPhoneId && savedToken) {
            setApiConfig({ phoneId: savedPhoneId, token: savedToken });
        } else {
            setApiConfig(null);
        }
    }, []);

    useEffect(() => { isSendingRef.current = isSending; }, [isSending]);
    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = templates.find(t => t.id === templateId);
        setParams(Array(Math.max(0, (template?.params || 0) - 1)).fill(''));
    };

    const handleParamChange = (index: number, value: string) => {
        setParams(prev => prev.map((p, i) => i === index ? value : p));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json<any>(worksheet);
            const newContacts = json.map((row, index) => ({
                id: `file-${index}-${Date.now()}`,
                name: String(row.Name || row.name || row.Nome || row.nome || ''),
                phone: cleanPhoneNumber(String(row.Phone || row.phone || row.Telefone || row.telefone || '')),
            })).filter(c => c.name && c.phone);
            setContacts(prev => [...prev, ...newContacts]);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualName && manualPhone) {
            setContacts(prev => [...prev, { id: `manual-${Date.now()}`, name: manualName, phone: cleanPhoneNumber(manualPhone) }]);
            setManualName('');
            setManualPhone('');
        }
    };

    const handleToggleContactSend = (contactId: string) => {
        setSelectedContacts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(contactId)) {
                newSet.delete(contactId);
            } else {
                newSet.add(contactId);
            }
            return newSet;
        });
    };

    const handleToggleContactSave = (contactId: string) => {
        setContactsToSave(prev => {
            const newSet = new Set(prev);
            if (newSet.has(contactId)) {
                newSet.delete(contactId);
            } else {
                newSet.add(contactId);
            }
            return newSet;
        });
    };
    
    const handleToggleSelectAllSend = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const filteredIds = new Set(filteredContacts.map(c => c.id));
        
        setSelectedContacts(prev => {
            const newSet = new Set(prev);
            if(isChecked) {
                filteredIds.forEach(id => newSet.add(id));
            } else {
                filteredIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };
    
    const handleToggleSelectAllSave = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const filteredIds = new Set(filteredContacts.map(c => c.id));

        setContactsToSave(prev => {
            const newSet = new Set(prev);
             if(isChecked) {
                filteredIds.forEach(id => newSet.add(id));
            } else {
                filteredIds.forEach(id => newSet.delete(id));
            }
            return newSet;
        });
    };
    
    const handleSaveTemplate = (templateData: Omit<Template, 'id' | 'params' | 'isDefault'>) => {
        const matches = templateData.body.match(/\{\{[0-9]+\}\}/g) || [];
        const paramNumbers = matches.map(m => parseInt(m.replace(/\{|\}/g, ''), 10));
        const paramCount = paramNumbers.length > 0 ? Math.max(...paramNumbers) : 0;
        
        if (editingTemplate) {
            setCustomTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...templateData, params: paramCount } : t));
        } else {
            const newTemplate: Template = { id: `custom-${Date.now()}`, ...templateData, params: paramCount, isDefault: false };
            setCustomTemplates(prev => [...prev, newTemplate]);
        }
    };

    const handleDeleteTemplate = (templateId: string) => {
        const templateToDelete = templates.find(t => t.id === templateId);
        if (!templateToDelete) return;
        if (templateToDelete.isDefault) {
            alert(t('whatsapp.templates.deleteErrorDefault'));
            return;
        }
        if (window.confirm(t('whatsapp.templates.confirmDelete', { name: templateToDelete.name }))) {
            setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
        }
    };

    const removeContact = (id: string) => {
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelectedContacts(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        setContactsToSave(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleSaveSelectedContacts = () => {
        if (!currentUser) return;
        
        const contactsToSaveList = contacts.filter(c => contactsToSave.has(c.id));
        if (contactsToSaveList.length === 0) return;

        const existingPhones = new Set(customers.map(c => cleanPhoneNumber(c.phone)).filter(Boolean));
        let savedCount = 0;
        let skippedCount = 0;

        contactsToSaveList.forEach(contact => {
            const cleanedContactPhone = cleanPhoneNumber(contact.phone);
            if (cleanedContactPhone && !existingPhones.has(cleanedContactPhone)) {
                const newCustomer: Customer = {
                    id: `cust-${Date.now()}-${Math.random()}`,
                    name: contact.name,
                    type: 'Individual',
                    identifier: '',
                    phone: contact.phone,
                    email: '',
                    cep: '',
                    address: '',
                    status: 'Active',
                    createdAt: new Date(),
                    interactions: [],
                    documents: [],
                    companyId: currentUser.companyId,
                };
                dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
                dispatch({ type: 'ADD_ACTIVITY_LOG', payload: { id: `log-${Date.now()}`, date: new Date(), type: 'Cliente', descriptionKey: 'activityLog.NEW_CUSTOMER', descriptionParams: { name: newCustomer.name }, companyId: currentUser.companyId }});

                existingPhones.add(cleanedContactPhone);
                savedCount++;
            } else {
                skippedCount++;
            }
        });
        
        if (savedCount > 0) {
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customersAddedBatch', type: 'success', messageParams: { count: savedCount } } });
        }
        if (skippedCount > 0) {
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.customersSkippedBatch', type: 'info', messageParams: { count: skippedCount } } });
        }
        
        setContactsToSave(new Set());
    };

    const stopSending = () => setIsSending(false);
    const addLog = (message: string, type: 'success' | 'error') => setLogs(prev => [...prev, { id: `log-${Date.now()}`, message, type }]);

    const handleStartSending = async () => {
        if (!apiConfig?.phoneId || !apiConfig?.token) {
            addLog(t('whatsapp.configError'), 'error');
            return;
        }
        setIsSending(true);
        setLogs([]);
        isSendingRef.current = true;
        const delay = (60 / rate) * 1000;
        const contactsToSend = contacts.filter(c => selectedContacts.has(c.id));
        
        setProgress({ current: 0, total: contactsToSend.length });

        for (let i = 0; i < contactsToSend.length; i++) {
            if (!isSendingRef.current) break;
            const contact = contactsToSend[i];
            setProgress({ current: i + 1, total: contactsToSend.length });
            const template = templates.find(t => t.id === selectedTemplateId);
            if (!template) continue;

            const components = [{ type: 'body', parameters: [{ type: 'text', text: contact.name }, ...params.map(p => ({ type: 'text', text: p }))] }];
            const payload = { messaging_product: "whatsapp", to: contact.phone, type: "template", template: { name: template.apiName, language: { code: "pt_BR" }, components } };

            try {
                // MOCK API call
                console.log('Sending payload:', JSON.stringify(payload));
                await new Promise(res => setTimeout(res, 200)); 
                addLog(t('whatsapp.logSuccess', { name: contact.name, phone: contact.phone }), 'success');
            } catch (error: any) {
                addLog(t('whatsapp.logError', { name: contact.name, phone: contact.phone, error: error.message }), 'error');
            }
            if (i < contacts.length - 1) await new Promise(resolve => setTimeout(resolve, delay));
        }
        setIsSending(false);
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary space-y-6">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('whatsapp.title')}</h1>
            
            {!apiConfig && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><AlertTriangleIcon className="w-6 h-6 text-yellow-500 mr-4"/></div>
                        <div>
                            <p className="font-bold">{t('whatsapp.configMissing.title')}</p>
                            <p className="text-sm">{t('whatsapp.configMissing.message')}</p>
                            <Link to="/settings" state={{ tab: 'integrations' }} className="mt-2 inline-block bg-yellow-200 dark:bg-yellow-700/50 text-yellow-800 dark:text-yellow-200 font-bold py-1 px-3 rounded text-xs hover:bg-yellow-300 dark:hover:bg-yellow-700">
                                {t('whatsapp.configMissing.goToSettings')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Step 2: Compose */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                        <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-4">{t('whatsapp.step2')}</h2>
                        <div>
                            <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.templateLabel')}</label>
                            <select id="template" value={selectedTemplateId} onChange={e => handleTemplateChange(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary">
                                <option value="">{t('whatsapp.templatePlaceholder')}</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        {selectedTemplateId && (
                            <div className="mt-4 space-y-3">
                                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('whatsapp.parametersTitle')}</h3>
                                <p className="text-xs text-gray-500">{t('whatsapp.paramInfo', { name: '{{1}}' })}</p>
                                {params.map((p, i) => (
                                    <div key={i}>
                                        <label htmlFor={`param-${i}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{`{{${i+2}}}`}</label>
                                        <input id={`param-${i}`} value={p} onChange={e => handleParamChange(i, e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"/>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Template Management */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-secondary dark:text-gray-100">{t('whatsapp.templates.manageTitle')}</h2>
                            <button onClick={() => { setEditingTemplate(null); setIsTemplateModalOpen(true); }} className="flex items-center gap-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20">
                                <PlusIcon className="w-4 h-4" /> {t('whatsapp.templates.createButton')}
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {templates.map(template => (
                                <div key={template.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{template.name} {template.isDefault && <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full ml-2">{t('whatsapp.templates.defaultBadge')}</span>}</p>
                                        <p className="text-xs text-gray-500 font-mono">{template.apiName}</p>
                                    </div>
                                    {!template.isDefault && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => { setEditingTemplate(template); setIsTemplateModalOpen(true); }} className="text-primary hover:text-primary-hover p-1"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Step 3: Contacts */}
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                        <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-4">{t('whatsapp.step3')}</h2>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-4"><button onClick={() => setActiveTab('file')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'file' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t('whatsapp.contactSource.file')}</button><button onClick={() => setActiveTab('manual')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t('whatsapp.contactSource.manual')}</button></nav>
                        </div>
                        <div className="pt-6">
                            {activeTab === 'file' && <div><p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('whatsapp.file.instructions')}</p><input type="file" onChange={handleFileChange} accept=".xlsx, .csv" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></div>}
                            {activeTab === 'manual' && <form onSubmit={handleManualAdd} className="space-y-3"><input value={manualName} onChange={e => setManualName(e.target.value)} placeholder={t('whatsapp.manual.nameLabel')} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" /><input value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder={t('whatsapp.manual.phoneLabel')} className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" /><button type="submit" className="bg-primary/10 text-primary font-semibold py-2 px-4 rounded-lg">{t('whatsapp.manual.addButton')}</button></form>}
                        </div>
                    </div>
                    {/* Contact List */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                        <h3 className="text-lg font-bold text-secondary dark:text-gray-100 mb-2">{t('whatsapp.contactList.title')}</h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('whatsapp.contactList.summary.total')}</p><p className="text-xl font-bold text-secondary dark:text-gray-200">{contacts.length}</p></div>
                            <div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('whatsapp.contactList.summary.toSend')}</p><p className="text-xl font-bold text-primary">{selectedContacts.size}</p></div>
                            <div><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('whatsapp.contactList.summary.toSave')}</p><p className="text-xl font-bold text-green-600">{contactsToSave.size}</p></div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-b dark:border-gray-700 pb-4">
                            <div className="relative w-full sm:w-auto">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('whatsapp.contactList.searchPlaceholder')} className="pl-9 pr-3 py-1.5 w-full border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" onChange={handleToggleSelectAllSend} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>{t('whatsapp.contactList.selectAllSend')}</label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" onChange={handleToggleSelectAllSave} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>{t('whatsapp.contactList.selectAllSave')}</label>
                            </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto pr-2">
                          {filteredContacts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredContacts.map(c => (
                                    <div key={c.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-3">
                                        <UserProfile user={{ name: c.name }} className="w-8 h-8 flex-shrink-0" />
                                        <div className="flex-grow overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <input type="checkbox" title={t('whatsapp.contactList.sendHeader')} checked={selectedContacts.has(c.id)} onChange={() => handleToggleContactSend(c.id)} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                            <input type="checkbox" title={t('whatsapp.contactList.saveHeader')} checked={contactsToSave.has(c.id)} onChange={() => handleToggleContactSave(c.id)} className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                            <button onClick={() => removeContact(c.id)}><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                          ) : <p className="text-center text-gray-500 py-4">{t('whatsapp.contactList.empty')}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 4 & Logs */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                <h2 className="text-xl font-bold text-secondary dark:text-gray-100 mb-4">{t('whatsapp.step4')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.rateLabel')}</label>
                        <input id="rate" type="number" min="1" max="60" value={rate} onChange={e => setRate(Number(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                        <button onClick={handleSaveSelectedContacts} disabled={contactsToSave.size === 0} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-600/50">{t('whatsapp.saveButton', { count: contactsToSave.size })}</button>
                        {!isSending ? <button onClick={handleStartSending} disabled={selectedContacts.size === 0 || !selectedTemplateId} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover disabled:bg-primary/50">{t('whatsapp.startButton', { count: selectedContacts.size })}</button>
                         : <button onClick={stopSending} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700">{t('whatsapp.stopButton')}</button>}
                    </div>
                </div>
                {isSending && (
                    <div className="mt-4 text-center">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{t('whatsapp.sendingStatus.sending', {current: progress.current, total: progress.total})}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2"><div className="bg-primary h-2.5 rounded-full" style={{width: `${(progress.current/progress.total)*100}%`}}></div></div>
                    </div>
                )}
            </div>
            <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl font-mono text-sm transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                <h3 className="text-lg font-bold text-gray-300 mb-4">{t('whatsapp.logTitle')}</h3>
                <div className="max-h-64 h-64 overflow-y-auto space-y-2">
                    {logs.length > 0 ? logs.map(log => <p key={log.id} className={log.type === 'success' ? 'text-green-400' : 'text-red-400'}>{`[${new Date().toLocaleTimeString()}] ${log.message}`}</p>) : <p className="text-gray-500">{t('whatsapp.logEmpty')}</p>}
                    <div ref={logEndRef} />
                </div>
            </div>

            <TemplateFormModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSave={handleSaveTemplate} template={editingTemplate} />
        </div>
    );
};

export default WhatsAppSender;