package postgres

type Vertex struct {
	Id     string
	X      float64
	Y      float64
	Z      float64
	Order  int
	MeshId string
}
