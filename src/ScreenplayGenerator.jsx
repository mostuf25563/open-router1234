import { useState, useEffect } from 'react';
import { useScreenplay } from './useScreenplay';
import { playScreenplay, stop } from './tts';
import './ScreenplayPlayer.css';

const LANGUAGES = ['English', 'Hebrew', 'Spanish', 'French', 'Russian', 'Chinese', 'Japanese', 'Arabic', 'German', 'Italian', 'Portuguese', 'Korean', 'Dutch', 'Polish', 'Turkish', 'Hindi'];

const LANGUAGE_COLORS = {
  'English': '#8b5cf6', // purple
  'Hebrew': '#3b82f6',  // blue
  'Spanish': '#10b981', // emerald
  'French': '#f59e0b',  // amber
  'Russian': '#ef4444', // red
  'Chinese': '#ec4899', // pink
  'Japanese': '#06b6d4', // cyan
  'Arabic': '#84cc16',  // lime
  'German': '#f97316',  // orange
  'Italian': '#6366f1', // indigo
  'Portuguese': '#14b8a6', // teal
  'Korean': '#8b5a2b', // brown
  'Dutch': '#64748b',   // slate
  'Polish': '#7c3aed',  // violet
  'Turkish': '#dc2626', // rose
  'Hindi': '#059669'    // green
};

export default function ScreenplayGenerator() {
  const [storypitch, setStorypitch] = useState(
           'Create a conversation between an adult and a child playing a guessing game'
);
  const [playing, setPlaying] = useState(false);
  const [narrator, setNarrator] = useState(false);
  const [characterLang, setCharacterLang] = useState(true);
  const [languagesUsed, setLanguagesUsed] = useState(['Arabic', 'Hebrew']);
  const [defaultScreenplayLanguage, setDefaultScreenplayLanguage] = useState('Hebrew');
  const [currentScene, setCurrentScene] = useState(-1);
  const [currentLine, setCurrentLine] = useState(-1);
  const [showFormat, setShowFormat] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [languageSpeeds, setLanguageSpeeds] = useState({});
  const [currentWord, setCurrentWord] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  // Override fields
  const [useOverrides, setUseOverrides] = useState(false);
  const [overrideApiKey, setOverrideApiKey] = useState('');
  const [overrideModel, setOverrideModel] = useState('');
  
  const { screenplay, loading, error, generate, format, models, selectedModel, setSelectedModel } = useScreenplay();

  // Initialize dark mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
    const darkParam = params.get('dark') === 'true';
    setDarkMode(darkParam);
  }, []);

  const handleGenerate = () => {
    setCurrentScene(-1);
    setCurrentLine(-1);
    setExpandedSections({});
    
    const model = useOverrides && overrideModel ? overrideModel : selectedModel;
    const apiKey = useOverrides && overrideApiKey ? overrideApiKey : null;
    
    generate(storypitch, languagesUsed, defaultScreenplayLanguage, model, apiKey);
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePlay = async () => {
    if (!screenplay) return;
    setPlaying(true);
    setCurrentScene(-1);
    setCurrentLine(-1);
    await playScreenplay(screenplay, {
      includeNarrator: narrator,
      characterMode: characterLang,
      languageSpeeds: { ...languageSpeeds }, // Pass a copy to avoid reference issues
      onLineStart: (sceneIdx, lineIdx) => {
        setCurrentScene(sceneIdx);
        setCurrentLine(lineIdx);
      },
      onWordStart: (word) => {
        setCurrentWord(word || '');
      }
    });
    setPlaying(false);
    setCurrentScene(-1);
    setCurrentLine(-1);
  };

  const handleStop = () => {
    stop();
    setPlaying(false);
    setCurrentScene(-1);
    setCurrentLine(-1);
  };

  const toggleLanguage = (lang) => {
    setLanguagesUsed(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const updateLanguageSpeed = (lang, speed) => {
    setLanguageSpeeds(prev => ({
      ...prev,
      [lang]: speed
    }));
  };

  const expandAll = () => {
    const newExpanded = {};
    const recurse = (obj, prefix = '') => {
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
          const key = `${prefix}.${idx}`;
          newExpanded[key] = true;
          recurse(item, key);
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([k, v]) => {
          const key = `${prefix}.${k}`;
          newExpanded[key] = true;
          recurse(v, key);
        });
      }
    };
    recurse(format, 'format');
    setExpandedSections(newExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const renderValue = (value, key = '') => {
    if (value === null || value === undefined) return <span className="null-value">null</span>;

    if (Array.isArray(value)) {
      const isExpanded = expandedSections[key];
      return (
        <div className="json-array">
          <button className="toggle-btn" onClick={() => toggleSection(key)}>
            {isExpanded ? '[-]' : '[+]'} Array ({value.length} items)
          </button>
          {isExpanded && (
            <div className="json-content">
              {value.map((item, idx) => (
                <div key={idx} className="json-item">
                  <strong>[{idx}]:</strong> {renderValue(item, `${key}.${idx}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expandedSections[key];
      return (
        <div className="json-object">
          <button className="toggle-btn" onClick={() => toggleSection(key)}>
            {isExpanded ? '[-]' : '[+]'} Object ({Object.keys(value).length} keys)
          </button>
          {isExpanded && (
            <div className="json-content">
              {Object.entries(value).map(([k, v]) => (
                <div key={k} className="json-property">
                  <strong>{k}:</strong> {renderValue(v, `${key}.${k}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span className="json-value">{String(value)}</span>;
  };

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <div className="section">
        <div className="header">
          <h2>Generate Screenplay</h2>
        </div>
        <div className="form-group">
          <label>Story pitch (optional)</label>
          <textarea
            placeholder="Enter your story pitch..."
            value={storypitch}
            onChange={(e) => setStorypitch(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Languages Used (for character dialogue)</label>
          <div className="lang-grid">
            {LANGUAGES.map(lang => (
              <label key={lang} className="lang-option">
                <input
                  type="checkbox"
                  checked={languagesUsed.includes(lang)}
                  onChange={() => toggleLanguage(lang)}
                  disabled={loading}
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Speech Speed by Language</label>
          <div className="speed-grid">
            {(screenplay?.languages_used || languagesUsed).map(lang => (
              <div key={lang} className="speed-control">
                <label>{lang}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={languageSpeeds[lang] || 1}
                  onChange={(e) => updateLanguageSpeed(lang, parseFloat(e.target.value))}
                  disabled={loading || playing}
                  title={`Speed: ${(languageSpeeds[lang] || 1).toFixed(1)}x`}
                />
                <span className="speed-value">{(languageSpeeds[lang] || 1).toFixed(1)}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Default Screenplay Language (for all text except the dialogs)</label>
          <select
            value={defaultScreenplayLanguage}
            onChange={(e) => setDefaultScreenplayLanguage(e.target.value)}
            disabled={loading}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <h3>Override Settings</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useOverrides}
              onChange={(e) => setUseOverrides(e.target.checked)}
              disabled={loading}
            />
            Use Custom API Key and/or Model
          </label>
        </div>

        {useOverrides && (
          <>
            <div className="form-group">
              <label>Custom API Key (optional)</label>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={overrideApiKey}
                onChange={(e) => setOverrideApiKey(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Custom Model (optional)</label>
              <input
                type="text"
                placeholder="e.g., mistralai/devstral-2512:free"
                value={overrideModel}
                onChange={(e) => setOverrideModel(e.target.value)}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Model</label>
          <select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading || !models || models.length === 0 || useOverrides}
          >
            {models && models.length ? (
              models.map(m => <option key={m} value={m}>{m}</option>)
            ) : (
              <option value="">Default</option>
            )}
          </select>
        </div>

        {format && (
          <div className="form-group">
            <h3 onClick={() => setShowFormat(!showFormat)} style={{ cursor: 'pointer', margin: '0 0 12px 0' }}>
              {showFormat ? '[-]' : '[+]'} Response Format Schema
            </h3>
            {showFormat && (
              <div className="expand-buttons">
                <button onClick={expandAll} className="expand-btn">
                  Expand All
                </button>
                <button onClick={collapseAll} className="collapse-btn">
                  Collapse All
                </button>
              </div>
            )}
            {showFormat && (
              <div className="format-display">
                {renderValue(format, 'format')}
              </div>
            )}
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Screenplay'}
        </button>
        {loading && <div className="loading-indicator">Generating screenplay...</div>}
        {error && <p className="error">{error}</p>}
      </div>

      {screenplay && (
        <div className="section">
          <h2>Generated Screenplay</h2>

          <div className="language-legend">
            <h3>Language Legend</h3>
            <div className="legend-items">
              {screenplay.languages_used?.map(lang => (
                <div key={lang} className="legend-item">
                  <div 
                    className="color-box" 
                    style={{ backgroundColor: LANGUAGE_COLORS[lang] || '#6b7280' }}
                  ></div>
                  <span>{lang}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="screenplay-preview">
            <h3>Quick Preview</h3>
            <div className="screenplay-info">
              <p><strong>Story Pitch:</strong> {screenplay.story_pitch}</p>
              <p><strong>Exposition:</strong> {screenplay.exposition}</p>
              <p><strong>Languages Used:</strong> {screenplay.languages_used?.join(', ')}</p>
              <p><strong>Cast:</strong> {screenplay.cast?.map(c => c.name).join(', ')}</p>
              <p><strong>Scenes:</strong> {screenplay.scenes?.length}</p>
            </div>
          </div>

          <div className="controls">
            <label>
              <input
                type="checkbox"
                checked={narrator}
                onChange={(e) => setNarrator(e.target.checked)}
                disabled={playing}
              />
              Narrator Mode
            </label>
            <label>
              <input
                type="checkbox"
                checked={characterLang}
                onChange={(e) => setCharacterLang(e.target.checked)}
                disabled={playing}
              />
              Character Languages
            </label>
          </div>

          <div className="buttons">
            <button
              onClick={handlePlay}
              disabled={playing || !screenplay}
              className="play"
            >
              {playing ? 'Playing...' : 'Play Screenplay'}
            </button>
            <button onClick={handleStop} disabled={!playing} className="stop">
              Stop
            </button>
          </div>

          <div className="full-screenplay">
            <h2>Complete Screenplay Structure</h2>
            {renderValue(screenplay, 'screenplay')}
          </div>

          <div className="readable-screenplay">
            <h2>Readable Format</h2>
            {screenplay.scenes?.map((scene, sceneIdx) => (
              <div key={sceneIdx} className="scene">
                <h3>{scene.scene_heading || `Scene ${sceneIdx + 1}`}</h3>
                <p className="scene-description">{scene.scene}</p>
                {scene.transition && <p className="transition">{scene.transition}</p>}
                {scene.dialogue?.map((line, lineIdx) => {
                  const isActive = sceneIdx === currentScene && lineIdx === currentLine;
                  const textWithHighlight = isActive && currentWord ? line.text.split(/(\s+)/).map((word, idx) => {
                    const isCurrentWord = word.trim() === currentWord?.trim();
                    return (
                      <span key={idx} className={isCurrentWord ? 'highlighted-word' : ''}>
                        {word}
                      </span>
                    );
                  }) : line.text;

                  const langColor = LANGUAGE_COLORS[line.language] || '#6b7280';

                  return (
                    <div
                      key={lineIdx}
                      className={`dialogue-line ${isActive ? 'active' : ''}`}
                      style={{ borderLeft: `4px solid ${langColor}` }}
                    >
                      <div className="character">{line.character}</div>
                      {line.parenthetical && <div className="parenthetical">({line.parenthetical})</div>}
                      <div className="line-text">
                        <span className="original">{textWithHighlight}</span>
                      </div>
                      {line.action && <div className="action">[{line.action}]</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}