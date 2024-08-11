import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export const ThreeDCanvas = ({ points }: { points: { x: number; y: number; z: number }[] }) => {
  const vertices = points.flatMap((point) => [point.x, point.y, point.z]);

  return (
    <Canvas style={{ width: '100%', height: '80vh', background: 'white' }}>
      <OrbitControls />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      {/* <Line
        points={vertices} // Array of points [x, y, z, x, y, z, ...]
        color="black" // Line color
        lineWidth={0.01} // Line width
      /> */}

      {points.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.1, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      ))}
    </Canvas>
  );
};
