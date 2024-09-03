package postgres

type Edge struct {
	Id     string
	MeshId string
	Start  int
	End    int
	Data   []float64
}
