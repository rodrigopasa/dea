import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  const faqs = [
    {
      question: "Como posso fazer upload de um PDF?",
      answer: "Depois de fazer login, acesse seu painel de usuário e clique no botão 'Upload PDF'. Preencha os detalhes solicitados e faça upload do seu arquivo PDF. O sistema gerará automaticamente uma miniatura e extrairá informações do documento."
    },
    {
      question: "Quais tipos de arquivos são suportados?",
      answer: "Atualmente, nossa plataforma suporta apenas arquivos no formato PDF (.pdf)."
    },
    {
      question: "Existe um limite de tamanho para upload de arquivos?",
      answer: "Sim, o tamanho máximo permitido para cada arquivo PDF é de 50MB."
    },
    {
      question: "Como posso editar um PDF que já enviei?",
      answer: "Acesse seu painel de usuário, localize o PDF na lista de seus documentos e clique no botão de edição. Você poderá atualizar os metadados como título, descrição e categorias, mas não poderá substituir o arquivo PDF em si."
    },
    {
      question: "Posso remover um PDF que enviei?",
      answer: "Sim. Vá para seu painel de usuário, encontre o PDF que deseja remover, clique no botão de exclusão e confirme a ação. A remoção é permanente e não pode ser desfeita."
    },
    {
      question: "Como posso tornar meu PDF privado?",
      answer: "Ao fazer upload ou editar um PDF, você pode marcar a opção 'Privado' para torná-lo visível apenas para você. PDFs privados não aparecem nas páginas públicas do site."
    },
    {
      question: "O que significa 'Favoritar' um PDF?",
      answer: "Ao favoritar um PDF, você o adiciona à sua lista de favoritos para acesso rápido. Você pode gerenciar seus favoritos na página 'Favoritos' acessível pelo menu lateral."
    },
    {
      question: "Como posso reportar conteúdo inadequado?",
      answer: "Em cada página de detalhe do PDF, há um botão 'Reportar' que permite enviar uma denúncia sobre conteúdo inadequado ou violação de direitos autorais."
    },
    {
      question: "Posso baixar PDFs do site?",
      answer: "Sim, todos os PDFs públicos podem ser baixados pelos usuários. O botão de download está disponível na página de detalhes de cada PDF."
    },
    {
      question: "O que acontece com minha conta se eu violar os termos de serviço?",
      answer: "Violações dos termos de serviço podem resultar em advertências, remoção de conteúdo ou, em casos graves, suspensão ou encerramento da conta."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Perguntas Frequentes (FAQ)</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-10 pt-6 border-t border-dark-border">
            <p className="text-gray-400">
              Não encontrou o que estava procurando? Entre em contato conosco através da nossa página de contato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}