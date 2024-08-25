package meshService

type MeshCommodity struct {
	FileLineIndex int
	Name          string
	OriginalName  string
	Visible       bool
	Tag           MeshCommodityTag
}

type MeshVertex struct {
	X, Y, Z float64
}

type UserDTO struct {
	Sub string
}

type File struct {
	ID   string
	Name string
	Path string
}

type MeshCommodityTag string

type DataMapping struct {
	LineNumber int
	Line       string
	ItemIndex  int
}
