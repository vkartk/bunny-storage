# bunny-storage

Simple TypeScript client for Bunny Storage API.

## Install

```bash
npm install bunny-storage
```

## Usage

```typescript
import { BunnyStorage } from 'bunny-storage';

const storage = new BunnyStorage(
  'your-access-key',
  'your-storage-zone'
);

// List files
const files = await storage.listFiles();

// Upload file
await storage.uploadFile('local/path/file.txt', 'remote/path');

// Download file
const data = await storage.downloadFile('path/to/file.txt');

// Delete file
await storage.deleteFile('path/to/file.txt');
```

## Types

The package includes TypeScript definitions. The main type for file information is:

```typescript
interface BunnyFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  // ... other properties
}
```

That's it! Type-safe, no runtime dependencies, just simple and straightforward file operations.