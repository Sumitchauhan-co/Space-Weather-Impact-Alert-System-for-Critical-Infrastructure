import type { RiskFactor } from '../../types/spaceWeather';

interface Props {
	factors: RiskFactor[];
}

const getSeverity = (score: number) => {
	if (score >= 80) {
		return {
			label: 'Critical',
			text: 'text-red-600',
			bg: 'bg-red-50',
			bar: 'bg-red-500',
			dot: 'bg-red-500',
		};
	}

	if (score >= 60) {
		return {
			label: 'High',
			text: 'text-orange-600',
			bg: 'bg-orange-50',
			bar: 'bg-orange-500',
			dot: 'bg-orange-500',
		};
	}

	if (score >= 35) {
		return {
			label: 'Moderate',
			text: 'text-amber-600',
			bg: 'bg-amber-50',
			bar: 'bg-amber-500',
			dot: 'bg-amber-500',
		};
	}

	return {
		label: 'Low',
		text: 'text-emerald-600',
		bg: 'bg-emerald-50',
		bar: 'bg-emerald-500',
		dot: 'bg-emerald-500',
	};
};

const getDriverIcon = (name: string) => {
	const key = name.toLowerCase();

	if (key.includes('kp') || key.includes('geomagnetic')) {
		return '🌍';
	}

	if (key.includes('solar') || key.includes('flare')) {
		return '☀️';
	}

	if (key.includes('wind')) {
		return '💨';
	}

	if (key.includes('radiation') || key.includes('proton')) {
		return '☢️';
	}

	if (key.includes('electron')) {
		return '⚡';
	}

	return '◈';
};

function RiskDrivers({ factors }: Props) {
	return (
		<section
			aria-label="Primary risk drivers"
			className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs"
							aria-hidden="true"
						>
							⚙
						</span>

						<p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
							Risk Engine
						</p>
					</div>

					<h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
						Primary Drivers
					</h2>

					<p className="mt-1 text-xs text-slate-400">
						Key parameters contributing to the current risk.
					</p>
				</div>

				<div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center">
					<p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
						Factors
					</p>

					<p className="text-base font-black text-slate-800">
						{factors.length}
					</p>
				</div>
			</div>

			{/* Drivers */}
			<div className="mt-5 space-y-2.5">
				{factors.length === 0 ? (
					<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
						<div className="text-xl">◈</div>

						<p className="mt-2 text-sm font-bold text-slate-700">
							No risk drivers available
						</p>

						<p className="mt-1 text-xs text-slate-400">
							Waiting for space-weather data.
						</p>
					</div>
				) : (
					factors.map((factor) => {
						const score = Math.min(
							Math.max(Number(factor.normalized_score) || 0, 0),
							100,
						);

						const severity = getSeverity(score);

						return (
							<div
								key={factor.name}
								className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 transition-colors duration-200 hover:border-slate-200 hover:bg-slate-50"
							>
								{/* Driver information */}
								<div className="flex items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-2.5">
										<div
											className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm ring-1 ring-slate-100"
											aria-hidden="true"
										>
											{getDriverIcon(factor.name)}
										</div>

										<div className="min-w-0">
											<p className="truncate text-xs font-black capitalize text-slate-800">
												{factor.name}
											</p>

											<div className="mt-0.5 flex items-center gap-1.5">
												<span
													className={`h-1.5 w-1.5 rounded-full ${severity.dot}`}
												/>

												<span
													className={`text-[9px] font-bold uppercase tracking-wide ${severity.text}`}
												>
													{severity.label}
												</span>
											</div>
										</div>
									</div>

									<div className="shrink-0 text-right">
										<span
											className={`text-sm font-black ${severity.text}`}
										>
											{Math.round(score)}
										</span>

										<span className="ml-0.5 text-[9px] text-slate-400">
											/100
										</span>
									</div>
								</div>

								{/* Progress */}
								<div className="mt-2.5">
									<div
										className="h-1.5 overflow-hidden rounded-full bg-slate-200"
										role="progressbar"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={Math.round(score)}
										aria-label={`${factor.name} risk score: ${Math.round(score)} out of 100`}
									>
										<div
											className={`h-full rounded-full ${severity.bar} transition-all duration-700 ease-out`}
											style={{
												width: `${score}%`,
											}}
										/>
									</div>

									<div className="mt-1 flex justify-between text-[8px] font-medium text-slate-400">
										<span>Low</span>
										<span>Moderate</span>
										<span>High</span>
										<span>Critical</span>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Explanation */}
			{factors.length > 0 && (
				<div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3">
					<span
						className="mt-0.5 text-[10px] text-slate-400"
						aria-hidden="true"
					>
						ⓘ
					</span>

					<p className="text-[9px] leading-4 text-slate-400">
						Higher scores indicate stronger contribution to the
						current space-weather risk.
					</p>
				</div>
			)}
		</section>
	);
}

export default RiskDrivers;