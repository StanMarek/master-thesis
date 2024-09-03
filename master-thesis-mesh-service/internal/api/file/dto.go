package file

import "mime/multipart"

type UploadFileDTO struct {
	File        multipart.File `json:"file"`
	Filename    string         `json:"filename"`
	ChunkIndex  int            `json:"chunkIndex"`
	TotalChunks int            `json:"totalChunks"`
}
