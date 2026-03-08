# Perplexity Web UI

A modern web interface for interacting with the Perplexity AI API, built with React, TypeScript, and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- A Perplexity API key

## Installation

### Windows

1. Open PowerShell or Command Prompt and run:
```powershell
# Clone the repository
git clone https://github.com/PierrunoYT/perplexity-webui.git

# Navigate to project directory
cd perplexity-webui

# Install dependencies
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_PERPLEXITY_API_KEY=your_api_key_here
VITE_DEFAULT_MODEL=sonar
VITE_DEFAULT_TEMPERATURE=0.7
VITE_DEFAULT_TOP_P=0.9
```

3. Start the development server:
```powershell
npm run dev
```

### macOS/Linux

1. Open Terminal and run:
```bash
# Clone the repository
git clone https://github.com/PierrunoYT/perplexity-webui.git

# Navigate to project directory
cd perplexity-webui

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
VITE_PERPLEXITY_API_KEY=your_api_key_here
VITE_DEFAULT_MODEL=sonar
VITE_DEFAULT_TEMPERATURE=0.7
VITE_DEFAULT_TOP_P=0.9
EOF

# Start development server
npm run dev
```

## Building for Production

To build and preview the production version:

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## Features

- 🌙 Dark/Light mode support
- 💬 Real-time chat interface
- ⚙️ Customizable API settings
- 📊 Structured output support
- 🔍 Related questions suggestions
- 📝 Markdown rendering with citation support
- 🌐 Cross-platform compatibility

## Perplexity API Details

This project uses the Perplexity **Responses API**:
- Endpoint: `POST https://api.perplexity.ai/v1/responses`
- Chat input shape: `input` (messages array)
- Search parameters are sent via `web_search_options`
- Structured output uses `response_format` with `json_schema`

### Supported models

- `sonar`
- `sonar-pro`
- `sonar-reasoning-pro`
- `sonar-deep-research`

### Default behavior

- Default model: `sonar`
- Default search context: `low`
- Structured output defaults:
  - off by default
  - JSON schema output is optional and can be enabled in settings
- Citations are rendered from response annotations when available

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
perplexity-webui/
├── src/
│   ├── components/     # React components
│   ├── services/      # API and other services
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/PierrunoYT/perplexity-webui/issues) on GitHub.
