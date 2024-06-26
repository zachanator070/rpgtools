export const getIntrospectionData = async () => {
	let response = await fetch(`/graphql`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			variables: {},
			query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
		}),
	});
	let result = await response.json();
	// here we're filtering out any type information unrelated to unions or interfaces
	const filteredData = result.data.__schema.types.filter(
		(type) => type.possibleTypes !== null
	);
	result.data.__schema.types = filteredData;
	return result.data;
};
