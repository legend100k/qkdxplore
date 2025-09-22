#!/usr/bin/env python3
"""
Startup script for the BB84 Qiskit backend API
"""
import subprocess
import sys
import os

def install_requirements():
    """Install backend requirements"""
    print("Installing backend requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def start_backend():
    """Start the Flask backend server"""
    print("Starting BB84 backend server...")
    try:
        # Change to the backend directory
        os.chdir("backend")
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")

if __name__ == "__main__":
    print("🚀 Starting BB84 Qiskit Backend")
    print("=" * 50)
    
    if install_requirements():
        start_backend()
    else:
        print("❌ Failed to start backend due to dependency issues")
        sys.exit(1)
