'use client';

import { 
  Zap, 
  Brain, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Globe, 
  Code, 
  Music,
  Palette,
  Calculator,
  Microscope,
  Atom,
  Dna,
  Leaf,
  Rocket,
  LucideIcon
} from 'lucide-react';

// Map of subject titles to icons
const iconMap: Record<string, LucideIcon> = {
  'Physics': Zap,
  'Mathematics': Calculator,
  'Chemistry': Atom,
  'Biology': Dna,
  'Computer Science': Code,
  'Geography': Globe,
  'Literature': BookOpen,
  'Art': Palette,
  'Music': Music,
  'Astronomy': Rocket,
  'Botany': Leaf,
  'Microbiology': Microscope,
  'Psychology': Brain,
  'Philosophy': Lightbulb,
  // Default icon for any other subject
  'default': Sparkles
};

// Map of subject titles to gradient colors
const colorMap: Record<string, string> = {
  'Physics': 'from-blue-400 to-cyan-300',
  'Mathematics': 'from-emerald-400 to-teal-300',
  'Chemistry': 'from-amber-400 to-yellow-300',
  'Biology': 'from-rose-400 to-pink-300',
  'Computer Science': 'from-indigo-400 to-purple-300',
  'Geography': 'from-green-400 to-emerald-300',
  'Literature': 'from-orange-400 to-amber-300',
  'Art': 'from-fuchsia-400 to-pink-300',
  'Music': 'from-violet-400 to-purple-300',
  'Astronomy': 'from-blue-500 to-indigo-300',
  'Botany': 'from-green-500 to-lime-300',
  'Microbiology': 'from-teal-400 to-cyan-300',
  'Psychology': 'from-purple-400 to-violet-300',
  'Philosophy': 'from-amber-500 to-yellow-400',
  // Default gradient for any other subject
  'default': 'from-gray-400 to-slate-300'
};

export function getSubjectIcon(title: string): LucideIcon {
  return iconMap[title] || iconMap.default;
}

export function getSubjectColor(title: string): string {
  return colorMap[title] || colorMap.default;
}

interface SubjectIconProps {
  title: string;
  className?: string;
}

export function SubjectIcon({ title, className = '' }: SubjectIconProps) {
  const Icon = getSubjectIcon(title);
  return <Icon className={className} />;
}
