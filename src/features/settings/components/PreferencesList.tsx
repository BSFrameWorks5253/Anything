import React, { useState } from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassToggle } from '../../../components/ui/GlassToggle';

interface PreferenceItem {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

export const PreferencesList: React.FC = () => {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    hardwareAcceleration: true,
    rayTracingMetal: true,
    neuralEngine: true,
    autoUpdate: true,
    visionOSSync: true,
    telemetry: false,
  });

  const items: PreferenceItem[] = [
    {
      id: 'hardwareAcceleration',
      label: 'Apple Metal 4 Hardware Acceleration',
      description: 'Leverages GPU shaders for real-time liquid glass, depth blur, and canvas zooming.',
      defaultChecked: true,
    },
    {
      id: 'rayTracingMetal',
      label: 'Real-time Specular Liquid Refraction',
      description: 'Computes physical caustics and glass reflections with hardware ray tracing.',
      defaultChecked: true,
    },
    {
      id: 'neuralEngine',
      label: 'Apple Neural Engine (ANE) Inference',
      description: 'Run generative image synthesis and vocal isolation entirely on-device without cloud latency.',
      defaultChecked: true,
    },
    {
      id: 'visionOSSync',
      label: 'Continuous Spatial Handoff',
      description: 'Automatically broadcast open canvases to Apple Vision Pro via Spatial Persona.',
      defaultChecked: true,
    },
    {
      id: 'autoUpdate',
      label: 'Automatic Background App Updates',
      description: 'Silently fetch and install verified delta updates when idle.',
      defaultChecked: true,
    },
    {
      id: 'telemetry',
      label: 'Share Anonymous Spatial Diagnostics',
      description: 'Send crash dumps and GPU thermal metrics to help improve Metal stability.',
      defaultChecked: false,
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          Hardware & Engine Preferences
        </h3>
        <span className="text-[11px] text-zinc-500 dark:text-white/40 font-mono font-medium">Windows 11 x64</span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 divide-y divide-zinc-200 dark:divide-white/[0.06]">
        {items.map((item) => (
          <GlassToggle
            key={item.id}
            label={item.label}
            description={item.description}
            checked={preferences[item.id] ?? item.defaultChecked}
            onChange={(checked) => handleToggle(item.id, checked)}
          />
        ))}
      </GlassCard>
    </section>
  );
};
