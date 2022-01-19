import { useCallback, useEffect, useState } from 'react';

import Loader from './Components/Loader/Loader';
import Table from './Components/Table/Table';
import { Bar, BarChart } from './Components/BarChart/BarChart';

import utilityService from './Utility/UtilityService';
import { IHomePlanet, IVehicleData, EFetchBy } from './Types';

import './App.scss';

const initialVehicleData: IVehicleData = {
	vehicleName: '',
	pilotsUrls: [],
	relatedPilotsNames: [],
	homeplanetsUrls: [],
	homeplanets: [],
	populationSum: 0,
};

const App = () => {
	const [vehicleData, setVehicleData] = useState<IVehicleData>(initialVehicleData);
	const [planets, setPlanets] = useState<IHomePlanet[]>([]);
	const [maxPopulation, setMaxPopulation] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const getVehicleToTable = async () => {
		const vehicleData = await utilityService.getVehicleData();
		if (vehicleData) setVehicleData(vehicleData);
	};

	const getPlantsToChart = async () => {
		const planetNames = ['Tatooine', 'Alderaan', 'Naboo', 'Bespin', 'Endor'];
		const fetchedPlanets = await utilityService.getPlanets(EFetchBy.NAME, planetNames);
		if (fetchedPlanets.length) {
			const max = fetchedPlanets.reduce((max, planet) => (max > planet.population ? max : planet.population), 0);
			setMaxPopulation(max);
		}
		setPlanets(fetchedPlanets);
	};

	const getData = useCallback(async () => {
		await Promise.all([getVehicleToTable(), getPlantsToChart()]);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		getData();
	}, [getData]);

	return isLoading ? (
		<Loader />
	) : (
		<div className="App">
			<h1>Yarin Barnes - Tikal Code Challenge</h1>

			<Table vehicleData={vehicleData} />

			<BarChart>
				{planets.map((planet) => {
					const height = `${(planet.population / maxPopulation) * 100 + 1}%`;
					return <Bar name={planet.name} population={planet.population} height={height} key={planet.name} />;
				})}
			</BarChart>
		</div>
	);
};

export default App;
