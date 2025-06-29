/**
 * Loads and validates a LumaBoard config from a file, URL, or localStorage.
 * @param {Object} options - { url, file, localStorageKey }
 * @returns {Promise<Object>} - Resolves with config object or rejects with error.
 */
export async function loadConfig(options = {}) {
  let configText;
  try {
    if (options.url) {
      const res = await fetch(options.url);
      if (!res.ok) throw new Error('Failed to fetch config from URL');
      configText = await res.text();
    } else if (options.file) {
      configText = await options.file.text();
    } else if (options.localStorageKey) {
      configText = localStorage.getItem(options.localStorageKey);
      if (!configText) throw new Error('No config found in localStorage');
    } else {
      // Default: try to load configs in order of preference
      const configSources = [
        './config/phase3-demo-config.json',  // Phase 3 Demo configuration
        './config/phase2-demo-config.json',  // Phase 2 Demo configuration
        './config/config.json',              // User configuration
        './config/example-config.json'       // Example configuration
      ];
      
      let configLoaded = false;
      for (const source of configSources) {
        try {
          const res = await fetch(source);
          if (res.ok) {
            configText = await res.text();
            configLoaded = true;
            console.log(`ConfigLoader: Loaded configuration from ${source}`);
            break;
          }
        } catch (err) {
          // Continue to next source
        }
      }
      
      if (!configLoaded) {
        throw new Error('No config source specified and no default config available');
      }
    }
    const config = JSON.parse(configText);
    validateConfig(config);
    return config;
  } catch (err) {
    throw new Error('Config load/validation error: ' + err.message);
  }
}

/**
 * Basic config schema validation (expand as needed).
 * Throws error if invalid.
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new Error('Config is not an object');
  if (!Array.isArray(config.scenes)) throw new Error('Config missing scenes array');
  
  // Validate each scene
  config.scenes.forEach((scene, index) => {
    if (!scene.name) throw new Error(`Scene ${index} missing name`);
    if (!Array.isArray(scene.widgets)) throw new Error(`Scene ${scene.name} missing widgets array`);
  });
  
  // Add more schema checks as needed
} 