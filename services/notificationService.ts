import { Appointment, User, Customer, Supplier, Company } from '../types';

type TFunction = (key: string, params?: { [key: string]: string | number }) => string;

/**
 * Simulates sending an email notification for an upcoming appointment.
 * In a real application, this would use an email service like SendGrid, AWS SES, etc.
 * @param appointment The appointment for the reminder.
 * @param recipient The participant receiving the reminder.
 * @param t The translation function.
 * @param locale The locale for formatting dates.
 */
export const sendAppointmentReminderEmail = (appointment: Appointment, recipient: User | Customer | Supplier, t: TFunction, locale: string): void => {
    if (!recipient.email) {
        console.warn(`Attempted to send reminder for appointment "${appointment.title}" to participant "${recipient.name}" who has no email address.`);
        return;
    }

    const subject = t('notifications.email.reminder.subject', { title: appointment.title });
    
    const startTime = appointment.start.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' });

    const body = `
${t('notifications.email.reminder.greeting', { name: recipient.name })}

${t('notifications.email.reminder.body')}

**${t('notifications.email.reminder.titleLabel')}:** ${appointment.title}
**${t('notifications.email.reminder.whenLabel')}:** ${startTime}
**${t('notifications.email.reminder.whereLabel')}:** ${appointment.location || t('agenda.details.notSpecified')}

**${t('notifications.email.reminder.descriptionLabel')}:**
${appointment.description || t('agenda.details.noDescription')}

${t('notifications.email.reminder.preparation')}

${t('notifications.email.reminder.sincerely')}
${t('app.title.full')}
`;

    console.log(`
=======================================================
== SIMULATING APPOINTMENT REMINDER EMAIL ==
=======================================================
To: ${recipient.email}
Subject: ${subject}
-------------------------------------------------------
Body: ${body.trim().replace(/\n\s+/g, '\n')}
=======================================================
`);
};


/**
 * Simulates sending an email notification for a new or updated appointment.
 * @param appointment The appointment being created or updated.
 * @param recipient The participant receiving the notification.
 * @param isNew True if the appointment is new, false if it's an update.
 * @param t The translation function.
 * @param locale The locale for formatting dates.
 */
export const sendAppointmentUpdateEmail = (appointment: Appointment, recipient: User | Customer | Supplier, isNew: boolean, t: TFunction, locale: string): void => {
    if (!recipient.email) {
        console.warn(`Attempted to send update notification for appointment "${appointment.title}" to participant "${recipient.name}" who has no email address.`);
        return;
    }

    const subject = isNew
        ? t('notifications.email.update.subjectNew', { title: appointment.title })
        : t('notifications.email.update.subjectUpdate', { title: appointment.title });

    const startTime = appointment.start.toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' });

    const body = `
${t('notifications.email.update.greeting', { name: recipient.name })}

${isNew ? t('notifications.email.update.bodyNew') : t('notifications.email.update.bodyUpdate')}

**${t('notifications.email.reminder.titleLabel')}:** ${appointment.title}
**${t('notifications.email.reminder.whenLabel')}:** ${startTime}
**${t('notifications.email.reminder.whereLabel')}:** ${appointment.location || t('agenda.details.notSpecified')}

**${t('notifications.email.reminder.descriptionLabel')}:**
${appointment.description || t('agenda.details.noDescription')}

${t('notifications.email.reminder.sincerely')}
${t('app.title.full')}
`;

    console.log(`
=======================================================
== SIMULATING APPOINTMENT UPDATE/CREATION EMAIL ==
=======================================================
To: ${recipient.email}
Subject: ${subject}
-------------------------------------------------------
Body: ${body.trim().replace(/\n\s+/g, '\n')}
=======================================================
`);
};

/**
 * Simulates sending an email notification when a company's status is updated.
 * @param company The company that was updated.
 * @param oldStatus The previous status.
 * @param newStatus The new status.
 * @param reason The reason for the change.
 * @param t The translation function.
 */
export const sendCompanyStatusUpdateEmail = (company: Company, oldStatus: string, newStatus: string, reason: string, t: TFunction): void => {
    if (!company.email) {
        console.warn(`Attempted to send status update for company "${company.name}" which has no contact email address.`);
        return;
    }

    const subject = t('notifications.email.companyStatusUpdate.subject', { companyName: company.name });

    const body = `
${t('notifications.email.companyStatusUpdate.greeting', { companyName: company.name })}

${t('notifications.email.companyStatusUpdate.body')}

**${t('notifications.email.companyStatusUpdate.oldStatus')}:** ${t(`companyStatus.${oldStatus}`)}
**${t('notifications.email.companyStatusUpdate.newStatus')}:** ${t(`companyStatus.${newStatus}`)}
**${t('notifications.email.companyStatusUpdate.reason')}:** ${reason}

${t('notifications.email.reminder.sincerely')}
${t('app.title.full')}
`;

    console.log(`
=======================================================
== SIMULATING COMPANY STATUS UPDATE EMAIL ==
=======================================================
To: ${company.email}
Subject: ${subject}
-------------------------------------------------------
Body: ${body.trim().replace(/\n\s+/g, '\n')}
=======================================================
`);
};