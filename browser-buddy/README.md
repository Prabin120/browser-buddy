# Browser Extension

This project is a browser extension that allows users to read the content of the current web page they are visiting. It consists of a content script that interacts with the DOM of the web page and a background script that manages events and communication.

## Project Structure

- **src/**
  - **content.js**: The content script that runs in the context of web pages. It reads the content of the current page and can interact with the DOM.
  - **background.js**: The background script that manages events and handles communication between the content script and other parts of the extension.
  - **manifest.json**: The configuration file for the browser extension. It defines the extension's metadata, permissions, and the scripts to be used.
  
- **package.json**: The configuration file for npm. It lists the dependencies and scripts for the project.

## Installation

To install the necessary dependencies, run:

```
npm install
```

## Usage

1. Load the extension in your browser:
   - For Chrome, go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the `browser-extension` directory.
   
2. Navigate to any web page and use the extension to read its content.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.