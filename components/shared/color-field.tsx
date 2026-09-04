"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ============================================================================
// Hex color field: native color picker + text input kept in sync.
// ============================================================================

const PRESETS = [
  "#0d9488",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#6b7280",
]

export function ColorField({
  id,
  value,
  onChange,
  error,
  disabled,
}: {
  id: string
  value: string
  onChange: (next: string) => void
  error?: string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Color</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label="Selector de color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#6b7280"}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="size-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#0d9488"
          maxLength={7}
          aria-invalid={!!error}
          disabled={disabled}
          className="font-mono uppercase"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Usar color ${c}`}
            onClick={() => onChange(c)}
            disabled={disabled}
            className={cn(
              "size-6 rounded-full border border-border transition-transform hover:scale-110",
              value.toLowerCase() === c && "ring-2 ring-ring ring-offset-2",
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
