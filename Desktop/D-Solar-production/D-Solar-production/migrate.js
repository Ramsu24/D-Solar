#!/usr/bin/env node

// This script runs ts-node with the correct TypeScript configuration

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'src', 'scripts', 'migrateKnowledgeBase.ts');
const tsconfig = path.join(__dirname, 'tsconfig.node.json');

const child = spawn('npx', ['ts-node', '-P', tsconfig, scriptPath], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
}); 