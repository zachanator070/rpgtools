import {useEffect} from "react";
import {notification} from "antd";


export const useGQLResponse = (query, data, error, displayErrors) => {
	let errors = [];
	let errorTitle = 'Server Error';
	if(error){
		if(error.graphQLErrors && error.graphQLErrors.length > 0 ){
			errors = error.graphQLErrors.map(error => error.message);
			errorTitle = 'GraphQL Error';
		}
		else if(error.networkError){
			errorTitle = 'API Error';
			errors = error.networkError.result.errors.map(networkError => networkError.message);
		}
		else{
			errors = [error.message];
		}
	}

	if(query.definitions.length === 0 ){
		throw new Error('Given query is empty! No definitions were supplied');
	}
	const queryName = query.definitions[0].name.value;

	useEffect(() => {
		if(displayErrors){
			for(let message of errors){
				notification.error({
					message: errorTitle,
					description: message,
					placement: "topLeft",
					duration: 0
				});
			}
		}
	}, [error]);

	return {
		data: data ? data[queryName] : undefined,
		errors,
		queryName: queryName
	};
};