import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

export function Select({
  children,
  ...props
}: SelectPrimitive.Root.Props<any>) {
  return (
    <SelectPrimitive.Root {...props}>
      {children}
    </SelectPrimitive.Root>
  )
}

export function SelectGroup({
  className,
  ...props
}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      className={cn("p-1", className)}
      {...props}
    />
  )
}

export function SelectValue({
  className,
  placeholder,
  ...props
}: SelectPrimitive.Value.Props & { placeholder?: string }) {
  return (
    <SelectPrimitive.Value
      placeholder={placeholder}
      className={cn("flex flex-1 text-left truncate text-sm text-foreground", className)}
      {...props}
    />
  )
}

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-transparent py-2 px-3 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-10 cursor-pointer text-white",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-slate-400 shrink-0" />
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: SelectPrimitive.Popup.Props & { align?: any, sideOffset?: number }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="isolate z-[9999] min-w-[var(--anchor-width)]"
        sideOffset={6}
      >
        <SelectPrimitive.Popup
          className={cn(
            "z-[9999] max-h-60 w-full min-w-[180px] overflow-x-hidden overflow-y-auto rounded-xl bg-[#0e1015] border border-slate-800 text-white shadow-2xl backdrop-blur-md p-1.5 space-y-1 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

export function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn("px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest", className)}
      {...props}
    />
  )
}

export function SelectItem({
  className,
  value,
  children,
  ...props
}: SelectPrimitive.Item.Props & { value: string }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 px-3 text-xs font-medium outline-none select-none hover:bg-white/5 hover:text-white transition-colors text-slate-300 data-[selected]:bg-primary data-[selected]:text-black data-[selected]:hover:bg-primary/90 data-[selected]:hover:text-black data-[selected]:font-bold",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="size-4 shrink-0 text-current">
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      className={cn("h-px bg-slate-800 my-1", className)}
      {...props}
    />
  )
}

export function SelectScrollUpButton() { return null; }
export function SelectScrollDownButton() { return null; }
