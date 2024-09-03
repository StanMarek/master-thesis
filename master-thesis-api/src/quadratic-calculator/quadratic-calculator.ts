type Point = {
  x: number;
  y: number;
  z: number;
  order: number;
};

type Edge = {
  start: number; // index of the starting point
  end: number; // index of the ending point
};

export class Quadric {
  a: number;
  b: number;
  c: number;
  d: number;

  constructor(a: number, b: number, c: number, d: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  // Add two quadrics together
  add(q: Quadric): Quadric {
    return new Quadric(this.a + q.a, this.b + q.b, this.c + q.c, this.d + q.d);
  }

  // Compute the error for a given point
  error(p: Point): number {
    return (
      this.a * p.x * p.x + this.b * p.y * p.y + this.c * p.z * p.z + this.d
    );
  }
}

function calculateVertexQuadrics(points: Point[], edges: Edge[]): Quadric[] {
  const quadrics: Quadric[] = new Array(points.length)
    .fill(null)
    .map(() => new Quadric(0, 0, 0, 0));

  edges.forEach((edge) => {
    const p1 = points[edge.start];
    const p2 = points[edge.end];
    // console.log(edge.end);
    // Example: create a plane equation for the edge
    const normal = { x: p2.y - p1.y, y: p2.z - p1.z, z: p2.x - p1.x }; // Placeholder normal
    const d = -(normal.x * p1.x + normal.y * p1.y + normal.z * p1.z);

    const quadric = new Quadric(normal.x, normal.y, normal.z, d);
    quadrics[edge.start] = quadrics[edge.start].add(quadric);
    quadrics[edge.end] = quadrics[edge.end].add(quadric);
  });

  return quadrics;
}

export function simplifyMesh(
  points: Point[],
  edges: Edge[],
  targetNumPoints: number,
): { points: Point[]; edges: Edge[] } {
  console.log('Initial number of points:', points.length);
  console.log('Initial number of edges:', edges.length);

  let quadrics = calculateVertexQuadrics(points, edges);
  console.log('Initial number of quadrics:', quadrics.length);

  let iter = 0;
  while (points.length > targetNumPoints) {
    let minError = Infinity;
    let minEdge: Edge | null = null;

    console.log('Iteration:', iter);
    console.log('Number of points:', points.length);
    console.log('Number of edges:', edges.length);

    edges.forEach((edge) => {
      if (edge.start < points.length && edge.end < points.length) {
        // const error = quadrics[edge.start].error(points[edge.end]);
        let error = quadrics[edge.start].error(points[edge.end]);
        // error = adjustErrorForBorders(edge, error, edges);
        // error = adjustErrorForInteriors(edge, error, edges);

        if (error < minError) {
          minError = error;
          minEdge = edge;
        }
        if (error < minError) {
          minError = error;
          minEdge = edge;
        }
      }
    });

    if (minEdge) {
      const newPoint = {
        x: (points[minEdge.start].x + points[minEdge.end].x) / 2,
        y: (points[minEdge.start].y + points[minEdge.end].y) / 2,
        z: (points[minEdge.start].z + points[minEdge.end].z) / 2,
        order: 0,
      };

      points[minEdge.start] = newPoint;
      quadrics[minEdge.start] = quadrics[minEdge.start].add(
        quadrics[minEdge.end],
      );

      // Remove the point at minEdge.end
      points.splice(minEdge.end, 1);

      // Adjust edges to refer to the correct points
      edges = edges
        .map((e) => {
          if (e.start > minEdge.end) e.start--;
          if (e.end > minEdge.end) e.end--;
          return e;
        })
        .filter(
          (e) => e.start !== e.end, // Filter out any degenerate edges
        );
    }

    iter++;
  }

  return { points, edges };
}

function isBorderEdge(edge: Edge, edges: Edge[]): boolean {
  // Count how many times an edge appears (in reverse order as well)
  let count = 0;
  for (const e of edges) {
    if (
      (e.start === edge.start && e.end === edge.end) ||
      (e.start === edge.end && e.end === edge.start)
    ) {
      count++;
    }
  }
  return count === 1; // Border edges should appear only once
}

function adjustErrorForBorders(
  edge: Edge,
  error: number,
  edges: Edge[],
): number {
  if (isBorderEdge(edge, edges)) {
    return error * 10; // Increase the error to preserve borders
  }
  return error;
}

function adjustErrorForInteriors(
  edge: Edge,
  error: number,
  edges: Edge[],
): number {
  if (!isBorderEdge(edge, edges)) {
    return error * 0.5; // Decrease the error to simplify interior more aggressively
  }
  return error;
}
