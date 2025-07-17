import Sidebar from "@/components/layout/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  HelpCircle, 
  Upload, 
  Eye, 
  Download, 
  Shield, 
  Search,
  Settings,
  UserCircle
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Ajuda</h1>
            <p className="text-gray-300">Perguntas frequentes e suporte</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Upload className="text-primary w-10 h-10 mb-3" />
                <h3 className="text-lg font-medium mb-1">Upload</h3>
                <p className="text-gray-400">Como fazer upload de documentos PDF</p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Search className="text-primary w-10 h-10 mb-3" />
                <h3 className="text-lg font-medium mb-1">Pesquisa</h3>
                <p className="text-gray-400">Como encontrar documentos na plataforma</p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <UserCircle className="text-primary w-10 h-10 mb-3" />
                <h3 className="text-lg font-medium mb-1">Conta</h3>
                <p className="text-gray-400">Gerenciamento de perfil e configurações</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-dark-surface border-dark-border mb-8">
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-dark-border">
                  <AccordionTrigger>Como faço upload de um documento PDF?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-300 mb-2">
                      Para fazer upload de um documento PDF, siga estes passos:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                      <li>Faça login na sua conta</li>
                      <li>Acesse seu painel de usuário clicando no seu nome de usuário no canto superior direito</li>
                      <li>Clique no botão "Upload" no painel</li>
                      <li>Selecione o arquivo PDF que deseja enviar</li>
                      <li>Preencha as informações do documento, como título, descrição e categoria</li>
                      <li>Decida se o documento será público ou privado</li>
                      <li>Clique em "Enviar" para concluir o upload</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-dark-border">
                  <AccordionTrigger>Como encontrar documentos na plataforma?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-300 mb-2">
                      Você pode encontrar documentos de várias maneiras:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                      <li>Use a barra de pesquisa no topo da página para buscar por título ou conteúdo</li>
                      <li>Navegue pelas categorias na barra lateral</li>
                      <li>Visite a seção "Explorar" para descobrir documentos populares</li>
                      <li>Veja os documentos "Recentes" para as adições mais novas à plataforma</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-dark-border">
                  <AccordionTrigger>Como compartilhar um documento com outras pessoas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-300 mb-2">
                      Para compartilhar um documento:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                      <li>Certifique-se de que o documento está configurado como "Público" nas configurações</li>
                      <li>Abra o documento que deseja compartilhar</li>
                      <li>Clique no botão "Compartilhar" ou no ícone de compartilhamento</li>
                      <li>Copie o link gerado e compartilhe com quem desejar</li>
                    </ol>
                    <p className="text-gray-300 mt-2">
                      Alternativamente, você pode compartilhar documentos diretamente do seu painel, clicando no menu de ações do documento e selecionando "Compartilhar".
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="border-dark-border">
                  <AccordionTrigger>Como alterar as configurações de privacidade dos meus documentos?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-300 mb-2">
                      Para alterar a privacidade de um documento:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                      <li>Acesse seu painel de usuário</li>
                      <li>Localize o documento que deseja modificar</li>
                      <li>Use o interruptor de visibilidade ao lado do documento para alternar entre público e privado</li>
                      <li>Ou clique no menu de ações, selecione "Editar" e altere a configuração de visibilidade</li>
                    </ol>
                    <p className="text-gray-300 mt-2">
                      Documentos privados são visíveis apenas para você, enquanto documentos públicos podem ser acessados por qualquer usuário da plataforma.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="border-dark-border">
                  <AccordionTrigger>Como excluir um documento que enviei?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-300 mb-2">
                      Para excluir um documento:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                      <li>Acesse seu painel de usuário</li>
                      <li>Localize o documento que deseja excluir</li>
                      <li>Clique no menu de ações (três pontos verticais)</li>
                      <li>Selecione "Excluir"</li>
                      <li>Confirme a exclusão na janela de diálogo</li>
                    </ol>
                    <p className="text-gray-300 mt-2 text-amber-400">
                      Atenção: A exclusão de documentos é permanente e não pode ser desfeita.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-surface border-dark-border mb-8">
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>Precisa de mais ajuda? Entre em contato conosco.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary bg-opacity-20 p-2 rounded-full">
                    <HelpCircle className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Suporte</h4>
                    <p className="text-gray-400">Para questões técnicas e dúvidas gerais</p>
                    <a href="mailto:suporte@pdfxandria.com" className="text-primary hover:underline">suporte@pdfxandria.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary bg-opacity-20 p-2 rounded-full">
                    <Shield className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Conformidade e Direitos Autorais</h4>
                    <p className="text-gray-400">Para questões relacionadas a conteúdo protegido por direitos autorais</p>
                    <a href="mailto:legal@pdfxandria.com" className="text-primary hover:underline">legal@pdfxandria.com</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}