
export default async function fetchSubtypes(){

    const result = await fetch(`/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const data = (await result.json()).data;
    const possibleTypes = {};
    data.__schema.types.forEach(supertype => {
        if (supertype.possibleTypes) {
            possibleTypes[supertype.name] =
                supertype.possibleTypes.map(subtype => subtype.name);
        }
    });

    return possibleTypes;
}