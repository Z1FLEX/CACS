import { IconInbox } from '@tabler/icons-react'

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
}

export function EmptyState({ title, description, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center ${className}`}
      role="status"
      aria-label="Empty state"
    >
      <IconInbox className="h-12 w-12 text-muted-foreground/50" stroke={1.5} />
      <h3 className="mt-3 text-sm font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  )
}
