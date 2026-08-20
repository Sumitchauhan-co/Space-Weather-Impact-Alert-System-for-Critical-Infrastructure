import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type {
	InfrastructureRisk,
	InfrastructureType,
	RiskLevel,
} from '../../types/spaceWeather';

interface RiskLocation {
	infrastructure: InfrastructureType;
	latitude: number;
	longitude: number;
	label: string;
}

interface Props {
	risks: InfrastructureRisk[];
	locations?: RiskLocation[];
	kp?: number | null;
	loading?: boolean;
}

const LEVEL_STYLES: Record<
	RiskLevel,
	{
		color: string;
		fillColor: string;
	}
> = {
	NORMAL: {
		color: '#059669',
		fillColor: '#10b981',
	},
	WATCH: {
		color: '#ca8a04',
		fillColor: '#eab308',
	},
	ADVISORY: {
		color: '#ea580c',
		fillColor: '#f97316',
	},
	WARNING: {
		color: '#dc2626',
		fillColor: '#ef4444',
	},
	CRITICAL: {
		color: '#991b1b',
		fillColor: '#dc2626',
	},
};

const INFRASTRUCTURE_LABELS: Record<InfrastructureType, string> = {
	power_grid: 'Power Grid',
	gnss: 'GNSS',
	telecommunications: 'Telecommunications',
	satellites: 'Satellites',
	aviation: 'Aviation',
	railways: 'Railways',
};

/*
 * Representative monitoring/reference locations.
 *
 * IMPORTANT:
 * These are NOT claiming that the infrastructure physically
 * exists only at these points.
 *
 * They are used to give the dashboard a geographic reference
 * for the sector-level risk returned by the backend.
 */
const DEFAULT_LOCATIONS: RiskLocation[] = [
	{
		infrastructure: 'power_grid',
		latitude: 28.6,
		longitude: 77.2,
		label: 'India Power Infrastructure',
	},
	{
		infrastructure: 'gnss',
		latitude: 40.7,
		longitude: -74.0,
		label: 'North America GNSS Reference',
	},
	{
		infrastructure: 'telecommunications',
		latitude: 51.5,
		longitude: -0.1,
		label: 'Europe Telecommunications Reference',
	},
	{
		infrastructure: 'satellites',
		latitude: 35.7,
		longitude: 139.7,
		label: 'Asia-Pacific Satellite Reference',
	},
];

function getRiskRadius(score: number) {
	if (score >= 80) return 22;
	if (score >= 60) return 19;
	if (score >= 35) return 16;
	if (score >= 15) return 14;

	return 12;
}

function getKpRiskLevel(kp: number): RiskLevel {
	if (kp >= 8) return 'CRITICAL';
	if (kp >= 7) return 'WARNING';
	if (kp >= 5) return 'ADVISORY';
	if (kp >= 4) return 'WATCH';

	return 'NORMAL';
}

function SpaceWeatherMap({
	risks,
	locations = DEFAULT_LOCATIONS,
	kp = null,
	loading = false,
}: Props) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const leafletMapRef = useRef<L.Map | null>(null);

	const markersRef = useRef<L.CircleMarker[]>([]);
	const zonesRef = useRef<L.Circle[]>([]);

	/*
	 * Create map once.
	 */
	useEffect(() => {
		if (!mapRef.current || leafletMapRef.current) {
			return;
		}

		const map = L.map(mapRef.current, {
			center: [25, 20],
			zoom: 2,
			minZoom: 2,
			maxZoom: 6,
			scrollWheelZoom: false,
			worldCopyJump: true,
		});

		L.tileLayer(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			{
				attribution: '&copy; OpenStreetMap contributors',
			},
		).addTo(map);

		leafletMapRef.current = map;

		setTimeout(() => {
			map.invalidateSize();
		}, 100);

		return () => {
			map.remove();
			leafletMapRef.current = null;
		};
	}, []);

	/*
	 * Update infrastructure markers.
	 */
	useEffect(() => {
		const map = leafletMapRef.current;

		if (!map) return;

		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		if (!risks.length) return;

		const locationMap = new Map(
			locations.map((location) => [
				location.infrastructure,
				location,
			]),
		);

		risks.forEach((risk) => {
			const location = locationMap.get(risk.infrastructure);

			if (!location) return;

			const style = LEVEL_STYLES[risk.level];

			const score = Math.min(
				Math.max(Number(risk.score) || 0, 0),
				100,
			);

			const radius = getRiskRadius(score);

			/*
			 * Outer pulse/reference circle
			 */
			const outer = L.circleMarker(
				[location.latitude, location.longitude],
				{
					radius: radius + 7,
					color: style.color,
					fillColor: style.fillColor,
					fillOpacity: 0.08,
					weight: 1,
					opacity: 0.4,
				},
			).addTo(map);

			/*
			 * Main risk indicator.
			 */
			const marker = L.circleMarker(
				[location.latitude, location.longitude],
				{
					radius,
					color: '#ffffff',
					fillColor: style.fillColor,
					fillOpacity: 0.9,
					weight: 3,
				},
			).addTo(map);

			/*
			 * Tooltip shown on hover.
			 */
			marker.bindTooltip(
				`
					<div style="font-family: Inter, sans-serif;">
						<strong style="font-size:13px;">
							${INFRASTRUCTURE_LABELS[risk.infrastructure]}
						</strong>

						<div style="
							margin-top:5px;
							font-size:11px;
							color:#64748b;
						">
							${location.label}
						</div>

						<div style="
							margin-top:8px;
							font-size:12px;
						">
							<strong style="color:${style.color};">
								${risk.level}
							</strong>
							&nbsp; · &nbsp;
							${Math.round(score)}/100
						</div>
					</div>
				`,
				{
					direction: 'top',
					offset: [0, -10],
					opacity: 0.97,
				},
			);

			/*
			 * Detailed popup.
			 */
			marker.bindPopup(`
				<div style="
					min-width:220px;
					font-family:Inter,Arial,sans-serif;
				">
					<div style="
						font-size:15px;
						font-weight:800;
						color:#0f172a;
					">
						${INFRASTRUCTURE_LABELS[risk.infrastructure]}
					</div>

					<div style="
						margin-top:4px;
						font-size:11px;
						color:#64748b;
					">
						${location.label}
					</div>

					<div style="
						margin-top:14px;
						padding:10px;
						border-radius:10px;
						background:${style.fillColor}15;
					">
						<div style="
							display:flex;
							justify-content:space-between;
						">
							<span>Risk Level</span>
							<strong style="color:${style.color};">
								${risk.level}
							</strong>
						</div>

						<div style="
							display:flex;
							justify-content:space-between;
							margin-top:6px;
						">
							<span>Risk Score</span>
							<strong>
								${Math.round(score)}/100
							</strong>
						</div>

						<div style="
							display:flex;
							justify-content:space-between;
							margin-top:6px;
						">
							<span>Confidence</span>
							<strong>
								${Math.round(Number(risk.confidence) || 0)}%
							</strong>
						</div>
					</div>
				</div>
			`);

			/*
			 * Keep both circles so they can be removed next update.
			 */
			markersRef.current.push(marker);
			markersRef.current.push(outer);
		});
	}, [risks, locations]);

	/*
	 * Dynamic geomagnetic zones based on Kp.
	 */
	useEffect(() => {
		const map = leafletMapRef.current;

		if (!map) return;

		zonesRef.current.forEach((zone) => zone.remove());
		zonesRef.current = [];

		if (kp === null || kp === undefined) return;

		const level = getKpRiskLevel(kp);
		const style = LEVEL_STYLES[level];

		/*
		 * Higher Kp means stronger geomagnetic disturbance.
		 *
		 * The visual zone is deliberately broad and illustrative.
		 * It should NOT be interpreted as a precise forecast boundary.
		 */
		const zoneRadius =
			kp >= 8
				? 1800000
				: kp >= 7
					? 1600000
					: kp >= 5
						? 1300000
						: kp >= 4
							? 1000000
							: 700000;

		/*
		 * Northern geomagnetic zone.
		 */
		const northZone = L.circle(
			[65, 0],
			{
				radius: zoneRadius,
				color: style.color,
				fillColor: style.fillColor,
				fillOpacity: 0.05,
				weight: 1,
				opacity: 0.35,
				interactive: false,
			},
		).addTo(map);

		/*
		 * Southern geomagnetic zone.
		 */
		const southZone = L.circle(
			[-65, 0],
			{
				radius: zoneRadius,
				color: style.color,
				fillColor: style.fillColor,
				fillOpacity: 0.05,
				weight: 1,
				opacity: 0.35,
				interactive: false,
			},
		).addTo(map);

		zonesRef.current.push(northZone, southZone);
	}, [kp]);

	if (loading) {
		return (
			<div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
		);
	}

	const currentKpLevel =
		kp !== null && kp !== undefined
			? getKpRiskLevel(kp)
			: null;

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			{/* Header */}
			<div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
						Geospatial Monitoring
					</p>

					<h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
						Space Weather Impact
					</h2>

					<p className="mt-1 text-xs text-slate-400">
						Live infrastructure risk and geomagnetic activity.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{(Object.keys(LEVEL_STYLES) as RiskLevel[]).map(
						(level) => (
							<div
								key={level}
								className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500"
							>
								<span
									className="h-2.5 w-2.5 rounded-full"
									style={{
										backgroundColor:
											LEVEL_STYLES[level].fillColor,
									}}
								/>

								{level}
							</div>
						),
					)}
				</div>
			</div>

			{/* Map */}
			<div className="relative h-[380px]">
				<div
					ref={mapRef}
					className="h-full w-full"
				/>

				{/* Kp status */}
				{kp !== null && kp !== undefined && (
					<div className="absolute left-4 top-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur">
						<p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
							Geomagnetic Activity
						</p>

						<div className="mt-1 flex items-baseline gap-2">
							<span className="text-xl font-black text-slate-900">
								Kp {kp.toFixed(1)}
							</span>

							<span
								className="text-[10px] font-black uppercase"
								style={{
									color:
										currentKpLevel
											? LEVEL_STYLES[currentKpLevel]
													.color
											: '#64748b',
								}}
							>
								{currentKpLevel}
							</span>
						</div>
					</div>
				)}

				{/* Map explanation */}
				<div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
					<p className="text-[11px] font-bold text-slate-700">
						Live infrastructure exposure
					</p>

					<p className="mt-0.5 max-w-[230px] text-[9px] leading-4 text-slate-400">
						Marker colors represent sector risk from the
						NOAA-derived risk engine.
					</p>
				</div>

				{/* Disclaimer */}
				<div className="pointer-events-none absolute bottom-4 right-4 z-[1000] hidden max-w-[280px] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[9px] leading-4 text-slate-400 shadow-sm backdrop-blur sm:block">
					Geomagnetic zones are indicative visualization
					regions, not precise impact boundaries.
				</div>
			</div>
		</div>
	);
}

export default SpaceWeatherMap;