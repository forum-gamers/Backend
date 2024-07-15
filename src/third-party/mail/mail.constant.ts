import { join } from 'path';
import { readFileSync } from 'fs';

const loadFile = (filename: string) =>
  readFileSync(join(__dirname, 'assets', filename), 'utf-8');

export const CONFIRM_MAIL = loadFile('confirm-email.html');
