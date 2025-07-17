import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
          <p className="mb-4">
            Bem-vindo ao PDFxandria. Ao utilizar nosso repositório público de PDFs, você concorda com estes termos. 
            Por favor, leia-os com atenção.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">2. Sobre o Serviço</h2>
          <p className="mb-4">
            O PDFxandria é um repositório público de documentos PDF. Você pode navegar, visualizar e baixar 
            os PDFs gratuitamente, sem necessidade de registro ou criação de conta.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">3. Acesso Gratuito</h2>
          <p className="mb-4">
            Todos os documentos em nosso repositório são de acesso livre e gratuito. Não há limites de download 
            ou restrições para acessar o conteúdo.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">4. Sistema de Avaliação</h2>
          <p className="mb-4">
            Você pode avaliar os documentos (curtir/descurtir) para ajudar outros usuários a encontrar 
            conteúdo relevante. Essas avaliações são baseadas no seu endereço IP.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">5. Responsabilidade do Conteúdo</h2>
          <p className="mb-4">
            Somos responsáveis por garantir que todo conteúdo disponibilizado respeita os direitos autorais 
            e é adequado para acesso público. Trabalhamos para manter um repositório de qualidade.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">6. Direitos Autorais</h2>
          <p className="mb-4">
            Respeitamos os direitos autorais. Se você é titular de direitos autorais e acredita que 
            algum conteúdo viola seus direitos, entre em contato conosco para remoção imediata.e notificação adequada.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">5. Conta de Usuário</h2>
          <p className="mb-4">
            Você é responsável por manter a segurança de sua conta e senha. Notifique-nos imediatamente
            sobre qualquer uso não autorizado de sua conta.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">6. Modificações do Serviço</h2>
          <p className="mb-4">
            Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento,
            com ou sem aviso prévio.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">7. Limitação de Responsabilidade</h2>
          <p className="mb-4">
            Em nenhum caso seremos responsáveis por danos indiretos, incidentais, especiais, consequenciais
            ou punitivos resultantes do uso ou incapacidade de usar o serviço.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">8. Lei Aplicável</h2>
          <p className="mb-4">
            Estes termos são regidos pelas leis do Brasil, sem considerar conflitos de princípios legais.
          </p>

          <div className="mt-10 pt-6 border-t border-dark-border">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-4">
              Se você tiver dúvidas sobre estes termos, entre em contato conosco através da página de <Link href="/contact" className="text-primary hover:underline">Contato</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}