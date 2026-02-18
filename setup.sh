#!/bin/bash

# CampusCompanion AI - Backend Setup Script
# Run this to set up the entire backend

echo "🚀 Setting up CampusCompanion AI Backend..."
echo ""

# Check if Python 3.11+ is installed
echo "📍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found Python $python_version"

# Check if Ollama is installed
echo ""
echo "📍 Checking Ollama..."
if command -v ollama &> /dev/null; then
    echo "   ✓ Ollama is installed"
else
    echo "   ⚠️  Ollama not found!"
    echo "   Install it: curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    read -p "   Install Ollama now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
    fi
fi

# Install Python dependencies
echo ""
echo "📦 Installing Python packages..."
pip3 install -r requirements.txt

# Download Llama 3.1 model if not present
echo ""
echo "🤖 Checking Llama 3.1 8B model..."
if ollama list | grep -q "llama3.1:8b"; then
    echo "   ✓ Model already downloaded"
else
    echo "   Downloading Llama 3.1 8B (this may take a few minutes)..."
    ollama pull llama3.1:8b
fi

# Initialize database
echo ""
echo "💾 Initializing database..."
python3 -c "from database import Database; db = Database(); print('✓ Database initialized')"

# Test Ollama connection
echo ""
echo "🧪 Testing Ollama connection..."
echo "   Starting Ollama server in background..."
ollama serve > /dev/null 2>&1 &
sleep 3

python3 -c "from llm_agent import LocalLLMAgent; agent = LocalLLMAgent(); resp = agent.chat('test'); print('✓ Ollama is working!' if resp else '⚠️  Ollama connection failed')"

echo ""
echo "=" * 60
echo "✅ Backend setup complete!"
echo ""
echo "To start the server:"
echo "   python3 main.py"
echo ""
echo "Or run Ollama and server separately:"
echo "   Terminal 1: ollama serve"
echo "   Terminal 2: python3 main.py"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs: http://localhost:8000/docs"
echo "=" * 60
