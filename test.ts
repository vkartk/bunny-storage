import { BunnyStorage } from './src/index.js';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const TEST_FILE_NAME = 'test-file.txt';
const TEST_CONTENT = 'Hello, Bunny Storage!';
const REMOTE_PATH = 'test-folder'; // Folder will be created automatically on upload

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  try {
    // Create a local test file
    console.log('\n📝 Creating local test file...');
    writeFileSync(TEST_FILE_NAME, TEST_CONTENT);
    console.log('✅ Local file created');

    // List root files first
    console.log('\n📋 Listing files in root directory...');
    let rootFiles = await storage.listFiles();
    console.log(`Found ${rootFiles.length} files in root`);

    // Upload file to create folder automatically
    console.log('\n⬆️  Uploading test file (this will create the folder)...');
    await storage.uploadFile(TEST_FILE_NAME, REMOTE_PATH);
    console.log('✅ File uploaded successfully');

    // Small delay to ensure file is available
    await delay(1000);

    // Now we can list files in the new folder
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

    // Small delay to ensure file is deleted
    await delay(1000);

    // List files after delete
    console.log(`\n📋 Listing files in ${REMOTE_PATH}/ after delete...`);
    const filesAfterDelete = await storage.listFiles(REMOTE_PATH);
    console.log(`Found ${filesAfterDelete.length} files in ${REMOTE_PATH}/`);
    
    const deletedFile = filesAfterDelete.find(f => f.ObjectName === TEST_FILE_NAME);
    if (!deletedFile) {
      console.log('✅ Deletion confirmed - file no longer exists');
    } else {
      console.log('❌ File still exists after deletion attempt');
    }

    // Note: The empty folder will remain in Bunny Storage
    console.log('\n📝 Note: Empty folder will remain in storage (this is normal)');

    // Cleanup local test file
    console.log('\n🧹 Cleaning up local test file...');
    unlinkSync(TEST_FILE_NAME);
    console.log('✅ Local file cleaned up');

    console.log('\n✨ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runTests();