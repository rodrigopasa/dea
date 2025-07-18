import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-gray-300">Atualizada em: 27 de Março, 2025</p>
          </div>
          
          <Card className="bg-dark-surface border-dark-border mb-8">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary bg-opacity-20 p-3 rounded-full">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <div>
                <CardTitle>Compromisso com a sua privacidade</CardTitle>
                <p className="text-gray-300 mt-1">
                  Nós valorizamos e protegemos seus dados pessoais
                </p>
              </div>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">Introdução</h2>
                  <p className="text-gray-300">
                    Esta Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações quando você utiliza o BAixaPDF, nosso repositório público de PDFs. Como nosso serviço é de acesso livre e não requer registro, coletamos informações mínimas.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Informações que coletamos</h2>
                  <p className="text-gray-300 mb-3">
                    Para visitantes (acesso público):
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">Endereço IP:</strong> Usado apenas para o sistema de avaliação de documentos (curtir/descurtir).
                    </li>
                    <li>
                      <strong className="text-white">Informações de navegação:</strong> Páginas visitadas, documentos visualizados (dados temporários para analytics).
                    </li>
                    <li>
                      <strong className="text-white">Cookies técnicos:</strong> Essenciais para funcionamento básico do site.
                    </li>
                  </ul>
                  <p className="text-gray-300 mb-3 mt-4">
                    <strong className="text-white">Não coletamos informações pessoais</strong> para navegar no repositório. Todos os dados são processados de forma anônima.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Como usamos suas informações</h2>
                  <p className="text-gray-300 mb-3">
                    Utilizamos as informações coletadas para:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li>Fornecer, manter e melhorar nossa plataforma</li>
                    <li>Processar e gerenciar sua conta</li>
                    <li>Responder às suas dúvidas e solicitações</li>
                    <li>Enviar notificações relacionadas ao serviço</li>
                    <li>Analisar padrões de uso e tendências para melhorar a experiência do usuário</li>
                    <li>Detectar, prevenir e resolver problemas técnicos e de segurança</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Compartilhamento de dados</h2>
                  <p className="text-gray-300 mb-3">
                    Não vendemos suas informações pessoais a terceiros. Podemos compartilhar dados nas seguintes situações:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li>
                      <strong className="text-white">Provedores de serviços:</strong> Empresas que nos ajudam a operar, fornecer e melhorar nossos serviços (hospedagem, armazenamento, processamento de pagamentos).
                    </li>
                    <li>
                      <strong className="text-white">Conformidade legal:</strong> Quando necessário para cumprir a lei, processos legais ou solicitações governamentais válidas.
                    </li>
                    <li>
                      <strong className="text-white">Proteção de direitos:</strong> Para proteger nossos direitos, propriedade, segurança, usuários ou o público.
                    </li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Segurança de dados</h2>
                  <p className="text-gray-300">
                    Implementamos medidas de segurança técnica e organizacional para proteger suas informações contra acesso, uso ou divulgação não autorizados. Isso inclui criptografia de senhas, conexões seguras (HTTPS) e revisões regulares de práticas de segurança. No entanto, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir segurança absoluta.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Seus direitos</h2>
                  <p className="text-gray-300 mb-3">
                    Dependendo da sua localização, você pode ter os seguintes direitos:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300">
                    <li>Acessar e receber uma cópia das suas informações pessoais</li>
                    <li>Corrigir dados imprecisos ou incompletos</li>
                    <li>Excluir suas informações pessoais</li>
                    <li>Restringir ou objetar ao processamento dos seus dados</li>
                    <li>Solicitar a portabilidade dos seus dados</li>
                  </ul>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Retenção de dados</h2>
                  <p className="text-gray-300">
                    Mantemos suas informações pessoais pelo tempo necessário para fornecer os serviços solicitados e cumprir nossas obrigações legais. Se você excluir sua conta, poderemos reter certas informações para fins legais ou prevenir fraudes.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Alterações nesta política</h2>
                  <p className="text-gray-300">
                    Podemos atualizar esta política de privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Notificaremos sobre alterações significativas por meio de um aviso em nosso site ou por e-mail antes que as mudanças entrem em vigor.
                  </p>
                </section>
                
                <section>
                  <h2 className="text-xl font-semibold mb-3">Entre em contato</h2>
                  <p className="text-gray-300">
                    Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre nossas práticas de processamento de dados, entre em contato conosco em <a href="mailto:privacidade@baixapdf.com" className="text-primary hover:underline">privacidade@baixapdf.com</a>.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
