"use client";

import { useState } from "react";
import Image from "next/image";

export default function Avatar({ 
  user, 
  profile, 
  size = "w-8 h-8", 
  textSize = "text-xs", 
  className = "",
  // Props alternativas para compatibilidad con el uso anterior
  src,
  alt,
  style = {} 
}) {
  const [imageError, setImageError] = useState(false);

  // Determinar la fuente de la imagen
  const avatarSrc = src || profile?.avatar_url;
  
  // Determinar el texto alternativo y las iniciales
  const avatarAlt = alt || `Avatar de ${profile?.full_name || user?.email}`;
  const initials = (profile?.full_name || user?.email || alt || 'U')
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (imageError || !avatarSrc) {
    // Mostrar avatar con iniciales si hay error o no hay imagen
    return (
      <div 
        className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium ${textSize} border-2 ${className}`}
        style={{ 
          borderColor: 'var(--primary)',
          ...style
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${size} relative ${className}`} style={style}>
      <Image
        src={avatarSrc}
        alt={avatarAlt}
        fill
        className="rounded-full object-cover border-2"
        style={{ borderColor: 'var(--primary)' }}
        onError={() => setImageError(true)}
        unoptimized={avatarSrc?.includes('googleusercontent.com')} // Para Google avatars
        priority={false}
      />
    </div>
  );
}
