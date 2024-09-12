import React from "react";
import AlertMessage from "./widgets/AlertMessage.tsx";

export default function Errors({ errors }) {
	if (!errors || errors.length === 0) {
		return <></>;
	}

	return (
		<div id={'errors'} style={{margin: '1em'}}>
			{errors.map((error) => (
				<AlertMessage key={error} error={error}/>
			))}
		</div>
	);
};
