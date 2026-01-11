const synth = window.speechSynthesis;

const langToISO = {
  'English': 'en-US',
  'Hebrew': 'he-IL',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'Russian': 'ru-RU',
  'Chinese': 'zh-CN',
  'Japanese': 'ja-JP',
  'Arabic': 'ar-SA',
  'German': 'de-DE',
  'Italian': 'it-IT',
  'Portuguese': 'pt-PT',
  'Korean': 'ko-KR',
  'Dutch': 'nl-NL',
  'Polish': 'pl-PL',
  'Turkish': 'tr-TR',
  'Hindi': 'hi-IN'
};

export const convertLangToISO = (lang) => langToISO[lang] || 'en-US';

export const speak = (text, lang = 'English', rate = 1, onStart) => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = convertLangToISO(lang);
    console.log('current lang:', utterance.lang, lang, text)
    utterance.rate = rate;
    if (onStart) utterance.onstart = onStart;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    synth.speak(utterance);
  });
};

export const stop = () => {
  synth.cancel();
};

export const playScreenplay = async (screenplay, options = {}) => {
  const { includeNarrator = false, characterMode = true, onLineStart } = options;
  const scenes = screenplay.scenes || [];

  for (let sceneIdx = 0; sceneIdx < scenes.length; sceneIdx++) {
    const scene = scenes[sceneIdx];

    if (includeNarrator && scene.scene) {
      await speak(`Scene: ${scene.scene}`, 'English', 1);
    }

    const dialogue = scene.dialogue || [];
    for (let lineIdx = 0; lineIdx < dialogue.length; lineIdx++) {
      const line = dialogue[lineIdx];

      if (includeNarrator && line.character) {
        await speak(`${line.character}`, 'English', 1);
      }

      const lang = characterMode && line.language ? line.language : 'English';
      const text = line.text || line.translation || '';

      await speak(text, lang, 1, () => {
        if (onLineStart) onLineStart(sceneIdx, lineIdx);
      });
    }
  }

  if (onLineStart) onLineStart(-1, -1);
};
