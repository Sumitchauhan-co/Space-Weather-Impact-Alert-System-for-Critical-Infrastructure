import type { TimezoneOption } from '../../hooks/useTimezone';
import { formatTime } from '../../utils/formatTime';

interface Props {
	lastUpdated?: string;
	onRefresh: () => void;
	refreshing: boolean;

	timezone: TimezoneOption;
	setTimezone: (value: TimezoneOption) => void;
}

function DashboardHeader({
	lastUpdated,
	onRefresh,
	refreshing,
	timezone,
	setTimezone,
}: Props) {
	return (
		<header className="mb-7">
	<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

		<div>
			<div className="mb-2 flex items-center gap-2">
				<span className="rounded-md bg-slate-900 px-2 py-1 text-[9px] font-black tracking-wider text-white">
					NOAA
				</span>

				<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
					Space Weather Monitoring
				</span>
			</div>

			<h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
				Space Weather
				<br />

				<span className="text-slate-500">
					Impact Alert System
				</span>
			</h1>

			<p className="mt-3 max-w-xl text-sm leading-5 text-slate-500">
				Real-time space-weather intelligence transformed into
				actionable risk insights for critical infrastructure.
			</p>
		</div>

		<div className="flex flex-wrap items-center gap-2">
			{/* timezone */}
			<div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
				<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
					Timezone
				</p>

				<select
					id="timezone"
					value={timezone}
					onChange={(event) =>
						setTimezone(
							event.target.value as TimezoneOption
						)
					}
					className="mt-0.5 bg-transparent text-xs font-bold text-slate-700 outline-none"
				>
					<option value="UTC">UTC</option>
					<option value="Asia/Kolkata">IST — India</option>
					<option value="America/New_York">
						EST/EDT — New York
					</option>
					<option value="Europe/London">
						UK — London
					</option>
					<option value="Asia/Tokyo">
						JST — Tokyo
					</option>
				</select>
			</div>

			{/* updated */}
			<div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
				<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
					Last updated
				</p>

				<div className="mt-0.5 flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

					<span className="text-xs font-bold text-slate-700">
						{formatTime(lastUpdated, timezone)}
					</span>
				</div>
			</div>

			<button
				onClick={onRefresh}
				disabled={refreshing}
				className="h-[46px] rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
			>
				{refreshing ? 'Refreshing...' : '↻ Refresh Data'}
			</button>
		</div>
	</div>

	<div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-3">
		<div className="flex items-center gap-4 text-[10px] text-slate-400">
			<span>● Real-time monitoring</span>
			<span>NOAA data integration</span>
			<span>Critical infrastructure protection</span>
		</div>

		<span className="text-[10px] font-semibold text-slate-400">
			SWIAS • v1.0
		</span>
	</div>
</header>
	);
}

export default DashboardHeader;