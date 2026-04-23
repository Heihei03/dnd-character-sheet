import { Bio } from "../types/character";
import { Card, CardContent } from "./ui/card";
import { Camera, Trash2, Image as ImageIcon } from "lucide-react";

interface BioSectionProps {
  bio: Bio;
  onUpdate: (field: keyof Bio, value: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, onUpdate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Bio) => {
    onUpdate(field, e.target.value);
  };

  const inputClass = "w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 tracking-wide";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Crest Image Section */}
          <div className="flex flex-col items-center justify-center mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="relative group">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50 hover:border-blue-500 transition-colors shadow-inner">
                {bio.crestImageUrl ? (
                  <img src={bio.crestImageUrl} alt="Crest" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">No Crest<br/>Uploaded</span>
                  </div>
                )}
              </div>
              
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <label className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdate("crestImageUrl", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {bio.crestImageUrl && (
                  <button
                    onClick={() => onUpdate("crestImageUrl", "")}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
                    title="Remove Crest"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Family / Organization Crest</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelClass}>Alignment</label>
              <input
                type="text"
                value={bio.alignment || ""}
                onChange={(e) => handleChange(e, "alignment")}
                className={inputClass}
                placeholder="e.g., Chaotic Good"
              />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="text"
                value={bio.age || ""}
                onChange={(e) => handleChange(e, "age")}
                className={inputClass}
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <label className={labelClass}>Height</label>
              <input
                type="text"
                value={bio.height || ""}
                onChange={(e) => handleChange(e, "height")}
                className={inputClass}
                placeholder="e.g., 6'2&quot;"
              />
            </div>
            <div>
              <label className={labelClass}>Weight</label>
              <input
                type="text"
                value={bio.weight || ""}
                onChange={(e) => handleChange(e, "weight")}
                className={inputClass}
                placeholder="e.g., 180 lbs"
              />
            </div>
            <div>
              <label className={labelClass}>Eyes</label>
              <input
                type="text"
                value={bio.eyes || ""}
                onChange={(e) => handleChange(e, "eyes")}
                className={inputClass}
                placeholder="e.g., Blue"
              />
            </div>
            <div>
              <label className={labelClass}>Skin</label>
              <input
                type="text"
                value={bio.skin || ""}
                onChange={(e) => handleChange(e, "skin")}
                className={inputClass}
                placeholder="e.g., Fair"
              />
            </div>
            <div>
              <label className={labelClass}>Hair</label>
              <input
                type="text"
                value={bio.hair || ""}
                onChange={(e) => handleChange(e, "hair")}
                className={inputClass}
                placeholder="e.g., Blonde"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Appearance</label>
              <textarea
                value={bio.appearance || ""}
                onChange={(e) => handleChange(e, "appearance")}
                className={`${inputClass} min-h-[100px] resize-y`}
                placeholder="Describe your character's physical appearance..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Personality Traits</label>
                <textarea
                  value={bio.personalityTraits || ""}
                  onChange={(e) => handleChange(e, "personalityTraits")}
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="What are your character's prominent traits?"
                />
              </div>
              <div>
                <label className={labelClass}>Ideals</label>
                <textarea
                  value={bio.ideals || ""}
                  onChange={(e) => handleChange(e, "ideals")}
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="What does your character believe in?"
                />
              </div>
              <div>
                <label className={labelClass}>Bonds</label>
                <textarea
                  value={bio.bonds || ""}
                  onChange={(e) => handleChange(e, "bonds")}
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="Who or what is your character closely tied to?"
                />
              </div>
              <div>
                <label className={labelClass}>Flaws</label>
                <textarea
                  value={bio.flaws || ""}
                  onChange={(e) => handleChange(e, "flaws")}
                  className={`${inputClass} min-h-[100px] resize-y`}
                  placeholder="What are your character's weaknesses or vices?"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Character Backstory</label>
              <textarea
                value={bio.backstory || ""}
                onChange={(e) => handleChange(e, "backstory")}
                className={`${inputClass} min-h-[200px] resize-y`}
                placeholder="Write your character's history here..."
              />
            </div>

            <div>
              <label className={labelClass}>Allies & Organizations</label>
              <textarea
                value={bio.alliesAndOrganizations || ""}
                onChange={(e) => handleChange(e, "alliesAndOrganizations")}
                className={`${inputClass} min-h-[150px] resize-y`}
                placeholder="List any allies, friends, or organizations your character is affiliated with..."
              />
            </div>

            <div>
              <label className={labelClass}>Additional Features & Traits / Treasure</label>
              <textarea
                value={bio.treasure || ""}
                onChange={(e) => handleChange(e, "treasure")}
                className={`${inputClass} min-h-[150px] resize-y`}
                placeholder="List any extra traits, notes, or accumulated non-mechanical treasure..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BioSection;
