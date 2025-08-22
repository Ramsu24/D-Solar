import * as React from "react"

export function Alert({ 
  className = "", 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${className}`}
      {...props}
    />
  )
}

export function AlertTitle({ 
  className = "", 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  )
}

export function AlertDescription({ 
  className = "", 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={`text-sm font-medium ${className}`}
      {...props}
    />
  )
} 