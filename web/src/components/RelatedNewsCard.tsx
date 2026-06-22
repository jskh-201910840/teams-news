import { Link } from "react-router-dom";
import { itemDetailPath, toDigestItem } from "../lib/archive";
import type { SearchIndexItem } from "../lib/archive";
import { SOURCE_STYLES, displayTitle, formatEngagement } from "../lib/types";
import { Badge } from "../styleseed/components/ui/badge";

export function RelatedNewsCard({ item }: { item: SearchIndexItem }) {
  const digestItem = toDigestItem(item, 0);
  const style = SOURCE_STYLES[item.source] ?? { color: "#8a8f98", icon: "📌" };
  const engagement = formatEngagement(digestItem);
  const title = displayTitle(digestItem);

  return (
    <Link
      to={itemDetailPath(item.id)}
      className="ss-card flex flex-col gap-2 p-4 no-underline transition-colors hover:border-brand/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="border-transparent text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: style.color }}
        >
          {style.icon} {item.source}
        </Badge>
        {engagement && (
          <span className="ml-auto text-[11px] font-semibold text-brand">{engagement}</span>
        )}
      </div>
      <h3 className="text-sm font-semibold leading-snug text-text-primary line-clamp-2">
        {title}
      </h3>
      <span className="text-xs text-text-disabled">{item.section}</span>
    </Link>
  );
}
