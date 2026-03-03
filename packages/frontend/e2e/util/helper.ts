import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  GAME_JOIN_URL,
  MIDDLE_EARTH_MAP_URL,
  MIDDLE_EARTH_WIKI_EDIT_URL,
  MIDDLE_EARTH_WIKI_URL,
  ROLES_URL,
  SERVER_SETTINGS_URL,
  WORLD_SETTINGS_URL
} from './constants';

const CURRENT_DIR = process.cwd();
const REPO_ROOT = fs.existsSync(path.resolve(CURRENT_DIR, 'packages/frontend/package.json'))
  ? CURRENT_DIR
  : path.resolve(CURRENT_DIR, '../..');
const FRONTEND_DIR = path.resolve(REPO_ROOT, 'packages/frontend');
const FIXTURE_DIR = path.resolve(FRONTEND_DIR, 'e2e/fixtures');

function runLoggedCommand(command: string) {
  execSync(command, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: '/bin/bash'
  });
}

function runLoggedCommandWithRetry(command: string, retries: number) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      runLoggedCommand(command);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      execSync('sleep 1', { shell: '/bin/bash' });
    }
  }
}

export function seedNewServer() {
  runLoggedCommandWithRetry('npm run -w packages/frontend seed:new >> packages/frontend/seed.log 2>> packages/frontend/seed.log', 2);
}

export function seedMiddleEarth() {
  runLoggedCommandWithRetry('npm run -w packages/frontend seed:middle_earth >> packages/frontend/seed.log 2>> packages/frontend/seed.log', 2);
}

export function stopApp() {
  runLoggedCommand('npm run -w packages/frontend stop-app >> packages/frontend/seed.log 2>> packages/frontend/seed.log');
}

export async function goHome(page: Page) {
  await page.goto('http://localhost:3000/');
}

export async function logout(page: Page) {
  await page.request.post('http://localhost:3000/graphql', {
    data: {
      operationName: 'logout',
      variables: {},
      query: 'mutation logout {logout}'
    }
  });
}

export async function adminLogin(page: Page) {
  await page.request.post('http://localhost:3000/graphql', {
    data: {
      operationName: 'login',
      variables: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      },
      query: 'mutation login($username: String!, $password: String!) {\n  login(username: $username, password: $password) {\n    _id\n    __typename\n  }\n}\n'
    }
  });
}

export async function goToMap(page: Page) {
  await page.goto(MIDDLE_EARTH_MAP_URL);
}

export async function goToWiki(page: Page) {
  await page.goto(MIDDLE_EARTH_WIKI_URL);
}

export async function goToEditWiki(page: Page) {
  await page.goto(MIDDLE_EARTH_WIKI_EDIT_URL);
}

export async function goToServerSettings(page: Page) {
  await page.goto(SERVER_SETTINGS_URL);
}

export async function goToWorldSettings(page: Page) {
  await page.goto(WORLD_SETTINGS_URL);
}

export async function goToRoles(page: Page) {
  await page.goto(ROLES_URL);
}

export async function goToGame(page: Page) {
  await page.goto(GAME_JOIN_URL);
}

export function fixturePath(fileName: string) {
  return path.resolve(FIXTURE_DIR, fileName);
}
