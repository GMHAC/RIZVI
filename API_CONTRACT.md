# Minimal production upload contract
POST /uploads/chunk
Headers: X-Upload-ID, X-Chunk-Index, X-Chunk-Total, X-File-Name, Content-Type
Body: binary chunk

POST /uploads/complete
JSON: {uploadId,fileName,size,type}

Recommended: authenticated signed upload sessions, object storage, checksum verification, virus scan, quota enforcement and audit logging.
