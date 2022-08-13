import React from "react";
import LoadingIcon from "./generic/icons/LoadingIcon";

export default function LoadingView() {
	return 	<div style={{height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<LoadingIcon />;
	</div>
};
