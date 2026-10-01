export function Icon({ name }: { name: string }) {
  const common = "h-8 w-8 text-saffron-700";
  if (name === "location") {
    return (
      <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 28s8-7.2 8-14a8 8 0 1 0-16 0c0 6.8 8 14 8 14Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="14" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  if (name === "connectivity") {
    return (
      <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 22h24M8 16h16M12 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="22" r="2" fill="currentColor" />
        <circle cx="24" cy="16" r="2" fill="currentColor" />
        <circle cx="16" cy="10" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (name === "land") {
    return (
      <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 24 16 6l12 18H4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 24v-4h12v4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "power") {
    return (
      <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M18 4 8 18h7l-1 10 10-14h-7l1-10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "workforce") {
    return (
      <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="21" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 24c1.2-3.4 3.6-5 7-5s5.8 1.6 7 5M19 19c2.2.2 3.8 1.4 4.8 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
