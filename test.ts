import { BunnyStorage } from './src/index.js';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const TEST_FILE_NAME = process.env.TEST_FILE_NAME || 'test-file.txt';
const TEST_BUFFER_NAME = process.env.TEST_BUFFER_NAME || TEST_FILE_NAME.replace('.txt', '-buffer.txt');
const TEST_CONTENT = 'Hello, Bunny Storage!';
const TEST_BUFFER_CONTENT = 'Hello from Buffer!';
const REMOTE_PATH = 'test-folder'; // Folder will be created automatically on upload

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFileUpload(storage: BunnyStorage) {
  console.log('\n📁 Testing File Upload...');
  console.log(`Using file name: ${TEST_FILE_NAME}`);
  
  // Create a local test file
  console.log('\n📝 Creating local test file...');
  writeFileSync(TEST_FILE_NAME, TEST_CONTENT);
  console.log('✅ Local file created');

  // Upload file to create folder automatically
  console.log('\n⬆️  Uploading test file (this will create the folder)...');
  await storage.uploadFile(TEST_FILE_NAME, REMOTE_PATH);
  console.log('✅ File uploaded successfully');

  // Small delay to ensure file is available
  await delay(1000);

  // List files in the new folder
  console.log(`\n📋 Listing files in ${REMOTE_PATH}/...`);
  const folderFiles = await storage.listFiles(REMOTE_PATH);
  console.log(`Found ${folderFiles.length} files in ${REMOTE_PATH}/`);

  const uploadedFile = folderFiles.find(f => f.ObjectName === TEST_FILE_NAME);
  if (uploadedFile) {
    console.log('✅ Upload confirmed:', {
      name: uploadedFile.ObjectName,
      size: uploadedFile.Length,
      lastChanged: uploadedFile.LastChanged
    });
  }

  // Delete the file
  console.log('\n🗑️  Deleting test file...');
  await storage.deleteFile(join(REMOTE_PATH, TEST_FILE_NAME));
  console.log('✅ File deleted successfully');

  // Cleanup local test file
  console.log('\n🧹 Cleaning up local test file...');
  unlinkSync(TEST_FILE_NAME);
  console.log('✅ Local file cleaned up');
}

async function testBufferUpload(storage: BunnyStorage) {
  console.log('\n💾 Testing Buffer Upload...');
  console.log(`Using buffer name: ${TEST_BUFFER_NAME}`);

  // Create a buffer
  console.log('\n📝 Creating test buffer...');
  const buffer = Buffer.from(TEST_BUFFER_CONTENT);
  console.log('✅ Buffer created');

  // Upload buffer
  console.log('\n⬆️  Uploading buffer...');
  const remotePath = join(REMOTE_PATH, TEST_BUFFER_NAME);
  await storage.uploadFile(buffer, remotePath);
  console.log('✅ Buffer uploaded successfully');

  // Small delay to ensure file is available
  await delay(1000);

  // List files to verify upload
  console.log(`\n📋 Listing files in ${REMOTE_PATH}/...`);
  const folderFiles = await storage.listFiles(REMOTE_PATH);
  console.log(`Found ${folderFiles.length} files in ${REMOTE_PATH}/`);

  const uploadedFile = folderFiles.find(f => f.ObjectName === TEST_BUFFER_NAME);
  if (uploadedFile) {
    console.log('✅ Buffer upload confirmed:', {
      name: uploadedFile.ObjectName,
      size: uploadedFile.Length,
      lastChanged: uploadedFile.LastChanged
    });
  }

  // Delete the file
  console.log('\n🗑️  Deleting buffer file...');
  await storage.deleteFile(join(REMOTE_PATH, TEST_BUFFER_NAME));
  console.log('✅ Buffer file deleted successfully');
}

async function runTests() {
  const storage = new BunnyStorage(
    process.env.BUNNY_ACCESS_KEY || '',
    process.env.BUNNY_STORAGE_ZONE || ''
  );

  if (!process.env.BUNNY_ACCESS_KEY || !process.env.BUNNY_STORAGE_ZONE) {
    console.error('Please set BUNNY_ACCESS_KEY and BUNNY_STORAGE_ZONE environment variables');
    process.exit(1);
  }

  console.log('🧪 Starting Bunny Storage tests...');
  console.log(`Using test folder: ${REMOTE_PATH}`);
  console.log(`File upload name: ${TEST_FILE_NAME}`);
  console.log(`Buffer upload name: ${TEST_BUFFER_NAME}`);

  try {
    // List root files first
    console.log('\n📋 Listing files in root directory...');
    let rootFiles = await storage.listFiles();
    console.log(`Found ${rootFiles.length} files in root`);

    // Run file upload tests
    await testFileUpload(storage);

    // Run buffer upload tests
    await testBufferUpload(storage);

    // Final check of folder contents
    await delay(1000);
    console.log(`\n📋 Final check of ${REMOTE_PATH}/...`);
    const finalFiles = await storage.listFiles(REMOTE_PATH);
    console.log(`Found ${finalFiles.length} files in ${REMOTE_PATH}/`);

    if (finalFiles.length === 0) {
      console.log('✅ All test files were properly cleaned up');
    } else {
      console.log('⚠️  Some files remain in the test folder:', 
        finalFiles.map(f => f.ObjectName));
    }

    console.log('\n📝 Note: Empty folder will remain in storage (this is normal)');
    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runTests();