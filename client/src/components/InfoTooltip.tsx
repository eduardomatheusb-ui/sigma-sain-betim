import { useState, useRef, useEffect, useId } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
  /** Tamanho do ícone em pixels (padrão: 14) */
  size?: number;
  /** Posição preferida do tooltip (padrão: "top") */
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * InfoTooltip — ícone (i) com tooltip de ajuda contextual.
 *
 * Comportamento:
 * - Desktop: abre no hover e no foco por teclado
 * - Mobile: abre/fecha no tap
 * - Fecha ao pressionar Escape ou ao perder foco
 * - Totalmente acessível: role="tooltip", aria-describedby, foco por teclado
 */
export function InfoTooltip({ text, size = 14, position = "top" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Fecha ao pressionar Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Fecha ao clicar fora (mobile)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        aria-label="Informação sobre este indicador"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-primary focus:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors cursor-help"
        style={{ width: size + 4, height: size + 4 }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Info style={{ width: size, height: size }} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 w-64 rounded-md bg-gray-800 px-3 py-2 text-xs text-white shadow-lg ${positionClasses[position]}`}
        >
          {text}
          {/* Seta decorativa */}
          <span
            className={`absolute border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
}
