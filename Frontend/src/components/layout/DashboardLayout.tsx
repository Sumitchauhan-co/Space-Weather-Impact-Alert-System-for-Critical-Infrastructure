import type { ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

function DashboardLayout({ children }: Props) {
	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-50">
			{/* Subtle background glow */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl" />

				<div className="absolute -left-32 top-[35%] h-80 w-80 rounded-full bg-slate-200/30 blur-3xl" />
			</div>

			{/* Main content */}
			<main className="relative mx-auto max-w-[1700px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
				{children}
			</main>
		</div>
	);
}

export default DashboardLayout;