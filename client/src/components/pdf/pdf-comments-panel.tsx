import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface PdfCommentsPanelProps {
  pdfId: number;
  currentPage: number;
  currentUserId?: number;
  isAdmin: boolean;
}

/**
 * Componente de Comentários de PDF desativado.
 * Esta implementação é um placeholder após a remoção da funcionalidade de comentários colaborativos.
 */
export function PdfCommentsPanel({ pdfId, currentPage, currentUserId, isAdmin }: PdfCommentsPanelProps) {
  return (
    <div className="bg-white rounded-md shadow-sm border p-4 h-full flex flex-col">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <MessageCircle className="h-5 w-5 mr-2" />
        Comentários
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-8">
        <p className="text-center mb-2">Funcionalidade de comentários desativada.</p>
        <p className="text-center text-sm">Esta função não está disponível nesta versão do aplicativo.</p>
      </div>
      
      {currentUserId ? (
        <div className="mt-auto border-t pt-4">
          <Button
            disabled={true}
            className="w-full"
          >
            Comentários desativados
          </Button>
        </div>
      ) : (
        <div className="mt-auto text-center py-4 text-gray-500 border-t">
          <p>Faça login para utilizar recursos adicionais.</p>
        </div>
      )}
    </div>
  );
}