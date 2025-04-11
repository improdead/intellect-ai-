'use client';

import React from 'react';
import ChatInterface from '@/components/chat-interface';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function IntelectPage() {
  const [useThinkingModel, setUseThinkingModel] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setUseThinkingModel(checked);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(space.16))]">
      {/* Model Selection Controls */}
      <div className="p-2 border-b border-gray-800 flex justify-end items-center bg-black text-white">
        <div className="flex items-center space-x-2">
          <Switch
            id="thinking-model-toggle"
            checked={useThinkingModel}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="thinking-model-toggle" className="text-sm text-gray-300">Use Gemini 2.5 Pro (otherwise Gemma 3 12B)</Label>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface useThinkingModel={useThinkingModel} />
      </div>
    </div>
  );
}
