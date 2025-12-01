# NotebookLM MCP Integration Instructions

This project has been updated to use a local MCP (Model Context Protocol) server to generate slides using NotebookLM. This architecture allows for reduced hallucination by grounding the generation in your uploaded documents.

## Prerequisites

- Python 3.10+
- `pip`

## Setup

1.  **Install Dependencies**
    Navigate to the `mcp-server` directory and install the required Python packages:

    ```bash
    cd mcp-server
    pip install -r requirements.txt
    ```

    *Note: You may need to install `notebooklm-mcp` separately if it's not available in public repositories yet, or follow specific instructions for that package.*

2.  **Configure NotebookLM (Optional/Future)**
    The `server.py` script currently contains a placeholder for the actual NotebookLM integration. To fully enable it:
    - Open `mcp-server/server.py`.
    - Implement the `NotebookLMClient` initialization using your authentication credentials.
    - Update the `generate_slides` function to call the real NotebookLM API.

## Running the Server

To generate slides, the Python MCP server must be running locally.

1.  Open a new terminal window.
2.  Run the server:

    ```bash
    python mcp-server/server.py
    ```

    The server will start on `http://0.0.0.0:8001`.

## Usage

1.  Start your Next.js application (`npm run dev`).
2.  Navigate to the **Slides** page.
3.  Upload a document (PDF, DOCX, etc.).
4.  Click **Generate Slide Outline**.
    - The application will upload the file to a temporary directory.
    - It will then send a request to your local MCP server (`http://localhost:8001`).
    - The MCP server will process the document (mocked for now) and return the slide structure.
5.  Review the slides and click **Download PowerPoint** to export.

## Troubleshooting

- **Connection Refused**: Ensure `server.py` is running on port 8001.
- **Generation Failed**: Check the terminal output of the python server for errors.
