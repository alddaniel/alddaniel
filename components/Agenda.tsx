

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Appointment, Customer, Supplier, RecurrenceRule, User, AppointmentStatus, Attachment, AppointmentHistory } from '../types';
import { useAppState } from '../state/AppContext';
import { generateMeetingSummary } from '../services/geminiService';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, EditIcon, ClockIcon, LocationPinIcon, BoardIcon, UserProfile, FileIcon, TrashIcon, iconMap, SearchIcon, ClockRewindIcon, CustomerIcon, SupplierIcon, TagIcon, CalendarCheckIcon, ChevronDownIcon } from './Icons';
import { Modal } from './Modal';
import Breadcrumbs from './Breadcrumbs';
import { CompletedAppointmentsModal } from './CompletedAppointmentsModal';
import FloatingActionButton from './FloatingActionButton';
import { useLocalization } from '../contexts/LocalizationContext';

interface AppointmentFormProps {
    appointment?: Appointment | null;
    customers: Customer[];
    suppliers: Supplier[];
    users: User[];
    onSave: (appointment: Omit<Appointment, 'id' | 'participants' | 'companyId' | 'status' | 'recurrenceRule' | 'history' | 'dueDate' | 'reminder'> & { participantIds: string[], notify: boolean; recurrenceRule?: RecurrenceRule; attachments?: Attachment[], dueDate?: Date, reminder?: number }) => void;
    onCancel: () => void;
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDark: boolean;
}

// Helper para converter ficheiro para base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


// Helper para formatar a data para o input datetime-local
const toDateTimeLocal = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getCategoryTextColor = (category: string, config: { [key: string]: { icon: string; color: string; } }, isDark: boolean): string => {
    const categoryConfig = config[category];
    const color = categoryConfig ? categoryConfig.color : 'gray';

    const lightStyles: Record<string, string> = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        yellow: 'text-yellow-600',
        pink: 'text-pink-600',
        gray: 'text-gray-600',
    };

    const darkStyles: Record<string, string> = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        yellow: 'text-yellow-400',
        pink: 'text-pink-400',
        gray: 'text-gray-400',
    };

    const styles = isDark ? darkStyles : lightStyles;
    return styles[color] || styles['gray'];
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, customers, suppliers, users, onSave, onCancel, appointmentCategoryConfig, isDark }) => {
    const { t } = useLocalization();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<string>(Object.keys(appointmentCategoryConfig)[0] || 'Outro');
    const [customerId, setCustomerId] = useState<string | undefined>();
    const [supplierId, setSupplierId] = useState<string | undefined>();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [reminder, setReminder] = useState<string>('none');
    const [notify, setNotify] = useState(true);
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
    const [until, setUntil] = useState('');
    const [errors, setErrors] = useState<{ general?: string; startEnd?: string; dueDate?: string; recurrence?: string }>({});

    // --- State for team participants ---
    const [participantSearch, setParticipantSearch] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);

    const selectedCategoryConfig = appointmentCategoryConfig[category];
    const SelectedIcon = selectedCategoryConfig ? iconMap[selectedCategoryConfig.icon] : null;

    useEffect(() => {
        setErrors({});
        if (appointment) {
            setTitle(appointment.title);
            setDescription(appointment.description);
            setStart(toDateTimeLocal(appointment.start));
            setEnd(toDateTimeLocal(appointment.end));
            setDueDate(appointment.dueDate ? toDateTimeLocal(appointment.dueDate) : '');
            setLocation(appointment.location);
            setCategory(appointment.category);
            setCustomerId(appointment.customerId);
            setSupplierId(appointment.supplierId);
            setAttachments(appointment.attachments || []);
            setReminder(appointment.reminder ? String(appointment.reminder) : 'none');
            setNotify(true);

            // Populate participants, excluding customers and suppliers
            const teamMembers = appointment.participants.filter(p => 'role' in p) as User[];
            setSelectedParticipants(teamMembers);

            if (appointment.recurrenceRule) {
                setIsRecurring(true);
                setFrequency(appointment.recurrenceRule.frequency);
                setUntil(appointment.recurrenceRule.until.toISOString().split('T')[0]);
            } else {
                setIsRecurring(false);
                setFrequency('weekly');
                setUntil('');
            }
        } else {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setTitle('');
            setDescription('');
            setStart(toDateTimeLocal(now));
            setEnd(toDateTimeLocal(oneHourLater));
            setDueDate('');
            setLocation('');
            setCategory(Object.keys(appointmentCategoryConfig)[0] || 'Outro');
            setCustomerId(undefined);
            setSupplierId(undefined);
            setAttachments([]);
            setReminder('none');
            setSelectedParticipants([]);
            setNotify(true);
            setIsRecurring(false);
            setFrequency('weekly');
            setUntil('');
        }
    }, [appointment, appointmentCategoryConfig]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newAttachments: Attachment[] = [];
            for (const file of files) {
                const base64 = await fileToBase64(file);
                newAttachments.push({
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    type: file.type,
                    content: base64,
                });
            }
            setAttachments(prev => [...prev, ...newAttachments]);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

     const handleInputChange = (field: 'start' | 'end' | 'dueDate' | 'until', value: string) => {
        if (field === 'start') setStart(value);
        else if (field === 'end') setEnd(value);
        else if (field === 'dueDate') setDueDate(value);
        else if (field === 'until') setUntil(value);

        if ((field === 'start' || field === 'end') && errors.startEnd) {
            setErrors(prev => ({ ...prev, startEnd: undefined }));
        }
        if (field === 'dueDate' && errors.dueDate) {
            setErrors(prev => ({ ...prev, dueDate: undefined }));
        }
        if (field === 'until' && errors.recurrence) {
            setErrors(prev => ({ ...prev, recurrence: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { general?: string; startEnd?: string; dueDate?: string; recurrence?: string } = {};

        if (!title.trim() || !start || !end) {
            newErrors.general = 'Por favor, preencha o título e as datas de início e fim.';
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        const dueDateValue = dueDate ? new Date(dueDate) : undefined;

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            newErrors.startEnd = 'A data ou hora de início ou fim é inválida.';
        } else if (endDate <= startDate) {
            newErrors.startEnd = 'A data de término deve ser posterior à de início.';
        }

        if (dueDateValue && !isNaN(dueDateValue.getTime()) && !isNaN(startDate.getTime()) && dueDateValue <= startDate) {
            newErrors.dueDate = 'A data de vencimento deve ser posterior à de início.';
        }

        if (isRecurring && !until) {
            newErrors.recurrence = 'Por favor, defina uma data final para a recorrência.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const recurrenceRule = isRecurring && until ? {
            frequency,
            until: new Date(until)
        } : undefined;

        const participantIds = selectedParticipants.map(p => p.id);
        const reminderValue = reminder === 'none' ? undefined : parseInt(reminder, 10);

        onSave({
            title,
            description,
            start: startDate,
            end: endDate,
            dueDate: dueDateValue,
            location,
            category,
            customerId,
            supplierId,
            attachments,
            participantIds,
            notify,
            recurrenceRule,
            reminder: reminderValue,
        });
    };

    const availableUsers = useMemo(() => {
        return users.filter(user => !selectedParticipants.find(p => p.id === user.id) && user.name.toLowerCase().includes(participantSearch.toLowerCase()));
    }, [users, selectedParticipants, participantSearch]);

    const addParticipant = (user: User) => {
        setSelectedParticipants(prev => [...prev, user]);
        setParticipantSearch('');
    };

    const removeParticipant = (userId: string) => {
        setSelectedParticipants(prev => prev.filter(p => p.id !== userId));
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errors.general}</span>
                </div>
            )}

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">Informações Gerais</legend>
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"></textarea>
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">Data e Hora</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Início</label>
                        <input type="datetime-local" id="start" value={start} onChange={e => handleInputChange('start', e.target.value)} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.startEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                    <div>
                        <label htmlFor="end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fim</label>
                        <input type="datetime-local" id="end" value={end} onChange={e => handleInputChange('end', e.target.value)} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.startEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                    {errors.startEnd && <p className="md:col-span-2 text-red-600 text-sm -mt-2">{errors.startEnd}</p>}
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Vencimento (Opcional)</label>
                    <input type="datetime-local" id="dueDate" value={dueDate} onChange={e => handleInputChange('dueDate', e.target.value)} className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
                </div>
                 <div className="pt-2 space-y-2">
                    <label htmlFor="isRecurring" className="flex items-center">
                        <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Repetir compromisso</span>
                    </label>
                    {isRecurring && (
                        <div className="pl-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequência</label>
                                    <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                                        <option value="daily">Diariamente</option>
                                        <option value="weekly">Semanalmente</option>
                                        <option value="monthly">Mensalmente</option>
                                        <option value="yearly">Anualmente</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="until" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repetir até</label>
                                    <input type="date" id="until" value={until} onChange={e => handleInputChange('until', e.target.value)} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.recurrence ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                </div>
                            </div>
                            {errors.recurrence && <p className="text-red-600 text-sm">{errors.recurrence}</p>}
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">Detalhes e Associações</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                         <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {SelectedIcon && <SelectedIcon className={`w-5 h-5 ${getCategoryTextColor(category, appointmentCategoryConfig, isDark)}`} />}
                            </div>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-10 pr-10 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary appearance-none"
                            >
                                {Object.keys(appointmentCategoryConfig).map(cat => <option key={cat} value={cat}>{t(`appointment.category.${cat}`)}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lembrete</label>
                    <select id="reminder" value={reminder} onChange={e => setReminder(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                        <option value="none">Nenhum</option>
                        <option value="5">5 minutos antes</option>
                        <option value="15">15 minutos antes</option>
                        <option value="30">30 minutos antes</option>
                        <option value="60">1 hora antes</option>
                        <option value="1440">1 dia antes</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente Relacionado</label>
                        <select id="customer" value={customerId || ''} onChange={e => setCustomerId(e.target.value || undefined)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                            <option value="">Nenhum</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fornecedor Relacionado</label>
                        <select id="supplier" value={supplierId || ''} onChange={e => setSupplierId(e.target.value || undefined)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                            <option value="">Nenhum</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">Participantes e Anexos</legend>
                 <div>
                     <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Participantes da Equipe</label>
                     <div className="mt-1 relative">
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[40px] bg-white dark:bg-gray-800">
                            {selectedParticipants.map(user => (
                                <div key={user.id} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-2">
                                    <UserProfile user={user} className="w-5 h-5" />
                                    <span>{user.name}</span>
                                    <button type="button" onClick={() => removeParticipant(user.id)} className="text-primary hover:text-red-500 dark:text-indigo-300 dark:hover:text-red-400">&times;</button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={participantSearch}
                                onChange={e => setParticipantSearch(e.target.value)}
                                className="flex-grow p-1 focus:outline-none bg-transparent dark:text-gray-200 dark:placeholder-gray-400"
                                placeholder={selectedParticipants.length === 0 ? "Pesquisar na equipe..." : ""}
                            />
                        </div>
                        {participantSearch && availableUsers.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {availableUsers.map(user => (
                                    <li key={user.id} onClick={() => addParticipant(user)} className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <UserProfile user={user} className="w-6 h-6" />
                                        {user.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                     </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anexos</label>
                    <div className="mt-1">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>Adicionar Arquivos</span>
                            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                        </label>
                    </div>
                    {attachments.length > 0 && (
                        <ul className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-200 dark:divide-gray-600">
                            {attachments.map(att => (
                                <li key={att.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                        <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <span className="ml-2 flex-1 w-0 truncate dark:text-gray-300">{att.name}</span>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button type="button" onClick={() => removeAttachment(att.id)} className="font-medium text-red-600 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </fieldset>

             <div className="pt-2">
                <label htmlFor="notify" className="flex items-center">
                    <input type="checkbox" id="notify" checked={notify} onChange={e => setNotify(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Notificar participantes por e-mail</span>
                </label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{appointment ? 'Salvar Alterações' : 'Salvar Compromisso'}</button>
            </div>
        </form>
    );
};

const getCategoryBgStyle = (category: string, config: { [key: string]: { icon: string; color: string; } }, isDark: boolean): string => {
    const categoryConfig = config[category];
    const color = categoryConfig ? categoryConfig.color : 'gray';

    const lightStyles: Record<string, string> = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
        yellow: 'bg-yellow-100',
        pink: 'bg-pink-100',
        gray: 'bg-gray-100',
    };

    const darkStyles: Record<string, string> = {
        blue: 'bg-blue-900/40',
        green: 'bg-green-900/40',
        purple: 'bg-purple-900/40',
        yellow: 'bg-yellow-900/40',
        pink: 'bg-pink-900/40',
        gray: 'bg-gray-700',
    };

    const styles = isDark ? darkStyles : lightStyles;
    return styles[color] || styles['gray'];
};

const getCategoryClass = (category: string, config: { [key: string]: { icon: string; color: string; } }, isDark: boolean, type: 'bg' | 'border' | 'text'): string => {
    const categoryConfig = config[category];
    const color = categoryConfig ? categoryConfig.color : 'gray';

    const light: Record<string, Record<string, string>> = {
        bg: { blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', yellow: 'bg-yellow-400', pink: 'bg-pink-500', gray: 'bg-gray-500' },
        border: { blue: 'border-blue-700', green: 'border-green-700', purple: 'border-purple-700', yellow: 'border-yellow-600', pink: 'border-pink-700', gray: 'border-gray-700' },
        text: { blue: 'text-white', green: 'text-white', purple: 'text-white', yellow: 'text-yellow-900', pink: 'text-white', gray: 'text-white' }
    };
    const dark: Record<string, Record<string, string>> = {
        bg: { blue: 'bg-blue-600', green: 'bg-green-600', purple: 'bg-purple-600', yellow: 'bg-yellow-500', pink: 'bg-pink-600', gray: 'bg-gray-600' },
        border: { blue: 'border-blue-800', green: 'border-green-800', purple: 'border-purple-800', yellow: 'border-yellow-700', pink: 'border-pink-800', gray: 'border-gray-800' },
        text: { blue: 'text-blue-50', green: 'text-green-50', purple: 'text-purple-50', yellow: 'text-yellow-900', pink: 'text-pink-50', gray: 'text-gray-50' }
    };

    const theme = isDark ? dark : light;
    return theme[type][color] || theme[type]['gray'];
};

const AppointmentCard: React.FC<{
    appointment: Appointment;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, appointmentId: string) => void;
    onClick: () => void;
    onToggleStatus: () => void;
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDraggable?: boolean;
}> = ({ appointment, onDragStart, onClick, onToggleStatus, appointmentCategoryConfig, isDraggable = true }) => {
    const { state, hasPermission } = useAppState();
    const { t } = useLocalization();
    const isDark = state.theme === 'dark';
    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
    const categoryConfig = appointmentCategoryConfig[appointment.category];
    const IconComponent = categoryConfig ? iconMap[categoryConfig.icon] : iconMap['TagIcon'];

    return (
    <div
        draggable={isDraggable && !isCompleted && hasPermission('MANAGE_AGENDA')}
        onClick={onClick}
        onDragStart={(e) => onDragStart(e, appointment.id)}
        className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm cursor-pointer transition-opacity ${isCompleted ? 'opacity-60' : 'active:cursor-grabbing'}`}
    >
        <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 ${getCategoryBgStyle(appointment.category, appointmentCategoryConfig, isDark)}`}>
                {IconComponent && <IconComponent className={`w-3 h-3 ${getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}`}/>}
                <span className={getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}>{t(`appointment.category.${appointment.category}`)}</span>
            </span>
            {hasPermission('MANAGE_AGENDA') && (
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={onToggleStatus}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-primary focus:ring-primary bg-gray-100 dark:bg-gray-900"
                    aria-label={`Mark ${appointment.title} as completed`}
                />
            )}
        </div>
        <h4 className={`font-bold text-sm text-secondary dark:text-gray-100 mt-2 ${isCompleted ? 'line-through' : ''}`}>{appointment.title}</h4>
        <div className="text-xs text-medium dark:text-gray-400 mt-2 space-y-1">
            <div className="flex items-center gap-2">
                <ClockIcon className="flex-shrink-0" />
                <span>{appointment.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {appointment.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {appointment.location && (
                <div className="flex items-center gap-2">
                    <LocationPinIcon className="flex-shrink-0" />
                    <span>{appointment.location}</span>
                </div>
            )}
        </div>
        <div className="mt-3 flex items-center justify-between">
            <div className="flex -space-x-2">
                {appointment.participants.slice(0, 3).map(p => (
                   <UserProfile key={p.id} user={p} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" />
                ))}
            </div>
            {appointment.dueDate && (
                <div className="text-yellow-600 dark:text-yellow-400" title={`Vence em: ${appointment.dueDate.toLocaleDateString('pt-BR')}`}>
                    <CalendarCheckIcon className="w-4 h-4" />
                </div>
            )}
        </div>
    </div>
)};

type ViewMode = 'board' | 'month' | 'week' | 'day' | 'list';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => (
  <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex-wrap justify-center">
    {(['board', 'list', 'month', 'week', 'day'] as const).map(mode => (
      <button
        key={mode}
        onClick={() => setViewMode(mode)}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize flex items-center gap-2 ${viewMode === mode ? 'bg-white dark:bg-gray-900 text-primary dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {mode === 'board' && <BoardIcon className="w-4 h-4" />}
        {mode === 'board' ? 'Quadro' : mode === 'list' ? 'Lista' : mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
      </button>
    ))}
  </div>
);

const AppointmentDetailView: React.FC<{
    appointment: Appointment;
    users: User[];
    onEdit: (appointment: Appointment) => void;
    onClose: () => void;
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDark: boolean;
    onReopen: (appointment: Appointment) => void;
    onGenerateSummary: (appointment: Appointment) => void;
}> = ({ appointment, users, onEdit, onClose, appointmentCategoryConfig, isDark, onReopen, onGenerateSummary }) => {
    const { hasPermission } = useAppState();
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState('details');

    const categoryConfig = appointmentCategoryConfig[appointment.category];
    const IconComponent = categoryConfig ? iconMap[categoryConfig.icon] : iconMap['TagIcon'];
    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;

    const customer = 'identifier' in (appointment.participants.find(p => 'identifier' in p) || {}) ? (appointment.participants.find(p => 'identifier' in p) as Customer) : null;
    const supplier = 'cnpj' in (appointment.participants.find(p => 'cnpj' in p) || {}) ? (appointment.participants.find(p => 'cnpj' in p) as Supplier) : null;

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Detalhes
                    </button>
                    {appointment.history && appointment.history.length > 0 && (
                        <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            Histórico
                        </button>
                    )}
                </nav>
            </div>
            <div className="pt-6">
                {activeTab === 'details' && (
                    <div className="space-y-4 text-sm">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 w-fit ${getCategoryBgStyle(appointment.category, appointmentCategoryConfig, isDark)}`}>
                           {IconComponent && <IconComponent className={`w-3 h-3 ${getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}`}/>}
                           <span className={getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}>{t(`appointment.category.${appointment.category}`)}</span>
                        </span>
                        <p className="text-gray-600 dark:text-gray-400">{appointment.description || 'Nenhuma descrição fornecida.'}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
                             <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <strong className="font-semibold text-gray-700 dark:text-gray-300">Data e Hora:</strong>
                                    <p className="text-gray-600 dark:text-gray-400">{appointment.start.toLocaleString('pt-BR')} - {appointment.end.toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <LocationPinIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <strong className="font-semibold text-gray-700 dark:text-gray-300">Local:</strong>
                                    <p className="text-gray-600 dark:text-gray-400">{appointment.location || 'Não especificado'}</p>
                                </div>
                            </div>
                            {appointment.dueDate && (
                                <div className="flex items-center gap-2">
                                    <CalendarCheckIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <strong className="font-semibold text-gray-700 dark:text-gray-300">Data de Vencimento:</strong>
                                        <p className="text-gray-600 dark:text-gray-400">{appointment.dueDate.toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                         <div>
                            <strong className="font-semibold text-gray-700 dark:text-gray-300">Participantes:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {appointment.participants.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                        <UserProfile user={p} className="w-5 h-5" />
                                        <span className="text-xs font-medium">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {appointment.attachments && appointment.attachments.length > 0 && (
                             <div>
                                <strong className="font-semibold text-gray-700 dark:text-gray-300">Anexos:</strong>
                                <ul className="mt-2 space-y-2">
                                    {appointment.attachments.map(att => (
                                        <li key={att.id}>
                                            <a href={att.content} download={att.name} className="flex items-center gap-2 text-primary hover:underline">
                                                <FileIcon className="w-4 h-4" />
                                                {att.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'history' && appointment.history && (
                     <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {appointment.history.map((entry, index) => {
                            const user = users.find(u => u.id === entry.modifiedById);
                            return (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        <div className="flex items-center gap-2">
                                            <UserProfile user={user} className="w-5 h-5" />
                                            <span><strong>Modificado por:</strong> {user?.name || 'Desconhecido'}</span>
                                        </div>
                                        <span>{entry.modifiedAt.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">Dados Anteriores:</p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside pl-4 mt-1 space-y-1">
                                        <li><strong>Título:</strong> {entry.previousState.title}</li>
                                        <li><strong>Início:</strong> {entry.previousState.start.toLocaleString('pt-BR')}</li>
                                        <li><strong>Fim:</strong> {entry.previousState.end.toLocaleString('pt-BR')}</li>
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
             <div className="flex justify-between items-center pt-4 mt-4 border-t dark:border-gray-700">
                <div>
                    {isCompleted && hasPermission('MANAGE_AGENDA') && (
                        <button
                            type="button"
                            onClick={() => onReopen(appointment)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
                        >
                            <ClockRewindIcon className="w-4 h-4" />
                            Reabrir
                        </button>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Fechar</button>
                    {isCompleted ? (
                        <button
                            type="button"
                            onClick={() => onGenerateSummary(appointment)}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center gap-2"
                        >
                            <SparklesIcon />
                            Resumo IA
                        </button>
                    ) : hasPermission('MANAGE_AGENDA') && (
                        <button type="button" onClick={() => onEdit(appointment)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover flex items-center gap-2">
                            <EditIcon className="w-4 h-4" />
                            Editar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const Agenda: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { appointments, customers, suppliers, users, appointmentCategoryConfig } = state;
    const isDark = state.theme === 'dark';

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [now, setNow] = useState(new Date());
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [detailsModalAppointment, setDetailsModalAppointment] = useState<Appointment | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [filterCustomerId, setFilterCustomerId] = useState<string>('');
    const [filterSupplierId, setFilterSupplierId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>('forToday');
    const location = useLocation();

    const handleOpenModal = () => {
        setEditingAppointment(null);
        setIsAppointmentModalOpen(true);
    };

    const userAppointments = useMemo(() => {
        return state.currentUser?.email === 'ddarruspe@gmail.com'
            ? appointments
            : appointments.filter(a => a.companyId === state.currentUser?.companyId);
    }, [appointments, state.currentUser]);

    const userCustomers = useMemo(() => {
        return state.currentUser?.email === 'ddarruspe@gmail.com'
            ? customers
            : customers.filter(c => c.companyId === state.currentUser?.companyId);
    }, [customers, state.currentUser]);

    const userSuppliers = useMemo(() => {
        return state.currentUser?.email === 'ddarruspe@gmail.com'
            ? suppliers
            : suppliers.filter(s => s.companyId === state.currentUser?.companyId);
    }, [suppliers, state.currentUser]);

    const userUsers = useMemo(() => {
        return state.currentUser?.email === 'ddarruspe@gmail.com'
            ? users
            : users.filter(u => u.companyId === state.currentUser?.companyId);
    }, [users, state.currentUser]);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const view = params.get('view');
        const search = params.get('search');
        if (view && ['board', 'month', 'week', 'day', 'list'].includes(view)) {
            setViewMode(view as any);
        }
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    useEffect(() => {
        const timerId = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    const completedAppointments = useMemo(() => userAppointments.filter(app => app.status === AppointmentStatus.COMPLETED).sort((a,b) => b.end.getTime() - a.start.getTime()), [userAppointments]);


    const filteredAppointments = useMemo(() => {
        return userAppointments.filter(app => {
            const customerMatch = !filterCustomerId || app.customerId === filterCustomerId;
            const supplierMatch = !filterSupplierId || app.supplierId === filterSupplierId;
            const searchMatch = !searchTerm || app.title.toLowerCase().includes(searchTerm.toLowerCase());
            return customerMatch && supplierMatch && searchMatch;
        });
    }, [userAppointments, filterCustomerId, filterSupplierId, searchTerm]);

    const appointmentsByDay = useMemo(() => {
        const grouped: { [key: string]: Appointment[] } = {};
        filteredAppointments.forEach(app => {
            const dayKey = app.start.toDateString();
            if (!grouped[dayKey]) {
                grouped[dayKey] = [];
            }
            grouped[dayKey].push(app);
        });
        return grouped;
    }, [filteredAppointments]);

    const handleGenerateSummary = useCallback(async (appointment: Appointment) => {
        setDetailsModalAppointment(null); // Close detail view if open
        setIsHistoryModalOpen(false);
        setSelectedAppointment(appointment);
        setIsSummaryModalOpen(true);
        setIsLoadingSummary(true);
        setSummary('');
        const generatedSummary = await generateMeetingSummary(appointment);
        setSummary(generatedSummary);
        setIsLoadingSummary(false);
    }, []);

    const handleCloseModal = () => {
        setIsAppointmentModalOpen(false);
        setEditingAppointment(null);
    };

    const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id' | 'participants' | 'companyId' | 'status' | 'dueDate' | 'reminder'> & { participantIds: string[], notify: boolean; recurrenceRule?: RecurrenceRule; attachments?: Attachment[]; dueDate?: Date; reminder?: number; }) => {
        if (editingAppointment) {
            const teamParticipants = userUsers.filter(u => appointmentData.participantIds.includes(u.id));
            const customerParticipant = userCustomers.find(c => c.id === appointmentData.customerId);
            const supplierParticipant = userSuppliers.find(s => s.id === appointmentData.supplierId);

            const allParticipants: (User | Customer | Supplier)[] = [...teamParticipants];
            if (customerParticipant) allParticipants.push(customerParticipant);
            if (supplierParticipant) allParticipants.push(supplierParticipant);

            const { participantIds, notify, ...restData } = appointmentData;

            const payload = {
                ...editingAppointment,
                ...restData,
                participants: allParticipants,
            };
            dispatch({ type: 'UPDATE_APPOINTMENT', payload });
        } else {
            dispatch({ type: 'ADD_APPOINTMENT', payload: appointmentData });
        }

        const message = editingAppointment ? 'Compromisso atualizado com sucesso!' : 'Compromisso agendado com sucesso!';
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: message, type: 'success' } });

        if (appointmentData.notify) {
            const notifyMessage = editingAppointment
                ? 'Notificações de atualização enviadas por e-mail.'
                : 'Notificações por e-mail enviadas.';
            setTimeout(() => dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: notifyMessage, type: 'info' } }), 1000);
        }

        handleCloseModal();
    };

    const onUpdateAppointment = (appointment: Appointment) => {
        dispatch({ type: 'UPDATE_APPOINTMENT', payload: appointment });
        const originalAppointment = appointments.find(app => app.id === appointment.id);
        if (originalAppointment && originalAppointment.status === AppointmentStatus.COMPLETED && appointment.status === AppointmentStatus.SCHEDULED) {
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'Compromisso reaberto com sucesso!', type: 'success' } });
        } else {
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'Compromisso atualizado com sucesso!', type: 'success' } });
        }
    };


    const handleEditAppointment = (appointment: Appointment) => {
        setDetailsModalAppointment(null);
        setEditingAppointment(appointment);
        setIsAppointmentModalOpen(true);
    };

    const handlePrev = () => setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
        else if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
        return newDate;
    });

    const handleNext = () => setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
        else if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
        return newDate;
    });

    const handleToday = () => setCurrentDate(new Date());

    const headerTitle = useMemo(() => {
        if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        }
        if (viewMode === 'day') return currentDate.toLocaleDateString('pt-BR', { dateStyle: 'full' });
        if (viewMode === 'list' || viewMode === 'board') return "Todos os Compromissos";
        return currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    }, [currentDate, viewMode]);

    const renderListView = () => {
        const sortedAppointments = [...filteredAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED)].sort((a, b) => a.start.getTime() - b.start.getTime());
         const getBorderColor = (app: Appointment) => {
            if (app.status === AppointmentStatus.COMPLETED) return 'border-gray-400 dark:border-gray-600';
            if (app.customerId) return 'border-blue-400 dark:border-blue-500';
            if (app.supplierId) return 'border-purple-400 dark:border-purple-500';
            return 'border-green-400 dark:border-green-500';
        };

        if (sortedAppointments.length === 0) {
            return (
                <div className="text-center p-10 text-gray-500 dark:text-gray-400">
                    <p>Nenhum compromisso agendado encontrado para os filtros selecionados.</p>
                </div>
            )
        }

        return <div className="p-4 sm:p-6 space-y-4">
            {sortedAppointments.map(app => {
                const categoryConfig = appointmentCategoryConfig[app.category];
                const IconComponent = categoryConfig ? iconMap[categoryConfig.icon] : iconMap['TagIcon'];
                return (
                <button key={app.id} onClick={() => setDetailsModalAppointment(app)} className={`w-full text-left p-4 border-l-4 ${getBorderColor(app)} bg-white dark:bg-gray-800 rounded-r-lg flex items-start gap-4 transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary ${app.status === AppointmentStatus.COMPLETED ? 'opacity-70' : ''}`}>
                    <div className="grid grid-cols-12 flex-grow gap-x-4 gap-y-2 items-start">
                        <div className="col-span-12 sm:col-span-2 text-center">
                            <p className="text-primary font-bold text-lg capitalize">{app.start.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</p>
                            <p className="text-secondary dark:text-gray-100 font-extrabold text-3xl">{app.start.getDate()}</p>
                        </div>
                        <div className="col-span-12 sm:col-span-5">
                            <h3 className={`font-bold text-secondary dark:text-gray-100 ${app.status === AppointmentStatus.COMPLETED ? 'line-through' : ''}`}>{app.title}</h3>
                            <p className="text-sm text-medium dark:text-gray-400">{app.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {app.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-sm text-medium dark:text-gray-400">{app.location}</p>
                        </div>
                        <div className="col-span-12 sm:col-span-5">
                             {app.dueDate && (
                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <CalendarCheckIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Vencimento</p>
                                        <p className="text-gray-500 dark:text-gray-400">{app.dueDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="col-span-12 sm:col-start-3 sm:col-span-10">
                            <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${getCategoryBgStyle(app.category, appointmentCategoryConfig, isDark)}`}>
                                {IconComponent && <IconComponent className={`w-3 h-3 ${getCategoryTextColor(app.category, appointmentCategoryConfig, isDark)}`}/>}
                                <span className={getCategoryTextColor(app.category, appointmentCategoryConfig, isDark)}>{app.category}</span>
                            </span>
                        </div>
                    </div>
                </button>
            )})}
        </div>;
    };

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: firstDayOfMonth }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)));
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const todayStr = new Date().toDateString();

        const handleDayClick = (day: Date) => {
            setCurrentDate(day);
            setViewMode('day');
        };

        return <div className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-medium dark:text-gray-400 text-xs sm:text-sm">
                {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (!day) return <div key={index} className="border dark:border-gray-700/50 rounded-md bg-gray-50 dark:bg-gray-800/50"></div>;

                    const isToday = day.toDateString() === todayStr;
                    const appointmentsForDay = (appointmentsByDay[day.toDateString()] || []).filter(a => a.status === AppointmentStatus.SCHEDULED);

                    return <div key={index} onClick={() => handleDayClick(day)} className="border dark:border-gray-700/50 rounded-md h-24 sm:h-32 p-1 sm:p-2 flex flex-col bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <span className={`text-xs sm:text-base font-semibold self-start ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}`}>{day.getDate()}</span>
                        <div className="mt-1 space-y-1 overflow-hidden">
                            {appointmentsForDay.slice(0, 2).map(app => (
                                <div key={app.id} className={`px-1 py-0.5 rounded-md truncate text-xs ${getCategoryBgStyle(app.category, appointmentCategoryConfig, isDark)} ${getCategoryTextColor(app.category, appointmentCategoryConfig, isDark)}`}>{app.title}</div>
                            ))}
                             {appointmentsForDay.length > 2 && (
                                <div className="text-xs text-medium dark:text-gray-400 mt-1">
                                    +{appointmentsForDay.length - 2} mais
                                </div>
                            )}
                        </div>
                    </div>;
                })}
            </div>
        </div>;
    };

    const TimeGrid: React.FC<{
        appointments: Appointment[];
        isDark: boolean;
        categoryConfig: any;
        onAppointmentClick: (app: Appointment) => void;
        showTimeIndicator?: boolean;
        now: Date;
    }> = ({ appointments, isDark, categoryConfig, onAppointmentClick, showTimeIndicator, now }) => {
        const HOUR_HEIGHT = 96; // h-24 = 6rem = 96px
        const START_HOUR = 7;
        const hours = Array.from({ length: 16 }, (_, i) => i + START_HOUR);

        const timeIndicatorTop = useMemo(() => {
            if (!showTimeIndicator) return null;
            const nowHour = now.getHours() + now.getMinutes() / 60;
            if (nowHour >= START_HOUR && nowHour < START_HOUR + hours.length) {
                return (nowHour - START_HOUR) * HOUR_HEIGHT;
            }
            return null;
        }, [showTimeIndicator, now, hours.length]);

        return (
            <div className="relative">
                {/* Horizontal grid lines */}
                {hours.map(hour => (
                    <div key={hour} className="h-24 border-t border-gray-200 dark:border-gray-700"></div>
                ))}

                 {/* Current time indicator */}
                 {timeIndicatorTop !== null && (
                    <div className="absolute left-0 right-0 h-px bg-red-500 z-10" style={{ top: `${timeIndicatorTop}px` }}>
                       <div className="absolute -left-1.5 -top-[5px] w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                )}

                {/* Render appointments */}
                {appointments.map(app => {
                    const start = app.start.getHours() + app.start.getMinutes() / 60;
                    const end = app.end.getHours() + app.end.getMinutes() / 60;
                    const top = (start - START_HOUR) * HOUR_HEIGHT;
                    const height = (end - start) * HOUR_HEIGHT;

                    const appCategoryConfig = categoryConfig[app.category];
                    const IconComponent = appCategoryConfig ? iconMap[appCategoryConfig.icon] : iconMap['TagIcon'];

                    if (end < START_HOUR || start > START_HOUR + hours.length) return null;

                    return (
                        <div
                            key={app.id}
                            className={`absolute left-1 right-1 p-2 rounded-lg cursor-pointer overflow-hidden border-l-4 z-0 ${getCategoryClass(app.category, categoryConfig, isDark, 'bg')} ${getCategoryClass(app.category, categoryConfig, isDark, 'border')} ${getCategoryClass(app.category, categoryConfig, isDark, 'text')}`}
                            style={{ top: `${Math.max(top, 0)}px`, height: `${Math.max(height - 4, 20)}px` }}
                            onClick={() => onAppointmentClick(app)}
                        >
                            <div className={`font-bold text-sm leading-tight flex items-center gap-1.5 ${app.status === AppointmentStatus.COMPLETED ? 'line-through' : ''}`}>
                                {IconComponent && <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />}
                                <span className="truncate">{app.title}</span>
                            </div>
                            <p className="text-xs opacity-80 truncate">{app.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {app.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                             {app.location && (
                                <p className="text-xs opacity-80 flex items-center gap-1 mt-1 truncate">
                                    <LocationPinIcon className="w-3 h-3 flex-shrink-0"/>
                                    <span className="truncate">{app.location}</span>
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        )
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekDays = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
        const START_HOUR = 7;
        const hours = Array.from({ length: 16 }, (_, i) => i + START_HOUR);

        return (
            <div className="p-2 sm:p-4 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] sticky top-0 bg-white dark:bg-gray-800 z-10">
                        <div className="w-16 border-r dark:border-gray-700"></div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className={`text-center py-2 border-b dark:border-gray-700 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-medium dark:text-gray-400'}`}>
                                <p className="text-xs sm:text-sm font-semibold">{day.toLocaleString('pt-BR', { weekday: 'short' })}</p>
                                <p className="text-lg sm:text-2xl font-bold">{day.getDate()}</p>
                            </div>
                        ))}
                    </div>
                    {/* Body */}
                    <div className="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
                        {/* Time column */}
                        <div className="w-16 text-right pr-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {hours.map(hour => (
                                <div key={hour} className="h-24 flex justify-end items-start -mt-3 pt-3">
                                    <span>{hour}:00</span>
                                </div>
                            ))}
                        </div>
                        {/* Day columns */}
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="border-r dark:border-gray-700">
                                <TimeGrid
                                    appointments={(appointmentsByDay[day.toDateString()] || []).filter(a => a.status === AppointmentStatus.SCHEDULED)}
                                    isDark={isDark}
                                    categoryConfig={appointmentCategoryConfig}
                                    onAppointmentClick={setDetailsModalAppointment}
                                    showTimeIndicator={isSameDay(day, new Date())}
                                    now={now}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const appointmentsForDay = (appointmentsByDay[currentDate.toDateString()] || []).filter(a => a.status === AppointmentStatus.SCHEDULED);
        const START_HOUR = 7;
        const hours = Array.from({ length: 16 }, (_, i) => i + START_HOUR);

        return (
            <div className="p-2 sm:p-4 flex">
                {/* Time Column */}
                <div className="w-16 text-right pr-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {hours.map(hour => (
                        <div key={hour} className="h-24 flex justify-end items-start -mt-3 pt-3">
                           <span>{hour}:00</span>
                        </div>
                    ))}
                </div>
                {/* Appointment Column */}
                <div className="flex-1 border-l dark:border-gray-700">
                    <TimeGrid
                        appointments={appointmentsForDay}
                        isDark={isDark}
                        categoryConfig={appointmentCategoryConfig}
                        onAppointmentClick={setDetailsModalAppointment}
                        showTimeIndicator={isSameDay(currentDate, new Date())}
                        now={now}
                    />
                </div>
            </div>
        );
    };

    const categorizedAppointments = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        const endOfNext7Days = new Date(today);
        endOfNext7Days.setDate(today.getDate() + 7);
        endOfNext7Days.setHours(23, 59, 59, 999);

        const scheduled = filteredAppointments.filter(app => app.status === AppointmentStatus.SCHEDULED);

        const categorized: { [key: string]: Appointment[] } = {
            overdue: [],
            forToday: [],
            forTomorrow: [],
            forNext7Days: [],
            future: [],
        };

        scheduled.forEach(app => {
            if (app.end < now && !isSameDay(app.start, today)) {
                categorized.overdue.push(app);
            } else if (isSameDay(app.start, today)) {
                categorized.forToday.push(app);
            } else if (isSameDay(app.start, tomorrow)) {
                categorized.forTomorrow.push(app);
            } else if (app.start > endOfTomorrow && app.start <= endOfNext7Days) {
                categorized.forNext7Days.push(app);
            } else if (app.start > endOfNext7Days) {
                categorized.future.push(app);
            }
        });

        for (const key in categorized) {
            categorized[key].sort((a, b) => a.start.getTime() - b.start.getTime());
        }

        return categorized;
    }, [filteredAppointments]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, appointmentId: string) => {
        e.dataTransfer.setData("appointmentId", appointmentId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
        e.preventDefault();
        setDraggedOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDraggedOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: 'today' | 'tomorrow') => {
        e.preventDefault();
        const appointmentId = e.dataTransfer.getData("appointmentId");
        setDraggedOverColumn(null);
        if (!appointmentId) return;

        const targetDate = new Date();
        if (targetColumn === 'tomorrow') {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const originalAppointment = appointments.find(app => app.id === appointmentId);
        if (!originalAppointment) return;

        const newStartDate = new Date(targetDate);
        newStartDate.setHours(originalAppointment.start.getHours(), originalAppointment.start.getMinutes(), originalAppointment.start.getSeconds(), originalAppointment.start.getMilliseconds());

        const duration = originalAppointment.end.getTime() - originalAppointment.start.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);

        onUpdateAppointment({ ...originalAppointment, start: newStartDate, end: newEndDate });
    };

    const handleToggleStatus = (appointment: Appointment) => {
        const newStatus = appointment.status === AppointmentStatus.SCHEDULED ? AppointmentStatus.COMPLETED : AppointmentStatus.SCHEDULED;
        onUpdateAppointment({ ...appointment, status: newStatus });
        // Close detail modal if it's open for this appointment
        if (detailsModalAppointment?.id === appointment.id) {
            setDetailsModalAppointment(null);
        }
    };

    const handleReopenAppointment = (appointment: Appointment) => {
        onUpdateAppointment({ ...appointment, status: AppointmentStatus.SCHEDULED });
    }

    const renderBoardView = () => {
        const completedToShow = completedAppointments.slice(0, 5);
        const columns = [
            { id: 'overdue', title: 'A Fazer (Atrasado)', date: null, appointments: categorizedAppointments.overdue },
            { id: 'forToday', title: 'Hoje', date: 'today' as const, appointments: categorizedAppointments.forToday },
            { id: 'forTomorrow', title: 'Amanhã', date: 'tomorrow' as const, appointments: categorizedAppointments.forTomorrow },
            { id: 'forNext7Days', title: 'Próximos 7 Dias', date: null, appointments: categorizedAppointments.forNext7Days },
            { id: 'future', title: 'Futuro', date: null, appointments: categorizedAppointments.future },
            { id: 'completed', title: 'Concluídos', date: null, appointments: completedToShow },
        ];

        return (
            <>
                {/* Desktop 6-Column Board View */}
                <div className="hidden lg:block overflow-x-auto p-2 sm:p-4">
                    <div className="flex gap-4 min-w-[1200px] lg:min-w-0 lg:grid lg:grid-cols-6">
                        {columns.map(col => (
                            <div
                                key={col.id}
                                onDragOver={(e) => col.date && hasPermission('MANAGE_AGENDA') && handleDragOver(e, col.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => col.date && hasPermission('MANAGE_AGENDA') && handleDrop(e, col.date)}
                                className={`bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 transition-colors w-72 lg:w-auto flex-shrink-0 flex flex-col ${draggedOverColumn === col.id ? 'bg-primary/10' : ''}`}
                            >
                                <h3 className="font-bold text-secondary dark:text-gray-200 mb-4 flex-shrink-0">{col.title} ({col.id === 'completed' ? completedAppointments.length : col.appointments.length})</h3>
                                <div className="space-y-3 min-h-[100px] flex-grow overflow-y-auto">
                                    {col.appointments.map(app => (
                                        <AppointmentCard
                                            key={app.id}
                                            appointment={app}
                                            onDragStart={handleDragStart}
                                            onClick={() => setDetailsModalAppointment(app)}
                                            onToggleStatus={() => handleToggleStatus(app)}
                                            appointmentCategoryConfig={appointmentCategoryConfig}
                                            isDraggable={col.id !== 'completed'}
                                        />
                                    ))}
                                </div>
                                {col.id === 'completed' && completedAppointments.length > 5 && (
                                    <button onClick={() => setIsHistoryModalOpen(true)} className="w-full text-center mt-3 p-2 text-sm font-semibold text-primary dark:text-indigo-300 hover:bg-primary/10 rounded-md transition-colors flex-shrink-0">
                                        Ver Todos ({completedAppointments.length})
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Accordion View */}
                <div className="block lg:hidden">
                    {columns.map(col => (
                         <div key={col.id} className="border-b dark:border-gray-700 last:border-b-0">
                            <button
                                onClick={() => setOpenAccordion(openAccordion === col.id ? null : col.id)}
                                className="w-full flex justify-between items-center p-4 text-left font-semibold text-secondary dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                aria-expanded={openAccordion === col.id}
                                aria-controls={`accordion-content-${col.id}`}
                            >
                                <span>{col.title} <span className="font-normal text-sm text-gray-500">({col.id === 'completed' ? completedAppointments.length : col.appointments.length})</span></span>
                                <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${openAccordion === col.id ? 'rotate-90' : ''}`} />
                            </button>
                             {openAccordion === col.id && (
                                <div
                                    id={`accordion-content-${col.id}`}
                                    className="p-3 space-y-3 bg-gray-50 dark:bg-gray-900/50 animate-fade-in-up"
                                >
                                    {col.appointments.length > 0 ? col.appointments.map(app => (
                                        <AppointmentCard
                                            key={app.id}
                                            appointment={app}
                                            onDragStart={() => {}} // Drag-and-drop is disabled on mobile
                                            isDraggable={false}
                                            onClick={() => setDetailsModalAppointment(app)}
                                            onToggleStatus={() => handleToggleStatus(app)}
                                            appointmentCategoryConfig={appointmentCategoryConfig}
                                        />
                                    )) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhum compromisso nesta categoria.</p>}
                                     {col.id === 'completed' && completedAppointments.length > 5 && (
                                        <button onClick={() => setIsHistoryModalOpen(true)} className="w-full text-center mt-2 p-2 text-sm font-semibold text-primary dark:text-indigo-300 hover:bg-primary/10 rounded-md transition-colors">
                                            Ver Todos ({completedAppointments.length})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">Agenda</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-3 lg:col-span-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>
                <select value={filterCustomerId} onChange={(e) => setFilterCustomerId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200">
                    <option value="">Todos os Clientes</option>
                    {userCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filterSupplierId} onChange={(e) => setFilterSupplierId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200">
                    <option value="">Todos os Fornecedores</option>
                    {userSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
                <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {(viewMode !== 'list' && viewMode !== 'board') && (
                            <>
                                <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon /></button>
                                <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon /></button>
                                <button onClick={handleToday} className="px-3 py-1.5 border dark:border-gray-600 rounded-md text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">Hoje</button>
                            </>
                        )}
                        <h2 className="text-lg font-bold text-secondary dark:text-gray-100 capitalize">{headerTitle}</h2>
                    </div>
                    <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
                </div>
                <div>
                    {viewMode === 'board' && renderBoardView()}
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'day' && renderDayView()}
                    {viewMode === 'list' && renderListView()}
                </div>
            </div>

            {hasPermission('MANAGE_AGENDA') && (
                <FloatingActionButton
                    label="Novo Compromisso"
                    icon={PlusIcon}
                    onClick={handleOpenModal}
                />
            )}

            {detailsModalAppointment && (
                <Modal isOpen={!!detailsModalAppointment} onClose={() => setDetailsModalAppointment(null)} title={detailsModalAppointment.title}>
                    <AppointmentDetailView
                        appointment={detailsModalAppointment}
                        users={userUsers}
                        onEdit={handleEditAppointment}
                        onClose={() => setDetailsModalAppointment(null)}
                        appointmentCategoryConfig={appointmentCategoryConfig}
                        isDark={isDark}
                        onReopen={handleToggleStatus}
                        onGenerateSummary={handleGenerateSummary}
                    />
                </Modal>
            )}

            <Modal isOpen={isAppointmentModalOpen} onClose={handleCloseModal} title={editingAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}>
                <AppointmentForm
                    appointment={editingAppointment}
                    customers={userCustomers}
                    suppliers={userSuppliers}
                    users={userUsers}
                    onSave={handleSaveAppointment}
                    onCancel={handleCloseModal}
                    appointmentCategoryConfig={appointmentCategoryConfig}
                    isDark={isDark}
                />
            </Modal>

            <CompletedAppointmentsModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                appointments={completedAppointments}
                onReopenAppointment={handleReopenAppointment}
                onGenerateSummary={handleGenerateSummary}
            />

            {selectedAppointment && (
                <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title={`Resumo de ${selectedAppointment.title}`}>
                    {isLoadingSummary ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}></div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default Agenda;