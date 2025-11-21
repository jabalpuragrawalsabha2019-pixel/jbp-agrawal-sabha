#!/usr/bin/env node

/**
 * Simple script to start the Expo development server
 * Usage: node start-expo.js
 */

const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const projectPath = path.join(__dirname, 'jbp-agrawal-sabha');

console.log('🚀 Starting JBP Agrawal Sabha App...\n');
console.log('📁 Project path:', projectPath);
console.log('💻 Platform:', os.platform());
console.log('\n');

// Run expo start with --clear flag
const command = `cd "${projectPath}" && npx expo start --clear`;

console.log('Running:', command);
console.log('\n📱 Once bundled, you can:\n');
console.log('  • Press "a" to open Android Emulator');
console.log('  • Press "i" to open iOS Simulator');
console.log('  • Scan QR code with Expo Go app on physical device');
console.log('  • Press "w" to open web version');
console.log('\n');

const proc = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  if (stderr) {
    console.error('❌ stderr:', stderr);
    return;
  }
});

// Pipe output
proc.stdout.on('data', (data) => {
  process.stdout.write(data);
});

proc.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  proc.kill();
  process.exit(0);
});
