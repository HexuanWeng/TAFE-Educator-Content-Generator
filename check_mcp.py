#!/usr/bin/env python3
"""
Quick check to see if the MCP server is running and ready to generate slides.
"""

import requests
import sys

MCP_SERVER_URL = "http://localhost:8001"

def check_mcp_server():
    try:
        # Try a simple health check
        response = requests.post(
            MCP_SERVER_URL,
            json={
                "tool": "generate_slides",
                "arguments": {
                    "topic": "Test",
                    "document_path": None,
                    "slide_count": 1,
                    "theme": "modern"
                }
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print("✓ MCP server is running and responding correctly!")
            print(f"  URL: {MCP_SERVER_URL}")
            return True
        else:
            print(f"⚠ MCP server responded with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ MCP server is NOT running")
        print("\nTo start the MCP server, run:")
        print("  cd mcp-server")
        print("  python server.py")
        return False
    except Exception as e:
        print(f"✗ Error checking MCP server: {e}")
        return False

if __name__ == "__main__":
    success = check_mcp_server()
    sys.exit(0 if success else 1)
