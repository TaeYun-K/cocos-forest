import React, { useMemo, useRef, useLayoutEffect, useState, Suspense, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrthographicCamera, OrbitControls, useGLTF } from '@react-three/drei/native';
import { Asset } from 'expo-asset';
import * as THREE from 'three';


const GRID = 8;
const TILE = 1;
const THICK = 0.12;
const GAP = 0.02;
const MARKER_SIZE = TILE * 0.5;

type Cell = { pos: THREE.Vector3; grid: { x: number; z: number } };
type Marker = { pos: THREE.Vector3; grid: { x: number; z: number } };

const toWorld = (x: number, z: number) => {
  const half = (GRID * (TILE + GAP) - GAP) / 2;
  const px = x * (TILE + GAP) - half + TILE / 2;
  const pz = z * (TILE + GAP) - half + TILE / 2;
  const py = THICK / 2;
  return new THREE.Vector3(px, py, pz);
};

function CheckerBoard({
  onPick,
  highlighted,
}: {
  onPick: (cell: Cell) => void;
  highlighted?: Cell | null;
}) {
  const evenRef = useRef<THREE.InstancedMesh>(null!);
  const oddRef = useRef<THREE.InstancedMesh>(null!);

  const { evenCells, oddCells } = useMemo(() => {
    const even: Cell[] = [];
    const odd: Cell[] = [];
    for (let z = 0; z < GRID; z++) {
      for (let x = 0; x < GRID; x++) {
        const cell: Cell = { pos: toWorld(x, z), grid: { x, z } };
        ((x + z) % 2 === 0 ? even : odd).push(cell);
      }
    }
    return { evenCells: even, oddCells: odd };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const setMatrices = (mesh: THREE.InstancedMesh, cells: Cell[]) => {
      cells.forEach((c, i) => {
        dummy.position.copy(c.pos);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(TILE, THICK, TILE);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    if (evenRef.current) setMatrices(evenRef.current, evenCells);
    if (oddRef.current) setMatrices(oddRef.current, oddCells);
  }, [dummy, evenCells, oddCells]);

  const onClickEven = (e: any) => {
    const i = e.instanceId as number;
    if (i != null) onPick(evenCells[i]);
  };
  const onClickOdd = (e: any) => {
    const i = e.instanceId as number;
    if (i != null) onPick(oddCells[i]);
  };

  return (
    <>
      <instancedMesh
        ref={evenRef}
        args={[undefined as any, undefined as any, evenCells.length]}
        onClick={onClickEven}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="#1b4d1b" />
      </instancedMesh>

      <instancedMesh
        ref={oddRef}
        args={[undefined as any, undefined as any, oddCells.length]}
        onClick={onClickOdd}
        castShadow
        receiveShadow
      >
        <boxGeometry />
        <meshStandardMaterial color="#8fd694" />
      </instancedMesh>

      {highlighted && (
        <mesh
          position={[
            highlighted.pos.x,
            highlighted.pos.y + THICK * 0.52,
            highlighted.pos.z,
          ]}
        >
          <boxGeometry args={[TILE * 1.02, THICK * 0.22, TILE * 1.02]} />
          <meshStandardMaterial color="#ffd54f" emissive="#ffd54f" emissiveIntensity={0.7} />
        </mesh>
      )}
    </>
  );
}

function Markers({
  markers,
  onPick,
  colors = ['#4fc3f7', '#ff8a65', '#ba68c8'],
}: {
  markers: Marker[];
  onPick: (cell: Cell) => void;
  colors?: string[];
}) {
  return (
    <>
      {markers.map((m, i) => {
        const y = m.pos.y + THICK / 2 + MARKER_SIZE / 2;
        return (
          <mesh
            key={`${m.grid.x},${m.grid.z}`}
            position={[m.pos.x, y, m.pos.z]}
            castShadow
            onClick={() => onPick({ pos: m.pos, grid: m.grid })}
          >
            <boxGeometry args={[MARKER_SIZE, MARKER_SIZE, MARKER_SIZE]} />
            <meshStandardMaterial color={colors[i % colors.length]} />
          </mesh>
        );
      })}
    </>
  );
}

/** 아이소메트릭 직교 카메라 (초기 확대 더 크게) */
function IsoOrthoCamera() {
  const worldSpan = GRID * (TILE + GAP);
  const d = worldSpan * 1.5;
  const zoom = Math.max(1, 220 / GRID);
  return <OrthographicCamera makeDefault position={[d, d, d]} near={0.1} far={5000} zoom={zoom} />;
}

const TREE_SRC = require('../../assets/low_poly_tree.glb');

function Tree({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  rotationY = 0,
}) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    const asset = Asset.fromModule(TREE_SRC);
    asset.downloadAsync().then(() => {
      setUri(asset.localUri ?? asset.uri); // file:// or asset://
    });
  }, []);

  if (!uri) return null;
  const gltf: any = useGLTF(uri);
  return (
    <primitive object={gltf.scene} position={position} scale={scale} rotation={[0, rotationY, 0]} dispose={null} />
  );
}


const HomeScreen = () => {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [visible, setVisible] = useState(false);

  // 랜덤 마커 3개
  const markers = useMemo<Marker[]>(() => {
    const set = new Set<string>();
    while (set.size < 3) {
      const x = Math.floor(Math.random() * GRID);
      const z = Math.floor(Math.random() * GRID);
      set.add(`${x},${z}`);
    }
    return Array.from(set).map((s) => {
      const [x, z] = s.split(',').map(Number);
      return { grid: { x, z }, pos: toWorld(x, z) };
    });
  }, []);

  const markerKeySet = useMemo(
    () => new Set(markers.map((m) => `${m.grid.x},${m.grid.z}`)),
    [markers]
  );

  const handlePick = (cell: Cell) => {
    setSelected(cell);
    setVisible(true);
  };

  const isMarked = selected && markerKeySet.has(`${selected.grid.x},${selected.grid.z}`);

  // 타일 중앙 위치 계산, 나무
  const centerIdx = Math.floor(GRID / 2) - 1;
  const centerTilePos = toWorld(centerIdx, centerIdx);

  return (
      <View style={styles.canvasWrap}>
        <Canvas shadows>
          <IsoOrthoCamera />

          <ambientLight intensity={0.65} />
          <directionalLight position={[8, 12, 6]} intensity={0.95} castShadow />

          <CheckerBoard onPick={handlePick} highlighted={selected} />
          <Markers markers={markers} onPick={handlePick} />

          {/* ⬇️ 4) 나무 배치: (7,7) 타일 중앙 위에 올림 */}
          <Suspense fallback={null}>
           <Tree position={[centerTilePos.x, THICK, centerTilePos.z]} scale={0.8}/>
          </Suspense>

          <OrbitControls
            makeDefault
            enableRotate={false}
            enablePan
            enableZoom
            touches={{ ONE: 1, TWO: 2 }}
            screenSpacePanning
            panSpeed={2.0}
            zoomSpeed={1.6}
            minZoom={20 / GRID}
            maxZoom={600 / GRID}
            target={[0, 0, 0]}
          />
        </Canvas>

      {/* 모달 (기존 그대로) */}
      {/* 조건별 모달 */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>타일 정보</Text>
            <Text style={styles.modalText}>
              좌표: x = {selected?.grid.x}, z = {selected?.grid.z}
            </Text>
            <Text style={styles.modalHint}>
              {isMarked ? '설명: 물주기' : '설명: 나무심기'}
            </Text>
            <Pressable style={styles.modalBtn} onPress={() => setVisible(false)}>
              <Text style={styles.modalBtnText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1111' },
  canvasWrap: { flex: 1 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: 300,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e1f24',
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  modalText: { fontSize: 16, color: '#dcdcdc' },
  modalHint: { fontSize: 15, color: '#a8e6cf' },
  modalBtn: {
    marginTop: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '700' },
});

export default HomeScreen;
