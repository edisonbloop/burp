interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export default function EmptyState({
  title,
  description,
  icon = "◎",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <h3 className="text-xl font-semibold text-[#2d1f0e] mb-2">{title}</h3>
      <p className="text-[#7a5a3a] max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
