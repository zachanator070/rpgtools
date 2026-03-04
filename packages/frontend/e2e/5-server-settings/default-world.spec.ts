import { expect, test } from '@playwright/test';
import { adminLogin, seedMiddleEarth, stopApp } from '../util/helper';

test.describe('default world', () => {
  test.beforeAll(() => {
    seedMiddleEarth();
  });

  test.afterAll(() => {
    stopApp();
  });

  test('redirects /ui/defaultWorld to the configured world map', async ({ page }) => {
    await adminLogin(page);

    const worldResponse = await page.request.post('http://localhost:3000/graphql', {
      data: {
        operationName: 'worlds',
        variables: {
          page: 1
        },
        query: 'query worlds($name: String, $page: Int) {\n  worlds(name: $name, page: $page) {\n    docs {\n      _id\n      name\n      wikiPage {\n        _id\n      }\n    }\n  }\n}\n'
      }
    });
    const worldJson = await worldResponse.json();
    expect(worldJson.errors).toBeFalsy();
    const selectedWorld = worldJson?.data?.worlds?.docs?.[0];
    expect(selectedWorld?._id).toBeTruthy();
    expect(selectedWorld?.wikiPage?._id).toBeTruthy();

    const setDefaultWorldResponse = await page.request.post('http://localhost:3000/graphql', {
      data: {
        operationName: 'setDefaultWorld',
        variables: {
          worldId: selectedWorld._id
        },
        query: 'mutation setDefaultWorld($worldId: ID!) {\n  setDefaultWorld(worldId: $worldId) {\n    _id\n    defaultWorld {\n      _id\n    }\n  }\n}\n'
      }
    });
    const setDefaultWorldJson = await setDefaultWorldResponse.json();
    expect(setDefaultWorldJson.errors).toBeFalsy();
    expect(setDefaultWorldJson?.data?.setDefaultWorld?.defaultWorld?._id).toEqual(selectedWorld._id);

    await page.goto('http://localhost:3000/ui/defaultWorld');
    await expect(page).toHaveURL(new RegExp(`/ui/world/${selectedWorld._id}/map/${selectedWorld.wikiPage._id}$`), { timeout: 30000 });
  });
});
