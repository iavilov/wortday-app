import { Colors } from '@/constants/design-tokens';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

interface BrutalIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  active?: boolean;
  fill?: string;
}

export const BrutalIcon = ({
  Icon,
  size = 24,
  color = Colors.border,
  strokeWidth = 2.5,
  active = false,
  fill,
}: BrutalIconProps) => (
  <Icon
    size={size}
    color={color}
    strokeWidth={active ? 3 : strokeWidth}
    fill={fill ?? (active ? Colors.primary : 'none')}
  />
);
