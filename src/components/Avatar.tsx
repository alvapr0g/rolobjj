export function Avatar({ name, src, className = 'w-10 h-10' }: { name: string; src?: string; className?: string }) {
  if (src) {
    return <img src={src} alt={`Foto de ${name}`} className={`${className} rounded-full object-cover bg-rolo-surface`} />;
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <div
      role="img"
      aria-label={`Avatar de ${name}`}
      className={`${className} rounded-full bg-rolo-gold text-rolo-bg font-bold flex items-center justify-center shrink-0 select-none`}
    >
      <span aria-hidden="true">{initials || '?'}</span>
    </div>
  );
}
