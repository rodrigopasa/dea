import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Lista de cores predefinidas
const presetColors = [
  "#4f46e5", // Indigo
  "#2563eb", // Blue
  "#0891b2", // Cyan
  "#0d9488", // Teal
  "#16a34a", // Green
  "#65a30d", // Lime
  "#ca8a04", // Yellow
  "#d97706", // Amber
  "#ea580c", // Orange
  "#dc2626", // Red
  "#e11d48", // Rose
  "#be185d", // Pink
  "#9333ea", // Purple
  "#7c3aed", // Violet
  "#4b5563", // Gray
  "#1e293b", // Slate
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);

  // Atualiza a cor temporária quando o valor muda
  useEffect(() => {
    setTempColor(value);
  }, [value]);

  const handleSelectColor = (color: string) => {
    setTempColor(color);
    onChange(color);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-10 px-3 justify-between"
        >
          <div className="flex items-center">
            <div
              className="h-6 w-6 rounded-md mr-2"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3 bg-dark-surface border-dark-border">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">Selecionar cor</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="flex-1 h-10 px-3 py-2 bg-dark-surface-2 border border-dark-border rounded-md"
              />
              <Button 
                variant="secondary" 
                onClick={() => handleSelectColor(tempColor)}
                className="h-10 px-3"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Cores predefinidas</div>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-7 w-7 rounded-md border border-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  style={{ backgroundColor: color }}
                  onClick={() => handleSelectColor(color)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}