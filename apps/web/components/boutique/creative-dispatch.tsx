"use client";

import { Plus } from "lucide-react";
import { Button } from "@faden/ui";
import { motion } from "framer-motion";
import type { CreativePiece } from "@/data/boutique-profiles";
import { OwnerDesignActions } from "@/components/boutique/owner-design-actions";

interface CreativeDispatchProps {
  pieces: CreativePiece[];
  ownerMode?: boolean;
  onAddPiece?: () => void;
  onEditPiece?: (piece: CreativePiece) => void;
  onDeletePiece?: (pieceId: string) => void;
}

export function CreativeDispatch({
  pieces,
  ownerMode = false,
  onAddPiece,
  onEditPiece,
  onDeletePiece,
}: CreativeDispatchProps) {
  return (
    <section className="border-t border-border py-section-gap" aria-labelledby="creative-dispatch-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="creative-dispatch-heading" className="font-display text-2xl font-semibold">
            Creative Dispatch
          </h2>
          <p className="mt-2 text-foreground-muted">
            {ownerMode
              ? "Passion projects and skill showcases — add pieces that demonstrate your artistry."
              : "Passion projects and skill showcases — pieces made purely to demonstrate artistry."}
          </p>
        </div>
        {ownerMode && onAddPiece && (
          <Button type="button" variant="luxury-outline" size="sm" onClick={onAddPiece}>
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Add piece
          </Button>
        )}
      </div>

      {pieces.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-foreground-muted">
            {ownerMode
              ? "No creative dispatch pieces yet."
              : "No creative dispatch pieces listed yet."}
          </p>
          {ownerMode && onAddPiece && (
            <button
              type="button"
              onClick={onAddPiece}
              className="mt-3 text-sm font-medium text-gold hover:text-gold-light"
            >
              Add your first showcase piece →
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pieces.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background-elevated"
            >
              {ownerMode && (onEditPiece || onDeletePiece) && (
                <div className="absolute right-3 top-3 z-10">
                  <OwnerDesignActions
                    designId={item.id}
                    onEdit={onEditPiece ? () => onEditPiece(item) : undefined}
                    onDelete={onDeletePiece}
                  />
                </div>
              )}
              <div
                className={`h-44 bg-gradient-to-br ${item.gradient}`}
                style={
                  item.imageUrl
                    ? {
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="p-4">
                <span className="text-[10px] font-medium tracking-wider text-gold">
                  {item.tag.toUpperCase()}
                </span>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
