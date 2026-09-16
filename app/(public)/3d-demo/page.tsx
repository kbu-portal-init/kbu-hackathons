import RotatingCube from "@/components/_3d/RotatingCube";

export default function ThreeDemoPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12">
      <h1 className="text-3xl font-semibold mb-6">Three.js Demo – Rotating Cube</h1>
      <RotatingCube />
    </section>
  );
}
