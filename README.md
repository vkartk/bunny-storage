# bunny-storage

A lightweight, type-safe TypeScript client for the Bunny Storage API with zero runtime dependencies.

## Features

- Full TypeScript support with comprehensive type definitions
- Simple, promise-based API for common storage operations
- Region-aware configuration
- Zero runtime dependencies
- Robust error handling
- Clean, intuitive interface

## Installation

```bash
npm install bunny-storage
```

## Basic Usage

```typescript
import { BunnyStorage } from 'bunny-storage';

const storage = new BunnyStorage(
  'your-access-key',
  'your-storage-zone',
  'storage.bunnycdn.com'  // optional region parameter
);

// List files in a directory
const files = await storage.listFiles('path/to/dir');

// Upload a file
await storage.uploadFile('local/path/file.txt', 'remote/path');
// Upload from buffer
await storage.uploadFile(buffer, 'remote/path', 'file.txt');

// Download a file
const data = await storage.downloadFile('path/to/file.txt');

// Delete a file
await storage.deleteFile('path/to/file.txt');
```

## Storage Regions

The storage API endpoint depends on your storage zone's primary region. Specify the appropriate region when initializing the client:

```typescript
// For UK region
const ukStorage = new BunnyStorage(
  'access-key',
  'storage-zone',
  'uk.storage.bunnycdn.com'
);
```

Available regions:
- Falkenstein, DE: `storage.bunnycdn.com` (default)
- London, UK: `uk.storage.bunnycdn.com`
- New York, US: `ny.storage.bunnycdn.com`
- Los Angeles, US: `la.storage.bunnycdn.com`
- Singapore, SG: `sg.storage.bunnycdn.com`
- Stockholm, SE: `se.storage.bunnycdn.com`
- São Paulo, BR: `br.storage.bunnycdn.com`
- Johannesburg, SA: `jh.storage.bunnycdn.com`
- Sydney, AU: `syd.storage.bunnycdn.com`

## Error Handling

The client includes comprehensive error handling with descriptive error messages:

```typescript
try {
  await storage.uploadFile('non-existent-file.txt', 'remote/path');
} catch (error) {
  if (error instanceof Error) {
    console.error('Upload failed:', error.message);
    // Handle specific error cases
  }
}
```

## API Reference

### Constructor

```typescript
new BunnyStorage(
  accessKey: string,
  storageZone: string,
  region?: string
)
```

### Methods

#### `listFiles(path?: string): Promise<BunnyFile[]>`
Lists files in the specified directory. Empty path lists root directory.

#### `uploadFile(filePath: string, remotePath?: string): Promise<void>`
Uploads a file to the specified remote path. If remotePath is omitted, uploads to root.

#### `downloadFile(path: string): Promise<ArrayBuffer>`
Downloads a file and returns its contents as an ArrayBuffer.

#### `deleteFile(path: string): Promise<void>`
Deletes the specified file.

### Types

```typescript
interface BunnyFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  ServerId: number;
  ArrayNumber: number;
  DateCreated: string;
  StorageZoneId: number;
  UserId: string;
  DateModified: string;
  Checksum: string;
}
```

## Best Practices

1. Always handle errors appropriately in production code
2. Use the correct region for optimal performance
3. Clean up file paths before sending requests:
   ```typescript
   // The client automatically handles leading/trailing slashes
   await storage.listFiles('path/to/dir/');  // works
   await storage.listFiles('/path/to/dir');  // also works
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.