import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Customer, Interaction, User, Document, Appointment, AppointmentStatus } from '../types';
import { useAppState } from '../state/AppContext';
import { analyzeCustomerInteractions } from '../services/geminiService';
import { SparklesIcon, PhoneIcon, EnvelopeIcon, UsersIcon, TagIcon, FileIcon, PaperClipIcon, TrashIcon, WarningIcon, ChevronLeftIcon, AgendaIcon, ClockIcon, ClockRewindIcon, CalendarCheckIcon } from './Icons';
import { UserProfile } from './Icons';
import Breadcrumbs from './Breadcrumbs';
import { Modal } from './Modal';
import { useLocalization } from '../contexts/LocalizationContext';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm flex items-start gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-medium dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-secondary dark:text-gray-100">{value}</p>
        </div>
    </div>
);


const CustomerDetailPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { state, dispatch } = useAppState();
    const { customers, users, appointments, companies, plans } = state;
    const { t, locale, language } = useLocalization();
    const navigate = useNavigate();

    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [interactionNotes, setInteractionNotes] = useState('');
    const [interactionType, setInteractionType] = useState<Interaction['type']>('note');
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
    const companyUsers = useMemo(() => users.filter(u => u.companyId === customer?.companyId), [users, customer]);
    const customerAppointments = useMemo(() => appointments.filter(a => a.customerId === customerId), [appointments, customerId]);
    
    const customerCompany = useMemo(() => companies.find(c => c.id === customer?.companyId), [companies, customer]);
    const customerPlan = useMemo(() => plans.find(p => p.id === customerCompany?.planId), [plans, customerCompany]);
    const canUseAI = customerPlan?.hasAI ?? false;
    
    const { upcomingAppointments, pastAppointments, lastInteractionDate } = useMemo(() => {
        if (!customer) return { upcomingAppointments: [], pastAppointments: [], lastInteractionDate: null };
        return {
            upcomingAppointments: customerAppointments.filter(a => a.start > new Date()).sort((a,b) => a.start.getTime() - b.start.getTime()),
            pastAppointments: customerAppointments.filter(a => a.start <= new Date()).sort((a,b) => b.start.getTime() - a.start.getTime()),
            lastInteractionDate: customer.interactions.length > 0 ? customer.interactions[0].date : null
        }
    }, [customer, customerAppointments]);


    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
    };

    const handleAnalyzeInteractions = async () => {
        if (!customer) return;
        setIsAnalysisModalOpen(true);
        setIsAnalysisLoading(true);
        dispatch({ type: 'SHOW_LOADING' });
        setAnalysisResult('');
        
        const langMap: { [key: string]: string } = { pt: 'Portuguese', es: 'Spanish', en: 'English' };
        const languageName = langMap[language] || 'English';

        try {
            const result = await analyzeCustomerInteractions(customer.interactions, customerAppointments, customer.name, users, languageName, locale);
            setAnalysisResult(result);
        } finally {
            setIsAnalysisLoading(false);
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

     const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && customer) {
            for (const file of Array.from(e.target.files) as File[]) {
                const base64 = await fileToBase64(file);
                const newDocument: Document = {
                    id: `doc-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    url: base64,
                    uploadedAt: new Date(),
                };
                const updatedCustomer = {...customer, documents: [...customer.documents, newDocument]};
                handleUpdateCustomer(updatedCustomer);
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.documentAdded', messageParams: { name: newDocument.name }, type: 'success' } });
            }
        }
    };
    
    const handleDeleteDocument = (doc: Document) => {
        if (!customer) return;
        const updatedCustomer = {...customer, documents: customer.documents.filter(d => d.id !== doc.id)};
        handleUpdateCustomer(updatedCustomer);
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.documentRemoved', type: 'success' } });
        setDocumentToDelete(null);
    };

    const handleAddInteraction = () => {
        if (interactionNotes.trim() && state.currentUser && customer) {
            const newInteraction: Interaction = {
                id: `int-${Date.now()}`,
                date: new Date(),
                notes: interactionNotes.trim(),
                type: interactionType,
                userId: state.currentUser.id,
              };
            const updatedCustomer = {...customer, interactions: [newInteraction, ...customer.interactions]};
            handleUpdateCustomer(updatedCustomer);

            dispatch({
              type: 'ADD_ACTIVITY_LOG',
              payload: {
                id: `log-${Date.now()}`,
                date: new Date(),
                type: 'Cliente',
                descriptionKey: 'activityLog.NEW_INTERACTION',
                descriptionParams: { type: t(`customers.detailsView.addInteraction.types.${interactionType}`), name: customer.name },
                companyId: state.currentUser.companyId
              }
            });

            setInteractionNotes('');
            setInteractionType('note');
        }
    };

    const interactionTypeIcons: Record<Interaction['type'], React.FC<{className?: string}>> = {
        call: PhoneIcon, email: EnvelopeIcon, meeting: UsersIcon, note: TagIcon,
    };

    if (!customer) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-600">Customer not found</h2>
                <button onClick={() => navigate('/customers')} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
                    Back to Customers
                </button>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <UserProfile user={customer} className="w-16 h-16" />
                    <div>
                        <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{customer.name}</h1>
                        <p className="text-medium dark:text-gray-400">{t(customer.type === 'Individual' ? 'customers.typePerson' : 'customers.typeCompany')}</p>
                    </div>
                </div>
                <button onClick={() => navigate('/customers')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    <ChevronLeftIcon className="w-4 h-4" /> {t('sidebar.customers')}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                <StatCard title={t('customers.detailsView.summaryCards.totalAppointments')} value={customerAppointments.length} icon={<CalendarCheckIcon className="w-6 h-6"/>} />
                <StatCard title={t('customers.detailsView.summaryCards.upcomingAppointments')} value={upcomingAppointments.length} icon={<AgendaIcon className="w-6 h-6"/>} />
                <StatCard title={t('customers.detailsView.summaryCards.lastInteraction')} value={lastInteractionDate ? lastInteractionDate.toLocaleDateString(locale) : 'N/A'} icon={<ClockRewindIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {canUseAI && (customer.interactions.length > 0 || customerAppointments.length > 0) && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-bold text-secondary dark:text-gray-200 mb-2">{t('customers.detailsView.aiAnalysisTitle', { name: customer.name })}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('customers.detailsView.aiAnalysisDescription')}</p>
                            <button onClick={handleAnalyzeInteractions} className="w-full flex items-center justify-center gap-2 bg-indigo-100 text-primary dark:bg-indigo-900/40 dark:text-indigo-300 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors">
                                <SparklesIcon /> {t('customers.analysis.button')}
                            </button>
                        </div>
                    )}
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-secondary dark:text-gray-200 mb-4">{t('customers.detailsView.appointments.title')}</h3>
                        <div className="space-y-4">
                            <h4 className="text-md font-semibold text-primary">{t('customers.detailsView.appointments.upcoming')}</h4>
                            {upcomingAppointments.length > 0 ? (
                                <ul className="space-y-3">
                                {upcomingAppointments.map(app => (
                                    <li key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                                        <AgendaIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                        <div className="flex-grow"><p className="font-semibold text-sm">{app.title}</p><p className="text-xs text-gray-500">{app.start.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}</p></div>
                                        <button onClick={() => navigate('/agenda')} className="ml-auto text-xs font-semibold text-primary hover:underline">{t('customers.detailsView.appointments.viewInAgenda')}</button>
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">{t('customers.detailsView.appointments.none')}</p>}

                            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-400 pt-2 border-t dark:border-gray-700">{t('customers.detailsView.appointments.past')}</h4>
                            {pastAppointments.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {pastAppointments.map(app => (
                                    <li key={app.id} className="flex items-center gap-3 p-2 text-gray-500 dark:text-gray-400">
                                        <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                        <p className="text-sm">{app.title} <span className="text-xs">({app.start.toLocaleDateString(locale)})</span></p>
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">{t('customers.detailsView.appointments.none')}</p>}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-secondary dark:text-gray-200 mb-4">{t('customers.detailsView.tabs.interactions')}</h3>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-6">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('customers.detailsView.addInteraction.title')}</h4>
                            <textarea value={interactionNotes} onChange={(e) => setInteractionNotes(e.target.value)} rows={3} placeholder={t('customers.detailsView.addInteraction.placeholder')} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2">
                                    {/* FIX: Define IconComponent within the map callback to resolve the "Cannot find name 'IconComponent'" error. */}
                                    {(Object.keys(interactionTypeIcons) as Array<Interaction['type']>).map(type => {
                                        const IconComponent = interactionTypeIcons[type];
                                        return (
                                            <button key={type} onClick={() => setInteractionType(type)} className={`p-2 rounded-full ${interactionType === type ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`} title={t(`customers.detailsView.addInteraction.types.${type}`)}>
                                                <IconComponent className="w-5 h-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={handleAddInteraction} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover disabled:bg-primary/50" disabled={!interactionNotes.trim()}>{t('common.save')}</button>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {customer.interactions.length > 0 ? customer.interactions.map(interaction => {
                                const user = users.find(u => u.id === interaction.userId);
                                const IconComponent = interactionTypeIcons[interaction.type];
                                return (<div key={interaction.id} className="flex items-start gap-4"><UserProfile user={user} className="w-10 h-10" /><div className="flex-1 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg"><div className="flex justify-between items-center text-xs text-gray-500 mb-1"><span>{user?.name}</span><span>{interaction.date.toLocaleString(locale)}</span></div><p className="text-sm whitespace-pre-wrap">{interaction.notes}</p></div></div>);
                            }) : <p className="text-center text-gray-500 py-4">{t('customers.detailsView.noInteractions')}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-secondary dark:text-gray-200 mb-4">{t('customers.detailsView.tabs.details')}</h3>
                        <div className="space-y-3 text-sm">
                            <p><strong className="font-semibold text-gray-500 dark:text-gray-400">{t('customers.form.email')}:</strong> <span className="text-gray-800 dark:text-gray-200">{customer.email}</span></p>
                            <p><strong className="font-semibold text-gray-500 dark:text-gray-400">{t('customers.form.phone')}:</strong> <span className="text-gray-800 dark:text-gray-200">{customer.phone}</span></p>
                            <p><strong className="font-semibold text-gray-500 dark:text-gray-400">{customer.type === 'Company' ? t('customers.form.cnpj') : t('customers.form.cpf')}:</strong> <span className="text-gray-800 dark:text-gray-200">{customer.identifier}</span></p>
                            <p><strong className="font-semibold text-gray-500 dark:text-gray-400">{t('customers.form.address')}:</strong> <span className="text-gray-800 dark:text-gray-200">{customer.address}</span></p>
                            <p><strong className="font-semibold text-gray-500 dark:text-gray-400">{t('customers.customerSince')}:</strong> <span className="text-gray-800 dark:text-gray-200">{customer.createdAt.toLocaleDateString(locale)}</span></p>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-secondary dark:text-gray-200">{t('customers.detailsView.tabs.documents')}</h3><button onClick={handleUploadClick} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><PaperClipIcon className="w-4 h-4"/>{t('customers.detailsView.documents.upload')}</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="sr-only" multiple /></div>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {customer.documents.length > 0 ? customer.documents.map(doc => (
                                <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md">
                                    <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" /><div className="flex-1 overflow-hidden"><a href={doc.url} download={doc.name} className="text-sm font-medium text-primary hover:underline truncate" title={doc.name}>{doc.name}</a><p className="text-xs text-gray-500">{t('common.uploadedOn', { date: doc.uploadedAt.toLocaleDateString(locale) })}</p></div><button onClick={() => setDocumentToDelete(doc)}><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500"/></button>
                                </div>
                            )) : <p className="text-center text-sm text-gray-500 py-4">{t('customers.detailsView.documents.noDocuments')}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title={t('customers.detailsView.aiAnalysisTitle', { name: customer.name })}>
                {isAnalysisLoading ? (<div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>) : (<div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }}></div>)}
            </Modal>
            
            <Modal isOpen={!!documentToDelete} onClose={() => setDocumentToDelete(null)} title={t('customers.detailsView.documents.confirmDelete.title')}>
                <div className="text-center p-4"><WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('customers.detailsView.documents.confirmDelete.body', { name: documentToDelete!.name }) }} /><div className="flex justify-center gap-4 pt-6 mt-4"><button onClick={() => setDocumentToDelete(null)} className="px-6 py-2 bg-white dark:bg-gray-700 border rounded-md">{t('common.cancel')}</button><button onClick={() => handleDeleteDocument(documentToDelete!)} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button></div></div>
            </Modal>
        </div>
    );
};

export default CustomerDetailPage;
