import React, { useState } from 'react';
import jsPDF from 'jspdf';
import Breadcrumbs from './Breadcrumbs';
import { CustomerIcon, SupplierIcon, AgendaIcon, ReportsIcon, SettingsIcon, DashboardIcon, ChevronRightIcon, HelpIcon, DownloadIcon } from './Icons';
import { useAppState } from '../state/AppContext';
import { useLocalization } from '../contexts/LocalizationContext';

interface AccordionItemProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b dark:border-gray-700">
            <button
                className="flex justify-between items-center w-full p-5 text-left font-semibold text-lg text-secondary dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <span className="text-primary">{icon}</span>
                    {title}
                </div>
                <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
            >
                <div className="p-5 pt-0 prose max-w-none text-gray-600 dark:prose-invert dark:text-gray-300" dangerouslySetInnerHTML={{ __html: children as string }}>
                </div>
            </div>
        </div>
    );
};

const Help: React.FC = () => {
    const { state } = useAppState();
    const { currentUser, companies } = state;
    const { t } = useLocalization();
    
    const generateHelpPDF = () => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const currentCompany = companies.find(c => c.id === currentUser?.companyId);
        let yPos = 20;
        const leftMargin = 15;
        const maxWidth = 180;

        if (currentCompany) {
            doc.setFontSize(14).setFont('helvetica', 'bold');
            doc.text(currentCompany.name, 105, 15, { align: 'center' });
            doc.setFontSize(10).setFont('helvetica', 'normal');
            doc.text(currentCompany.address, 105, 21, { align: 'center' });
            yPos = 35;
        }

        const addWrappedText = (text: string, options: any): number => {
            const {
                x = leftMargin,
                fontSize = 10,
                fontStyle = 'normal',
                lineSpacing = 1.5,
                isTitle = false,
                isSubtitle = false,
                isListItem = false
            } = options;
            
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', fontStyle);

            if (isTitle) doc.setTextColor(31, 41, 55);
            else if (isSubtitle) doc.setTextColor(79, 70, 229);
            else doc.setTextColor(107, 114, 128);

            const bullet = isListItem ? '•  ' : '';
            const textToSplit = bullet + text;
            const textX = isListItem ? x + 5 : x;
            
            const lines = doc.splitTextToSize(textToSplit, isListItem ? maxWidth - 5 : maxWidth);
            const lineHeight = fontSize * 0.352778 * lineSpacing;
            const textHeight = lines.length * lineHeight;

            if (yPos + textHeight > 282) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(lines, textX, yPos);
            return yPos + textHeight;
        };
        
        doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(31, 41, 55);
        doc.text(`${t('help.manualFilename').replace('.pdf', '')}`, 105, yPos, { align: 'center' });
        yPos += 15;
        
        const sections = [
            'dashboard', 'customers', 'suppliers', 'agenda', 'reports', 'settings'
        ];

        sections.forEach((sectionKey, index) => {
            const title = t(`help.sections.${sectionKey}.title`);
            const contentHTML = t(`help.sections.${sectionKey}.content`);
            
            yPos = addWrappedText(`${index + 1}. ${title}`, { fontSize: 16, fontStyle: 'bold', isTitle: true });
            yPos += 2;
            
            // Basic HTML to text conversion for PDF
            const contentText = contentHTML
                .replace(/<h4>/g, '\n\n')
                .replace(/<\/h4>/g, '\n')
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<ul>/g, '')
                .replace(/<\/ul>/g, '')
                .replace(/<ol>/g, '')
                .replace(/<\/ol>/g, '')
                .replace(/<li>/g, '• ')
                .replace(/<\/li>/g, '\n')
                .replace(/<strong>/g, '')
                .replace(/<\/strong>/g, '')
                .replace(/<br\s*\/?>/g, '\n')
                .trim();
            
            yPos = addWrappedText(contentText, { fontSize: 10, lineSpacing: 1.8 });
            yPos += 8;
        });
        
        doc.save(`${t('help.manualFilename')}`);
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-2">{t('help.title')}</h1>
                    <p className="text-medium dark:text-gray-400">{t('help.intro')}</p>
                </div>
                <button
                    onClick={generateHelpPDF}
                    className="flex-shrink-0 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors w-full sm:w-auto"
                >
                    <DownloadIcon className="w-5 h-5" />
                    {t('help.downloadManual')}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <AccordionItem title={t('help.sections.dashboard.title')} icon={<DashboardIcon className="w-6 h-6" />}>
                    {t('help.sections.dashboard.content')}
                </AccordionItem>
                
                <AccordionItem title={t('help.sections.customers.title')} icon={<CustomerIcon className="w-6 h-6" />}>
                    {t('help.sections.customers.content')}
                </AccordionItem>

                <AccordionItem title={t('help.sections.suppliers.title')} icon={<SupplierIcon className="w-6 h-6" />}>
                    {t('help.sections.suppliers.content')}
                </AccordionItem>

                <AccordionItem title={t('help.sections.agenda.title')} icon={<AgendaIcon className="w-6 h-6" />}>
                    {t('help.sections.agenda.content')}
                </AccordionItem>

                <AccordionItem title={t('help.sections.reports.title')} icon={<ReportsIcon className="w-6 h-6" />}>
                     {t('help.sections.reports.content')}
                </AccordionItem>

                <AccordionItem title={t('help.sections.settings.title')} icon={<SettingsIcon className="w-6 h-6" />}>
                    {t('help.sections.settings.content')}
                </AccordionItem>

                 <AccordionItem title={t('help.sections.faq.title')} icon={<HelpIcon className="w-6 h-6" />}>
                    <h4>{t('help.sections.faq.q1')}</h4>
                    <p>{t('help.sections.faq.a1')}</p>

                    <h4>{t('help.sections.faq.q2')}</h4>
                    <p>{t('help.sections.faq.a2')}</p>
                    
                    <h4>{t('help.sections.faq.q3')}</h4>
                    <p>{t('help.sections.faq.a3')}</p>

                    <h4>{t('help.sections.faq.q4')}</h4>
                    <p>{t('help.sections.faq.a4')}</p>
                </AccordionItem>
            </div>
        </div>
    );
};

export default Help;