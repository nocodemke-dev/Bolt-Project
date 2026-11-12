import { usePage, type Page } from "../lib/navigation";

interface Props {
  to: Page;
  children: React.ReactNode;
  className?: string;
}

export function Link({ to, children, className }: Props) {
  const { setPage } = usePage();
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault();
        setPage(to);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
