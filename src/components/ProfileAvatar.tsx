import React from 'react';
import { Sparkles, Flower2, TreeDeciduous, Activity, Radio, User, Leaf, Flame, Zap, Feather } from 'lucide-react';

interface ProfileAvatarProps {
  name: string;
  avatarSeed?: string;
  imageBlobUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isInteractive?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  avatarSeed = 'orchid',
  imageBlobUrl,
  size = 'md',
  className = '',
  isInteractive = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-28 h-28 text-3xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
  };

  const getSeedIcon = () => {
    switch (avatarSeed) {
      case 'orchid':
        return <Flower2 className={`${iconSizes[size]} text-[#EC4899] animate-pulse`} />;
      case 'roots':
        return <Activity className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      case 'canopy':
        return <TreeDeciduous className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      case 'phosphor':
        return <Sparkles className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      case 'radio':
        return <Radio className={`${iconSizes[size]} text-[#EC4899]`} />;
      case 'moss':
        return <Leaf className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      case 'fern':
        return <Feather className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      case 'ember':
        return <Flame className={`${iconSizes[size]} text-[#EC4899]`} />;
      case 'spore':
        return <Zap className={`${iconSizes[size]} text-[#A7F3D0]`} />;
      default:
        return <User className={`${iconSizes[size]} text-[#A7F3D0]`} />;
    }
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2 border-[#14352B] bg-[#030E0B] transition-all duration-300 shadow-md ${
        sizeClasses[size]
      } ${
        isInteractive ? 'group-hover:border-[#A7F3D0] group-hover:shadow-[0_0_15px_rgba(167,243,208,0.3)]' : ''
      } ${className}`}
    >
      {imageBlobUrl ? (
        <img
          src={imageBlobUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#061D16] to-[#030E0B]">
          {getSeedIcon()}
        </div>
      )}

      {/* Subtle CRT glass reflection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};
