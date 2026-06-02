import { spawnSync } from 'child_process';
import * as path from 'path';

const validationScripts = [
  'infra-validation.ts',
  'runtime-validation.ts',
  'auth-validation.ts',
  'api-validation.ts',
  'cms-validation.ts',
  'market-validation.ts',
  'platform-validation.ts',
  'alert-validation.ts',
  'realtime-validation.ts',
  'signal-validation.ts',
  'billing-validation.ts',
];

async function runAll() {
  console.log('🚀 Starting Phase-4A Real Validation Runner...\n');
  let passedCount = 0;
  let failedCount = 0;
  const failures: string[] = [];

  for (const script of validationScripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`--------------------------------------------------`);
    console.log(`🏃 Running validation: ${script}...`);
    console.log(`--------------------------------------------------`);

    // Use node with ts-node/register to execute the script in a separate process reliably
    const result = spawnSync('node', ['-r', 'ts-node/register', scriptPath], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });

    if (result.status === 0) {
      console.log(`\n✅ ${script} PASSED!\n`);
      passedCount++;
    } else {
      console.error(`\n❌ ${script} FAILED with status ${result.status}!\n`);
      failedCount++;
      failures.push(script);
    }
  }

  console.log(`==================================================`);
  console.log(`📊 VALIDATION SUMMARY`);
  console.log(`==================================================`);
  console.log(`Total:  ${validationScripts.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount > 0) {
    console.error(`\n🚨 The following scripts FAILED:`);
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log(`\n🎉 All validation scripts completed successfully!`);
    process.exit(0);
  }
}

runAll();
