import React from "react";
import { Home, Mic, BookOpen, Info } from "lucide-react";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { useAudioContext } from "../../contexts/AudioContext";

function Sidebar() {
  const { isLargeOpen, toggle, close } = useSidebarContext();
  const { language, setLanguage, model, setModel } = useAudioContext();

  return (
    <aside
      className={`bg-[#EFE9E1] p-4 ${
        isLargeOpen ? "w-64" : "w-16"
      } transition-all duration-300 z-40`}
    >
      <button
        onClick={toggle}
        className="p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
        aria-label={isLargeOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isLargeOpen ? "<" : ">"}
      </button>
      <nav className="space-y-4">
        <a
          href="/"
          className="flex items-center p-2 hover:bg-[#73A1B2] hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
        >
          <Home className="w-6 h-6 mr-2 text-[#73A1B2]" />
          {isLargeOpen && <span className="text-gray-800">Home</span>}
        </a>
        <a
          href="/check-pronunciations"
          className="flex items-center p-2 hover:bg-[#73A1B2] hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
        >
          <Mic className="w-6 h-6 mr-2 text-[#73A1B2]" />
          {isLargeOpen && (
            <span className="text-gray-800">Check Pronunciations</span>
          )}
        </a>
        <a
          href="/practice-samples"
          className="flex items-center p-2 hover:bg-[#73A1B2] hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-[#73A1B2}"
        >
          <BookOpen className="w-6 h-6 mr-2 text-[#73A1B2]" />
          {isLargeOpen && (
            <span className="text-gray-800">Practice Samples</span>
          )}
        </a>
        <a
          href="/about"
          className="flex items-center p-2 hover:bg-[#73A1B2] hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-[#73A1B2}"
        >
          <Info className="w-6 h-6 mr-2 text-[#73A1B2]" />
          {isLargeOpen && <span className="text-gray-800">About</span>}
        </a>
      </nav>
      {isLargeOpen && (
        <div className="mt-4 p-4 space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-md font-medium text-gray-800"
            >
              Language:
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full p-2 border border-[#73A1B2] rounded bg-[#EFE9E1] focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
              aria-label="Select language"
            >
              <option value="eng">English</option>
              <option value="np">Nepali</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="model"
              className="block text-md font-medium text-gray-800"
            >
              Model:
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 w-full p-2 border border-[#73A1B2] rounded bg-[#EFE9E1] focus:outline-none focus:ring-2 focus:ring-[#73A1B2]"
              aria-label="Select model"
            >
              <option value="whisper">Whisper</option>
              <option value="wav2vec2">Wav2Vec2.0</option>
            </select>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
