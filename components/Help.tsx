import React, { useState } from 'react';
import jsPDF from 'jspdf';
import Breadcrumbs from './Breadcrumbs';
import { CustomerIcon, SupplierIcon, AgendaIcon, ReportsIcon, SettingsIcon, DashboardIcon, ChevronRightIcon, HelpIcon, DownloadIcon } from './Icons';
import { useAppState } from '../state/AppContext';

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
                <div className="p-5 pt-0 prose max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Help: React.FC = () => {
    const { state } = useAppState();
    const { currentUser, companies } = state;
    
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

            if (isTitle) doc.setTextColor(31, 41, 55); // secondary
            else if (isSubtitle) doc.setTextColor(79, 70, 229); // primary
            else doc.setTextColor(107, 114, 128); // medium

            const bullet = isListItem ? '•  ' : '';
            const textToSplit = bullet + text;
            const textX = isListItem ? x + 5 : x;
            
            const lines = doc.splitTextToSize(textToSplit, isListItem ? maxWidth - 5 : maxWidth);
            const lineHeight = fontSize * 0.352778 * lineSpacing; // pt to mm
            const textHeight = lines.length * lineHeight;

            if (yPos + textHeight > 282) { // A4 height is 297mm, with margin
                doc.addPage();
                yPos = 20;
            }

            doc.text(lines, textX, yPos);
            return yPos + textHeight;
        };

        // --- PDF Content ---
        doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(31, 41, 55);
        doc.text("Manual do Usuário - Business Hub Pro", 105, yPos, { align: 'center' });
        yPos += 15;
        
        // --- Sections ---
        const sections = [
            {
                title: "1. Painel Principal (Dashboard)",
                content: [
                    { type: 'p', text: "O Painel é a sua tela inicial, projetada para oferecer uma visão geral e rápida das informações mais importantes do seu negócio." },
                    { type: 'subtitle', text: "Principais Componentes:" },
                    { type: 'li', text: "Cartões de Estatísticas: No topo, você vê números chave como o total de clientes ativos, fornecedores e seus próximos compromissos. Estes cartões servem como um termômetro diário da sua operação." },
                    { type: 'li', text: "Gráfico de Novos Clientes: Este gráfico mostra o crescimento da sua base de clientes ao longo dos últimos meses, permitindo identificar tendências de aquisição." },
                    { type: 'li', text: "Lista de Próximos Compromissos: Um resumo rápido dos seus próximos eventos agendados para o dia, garantindo que você nunca perca um compromisso importante." },
                ]
            },
            {
                title: "2. Gerenciando Clientes",
                content: [
                    { type: 'p', text: "Esta seção é o seu CRM. Aqui você pode visualizar, adicionar, editar e remover clientes, além de registrar todas as interações." },
                    { type: 'subtitle', text: "Adicionando um Novo Cliente:" },
                    { type: 'p', text: "1. Clique no botão azul \"+ Adicionar Cliente\".\n2. Preencha o formulário. O sistema valida automaticamente o CPF/CNPJ para garantir a integridade dos dados.\n3. Para clientes pessoa física, você pode escolher um avatar pré-definido ou carregar uma foto.\n4. Clique em \"Adicionar Cliente\" para salvar." },
                    { type: 'subtitle', text: "Visualizando Detalhes e Interações:" },
                    { type: 'li', text: "Clique em qualquer cliente na lista para abrir uma janela com seus detalhes completos." },
                    { type: 'li', text: "Navegue até a aba \"Interações\" para ver todo o histórico de contatos, como chamadas, e-mails e reuniões." },
                    { type: 'li', text: "Você pode registrar uma nova interação diretamente nesta aba." },
                    { type: 'subtitle', text: "Análise com IA:" },
                    { type: 'p', text: "Na aba de interações, se houver um histórico de contatos, você pode usar o botão \"Analisar com IA\". A inteligência artificial irá ler as interações e gerar um resumo estratégico, identificando o sentimento do cliente, oportunidades de negócio e sugerindo próximos passos." },
                ]
            },
            {
                title: "3. Gerenciando Fornecedores",
                content: [
                    { type: 'p', text: "A gestão de fornecedores é centralizada nesta tela, funcionando de forma muito parecida com a de clientes. Você pode cadastrar parceiros, informações de contato e os serviços que eles prestam." },
                    { type: 'li', text: "Use o botão \"+ Adicionar Fornecedor\" para cadastrar um novo parceiro." },
                    { type: 'li', text: "Preencha os dados da empresa e também as informações da pessoa de contato principal." },
                    { type: 'li', text: "É possível visualizar, editar ou remover um fornecedor usando os ícones na lista." },
                ]
            },
            {
                title: "4. Usando a Agenda",
                content: [
                     { type: 'p', text: "A agenda é sua ferramenta para organizar o tempo e gerenciar todos os seus compromissos." },
                     { type: 'subtitle', text: "Múltiplas Visualizações:" },
                     { type: 'li', text: "Quadro (Kanban): Ideal para planejamento semanal. Organize compromissos em colunas como \"Hoje\", \"Amanhã\", e \"Próximos 7 Dias\". Arraste e solte cartões para reagendar compromissos de forma intuitiva." },
                     { type: 'li', text: "Lista: Uma visão cronológica de todos os seus compromissos futuros." },
                     { type: 'li', text: "Mês, Semana, Dia: Visualizações de calendário clássicas para planejamento de curto e longo prazo." },
                     { type: 'subtitle', text: "Criando e Gerenciando Compromissos:" },
                     { type: 'li', text: "Clique em \"+ Novo Compromisso\" para abrir o formulário." },
                     { type: 'li', text: "Associe compromissos a clientes ou fornecedores para manter um histórico integrado." },
                     { type: 'li', text: "Anexe arquivos importantes e configure recorrências para eventos regulares (diário, semanal, etc.)." },
                     { type: 'li', text: "Marque um compromisso como concluído diretamente no quadro ou na lista." },
                     { type: 'subtitle', text: "Histórico e Resumo com IA:" },
                     { type: 'li', text: "Acesse o \"Histórico\" para ver todos os compromissos já concluídos." },
                     { type: 'li', text: "Para qualquer compromisso no histórico, clique em \"Resumo IA\". O sistema gerará um resumo profissional da reunião, ideal para atas e follow-ups." },
                ]
            },
            {
                title: "5. Relatórios e Exportações",
                content: [
                    { type: 'p', text: "Esta seção permite que você visualize dados consolidados e os exporte para usar em outras ferramentas ou para apresentações." },
                    { type: 'li', text: "Navegue pelas Abas: Escolha entre relatórios de Compromissos, Clientes, Fornecedores ou Histórico de Atividades." },
                    { type: 'li', text: "Filtre os Dados: Em cada relatório, você pode usar filtros, como períodos de data, para focar nos dados que mais importam." },
                    { type: 'li', text: "Exporte em PDF ou Excel: Para cada relatório, você encontrará botões para \"Exportar PDF\" (ótimo para impressão e compartilhamento) e \"Exportar Excel\" (ideal se você precisa manipular os dados em planilhas)." },
                ]
            },
             {
                title: "6. Configurações",
                content: [
                    { type: 'p', text: "Personalize o sistema para atender às necessidades da sua equipe e empresa." },
                    { type: 'li', text: "Minha Empresa: Atualize os dados cadastrais da sua empresa, como endereço, telefone e CNPJ." },
                    { type: 'li', text: "Usuários: Adicione novos membros da sua equipe ao sistema, edite as informações e defina suas permissões (Administrador, Gerente, Colaborador)." },
                    { type: 'li', text: "Categorias: Personalize as categorias de compromissos. Você pode renomear, alterar ícones e cores para melhor se adequar à sua organização." },
                    { type: 'li', text: "Empresas (Super Admin): Se você for um super administrador, verá uma aba adicional para gerenciar todas as empresas cadastradas no sistema." },
                ]
            },
        ];

        sections.forEach(section => {
            yPos = addWrappedText(section.title, { fontSize: 16, fontStyle: 'bold', isTitle: true });
            yPos += 2;
            section.content.forEach(item => {
                const options = {
                    p: { fontSize: 10 },
                    subtitle: { fontSize: 12, fontStyle: 'bold', isSubtitle: true },
                    li: { fontSize: 10, isListItem: true }
                };
                yPos = addWrappedText(item.text, { ...options[item.type as keyof typeof options], lineSpacing: item.type === 'p' ? 1.8 : 1.5 });
                yPos += (item.type === 'subtitle' ? 2 : 1);
            });
            yPos += 6; // Space between sections
        });
        
        doc.save('Manual_BusinessHubPro.pdf');
    };

    return (
        <div className="p-4 sm:p-8 dark:bg-secondary">
            <Breadcrumbs />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-2">Central de Ajuda</h1>
                    <p className="text-medium dark:text-gray-400">Bem-vindo! Aqui você encontrará guias sobre como usar as funcionalidades do Hub de Negócios.</p>
                </div>
                <button
                    onClick={generateHelpPDF}
                    className="flex-shrink-0 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary-hover transition-colors w-full sm:w-auto"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download Manual em PDF
                </button>
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <AccordionItem title="Painel Principal (Dashboard)" icon={<DashboardIcon className="w-6 h-6" />}>
                    <p>O Painel é a sua tela inicial. Ele oferece uma visão geral e rápida das informações mais importantes do seu negócio.</p>
                    <h4>Principais Componentes:</h4>
                    <ul>
                        <li><strong>Cartões de Estatísticas:</strong> No topo, você vê números chave como o total de clientes ativos, fornecedores e seus próximos compromissos. Estes cartões servem como um termômetro diário da sua operação.</li>
                        <li><strong>Gráfico de Novos Clientes:</strong> Este gráfico mostra o crescimento da sua base de clientes ao longo dos últimos meses, permitindo identificar tendências de aquisição.</li>
                        <li><strong>Lista de Próximos Compromissos:</strong> Um resumo rápido dos seus próximos eventos agendados para o dia, garantindo que você nunca perca um compromisso importante.</li>
                    </ul>
                </AccordionItem>
                
                <AccordionItem title="Gerenciando Clientes" icon={<CustomerIcon className="w-6 h-6" />}>
                    <h4>Visualizando a Lista de Clientes</h4>
                    <p>Nesta tela, você verá uma tabela com todos os seus clientes. Use a barra de busca no topo para encontrar um cliente específico pelo nome.</p>
                    
                    <h4>Adicionando um Novo Cliente</h4>
                    <ol>
                        <li>Clique no botão azul <strong>"+ Adicionar Cliente"</strong> no canto superior direito.</li>
                        <li>Preencha o formulário. O sistema valida automaticamente o CPF/CNPJ para garantir a integridade dos dados.</li>
                        <li>Para clientes pessoa física, você pode escolher um avatar pré-definido ou carregar uma foto.</li>
                        <li>Após preencher, clique em "Adicionar Cliente" para salvar.</li>
                    </ol>

                    <h4>Visualizando Detalhes e Interações</h4>
                    <ul>
                      <li>Clique em qualquer cliente na lista para abrir uma janela com seus detalhes completos.</li>
                      <li>Navegue até a aba "Interações" para ver todo o histórico de contatos, como chamadas, e-mails e reuniões.</li>
                      <li>Você pode registrar uma nova interação diretamente nesta aba.</li>
                    </ul>

                    <h4>Análise com IA</h4>
                    <p>Na aba de interações, se houver um histórico de contatos, você pode usar o botão <strong>"Analisar com IA"</strong>. A inteligência artificial irá ler as interações e gerar um resumo estratégico, identificando o sentimento do cliente, oportunidades de negócio e sugerindo próximos passos.</p>
                </AccordionItem>

                <AccordionItem title="Gerenciando Fornecedores" icon={<SupplierIcon className="w-6 h-6" />}>
                    <p>A gestão de fornecedores é centralizada nesta tela, funcionando de forma muito parecida com a de clientes. Você pode cadastrar parceiros, informações de contato e os serviços que eles prestam.</p>
                    <ul>
                        <li>Use o botão <strong>"+ Adicionar Fornecedor"</strong> para cadastrar um novo parceiro.</li>
                        <li>Preencha os dados da empresa e também as informações da pessoa de contato principal.</li>
                        <li>É possível visualizar, editar ou remover um fornecedor usando os ícones na lista.</li>
                    </ul>
                </AccordionItem>

                <AccordionItem title="Usando a Agenda" icon={<AgendaIcon className="w-6 h-6" />}>
                     <h4>Visualizações da Agenda</h4>
                    <p>A agenda oferece múltiplas formas de ver seus compromissos. Use os botões no canto superior direito para alternar entre as visualizações:</p>
                    <ul>
                        <li><strong>Quadro (Kanban):</strong> Ideal para planejamento semanal. Organize compromissos em colunas como "Hoje", "Amanhã", e "Próximos 7 Dias". Arraste e solte cartões para reagendar compromissos de forma intuitiva.</li>
                        <li><strong>Lista:</strong> Uma visão cronológica de todos os seus compromissos futuros.</li>
                        <li><strong>Mês, Semana, Dia:</strong> Visualizações de calendário clássicas para planejamento de curto e longo prazo.</li>
                    </ul>

                    <h4>Criando e Gerenciando Compromissos</h4>
                    <ol>
                        <li>Clique no botão <strong>"+ Novo Compromisso"</strong>.</li>
                        <li>Preencha os detalhes como título, descrição, data/hora de início e fim.</li>
                        <li>Associe compromissos a clientes ou fornecedores para manter um histórico integrado.</li>
                        <li>Anexe arquivos importantes e configure recorrências para eventos regulares (diário, semanal, etc.).</li>
                         <li>Marque um compromisso como concluído diretamente no quadro ou na lista.</li>
                    </ol>

                    <h4>Histórico e Resumo com IA</h4>
                     <p>Acesse o "Histórico" para ver todos os compromissos já concluídos. Para qualquer compromisso no histórico, clique em <strong>"Resumo IA"</strong>. O sistema gerará um resumo profissional da reunião, ideal para atas e follow-ups.</p>
                </AccordionItem>

                <AccordionItem title="Relatórios e Exportações" icon={<ReportsIcon className="w-6 h-6" />}>
                    <p>Esta seção permite que você visualize dados consolidados e os exporte para usar em outras ferramentas ou para apresentações.</p>
                    <ul>
                        <li><strong>Navegue pelas Abas:</strong> Escolha entre relatórios de Compromissos, Clientes, Fornecedores ou Histórico de Atividades.</li>
                        <li><strong>Filtre os Dados:</strong> Em cada relatório, você pode usar filtros, como períodos de data, para focar nos dados que mais importam.</li>
                        <li><strong>Exporte em PDF ou Excel:</strong> Para cada relatório, você encontrará botões para "Exportar PDF" (ótimo para impressão e compartilhamento) e "Exportar Excel" (ideal se você precisa manipular os dados em planilhas).</li>
                    </ul>
                </AccordionItem>

                <AccordionItem title="Configurações" icon={<SettingsIcon className="w-6 h-6" />}>
                    <p>Personalize o sistema para atender às necessidades da sua equipe e empresa.</p>
                    <ul>
                        <li><strong>Minha Empresa:</strong> Atualize os dados cadastrais da sua empresa, como endereço, telefone e CNPJ.</li>
                        <li><strong>Usuários:</strong> Adicione novos membros da sua equipe ao sistema, edite as informações e defina suas permissões (Administrador, Gerente, Colaborador).</li>
                        <li><strong>Categorias:</strong> Personalize as categorias de compromissos. Você pode renomear, alterar ícones e cores para melhor se adequar à sua organização.</li>
                        <li><strong>Empresas (Super Admin):</strong> Se você for um super administrador, verá uma aba adicional para gerenciar todas as empresas cadastradas no sistema.</li>
                    </ul>
                </AccordionItem>

                 <AccordionItem title="Perguntas Frequentes (FAQ)" icon={<HelpIcon className="w-6 h-6" />}>
                    <h4>O que faço se esquecer minha senha?</h4>
                    <p>No momento, a recuperação de senha ainda não está automatizada. Por favor, entre em contato com o administrador do sistema na sua empresa para solicitar uma nova senha temporária.</p>

                    <h4>Posso usar o sistema no meu celular ou tablet?</h4>
                    <p>Sim! O "Business Hub Pro" foi projetado para ser responsivo, o que significa que ele se adapta a diferentes tamanhos de tela. A experiência pode ser um pouco diferente, mas todas as funcionalidades principais estarão disponíveis.</p>
                    
                    <h4>Como funciona a busca na barra superior?</h4>
                    <p>A barra de busca no topo da tela é uma ferramenta poderosa. Comece a digitar o nome de um cliente, fornecedor ou o título de um compromisso, e os resultados aparecerão automaticamente. Clicar em um resultado levará você diretamente para a página correspondente.</p>

                    <h4>O que o sino de notificações mostra?</h4>
                    <p>O ícone de sino mostra um número que representa quantos compromissos você tem agendados para o restante do dia de hoje. Clicar nele abre uma lista rápida desses compromissos.</p>
                </AccordionItem>
            </div>
        </div>
    );
};

export default Help;