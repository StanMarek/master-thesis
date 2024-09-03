package meshService

type MeshCommodity struct {
	FileLineIndex int
	Name          string
	OriginalName  string
	Visible       bool
	Tag           MeshCommodityTag
}

type MeshVertex struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Z      float64 `json:"z"`
	Order  int     `json:"order"`
	MeshId string  `json:"meshId"`
	Color  string  `json:"color"`
}

type MeshEdge struct {
	Id     string    `json:"id"`
	MeshId string    `json:"meshId"`
	Start  int       `json:"start"`
	End    int       `json:"end"`
	Data   []float64 `json:"data"`
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
