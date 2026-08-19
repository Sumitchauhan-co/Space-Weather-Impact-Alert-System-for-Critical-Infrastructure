import type { InfrastructureRisk } from '../../types/spaceWeather';

import RiskBadge from '../ui/RiskBadge';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface Props {
	risk?: InfrastructureRisk;
	loading: boolean;
}

const metadata = {
	power_grid: {
		title: 'Power Grid',
		icon: '⚡',
		description: 'Geomagnetically induced currents',
		impact: 'Grid stability & transformer risk',
	},
	gnss: {
		title: 'GNSS',
		icon: '📡',
		description: 'Navigation and positioning',
		impact: 'Positioning accuracy & signal loss',
	},
	telecommunications: {
		title: 'Telecommunications',
		icon: '📶',
		description: 'Radio and communication systems',
		impact: 'HF radio & communication disruption',
	},
	satellites: {
		title: 'Satellites',
		icon: '🛰️',
		description: 'Orbital and radiation exposure',
		impact: 'Radiation & spacecraft anomalies',
	},
};

function InfrastructureRiskCard({ risk, loading }: Props) {
	if (loading || !risk) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<LoadingSkeleton className="h-11 w-11 rounded-xl" />

						<div>
							<LoadingSkeleton className="h-4 w-28" />
							<LoadingSkeleton className="mt-2 h-3 w-36" />
						</div>
					</div>

					<LoadingSkeleton className="h-6 w-16 rounded-full" />
				</div>

				<LoadingSkeleton className="mt-7 h-10 w-24" />

				<LoadingSkeleton className="mt-5 h-2 w-full" />

				<div className="mt-5 flex justify-between">
					<LoadingSkeleton className="h-3 w-20" />
					<LoadingSkeleton className="h-3 w-10" />
				</div>
			</div>
		);
	}

	const info = metadata[risk.infrastructure];

	const score = Math.min(Math.max(risk.score, 0), 100);

	const getRiskTheme = () => {
		switch (risk.level.toLowerCase()) {
			case 'critical':
				return {
					iconBg: 'bg-red-50',
					iconBorder: 'border-red-100',
					iconText: 'text-red-600',
					bar: 'bg-red-500',
					score: 'text-red-600',
					glow: 'hover:border-red-200',
					dot: 'bg-red-500',
				};

			case 'high':
				return {
					iconBg: 'bg-orange-50',
					iconBorder: 'border-orange-100',
					iconText: 'text-orange-600',
					bar: 'bg-orange-500',
					score: 'text-orange-600',
					glow: 'hover:border-orange-200',
					dot: 'bg-orange-500',
				};

			case 'moderate':
				return {
					iconBg: 'bg-amber-50',
					iconBorder: 'border-amber-100',
					iconText: 'text-amber-600',
					bar: 'bg-amber-500',
					score: 'text-amber-600',
					glow: 'hover:border-amber-200',
					dot: 'bg-amber-500',
				};

			default:
				return {
					iconBg: 'bg-emerald-50',
					iconBorder: 'border-emerald-100',
					iconText: 'text-emerald-600',
					bar: 'bg-emerald-500',
					score: 'text-emerald-600',
					glow: 'hover:border-emerald-200',
					dot: 'bg-emerald-500',
				};
		}
	};

	const theme = getRiskTheme();

	return (
		<div
			className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.glow}`}
		>
			{/* Top accent */}
			<div
				className={`absolute left-0 top-0 h-1 w-full ${theme.bar}`}
			/>

			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${theme.iconBg} ${theme.iconBorder}`}
					>
						{info.icon}
					</div>

					<div>
						<div className="flex items-center gap-2">
							<h3 className="font-black text-slate-900">
								{info.title}
							</h3>

							<span
								className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
							/>
						</div>

						<p className="mt-1 text-[11px] leading-4 text-slate-400">
							{info.description}
						</p>
					</div>
				</div>

				<RiskBadge level={risk.level} />
			</div>

			{/* Score */}
			<div className="mt-7 flex items-end justify-between">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
						Risk Score
					</p>

					<div className="mt-1 flex items-baseline gap-1">
						<span
							className={`text-4xl font-black tracking-tight ${theme.score}`}
						>
							{Math.round(score)}
						</span>

						<span className="text-sm font-medium text-slate-400">
							/100
						</span>
					</div>
				</div>

				<div className="text-right">
					<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Confidence
					</p>

					<p className="mt-1 text-sm font-black text-slate-800">
						{Math.round(risk.confidence)}%
					</p>
				</div>
			</div>

			{/* Progress */}
			<div className="mt-5">
				<div className="h-2 overflow-hidden rounded-full bg-slate-100">
					<div
						className={`h-full rounded-full ${theme.bar} transition-all duration-1000 ease-out`}
						style={{
							width: `${score}%`,
						}}
					/>
				</div>

				<div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
					<span>Low</span>
					<span>Moderate</span>
					<span>High</span>
					<span>Critical</span>
				</div>
			</div>

			{/* Impact */}
			<div className="mt-5 rounded-xl bg-slate-50 px-3 py-3 transition-colors group-hover:bg-slate-100">
				<div className="flex items-start gap-2">
					<span className="mt-0.5 text-xs">⚠</span>

					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							Potential impact
						</p>

						<p className="mt-1 text-xs font-semibold leading-4 text-slate-600">
							{info.impact}
						</p>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
				<span className="text-[10px] font-medium text-slate-400">
					Infrastructure status
				</span>

				<span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
					<span
						className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
					/>
					{risk.level}
				</span>
			</div>
		</div>
	);
}

export default InfrastructureRiskCard;