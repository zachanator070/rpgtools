import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import useCurrentWorld from "../../hooks/useCurrentWorld";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {LoadingView} from "../LoadingView";
import {Vector3} from "three";
import {Button} from "antd";
import {SlidingDrawer} from "../SlidingDrawerV2";
import useCurrentGame from "../../hooks/useCurrentGame";
import {GameRenderer} from "./GameRenderer";
import {GameDrawer} from "./GameDrawer";



export const GameView = () => {


	useEffect(() => {
		setupScene(webGLRoot.current, currentWorld.wikiPage.mapImage);
		// setupTestScene(webGLRoot.current);
	}, []);

	if(loading){
		return <LoadingView/>;
	}

	return <>
		<GameRenderer>
			<GameDrawer/>
		</GameRenderer>
	</>;

};