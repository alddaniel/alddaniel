

import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { Appointment } from '../types';
import { SearchIcon, UserProfile, ClockRewindIcon, SparklesIcon } from './Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAppState } from '../state/AppContext';

interface CompletedAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onReopenAppointment: (appointment: Appointment) => void;
  onGenerateSummary: (appointment: Appointment) => void;
}

export const CompletedAppointmentsModal: React.FC<CompletedAppointmentsModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onReopenAppointment,
  onGenerateSummary
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { state } = useAppState();
  const { companies, plans } = state;
  const { t, locale } = useLocalization();

  const filteredAppointments = useMemo(() => {
    if (!searchTerm) {
      return appointments;
    }
    return appointments.filter(app =>
      app.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  const canAppointmentUseAI = (app: Appointment) => {
      const company = companies.find(c => c.id === app.companyId);
      const plan = company ? plans.find(p => p.id === company.planId) : undefined;
      return plan?.hasAI ?? false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('agenda.completed.title')}>
      <div>
        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('agenda.completed.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(app => (
              <div key={app.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-secondary dark:text-gray-100">{app.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('agenda.completed.completedOn', { date: app.end.toLocaleDateString(locale, { dateStyle: 'medium' }) })}
                  </p>
                  <div className="flex -space-x-2 mt-2">
                    {app.participants.slice(0, 4).map(p => (
                      <UserProfile key={p.id} user={p} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canAppointmentUseAI(app) && (
                      <button
                        onClick={() => onGenerateSummary(app)}
                        className="flex items-center gap-1.5 bg-indigo-100 text-primary dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
                      >
                        <SparklesIcon className="w-4 h-4"/>
                        {t('agenda.details.aiSummary')}
                      </button>
                  )}
                  <button
                    onClick={() => onReopenAppointment(app)}
                    className="flex items-center gap-1.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors whitespace-nowrap"
                  >
                    <ClockRewindIcon className="w-4 h-4"/>
                    {t('agenda.details.reopen')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>{t('agenda.completed.noCompleted')}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};