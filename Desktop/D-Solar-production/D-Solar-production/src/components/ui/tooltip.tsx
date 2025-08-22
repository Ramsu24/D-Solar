import * as React from "react"
import { useState } from "react"

type TooltipProviderProps = {
  children: React.ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

type TooltipProps = {
  children: React.ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  return <span className="relative inline-block">{children}</span>
}

type TooltipTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
}

export function TooltipTrigger({ 
  asChild, 
  children,
  ...props 
}: TooltipTriggerProps & React.HTMLAttributes<HTMLDivElement>) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div 
      className="inline-block cursor-help"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      data-hover={isHovering ? "true" : "false"}
      {...props}
    >
      {children}
    </div>
  )
}

type TooltipContentProps = {
  children: React.ReactNode;
}

export function TooltipContent({ 
  children,
  ...props 
}: TooltipContentProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className="absolute z-50 max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 pointer-events-none transition-opacity duration-300 -translate-y-2 left-1/2 -translate-x-1/2 top-0 transform"
      style={{
        opacity: "var(--tooltip-opacity, 0)",
        transform: "translate(-50%, calc(-100% - 10px))",
      }}
      {...props}
    >
      {children}
      <div 
        className="absolute w-2 h-2 bg-gray-900 transform rotate-45" 
        style={{ bottom: '-4px', left: 'calc(50% - 4px)' }}
      />
    </div>
  )
}

// Add CSS to manage tooltip visibility
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    [data-hover="true"] + div {
      --tooltip-opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
} 