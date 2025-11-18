import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Appointment, Customer, Supplier, RecurrenceRule, User, AppointmentStatus, Attachment, AppointmentHistory, Subtask, ActivityLog } from '../types';
import { useAppState } from '../state/AppContext';
import { generateMeetingSummary, sendAppointmentUpdateEmail } from '../services/geminiService';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, EditIcon, ClockIcon, LocationPinIcon, BoardIcon, UserProfile, FileIcon, TrashIcon, iconMap, SearchIcon, ClockRewindIcon, CalendarCheckIcon, ChevronDownIcon, UsersIcon, SupplierIcon, CustomerIcon, TagIcon, WarningIcon } from './Icons';
import { Modal } from './Modal';
import Breadcrumbs from './Breadcrumbs';
import { CompletedAppointmentsModal } from './CompletedAppointmentsModal';
import FloatingActionButton from './FloatingActionButton';
import { useLocalization } from '../contexts/LocalizationContext';
import { Holiday, fetchNationalHolidays } from '../services/holidayService';

// --- DATE HELPER FUNCTIONS ---
const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday, make Monday the first day
  return new Date(d.setDate(diff));
};


const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// --- APPOINTMENT FORM ---
interface AppointmentFormProps {
    appointment?: Appointment | null;
    customers: Customer[];
    suppliers: Supplier[];
    users: User[];
    onSave: (appointment: Omit<Appointment, 'id' | 'participants' | 'companyId' | 'status' | 'recurrenceRule' | 'history' | 'dueDate' | 'reminder' | 'subtasks'> & { participantIds: string[], notify: boolean; recurrenceRule?: RecurrenceRule; attachments?: Attachment[], dueDate?: Date, reminder?: number }) => void;
    onCancel: () => void;
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDark: boolean;
    onDirtyChange: (isDirty: boolean) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const toDateTimeLocal = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getCategoryTextColor = (category: string, config: { [key: string]: { icon: string; color: string; } }, isDark: boolean): string => {
    const categoryConfig = config[category];
    const color = categoryConfig ? categoryConfig.color : 'gray';

    const lightStyles: Record<string, string> = {
        blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600',
        yellow: 'text-yellow-600', pink: 'text-pink-600', gray: 'text-gray-600',
    };
    const darkStyles: Record<string, string> = {
        blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400',
        yellow: 'text-yellow-400', pink: 'text-pink-400', gray: 'text-gray-400',
    };

    return (isDark ? darkStyles : lightStyles)[color] || (isDark ? darkStyles : lightStyles)['gray'];
};


const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, customers, suppliers, users, onSave, onCancel, appointmentCategoryConfig, isDark, onDirtyChange }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        title: '', description: '', start: '', end: '', dueDate: '', location: '',
        category: Object.keys(appointmentCategoryConfig)[0] || 'Outro',
        customerId: undefined as string | undefined, supplierId: undefined as string | undefined,
        attachments: [] as Attachment[], reminder: 'none', notify: true, isRecurring: false,
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly', until: '',
        selectedParticipants: [] as User[],
    });
    const [initialData, setInitialData] = useState<typeof formData | null>(null);
    const [errors, setErrors] = useState<{ general?: string; startEnd?: string; dueDate?: string; recurrence?: string }>({});
    const [participantSearch, setParticipantSearch] = useState('');
    const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
    const participantRef = useRef<HTMLDivElement>(null);

    const selectedCategoryConfig = appointmentCategoryConfig[formData.category];
    const SelectedIcon = selectedCategoryConfig ? iconMap[selectedCategoryConfig.icon] : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (participantRef.current && !participantRef.current.contains(event.target as Node)) {
                setIsParticipantDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setErrors({});
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const data = {
            title: appointment?.title || '', description: appointment?.description || '',
            start: appointment ? toDateTimeLocal(appointment.start) : toDateTimeLocal(now),
            end: appointment ? toDateTimeLocal(appointment.end) : toDateTimeLocal(oneHourLater),
            dueDate: appointment?.dueDate ? toDateTimeLocal(appointment.dueDate) : '',
            location: appointment?.location || '', category: appointment?.category || Object.keys(appointmentCategoryConfig)[0] || 'Outro',
            customerId: appointment?.customerId, supplierId: appointment?.supplierId, attachments: appointment?.attachments || [],
            reminder: appointment?.reminder ? String(appointment.reminder) : 'none', notify: true,
            selectedParticipants: (appointment?.participants.filter(p => 'role' in p) as User[]) || [],
            isRecurring: !!appointment?.recurrenceRule, frequency: appointment?.recurrenceRule?.frequency || 'weekly',
            until: appointment?.recurrenceRule?.until.toISOString().split('T')[0] || '',
        };

        setFormData(data);
        setInitialData(data);
        onDirtyChange(false);
    }, [appointment, appointmentCategoryConfig]);
    
    useEffect(() => {
        if (initialData) {
            // Compare primitive fields
            const primitivesDirty =
                formData.title !== initialData.title ||
                formData.description !== initialData.description ||
                formData.start !== initialData.start ||
                formData.end !== initialData.end ||
                formData.dueDate !== initialData.dueDate ||
                formData.location !== initialData.location ||
                formData.category !== initialData.category ||
                formData.customerId !== initialData.customerId ||
                formData.supplierId !== initialData.supplierId ||
                formData.reminder !== initialData.reminder ||
                formData.notify !== initialData.notify ||
                formData.isRecurring !== initialData.isRecurring ||
                formData.frequency !== initialData.frequency ||
                formData.until !== initialData.until;
            
            // Compare array fields using JSON.stringify
            const attachmentsDirty = JSON.stringify(formData.attachments) !== JSON.stringify(initialData.attachments);
            const participantsDirty = JSON.stringify(formData.selectedParticipants) !== JSON.stringify(initialData.selectedParticipants);
    
            onDirtyChange(primitivesDirty || attachmentsDirty || participantsDirty);
        }
    }, [formData, initialData, onDirtyChange]);


    const handleFormChange = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({...prev, ...updates}));
        if (('start' in updates || 'end' in updates) && errors.startEnd) setErrors(p => ({ ...p, startEnd: undefined }));
        if ('dueDate' in updates && errors.dueDate) setErrors(p => ({ ...p, dueDate: undefined }));
        if ('until' in updates && errors.recurrence) setErrors(p => ({ ...p, recurrence: undefined }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newAttachments = await Promise.all(Array.from(e.target.files).map(async (file: File) => ({
            id: `file-${Date.now()}-${Math.random()}`, name: file.name, type: file.type,
            content: await fileToBase64(file),
        })));
        handleFormChange({ attachments: [...formData.attachments, ...newAttachments] });
    };

    const removeAttachment = (id: string) => handleFormChange({ attachments: formData.attachments.filter(att => att.id !== id) });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let newErrors: typeof errors = {};
        if (!formData.title.trim() || !formData.start || !formData.end) newErrors.general = t('agenda.form.errors.general');

        const startDate = new Date(formData.start); const endDate = new Date(formData.end);
        const dueDateValue = formData.dueDate ? new Date(formData.dueDate) : undefined;

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) newErrors.startEnd = t('agenda.form.errors.invalidDate');
        else if (endDate <= startDate) newErrors.startEnd = t('agenda.form.errors.endBeforeStart');
        if (dueDateValue && !isNaN(dueDateValue.getTime()) && !isNaN(startDate.getTime()) && dueDateValue <= startDate) newErrors.dueDate = t('agenda.form.errors.dueAfterStart');
        if (formData.isRecurring && !formData.until) newErrors.recurrence = t('agenda.form.errors.recurrenceEnd');

        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setErrors({});

        const recurrenceRule = formData.isRecurring && formData.until ? { frequency: formData.frequency, until: new Date(formData.until) } : undefined;
        const participantIds = formData.selectedParticipants.map(p => p.id);
        const reminderValue = formData.reminder === 'none' ? undefined : parseInt(formData.reminder, 10);

        onSave({
            title: formData.title, description: formData.description, start: startDate, end: endDate, dueDate: dueDateValue,
            location: formData.location, category: formData.category, customerId: formData.customerId, supplierId: formData.supplierId,
            attachments: formData.attachments, participantIds, notify: formData.notify, recurrenceRule, reminder: reminderValue,
        });
    };

    const availableUsers = useMemo(() => users.filter(user => !formData.selectedParticipants.find(p => p.id === user.id) && user.name.toLowerCase().includes(participantSearch.toLowerCase())), [users, formData.selectedParticipants, participantSearch]);
    const addParticipant = (user: User) => {
        handleFormChange({ selectedParticipants: [...formData.selectedParticipants, user] });
        setParticipantSearch('');
        setIsParticipantDropdownOpen(false);
    };
    const removeParticipant = (userId: string) => handleFormChange({ selectedParticipants: formData.selectedParticipants.filter(p => p.id !== userId) });

    // Component JSX...
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             {errors.general && <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600 px-4 py-3 rounded" role="alert">{errors.general}</div>}
            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('agenda.form.generalInfo')}</legend>
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.title')}</label>
                    <input type="text" id="title" value={formData.title} onChange={e => handleFormChange({ title: e.target.value })} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.description')}</label>
                    <textarea id="description" value={formData.description} onChange={e => handleFormChange({ description: e.target.value })} rows={3} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"></textarea>
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('agenda.form.dateAndTime')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.start')}</label>
                        <input type="datetime-local" id="start" value={formData.start} onChange={e => handleFormChange({ start: e.target.value })} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.startEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                    <div>
                        <label htmlFor="end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.end')}</label>
                        <input type="datetime-local" id="end" value={formData.end} onChange={e => handleFormChange({ end: e.target.value })} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.startEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    </div>
                    {errors.startEnd && <p className="md:col-span-2 text-red-600 text-sm -mt-2">{errors.startEnd}</p>}
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.dueDate')}</label>
                    <input type="datetime-local" id="dueDate" value={formData.dueDate} onChange={e => handleFormChange({ dueDate: e.target.value })} className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                    {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
                </div>
                 <div className="pt-2 space-y-2">
                    <label htmlFor="isRecurring" className="flex items-center">
                        <input type="checkbox" id="isRecurring" checked={formData.isRecurring} onChange={e => handleFormChange({ isRecurring: e.target.checked })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900" />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('agenda.form.repeat')}</span>
                    </label>
                    {formData.isRecurring && (
                        <div className="pl-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.frequency')}</label>
                                    <select id="frequency" value={formData.frequency} onChange={e => handleFormChange({ frequency: e.target.value as any })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                                        <option value="daily">{t('agenda.form.frequencies.daily')}</option>
                                        <option value="weekly">{t('agenda.form.frequencies.weekly')}</option>
                                        <option value="monthly">{t('agenda.form.frequencies.monthly')}</option>
                                        <option value="yearly">{t('agenda.form.frequencies.yearly')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="until" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.repeatUntil')}</label>
                                    <input type="date" id="until" value={formData.until} onChange={e => handleFormChange({ until: e.target.value })} required className={`mt-1 block w-full border rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark] focus:ring-primary focus:border-primary ${errors.recurrence ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                </div>
                            </div>
                            {errors.recurrence && <p className="text-red-600 text-sm">{errors.recurrence}</p>}
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('agenda.form.detailsAndAssociations')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.location')}</label>
                        <input type="text" id="location" value={formData.location} onChange={e => handleFormChange({ location: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.category')}</label>
                         <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {SelectedIcon && <SelectedIcon className={`w-5 h-5 ${getCategoryTextColor(formData.category, appointmentCategoryConfig, isDark)}`} />}
                            </div>
                            <select id="category" value={formData.category} onChange={e => handleFormChange({ category: e.target.value })} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-10 pr-10 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary appearance-none">
                                {Object.keys(appointmentCategoryConfig).map(cat => <option key={cat} value={cat}>{t(`appointment.category.${cat}`)}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><ChevronDownIcon className="w-5 h-5 text-gray-400" /></div>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="reminder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.reminder')}</label>
                    <select id="reminder" value={formData.reminder} onChange={e => handleFormChange({ reminder: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                        <option value="none">{t('agenda.form.reminders.none')}</option>
                        <option value="5">{t('agenda.form.reminders.5')}</option>
                        <option value="15">{t('agenda.form.reminders.15')}</option>
                        <option value="30">{t('agenda.form.reminders.30')}</option>
                        <option value="60">{t('agenda.form.reminders.60')}</option>
                        <option value="1440">{t('agenda.form.reminders.1440')}</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.relatedCustomer')}</label>
                        <select id="customer" value={formData.customerId || ''} onChange={e => handleFormChange({ customerId: e.target.value || undefined })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                            <option value="">{t('agenda.form.noCustomer')}</option>
                            {customers.map((c: Customer) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.relatedSupplier')}</label>
                        <select id="supplier" value={formData.supplierId || ''} onChange={e => handleFormChange({ supplierId: e.target.value || undefined })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary">
                            <option value="">{t('agenda.form.noSupplier')}</option>
                            {suppliers.map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4 p-4 border dark:border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-secondary dark:text-gray-200 px-2 -mx-2">{t('agenda.form.participantsAndAttachments')}</legend>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.teamParticipants')}</label>
                    <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[40px] bg-white dark:bg-gray-800">
                        {formData.selectedParticipants.length > 0 ? (
                            formData.selectedParticipants.map(user => (
                                <div key={user.id} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-300 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-2 animate-fade-in">
                                    <UserProfile user={user} className="w-5 h-5" />
                                    <span>{user.name}</span>
                                    <button type="button" onClick={() => removeParticipant(user.id)} className="text-primary hover:text-red-500 dark:text-indigo-300 dark:hover:text-red-400">&times;</button>
                                </div>
                            ))
                        ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500 p-1">{t('agenda.form.noParticipants')}</span>
                        )}
                    </div>
                    <div className="relative mt-2" ref={participantRef}>
                        <button
                            type="button"
                            onClick={() => setIsParticipantDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover dark:text-indigo-300 dark:hover:text-indigo-200 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 px-3 py-1.5 rounded-md transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            {t('agenda.form.addParticipant')}
                        </button>

                        {isParticipantDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg animate-fade-in">
                                <div className="p-2 border-b dark:border-gray-700">
                                    <div className="relative">
                                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={participantSearch}
                                            onChange={e => setParticipantSearch(e.target.value)}
                                            placeholder={t('agenda.form.searchTeam')}
                                            className="w-full pl-8 pr-2 py-1.5 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <ul className="max-h-48 overflow-y-auto">
                                    {availableUsers.map((user: User) => (
                                        <li key={user.id} onClick={() => addParticipant(user)} className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                            <UserProfile user={user} className="w-6 h-6" />
                                            <span>{user.name}</span>
                                        </li>
                                    ))}
                                    {availableUsers.length === 0 && (
                                        <li className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {t('agenda.form.noUsersFound')}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('agenda.form.attachments')}</label>
                    <div className="mt-1">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>{t('agenda.form.addFiles')}</span>
                            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                        </label>
                    </div>
                    {formData.attachments.length > 0 && (
                        <ul className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-200 dark:divide-gray-600">
                            {formData.attachments.map(att => (
                                <li key={att.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                        <FileIcon className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        <span className="ml-2 flex-1 w-0 truncate dark:text-gray-300">{att.name}</span>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button type="button" onClick={() => removeAttachment(att.id)} className="font-medium text-red-600 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </fieldset>

             <div className="pt-2">
                <label htmlFor="notify" className="flex items-center">
                    <input type="checkbox" id="notify" checked={formData.notify} onChange={e => handleFormChange({ notify: e.target.checked })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-900" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('agenda.form.notify')}</span>
                </label>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">{appointment ? t('common.saveChanges') : t('common.save')}</button>
            </div>
        </form>
    );
};


const getCategoryBgStyle = (category: string, config: { [key: string]: { icon: string; color: string; } }, isDark: boolean): string => {
    const categoryConfig = config[category];
    const color = categoryConfig ? categoryConfig.color : 'gray';
    const lightStyles: Record<string, string> = { blue: 'bg-blue-100', green: 'bg-green-100', purple: 'bg-purple-100', yellow: 'bg-yellow-100', pink: 'bg-pink-100', gray: 'bg-gray-100' };
    const darkStyles: Record<string, string> = { blue: 'bg-blue-900/40', green: 'bg-green-900/40', purple: 'bg-purple-900/40', yellow: 'bg-yellow-900/40', pink: 'bg-pink-900/40', gray: 'bg-gray-700' };
    return (isDark ? darkStyles : lightStyles)[color] || (isDark ? darkStyles : lightStyles)['gray'];
};

const AppointmentCard: React.FC<{
    appointment: Appointment;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, appointmentId: string) => void;
    onClick: () => void;
    onToggleStatus: () => void;
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDraggable?: boolean;
}> = ({ appointment, onDragStart, onClick, onToggleStatus, appointmentCategoryConfig, isDraggable = true }) => {
    const { state, hasPermission } = useAppState();
    const { t, locale } = useLocalization();
    const isDark = state.theme === 'dark';
    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
    const categoryConfig = appointmentCategoryConfig[appointment.category];
    const IconComponent = categoryConfig ? iconMap[categoryConfig.icon] ?? iconMap['TagIcon'] : iconMap['TagIcon'];
    
    const subtasks = appointment.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const totalSubtasks = subtasks.length;


    return (
    <div
        draggable={isDraggable && !isCompleted && hasPermission('MANAGE_AGENDA') && onDragStart !== undefined}
        onClick={onClick}
        onDragStart={(e) => onDragStart && onDragStart(e, appointment.id)}
        className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-opacity ${isCompleted ? 'opacity-60 cursor-default' : 'cursor-pointer active:cursor-grabbing'}`}
    >
        <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 ${getCategoryBgStyle(appointment.category, appointmentCategoryConfig, isDark)}`}>
                {IconComponent && <IconComponent className={`w-3 h-3 ${getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}`}/>}
                <span className={getCategoryTextColor(appointment.category, appointmentCategoryConfig, isDark)}>{t(`appointment.category.${appointment.category}`)}</span>
            </span>
            {hasPermission('MANAGE_AGENDA') && (
                <input type="checkbox" checked={isCompleted} onChange={onToggleStatus} onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 text-primary focus:ring-primary bg-gray-100 dark:bg-gray-900" aria-label={`Mark ${appointment.title} as completed`} />
            )}
        </div>
        <h4 className={`font-bold text-sm text-secondary dark:text-gray-100 mt-2 ${isCompleted ? 'line-through' : ''}`}>{appointment.title}</h4>
        <div className="text-xs text-medium dark:text-gray-400 mt-2 space-y-1">
            <div className="flex items-center gap-2">
                <ClockIcon className="flex-shrink-0" />
                <span>{appointment.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {appointment.end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
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
             {totalSubtasks > 0 && (
                <div className="text-xs text-medium dark:text-gray-400 flex items-center gap-1" title={`${completedSubtasks} de ${totalSubtasks} subtarefas concluídas`}>
                    <CalendarCheckIcon className="w-4 h-4"/>
                    <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
            )}
            {appointment.dueDate && !isCompleted && (
                <div className="text-yellow-600 dark:text-yellow-400" title={`Vence em: ${appointment.dueDate.toLocaleDateString(locale)}`}>
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

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, setViewMode }) => {
    const { t } = useLocalization();
    const viewModes: {key: ViewMode, icon?: React.FC<any>}[] = [
        {key: 'board', icon: BoardIcon}, {key: 'list'}, {key: 'month'}, {key: 'week'}, {key: 'day'},
    ];

    return (
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex-wrap justify-center">
            {viewModes.map(({key, icon: Icon}) => (
            <button key={key} onClick={() => setViewMode(key)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize flex items-center gap-2 ${viewMode === key ? 'bg-white dark:bg-gray-900 text-primary dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                {Icon && <Icon className="w-4 h-4" />}
                {t(`agenda.views.${key}`)}
            </button>
            ))}
        </div>
    );
};

const AppointmentDetailView: React.FC<{
    appointment: Appointment; users: User[]; onEdit: (appointment: Appointment) => void;
    onClose: () => void; appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    isDark: boolean; onReopen: (appointment: Appointment) => void;
    onGenerateSummary: (appointment: Appointment) => void;
}> = ({ appointment, users, onEdit, onClose, appointmentCategoryConfig, isDark, onReopen, onGenerateSummary }) => {
    const { hasPermission, dispatch, state } = useAppState();
    const { companies, plans } = state;
    const { t, locale } = useLocalization();
    const [activeTab, setActiveTab] = useState('details');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [subtaskToDelete, setSubtaskToDelete] = useState<Subtask | null>(null);

    const appointmentCompany = useMemo(() => companies.find(c => c.id === appointment.companyId), [companies, appointment]);
    const appointmentPlan = useMemo(() => plans.find(p => p.id === appointmentCompany?.planId), [plans, appointmentCompany]);
    const canUseAI = appointmentPlan?.hasAI ?? false;

    const categoryConfig = appointmentCategoryConfig[appointment.category];
    const IconComponent = categoryConfig ? iconMap[categoryConfig.icon] : TagIcon;
    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
    
    const subtasks = appointment.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const totalSubtasks = subtasks.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    
    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim()) {
            dispatch({ type: 'ADD_SUBTASK', payload: { appointmentId: appointment.id, title: newSubtaskTitle.trim() } });
            setNewSubtaskTitle('');
        }
    };
    const handleToggleSubtask = (subtaskId: string) => dispatch({ type: 'TOGGLE_SUBTASK_STATUS', payload: { appointmentId: appointment.id, subtaskId } });
    
    const handleDeleteSubtask = (subtask: Subtask) => {
        setSubtaskToDelete(subtask);
    };

    const confirmDeleteSubtask = () => {
        if (subtaskToDelete) {
            dispatch({ type: 'DELETE_SUBTASK', payload: { appointmentId: appointment.id, subtaskId: subtaskToDelete.id } });
            setSubtaskToDelete(null);
        }
    };

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        {t('agenda.details.title')}
                    </button>
                    {appointment.history && appointment.history.length > 0 && (
                        <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary text-primary dark:text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            {t('agenda.details.history')}
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
                        <p className="text-gray-600 dark:text-gray-400">{appointment.description || t('agenda.details.noDescription')}</p>
                        
                         {totalSubtasks > 0 && (
                            <div className="my-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t('agenda.details.subtasks')}</h4>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{completedSubtasks}/{totalSubtasks}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <ul className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {subtasks.map(subtask => (
                                        <li key={subtask.id} className="flex items-center justify-between">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" checked={subtask.completed} onChange={() => handleToggleSubtask(subtask.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                                <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{subtask.title}</span>
                                            </label>
                                            {hasPermission('MANAGE_AGENDA') && <button onClick={() => handleDeleteSubtask(subtask)} className="text-gray-400 hover:text-red-500" title={t('agenda.details.deleteSubtask')}><TrashIcon className="w-4 h-4"/></button>}
                                        </li>
                                    ))}
                                </ul>
                                {hasPermission('MANAGE_AGENDA') && !isCompleted && (
                                    <div className="mt-4 flex gap-2">
                                        <input type="text" value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSubtask()} placeholder={t('agenda.details.addSubtaskPlaceholder')} className="flex-grow p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                                        <button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary-hover disabled:bg-primary/50">{t('common.add')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="border-t dark:border-gray-600 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300 block">{t('agenda.details.dateTime')}</strong> <span className="text-gray-600 dark:text-gray-400">{appointment.start.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })} - {appointment.end.toLocaleString(locale, { timeStyle: 'short' })}</span></div>
                            <div><strong className="font-semibold text-gray-700 dark:text-gray-300 block">{t('agenda.details.location')}</strong> <span className="text-gray-600 dark:text-gray-400">{appointment.location || t('agenda.details.notSpecified')}</span></div>
                            {appointment.dueDate && <div><strong className="font-semibold text-gray-700 dark:text-gray-300 block">{t('agenda.details.dueDate')}</strong> <span className="text-gray-600 dark:text-gray-400">{appointment.dueDate.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })}</span></div>}
                            <div className="col-span-1 sm:col-span-2"><strong className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">{t('agenda.details.participants')}</strong>
                                <div className="flex flex-wrap gap-4">
                                    {appointment.participants.map(p => (
                                        <div key={p.id} className="flex items-center gap-2">
                                            <UserProfile user={p} className="w-8 h-8"/>
                                            <div>
                                                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.name}</p>
                                                {'role' in p && <p className="text-xs text-gray-500 dark:text-gray-400">{t(`settings.users.form.roles.${(p as User).role.toLowerCase()}`)}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {appointment.attachments && appointment.attachments.length > 0 && (
                                <div className="col-span-1 sm:col-span-2"><strong className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">{t('agenda.details.attachments')}</strong>
                                    <ul className="space-y-2">
                                        {appointment.attachments.map(att => (
                                            <li key={att.id}>
                                                <a href={att.content} download={att.name} className="flex items-center gap-2 text-primary hover:underline">
                                                    <FileIcon className="w-5 h-5"/> {att.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                 {activeTab === 'history' && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {(appointment.history || []).map((entry, index) => {
                             const user = users.find(u => u.id === entry.modifiedById);
                             return (
                                 <div key={index} className="flex items-start gap-3">
                                     <UserProfile user={user} className="w-8 h-8 mt-1"/>
                                     <div className="flex-1 text-xs p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                         <p className="font-semibold text-gray-800 dark:text-gray-200">{t('agenda.details.modifiedBy')} {user?.name || t('common.unknownUser')}</p>
                                         <p className="text-gray-500 dark:text-gray-400">{entry.modifiedAt.toLocaleString(locale)}</p>
                                         <div className="mt-2 pt-2 border-t dark:border-gray-700">
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{t('agenda.details.previousData')}:</p>
                                            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                                                <li>{entry.previousState.title}</li>
                                                <li>{entry.previousState.start.toLocaleString(locale)} - {entry.previousState.end.toLocaleString(locale)}</li>
                                            </ul>
                                         </div>
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                )}
            </div>
            <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                 {isCompleted ? (
                    <div className="flex gap-2">
                        {hasPermission('MANAGE_AGENDA') && <button onClick={() => onReopen(appointment)} className="flex items-center gap-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/60"><ClockRewindIcon className="w-4 h-4"/>{t('agenda.details.reopen')}</button>}
                         {canUseAI && <button onClick={() => onGenerateSummary(appointment)} className="flex items-center gap-1.5 bg-indigo-100 text-primary dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/60"><SparklesIcon className="w-4 h-4"/>{t('agenda.details.aiSummary')}</button>}
                    </div>
                ) : (
                    <div>
                        {hasPermission('MANAGE_AGENDA') && <button onClick={() => onEdit(appointment)} className="flex items-center gap-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"><EditIcon className="w-4 h-4"/>{t('agenda.details.edit')}</button>}
                    </div>
                )}
                 <button onClick={onClose} className="text-sm font-semibold text-primary hover:underline">{t('common.close')}</button>
            </div>
            <Modal isOpen={!!subtaskToDelete} onClose={() => setSubtaskToDelete(null)} title={t('agenda.details.confirmDeleteSubtask.title')}>
                <div className="text-center p-4">
                    <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('agenda.details.confirmDeleteSubtask.body', { name: subtaskToDelete?.title }) }} />
                    <div className="flex justify-center gap-4 pt-6 mt-4">
                        <button onClick={() => setSubtaskToDelete(null)} className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">{t('common.cancel')}</button>
                        <button onClick={confirmDeleteSubtask} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('common.delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const CalendarNav: React.FC<{ currentDate: Date, setCurrentDate: (d: Date) => void, viewMode: ViewMode, locale: string, t: (key:string) => string }> = ({ currentDate, setCurrentDate, viewMode, locale, t }) => {
    
    const handlePrev = () => {
        if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        if (viewMode === 'week') setCurrentDate(addDays(currentDate, -7));
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1));
    };

    const handleNext = () => {
        if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const title = useMemo(() => {
        if (viewMode === 'month') return currentDate.toLocaleString(locale, { month: 'long', year: 'numeric' });
        if (viewMode === 'day') return currentDate.toLocaleString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (viewMode === 'week') {
            const start = startOfWeek(currentDate);
            const end = addDays(start, 6);
            return `${start.toLocaleDateString(locale, {day: 'numeric', month: 'short'})} - ${end.toLocaleDateString(locale, {day: 'numeric', month: 'short', year: 'numeric'})}`;
        }
        return '';
    }, [currentDate, viewMode, locale]);

    return (
        <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon /></button>
                <button onClick={handleNext} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon /></button>
                <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{t('common.today')}</button>
            </div>
            <h2 className="text-lg font-bold text-secondary dark:text-gray-100 capitalize">{title}</h2>
        </div>
    );
};

const BoardView: React.FC<{appointments: Appointment[], onAppointmentClick: (app: Appointment) => void, onToggleStatus: (app: Appointment) => void, appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } }}> = ({appointments, onAppointmentClick, onToggleStatus, appointmentCategoryConfig}) => {
    const {t} = useLocalization();
    const boardColumns = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = addDays(new Date(today), 1);
        const nextWeek = addDays(new Date(today), 8);

        const columns: Record<'overdue' | 'today' | 'tomorrow' | 'next7Days' | 'future', { titleKey: string; appointments: Appointment[] }> = { 
            overdue: { titleKey: 'agenda.board.overdue', appointments: [] }, 
            today: { titleKey: 'agenda.board.today', appointments: [] }, 
            tomorrow: { titleKey: 'agenda.board.tomorrow', appointments: [] }, 
            next7Days: { titleKey: 'agenda.board.next7Days', appointments: [] }, 
            future: { titleKey: 'agenda.board.future', appointments: [] } 
        };
        appointments.forEach(app => {
            if (app.end < today) columns.overdue.appointments.push(app);
            else if (isSameDay(app.start, today)) columns.today.appointments.push(app);
            else if (isSameDay(app.start, tomorrow)) columns.tomorrow.appointments.push(app);
            else if (app.start < nextWeek) columns.next7Days.appointments.push(app);
            else columns.future.appointments.push(app);
        });
        Object.values(columns).forEach(col => col.appointments.sort((a,b) => a.start.getTime() - b.start.getTime()));
        return columns;
    }, [appointments]);

    return (
        <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
                {(Object.keys(boardColumns) as Array<keyof typeof boardColumns>).map(key => {
                    const col = boardColumns[key];
                    return (
                        <div key={key} className="w-72 bg-white dark:bg-gray-800 p-3 rounded-lg flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                            <h3 className="font-bold text-secondary dark:text-gray-200 px-2 mb-3">{t(col.titleKey)} ({col.appointments.length})</h3>
                            <div className="space-y-3 h-full overflow-y-auto pr-1">
                                {col.appointments.map(app => (
                                    <AppointmentCard key={app.id} appointment={app} onClick={() => onAppointmentClick(app)} onToggleStatus={() => onToggleStatus(app)} appointmentCategoryConfig={appointmentCategoryConfig}/>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const MonthView: React.FC<{appointments: Appointment[], currentDate: Date, onAppointmentClick: (app: Appointment) => void, locale: string, appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } }, holidays: Holiday[] }> = ({appointments, currentDate, onAppointmentClick, locale, appointmentCategoryConfig, holidays}) => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const { t } = useLocalization();
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number, left: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const appointmentsByDay = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const dayKey = app.start.toDateString();
            if (!map.has(dayKey)) map.set(dayKey, []);
            map.get(dayKey)!.push(app);
        });
        return map;
    }, [appointments]);

    const holidaysByDay = useMemo(() => {
        const map = new Map<string, Holiday>();
        holidays.forEach(holiday => {
            map.set(holiday.date.toDateString(), holiday);
        });
        return map;
    }, [holidays]);


    const handleDayClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
        const dayKey = day.toDateString();
        const hasAppointments = appointmentsByDay.has(dayKey);
        const isHoliday = holidaysByDay.has(dayKey);

        if (hasAppointments || isHoliday) {
            const rect = e.currentTarget.getBoundingClientRect();
            setSelectedDay(day);
            
            const popoverWidth = 256; // w-64
            const spaceRight = window.innerWidth - rect.right;
            
            let left = rect.right + 10;
            if (spaceRight < popoverWidth + 20) {
                left = rect.left - popoverWidth - 10;
            }

            setPopoverPosition({ top: rect.top, left });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setSelectedDay(null);
            }
        };
        if (selectedDay) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedDay]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekDayNames = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleString(locale, { weekday: 'short' })), [locale]);

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(<div key={`empty-${i}`} className="border-r border-b dark:border-gray-700"></div>);

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const dayKey = day.toDateString();
        const dayAppointments = appointmentsByDay.get(dayKey) || [];
        const isToday = isSameDay(day, today);
        const holiday = holidaysByDay.get(dayKey);
        const hasAppointments = dayAppointments.length > 0;

        const uniqueCategories: string[] = Array.from(new Set(dayAppointments.map(a => a.category)));
        
        const cellClasses = `border-r border-b dark:border-gray-700 p-2 min-h-[100px] relative transition-colors ${holiday ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`;

        cells.push(
            <div key={i} className={cellClasses} onClick={(e) => handleDayClick(day, e)}>
                <div
                    className={`font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-primary text-white' : 'text-secondary dark:text-gray-200'}`}
                >
                    {i}
                </div>
                {holiday && (
                    <div className="mt-1 text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md truncate" title={holiday.name}>
                        {holiday.name}
                    </div>
                )}
                <div className="absolute bottom-2 left-2 flex gap-1">
                    {hasAppointments && uniqueCategories.slice(0, 4).map(cat => (
                        <div key={cat} className="w-2 h-2 rounded-full" style={{ backgroundColor: appointmentCategoryConfig[cat]?.color || 'gray' }} title={t(`appointment.category.${cat}`)}></div>
                    ))}
                </div>
            </div>
        );
    }
    
    const selectedAppointments = selectedDay ? (appointmentsByDay.get(selectedDay.toDateString()) || []).sort((a, b) => a.start.getTime() - b.start.getTime()) : [];
    const selectedHoliday = selectedDay ? holidaysByDay.get(selectedDay.toDateString()) : null;


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
            <div className="overflow-x-auto">
                 <div className="min-w-[700px]">
                    <div className="grid grid-cols-7 text-center font-bold text-secondary dark:text-gray-200 border-b dark:border-gray-700">
                        {weekDayNames.map(day => <div key={day} className="py-2 border-r dark:border-gray-700">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 flex-grow border-l dark:border-gray-700">
                        {cells}
                    </div>
                </div>
            </div>

            {selectedDay && popoverPosition && (
                 <>
                    <div className="fixed inset-0 z-10" onClick={() => setSelectedDay(null)}></div>
                    <div
                        ref={popoverRef}
                        className="fixed z-20 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border dark:border-gray-700 animate-fade-in"
                        style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="font-bold text-secondary dark:text-gray-100 mb-2">{selectedDay.toLocaleDateString(locale, { weekday: 'long', day: 'numeric' })}</h4>
                        {selectedHoliday && (
                            <div className="mb-2 p-2 rounded-md bg-amber-100 dark:bg-amber-900/40">
                                <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">{selectedHoliday.name}</p>
                            </div>
                        )}
                        {selectedAppointments.length > 0 ? (
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedAppointments.map(app => (
                                    <li key={app.id} className="text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded" onClick={() => onAppointmentClick(app)}>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{app.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3"/>
                                            {app.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {app.end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : !selectedHoliday && <p className="text-sm text-gray-500 dark:text-gray-400">{t('header.noAppointmentsToday')}</p>}
                    </div>
                </>
            )}
        </div>
    );
}

const CalendarEvent: React.FC<{
    appointment: Appointment,
    onClick: () => void,
    onDragStart: (e: React.DragEvent, appointmentId: string) => void,
    isDark: boolean,
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } },
    style: React.CSSProperties
}> = ({ appointment, onClick, onDragStart, isDark, appointmentCategoryConfig, style }) => {
    const { hasPermission } = useAppState();
    const { locale } = useLocalization();
    const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
    
    const category = appointmentCategoryConfig[appointment.category] || appointmentCategoryConfig['OTHER'];

    const bgColorsLight: Record<string, string> = { blue: 'bg-blue-50', green: 'bg-green-50', purple: 'bg-purple-50', yellow: 'bg-yellow-50', pink: 'bg-pink-50', gray: 'bg-gray-50' };
    const bgColorsDark: Record<string, string> = { blue: 'bg-blue-900/50', green: 'bg-green-900/50', purple: 'bg-purple-900/50', yellow: 'bg-yellow-900/50', pink: 'bg-pink-900/50', gray: 'bg-gray-700/50' };
    const borderColorsLight: Record<string, string> = { blue: 'border-blue-300', green: 'border-green-300', purple: 'border-purple-300', yellow: 'border-yellow-300', pink: 'border-pink-300', gray: 'border-gray-300' };
    const borderColorsDark: Record<string, string> = { blue: 'border-blue-600', green: 'border-green-600', purple: 'border-purple-600', yellow: 'border-yellow-600', pink: 'border-pink-600', gray: 'border-gray-600' };
    const textColorsLight: Record<string, string> = { blue: 'text-blue-800', green: 'text-green-800', purple: 'text-purple-800', yellow: 'text-yellow-800', pink: 'text-pink-800', gray: 'text-gray-800' };
    const textColorsDark: Record<string, string> = { blue: 'text-blue-200', green: 'text-green-200', purple: 'text-purple-200', yellow: 'text-yellow-200', pink: 'text-pink-200', gray: 'text-gray-200' };

    const bgColor = (isDark ? bgColorsDark : bgColorsLight)[category.color];
    const borderColor = (isDark ? borderColorsDark : borderColorsLight)[category.color];
    const textColor = (isDark ? textColorsDark : textColorsLight)[category.color];

    return (
        <div
            style={style}
            onClick={onClick}
            draggable={!isCompleted && hasPermission('MANAGE_AGENDA')}
            onDragStart={(e) => onDragStart(e, appointment.id)}
            className={`absolute p-2 rounded-md border-l-4 transition-all duration-200 ease-in-out overflow-hidden flex flex-col ${bgColor} ${borderColor} ${textColor} ${!isCompleted && hasPermission('MANAGE_AGENDA') ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
        >
            <p className="font-bold text-xs truncate">{appointment.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} - {appointment.title}</p>
            <p className="text-xs opacity-80 truncate mt-1">{appointment.location}</p>
        </div>
    )
}

interface TimeGridViewProps {
    days: Date[]; 
    appointments: Appointment[]; 
    onAppointmentClick: (app: Appointment) => void; 
    isDark: boolean; 
    locale: string; 
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } };
    onAppointmentDrop: (appointmentId: string, newStart: Date) => void;
    currentDate: Date;
    holidays: Holiday[];
}

const TimeGridView: React.FC<TimeGridViewProps> = ({ days, appointments, onAppointmentClick, isDark, locale, appointmentCategoryConfig, onAppointmentDrop, holidays }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    const timeIndicatorRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const updateLine = () => {
            const now = new Date();
            const todayIndex = days.findIndex(day => isSameDay(day, now));

            if (timeIndicatorRef.current && todayIndex !== -1) {
                const totalMinutes = now.getHours() * 60 + now.getMinutes();
                const topPercent = (totalMinutes / (24 * 60)) * 100;
                timeIndicatorRef.current.style.top = `${topPercent}%`;
                
                const dayColumnWidthPercent = 100 / days.length;
                const leftPercent = dayColumnWidthPercent * todayIndex;
                timeIndicatorRef.current.style.left = `${leftPercent}%`;
                timeIndicatorRef.current.style.width = `${dayColumnWidthPercent}%`;

                timeIndicatorRef.current.style.display = 'flex';
            } else if (timeIndicatorRef.current) {
                timeIndicatorRef.current.style.display = 'none';
            }
        };

        updateLine();
        const intervalId = setInterval(updateLine, 60000); // Update every minute
        return () => clearInterval(intervalId);
    }, [days]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
        e.preventDefault();
        const appointmentId = e.dataTransfer.getData('appointmentId');
        const newStart = new Date(day);
        newStart.setHours(hour, 0, 0, 0);
        onAppointmentDrop(appointmentId, newStart);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
            {/* Header */}
            <div className="grid border-b dark:border-gray-700" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
                <div className="p-2 border-r dark:border-gray-700"></div> {/* Time column header */}
                {days.map(day => {
                    const holiday = holidays.find(h => isSameDay(h.date, day));
                    return (
                    <div key={day.toISOString()} className="text-center p-2 border-r last:border-r-0 dark:border-gray-700">
                        <p className={`text-xs font-semibold uppercase ${isSameDay(day, today) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>{day.toLocaleString(locale, { weekday: 'short' })}</p>
                        <p className={`text-lg font-bold ${isSameDay(day, today) ? 'text-primary' : 'text-secondary dark:text-gray-200'}`}>{day.getDate()}</p>
                        {holiday && <p className="text-xs text-amber-600 dark:text-amber-400 font-normal truncate px-1" title={holiday.name}>{holiday.name}</p>}
                    </div>
                )})}
            </div>
            
            {/* Body */}
            <div className="flex-grow overflow-y-auto relative">
                <div className="grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
                    {/* Time column */}
                    <div className="col-start-1 col-end-2">
                        {hours.map(hour => (
                            <div key={hour} className="h-16 text-right pr-2 text-xs text-gray-400 dark:text-gray-500 border-b border-r dark:border-gray-700 pt-1">
                                {hour > 0 && `${hour}:00`}
                            </div>
                        ))}
                    </div>
                    
                    {/* Day columns */}
                    {days.map((day, dayIndex) => {
                         const isHoliday = holidays.some(h => isSameDay(h.date, day));
                        return(
                        <div key={day.toISOString()} className={`relative col-start-auto col-end-auto ${isHoliday ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                            {hours.map(hour => (
                                <div 
                                    key={`${day.toISOString()}-${hour}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day, hour)}
                                    className="h-16 border-b border-r last:border-r-0 dark:border-gray-700"
                                ></div>
                            ))}
                            {/* Render appointments for this day */}
                            {appointments.filter(app => isSameDay(app.start, day)).map(app => {
                                const startMinutes = app.start.getHours() * 60 + app.start.getMinutes();
                                const endMinutes = app.end.getHours() * 60 + app.end.getMinutes();
                                const durationMinutes = endMinutes - startMinutes;
                                const top = (startMinutes / (24 * 60)) * 100;
                                const height = (durationMinutes / (24 * 60)) * 100;

                                return (
                                    <CalendarEvent
                                        key={app.id}
                                        appointment={app}
                                        onClick={() => onAppointmentClick(app)}
                                        onDragStart={(e, id) => e.dataTransfer.setData('appointmentId', id)}
                                        isDark={isDark}
                                        appointmentCategoryConfig={appointmentCategoryConfig}
                                        style={{ top: `${top}%`, height: `${height}%`, left: '2px', right: '2px' }}
                                    />
                                );
                            })}
                        </div>
                    )})}
                </div>
                {/* Current time indicator */}
                <div ref={timeIndicatorRef} className="absolute h-0.5 bg-red-500 items-center justify-start hidden" style={{ zIndex: 10, pointerEvents: 'none' }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                </div>
            </div>
        </div>
    );
};

const WeekView: React.FC<Omit<TimeGridViewProps, 'days'>> = (props) => {
    const { currentDate } = props;
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);
    return <TimeGridView {...props} days={weekDays} />;
};

const DayView: React.FC<Omit<TimeGridViewProps, 'days'>> = (props) => {
    const { currentDate } = props;
    return <TimeGridView {...props} days={[currentDate]} />;
};

const ListView: React.FC<{
    appointments: Appointment[],
    onAppointmentClick: (app: Appointment) => void,
    onToggleStatus: (app: Appointment) => void,
    appointmentCategoryConfig: { [key: string]: { icon: string; color: string; } },
}> = ({ appointments, onAppointmentClick, onToggleStatus, appointmentCategoryConfig }) => {
    const { t, locale } = useLocalization();
    const isDark = useAppState().state.theme === 'dark';

    const sortedAppointments = useMemo(() => [...appointments].sort((a,b) => a.start.getTime() - b.start.getTime()), [appointments]);
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                {sortedAppointments.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedAppointments.map(app => {
                            const categoryConf = appointmentCategoryConfig[app.category] || { icon: 'TagIcon', color: 'gray' };
                            const Icon = iconMap[categoryConf.icon] || TagIcon;

                            return (
                                <li key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => onAppointmentClick(app)}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-1 rounded-full h-auto self-stretch" style={{backgroundColor: categoryConf.color || 'gray'}}></div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-secondary dark:text-gray-100">{app.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{app.start.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' })}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex -space-x-2">
                                                        {app.participants.map(p => <UserProfile key={p.id} user={p} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" />)}
                                                    </div>
                                                    <input type="checkbox" checked={app.status === AppointmentStatus.COMPLETED} onChange={(e) => { e.stopPropagation(); onToggleStatus(app); }} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" title={t('appointment.status.concluido')} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <CalendarCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-400"/>
                        <h3 className="text-lg font-semibold">{t('agenda.noScheduledAppointments')}</h3>
                    </div>
                )}
            </div>
        </div>
    );
};


const Agenda: React.FC = () => {
    const { state, dispatch, hasPermission } = useAppState();
    const { customers, suppliers, users, appointments, appointmentCategoryConfig, currentUser } = state;
    const { t, locale, language } = useLocalization();
    const [viewMode, setViewMode] = useState<ViewMode>('board');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryResult, setSummaryResult] = useState({ title: '', content: '' });
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [fetchedHolidayYear, setFetchedHolidayYear] = useState<number | null>(null);
    
     useEffect(() => {
        const year = currentDate.getFullYear();
        if (year !== fetchedHolidayYear && locale.startsWith('pt')) {
            dispatch({ type: 'SHOW_LOADING' });
            fetchNationalHolidays(year).then(fetchedHolidays => {
                setHolidays(fetchedHolidays);
                setFetchedHolidayYear(year);
                dispatch({ type: 'HIDE_LOADING' });
            }).catch(() => dispatch({ type: 'HIDE_LOADING' }));
        } else if (!locale.startsWith('pt')) {
            setHolidays([]); // Clear holidays if locale is not PT
        }
    }, [currentDate, fetchedHolidayYear, locale, dispatch]);

    const companyData = useMemo(() => {
        if (!currentUser) return { visibleAppointments: [], visibleCustomers: [], visibleSuppliers: [], visibleUsers: [] };
        
        const isSuperAdmin = hasPermission('MANAGE_ALL_COMPANIES');
    
        return {
            visibleAppointments: isSuperAdmin ? appointments : appointments.filter(a => a.companyId === currentUser.companyId),
            visibleCustomers: isSuperAdmin ? customers : customers.filter(c => c.companyId === currentUser.companyId),
            visibleSuppliers: isSuperAdmin ? suppliers : suppliers.filter(s => s.companyId === currentUser.companyId),
            visibleUsers: isSuperAdmin ? users : users.filter(u => u.companyId === currentUser.companyId),
        };
    }, [appointments, customers, suppliers, users, currentUser, hasPermission]);


    const filteredAppointments = useMemo(() => {
        return companyData.visibleAppointments
            .filter(app => {
                const searchMatch = !searchTerm || app.title.toLowerCase().includes(searchTerm.toLowerCase());
                const customerMatch = customerFilter === 'all' || app.customerId === customerFilter;
                const supplierMatch = supplierFilter === 'all' || app.supplierId === supplierFilter;
                return searchMatch && customerMatch && supplierMatch;
            });
    }, [companyData.visibleAppointments, searchTerm, customerFilter, supplierFilter]);
    
    const { scheduled, completed } = useMemo(() => {
        const sched = []; const compl = [];
        for (const app of filteredAppointments) {
            (app.status === AppointmentStatus.COMPLETED ? compl : sched).push(app);
        }
        compl.sort((a, b) => b.end.getTime() - a.end.getTime());
        return { scheduled: sched, completed: compl };
    }, [filteredAppointments]);

    const handleToggleStatus = useCallback((appointment: Appointment) => {
        const newStatus = appointment.status === AppointmentStatus.SCHEDULED ? AppointmentStatus.COMPLETED : AppointmentStatus.SCHEDULED;
        const updatedAppointment: Appointment = { ...appointment, status: newStatus };
        if (newStatus === AppointmentStatus.COMPLETED) updatedAppointment.end = new Date(); // Set completion time
        dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
    }, [dispatch]);

    const handleSaveAppointment = (data: Omit<Appointment, 'id' | 'participants' | 'companyId' | 'status' | 'recurrenceRule' | 'history'| 'dueDate'| 'reminder'| 'subtasks'> & { participantIds: string[], notify: boolean, recurrenceRule?: RecurrenceRule, attachments?: Attachment[], dueDate?: Date, reminder?: number }) => {
        if (!currentUser) return;

        const allParticipants: (User | Customer | Supplier)[] = [];
        if (data.customerId) {
            const customer = companyData.visibleCustomers.find(c => c.id === data.customerId);
            if (customer) allParticipants.push(customer);
        }
        if (data.supplierId) {
            const supplier = companyData.visibleSuppliers.find(s => s.id === data.supplierId);
            if (supplier) allParticipants.push(supplier);
        }
        const userParticipants = companyData.visibleUsers.filter(u => data.participantIds.includes(u.id));
        allParticipants.push(...userParticipants);
        
        let descriptionKey = 'UPDATE_APPOINTMENT';
        let description = `Appointment "${data.title}" was updated.`;

        if (editingAppointment) {
            const updatedAppointment = { ...editingAppointment, ...data, participants: allParticipants, recurrenceRule: data.recurrenceRule };
            dispatch({ type: 'UPDATE_APPOINTMENT', payload: updatedAppointment });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.appointmentUpdated', type: 'success' } });
            if (data.notify) {
                updatedAppointment.participants.forEach(p => sendAppointmentUpdateEmail(updatedAppointment, p, false, t, locale));
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.notificationsSent', type: 'info' } });
            }
        } else {
            const newAppointment: Appointment = {
                id: `app-${Date.now()}`,
                companyId: currentUser.companyId,
                status: AppointmentStatus.SCHEDULED,
                history: [],
                subtasks: [],
                ...data,
                participants: allParticipants,
            };
            dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.appointmentAdded', type: 'success' } });
            if (data.notify) {
                newAppointment.participants.forEach(p => sendAppointmentUpdateEmail(newAppointment, p, true, t, locale));
                dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.notificationsSent', type: 'info' } });
            }
            descriptionKey = data.recurrenceRule ? 'NEW_APPOINTMENT_SERIES' : 'NEW_APPOINTMENT';
        }
        
        dispatch({
            type: 'ADD_ACTIVITY_LOG',
            payload: { id: `log-${Date.now()}`, date: new Date(), type: 'Compromisso', descriptionKey: `activityLog.${descriptionKey}`, descriptionParams: { title: data.title }, companyId: currentUser.companyId }
        });

        setIsFormModalOpen(false);
        setEditingAppointment(null);
    };

    const handleReopen = (appointment: Appointment) => {
        handleToggleStatus(appointment);
        setIsCompletedModalOpen(false);
        dispatch({ type: 'SHOW_NOTIFICATION', payload: { messageKey: 'notifications.appointmentReopened', type: 'success' } });
    };

    const handleGenerateSummary = async (appointment: Appointment) => {
        setIsSummaryModalOpen(true);
        setIsSummaryLoading(true);
        dispatch({ type: 'SHOW_LOADING' });
        setSummaryResult({ title: appointment.title, content: '' });
        
        const langMap: Record<string, string> = { pt: 'Portuguese', es: 'Spanish' };
        const languageName = langMap[language] || 'English';

        try {
            const summary = await generateMeetingSummary(appointment, languageName, locale);
            setSummaryResult({ title: appointment.title, content: summary });
        } catch (error: any) {
            setSummaryResult({ title: appointment.title, content: t('agenda.summary.error') + `\n${error.message}` });
        } finally {
            setIsSummaryLoading(false);
            dispatch({ type: 'HIDE_LOADING' });
        }
    };

    const handleAttemptCloseModal = () => {
        if (isFormDirty) {
            if (window.confirm(t('common.confirmDiscard'))) {
                setIsFormModalOpen(false);
            }
        } else {
            setIsFormModalOpen(false);
        }
    };
    
    const handleAppointmentDrop = (appointmentId: string, newStart: Date) => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
            const duration = appointment.end.getTime() - appointment.start.getTime();
            const newEnd = new Date(newStart.getTime() + duration);
            dispatch({ type: 'UPDATE_APPOINTMENT', payload: { ...appointment, start: newStart, end: newEnd } });
        }
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary h-full flex flex-col">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100">{t('agenda.title')}</h1>
                <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {viewMode !== 'board' && <CalendarNav currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode={viewMode} locale={locale} t={t} />}
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl mb-4 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('agenda.searchPlaceholder')} className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className="w-full h-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary">
                            <option value="all">{t('agenda.filter.allCustomers')}</option>
                            {companyData.visibleCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="w-full h-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary">
                            <option value="all">{t('agenda.filter.allSuppliers')}</option>
                            {companyData.visibleSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-grow min-h-0">
                {viewMode === 'board' && <BoardView appointments={scheduled} onAppointmentClick={setViewingAppointment} onToggleStatus={handleToggleStatus} appointmentCategoryConfig={appointmentCategoryConfig} />}
                {viewMode === 'month' && <MonthView appointments={scheduled} currentDate={currentDate} onAppointmentClick={setViewingAppointment} locale={locale} appointmentCategoryConfig={appointmentCategoryConfig} holidays={holidays} />}
                {viewMode === 'week' && <WeekView appointments={scheduled} currentDate={currentDate} onAppointmentClick={setViewingAppointment} onAppointmentDrop={handleAppointmentDrop} isDark={state.theme === 'dark'} locale={locale} appointmentCategoryConfig={appointmentCategoryConfig} holidays={holidays} />}
                {viewMode === 'day' && <DayView appointments={scheduled} currentDate={currentDate} onAppointmentClick={setViewingAppointment} onAppointmentDrop={handleAppointmentDrop} isDark={state.theme === 'dark'} locale={locale} appointmentCategoryConfig={appointmentCategoryConfig} holidays={holidays} />}
                {viewMode === 'list' && <ListView appointments={scheduled} onAppointmentClick={setViewingAppointment} onToggleStatus={handleToggleStatus} appointmentCategoryConfig={appointmentCategoryConfig} />}
            </div>
            
            <div className="mt-4 flex justify-end">
                <button onClick={() => setIsCompletedModalOpen(true)} className="text-sm font-semibold text-primary hover:underline">{t('agenda.board.viewAll', { count: completed.length })}</button>
            </div>

            {hasPermission('MANAGE_AGENDA') && <FloatingActionButton label={t('agenda.add')} icon={PlusIcon} onClick={() => { setEditingAppointment(null); setIsFormModalOpen(true); }} />}

            <Modal isOpen={isFormModalOpen} onClose={handleAttemptCloseModal} title={editingAppointment ? t('agenda.edit') : t('agenda.add')}>
                <AppointmentForm
                    appointment={editingAppointment} customers={companyData.visibleCustomers} suppliers={companyData.visibleSuppliers} users={companyData.visibleUsers}
                    onSave={handleSaveAppointment} onCancel={() => { setIsFormModalOpen(false); setIsFormDirty(false); }}
                    appointmentCategoryConfig={appointmentCategoryConfig} isDark={state.theme === 'dark'}
                    onDirtyChange={setIsFormDirty}
                />
            </Modal>
            
             <Modal isOpen={!!viewingAppointment} onClose={() => setViewingAppointment(null)} title={viewingAppointment?.title || ''}>
                {viewingAppointment && (
                    <AppointmentDetailView
                        appointment={viewingAppointment} users={users}
                        onEdit={(app) => { setViewingAppointment(null); setEditingAppointment(app); setIsFormModalOpen(true); }}
                        onClose={() => setViewingAppointment(null)}
                        appointmentCategoryConfig={appointmentCategoryConfig} isDark={state.theme === 'dark'}
                        onReopen={handleReopen} onGenerateSummary={handleGenerateSummary}
                    />
                )}
            </Modal>
            
            <CompletedAppointmentsModal
                isOpen={isCompletedModalOpen}
                onClose={() => setIsCompletedModalOpen(false)}
                appointments={completed}
                onReopenAppointment={handleReopen}
                onGenerateSummary={handleGenerateSummary}
            />

             <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title={t('agenda.summary.title', { title: summaryResult.title })}>
                {isSummaryLoading ? (
                    <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: summaryResult.content.replace(/\n/g, '<br />') }}></div>
                )}
            </Modal>
        </div>
    );
};

export default Agenda;