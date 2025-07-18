import { Link } from "wouter";

export default function CopyrightPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direitos Autorais</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Política de Direitos Autorais</h2>
          <p className="mb-4">
            O BaixaPDF respeita os direitos de propriedade intelectual e espera que seus usuários façam o mesmo.
            É nossa política responder a notificações de suposta violação de direitos autorais que cumpram
            com a legislação aplicável.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Conteúdo Protegido</h2>
          <p className="mb-4">
            Todo o conteúdo disponibilizado pelos usuários em nosso serviço deve respeitar os direitos autorais.
            Não é permitido o upload de material protegido por direitos autorais sem a permissão expressa do titular
            dos direitos.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Notificação de Violação</h2>
          <p className="mb-4">
            Se você acredita que seu trabalho foi copiado de uma maneira que constitua violação de direitos autorais,
            por favor forneça as seguintes informações ao nosso agente de direitos autorais:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Uma assinatura física ou eletrônica do proprietário dos direitos autorais ou de uma pessoa autorizada a agir em seu nome;</li>
            <li>Identificação da obra protegida por direitos autorais que você alega ter sido violada;</li>
            <li>Identificação do material que você alega estar infringindo e onde está localizado no serviço;</li>
            <li>Informações de contato, como seu endereço, número de telefone e e-mail;</li>
            <li>Uma declaração de que você acredita de boa-fé que o uso do material da maneira reclamada não é autorizado pelo proprietário dos direitos autorais, seu agente ou pela lei;</li>
            <li>Uma declaração, sob pena de perjúrio, de que as informações na sua notificação são precisas e que você é o proprietário dos direitos autorais ou está autorizado a agir em nome do proprietário.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Procedimento de Remoção</h2>
          <p className="mb-4">
            Ao receber uma notificação válida de violação de direitos autorais, o BaixaPDF tomará as seguintes medidas:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Removerá ou desativará o acesso ao material alegadamente infrator;</li>
            <li>Notificará o usuário que enviou o material;</li>
            <li>Tomará medidas razoáveis para evitar que o usuário cometa futuras violações.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Contra-Notificação</h2>
          <p className="mb-4">
            Se você acredita que seu material foi removido por engano, pode enviar uma contra-notificação com as seguintes informações:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Sua assinatura física ou eletrônica;</li>
            <li>Identificação do material que foi removido e onde ele aparecia antes de ser removido;</li>
            <li>Uma declaração, sob pena de perjúrio, de que você acredita de boa-fé que o material foi removido ou desativado como resultado de erro ou identificação incorreta;</li>
            <li>Seu nome, endereço e número de telefone, e uma declaração de que você consente com a jurisdição do Tribunal Federal do seu distrito.</li>
          </ul>

          <div className="mt-10 pt-6 border-t border-dark-border">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-4">
              Para enviar notificações relacionadas a direitos autorais, use nossa página de <Link href="/dmca" className="text-primary hover:underline">DMCA</Link> ou entre em contato através da página de <Link href="/contact" className="text-primary hover:underline">Contato</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
