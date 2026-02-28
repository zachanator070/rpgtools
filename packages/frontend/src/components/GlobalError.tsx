import React, {useEffect} from "react";
import useNotification from "./widgets/useNotification";

export default function GlobalError() {
	const {errorNotification} = useNotification();

	useEffect(() => {
		const url = new URL(window.location.href);
		const urlError = url.searchParams.get("error");
		if (!urlError) {
			return;
		}

		errorNotification({
			message: "Login Error",
			description: urlError,
		});

		url.searchParams.delete("error");
		window.history.replaceState({}, "", url.toString());
	}, []);

	return <></>;
}
