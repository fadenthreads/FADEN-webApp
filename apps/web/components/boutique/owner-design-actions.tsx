"use client";

import { Button } from "@faden/ui";

interface OwnerDesignActionsProps {
  designId: string;
  onEdit?: () => void;
  onDelete?: (designId: string) => void;
  compact?: boolean;
}

export function OwnerDesignActions({
  designId,
  onEdit,
  onDelete,
  compact = false,
}: OwnerDesignActionsProps) {
  return (
    <div className={`flex gap-1 ${compact ? "" : "flex-col sm:flex-row"}`}>
      {onEdit && (
        <Button
          type="button"
          size="sm"
          variant="luxury"
          className="h-8 px-2.5 text-xs"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          size="sm"
          variant="luxury-outline"
          className="h-8 px-2.5 text-xs"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete(designId);
          }}
        >
          Remove
        </Button>
      )}
    </div>
  );
}
