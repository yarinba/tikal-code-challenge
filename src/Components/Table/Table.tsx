import { IVehicleData } from '../../Types';

import './Table.scss';

interface ITableProps {
	vehicleData: IVehicleData;
}

const Table: React.FC<ITableProps> = ({ vehicleData }) => {
	return (
		<table className="styled-table">
			<thead>
				<tr>
					<th>Vehicle name with the largest sum</th>
					<th>Related home planets</th>
					<th>Related pilot names</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{vehicleData?.vehicleName}</td>
					<td>
						{vehicleData?.homeplanets.map(
							(planet) => `name: ${planet.name}, population: ${planet.population.toLocaleString()}\n`
						)}
					</td>
					<td>{vehicleData?.relatedPilotsNames.map((pilot) => `${pilot}\n`)}</td>
				</tr>
			</tbody>
		</table>
	);
};

export default Table;
