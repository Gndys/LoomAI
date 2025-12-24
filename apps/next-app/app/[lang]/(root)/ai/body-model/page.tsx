"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import * as THREE from "three";

type Gender = "female" | "male";
type FieldValue = number | "";

type BodyFields = {
  heightCm: FieldValue;
  shoulderWidthCm: FieldValue;
  chestCm: FieldValue;
  waistCm: FieldValue;
  hipsCm: FieldValue;
  inseamCm: FieldValue;
  armLengthCm: FieldValue;
};

type BodyParams = {
  heightCm: number;
  shoulderWidthCm: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
  armLengthCm: number;
};

const DEFAULTS: Record<Gender, BodyParams> = {
  female: {
    heightCm: 165,
    shoulderWidthCm: 40,
    chestCm: 88,
    waistCm: 68,
    hipsCm: 94,
    inseamCm: 75,
    armLengthCm: 58,
  },
  male: {
    heightCm: 175,
    shoulderWidthCm: 46,
    chestCm: 96,
    waistCm: 82,
    hipsCm: 96,
    inseamCm: 80,
    armLengthCm: 62,
  },
};

const LIMITS: Record<keyof BodyParams, { min: number; max: number; step: number }> = {
  heightCm: { min: 140, max: 205, step: 0.5 },
  shoulderWidthCm: { min: 34, max: 55, step: 0.5 },
  chestCm: { min: 70, max: 125, step: 0.5 },
  waistCm: { min: 55, max: 120, step: 0.5 },
  hipsCm: { min: 75, max: 130, step: 0.5 },
  inseamCm: { min: 60, max: 105, step: 0.5 },
  armLengthCm: { min: 45, max: 80, step: 0.5 },
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toSafeNumber(value: FieldValue, fallback: number) {
  if (value === "") return fallback;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

function circumferenceToRadiusMeters(circumferenceCm: number) {
  return (circumferenceCm / (2 * Math.PI)) / 100;
}

type Mannequin = {
  root: THREE.Group;
  apply: (params: BodyParams) => void;
};

function createMannequin(gender: Gender): Mannequin {
  const root = new THREE.Group();
  root.name = "mannequin";

  const material = new THREE.MeshStandardMaterial({
    color: gender === "male" ? 0xd7c2aa : 0xe2c2b5,
    roughness: 0.85,
    metalness: 0.05,
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
  head.name = "head";

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 1), material);
  chest.name = "chest";

  const waist = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 1), material);
  waist.name = "waist";

  const hips = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 1), material);
  hips.name = "hips";

  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1), material);
  leftArm.name = "leftArm";
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1), material);
  rightArm.name = "rightArm";

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1), material);
  leftLeg.name = "leftLeg";
  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1), material);
  rightLeg.name = "rightLeg";

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  leftFoot.name = "leftFoot";
  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  rightFoot.name = "rightFoot";

  root.add(head, chest, waist, hips, leftArm, rightArm, leftLeg, rightLeg, leftFoot, rightFoot);

  const apply = (params: BodyParams) => {
    const heightM = clampNumber(params.heightCm, LIMITS.heightCm.min, LIMITS.heightCm.max) / 100;
    const shoulderWidthM = clampNumber(params.shoulderWidthCm, LIMITS.shoulderWidthCm.min, LIMITS.shoulderWidthCm.max) / 100;
    const chestRadius = clampNumber(circumferenceToRadiusMeters(params.chestCm), 0.11, 0.23);
    const waistRadius = clampNumber(circumferenceToRadiusMeters(params.waistCm), 0.09, 0.22);
    const hipsRadius = clampNumber(circumferenceToRadiusMeters(params.hipsCm), 0.11, 0.24);

    const inseamM = clampNumber(params.inseamCm, LIMITS.inseamCm.min, LIMITS.inseamCm.max) / 100;
    const footHeight = clampNumber(heightM * 0.035, 0.05, 0.08);
    const headHeight = clampNumber(heightM * 0.13, 0.19, 0.27);
    const neckHeight = clampNumber(heightM * 0.04, 0.05, 0.09);

    const torsoAvailable = heightM - inseamM - headHeight - neckHeight - footHeight;
    const torsoHeight = clampNumber(torsoAvailable, heightM * 0.22, heightM * 0.42);

    const chestHeight = torsoHeight * 0.38;
    const waistHeight = torsoHeight * 0.24;
    const hipsHeight = torsoHeight * 0.38;

    const legGap = shoulderWidthM * 0.12;
    const legXOffset = legGap + (hipsRadius * 0.35);
    const legRadius = clampNumber(hipsRadius * 0.28, 0.05, 0.11);

    const armLengthM = clampNumber(params.armLengthCm, LIMITS.armLengthCm.min, LIMITS.armLengthCm.max) / 100;
    const armRadius = clampNumber(chestRadius * 0.22, 0.035, 0.085);
    const shoulderX = shoulderWidthM / 2;

    const footLength = clampNumber(heightM * 0.14, 0.18, 0.28);
    const footWidth = clampNumber(legRadius * 1.4, 0.07, 0.13);

    const footY = footHeight / 2;
    const legY = footHeight + inseamM / 2;
    const hipsY = footHeight + inseamM + hipsHeight / 2;
    const waistY = footHeight + inseamM + hipsHeight + waistHeight / 2;
    const chestY = footHeight + inseamM + hipsHeight + waistHeight + chestHeight / 2;
    const neckY = footHeight + inseamM + torsoHeight + neckHeight / 2;
    const headY = footHeight + inseamM + torsoHeight + neckHeight + headHeight / 2;

    head.scale.set(headHeight / 2, headHeight / 2, headHeight / 2);
    head.position.set(0, headY, 0);

    chest.scale.set(chestRadius, chestHeight / 2, chestRadius);
    chest.position.set(0, chestY, 0);

    waist.scale.set(waistRadius, waistHeight / 2, waistRadius);
    waist.position.set(0, waistY, 0);

    hips.scale.set(hipsRadius, hipsHeight / 2, hipsRadius);
    hips.position.set(0, hipsY, 0);

    leftLeg.scale.set(legRadius, inseamM / 2, legRadius);
    leftLeg.position.set(-legXOffset, legY, 0);
    rightLeg.scale.set(legRadius, inseamM / 2, legRadius);
    rightLeg.position.set(legXOffset, legY, 0);

    leftFoot.scale.set(footWidth, footHeight, footLength);
    leftFoot.position.set(-legXOffset, footY, footLength * 0.25);
    rightFoot.scale.set(footWidth, footHeight, footLength);
    rightFoot.position.set(legXOffset, footY, footLength * 0.25);

    leftArm.scale.set(armRadius, (armLengthM * 0.9) / 2, armRadius);
    rightArm.scale.set(armRadius, (armLengthM * 0.9) / 2, armRadius);

    const armY = chestY + chestHeight * 0.18;
    leftArm.position.set(-shoulderX, armY, 0);
    rightArm.position.set(shoulderX, armY, 0);

    leftArm.rotation.set(0, 0, Math.PI / 2.25);
    rightArm.rotation.set(0, 0, -Math.PI / 2.25);

    root.position.set(0, 0, 0);
  };

  return { root, apply };
}

type ViewerHandle = {
  screenshot: () => string | null;
  resetView: () => void;
  applyParams: (params: BodyParams, gender: Gender) => void;
};

function useThreeViewer(): [React.RefObject<HTMLDivElement | null>, React.MutableRefObject<ViewerHandle | null>] {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ViewerHandle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(0, 1.55, 3.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(2.5, 4, 2);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-2.2, 2, 1.5);
    scene.add(ambientLight, keyLight, fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = false;
    scene.add(ground);

    const avatarPivot = new THREE.Group();
    avatarPivot.position.set(0, 0, 0);
    scene.add(avatarPivot);

    let mannequin: Mannequin | null = null;
    let currentGender: Gender = "female";

    const setMannequin = (gender: Gender, params: BodyParams) => {
      currentGender = gender;
      if (mannequin) avatarPivot.remove(mannequin.root);
      mannequin = createMannequin(gender);
      mannequin.apply(params);
      avatarPivot.add(mannequin.root);
    };

    setMannequin("female", DEFAULTS.female);

    const state = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      yaw: 0.6,
      pitch: 0.05,
      zoom: 1,
    };

    const applyView = () => {
      const pitch = clampNumber(state.pitch, -0.7, 0.55);
      avatarPivot.rotation.set(pitch, state.yaw, 0);
      const baseZ = 3.1;
      camera.position.set(0, 1.55, baseZ * (1 / state.zoom));
      camera.lookAt(0, 1.1, 0);
    };

    const onPointerDown = (event: PointerEvent) => {
      state.dragging = true;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.yaw += dx * 0.008;
      state.pitch += dy * 0.008;
    };

    const onPointerUp = () => {
      state.dragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = Math.sign(event.deltaY);
      const next = delta > 0 ? state.zoom * 0.92 : state.zoom * 1.08;
      state.zoom = clampNumber(next, 0.65, 1.6);
    };

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let rafId = 0;
    const tick = () => {
      applyView();
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    };
    tick();

    handleRef.current = {
      screenshot: () => {
        try {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL("image/png");
        } catch {
          return null;
        }
      },
      resetView: () => {
        state.yaw = 0.6;
        state.pitch = 0.05;
        state.zoom = 1;
      },
      applyParams: (params: BodyParams, gender: Gender) => {
        if (gender !== currentGender) {
          setMannequin(gender, params);
          return;
        }
        mannequin?.apply(params);
      },
    };

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel as any);
      container.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          mesh.geometry?.dispose?.();
          const material = mesh.material;
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose?.());
          } else {
            material?.dispose?.();
          }
        }
      });
      renderer.dispose();
      mannequin = null;
      handleRef.current = null;
    };
  }, []);

  return [containerRef, handleRef];
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function BodyModelPage() {
  const { t } = useTranslation();
  const [gender, setGender] = useState<Gender>("female");

  const [fields, setFields] = useState<BodyFields>(() => ({ ...DEFAULTS.female }));

  const params = useMemo<BodyParams>(() => {
    const defaults = DEFAULTS[gender];
    return {
      heightCm: clampNumber(toSafeNumber(fields.heightCm, defaults.heightCm), LIMITS.heightCm.min, LIMITS.heightCm.max),
      shoulderWidthCm: clampNumber(
        toSafeNumber(fields.shoulderWidthCm, defaults.shoulderWidthCm),
        LIMITS.shoulderWidthCm.min,
        LIMITS.shoulderWidthCm.max,
      ),
      chestCm: clampNumber(toSafeNumber(fields.chestCm, defaults.chestCm), LIMITS.chestCm.min, LIMITS.chestCm.max),
      waistCm: clampNumber(toSafeNumber(fields.waistCm, defaults.waistCm), LIMITS.waistCm.min, LIMITS.waistCm.max),
      hipsCm: clampNumber(toSafeNumber(fields.hipsCm, defaults.hipsCm), LIMITS.hipsCm.min, LIMITS.hipsCm.max),
      inseamCm: clampNumber(toSafeNumber(fields.inseamCm, defaults.inseamCm), LIMITS.inseamCm.min, LIMITS.inseamCm.max),
      armLengthCm: clampNumber(
        toSafeNumber(fields.armLengthCm, defaults.armLengthCm),
        LIMITS.armLengthCm.min,
        LIMITS.armLengthCm.max,
      ),
    };
  }, [fields, gender]);

  const [viewerContainerRef, viewerHandleRef] = useThreeViewer();

  useEffect(() => {
    viewerHandleRef.current?.applyParams(params, gender);
  }, [viewerHandleRef, params, gender]);

  const setField = useCallback(<K extends keyof BodyFields>(key: K, value: FieldValue) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setFields({ ...DEFAULTS[gender] });
    viewerHandleRef.current?.resetView();
  }, [gender, viewerHandleRef]);

  const onGenderChange = useCallback(
    (value: Gender) => {
      setGender(value);
      setFields({ ...DEFAULTS[value] });
    },
    [setGender],
  );

  const saveScreenshot = useCallback(() => {
    const dataUrl = viewerHandleRef.current?.screenshot();
    if (!dataUrl) {
      toast.error(t.ai.bodyModel.controls.screenshotFailed);
      return;
    }
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    downloadDataUrl(dataUrl, `body-model-${gender}-${timestamp}.png`);
    toast.success(t.ai.bodyModel.controls.screenshotSaved);
  }, [viewerHandleRef, t, gender]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t.ai.bodyModel.title}</h1>
          <p className="text-sm text-muted-foreground">{t.ai.bodyModel.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.ai.bodyModel.viewer.title}</CardTitle>
              <CardDescription>{t.ai.bodyModel.viewer.helper}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[520px] w-full rounded-lg bg-gradient-to-b from-muted/30 to-muted/60">
                <div ref={viewerContainerRef} className="absolute inset-0" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button type="button" onClick={saveScreenshot} className="gap-2">
                  <Download className="h-4 w-4" />
                  {t.ai.bodyModel.controls.saveScreenshot}
                </Button>
                <Button type="button" variant="outline" onClick={reset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t.ai.bodyModel.controls.reset}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.ai.bodyModel.controls.title}</CardTitle>
              <CardDescription>{t.ai.bodyModel.controls.helper}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>{t.ai.bodyModel.controls.genderLabel}</Label>
                <Select value={gender} onValueChange={(value) => onGenderChange(value as Gender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">{t.ai.bodyModel.controls.female}</SelectItem>
                    <SelectItem value="male">{t.ai.bodyModel.controls.male}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heightCm">{t.ai.bodyModel.controls.heightCm}</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.heightCm.step}
                    min={LIMITS.heightCm.min}
                    max={LIMITS.heightCm.max}
                    value={fields.heightCm}
                    onChange={(event) => setField("heightCm", event.target.value === "" ? "" : Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shoulderWidthCm">{t.ai.bodyModel.controls.shoulderWidthCm}</Label>
                  <Input
                    id="shoulderWidthCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.shoulderWidthCm.step}
                    min={LIMITS.shoulderWidthCm.min}
                    max={LIMITS.shoulderWidthCm.max}
                    value={fields.shoulderWidthCm}
                    onChange={(event) =>
                      setField("shoulderWidthCm", event.target.value === "" ? "" : Number(event.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chestCm">{t.ai.bodyModel.controls.chestCm}</Label>
                  <Input
                    id="chestCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.chestCm.step}
                    min={LIMITS.chestCm.min}
                    max={LIMITS.chestCm.max}
                    value={fields.chestCm}
                    onChange={(event) => setField("chestCm", event.target.value === "" ? "" : Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waistCm">{t.ai.bodyModel.controls.waistCm}</Label>
                  <Input
                    id="waistCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.waistCm.step}
                    min={LIMITS.waistCm.min}
                    max={LIMITS.waistCm.max}
                    value={fields.waistCm}
                    onChange={(event) => setField("waistCm", event.target.value === "" ? "" : Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hipsCm">{t.ai.bodyModel.controls.hipsCm}</Label>
                  <Input
                    id="hipsCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.hipsCm.step}
                    min={LIMITS.hipsCm.min}
                    max={LIMITS.hipsCm.max}
                    value={fields.hipsCm}
                    onChange={(event) => setField("hipsCm", event.target.value === "" ? "" : Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inseamCm">{t.ai.bodyModel.controls.inseamCm}</Label>
                  <Input
                    id="inseamCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.inseamCm.step}
                    min={LIMITS.inseamCm.min}
                    max={LIMITS.inseamCm.max}
                    value={fields.inseamCm}
                    onChange={(event) => setField("inseamCm", event.target.value === "" ? "" : Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="armLengthCm">{t.ai.bodyModel.controls.armLengthCm}</Label>
                  <Input
                    id="armLengthCm"
                    type="number"
                    inputMode="decimal"
                    step={LIMITS.armLengthCm.step}
                    min={LIMITS.armLengthCm.min}
                    max={LIMITS.armLengthCm.max}
                    value={fields.armLengthCm}
                    onChange={(event) =>
                      setField("armLengthCm", event.target.value === "" ? "" : Number(event.target.value))
                    }
                  />
                </div>
              </div>

              <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{t.ai.bodyModel.disclaimer.title}</p>
                <p className="mt-1">{t.ai.bodyModel.disclaimer.body}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
