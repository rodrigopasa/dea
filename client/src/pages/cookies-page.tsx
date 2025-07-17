import { Link } from "wouter";

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. O que são cookies?</h2>
          <p className="mb-4">
            Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou no disco rígido do seu 
            computador quando você visita um site. Eles permitem que o site lembre suas ações e preferências por 
            um período específico, para que você não precise inserir as mesmas informações várias vezes.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">2. Como usamos cookies</h2>
          <p className="mb-4">
            Utilizamos cookies por diversas razões, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Cookies essenciais: Necessários para o funcionamento do site, como autenticação de usuário</li>
            <li>Cookies de preferências: Permitem que nosso site lembre suas preferências de uso</li>
            <li>Cookies analíticos: Nos ajudam a entender como os visitantes interagem com nosso site</li>
            <li>Cookies de marketing: Utilizados para rastrear visitantes em sites diferentes</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">3. Gerenciamento de cookies</h2>
          <p className="mb-4">
            A maioria dos navegadores permite controlar os cookies através das configurações. Você pode configurar 
            seu navegador para recusar todos os cookies ou indicar quando um cookie está sendo enviado. No entanto, 
            alguns recursos do nosso site podem não funcionar corretamente sem cookies.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">4. Cookies de terceiros</h2>
          <p className="mb-4">
            Nosso site também pode usar cookies de terceiros, especialmente para análise e marketing. Esses 
            cookies são gerenciados pelos respectivos serviços e não são controlados por nós.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">5. Alterações nesta política</h2>
          <p className="mb-4">
            Podemos atualizar nossa Política de Cookies ocasionalmente. Recomendamos que você revise esta página 
            periodicamente para estar ciente de quaisquer alterações.
          </p>

          <div className="mt-10 pt-6 border-t border-dark-border">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-4">
              Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco através da página de <Link href="/contact" className="text-primary hover:underline">Contato</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}