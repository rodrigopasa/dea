import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface PdfUploadFormProps {
  onSuccess?: () => void;
}

interface PdfMetadata {
  title: string;
  description: string;
  pageCount?: number;
  slug?: string;
  extractedText?: string;
}

const UploadFormSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  // A descrição é opcional e não tem requisito de tamanho mínimo, será extraída automaticamente se não fornecida
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: "Selecione uma categoria" }),
  isPublic: z.boolean().default(true),
});

export default function PdfUploadForm({ onSuccess }: PdfUploadFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<PdfMetadata | null>(null);
  
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const form = useForm<z.infer<typeof UploadFormSchema>>({
    resolver: zodResolver(UploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      isPublic: true,
    },
  });
  
  // Atualiza o formulário quando os metadados extraídos mudam
  useEffect(() => {
    if (extractedMetadata) {
      form.setValue("title", extractedMetadata.title);
      form.setValue("description", extractedMetadata.description);
    }
  }, [extractedMetadata, form]);
  
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/pdfs/upload", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        let errorMessage = "Erro ao fazer upload do PDF";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Se não conseguir parsear JSON, usar mensagem padrão
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/pdfs"] });
      
      toast({
        title: "Upload concluído",
        description: "Seu PDF foi enviado com sucesso.",
      });
      
      // Reset form
      form.reset();
      setFile(null);
      setExtractedMetadata(null);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função para verificar duplicação de arquivo
  const checkDuplicate = async (pdfFile: File): Promise<boolean> => {
    setIsCheckingDuplicate(true);
    setIsDuplicate(false);
    setDuplicateInfo(null);
    
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      
      const response = await fetch("/api/pdfs/check-duplicate", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      const result = await response.json();
      
      if (result.duplicate) {
        setIsDuplicate(true);
        setDuplicateInfo(result.existingPdf);
        
        toast({
          title: "PDF duplicado detectado",
          description: "Este arquivo já existe no sistema e não pode ser enviado novamente.",
          variant: "destructive",
        });
        
        // Reset formulário
        removeFile();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao verificar duplicação:", error);
      return false;
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Função para extrair metadados do PDF
  const extractPdfMetadata = async (pdfFile: File) => {
    setIsExtracting(true);
    
    try {
      // Primeiro, verifica se o arquivo é duplicado
      const isDup = await checkDuplicate(pdfFile);
      if (isDup) {
        // Se for duplicado, não continua com a extração
        setIsExtracting(false);
        return;
      }
      
      const formData = new FormData();
      formData.append("file", pdfFile);
      
      const response = await fetch("/api/pdfs/extract-metadata", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao extrair metadados do PDF");
      }
      
      const metadata = await response.json();
      setExtractedMetadata(metadata);
      
      // Atualiza os campos do formulário com os metadados extraídos
      form.setValue("title", metadata.title);
      form.setValue("description", metadata.description);
      
      toast({
        title: "Metadados extraídos",
        description: "Título e descrição foram extraídos do PDF automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao extrair metadados:", error);
      toast({
        title: "Erro na extração",
        description: error instanceof Error ? error.message : "Erro ao extrair informações do PDF",
        variant: "destructive",
      });
      // Se ocorreu um erro na extração, remove o arquivo
      removeFile();
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo do arquivo é 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Extrai metadados do PDF automaticamente
      extractPdfMetadata(selectedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type !== "application/pdf") {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      
      // Extrai metadados do PDF automaticamente
      extractPdfMetadata(droppedFile);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const removeFile = () => {
    setFile(null);
    setExtractedMetadata(null);
    form.reset({
      title: "",
      description: "",
      categoryId: form.getValues("categoryId"),
      isPublic: form.getValues("isPublic"),
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const onSubmit = (values: z.infer<typeof UploadFormSchema>) => {
    if (!file) {
      toast({
        title: "Arquivo não selecionado",
        description: "Por favor, selecione um arquivo PDF para upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para fazer upload de arquivos.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    formData.append("categoryId", values.categoryId);
    formData.append("isPublic", values.isPublic.toString());
    
    uploadMutation.mutate(formData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!file ? (
          <div 
            className={`drop-zone w-full h-64 rounded-lg flex flex-col items-center justify-center mb-4 ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="text-primary w-12 h-12 mb-3" />
            <p className="text-center mb-2">Arraste e solte seu arquivo PDF aqui</p>
            <p className="text-gray-400 text-sm mb-4">ou</p>
            <Button type="button" className="bg-primary hover:bg-primary-dark text-white">
              Selecionar arquivo
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="application/pdf"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="bg-dark-surface-2 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="w-16 h-20 bg-dark-surface rounded overflow-hidden mr-4 flex-shrink-0 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-medium truncate">{file.name}</h3>
                <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {isExtracting && (
          <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg mb-4">
            <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
            <p className="text-sm">Extraindo informações do PDF...</p>
          </div>
        )}
        
        {file && !isExtracting && (
          <div className="p-3 bg-slate-800/50 rounded-md text-xs text-slate-300 mb-4">
            <p className="font-medium mb-1">Instruções para publicação:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Verifique e edite os metadados (título e descrição) abaixo conforme necessário.</li>
              <li>Selecione uma categoria apropriada para o documento.</li>
              <li>Clique em "Publicar documento" para enviar o PDF.</li>
            </ol>
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input 
                  placeholder={isExtracting ? "Extraindo título..." : "Título do documento"} 
                  {...field} 
                  className="bg-dark-surface-2 border-dark-border" 
                  disabled={isExtracting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isExtracting ? "Extraindo descrição..." : "Descrição do documento"} 
                  rows={4} 
                  {...field} 
                  className="bg-dark-surface-2 border-dark-border"
                  disabled={isExtracting}
                />
              </FormControl>
              {extractedMetadata && (
                <p className="text-xs text-muted-foreground">
                  Informações extraídas automaticamente do PDF. Você pode editá-las conforme necessário.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-dark-surface-2 border-dark-border">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-dark-surface-2 border-dark-border">
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>Carregando categorias...</SelectItem>
                  ) : (
                    categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-dark-border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Visibilidade</FormLabel>
                  <div className="text-sm text-gray-400">
                    {field.value 
                      ? "Todos podem ver e baixar este documento" 
                      : "Apenas você pode ver este documento"}
                  </div>
                </div>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isPublic" className={field.value ? "text-success" : "text-gray-400"}>
                      {field.value ? "Público" : "Privado"}
                    </Label>
                    <Switch
                      id="isPublic"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            className="border-dark-border hover:bg-dark-surface-2"
          >
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              "Enviando..."
            ) : (
              <>Publicar documento</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
