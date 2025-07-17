import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { CategoryIconSelect } from "./category-icon-select";
import { ColorPicker } from "./color-picker";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renderCategoryIcon } from "./category-icon-select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  slug: z.string().min(2, { message: "Slug deve ter pelo menos 2 caracteres" }).regex(/^[a-z0-9-]+$/, {
    message: "Slug deve conter apenas letras minúsculas, números e hífens",
  }),
  icon: z.string(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, {
    message: "Cor deve ser um código HEX válido",
  }),
});

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
}: EditCategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      icon: category?.icon || "folder",
      color: category?.color || "#4f46e5",
    },
  });

  // Atualiza o formulário quando a categoria muda
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        icon: category.icon || "folder",
        color: category.color || "#4f46e5",
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        icon: "folder",
        color: "#4f46e5",
      });
    }
  }, [category, form]);

  // Atualiza o slug automaticamente quando o nome muda (apenas quando estiver criando uma nova categoria)
  useEffect(() => {
    if (!isEditing) {
      const subscription = form.watch((value, { name }) => {
        if (name === "name") {
          const slug = value.name
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
          form.setValue("slug", slug || "", { shouldValidate: true });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [form, isEditing]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Não foi possível criar a categoria",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("PUT", `/api/categories/${category?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${category?.id}`] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message || "Não foi possível atualizar a categoria",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (isEditing) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes da categoria selecionada."
              : "Crie uma nova categoria para organizar seus PDFs."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Nome da categoria"
                      className="bg-dark-surface-2 border-dark-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="slug-da-categoria"
                      className="bg-dark-surface-2 border-dark-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <FormControl>
                      <CategoryIconSelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <ColorPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <div className="text-sm font-medium mb-2">Pré-visualização:</div>
              <div 
                className="flex items-center gap-2 p-3 rounded-md" 
                style={{ backgroundColor: form.watch("color") + "20" }}
              >
                <div 
                  className="p-2 rounded-md" 
                  style={{ backgroundColor: form.watch("color") }}
                >
                  {renderCategoryIcon(form.watch("icon"), "h-5 w-5 text-white")}
                </div>
                <span className="font-medium">{form.watch("name") || "Nome da Categoria"}</span>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-dark-border"
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                  ? "Salvando..." 
                  : isEditing 
                    ? "Salvar Alterações" 
                    : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}