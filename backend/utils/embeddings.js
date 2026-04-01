import { pipeline, env } from '@xenova/transformers';

// Configure local model cache to avoid downloading on every run
// Since this is dynamic in Node, we can set where models are downloaded
env.allowLocalModels = false; // Disable local enforcement so it works on Render
env.allowRemoteModels = true; // MUST be true to download models from HuggingFace on first boot
env.useBrowserCache = false;

class HFExtractor {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // Lazy load to prevent blocking on import
      // and only instantiate once
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

/**
 * Generate a 384-dimensional vector embedding for a given text.
 * @param {string} text - The input string to embed.
 * @returns {Promise<number[]>} - The vector embedding.
 */
export const generateEmbedding = async (text) => {
  try {
    const extractor = await HFExtractor.getInstance();
    
    // pooling: 'mean' and normalize: true are best practices for semantic search
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // output.data is a Float32Array
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};
