// Mock implementation for browser compatibility
// In a real application, this would use proper API calls or browser-compatible libraries

export const ai = {
  generate: async (options: any) => {
    console.log('Mock AI generate called with:', options);
    return { text: 'This is a mock AI response for browser compatibility.' };
  },
  
  run: async (options: any) => {
    console.log('Mock AI run called with:', options);
    // Return mock data that matches what we need for knowledge checks
    return Array(options.count || 5).fill(null).map((_, index) => ({
      question: `Mock question ${index + 1} about ${options.system?.includes('Title:') ? options.system.split('Title:')[1].split('\n')[0].trim() : 'the topic'}?`,
      options: [
        `Option A for question ${index + 1}`,
        `Option B for question ${index + 1}`,
        `Option C for question ${index + 1}`,
        `Option D for question ${index + 1}`,
      ],
      correctOptionIndex: 0,
      explanation: `This is why option A is correct for question ${index + 1}.`,
    }));
  }
};

/**
 * Extended generate function that can incorporate character personalities.
 */
export const generateWithCharacter = async (options: any) => {
  console.log('Mock generateWithCharacter called with:', options);
  return ai.generate(options);
}; 