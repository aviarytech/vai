#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Debug Endpoint${NC}"
curl -s http://localhost:3000/api/credentials/debug | jq .

echo -e "\n${GREEN}Testing List All Credentials${NC}"
curl -s http://localhost:3000/api/credentials | jq .

echo -e "\n${GREEN}Testing Search Credentials${NC}"
curl -s "http://localhost:3000/api/credentials/search?modelName=GPT-4&provider=OpenAI" | jq .

echo -e "\n${GREEN}Testing Create Credential${NC}"
curl -s -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "modelInfo": {
      "name": "GPT-4",
      "version": "1.0",
      "provider": "OpenAI"
    },
    "input": {
      "prompt": "What is the capital of France?",
      "timestamp": "2024-03-20T10:00:00Z"
    },
    "output": {
      "response": "The capital of France is Paris.",
      "timestamp": "2024-03-20T10:00:01Z"
    }
  }' | jq .

echo -e "\n${GREEN}Testing Verify Credential${NC}"
curl -s -X POST http://localhost:3000/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "modelInfo": {
      "name": "GPT-4",
      "version": "1.0",
      "provider": "OpenAI"
    },
    "input": {
      "prompt": "Test prompt",
      "timestamp": "2024-03-20T10:00:00Z"
    },
    "output": {
      "response": "Test response",
      "timestamp": "2024-03-20T10:00:01Z"
    }
  }' | jq .
