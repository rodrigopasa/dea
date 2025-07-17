import React from 'react';
import { Comment } from '@shared/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PdfCommentProps {
  comment: Comment;
  currentUserId?: number;
  isAdmin: boolean;
  onReplyClick?: (commentId: number) => void;
}

/**
 * Componente de Comentário de PDF desativado.
 * Esta implementação é um placeholder após a remoção da funcionalidade de comentários colaborativos.
 */
export function PdfComment({ comment }: PdfCommentProps) {
  // Formata a data de criação para exibição, se disponível
  const formattedDate = comment.createdAt 
    ? format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    : '';

  // Este componente agora é apenas um esboço, não tem funcionalidade real
  return (
    <Card className="mb-3 border">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Usuário</p>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <p className="text-sm">{comment.content}</p>
      </CardContent>
    </Card>
  );
}