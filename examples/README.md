# Examples & Templates

This directory contains example files and templates used by TAFE GEN for content generation.

## Files

### 📄 Template_WB.docx
Template workbook structure that defines the formatting and layout for generated learner workbooks.

**Used by:** `/api/generate` route  
**Purpose:** Provides structural guidance for AI-generated workbooks

### 📄 UEEEIC0010_WB.docx
Example workbook for "UEEEIC0010 - Install, commission and maintain integrated renewable/sustainable energy systems for residential premises"

**Used by:** `/api/generate` route  
**Purpose:** Reference document that demonstrates the desired tone, depth, and style for content generation

### 📊 The Australian Energy Sector.pptx
Sample presentation demonstrating the output format for slide generation.

**Purpose:** Example of presentation output quality

## Usage

These files are automatically referenced by the backend during content generation to ensure:
- Consistent formatting across generated documents
- Appropriate depth and tone for TAFE-level content
- Alignment with existing educational standards

## Adding New Examples

To add new template files:
1. Place the file in this directory
2. Update the relevant API route to reference the new file
3. Document the file in this README
