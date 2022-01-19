import { IHomePlanet } from '.';

export interface IVehicleData {
	vehicleName: string;
	pilotsUrls: string[];
	relatedPilotsNames: string[];
	homeplanetsUrls: string[];
	homeplanets: IHomePlanet[];
	populationSum: number;
}
