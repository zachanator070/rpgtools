import React from "react";
import AlertMessage from "./widgets/AlertMessage";

export default function Errors({ errors }) {
	if (!errors || errors.length === 0) {
		return <></>;
	}

	return (
		<div>
			{errors.map((error) => (
				<AlertMessage key={error} error={error}/>
			))}
		</div>
	);
};
