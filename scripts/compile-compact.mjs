import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const isWindows = os.platform() === 'win32';
const rootDir = process.cwd();
const contractsFile = 'contracts/privestate.compact';
const managedDir = 'managed';

console.log(`[PrivEstate] Compiling Compact contract: ${contractsFile} -> ${managedDir}`);

if (isWindows) {
  // Convert Windows path to WSL path (e.g., D:\midnyt4 -> /mnt/d/midnyt4)
  const driveMatch = rootDir.match(/^([A-Za-z]):\\(.*)$/);
  let wslPath;
  if (driveMatch) {
    const drive = driveMatch[1].toLowerCase();
    const rest = driveMatch[2].replace(/\\/g, '/');
    wslPath = `/mnt/${drive}/${rest}`;
  } else {
    wslPath = rootDir.replace(/\\/g, '/');
  }

  const wslContract = `${wslPath}/${contractsFile}`;
  const wslManaged = `${wslPath}/${managedDir}`;
  
  console.log(`[PrivEstate] Running Compact compiler via WSL: ~/.local/bin/compact compile ${wslContract} ${wslManaged}`);
  try {
    execSync(`wsl bash -c "~/.local/bin/compact compile '${wslContract}' '${wslManaged}'"`, {
      stdio: 'inherit',
    });
    console.log(`[PrivEstate] Compact compilation completed successfully!`);
  } catch (err) {
    console.error(`[PrivEstate] Error compiling Compact contract:`, err.message);
    process.exit(1);
  }
} else {
  // Linux / macOS / GitHub Actions CI
  console.log(`[PrivEstate] Running Compact compiler: compact compile ${contractsFile} ${managedDir}`);
  try {
    execSync(`compact compile "${contractsFile}" "${managedDir}"`, {
      stdio: 'inherit',
    });
    console.log(`[PrivEstate] Compact compilation completed successfully!`);
  } catch (err) {
    console.error(`[PrivEstate] Error compiling Compact contract:`, err.message);
    process.exit(1);
  }
}
