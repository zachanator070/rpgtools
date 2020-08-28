import React from 'react';
import {GameRenderer} from "./GameRenderer";
import {GameDrawer} from "./GameDrawer";


export const GameView = () => {

	return <>
		<GameRenderer>
			<GameDrawer/>
		</GameRenderer>
	</>;

};