import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

function AppShell({ children }: AppShellProps) {
  return <main className="min-h-screen bg-slate-100 text-slate-950">{children}</main>;
}

export default AppShell;
