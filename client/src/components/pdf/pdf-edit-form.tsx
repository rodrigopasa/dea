import { useState, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category, Pdf, InsertPdf } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, FileText, Camera, Upload, X } from "lucide-react";

// Schemas para edição de PDF
// Schema base sem o campo de slug (para usuários normais)
const baseEditPdfSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string(),
  categoryId: z.coerce.number().min(1, "Categoria é obrigatória"),
  isPublic: z.boolean().default(true),
});

// Schema para administradores (inclui o campo slug)
const adminEditPdfSchema = baseEditPdfSchema.extend({
  slug: z.string().min(1, "URL é obrigatória").regex(/^[a-z0-9-]+$/, {
    message: "A URL só pode conter letras minúsculas, números e hífens"
  }),
});

// Schema condicional que será usado com base no tipo de usuário
let editPdfSchema = baseEditPdfSchema;

type EditPdfValues = z.infer<typeof adminEditPdfSchema>;

interface PdfEditFormProps {
  pdf: Pdf;
  onSuccess: () => void;
}

export default function PdfEditForm({ pdf, onSuccess }: PdfEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  
  // Determinar qual schema usar com base no tipo de usuário
  const schema = user?.isAdmin ? adminEditPdfSchema : baseEditPdfSchema;
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Form setup
  const form = useForm<EditPdfValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: pdf.title || "",
      description: pdf.description || "",
      slug: pdf.slug || "",
      categoryId: pdf.categoryId || 0,
      isPublic: pdf.isPublic ?? true,
    },
  });
  
  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setCoverImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove cover image
  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview("");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Edit PDF mutation
  const editPdfMutation = useMutation({
    mutationFn: async (data: EditPdfValues) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add cover image if selected
      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      }
      
      const response = await fetch(`/api/pdfs/${pdf.id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao editar PDF');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/pdfs/${pdf.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      // Invalidar também a rota por slug caso o slug tenha sido alterado
      if (pdf.slug) {
        queryClient.invalidateQueries({ queryKey: [`/api/pdfs/slug/${pdf.slug}`] });
      }
      toast({
        title: "PDF atualizado",
        description: "O documento foi atualizado com sucesso.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: EditPdfValues) => {
    // Se o usuário não for administrador, remover o campo slug para evitar erros
    if (!user?.isAdmin && data.slug !== undefined) {
      // Criar uma nova versão dos dados sem o campo slug
      const { slug, ...dataWithoutSlug } = data;
      editPdfMutation.mutate(dataWithoutSlug);
    } else {
      editPdfMutation.mutate(data);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* PDF Cover Image with Upload Option */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-20 bg-dark-surface-2 rounded mr-3 overflow-hidden relative group">
            {coverImagePreview ? (
              <img 
                src={coverImagePreview} 
                alt={`Capa de ${pdf.title}`} 
                className="w-full h-full object-cover" 
              />
            ) : pdf.coverImage ? (
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
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white w-4 h-4" />
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm">{pdf.filePath?.split("/").pop()}</h3>
            <p className="text-sm text-gray-400">
              {pdf.pageCount} {pdf.pageCount === 1 ? "página" : "páginas"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="mt-2 text-xs h-6 border-dark-border"
            >
              <Upload className="w-3 h-3 mr-1" />
              Alterar Capa
            </Button>
            {coverImageFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeCoverImage}
                className="ml-2 mt-2 text-xs h-6 border-dark-border text-red-400 hover:text-red-300"
              >
                <X className="w-3 h-3 mr-1" />
                Remover
              </Button>
            )}
          </div>
        </div>
        
        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do documento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite uma descrição para o documento" 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormDescription>
                Uma breve descrição do conteúdo do documento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Slug Field (URL) - only for admins */}
        {user?.isAdmin && (
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL personalizada</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-sm whitespace-nowrap">/pdf/</span>
                    <Input 
                      placeholder="url-do-documento" 
                      {...field} 
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  URL amigável para acesso ao documento. Use apenas letras minúsculas, números e hífens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Category Field */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
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
              </FormControl>
              <FormDescription>
                Escolha a categoria que melhor se relaciona com o conteúdo do documento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Public/Private Field */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-dark-border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visibilidade</FormLabel>
                <FormDescription>
                  Tornar este documento visível para todos os usuários
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            className="border-dark-border"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={editPdfMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {editPdfMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}