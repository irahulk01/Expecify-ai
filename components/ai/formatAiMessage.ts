export function formatAiMessage(content: string) {
  let formatted = content.replace(/\*["'”`]?/g, "*").replace(/["'”`]?\*/g, "*");

  formatted = formatted.replace(/\|.*\|[\r\n]?/g, (match) => {
    if (match.includes(":---") || match.includes("---") || match.toLowerCase().includes("detail"))
      return "";
    const parts = match
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return `• **${parts[0].replace(/[\*\"]/g, "")}:** ${parts[1].replace(/[\*\"]/g, "")}\n`;
    }
    return "";
  });

  formatted = formatted.replace(
    /🔒\s*\*\*([^*]+)\*\*/g,
    '<div class="flex items-start gap-2.5 px-3.5 py-2.5 my-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-semibold text-xs shadow-sm"><span class="text-base shrink-0">🔒</span><span>$1</span></div>'
  );

  formatted = formatted.replace(
    /✅\s*\*\*([^*]+)\*\*/g,
    '<div class="flex items-center gap-2 px-3 py-2 my-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs shadow-sm"><span class="text-base">✅</span><span>$1</span></div>'
  );

  formatted = formatted.replace(
    /•\s*\*\*([^*]+):\*\*\s*([^\n]+)/g,
    (_, label, val) =>
      `<div class="flex items-center justify-between px-3 py-2 my-1 rounded-xl bg-background border border-border text-xs"><span class="text-text-secondary font-medium">${label.replace(/["']/g, "")}</span><span class="text-brand font-bold">${val.replace(/["']/g, "")}</span></div>`
  );

  formatted = formatted.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold text-text-primary">$1</strong>'
  );
  formatted = formatted.replace(/\n\n/g, '<div class="h-2"></div>').replace(/\n/g, "<br/>");

  return formatted;
}
