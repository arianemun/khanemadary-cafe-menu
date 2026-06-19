"use client";

import Image from "next/image";
import type { EventCard } from "@/lib/types";

interface EventCardsProps {
  events: EventCard[];
}

export function EventCards({ events }: EventCardsProps) {
  if (!events.length) return null;

  return (
    <section className="bg-card py-4">
      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="min-w-[260px] shrink-0 overflow-hidden rounded-card border border-border bg-muted shadow-card"
          >
            {event.image && (
              <div className="relative h-32 w-full">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-3">
              <h3 className="font-bold">{event.title}</h3>
              <p className="mt-1 text-xs text-secondary-text">{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
