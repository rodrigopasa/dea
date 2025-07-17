import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as Fi from "react-icons/fi";

// Estrutura para o mapeamento de ícones
const icons = [
  { value: "folder", label: "Pasta", icon: <Fi.FiFolder className="mr-2 h-5 w-5" /> },
  { value: "book", label: "Livro", icon: <Fi.FiBook className="mr-2 h-5 w-5" /> },
  { value: "book-open", label: "Livro Aberto", icon: <Fi.FiBookOpen className="mr-2 h-5 w-5" /> },
  { value: "file-text", label: "Documento", icon: <Fi.FiFileText className="mr-2 h-5 w-5" /> },
  { value: "edit", label: "Editar", icon: <Fi.FiEdit className="mr-2 h-5 w-5" /> },
  { value: "briefcase", label: "Pasta de Trabalho", icon: <Fi.FiBriefcase className="mr-2 h-5 w-5" /> },
  { value: "music", label: "Música", icon: <Fi.FiMusic className="mr-2 h-5 w-5" /> },
  { value: "image", label: "Imagem", icon: <Fi.FiImage className="mr-2 h-5 w-5" /> },
  { value: "video", label: "Vídeo", icon: <Fi.FiVideo className="mr-2 h-5 w-5" /> },
  { value: "code", label: "Código", icon: <Fi.FiCode className="mr-2 h-5 w-5" /> },
  { value: "database", label: "Banco de Dados", icon: <Fi.FiDatabase className="mr-2 h-5 w-5" /> },
  { value: "globe", label: "Global", icon: <Fi.FiGlobe className="mr-2 h-5 w-5" /> },
  { value: "hash", label: "Hashtag", icon: <Fi.FiHash className="mr-2 h-5 w-5" /> },
  { value: "heart", label: "Coração", icon: <Fi.FiHeart className="mr-2 h-5 w-5" /> },
  { value: "layers", label: "Camadas", icon: <Fi.FiLayers className="mr-2 h-5 w-5" /> },
  { value: "map", label: "Mapa", icon: <Fi.FiMap className="mr-2 h-5 w-5" /> },
  { value: "package", label: "Pacote", icon: <Fi.FiPackage className="mr-2 h-5 w-5" /> },
  { value: "pie-chart", label: "Gráfico", icon: <Fi.FiPieChart className="mr-2 h-5 w-5" /> },
  { value: "star", label: "Estrela", icon: <Fi.FiStar className="mr-2 h-5 w-5" /> },
  { value: "tag", label: "Etiqueta", icon: <Fi.FiTag className="mr-2 h-5 w-5" /> },
  { value: "trending-up", label: "Tendência", icon: <Fi.FiTrendingUp className="mr-2 h-5 w-5" /> },
  { value: "tv", label: "TV", icon: <Fi.FiTv className="mr-2 h-5 w-5" /> },
  { value: "users", label: "Usuários", icon: <Fi.FiUsers className="mr-2 h-5 w-5" /> },
  { value: "zap", label: "Raio", icon: <Fi.FiZap className="mr-2 h-5 w-5" /> },
  { value: "clipboard", label: "Prancheta", icon: <Fi.FiClipboard className="mr-2 h-5 w-5" /> },
  { value: "cpu", label: "CPU", icon: <Fi.FiCpu className="mr-2 h-5 w-5" /> },
  { value: "message-circle", label: "Mensagem", icon: <Fi.FiMessageCircle className="mr-2 h-5 w-5" /> },
  { value: "pen-tool", label: "Caneta", icon: <Fi.FiPenTool className="mr-2 h-5 w-5" /> },
  { value: "rss", label: "RSS", icon: <Fi.FiRss className="mr-2 h-5 w-5" /> },
  { value: "terminal", label: "Terminal", icon: <Fi.FiTerminal className="mr-2 h-5 w-5" /> },
  { value: "tool", label: "Ferramenta", icon: <Fi.FiTool className="mr-2 h-5 w-5" /> },
  { value: "user", label: "Usuário", icon: <Fi.FiUser className="mr-2 h-5 w-5" /> },
  { value: "award", label: "Prêmio", icon: <Fi.FiAward className="mr-2 h-5 w-5" /> },
  { value: "compass", label: "Bússola", icon: <Fi.FiCompass className="mr-2 h-5 w-5" /> },
  { value: "settings", label: "Configurações", icon: <Fi.FiSettings className="mr-2 h-5 w-5" /> },
  { value: "shield", label: "Escudo", icon: <Fi.FiShield className="mr-2 h-5 w-5" /> },
  { value: "shopping-bag", label: "Sacola", icon: <Fi.FiShoppingBag className="mr-2 h-5 w-5" /> },
  { value: "shopping-cart", label: "Carrinho", icon: <Fi.FiShoppingCart className="mr-2 h-5 w-5" /> },
  { value: "truck", label: "Caminhão", icon: <Fi.FiTruck className="mr-2 h-5 w-5" /> },
  { value: "home", label: "Casa", icon: <Fi.FiHome className="mr-2 h-5 w-5" /> },
  { value: "calendar", label: "Calendário", icon: <Fi.FiCalendar className="mr-2 h-5 w-5" /> },
  { value: "camera", label: "Câmera", icon: <Fi.FiCamera className="mr-2 h-5 w-5" /> },
  { value: "cloud", label: "Nuvem", icon: <Fi.FiCloud className="mr-2 h-5 w-5" /> },
  { value: "coffee", label: "Café", icon: <Fi.FiCoffee className="mr-2 h-5 w-5" /> },
  { value: "download", label: "Download", icon: <Fi.FiDownload className="mr-2 h-5 w-5" /> },
  { value: "flag", label: "Bandeira", icon: <Fi.FiFlag className="mr-2 h-5 w-5" /> },
  { value: "gift", label: "Presente", icon: <Fi.FiGift className="mr-2 h-5 w-5" /> },
  { value: "headphones", label: "Fones", icon: <Fi.FiHeadphones className="mr-2 h-5 w-5" /> },
  { value: "lock", label: "Cadeado", icon: <Fi.FiLock className="mr-2 h-5 w-5" /> },
  { value: "mail", label: "E-mail", icon: <Fi.FiMail className="mr-2 h-5 w-5" /> },
  { value: "moon", label: "Lua", icon: <Fi.FiMoon className="mr-2 h-5 w-5" /> },
  { value: "phone", label: "Telefone", icon: <Fi.FiPhone className="mr-2 h-5 w-5" /> },
  { value: "printer", label: "Impressora", icon: <Fi.FiPrinter className="mr-2 h-5 w-5" /> },
  { value: "scissors", label: "Tesoura", icon: <Fi.FiScissors className="mr-2 h-5 w-5" /> },
  { value: "sun", label: "Sol", icon: <Fi.FiSun className="mr-2 h-5 w-5" /> },
  { value: "target", label: "Alvo", icon: <Fi.FiTarget className="mr-2 h-5 w-5" /> },
  { value: "thumbs-up", label: "Curtir", icon: <Fi.FiThumbsUp className="mr-2 h-5 w-5" /> },
  { value: "umbrella", label: "Guarda-chuva", icon: <Fi.FiUmbrella className="mr-2 h-5 w-5" /> },
  { value: "wifi", label: "Wi-Fi", icon: <Fi.FiWifi className="mr-2 h-5 w-5" /> },
  { value: "archive", label: "Arquivo", icon: <Fi.FiArchive className="mr-2 h-5 w-5" /> },
  { value: "server", label: "Servidor", icon: <Fi.FiServer className="mr-2 h-5 w-5" /> },
  { value: "speaker", label: "Alto-falante", icon: <Fi.FiSpeaker className="mr-2 h-5 w-5" /> },
  { value: "monitor", label: "Monitor", icon: <Fi.FiMonitor className="mr-2 h-5 w-5" /> },
  { value: "git-branch", label: "Ramificação Git", icon: <Fi.FiGitBranch className="mr-2 h-5 w-5" /> },
  { value: "film", label: "Filme", icon: <Fi.FiFilm className="mr-2 h-5 w-5" /> },
  { value: "slack", label: "Slack", icon: <Fi.FiSlack className="mr-2 h-5 w-5" /> },
  { value: "pocket", label: "Bolso", icon: <Fi.FiPocket className="mr-2 h-5 w-5" /> },
];

// Cria um objeto para procurar ícones por valor
const iconLookup = icons.reduce((acc, icon) => {
  acc[icon.value] = icon;
  return acc;
}, {} as Record<string, typeof icons[0]>);

interface CategoryIconSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryIconSelect({ value, onChange }: CategoryIconSelectProps) {
  const [open, setOpen] = useState(false);
  
  const selectedIcon = iconLookup[value] || iconLookup.folder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-dark-surface-2 border-dark-border text-white"
        >
          <div className="flex items-center">
            {selectedIcon.icon}
            <span>{selectedIcon.label}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-dark-surface-2 border-dark-border w-[250px]">
        <Command className="bg-dark-surface-2">
          <CommandInput placeholder="Buscar ícone..." className="h-9 bg-dark-surface text-white border-dark-border" />
          <CommandEmpty className="text-gray-400">Nenhum ícone encontrado.</CommandEmpty>
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {icons.map((icon) => (
                <CommandItem
                  key={icon.value}
                  value={icon.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  className="flex items-center cursor-pointer hover:bg-dark-surface text-white data-[highlighted]:bg-dark-surface data-[highlighted]:text-white"
                >
                  {icon.icon}
                  <span>{icon.label}</span>
                  {value === icon.value && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Função auxiliar para renderizar ícone com base no valor
export function renderCategoryIcon(iconName: string, className = "h-5 w-5") {
  const IconComponent = {
    folder: Fi.FiFolder,
    book: Fi.FiBook,
    "book-open": Fi.FiBookOpen,
    "file-text": Fi.FiFileText,
    edit: Fi.FiEdit,
    briefcase: Fi.FiBriefcase,
    music: Fi.FiMusic,
    image: Fi.FiImage,
    video: Fi.FiVideo,
    code: Fi.FiCode,
    database: Fi.FiDatabase,
    globe: Fi.FiGlobe,
    hash: Fi.FiHash,
    heart: Fi.FiHeart,
    layers: Fi.FiLayers,
    map: Fi.FiMap,
    package: Fi.FiPackage,
    "pie-chart": Fi.FiPieChart,
    star: Fi.FiStar,
    tag: Fi.FiTag,
    "trending-up": Fi.FiTrendingUp,
    tv: Fi.FiTv,
    users: Fi.FiUsers,
    zap: Fi.FiZap,
    clipboard: Fi.FiClipboard,
    cpu: Fi.FiCpu,
    "message-circle": Fi.FiMessageCircle,
    "pen-tool": Fi.FiPenTool,
    rss: Fi.FiRss,
    terminal: Fi.FiTerminal,
    tool: Fi.FiTool,
    user: Fi.FiUser,
    award: Fi.FiAward,
    compass: Fi.FiCompass,
    settings: Fi.FiSettings,
    shield: Fi.FiShield,
    "shopping-bag": Fi.FiShoppingBag,
    "shopping-cart": Fi.FiShoppingCart,
    truck: Fi.FiTruck,
    home: Fi.FiHome,
    calendar: Fi.FiCalendar,
    camera: Fi.FiCamera,
    cloud: Fi.FiCloud,
    coffee: Fi.FiCoffee,
    download: Fi.FiDownload,
    flag: Fi.FiFlag,
    gift: Fi.FiGift,
    headphones: Fi.FiHeadphones,
    lock: Fi.FiLock,
    mail: Fi.FiMail,
    moon: Fi.FiMoon,
    phone: Fi.FiPhone,
    printer: Fi.FiPrinter,
    scissors: Fi.FiScissors,
    sun: Fi.FiSun,
    target: Fi.FiTarget,
    "thumbs-up": Fi.FiThumbsUp,
    umbrella: Fi.FiUmbrella,
    wifi: Fi.FiWifi,
    archive: Fi.FiArchive,
    server: Fi.FiServer,
    speaker: Fi.FiSpeaker,
    monitor: Fi.FiMonitor,
    "git-branch": Fi.FiGitBranch,
    film: Fi.FiFilm,
    slack: Fi.FiSlack,
    pocket: Fi.FiPocket,
  }[iconName] || Fi.FiFolder;

  return <IconComponent className={className} />;
}