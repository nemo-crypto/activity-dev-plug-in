// 独立工程依赖：three @types/three @react-three/fiber@9 @react-three/drei@10 gsap
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import gsap from 'gsap';
function Shape({ reduced }: { reduced: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame((_, delta) => { if (mesh.current && !reduced) mesh.current.rotation.y += delta * .35; });
  return <mesh ref={mesh}><torusKnotGeometry args={[1, .28, 96, 16]}/><meshStandardMaterial color="#b5f26b" roughness={.3} metalness={.35}/></mesh>;
}
export default function App() {
  const root = useRef<HTMLDivElement>(null), [reduced, setReduced] = useState(true);
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => { if (reduced) return; const context = gsap.context(() => { gsap.from('.title', { y: 20, opacity: 0, duration: .8 }); }, root); return () => context.revert(); }, [reduced]);
  return <div ref={root}><h1 className="title">把灵感转成立体</h1><div style={{ height: 360 }} role="img" aria-label="可用鼠标旋转的绿色环形立体模型"><Canvas dpr={[1, 1.5]} frameloop={reduced ? 'demand' : 'always'} fallback={<p>当前设备不支持 WebGL，使用静态展示。</p>}><ambientLight intensity={1.5}/><directionalLight position={[3, 4, 5]} intensity={3}/><Shape reduced={reduced}/><OrbitControls enableZoom={false}/></Canvas></div></div>;
}
