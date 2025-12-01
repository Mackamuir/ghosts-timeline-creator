# GHOSTS Timeline Configuration Editor

A visual editor for creating and managing [GHOSTS](https://cmu-sei.github.io/GHOSTS/core/client/) timeline configuration files. This tool provides an intuitive interface for configuring realistic user simulation timelines.

>> Mostly AI lol, use at own risk.

The current state of the documentation of ghosts and the timeline with all of it's unknown options was getting a bit wacky (No shade to the people over at CMU-SEI, they make great products and I love them) This should bring basically every feature into 1 place with descriptions.

## Features

- **Visual Timeline Builder**: Drag-and-drop interface for creating complex timelines
- **Handler Configuration**: Support for all GHOSTS handler types with inline documentation
- **Dark Mode**: Toggle between light and dark themes
- **Timezone Support**: Enter times in your local timezone, automatically converts to UTC
- **Flexible Delays**: Support for both fixed and random delay ranges with time unit conversion
- **JSON Import/Export**: Seamlessly import and export timeline configurations
- **Quick Start Templates**: Pre-built templates for common scenarios

## Usage

Visit https://mackamuir.github.io/ghosts-timeline-creator/ to use the site.

or if you wish to host locally:

```bash
git clone https://github.com/Mackamuir/ghosts-timeline-creator.git
cd .\ghosts-timeline-creator\
python3 -m http.server
```

then visit http://localhost:8000/

### Creating a Timeline

1. **Use a Template** (optional): Click one of the Quick Start templates to begin with a pre-configured timeline
2. **Add Handlers**: Click "Add Handler" to create a new timeline handler
3. **Configure Handler**:
   - Select the handler type (Browser, Command, Office apps, etc.)
   - Set active hours in your local timezone
   - Configure handler-specific arguments (all fields include help text)
4. **Add Events**: Within each handler, add timeline events with commands and delays
5. **Export**: Click "Export" to download your timeline.json file

### Importing Existing Timelines

1. Click "JSON View" in the top menu
2. Paste your existing timeline JSON
3. Click "Import"
4. Switch back to "Editor" view to visually edit

## Supported Handlers

The editor supports all GHOSTS handler types with comprehensive inline documentation:

### Browser Automation
- **BrowserChrome** / **BrowserFirefox**: Web browsing simulation with configurable stickiness, resource blocking, and dynamic URLs

### Office Applications
- **Word** / **Excel** / **PowerPoint**: Document creation and editing with PDF export
- **LightWord** / **LightExcel**: Lightweight document handlers (no Office required)
- **Outlook** / **Outlookv2**: Email simulation with attachments and link clicking

### System Operations
- **Command**: Execute command-line operations
- **PowerShell** / **Bash**: Shell script execution with variable replacement
- **Clicks**: Simulated mouse clicks to keep system active
- **Reboot**: System reboot simulation
- **Print**: Document printing

### Network Operations
- **Ssh** / **Sftp** / **Ftp**: File transfer and remote command execution
- **Rdp**: Remote Desktop Protocol connections
- **Wmi**: Windows Management Instrumentation queries
- **Curl**: HTTP/HTTPS requests and API interactions

### Cloud Services
- **Aws**: AWS CLI command execution
- **Azure**: Azure CLI command execution

### Other
- **Notepad**: Text file creation and editing
- **Pidgin**: Instant messaging simulation
- **Watcher**: File and directory monitoring
- **NpcSystem**: Client start/stop state control

## Handler Arguments

Each handler type has specific arguments that are automatically displayed in the editor with:
- **Description**: What the argument does
- **Example Value**: Suggested value to use
- **Appropriate Input Type**: Text, number, boolean, or JSON based on the argument type

## Time Configuration

### Timezone Support
- Select your timezone from the dropdown in the header
- Enter times in your local timezone
- Times are automatically converted to UTC for the configuration file
- UTC conversion is shown below each time input for verification

### Delay Configuration
Delays support two formats:

**Fixed Delay:**
```json
"DelayAfter": 5000
```

**Random Delay:**
```json
"DelayAfter": {
  "random": true,
  "min": 1000,
  "max": 10000
}
```

The editor provides:
- Toggle between Fixed and Random modes
- Time unit conversion (milliseconds, seconds, minutes, hours)
- Visual preview of the resulting JSON

## Tips

1. **Use Handler Documentation**: Each handler shows inline help text. Expand a handler to see detailed documentation about commands, arguments, and prerequisites.

2. **Test with Templates**: Start with a template to see how timelines are structured, then modify to fit your needs.

3. **Validate Times**: The editor validates time format (HH:MM:SS) in real-time and shows errors for invalid input.

4. **Duplicate Handlers/Events**: Use the copy button to quickly create variations of existing configurations.

5. **Dark Mode**: If you're working in low-light conditions, toggle dark mode for better visibility.

## Technical Details

### Dependencies
- React 18 (loaded from CDN)
- Tailwind CSS (loaded from CDN)
- Font Awesome 6.4.0 (loaded from CDN)
- Babel Standalone (for JSX transformation)

### Browser Compatibility
Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### File Organization

**config.js** (~39KB)
- TIMEZONES array
- HANDLER_TYPES array
- HANDLER_DOCS object (comprehensive handler documentation)
- Timezone conversion utilities

**components.js** (~65KB)
- TimelineEditor (main component)
- HandlerCard (handler configuration UI)
- HandlerArgsEditor (dynamic argument editor)
- EventCard (timeline event configuration)
- DelayEditor (delay configuration with time units)

## Troubleshooting

**Issue**: Times showing as NaN or invalid
- **Solution**: Ensure you're using HH:MM:SS format (e.g., 09:30:00, not 9:30)

**Issue**: Handler arguments not appearing
- **Solution**: Make sure the handler type is selected. Arguments are handler-specific.

**Issue**: Export doesn't download
- **Solution**: Check your browser's popup blocker settings

**Issue**: Import shows "Invalid JSON"
- **Solution**: Validate your JSON syntax at jsonlint.com before importing

## Contributing

To add support for new handlers:

1. Edit `js/config.js`
2. Add the handler type to `HANDLER_TYPES` array
3. Add handler documentation to `HANDLER_DOCS` object:
   ```javascript
   'NewHandler': {
       description: 'What this handler does',
       commands: ['command1', 'command2'],
       commandArgs: [
           { name: 'Arg Name', example: 'example value', description: 'What this arg does' }
       ],
       handlerArgs: {
           'argKey': { description: 'What it does', example: 'example' }
       },
       notes: 'Important usage information'
   }
   ```

The UI will automatically generate the appropriate input fields and help text!

## License

This tool is part of the GHOSTS project. See LICENSE.md for terms.

## Links

- [GHOSTS GitHub Repository](https://github.com/cmu-sei/GHOSTS)
- [GHOSTS Documentation](https://cmu-sei.github.io/GHOSTS/)
- [Timeline Handler Documentation](https://github.com/cmu-sei/GHOSTS/tree/master/docs/handlers)