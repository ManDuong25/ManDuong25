import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { writeFileSync } from 'node:fs';

const require = createRequire(join(homedir(), '.local/share/oracle-runtime/node_modules/@steipete/oracle/package.json'));
const CDP = require('chrome-remote-interface');

const port = 40549;
const targetId = 'B52C2442860AB9535A5B61B84F994358';

try {
  const client = await CDP({ host: '127.0.0.1', port, target: targetId });
  const { Runtime } = client;
  const result = await Runtime.evaluate({
    expression: `document.body.innerText`,
    returnByValue: true
  });
  writeFileSync('scripts/oracle-review.txt', result.result.value, 'utf8');
  console.log("Saved full review to scripts/oracle-review.txt. Length:", result.result.value.length);
  await client.close();
  await client.close();
} catch (e) {
  console.error("Error:", e.message);
}
