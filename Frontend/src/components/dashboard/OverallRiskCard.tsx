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
			className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
		>
			{/* Severity indicator */}
			<div
				className={`absolute left-0 top-0 h-1.5 w-full ${theme.bar}`}
			/>

			{/* Header */}
			<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-start gap-4">
					<div
						className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.bg} ${theme.border}`}
						aria-hidden="true"
					>
						<span className="text-xl">☀</span>
					</div>

					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
							Overall Space Weather Risk
						</p>

						<h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
							System Risk
						</h2>

						{risk && (
							<div className="mt-2 flex items-center gap-2">
								<span
									className={`h-2 w-2 rounded-full ${theme.dot}`}
									aria-hidden="true"
								/>

								<span className="text-xs font-semibold text-slate-500">
									{theme.label}
								</span>
							</div>
						)}
					</div>
				</div>

				{risk && <RiskBadge level={risk.overall_level} />}
			</div>

			{/* Loading state */}
			{loading ? (
				<div className="mt-9">
					<LoadingSkeleton className="h-16 w-32" />
					<LoadingSkeleton className="mt-6 h-3 w-full" />
					<LoadingSkeleton className="mt-4 h-4 w-48" />
				</div>
			) : !risk ? (
				<div className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center">
					<p className="text-sm font-semibold text-slate-600">
						No risk data available
					</p>

					<p className="mt-1 text-xs text-slate-400">
						Waiting for the latest space weather data.
					</p>
				</div>
			) : (
				<>
					{/* Main score */}
					<div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
								Risk Score
							</p>

							<div className="mt-1 flex items-baseline gap-2">
								<span
									className={`text-6xl font-black tracking-[-0.04em] ${theme.score}`}
								>
									{Math.round(score)}
								</span>

								<span className="text-xl font-medium text-slate-400">
									/100
								</span>
							</div>
						</div>

						<div className="sm:text-right">
							<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
								Confidence
							</p>

							<p className="mt-1 text-2xl font-black text-slate-800">
								{Math.round(confidence)}%
							</p>
						</div>
					</div>

					{/* Risk progress */}
					<div className="mt-6">
						<div
							className="relative h-3 overflow-hidden rounded-full bg-slate-100"
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(score)}
							aria-label={`Overall risk score: ${Math.round(score)} out of 100`}
						>
							<div
								className={`h-full rounded-full ${theme.bar} transition-all duration-1000 ease-out`}
								style={{ width: `${score}%` }}
							/>
						</div>

						<div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
							<span>Low</span>
							<span>Moderate</span>
							<span>High</span>
							<span>Critical</span>
						</div>
					</div>

					{/* Current status */}
					<div
						className={`mt-6 flex items-center justify-between rounded-2xl border px-4 py-3 ${theme.bg} ${theme.border}`}
					>
						<div className="flex items-center gap-2">
							<span
								className={`h-2 w-2 rounded-full ${theme.dot}`}
								aria-hidden="true"
							/>

							<span className="text-xs font-bold text-slate-700">
								Current system status
							</span>
						</div>

						<span
							className={`text-xs font-black uppercase ${theme.score}`}
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