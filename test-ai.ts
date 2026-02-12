import { AIOrchestrator } from './src/services/AIOrchestrator';
import { files } from './src/files';

async function test() {
  console.log('Testing AIOrchestrator...');
  const result = await AIOrchestrator.parseUserCommand('add a button', files);
  if (result) {
    console.log('Success: AIOrchestrator returned a file tree.');
    // Check if App.tsx is modified
    const appFile = result['src']?.directory?.['App.tsx']?.file?.contents;
    if (appFile && appFile.includes('AI Generated')) {
        console.log('Success: App.tsx contains expected content.');
    } else {
        console.log('Failure: App.tsx does not contain expected content.');
    }
  } else {
    console.log('Failure: AIOrchestrator returned null.');
  }
}

test().catch(console.error);
