import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import PdfDetailPage from "@/pages/pdf-detail-page";

import AdminDashboardPage from "@/pages/admin-dashboard-page";
import ProfilePage from "@/pages/profile-page";
import UserProfilePage from "@/pages/user-profile-page";
import ExplorePage from "@/pages/explore-page";
import RecentPage from "@/pages/recent-page";
import CategoryPage from "@/pages/category-page";
import CategoriesPage from "@/pages/categories-page";
import TagPage from "@/pages/tag-page";
import HelpPage from "@/pages/help-page";
import PrivacyPage from "@/pages/privacy-page";
import TermsPage from "@/pages/terms-page";
import CookiesPage from "@/pages/cookies-page";
import CopyrightPage from "@/pages/copyright-page";
import FaqPage from "@/pages/faq-page";
import ContactPage from "@/pages/contact-page";
import ReportPage from "@/pages/report-page";
import DmcaPage from "@/pages/dmca-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenuProvider } from "@/hooks/use-mobile-menu";
import DynamicHtmlSeo from "@/components/seo/dynamic-html-seo";

// PDF tools removed - now a simple public PDF repository

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/entrar">
        {user ? <AdminDashboardPage /> : <AuthPage />}
      </Route>
      <Route path="/pdf/:slug" component={PdfDetailPage} />
      <ProtectedRoute path="/painel" component={AdminDashboardPage} />
      <ProtectedRoute path="/perfil" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />

      <Route path="/explorar" component={ExplorePage} />
      <Route path="/recentes" component={RecentPage} />
      <Route path="/populares" component={ExplorePage} />
      {/* PDF tools, premium features, and user features removed - now a simple public PDF repository */}
      <Route path="/categoria/:slug" component={CategoryPage} />
      <Route path="/categorias" component={CategoriesPage} />
      <Route path="/tag/:tagSlug" component={TagPage} />
      <Route path="/ajuda" component={HelpPage} />
      <Route path="/privacidade" component={PrivacyPage} />
      <Route path="/termos" component={TermsPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/copyright" component={CopyrightPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/contato" component={ContactPage} />
      <Route path="/denunciar" component={ReportPage} />
      <Route path="/direitos-autorais" component={DmcaPage} />
      <Route path="/usuario/:username" component={UserProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <MobileMenuProvider>
      <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text">
        <DynamicHtmlSeo />
        <Header />
        <div className="flex-1">
          <Router />
        </div>
        <Footer />
      </div>
    </MobileMenuProvider>
  );
}

export default App;
