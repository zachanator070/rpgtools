export const accessControlList = expect.arrayContaining([
    expect.objectContaining({
        permission: expect.any(String),
        principal: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
        }),
        principalType: expect.any(String),
    }),
]);