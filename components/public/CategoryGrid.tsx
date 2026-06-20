"use client";

import { FadeInImage } from "@/components/FadeInImage";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: string) => void;
}

interface CategoryTileProps {
  category: Category;
  onSelect: (id: string) => void;
  tall?: boolean;
  className?: string;
}

function CategoryTile({ category, onSelect, tall = false, className = "" }: CategoryTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={[
        "group relative flex flex-col overflow-hidden rounded-none bg-muted text-right",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:z-10 hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(0,0,0,0.14)]",
        "active:scale-[0.99]",
        tall ? "min-h-[300px] sm:min-h-[340px]" : "min-h-[148px] sm:min-h-[168px]",
        className,
      ].join(" ")}
    >
      <div className="shrink-0 px-3 pb-1 pt-3">
        <p
          className={[
            "font-bold uppercase tracking-wide text-foreground",
            tall ? "text-base sm:text-lg" : "text-xs sm:text-sm",
          ].join(" ")}
        >
          {category.nameEn}
        </p>
        <p className={tall ? "text-sm text-secondary-text" : "text-xs text-secondary-text"}>
          {category.name}
        </p>
      </div>
      <div className="relative flex flex-1 items-end justify-center overflow-hidden px-2 pb-2">
        {category.icon && (
          <FadeInImage
            src={category.icon}
            alt={category.name}
            width={tall ? 220 : 140}
            height={tall ? 260 : 120}
            className={[
              "h-auto w-auto max-w-[88%] object-contain object-bottom",
              tall ? "max-h-[220px] sm:max-h-[260px]" : "max-h-[96px] sm:max-h-[110px]",
            ].join(" ")}
          />
        )}
      </div>
    </button>
  );
}

type MosaicPattern = "tall-left" | "tall-right";

function MosaicRow({
  tiles,
  pattern,
  onSelect,
}: {
  tiles: Category[];
  pattern: MosaicPattern;
  onSelect: (id: string) => void;
}) {
  const [first, second, third] = tiles;

  if (pattern === "tall-left") {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0">
        <CategoryTile
          category={first}
          onSelect={onSelect}
          tall
          className="col-start-1 row-span-2 row-start-1"
        />
        <CategoryTile category={second} onSelect={onSelect} className="col-start-2 row-start-1" />
        <CategoryTile category={third} onSelect={onSelect} className="col-start-2 row-start-2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-0">
      <CategoryTile category={first} onSelect={onSelect} className="col-start-1 row-start-1" />
      <CategoryTile category={second} onSelect={onSelect} className="col-start-1 row-start-2" />
      <CategoryTile
        category={third}
        onSelect={onSelect}
        tall
        className="col-start-2 row-span-2 row-start-1"
      />
    </div>
  );
}

function chunkCategories(categories: Category[], size: number): Category[][] {
  const chunks: Category[][] = [];
  for (let i = 0; i < categories.length; i += size) {
    chunks.push(categories.slice(i, i + size));
  }
  return chunks;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const visualCategories = categories.filter((category) => category.icon);

  if (visualCategories.length === 0) return null;

  const completeGroups = chunkCategories(visualCategories, 3).filter((group) => group.length === 3);
  const remainder = visualCategories.slice(completeGroups.length * 3);

  return (
    <section className="w-full bg-card pt-10">
      <div className="flex w-full flex-col gap-0">
        {completeGroups.map((group, index) => (
          <MosaicRow
            key={group.map((category) => category.id).join("-")}
            tiles={group}
            pattern={index % 2 === 0 ? "tall-left" : "tall-right"}
            onSelect={onSelect}
          />
        ))}

        {remainder.length === 1 && (
          <CategoryTile category={remainder[0]!} onSelect={onSelect} tall />
        )}

        {remainder.length === 2 && (
          <div className="grid grid-cols-2 gap-0">
            {remainder.map((category) => (
              <CategoryTile key={category.id} category={category} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
