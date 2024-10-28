import { connectToDatabase, disconnectFromDatabase } from '../db';
import { getAICredentialModel } from '../models/AICredential';

const sampleCredentials = [
  {
    modelInfo: {
      name: "GPT-4",
      version: "1.0",
      provider: "OpenAI"
    },
    input: {
      prompt: "What is the capital of France?",
      timestamp: "2024-03-20T10:00:00Z"
    },
    output: {
      response: "The capital of France is Paris.",
      timestamp: "2024-03-20T10:00:01Z"
    }
  },
  {
    modelInfo: {
      name: "Claude",
      version: "2.0",
      provider: "Anthropic"
    },
    input: {
      prompt: "Explain quantum computing",
      timestamp: "2024-03-20T11:00:00Z"
    },
    output: {
      response: "Quantum computing uses quantum mechanics principles...",
      timestamp: "2024-03-20T11:00:02Z"
    }
  },
  {
    modelInfo: {
      name: "GPT-3.5",
      version: "1.0",
      provider: "OpenAI"
    },
    input: {
      prompt: "Write a poem about AI",
      timestamp: "2024-03-20T12:00:00Z"
    },
    output: {
      response: "In circuits deep and networks wide...",
      timestamp: "2024-03-20T12:00:01Z"
    }
  }
];

async function seedDatabase() {
  try {
    await connectToDatabase();
    const AICredential = getAICredentialModel();
    
    // Clear existing data
    await AICredential.deleteMany({});
    
    // Insert sample data
    await AICredential.insertMany(sampleCredentials);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnectFromDatabase();
  }
}

seedDatabase();
