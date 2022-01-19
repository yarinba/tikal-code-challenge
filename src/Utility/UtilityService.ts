import axios from 'axios';

import { EFetchBy, IHomePlanet, IPilot, IVehicleData, TFetchBy } from '../Types';

class UtilityService {
	private peopleCache: { [key: string]: IPilot } = {};
	private planetsCache: { [key: string]: IHomePlanet } = {};

	private handleCache(
		pilotsUrls: string[],
		fetchedPilots: IPilot[],
		planetsUrls: string[],
		fetchedPlanets: IHomePlanet[]
	) {
		// cache fetched pilots
		for (const i in pilotsUrls) {
			this.peopleCache[pilotsUrls[i]] = fetchedPilots[i];
		}
		// cache fetched planets
		for (const i in planetsUrls) {
			this.planetsCache[planetsUrls[i]] = fetchedPlanets[i];
		}
	}

	private async handleVehicleData(vehicleData: IVehicleData): Promise<void> {
		// handle pilots - start
		const pilotsToFetch = vehicleData.pilotsUrls.filter((pilotUrl) => !this.peopleCache[pilotUrl]);
		const cachedPilots = vehicleData.pilotsUrls
			.filter((pilotUrl) => this.peopleCache[pilotUrl])
			.map((pilotUrl) => this.peopleCache[pilotUrl]);

		const fetchedPilots = await this.getPilots(pilotsToFetch);

		vehicleData.relatedPilotsNames = [...fetchedPilots.map((p) => p.name), ...cachedPilots.map((p) => p.name)];
		const tempPlanetsUrls = [...fetchedPilots.map((p) => p.planetUrl), ...cachedPilots.map((p) => p.planetUrl)];
		vehicleData.homeplanetsUrls = [...new Set(tempPlanetsUrls)];
		// handle pilots - end

		// handle planets - start
		const planetsToFetch = vehicleData.homeplanetsUrls.filter((planetUrl) => !this.planetsCache[planetUrl]);
		const cachedPlanets = vehicleData.homeplanetsUrls
			.filter((planetUrl) => this.planetsCache[planetUrl])
			.map((planetUrl) => this.planetsCache[planetUrl]);

		const fetchedPlanets = await this.getPlanets(EFetchBy.URL, planetsToFetch);
		vehicleData.homeplanets = [...fetchedPlanets, ...cachedPlanets];

		vehicleData.populationSum = vehicleData.homeplanets
			.map((p) => p.population)
			.reduce((prevValue, currValue) => prevValue + currValue);
		// handle planets - end

		this.handleCache(pilotsToFetch, fetchedPilots, planetsToFetch, fetchedPlanets);
	}

	private async getVehiclesWithPilots() {
		try {
			let nextUrl = 'https://swapi.py4e.com/api/vehicles/';
			let vehicles: any[] = [];

			while (nextUrl) {
				const res = await axios.get(nextUrl);
				vehicles = [...vehicles, ...res.data.results];
				nextUrl = res.data.next;
			}
			return vehicles?.filter((vehicle) => vehicle?.pilots?.length > 0);
		} catch (err) {
			console.error('getVehiclesWithPilots error: ', err);
			return [];
		}
	}

	private async getPilots(pilotsToFetch: string[]): Promise<IPilot[]> {
		try {
			const pilotsPromises = pilotsToFetch.map((url) => axios.get(url));
			const resArray = await Promise.all(pilotsPromises);
			const fetchedPilots = resArray.map((res) => res.data);
			return fetchedPilots.map(({ name, homeworld }) => ({ name, planetUrl: homeworld })) as IPilot[];
		} catch (err) {
			console.error('getPilots error: ', err);
			return [];
		}
	}

	public async getPlanets(fetchBy: TFetchBy, planetsToFetch: string[] = []): Promise<IHomePlanet[]> {
		try {
			let planetsPromises: Promise<any>[] = [];
			let fetchedPlanets: any[] = [];

			if (fetchBy === EFetchBy.URL) {
				planetsPromises = planetsToFetch.map((url) => axios.get(url));
			} else if (fetchBy === EFetchBy.NAME) {
				const planetBaseURL = 'https://swapi.py4e.com/api/planets/?search=';
				planetsPromises = planetsToFetch.map((name) => axios.get(planetBaseURL + name));
			}
			const resArray = await Promise.all(planetsPromises);
			if (fetchBy === EFetchBy.URL) {
				fetchedPlanets = resArray.map((res) => res.data);
			} else if (fetchBy === EFetchBy.NAME) {
				fetchedPlanets = resArray.map((res) => res.data.results[0]);
			}

			return fetchedPlanets.map(({ name, population }) => ({
				name,
				population: parseInt(population),
			})) as IHomePlanet[];
		} catch (err) {
			console.error('getPlanets error: ', err);
			return [];
		}
	}

	public async getVehicleData(): Promise<IVehicleData | null> {
		const vehiclesData: IVehicleData[] = (await this.getVehiclesWithPilots()).map(({ name, pilots }) => ({
			vehicleName: name,
			pilotsUrls: pilots,
			relatedPilotsNames: [],
			homeplanetsUrls: [],
			homeplanets: [],
			populationSum: 0,
		}));

		for (const vehicleData of vehiclesData) {
			await this.handleVehicleData(vehicleData);
		}

		// find vehicle with highest sum of population
		if (vehiclesData.length) {
			return vehiclesData.reduce((max, vehiclesData) =>
				max.populationSum > vehiclesData.populationSum ? max : vehiclesData
			);
		} else {
			return null;
		}
	}
}

const utilityService = new UtilityService();
export default utilityService;
