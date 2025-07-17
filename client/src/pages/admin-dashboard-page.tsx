import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { User, Pdf, Category, DmcaRequest, SeoSettings, SiteSettings } from "@shared/schema";
import AdSettingsPanel from "@/components/admin/ad-settings-panel";
import PdfUploadForm from "@/components/pdf/pdf-upload-form";
import { Link } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { renderCategoryIcon, CategoryIconSelect } from "@/components/categories/category-icon-select";
import { EditCategoryDialog } from "@/components/categories/edit-category-dialog";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import SeoSettingsPage from "@/pages/admin/seo-settings";
import PdfEditForm from "@/components/pdf/pdf-edit-form";
import RedirectsManagement from "@/pages/admin/redirects-management";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  FileText, 
  Database, 
  Shield, 
  EyeOff,
  PieChart,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Plus,
  Settings,
  Settings2,
  Eye,
  Search,
  Globe,
  BarChart2,
  Activity,
  Compass,
  Share2,
  Bookmark,
  Clock,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Award,
  ChevronRight,
  ExternalLink,
  Save,
  Infinity,
  UserCog,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPdf, setSelectedPdf] = useState<Pdf | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit PDF dialog
  const [isEditPdfDialogOpen, setIsEditPdfDialogOpen] = useState(false);
  const [editingPdf, setEditingPdf] = useState<Pdf | null>(null);
  const [editPdfForm, setEditPdfForm] = useState({
    title: '',
    description: '',
    isPublic: true,
    categoryId: 1
  });
  const [selectedDmca, setSelectedDmca] = useState<DmcaRequest | null>(null);
  const [isDmcaDialogOpen, setIsDmcaDialogOpen] = useState(false);
  const [dmcaStatus, setDmcaStatus] = useState<string>("approved");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  // SEO dialog removed - now handled by SeoSettingsPage
  

  
  // Estados para gerenciamento de categorias
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: 'folder',
    color: '#4f46e5'
  });
  
  // Estados para upload único
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Estados para upload múltiplo
  const [isMultipleUploadDialogOpen, setIsMultipleUploadDialogOpen] = useState(false);
  const [isEditFilesDialogOpen, setIsEditFilesDialogOpen] = useState(false);
  const [multipleUploadFiles, setMultipleUploadFiles] = useState<File[]>([]);
  const [multipleUploadCategory, setMultipleUploadCategory] = useState<number>(1);
  const [multipleUploadIsPublic, setMultipleUploadIsPublic] = useState<boolean>(true);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState<boolean>(false);
  const [duplicateFiles, setDuplicateFiles] = useState<{file: File, existingPdf?: any}[]>([]);
  const [editableFiles, setEditableFiles] = useState<Array<{
    file: File,
    title: string,
    description: string,
    originalName: string,
    isEdited: boolean
  }>>([]);
  const [currentEditingFileIndex, setCurrentEditingFileIndex] = useState(0);
  
  // Estados para opções avançadas de upload
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [useAIOptimization, setUseAIOptimization] = useState(true);
  const [prefixTitle, setPrefixTitle] = useState('');
  const [tagKeywords, setTagKeywords] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // SEO Settings removed - now handled by SeoSettingsPage
  

  
  // Interface para tipificar as estatísticas do administrador
  interface AdminStats {
    userCount: number;
    pdfCount: number;
    totalViews: number;
    totalDownloads: number;
    pendingDmcaCount: number;
    categoryStats: Array<{
      id: number;
      name: string;
      slug: string;
      count: number;
      percentage: number;
    }>;
  }
  
  // Fetch admin stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });
  

  
  // Fetch all PDFs (including private)
  const { data: pdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/admin/pdfs"],
  });
  
  // Fetch all categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch all DMCA requests
  const { data: dmcaRequests, isLoading: isDmcaLoading } = useQuery<DmcaRequest[]>({
    queryKey: ["/api/dmca"],
  });
  
  // Fetch SEO settings
  const { data: seoData, isLoading: isSeoLoading } = useQuery<SeoSettings>({
    queryKey: ["/api/admin/seo"],
  });
  

  
  // Fetch Site settings
  const { data: siteSettingsData, isLoading: isSiteSettingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });
  



  
  // Delete PDF mutation
  const deletePdfMutation = useMutation({
    mutationFn: async (pdfId: number) => {
      await apiRequest("DELETE", `/api/pdfs/${pdfId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "PDF excluído",
        description: "O documento foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPdf(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Edit PDF mutation
  const editPdfMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      await apiRequest("PUT", `/api/pdfs/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "PDF editado",
        description: "O documento foi editado com sucesso.",
      });
      setIsEditPdfDialogOpen(false);
      setEditingPdf(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao editar",
        description: "Não foi possível editar o documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Update DMCA request status mutation
  const updateDmcaMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PATCH", `/api/dmca/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dmca"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Solicitação DMCA atualizada",
        description: "O status da solicitação foi atualizado com sucesso.",
      });
      setIsDmcaDialogOpen(false);
      setSelectedDmca(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Save SEO settings mutation
  const saveSeoSettingsMutation = useMutation({
    mutationFn: async (settings: typeof seoSettings) => {
      // Tentar primeiro a rota específica de administrador
      try {
        return await apiRequest("PATCH", "/api/admin/seo", settings);
      } catch (error) {
        console.log("Falha na primeira tentativa, tentando rota alternativa...");
        // Se falhar, tentar a rota alternativa
        return await apiRequest("PATCH", "/api/seo", settings);
      }
    },
    onSuccess: () => {
      // Atualizar os dados de SEO no cache
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seo"] });
      
      toast({
        title: "Configurações SEO salvas",
        description: "As configurações de SEO foram atualizadas com sucesso.",
      });
      setIsSeoDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao salvar configurações SEO:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de SEO. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  

  
  // Save site settings mutation
  const saveSiteSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      return await apiRequest("PATCH", "/api/site-settings", settings);
    },
    onSuccess: () => {
      // Atualizar os dados de configurações do site no cache
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      
      toast({
        title: "Configurações do site salvas",
        description: "As configurações do site foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao salvar configurações do site:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do site. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Save advanced settings mutation (depreciado, mantido por compatibilidade)
  const saveAdvancedSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return await apiRequest("POST", "/api/admin/settings", settings);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do site foram atualizadas com sucesso.",
      });
      setIsAdvancedSettingsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Extrair metadata de PDF para edição
  const extractPdfMetadataMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/pdfs/extract-metadata', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao extrair metadados do PDF');
      }
      
      return await response.json();
    }
  });

  // Verificar se um arquivo PDF é duplicado
  const checkDuplicateFile = async (file: File): Promise<{duplicate: boolean, existingPdf?: any}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/pdfs/check-duplicate', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao verificar duplicação:', error);
      return {duplicate: false};
    }
  };

  // Função para preparar os arquivos para edição
  const prepareFilesForEditing = async () => {
    if (multipleUploadFiles.length === 0) return;
    
    // Reset editável files
    setEditableFiles([]);
    setCurrentEditingFileIndex(0);
    setDuplicateFiles([]);
    
    const filesToProcess = [...multipleUploadFiles];
    let processedFiles = [];
    let duplicates: {file: File, existingPdf?: any}[] = [];
    
    // Mostrar toast de loading
    toast({
      title: "Preparando arquivos",
      description: "Verificando duplicados e extraindo metadados dos PDFs...",
    });
    
    setIsCheckingDuplicates(true);
    
    // Processar arquivos sequencialmente
    for (const file of filesToProcess) {
      try {
        // Primeiro verificar se o arquivo é duplicado
        const dupeResult = await checkDuplicateFile(file);
        
        if (dupeResult.duplicate) {
          // Se for duplicado, adicionar à lista de duplicados
          duplicates.push({
            file,
            existingPdf: dupeResult.existingPdf
          });
          
          continue; // Pular para o próximo arquivo
        }
        
        // Se não for duplicado, extrair metadados
        const metadata = await extractPdfMetadataMutation.mutateAsync(file);
        
        // Usar título do metadata ou nome do arquivo
        let title = metadata.title;
        if (!title || title === 'Documento sem título') {
          title = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        }
        
        processedFiles.push({
          file,
          originalName: file.name,
          title,
          description: metadata.description || '',
          isEdited: false
        });
      } catch (error) {
        console.error("Erro ao processar arquivo:", file.name, error);
        // Verificar se o erro é por causa de duplicação
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('duplicado')) {
          duplicates.push({
            file,
            existingPdf: null
          });
        } else {
          // Mesmo se falhar a extração, adicionar arquivo com dados básicos
          processedFiles.push({
            file,
            originalName: file.name,
            title: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
            description: '',
            isEdited: false
          });
        }
      }
    }
    
    // Atualizar estado com arquivos processados
    setEditableFiles(processedFiles);
    
    // Atualizar duplicados encontrados
    setDuplicateFiles(duplicates);
    setIsCheckingDuplicates(false);
    
    // Se tivemos duplicados, mostrar toast com essa informação
    if (duplicates.length > 0) {
      toast({
        title: `${duplicates.length} PDFs duplicados detectados`,
        description: `${duplicates.length} arquivos já existem no sistema e foram removidos da lista de upload.`,
        variant: "destructive"
      });
    }
    
    // Verificar se ainda temos arquivos para processar após remoção de duplicados
    if (processedFiles.length === 0 && duplicates.length > 0) {
      // Todos os arquivos eram duplicados
      toast({
        title: "Apenas arquivos duplicados",
        description: "Todos os arquivos selecionados já existem no sistema.",
        variant: "destructive"
      });
      setIsMultipleUploadDialogOpen(false);
      return;
    } else if (processedFiles.length === 0) {
      // Nenhum arquivo processado por outros motivos
      toast({
        title: "Erro ao processar",
        description: "Nenhum arquivo pôde ser processado. Tente novamente.",
        variant: "destructive"
      });
      setIsMultipleUploadDialogOpen(false);
      return;
    }
    
    // Fechar diálogo de upload e abrir diálogo de edição
    setIsMultipleUploadDialogOpen(false);
    setIsEditFilesDialogOpen(true);
  };

  // Multiple PDF upload mutation
  const uploadMultiplePdfsMutation = useMutation({
    mutationFn: async ({ 
      files, 
      categoryId, 
      isPublic, 
      metadata,
      options = {} 
    }: { 
      files: File[], 
      categoryId: number, 
      isPublic: boolean,
      metadata?: Array<{title: string, description: string}>,
      options?: {
        skipDuplicates?: boolean,
        useAIOptimization?: boolean,
        prefixTitle?: string,
        tagKeywords?: string
      }
    }) => {
      // Criar um FormData para envio dos arquivos múltiplos
      const formData = new FormData();
      
      // Adicionar cada arquivo ao FormData
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Adicionar parâmetros adicionais
      formData.append('categoryId', categoryId.toString());
      formData.append('isPublic', isPublic.toString());
      
      // Adicionar metadados editados se disponíveis
      if (metadata && metadata.length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Adicionar opções avançadas
      if (options.skipDuplicates !== undefined) {
        formData.append('skipDuplicates', options.skipDuplicates.toString());
      }
      
      if (options.useAIOptimization !== undefined) {
        formData.append('useAIOptimization', options.useAIOptimization.toString());
      }
      
      if (options.prefixTitle) {
        formData.append('prefixTitle', options.prefixTitle);
      }
      
      if (options.tagKeywords) {
        formData.append('tagKeywords', options.tagKeywords);
      }
      
      // Configurar a requisição com FormData
      const response = await fetch('/api/admin/pdfs/upload-multiple', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload múltiplo de PDFs');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Atualizar todas as listas de PDFs
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs/popular"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      // Preparar mensagem detalhada
      let description = `${data.processedCount} de ${data.totalCount} PDFs foram enviados com sucesso.`;
      
      if (data.duplicatesCount && data.duplicatesCount > 0) {
        description += ` ${data.duplicatesCount} ${data.duplicatesCount === 1 ? 'arquivo duplicado foi' : 'arquivos duplicados foram'} ${data.skipDuplicates ? 'ignorado' : 'detectado'}.`;
      }
      
      if (data.errorsCount && data.errorsCount > 0) {
        description += ` ${data.errorsCount} ${data.errorsCount === 1 ? 'arquivo teve' : 'arquivos tiveram'} erros.`;
      }
      
      toast({
        title: "Upload concluído",
        description: description,
      });
      
      // Resetar todos os estados
      setIsMultipleUploadDialogOpen(false);
      setIsEditFilesDialogOpen(false);
      setMultipleUploadFiles([]);
      setEditableFiles([]);
      setMultipleUploadCategory(1);
      setMultipleUploadIsPublic(true);
      
      // Resetar opções avançadas
      setAdvancedOptionsOpen(false);
      setSkipDuplicates(true);
      setUseAIOptimization(true);
      setPrefixTitle('');
      setTagKeywords('');
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Não foi possível enviar os arquivos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
      return await apiRequest("POST", "/api/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria criada",
        description: "A nova categoria foi adicionada com sucesso.",
      });
      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: '', slug: '', icon: 'folder', color: '#4f46e5' });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível adicionar a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Category> }) => {
      return await apiRequest("PUT", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      setIsCategoryDialogOpen(false);
      setCategoryToEdit(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a categoria. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria. Verifique se ela possui documentos associados.",
        variant: "destructive",
      });
    },
  });


  
  // Database import mutation
  const importDatabaseMutation = useMutation({
    mutationFn: async (file: File) => {
      // Cria um FormData para envio do arquivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Configura a requisição com o FormData (não pode usar apiRequest diretamente)
      const response = await fetch('/api/admin/database/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao importar banco de dados');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalida todas as consultas para recarregar os dados
      queryClient.invalidateQueries();
      toast({
        title: "Banco de dados importado",
        description: "Os dados foram importados com sucesso. A página será recarregada para refletir as mudanças.",
      });
      setIsImportDialogOpen(false);
      setImportFile(null);
      
      // Recarrega a página após 2 segundos para exibir os novos dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Não foi possível importar os dados. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handle PDF deletion
  const handleDeletePdf = (pdf: Pdf) => {
    setSelectedPdf(pdf);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditPdf = (pdf: Pdf) => {
    setEditingPdf(pdf);
    setEditPdfForm({
      title: pdf.title,
      description: pdf.description || '',
      isPublic: pdf.isPublic,
      categoryId: pdf.categoryId
    });
    setIsEditPdfDialogOpen(true);
  };
  
  // Confirm PDF deletion
  const confirmDeletePdf = () => {
    if (selectedPdf) {
      deletePdfMutation.mutate(selectedPdf.id);
    }
  };
  
  // Handle DMCA status update
  const handleUpdateDmca = (dmca: DmcaRequest, status: string) => {
    setSelectedDmca(dmca);
    setDmcaStatus(status);
    setIsDmcaDialogOpen(true);
  };
  
  // Confirm DMCA status update
  const confirmUpdateDmca = () => {
    if (selectedDmca) {
      updateDmcaMutation.mutate({ 
        id: selectedDmca.id, 
        status: dmcaStatus 
      });
    }
  };
  
  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // User columns for DataTable
  const userColumns = [
    {
      accessor: "id",
      header: "ID",
    },
    {
      accessor: "username",
      header: "Usuário",
      cell: (user: User) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span>{user.username}</span>
        </div>
      ),
    },
    {
      header: "Tipo",
      cell: (user: User) => (
        <Badge variant="secondary">
          {user.isAdmin ? "Administrador" : "Usuário"}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (user: User) => (
        <Badge variant={user.isBlocked ? "destructive" : "default"}>
          {user.isBlocked ? "Bloqueado" : "Ativo"}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      header: "Ações",
      cell: (user: User) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-dark-border"
          >
            <UserCog className="w-4 h-4 mr-1" />
            Editar
          </Button>
          
          {/* Botão de exclusão de usuário (não mostrar para o próprio usuário admin) */}
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8"
              onClick={() => {
                // Confirmar exclusão com informações sobre o processo
                if (confirm(`Tem certeza que deseja excluir o usuário ${user.username}?\n\nA conta será desativada, mas os documentos e interações permanecerão no sistema. O usuário não poderá mais fazer login.`)) {
                  // Use a API de mutation para maior consistência
                  apiRequest("DELETE", `/api/users/${user.id}`)
                    .then(() => {
                      toast({
                        title: "Usuário excluído",
                        description: `O usuário ${user.username} foi excluído com sucesso.`,
                      });
                      // Recarregar a lista de usuários
                    })
                    .catch(error => {
                      toast({
                        title: "Erro ao excluir usuário",
                        description: error.message || "Não foi possível excluir o usuário",
                        variant: "destructive",
                      });
                    });
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </Button>
        </div>
      ),
    },
  ];
  
  // PDF columns for DataTable
  const pdfColumns = [
    {
      accessor: "title",
      header: "Documento",
      cell: (pdf: Pdf) => {
        const category = categories?.find(cat => cat.id === pdf.categoryId);
        
        return (
          <div className="flex items-center">
            <div className="w-10 h-12 bg-dark-surface-2 rounded mr-3 overflow-hidden">
              {pdf.coverImage ? (
                <img 
                  src={`/uploads/thumbnails/${pdf.coverImage}`} 
                  alt={`Capa de ${pdf.title}`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="text-gray-400 w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{pdf.title}</div>
              {category && (
                <Badge variant="outline" className="bg-primary bg-opacity-20 text-primary border-0 text-xs">
                  {category.name}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessor: "isPublic",
      header: "Visibilidade",
      cell: (pdf: Pdf) => (
        <div className="flex items-center">
          {pdf.isPublic ? (
            <Badge variant="outline" className="bg-success bg-opacity-20 text-success border-0 flex items-center">
              <Eye className="mr-1 w-3 h-3" /> Público
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-dark-surface-2 text-gray-400 border-0 flex items-center">
              <EyeOff className="mr-1 w-3 h-3" /> Privado
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessor: "views",
      header: "Visualizações",
    },
    {
      accessor: "downloads",
      header: "Downloads",
    },
    {
      accessor: "createdAt",
      header: "Data",
      cell: (pdf: Pdf) => formatDate(pdf.createdAt),
    },
    {
      accessor: "actions",
      header: "Ações",
      cell: (pdf: Pdf) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm" 
            className="h-8 border-dark-border"
            onClick={() => window.open(`/pdf/${pdf.slug}`, '_blank')}
          >
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm" 
            className="h-8 border-dark-border"
            onClick={() => handleEditPdf(pdf)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="h-8"
            onClick={() => handleDeletePdf(pdf)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];
  
  // DMCA columns for DataTable
  const dmcaColumns = [
    {
      accessor: "id",
      header: "ID",
    },
    {
      accessor: "pdfId",
      header: "Documento",
      cell: (dmca: DmcaRequest) => {
        const relatedPdf = pdfs?.find(pdf => pdf.id === dmca.pdfId);
        return relatedPdf ? relatedPdf.title : `PDF #${dmca.pdfId}`;
      }
    },
    {
      accessor: "requestorName",
      header: "Solicitante",
    },
    {
      accessor: "requestorEmail",
      header: "Email",
    },
    {
      accessor: "reason",
      header: "Motivo",
      cell: (dmca: DmcaRequest) => (
        <div className="max-w-xs truncate" title={dmca.reason}>
          {dmca.reason}
        </div>
      ),
    },
    {
      accessor: "status",
      header: "Status",
      cell: (dmca: DmcaRequest) => {
        let color = "text-gray-400";
        let icon = <AlertCircle className="w-4 h-4 mr-1" />;
        
        if (dmca.status === "approved") {
          color = "text-success";
          icon = <CheckCircle className="w-4 h-4 mr-1" />;
        } else if (dmca.status === "rejected") {
          color = "text-destructive";
          icon = <XCircle className="w-4 h-4 mr-1" />;
        }
        
        return (
          <div className={`flex items-center ${color} capitalize`}>
            {icon}
            {dmca.status}
          </div>
        );
      },
    },
    {
      accessor: "createdAt",
      header: "Data",
      cell: (dmca: DmcaRequest) => formatDate(dmca.createdAt),
    },
    {
      accessor: "actions",
      header: "Ações",
      cell: (dmca: DmcaRequest) => (
        <div className="flex space-x-2">
          {dmca.status === "pending" ? (
            <>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 bg-success hover:bg-success/80"
                onClick={() => handleUpdateDmca(dmca, "approved")}
              >
                Aprovar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8"
                onClick={() => handleUpdateDmca(dmca, "rejected")}
              >
                Rejeitar
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-8 border-dark-border">
              Detalhes
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Painel de Administração</h1>
        <p className="text-gray-300">Gerencie usuários, documentos e configurações do site</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-dark-surface border-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Usuários</h3>
              <Users className="text-primary w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "..." : stats?.userCount || 0}
            </div>
            <div className="text-sm text-success mt-1">
              ↑ {Math.floor(Math.random() * 150)} novos este mês
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-surface border-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Documentos</h3>
              <FileText className="text-primary w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">
              {isStatsLoading ? "..." : stats?.pdfCount || 0}
            </div>
            <div className="text-sm text-success mt-1">
              ↑ {Math.floor(Math.random() * 300)} novos este mês
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-surface border-dark-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Solicitações DMCA</h3>
              <Shield className="text-warning w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">
              {isDmcaLoading ? "..." : dmcaRequests?.length || 0}
            </div>
            <div className="text-sm text-error mt-1">
              ↑ {isDmcaLoading ? "..." : dmcaRequests?.filter(req => req.status === "pending").length || 0} pendentes de análise
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-6 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="pdfs">Documentos</TabsTrigger>
          <TabsTrigger value="dmca">DMCA</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="redirects">URLs</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Atividade recente</CardTitle>
                    <Select defaultValue="7">
                      <SelectTrigger className="w-40 bg-dark-surface-2 border-dark-border">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-surface-2 border-dark-border">
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72 bg-dark-surface-2 rounded-lg flex items-center justify-center">
                    <PieChart className="text-gray-500 w-12 h-12 mr-2" />
                    <span className="text-gray-400">Gráfico de atividade seria exibido aqui</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle>Categorias populares</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCategoriesLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-dark-surface-2 rounded w-full"></div>
                      <div className="h-4 bg-dark-surface-2 rounded w-full"></div>
                      <div className="h-4 bg-dark-surface-2 rounded w-full"></div>
                      <div className="h-4 bg-dark-surface-2 rounded w-full"></div>
                      <div className="h-4 bg-dark-surface-2 rounded w-full"></div>
                    </div>
                  ) : (
                    stats?.categoryStats?.map((catStat: any) => (
                      <div key={catStat.id}>
                        <div className="flex justify-between mb-1">
                          <span>{catStat.name}</span>
                          <span>{catStat.percentage}%</span>
                        </div>
                        <div className="w-full bg-dark-surface-2 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${catStat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-primary w-full">
                    Gerenciar categorias
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-dark-surface border-dark-border">
              <CardHeader>
                <CardTitle>Configurações rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSiteSettingsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-dark-surface-2 rounded w-full"></div>
                    <div className="h-8 bg-dark-surface-2 rounded w-full"></div>
                    <div className="h-8 bg-dark-surface-2 rounded w-full"></div>
                    <div className="h-8 bg-dark-surface-2 rounded w-full"></div>
                    <div className="h-8 bg-dark-surface-2 rounded w-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Modo de manutenção</span>
                      <Switch 
                        checked={siteSettingsData?.maintenanceMode || false}
                        onCheckedChange={(checked) => {
                          saveSiteSettingsMutation.mutate({
                            maintenanceMode: checked
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Registro de novos usuários</span>
                      <Switch 
                        checked={siteSettingsData?.allowRegistration !== false}
                        onCheckedChange={(checked) => {
                          saveSiteSettingsMutation.mutate({
                            allowRegistration: checked
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Upload público de documentos</span>
                      <Switch 
                        checked={siteSettingsData?.allowPublicUploads !== false}
                        onCheckedChange={(checked) => {
                          saveSiteSettingsMutation.mutate({
                            allowPublicUploads: checked
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Aprovação de documentos</span>
                      <Switch 
                        checked={siteSettingsData?.requireApproval || false}
                        onCheckedChange={(checked) => {
                          saveSiteSettingsMutation.mutate({
                            requireApproval: checked
                          });
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Verificação de e-mail</span>
                      <Switch 
                        checked={siteSettingsData?.requireEmailVerification !== false}
                        onCheckedChange={(checked) => {
                          saveSiteSettingsMutation.mutate({
                            requireEmailVerification: checked
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="link" 
                  className="text-primary w-full"
                  onClick={() => setIsAdvancedSettingsOpen(true)}
                >
                  Configurações avançadas
                </Button>
              </CardFooter>
            </Card>
            
            <div className="lg:col-span-2">
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>SEO e Performance</CardTitle>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-40 bg-dark-surface-2 border-dark-border">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-surface-2 border-dark-border">
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-dark-surface-2 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Velocidade média de carregamento</div>
                      <div className="text-2xl font-bold">1.2s</div>
                      <div className="text-xs text-success mt-1">↑ 8% melhor que mês anterior</div>
                    </div>
                    
                    <div className="bg-dark-surface-2 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Acessos via busca orgânica</div>
                      <div className="text-2xl font-bold">15,432</div>
                      <div className="text-xs text-success mt-1">↑ 12% melhor que mês anterior</div>
                    </div>
                    
                    <div className="bg-dark-surface-2 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Palavras-chave indexadas</div>
                      <div className="text-2xl font-bold">872</div>
                      <div className="text-xs text-success mt-1">↑ 23 novas palavras-chave</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Sugestões de otimização</h3>
                    
                    <div className="flex items-start space-x-3 p-3 bg-dark-surface-2 rounded-lg">
                      <AlertCircle className="text-warning w-5 h-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Otimize as meta descrições</h4>
                        <p className="text-sm text-gray-400">25 páginas não possuem meta descrições otimizadas. Adicione descrições com 120-156 caracteres.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-dark-surface-2 rounded-lg">
                      <AlertCircle className="text-warning w-5 h-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Adicione textos alternativos em imagens</h4>
                        <p className="text-sm text-gray-400">43 imagens não possuem texto alternativo (alt). Adicione para melhorar a acessibilidade e SEO.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="text-primary w-full">
                    Ver relatório completo
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Categorias</CardTitle>
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white"
                  onClick={() => {
                    setCategoryToEdit(null);
                    setCategoryForm({
                      name: '',
                      slug: '',
                      icon: 'folder',
                      color: '#4f46e5'
                    });
                    setIsCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="mr-1 w-4 h-4" /> Nova Categoria
                </Button>
              </div>
              <CardDescription>
                Gerencie as categorias de documentos da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isCategoriesLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-dark-surface-2 rounded-lg p-4">
                        <div className="h-6 bg-dark-surface rounded mb-3 w-3/4"></div>
                        <div className="h-4 bg-dark-surface rounded mb-2 w-1/2"></div>
                        <div className="h-8 bg-dark-surface rounded mt-4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  categories?.map(category => (
                    <div key={category.id} className="bg-dark-surface-2 rounded-lg p-4 border border-dark-border">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <Badge className="bg-primary bg-opacity-20 text-primary border-0">
                          {pdfs?.filter(pdf => pdf.categoryId === category.id).length || 0} docs
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm mb-4">
                        Slug: <span className="font-mono">{category.slug}</span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-dark-border flex-1"
                          onClick={() => {
                            setCategoryToEdit(category);
                            setCategoryForm({
                              name: category.name,
                              slug: category.slug,
                              icon: category.icon || 'folder',
                              color: category.color || '#4f46e5'
                            });
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          disabled={category.id === 1} // Não permite excluir a categoria padrão
                          onClick={() => {
                            // Verifica se a categoria tem documentos associados
                            const documentsInCategory = pdfs?.filter(pdf => pdf.categoryId === category.id).length || 0;
                            if (documentsInCategory > 0) {
                              toast({
                                title: "Não é possível excluir",
                                description: `Esta categoria contém ${documentsInCategory} documento(s). Mova-os para outra categoria primeiro.`,
                                variant: "destructive"
                              });
                            } else {
                              deleteCategoryMutation.mutate(category.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* PDFs Tab */}
        <TabsContent value="pdfs">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciar Documentos</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-9 flex items-center gap-1"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Upload Único
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 flex items-center gap-1"
                    onClick={() => setIsMultipleUploadDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" /> Upload Múltiplo
                  </Button>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40 bg-dark-surface-2 border-dark-border">
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-surface-2 border-dark-border">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="public">Públicos</SelectItem>
                      <SelectItem value="private">Privados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                Lista de todos os documentos PDF na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={pdfColumns}
                data={pdfs || []}
                isLoading={isPdfsLoading}
                pagination={{
                  pageIndex: 0,
                  pageCount: Math.ceil((pdfs?.length || 0) / 10),
                  pageSize: 10,
                  onPageChange: () => {},
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* DMCA Tab */}
        <TabsContent value="dmca">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <CardTitle>Solicitações DMCA</CardTitle>
              <CardDescription>
                Gerencie solicitações de remoção de conteúdo por violação de direitos autorais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={dmcaColumns}
                data={dmcaRequests || []}
                isLoading={isDmcaLoading}
                pagination={{
                  pageIndex: 0,
                  pageCount: Math.ceil((dmcaRequests?.length || 0) / 10),
                  pageSize: 10,
                  onPageChange: () => {},
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* SEO Tab */}
        <TabsContent value="seo">
          <SeoSettingsPage />
        </TabsContent>

        {/* Redirects Tab */}
        <TabsContent value="redirects">
          <RedirectsManagement />
        </TabsContent>
        
        {/* Auth Tab */}
        
        {/* Ads Tab */}
        <TabsContent value="ads">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Configurações de Anúncios</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 flex items-center gap-1"
                    onClick={() => {
                      // Navegar para a página de visualização de anúncios
                      window.location.href = '/admin/ad-preview';
                    }}
                  >
                    <Search className="w-4 h-4" /> Visualizar exemplos
                  </Button>
                </div>
              </div>
              <CardDescription>
                Gerencie como e onde os anúncios são exibidos no site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdSettingsPanel />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payments Tab */}
      </Tabs>
      
      {/* Edit PDF Dialog */}
      <Dialog open={isEditPdfDialogOpen} onOpenChange={setIsEditPdfDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar PDF</DialogTitle>
            <DialogDescription>
              Edite as informações do documento PDF incluindo a capa
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {editingPdf && (
              <PdfEditForm 
                pdf={editingPdf} 
                onSuccess={() => {
                  setIsEditPdfDialogOpen(false);
                  setEditingPdf(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete PDF Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{selectedPdf?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dark-border bg-dark-surface-2 hover:bg-dark-surface text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDeletePdf}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* DMCA Update Confirmation Dialog */}
      <AlertDialog open={isDmcaDialogOpen} onOpenChange={setIsDmcaDialogOpen}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dmcaStatus === "approved" ? "Aprovar" : "Rejeitar"} solicitação DMCA
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dmcaStatus === "approved" 
                ? "Aprovar esta solicitação irá remover o documento da plataforma. Esta ação não pode ser desfeita."
                : "Rejeitar esta solicitação manterá o documento disponível na plataforma."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dark-border bg-dark-surface-2 hover:bg-dark-surface text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className={dmcaStatus === "approved" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
              onClick={confirmUpdateDmca}
            >
              {dmcaStatus === "approved" ? "Aprovar" : "Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      

      {/* Database Import Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Banco de Dados</AlertDialogTitle>
            <AlertDialogDescription className="py-2">
              <p className="mb-4">
                Selecione um arquivo de backup JSON para importar. Todos os dados atuais serão substituídos pelos dados do arquivo.
              </p>
              <div className="bg-dark-surface-2 p-3 rounded-md border border-red-500/30 mb-4">
                <p className="text-red-400 font-medium mb-1">Atenção:</p>
                <p className="text-sm">
                  Esta operação substituirá completamente todos os dados atuais do banco de dados. 
                  Recomendamos realizar um backup antes de prosseguir.
                </p>
              </div>
              
              <div className="border border-dashed border-dark-border rounded-md p-6 flex flex-col items-center justify-center bg-dark-surface-2">
                {importFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="text-primary w-12 h-12 mb-2" />
                    <p className="font-medium truncate max-w-full">{importFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(importFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setImportFile(null)}
                    >
                      Trocar arquivo
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="database-import"
                      className="hidden"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImportFile(file);
                      }}
                    />
                    <label
                      htmlFor="database-import"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Database className="text-gray-400 w-12 h-12 mb-2" />
                      <p className="font-medium">Clique para selecionar</p>
                      <p className="text-sm text-gray-400">
                        Arraste e solte ou clique para selecionar o arquivo JSON de backup
                      </p>
                    </label>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-dark-border bg-dark-surface-2 hover:bg-dark-surface text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (importFile) {
                  importDatabaseMutation.mutate(importFile);
                }
              }}
              disabled={!importFile || importDatabaseMutation.isPending}
            >
              {importDatabaseMutation.isPending ? "Importando..." : "Importar Dados"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      
      {/* Advanced Settings Dialog */}
      <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
        <DialogContent className="bg-dark-surface border-dark-border sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Configurações Avançadas</DialogTitle>
            <DialogDescription>
              Configure as opções avançadas do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Settings className="mr-2 h-5 w-5" /> Configurações Gerais
              </h3>
              <div className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome do Site</label>
                    <Input defaultValue="PDFxandria" className="bg-dark-surface-2 border-dark-border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL do Site</label>
                    <Input defaultValue="https://pdfxandria.replit.app" className="bg-dark-surface-2 border-dark-border" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição do Site</label>
                  <Textarea defaultValue="Plataforma para compartilhamento de documentos PDF" className="bg-dark-surface-2 border-dark-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email de Contato</label>
                    <Input defaultValue="contato@pdfxandria.com" className="bg-dark-surface-2 border-dark-border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email para Notificações</label>
                    <Input defaultValue="notificacoes@pdfxandria.com" className="bg-dark-surface-2 border-dark-border" />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Search className="mr-2 h-5 w-5" /> Configurações de SEO
              </h3>
              <div className="px-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Configurações de metatags, OpenGraph e informações para indexação</span>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90" 
                    onClick={() => {
                      // Obter as configurações atuais da API
                      fetch('/api/seo')
                        .then(response => response.json())
                        .then(data => {
                          // Atualizar o estado com os valores atuais
                          setSeoSettings({
                            siteTitle: data.siteTitle || 'PDFxandria',
                            siteDescription: data.siteDescription || 'Compartilhe e descubra documentos em PDF',
                            siteKeywords: data.siteKeywords || 'pdf, documentos, compartilhamento',
                            ogImage: data.ogImage || '/generated-icon.png',
                            twitterHandle: data.twitterHandle || '@pdfxandria',
                            googleVerification: data.googleVerification || '',
                            bingVerification: data.bingVerification || '',
                            robotsTxt: data.robotsTxt || 'User-agent: *\nDisallow: /admin\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nSitemap: /sitemap.xml',
                            gaTrackingId: data.gaTrackingId || '',
                            pdfTitleFormat: data.pdfTitleFormat || '${title} em PDF ou Leia Online',
                            openaiApiKey: data.openaiApiKey || '',
                          });
                          
                          // Fechar as configurações avançadas e abrir o diálogo de SEO
                          setIsAdvancedSettingsOpen(false);
                          setIsSeoDialogOpen(true);
                        })
                        .catch(error => {
                          console.error('Erro ao obter configurações de SEO:', error);
                          toast({
                            title: "Erro",
                            description: "Não foi possível carregar as configurações de SEO.",
                            variant: "destructive",
                          });
                        });
                    }}
                  >
                    Gerenciar SEO
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Segurança e Privacidade
              </h3>
              <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação de dois fatores</p>
                    <p className="text-sm text-gray-400">Habilitar 2FA para todos os administradores</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CAPTCHA no registro</p>
                    <p className="text-sm text-gray-400">Exigir CAPTCHA no cadastro de novos usuários</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Limite de tentativas de login</p>
                    <p className="text-sm text-gray-400">Limitar tentativas de login (5 por hora)</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Expiração de sessão</p>
                    <p className="text-sm text-gray-400">Encerrar sessões inativas após 1 hora</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Database className="mr-2 h-5 w-5" /> Cache e Performance
              </h3>
              <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cache de consultas</p>
                    <p className="text-sm text-gray-400">Armazenar em cache resultados frequentes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compressão de imagens</p>
                    <p className="text-sm text-gray-400">Comprimir automaticamente imagens enviadas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Minificação de HTML/CSS/JS</p>
                    <p className="text-sm text-gray-400">Minificar recursos estáticos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdvancedSettingsOpen(false)} className="border-dark-border">
              Cancelar
            </Button>
            <Button onClick={() => saveAdvancedSettingsMutation.mutate({})}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Multiple Upload Dialog */}
      <Dialog open={isMultipleUploadDialogOpen} onOpenChange={setIsMultipleUploadDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Múltiplo de PDFs</DialogTitle>
            <DialogDescription>
              Selecione múltiplos arquivos PDF para enviar de uma só vez
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {isCheckingDuplicates && (
              <div className="flex items-center justify-center p-4 mb-4 bg-primary/10 rounded-lg">
                <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                <p className="text-sm">Verificando arquivos duplicados...</p>
              </div>
            )}
            
            <div className="border border-dashed border-dark-border rounded-md p-6 flex flex-col items-center justify-center bg-dark-surface-2">
              {multipleUploadFiles.length > 0 ? (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">{multipleUploadFiles.length} arquivos selecionados</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMultipleUploadFiles([])}
                    >
                      Limpar
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                    {multipleUploadFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-2 bg-dark-surface rounded"
                      >
                        <FileText className="text-primary w-4 h-4 mr-2" />
                        <div className="flex-1 truncate">{file.name}</div>
                        <div className="text-gray-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-slate-800/50 rounded-md text-xs text-slate-300">
                    <p className="font-medium mb-1">Você tem duas opções para continuar:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li><span className="text-green-400 font-medium">Recomendado:</span> Clique em "Editar Detalhes" para personalizar os metadados (título e descrição) de cada arquivo antes do upload.</li>
                      <li>Alternativa: Clique em "Enviar sem editar metadados" para fazer o upload dos arquivos com os dados extraídos automaticamente.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="multiple-pdf-upload"
                    className="hidden"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) setMultipleUploadFiles(files);
                    }}
                  />
                  <label
                    htmlFor="multiple-pdf-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FileText className="text-gray-400 w-12 h-12 mb-2" />
                    <p className="font-medium">Clique para selecionar PDFs</p>
                    <p className="text-sm text-gray-400">
                      Arraste e solte ou clique para selecionar múltiplos arquivos PDF
                    </p>
                  </label>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select 
                  defaultValue={multipleUploadCategory.toString()} 
                  onValueChange={(value) => setMultipleUploadCategory(parseInt(value))}
                >
                  <SelectTrigger className="bg-dark-surface-2 border-dark-border">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-surface-2 border-dark-border">
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="multiple-upload-is-public"
                  checked={multipleUploadIsPublic}
                  onCheckedChange={setMultipleUploadIsPublic}
                />
                <label 
                  htmlFor="multiple-upload-is-public"
                  className="text-sm font-medium cursor-pointer"
                >
                  Documentos públicos (visíveis para todos)
                </label>
              </div>
              
              {/* Opções avançadas */}
              <div className="w-full border rounded-md border-dark-border p-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Opções avançadas
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
                  >
                    {advancedOptionsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </div>
                
                {advancedOptionsOpen && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="skip-duplicates"
                        checked={skipDuplicates}
                        onCheckedChange={setSkipDuplicates}
                      />
                      <label 
                        htmlFor="skip-duplicates"
                        className="text-sm cursor-pointer"
                      >
                        Ignorar arquivos duplicados
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="use-ai-optimization"
                        checked={useAIOptimization}
                        onCheckedChange={setUseAIOptimization}
                      />
                      <label 
                        htmlFor="use-ai-optimization"
                        className="text-sm cursor-pointer"
                      >
                        Usar IA para otimizar títulos e descrições
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Prefixo para títulos</label>
                      <Input
                        value={prefixTitle}
                        onChange={(e) => setPrefixTitle(e.target.value)}
                        className="bg-dark-surface-2 border-dark-border"
                        placeholder="Ex: [Documento] ou [Livro]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Tags automáticas</label>
                      <Input
                        value={tagKeywords}
                        onChange={(e) => setTagKeywords(e.target.value)}
                        className="bg-dark-surface-2 border-dark-border"
                        placeholder="Ex: educação, material, estudo"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMultipleUploadDialogOpen(false)} 
              className="border-dark-border"
            >
              Cancelar
            </Button>
            {multipleUploadFiles.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    setIsCheckingDuplicates(true);
                    
                    try {
                      // Verificar duplicados
                      let duplicates: {file: File, existingPdf?: any}[] = [];
                      
                      for (const file of multipleUploadFiles) {
                        const result = await checkDuplicateFile(file);
                        if (result.duplicate) {
                          duplicates.push({file, existingPdf: result.existingPdf});
                        }
                      }
                      
                      setDuplicateFiles(duplicates);
                      
                      // Preparar arquivos para edição
                      const filesToEdit = await Promise.all(
                        multipleUploadFiles.map(async (file) => {
                          try {
                            const response = await fetch('/api/pdfs/extract-metadata-filename', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                filename: file.name,
                                fileSize: file.size
                              }),
                            });
                            
                            if (response.ok) {
                              const metadata = await response.json();
                              return {
                                file,
                                title: metadata.title || file.name.replace('.pdf', ''),
                                description: metadata.description || '',
                                originalName: file.name,
                                isEdited: false
                              };
                            } else {
                              return {
                                file,
                                title: file.name.replace('.pdf', ''),
                                description: '',
                                originalName: file.name,
                                isEdited: false
                              };
                            }
                          } catch (error) {
                            return {
                              file,
                              title: file.name.replace('.pdf', ''),
                              description: '',
                              originalName: file.name,
                              isEdited: false
                            };
                          }
                        })
                      );
                      
                      setEditableFiles(filesToEdit);
                      setIsMultipleUploadDialogOpen(false);
                      setIsEditFilesDialogOpen(true);
                    } catch (error) {
                      console.error('Erro ao verificar duplicados:', error);
                      toast({
                        title: "Erro",
                        description: "Não foi possível verificar duplicados. Tente novamente.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsCheckingDuplicates(false);
                    }
                  }}
                  disabled={isCheckingDuplicates}
                  className="border-dark-border"
                >
                  {isCheckingDuplicates ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verificando...
                    </>
                  ) : (
                    "Editar Detalhes"
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    uploadMultiplePdfsMutation.mutate({
                      files: multipleUploadFiles,
                      categoryId: multipleUploadCategory,
                      isPublic: multipleUploadIsPublic,
                      options: {
                        skipDuplicates,
                        useAIOptimization,
                        prefixTitle,
                        tagKeywords
                      }
                    });
                  }}
                  disabled={uploadMultiplePdfsMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {uploadMultiplePdfsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar sem editar metadados"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Files Dialog */}
      <Dialog open={isEditFilesDialogOpen} onOpenChange={setIsEditFilesDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Detalhes dos Arquivos</DialogTitle>
            <DialogDescription>
              Revise e edite os títulos e descrições dos arquivos antes do upload
            </DialogDescription>
          </DialogHeader>
          
          {editableFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Arquivo {currentEditingFileIndex + 1} de {editableFiles.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentEditingFileIndex(Math.max(0, currentEditingFileIndex - 1))}
                    disabled={currentEditingFileIndex === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentEditingFileIndex(Math.min(editableFiles.length - 1, currentEditingFileIndex + 1))}
                    disabled={currentEditingFileIndex === editableFiles.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {editableFiles[currentEditingFileIndex] && (
                <div className="space-y-4">
                  <div className="p-3 bg-dark-surface-2 rounded-md border border-dark-border">
                    <p className="text-sm font-medium mb-1">Arquivo original:</p>
                    <p className="text-sm text-gray-400">{editableFiles[currentEditingFileIndex].originalName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <Input
                      value={editableFiles[currentEditingFileIndex].title}
                      onChange={(e) => {
                        const newFiles = [...editableFiles];
                        newFiles[currentEditingFileIndex] = {
                          ...newFiles[currentEditingFileIndex],
                          title: e.target.value,
                          isEdited: true
                        };
                        setEditableFiles(newFiles);
                      }}
                      className="bg-dark-surface-2 border-dark-border"
                      placeholder="Digite o título do documento"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      value={editableFiles[currentEditingFileIndex].description}
                      onChange={(e) => {
                        const newFiles = [...editableFiles];
                        newFiles[currentEditingFileIndex] = {
                          ...newFiles[currentEditingFileIndex],
                          description: e.target.value,
                          isEdited: true
                        };
                        setEditableFiles(newFiles);
                      }}
                      className="bg-dark-surface-2 border-dark-border"
                      rows={4}
                      placeholder="Digite uma descrição para o documento"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="multiple-upload-is-public"
                      checked={multipleUploadIsPublic}
                      onCheckedChange={setMultipleUploadIsPublic}
                    />
                    <label 
                      htmlFor="multiple-upload-is-public"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Documentos públicos (visíveis para todos)
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditFilesDialogOpen(false);
                setIsMultipleUploadDialogOpen(true);
              }} 
              className="border-dark-border"
            >
              Voltar
            </Button>
            <Button 
              onClick={() => {
                // Preparar os metadados editados
                const metadata = editableFiles.map(file => ({
                  title: file.title,
                  description: file.description
                }));
                
                // Usar os arquivos originais para upload
                const files = editableFiles.map(item => item.file);
                
                // Enviar via mutação com opções avançadas
                uploadMultiplePdfsMutation.mutate({
                  files,
                  categoryId: multipleUploadCategory,
                  isPublic: multipleUploadIsPublic,
                  metadata,
                  options: {
                    skipDuplicates,
                    useAIOptimization,
                    prefixTitle,
                    tagKeywords
                  }
                });
              }}
              disabled={editableFiles.length === 0 || uploadMultiplePdfsMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {uploadMultiplePdfsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar Todos"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-dark-surface border-dark-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit 
                ? "Edite os detalhes da categoria existente" 
                : "Crie uma nova categoria para organizar os PDFs"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Categoria</label>
              <Input 
                value={categoryForm.name} 
                onChange={(e) => {
                  const newName = e.target.value;
                  setCategoryForm({
                    ...categoryForm, 
                    name: newName,
                    slug: !categoryToEdit ? generateSlug(newName) : categoryForm.slug
                  });
                }}
                className="bg-dark-surface-2 border-dark-border" 
                placeholder="Ex: Literatura, Matemática, História"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Slug (URL amigável)</label>
                <div className="text-xs text-gray-400">Gerado automaticamente</div>
              </div>
              <Input 
                value={categoryForm.slug} 
                onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                className="bg-dark-surface-2 border-dark-border font-mono" 
                placeholder="literatura"
              />
              <p className="text-xs text-gray-400 mt-1">
                Usado na URL: /categorias/<span className="font-mono">{categoryForm.slug || "nome-da-categoria"}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ícone</label>
                <CategoryIconSelect 
                  value={categoryForm.icon || "folder"} 
                  onChange={(value) => setCategoryForm({...categoryForm, icon: value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="color" 
                    value={categoryForm.color} 
                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                    className="w-12 h-10 p-1 bg-dark-surface-2 border-dark-border" 
                  />
                  <Input 
                    value={categoryForm.color} 
                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                    className="bg-dark-surface-2 border-dark-border font-mono" 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pré-visualização</label>
              <div 
                className="flex items-center gap-2 p-3 rounded-md" 
                style={{ backgroundColor: categoryForm.color + "20" }}
              >
                <div 
                  className="p-2 rounded-md" 
                  style={{ backgroundColor: categoryForm.color }}
                >
                  {renderCategoryIcon(categoryForm.icon, "h-5 w-5 text-white")}
                </div>
                <span className="font-medium">{categoryForm.name || "Nome da Categoria"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCategoryDialogOpen(false)} 
              className="border-dark-border"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (categoryToEdit) {
                  // Editar categoria existente
                  updateCategoryMutation.mutate({
                    id: categoryToEdit.id,
                    data: {
                      name: categoryForm.name,
                      slug: categoryForm.slug,
                      icon: categoryForm.icon || "folder",
                      color: categoryForm.color || "#4f46e5"
                    }
                  });
                } else {
                  // Criar nova categoria
                  createCategoryMutation.mutate({
                    name: categoryForm.name,
                    slug: categoryForm.slug,
                    icon: categoryForm.icon || "folder",
                    color: categoryForm.color || "#4f46e5"
                  });
                }
              }}
              disabled={!categoryForm.name || !categoryForm.slug || createCategoryMutation.isPending || updateCategoryMutation.isPending}
              className="bg-primary hover:bg-primary-dark"
            >
              {categoryToEdit 
                ? (updateCategoryMutation.isPending ? "Salvando..." : "Salvar Alterações")
                : (createCategoryMutation.isPending ? "Criando..." : "Criar Categoria")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Upload Único */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-dark-surface border-dark-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload de Documento</DialogTitle>
            <DialogDescription>
              Faça upload de um documento PDF para a plataforma
            </DialogDescription>
          </DialogHeader>
          <PdfUploadForm 
            onSuccess={() => {
              setIsUploadModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['/api/admin/pdfs'] });
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Função auxiliar para gerar slugs a partir de nomes
function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w\-]+/g, '') // Remove caracteres não alfanuméricos
    .replace(/\-\-+/g, '-') // Substitui múltiplos hífens por um único
    .slice(0, 80); // Limita o tamanho
}
