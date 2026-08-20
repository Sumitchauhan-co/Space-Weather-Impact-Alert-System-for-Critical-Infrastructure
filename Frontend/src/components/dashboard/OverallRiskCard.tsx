import type { SpaceWeatherRisk } from '../../types/spaceWeather';

import RiskBadge from '../ui/RiskBadge';
import LoadingSkeleton from '../ui/LoadingSkeleton';

interface Props {
	risk: SpaceWeatherRisk | null;
	loading: boolean;
}

const getRiskTheme = (level?: string) => {
	switch (level?.toLowerCase()) {
		case 'critical':
			return {
				bar: 'bg-red-500',
				score: 'text-red-600',
				dot: 'bg-red-500',
				bg: 'bg-red-50',
				border: 'border-red-100',
				label: 'Immediate attention required',
			};

		case 'high':
			return {
				bar: 'bg-orange-500',
				score: 'text-orange-600',
				dot: 'bg-orange-500',
				bg: 'bg-orange-50',
				border: 'border-orange-100',
				label: 'Elevated infrastructure risk',
			};

		case 'moderate':
			return {
				bar: 'bg-amber-500',
				score: 'text-amber-600',
				dot: 'bg-amber-500',
				bg: 'bg-amber-50',
				border: 'border-amber-100',
				label: 'Increased monitoring recommended',
			};

		default:
			return {
				bar: 'bg-emerald-500',
				score: 'text-emerald-600',
				dot: 'bg-emerald-500',
				bg: 'bg-emerald-50',
				border: 'border-emerald-100',
				label: 'Space weather conditions stable',
			};
	}
};

function OverallRiskCard({ risk, loading }: Props) {
	const theme = getRiskTheme(risk?.overall_level);

	const score = Math.min(
		Math.max(Number(risk?.overall_score) || 0, 0),
		100,
	);

	const confidence = Math.min(
		Math.max(Number(risk?.confidence) || 0, 0),
		100,
	);

	return (
		<section
			aria-label="Overall space weather risk"
			className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
		>
			{/* Severity bar */}
			<div
				className={`absolute inset-x-0 top-0 h-1 ${theme.bar}`}
				aria-hidden="true"
			/>

			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<div
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.bg} ${theme.border}`}
						aria-hidden="true"
					>
						<span className="text-lg">☀</span>
					</div>

					<div className="min-w-0">
						<p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
							Overall Space Weather Risk
						</p>

						<h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-950">
							System Risk
						</h2>
					</div>
				</div>

				{risk && (
					<div className="shrink-0">
						<RiskBadge level={risk.overall_level} />
					</div>
				)}
			</div>

			{/* Status message */}
			{risk && (
				<div className="mt-4 flex items-center gap-2">
					<span
						className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
						aria-hidden="true"
					/>

					<span className="text-xs font-medium text-slate-500">
						{theme.label}
					</span>
				</div>
			)}

			{/* Loading */}
			{loading ? (
				<div className="mt-6">
					<LoadingSkeleton className="h-12 w-28" />

					<LoadingSkeleton className="mt-5 h-2.5 w-full" />

					<LoadingSkeleton className="mt-4 h-10 w-full" />
				</div>
			) : !risk ? (
				<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
					<p className="text-sm font-semibold text-slate-600">
						No risk data available
					</p>

					<p className="mt-1 text-xs text-slate-400">
						Waiting for the latest space weather data.
					</p>
				</div>
			) : (
				<>
					{/* Score + confidence */}
					<div className="mt-6 flex items-end justify-between gap-4">
						<div>
							<p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
								Risk Score
							</p>

							<div className="mt-0.5 flex items-baseline gap-1.5">
								<span
									className={`text-5xl font-black tracking-[-0.04em] ${theme.score}`}
								>
									{Math.round(score)}
								</span>

								<span className="text-base font-medium text-slate-400">
									/100
								</span>
							</div>
						</div>

						<div className="text-right">
							<p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
								Confidence
							</p>

							<p className="mt-0.5 text-xl font-black text-slate-800">
								{Math.round(confidence)}%
							</p>
						</div>
					</div>

					{/* Risk scale */}
					<div className="mt-5">
						<div
							className="h-2.5 overflow-hidden rounded-full bg-slate-100"
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(score)}
							aria-label={`Overall risk score: ${Math.round(score)} out of 100`}
						>
							<div
								className={`h-full rounded-full ${theme.bar} transition-all duration-700 ease-out`}
								style={{
									width: `${score}%`,
								}}
							/>
						</div>

						<div className="mt-1.5 flex justify-between text-[9px] font-semibold text-slate-400">
							<span>Low</span>
							<span>Moderate</span>
							<span>High</span>
							<span>Critical</span>
						</div>
					</div>

					{/* Current status */}
					<div
						className={`mt-5 flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${theme.bg} ${theme.border}`}
					>
						<div className="flex items-center gap-2">
							<span
								className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
								aria-hidden="true"
							/>

							<span className="text-[11px] font-bold text-slate-700">
								Current system status
							</span>
						</div>

						<span
							className={`text-[10px] font-black uppercase tracking-wide ${theme.score}`}
						>
							{risk.overall_level}
						</span>
					</div>
				</>
			)}
		</section>
	);
}

export default OverallRiskCard;