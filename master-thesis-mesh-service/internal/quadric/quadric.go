package quadric

import (
	"fmt"
	"math"
	meshService "mesh-service/internal/api/mesh/service"
	"sync"
)

type Point = meshService.MeshVertex
type Edge = meshService.MeshEdge

type Quadric struct {
	A, B, C, D float64
}

func (q *Quadric) Add(q2 Quadric) Quadric {
	return Quadric{
		A: q.A + q2.A,
		B: q.B + q2.B,
		C: q.C + q2.C,
		D: q.D + q2.D,
	}
}

func (q *Quadric) Error(p Point) float64 {
	return q.A*p.X*p.X + q.B*p.Y*p.Y + q.C*p.Z*p.Z + q.D
}

func calculateVertexQuadrics(points []Point, edges []Edge) []Quadric {
	quadrics := make([]Quadric, len(points))

	var wg sync.WaitGroup
	for _, edge := range edges {
		wg.Add(1)
		go func(edge Edge) {
			defer wg.Done()
			p1 := points[edge.Start]
			p2 := points[edge.End]
			normal := Point{X: p2.Y - p1.Y, Y: p2.Z - p1.Z, Z: p2.X - p1.X}
			d := -(normal.X*p1.X + normal.Y*p1.Y + normal.Z*p1.Z)
			quadric := Quadric{A: normal.X, B: normal.Y, C: normal.Z, D: d}

			quadrics[edge.Start] = quadrics[edge.Start].Add(quadric)
			quadrics[edge.End] = quadrics[edge.End].Add(quadric)
		}(edge)
	}

	wg.Wait()
	return quadrics
}

func SimplifyMesh(points []Point, edges []Edge, targetNumPoints int) ([]Point, []Edge) {
	fmt.Printf("Initial number of points: %d\n", len(points))
	fmt.Printf("Initial number of edges: %d\n", len(edges))
	diff := len(points) - targetNumPoints
	progressBarIndexStep := diff / 100

	quadrics := calculateVertexQuadrics(points, edges)
	fmt.Printf("Initial number of quadrics: %d\n", len(quadrics))

	for len(points) > targetNumPoints {

		progressStatus := len(points) - targetNumPoints
		if progressStatus%progressBarIndexStep == 0 {
			fmt.Printf("[Progress]: %d%% [Points]: %d, [Edges]: %d\n", progressStatus/progressBarIndexStep-1, len(points), len(edges))
		}

		minError := math.Inf(1)
		var minEdge Edge

		var wg sync.WaitGroup
		errorCh := make(chan struct {
			error float64
			edge  Edge
		})

		for _, edge := range edges {

			wg.Add(1)
			go func(edge Edge) {

				defer wg.Done()
				if edge.Start < len(points) && edge.End < len(points) {
					error := quadrics[edge.Start].Error(points[edge.End])
					errorCh <- struct {
						error float64
						edge  Edge
					}{error, edge}
				}
			}(edge)
		}

		go func() {
			wg.Wait()
			close(errorCh)
		}()

		for res := range errorCh {
			if res.error < minError {
				minError = res.error
				minEdge = res.edge
			}
		}

		newPoint := Point{
			X:     (points[minEdge.Start].X + points[minEdge.End].X) / 2,
			Y:     (points[minEdge.Start].Y + points[minEdge.End].Y) / 2,
			Z:     (points[minEdge.Start].Z + points[minEdge.End].Z) / 2,
			Order: 0,
		}

		points[minEdge.Start] = newPoint
		quadrics[minEdge.Start] = quadrics[minEdge.Start].Add(quadrics[minEdge.End])

		points = append(points[:minEdge.End], points[minEdge.End+1:]...)

		for i := range edges {
			if edges[i].Start > minEdge.End {
				edges[i].Start--
			}
			if edges[i].End > minEdge.End {
				edges[i].End--
			}
		}

		var filteredEdges []Edge
		for _, e := range edges {
			if e.Start != e.End {
				filteredEdges = append(filteredEdges, e)
			}
		}
		edges = filteredEdges

	}

	return points, edges
}
