"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

export function Label({ 
  className = "", 
  ...props 
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
} 