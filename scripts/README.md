# Development Scripts

This directory contains utility scripts for development, debugging, and testing.

## Files

### 🐍 check_mcp.py
Python script to verify MCP (Model Context Protocol) server connectivity and configuration.

**Usage:**
```bash
python scripts/check_mcp.py
```

### 🔍 debug_tga.js
JavaScript debug script for testing Google Generative AI (TGA) integration.

**Usage:**
```bash
node scripts/debug_tga.js
```

### 🔎 test_search.js
Test script for the unit code search functionality.

**Usage:**
```bash
node scripts/test_search.js
```

### 📋 list_models.js
Script to list available Gemini AI models and their configurations.

**Usage:**
```bash
node scripts/list_models.js
```

## Running Scripts

All scripts should be run from the project root directory:

```bash
# Python scripts
python scripts/script_name.py

# Node.js scripts
node scripts/script_name.js
```

## Adding New Scripts

When adding new development scripts:
1. Place them in this directory
2. Add appropriate documentation in this README
3. Include usage examples
4. Use clear, descriptive file names
