import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  // Buscar configurações de SEO para nome do site
  const { data: seoSettings } = useQuery<any>({
    queryKey: ["/api/seo-settings"],
  });

  return (
    <footer className="bg-dark-surface border-t border-dark-border py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                <path d="M9 13H15V15H9V13ZM9 16H15V18H9V16Z"/>
              </svg>
              <span className="text-xl font-bold">{seoSettings?.siteTitle?.split(' ')[0] || "PDFxandria"}</span>
            </div>
            <p className="text-gray-400 mb-4">Repositório público de documentos PDF de acesso livre e gratuito.</p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Navegação</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">Início</Link></li>
              <li><Link href="/explorar" className="hover:text-white">Explorar</Link></li>
              <li><Link href="/categorias" className="hover:text-white">Categorias</Link></li>
              <li><Link href="/recentes" className="hover:text-white">Mais recentes</Link></li>
              <li><Link href="/populares" className="hover:text-white">Populares</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Suporte</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/ajuda" className="hover:text-white">Ajuda</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
              <li><Link href="/denunciar" className="hover:text-white">Reportar Problema</Link></li>
              <li><Link href="/direitos-autorais" className="hover:text-white">DMCA</Link></li>

            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/termos" className="hover:text-white">Termos de Serviço</Link></li>
              <li><Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link></li>
              <li><Link href="/cookies" className="hover:text-white">Política de Cookies</Link></li>
              <li><Link href="https://pdfxandria.com/sitemap.xml" className="hover:text-white">Sitmap</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">© {new Date().getFullYear()} {seoSettings?.siteTitle?.split(' ')[0] || "PDFxandria"}. Todos os direitos reservados.</div>
          <div className="text-gray-400">
            <span className="hover:text-white">Português</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
