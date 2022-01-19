import React from 'react';

import './BarChart.scss';

interface IBarProps {
	name: string;
	population: number;
	height: string;
}

const Bar: React.FC<IBarProps> = ({ name, population, height }) => {
	return (
		<li>
			{population.toLocaleString('en-US')}
			<span style={{ height }} title={name}></span>
		</li>
	);
};

const BarChart: React.FC = ({ children }) => {
	return <ul className="bar-chart">{children}</ul>;
};

export { BarChart, Bar };
