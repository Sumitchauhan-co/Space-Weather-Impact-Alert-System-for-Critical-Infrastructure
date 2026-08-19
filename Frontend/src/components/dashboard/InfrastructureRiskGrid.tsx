import type { InfrastructureRisk } from '../../types/spaceWeather';

import InfrastructureRiskCard from './InfrastructureRiskCard';

interface Props {
	risks: InfrastructureRisk[];
	loading: boolean;
}

const infrastructureTypes = [
	'power_grid',
	'gnss',
	'telecommunications',
	'satellites',
] as const;

function InfrastructureRiskGrid({ risks, loading }: Props) {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
			{infrastructureTypes.map((type) => {
				const risk = risks.find(
					(item) => item.infrastructure === type,
				);

				return (
					<InfrastructureRiskCard
						key={type}
						risk={risk}
						loading={loading}
					/>
				);
			})}
		</div>
	);
}

export default InfrastructureRiskGrid;