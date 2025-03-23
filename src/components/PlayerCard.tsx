
import { useState } from "react";
import { normalizeImageUrl } from "../utils/imageUtils";
import { Link } from "lucide-react";

type PlayerCardProps = {
  name: string;
  image: string;
  achievements: string[];
  role: string;
  index: number;
  id?: string; // Optional id prop
  joinDate?: string; // Optional joinDate prop
  smogon?: string; // Optional smogon profile URL
};

const PlayerCard = ({ name, image, achievements, role, index, id, joinDate, smogon }: PlayerCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image: ${image}`);
    setImageError(true);
  };
  
  // Use our utility to normalize the image URL before rendering
  const normalizedImageUrl = normalizeImageUrl(image);

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12">
      <div className="shrink-0 w-60 h-60 overflow-hidden rounded-lg border border-white/10 shadow-md">
        {smogon ? (
          <a href={smogon} target="_blank" rel="noopener noreferrer" title={`Visit ${name}'s Smogon profile`}>
            <img
              src={imageError ? "/placeholder.svg" : normalizedImageUrl}
              alt={name}
              className="w-full h-full object-cover object-center transition-transform hover:scale-105 cursor-pointer"
              onError={handleImageError}
            />
          </a>
        ) : (
          <img
            src={imageError ? "/placeholder.svg" : normalizedImageUrl}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform hover:scale-105"
            onError={handleImageError}
          />
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {name}
          {smogon && (
            <a href={smogon} target="_blank" rel="noopener noreferrer" className="inline-flex items-center ml-2 text-sm text-[#D946EF] hover:text-[#D946EF]/80 transition-colors">
              <Link size={16} className="mr-1" />
            
            </a>
          )}
        </h3>
        <p className="text-[#D946EF] font-medium mb-2">{role}</p>
        {joinDate && <p className="text-gray-400 text-sm mb-3">Join Date: {joinDate}</p>}
        <ul className="text-base text-gray-300 space-y-2 mt-2">
          {achievements.map((achievement, i) => (
            <li key={i} className="flex items-start">
              <span className="text-[#D946EF] mr-2">•</span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerCard;
