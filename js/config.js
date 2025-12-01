// GHOSTS Timeline Configuration
// Handler types, documentation, and utility functions

// Timezone utilities
const TIMEZONES = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: -5 },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: -6 },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: -7 },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: -8 },
    { value: 'America/Anchorage', label: 'Alaska', offset: -9 },
    { value: 'Pacific/Honolulu', label: 'Hawaii', offset: -10 },
    { value: 'Europe/London', label: 'London (GMT)', offset: 0 },
    { value: 'Europe/Paris', label: 'Central European Time', offset: 1 },
    { value: 'Europe/Athens', label: 'Eastern European Time', offset: 2 },
    { value: 'Asia/Dubai', label: 'Dubai', offset: 4 },
    { value: 'Asia/Kolkata', label: 'India Standard Time', offset: 5.5 },
    { value: 'Asia/Shanghai', label: 'China Standard Time', offset: 8 },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 9 },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time', offset: 10 },
];

const convertTimeToUTC = (timeStr, fromTimezone) => {
    if (!timeStr) return timeStr;
    const tz = TIMEZONES.find(t => t.value === fromTimezone);
    if (!tz || tz.value === 'UTC') return timeStr;

    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    let utcHours = hours - tz.offset;

    if (utcHours < 0) utcHours += 24;
    if (utcHours >= 24) utcHours -= 24;

    return `${String(utcHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const convertTimeFromUTC = (timeStr, toTimezone) => {
    if (!timeStr) return timeStr;
    const tz = TIMEZONES.find(t => t.value === toTimezone);
    if (!tz || tz.value === 'UTC') return timeStr;

    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    let localHours = hours + tz.offset;

    if (localHours < 0) localHours += 24;
    if (localHours >= 24) localHours -= 24;

    return `${String(localHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Handler type definitions from GHOSTS Timeline.cs
// Source: https://github.com/cmu-sei/GHOSTS/blob/master/src/Ghosts.Domain/Messages/Timeline.cs
const HANDLER_TYPES = [
    'BrowserFirefox',
    'BrowserChrome',
    'Command',
    'Notepad',
    'Outlook',
    'Word',
    'Excel',
    'PowerPoint',
    'NpcSystem',
    'Reboot',
    'Curl',
    'Clicks',
    'Watcher',
    'LightWord',
    'LightExcel',
    'LightPowerPoint',
    'PowerShell',
    'Bash',
    'Print',
    'Ssh',
    'Sftp',
    'Pidgin',
    'Rdp',
    'Wmi',
    'Outlookv2',
    'Ftp',
    'Aws',
    'Azure',
    'ExecuteFile'
];

// Command types for browser handlers (from BaseBrowserHandler.cs switch statement lines 71-253)
const BROWSER_COMMANDS = ['browse', 'random', 'randomalt', 'type', 'click', 'click.by.name', 'clickbyid', 'click.by.id', 'click.by.linktext', 'click.by.cssselector', 'download', 'upload', 'crawl', 'outlook', 'social', 'sharepoint', 'blog', 'typebyid', 'js.executescript', 'manage.window.size'];
const COMMAND_COMMANDS = ['cmd', 'powershell', 'once', 'random'];

// Schedule types for timeline handlers
const SCHEDULE_TYPES = ['Other', 'Cron'];

// Comprehensive handler documentation
const HANDLER_DOCS = {
    'Word': {
        description: 'Creates and edits Microsoft Word documents with random content. Documents are created with random text and can be periodically exported as PDFs. The handler maintains a working set of documents that can be re-opened and edited to simulate realistic document workflow.',
        commands: ['create'],
        commandArgs: [
            { index: 0, name: 'Save Directory', example: '%homedrive%%homepath%\\Documents', description: 'Path where documents will be saved (old style positional)' },
            { index: 1, name: 'PDF Export', example: 'pdf', description: 'Also periodically export documents as PDFs as well as saving them natively (middle style)' },
            { index: 2, name: 'PDF Filename Variation', example: 'pdf-vary-filenames', description: 'If creating PDFs, vary their name from the original document (new style)' },
            { index: 3, name: 'Save Array', example: "save-array:['c:\\tmp','c:\\tmp\\path2','c:\\tmp\\path3']", description: 'Randomly save documents in an array of locations (new style)' }
        ],
        handlerArgs: {
            'workingset': { description: 'Controls document pool - defines how many documents should be created (max) and how old they can be before creating new ones (max-age-in-hours)', example: '{"max": 20, "max-age-in-hours": 72}' },
            'stay-open': { description: 'Milliseconds to keep Word application open after operations complete', example: '5000' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '20' }
        },
        notes: 'CommandArgs use a mix of positional (old style) and named (new style) arguments for backwards compatibility.'
    },
    'Excel': {
        description: 'Creates and edits Microsoft Excel spreadsheets with random data. Spreadsheets are populated with random tabular data and can be exported as PDFs. The handler maintains a working set of spreadsheets.',
        commands: ['create'],
        commandArgs: [
            { index: 0, name: 'Save Directory', example: '%homedrive%%homepath%\\Documents', description: 'Path where spreadsheets will be saved (old style positional)' },
            { index: 1, name: 'PDF Export', example: 'pdf', description: 'Also periodically export spreadsheets as PDFs as well as saving them natively (middle style)' },
            { index: 2, name: 'PDF Filename Variation', example: 'pdf-vary-filenames', description: 'If creating PDFs, vary their name from the original spreadsheet (new style)' },
            { index: 3, name: 'Save Array', example: "save-array:['c:\\tmp','c:\\tmp\\path2','c:\\tmp\\path3']", description: 'Randomly save spreadsheets in an array of locations (new style)' }
        ],
        handlerArgs: {
            'workingset': { description: 'Controls spreadsheet pool - defines how many spreadsheets should be created (max) and how old they can be before creating new ones (max-age-in-hours)', example: '{"max": 20, "max-age-in-hours": 72}' },
            'stay-open': { description: 'Milliseconds to keep Excel application open after operations complete', example: '5000' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '20' }
        },
        notes: 'CommandArgs use a mix of positional (old style) and named (new style) arguments for backwards compatibility.'
    },
    'PowerPoint': {
        description: 'Creates and edits Microsoft PowerPoint presentations with random content. Presentations include random slides with text and can be exported as PDFs. The handler maintains a working set of presentations.',
        commands: ['create'],
        commandArgs: [
            { index: 0, name: 'Save Directory', example: '%homedrive%%homepath%\\Documents', description: 'Path where presentations will be saved (old style positional)' },
            { index: 1, name: 'PDF Export', example: 'pdf', description: 'Also periodically export presentations as PDFs as well as saving them natively (middle style)' },
            { index: 2, name: 'PDF Filename Variation', example: 'pdf-vary-filenames', description: 'If creating PDFs, vary their name from the original presentation (new style)' },
            { index: 3, name: 'Save Array', example: "save-array:['c:\\tmp','c:\\tmp\\path2','c:\\tmp\\path3']", description: 'Randomly save presentations in an array of locations (new style)' }
        ],
        handlerArgs: {
            'workingset': { description: 'Controls presentation pool - defines how many presentations should be created (max) and how old they can be before creating new ones (max-age-in-hours)', example: '{"max": 20, "max-age-in-hours": 72}' },
            'stay-open': { description: 'Milliseconds to keep PowerPoint application open after operations complete', example: '5000' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '20' }
        },
        notes: 'The note on line 38 mentions "Excel creates" but this appears to be a copy/paste error - should refer to PowerPoint.'
    },
    'BrowserChrome': {
        description: 'Automates Chrome browser for realistic web browsing behavior including page navigation, form interaction, file downloads, and more. Supports dynamic URL variables and stickiness to simulate users staying on specific sites.',
        commands: ['random', 'browse', 'randomalt', 'download', 'upload', 'click', 'type', 'typebyid', 'click.by.id', 'click.by.name', 'click.by.linktext', 'click.by.cssselector', 'outlook', 'sharepoint', 'blog', 'crawl', 'js.executescript', 'manage.window.size'],
        commandArgs: [
            { name: 'URLs or Selectors', example: 'http://www.example.com', description: 'URLs to visit or XPath selectors for interaction. Supports {now}, {uuid}, {c}, {n} variables and custom url-replace variables' }
        ],
        handlerArgs: {
            'isheadless': { description: 'Run without visible window (saves resources)', example: 'false' },
            'blockimages': { description: 'Block images from loading (faster, less bandwidth)', example: 'true' },
            'blockstyles': { description: 'Block CSS stylesheets from loading', example: 'true' },
            'blockscripts': { description: 'Block JavaScript execution', example: 'true' },
            'blockflash': { description: 'Block Flash content (deprecated technology)', example: 'true' },
            'incognito': { description: 'Use private browsing mode', example: 'false' },
            'accept-insecure-certificates': { description: 'Trust invalid/self-signed SSL certificates', example: 'false' },
            'stickiness': { description: 'Probability (0-100) of staying on same domain for next link - simulates users staying on sites', example: '60' },
            'stickiness-depth-min': { description: 'Minimum links to click when sticking to a site', example: '3' },
            'stickiness-depth-max': { description: 'Maximum links to click when sticking to a site', example: '10' },
            'visited-remember': { description: 'Number of visited sites to remember for realistic browsing', example: '5' },
            'browse-probability': { description: 'Probability (0-100) to continue browsing after each action', example: '100' },
            'actions-before-restart': { description: 'Restart browser after N actions for cleanup (-1 = disabled)', example: '-1' },
            'crawl-tasks-maximum': { description: 'Max concurrent tasks during site crawling', example: '10' },
            'crawl-site-depth': { description: 'Maximum depth for recursive site crawling', example: '5' },
            'crawl-proxy-local-url': { description: 'Local proxy URL for crawling operations', example: 'http://localhost:8080' },
            'command-line-args': { description: 'Array of browser command-line arguments', example: '["--disable-gpu", "--no-sandbox"]' },
            'socks-proxy': { description: 'SOCKS proxy URL (requires socks-proxy-version)', example: 'socks://proxy.example.com:1080' },
            'socks-proxy-version': { description: 'SOCKS proxy version (4 or 5)', example: '5' },
            'user-data-dir': { description: 'Chrome profile directory path', example: 'C:\\ChromeProfile' },
            'executable-location': { description: 'Path to browser executable (override default)', example: 'C:\\Program Files\\Chrome\\chrome.exe' },
            'ua-string': { description: 'Custom User-Agent string or preset ("random", "strict")', example: 'random' },
            'javascript-enable': { description: 'Enable JavaScript execution (inverse of blockscripts)', example: 'true' },
            'url-replace': { description: 'Array of custom variable replacements for URLs', example: '[{"verb": ["order", "enable"]}, {"group": ["operations", "logistics"]}]' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '20' }
        },
        prerequisites: 'Download Chromedriver from https://chromedriver.chromium.org/downloads and place in GHOSTS executable folder. Version must match Chrome version.',
        notes: 'Use headless mode and block resources for resource-constrained environments. Dynamic URLs support built-in variables like {uuid}, {now}, {c}, {n} and custom variables defined in url-replace. Variable placeholders: {guid} (new GUID), {name} (file_<guid>_<datetime>), {random_file:~/path} (random file from directory).'
    },
    'BrowserFirefox': {
        description: 'Automates Firefox browser for realistic web browsing behavior including page navigation, form interaction, file downloads, and more. Supports dynamic URL variables and stickiness to simulate users staying on specific sites.',
        commands: ['random', 'browse', 'randomalt', 'download', 'upload', 'click', 'type', 'typebyid', 'click.by.id', 'click.by.name', 'click.by.linktext', 'click.by.cssselector', 'outlook', 'sharepoint', 'blog', 'crawl', 'js.executescript', 'manage.window.size'],
        commandArgs: [
            { name: 'URLs or Selectors', example: 'http://www.example.com', description: 'URLs to visit or XPath selectors for interaction. Supports {now}, {uuid}, {c}, {n} variables and custom url-replace variables' }
        ],
        handlerArgs: {
            'isheadless': { description: 'Run without visible window (saves resources)', example: 'false' },
            'blockimages': { description: 'Block images from loading (faster, less bandwidth)', example: 'true' },
            'blockstyles': { description: 'Block CSS stylesheets from loading', example: 'true' },
            'blockscripts': { description: 'Block JavaScript execution', example: 'true' },
            'blockflash': { description: 'Block Flash content (deprecated technology)', example: 'true' },
            'incognito': { description: 'Use private browsing mode', example: 'false' },
            'accept-insecure-certificates': { description: 'Trust invalid/self-signed SSL certificates', example: 'false' },
            'stickiness': { description: 'Probability (0-100) of staying on same domain for next link - simulates users staying on sites', example: '60' },
            'stickiness-depth-min': { description: 'Minimum links to click when sticking to a site', example: '3' },
            'stickiness-depth-max': { description: 'Maximum links to click when sticking to a site', example: '10' },
            'visited-remember': { description: 'Number of visited sites to remember for realistic browsing', example: '5' },
            'browse-probability': { description: 'Probability (0-100) to continue browsing after each action', example: '100' },
            'actions-before-restart': { description: 'Restart browser after N actions for cleanup (-1 = disabled)', example: '-1' },
            'crawl-tasks-maximum': { description: 'Max concurrent tasks during site crawling', example: '10' },
            'crawl-site-depth': { description: 'Maximum depth for recursive site crawling', example: '5' },
            'crawl-proxy-local-url': { description: 'Local proxy URL for crawling operations', example: 'http://localhost:8080' },
            'command-line-args': { description: 'Array of browser command-line arguments', example: '["--disable-gpu", "--no-sandbox"]' },
            'socks-proxy': { description: 'SOCKS proxy URL (requires socks-proxy-version)', example: 'socks://proxy.example.com:1080' },
            'socks-proxy-version': { description: 'SOCKS proxy version (4 or 5)', example: '5' },
            'executable-location': { description: 'Path to browser executable (override default)', example: '/usr/bin/firefox' },
            'ua-string': { description: 'Custom User-Agent string or preset ("random", "strict")', example: 'random' },
            'javascript-enable': { description: 'Enable JavaScript execution (inverse of blockscripts)', example: 'true' },
            'url-replace': { description: 'Array of custom variable replacements for URLs', example: '[{"category": ["news", "sports"]}, {"action": ["view", "read"]}]' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '20' }
        },
        prerequisites: 'Download Geckodriver from https://github.com/mozilla/geckodriver/releases and place in GHOSTS executable folder. Version must match Firefox version.',
        notes: 'Use headless mode and block resources for resource-constrained environments. If running as root on Linux, browser drivers may fail - run GHOSTS as regular user instead. Variable placeholders: {guid} (new GUID), {name} (file_<guid>_<datetime>), {random_file:~/path} (random file from directory).'
    },
    'Command': {
        description: 'Executes command-line operations including PowerShell scripts, batch files, or any command-line utilities available on the system. The Command field is the initial command, and CommandArgs array contains sequential commands to execute.',
        commands: ['Any command (cmd, powershell, etc.)'],
        commandArgs: [
            { name: 'Command', example: 'powershell expand-archive -Path file.zip', description: 'Sequential commands to execute after initial command' },
            { name: 'Additional Commands', example: 'cd folder', description: 'Additional sequential commands (add as many as needed)' }
        ],
        notes: 'By default command window closes after execution. Use cmd /k to keep window open. Environment variables like %HOMEDRIVE%, %HOMEPATH%, %USERNAME%, %TEMP%, %PROGRAMFILES% are supported.'
    },
    'Outlook': {
        description: 'Automates Microsoft Outlook for sending and replying to emails. Supports creating new emails, replying to inbox messages, and clicking random links in emails.',
        commands: ['create', 'reply', 'clickrandomlink'],
        commandArgs: [
            { index: 0, name: 'From', example: 'CurrentUser', description: "CurrentUser or specific email address. Note: If Outlook isn't configured to use this address, email may not be sent" },
            { index: 1, name: 'To', example: 'Random', description: 'Random (picks from config) or comma-separated email addresses' },
            { index: 2, name: 'CC', example: 'Random', description: 'Random (picks from config) or comma-separated email addresses' },
            { index: 3, name: 'BCC', example: 'Random', description: 'Random (picks from config) or comma-separated email addresses' },
            { index: 4, name: 'Subject', example: 'Random', description: 'Random or specific subject text. For replies: "Parent" format is RE: <original message>' },
            { index: 5, name: 'Body', example: 'Random', description: 'Random or specific body text. For replies: "Random+Parent" format includes reply then original message' },
            { index: 6, name: 'Body Type', example: 'PlainText', description: 'PlainText, RTF, or HTML. For replies: "Parent" uses format of original message' },
            { index: 7, name: 'Attachments', example: '', description: 'Comma-separated file paths (not used in replies)' }
        ],
        notes: 'For create command, all 8 args are used. For reply command: [0]=from, [1-3]=All or specific addresses, [4]=Parent for RE: format, [5]=Parent+Random for reply+original, [6]=Parent for original format, [7]=unused. For clickrandomlink: no args needed.'
    },
    'Clicks': {
        description: 'Simulates mouse left-clicks at regular intervals to keep computer active and awake. Useful for preventing screen lock, simulating computer activity for security products, or testing purposes.',
        commands: ['Clicks'],
        commandArgs: [],
        notes: 'Executes a simple mouse left-click every DelayAfter milliseconds. GHOSTS does not currently support clicking specific screen locations or specific buttons/alerts.'
    },
    'Watcher': {
        description: 'Monitors disk space and manages files in target directories. Can monitor folder size and automatically delete files when size limit is exceeded. Also supports watching individual files.',
        commands: ['folder', 'file'],
        commandArgs: [
            { name: 'folder: path', example: 'path:%HOMEDRIVE%%HOMEPATH%\\Downloads', description: 'Folder to monitor (use path:value format)' },
            { name: 'folder: size', example: 'size:2000', description: 'Maximum folder size in MB (use size:value format)' },
            { name: 'folder: deletionApproach', example: 'deletionApproach:oldest', description: 'How to delete files: oldest, largest, or random' },
            { name: 'file: path', example: 'C:\\Temp\\test.txt', description: 'File path to watch' },
            { name: 'file: interval', example: '300000', description: 'Watch interval in milliseconds' }
        ],
        notes: 'For folder command: if max size exceeded, deletes files using deletionApproach until under limit. Common use: monitor Downloads folder. May delete files being downloaded which results in failed downloads, but acceptable for traffic generation. For file command: monitors specific file at interval.'
    },
    'Reboot': {
        description: 'Reboots the system at specified intervals. Useful for simulating realistic system maintenance or testing resilience.',
        commands: [''],
        commandArgs: [],
        notes: 'This is the only configuration currently possible for reboots. Fast loop configuration not recommended - once a day or similar is reasonable. Set appropriate DelayBefore/DelayAfter values. Loop: false recommended.'
    },
    'Print': {
        description: 'Prints documents to configured printers. The printer must already be set up on the system before use.',
        commands: ['PrinterName'],
        commandArgs: [
            { name: 'File Path', example: 'C:\\Temp\\document.pdf', description: 'Path to file to print (txt, pdf, doc, etc.)' }
        ],
        notes: 'Command field specifies the printer name (e.g., "MyPrinter"). The printer must already be configured on the system. CommandArgs contains the file path to print.'
    },
    'Ssh': {
        description: 'Executes SSH commands on remote servers. Supports various Linux commands including file operations, directory navigation, and system information queries.',
        commands: ['random'],
        commandArgs: [
            { name: 'Connection String', example: '192.168.1.1|credkey1|ls;pwd;date', description: 'Format: <serverIP>|<credKey>|<semicolon-delimited-commands>. Supports reserved words like [randomname], [randomextension], [remotedirectory]' }
        ],
        handlerArgs: {
            'CredentialsFile': { description: 'Required - Path to SSH credentials JSON file with format: {"Version":"1.0", "Data":{"credkey1":{"username":"user","password":"base64pw"}}}', example: 'd:\\ghosts_data\\ssh_creds.json' },
            'CommandTimeout': { description: 'Max time in ms to wait for new input from SSH command execution', example: '1000' },
            'TimeBetweenCommandsMin': { description: 'Min delay in ms between individual SSH commands', example: '1000' },
            'TimeBetweenCommandsMax': { description: 'Max delay in ms between individual SSH commands', example: '5000' },
            'ValidExts': { description: 'Semicolon-separated extensions used by [randomextension] reserved word', example: 'txt;doc;png;jpeg' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter% (e.g., 50 = ±50%)', example: '0' }
        },
        notes: 'Password in credentials file must be UTF8 base64 encoded. Supported reserved words: [randomname], [randomextension], [remotedirectory]. Commands: ls, pwd, date, time, uptime, uname, df, cd, touch, mkdir, etc.'
    },
    'Sftp': {
        description: 'Performs secure file transfers using SFTP protocol. Supports uploading, downloading, and managing files on remote servers.',
        commands: ['random'],
        commandArgs: [
            { name: 'Connection String', example: '192.168.1.1|credkey1|get;put;ls', description: 'Format: <serverIP>|<credKey>|<semicolon-delimited-SFTP-commands>' }
        ],
        handlerArgs: {
            'CredentialsFile': { description: 'Required - Path to SFTP credentials JSON file (same format as SSH)', example: 'C:\\ghosts\\creds.json' },
            'UploadDirectory': { description: 'Optional - Directory containing files for upload. If not specified, user Downloads directory is used', example: 'C:\\uploads' },
            'TimeBetweenCommandsMin': { description: 'Min delay in ms between individual SFTP commands', example: '1000' },
            'TimeBetweenCommandsMax': { description: 'Max delay in ms between individual SFTP commands', example: '5000' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter% (e.g., 50 = ±50%)', example: '0' }
        },
        notes: 'Supported commands: get [remotefile] (download), put [localfile] (upload), cd [remotedir] (change dir), rm [remotefile] (delete), ls [remotedir] (list), mkdir [randomname] (create dir). Can use [remotefile], [localfile], [remotedir], [randomname] as placeholders or specify absolute/relative paths. Downloaded files placed in user Downloads directory.'
    },
    'Rdp': {
        description: 'Establishes Remote Desktop Protocol connections to remote systems with simulated mouse activity. Opens RDP sessions and randomly moves mouse to simulate user activity.',
        commands: ['random'],
        commandArgs: [
            { name: 'Connection String', example: '192.168.1.1|credkey1', description: 'Format: <targetIP>|<credKey>. credKey retrieves password from credentials file. If username supplied in creds, uses it instead of logged-in user' }
        ],
        handlerArgs: {
            'CredentialsFile': { description: 'Required - Path to RDP credentials JSON file. Can include optional "domain" keyword in credentials', example: 'C:\\ghosts\\creds.json' },
            'mouse-sleep-time': { description: 'Time to sleep in ms between random mouse movements during RDP session', example: '10000' },
            'execution-time': { description: 'Total connection time in ms before RDP is closed and new connection opened', example: '60000' },
            'execution-probability': { description: 'Probability (0-100) that RDP to chosen target is opened after random target selection', example: '100' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter% (e.g., 50 = ±50%)', example: '50' }
        },
        notes: 'After choosing random target, rolls against execution-probability to open RDP. Once connected, randomly moves mouse every mouse-sleep-time ms. After execution-time elapsed, closes RDP and opens new connection. Password used if password prompt appears on RDP open.'
    },
    'Wmi': {
        description: 'Executes Windows Management Instrumentation queries on remote systems. Queries system information like OS details, BIOS, processor, users, network, files, and processes.',
        commands: ['random'],
        commandArgs: [
            { name: 'Connection String', example: '192.168.1.1|credkey1|GetOperatingSystem;GetBios', description: 'Format: <serverIP>|<credKey>|<semicolon-delimited-WMI-commands>' }
        ],
        handlerArgs: {
            'CredentialsFile': { description: 'Required - Path to WMI credentials JSON file. Must include "domain" keyword in addition to username/password', example: 'C:\\ghosts\\creds.json' },
            'TimeBetweenCommandsMin': { description: 'Min delay in ms between individual WMI commands', example: '1000' },
            'TimeBetweenCommandsMax': { description: 'Max delay in ms between individual WMI commands', example: '5000' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter% (e.g., 50 = ±50%)', example: '0' }
        },
        prerequisites: 'Target host must be configured to allow WMI. Domain admin recommended for username/password. Trusted hosts of GHOSTS VM must include IPs of interrogated hosts. Set in PowerShell: winrm s winrm/config/client \'@{TrustedHosts="*"}\'',
        notes: 'Supported commands: GetOperatingSystem, GetBios, GetProcessor, GetUserList, GetNetworkInfo, GetFilesList, GetProcessList. Credentials file requires "domain" field. Check trusted hosts: winrm g winrm/config/client'
    },
    'Pidgin': {
        description: 'Simulates instant messaging conversations using Pidgin client. Tested with Pidgin 2.14.1 (libpurple 2.14.1) and CentOS 7.3 ejabberd server. Implementation is ~95% open loop with no C# bindings for libpurple.dll.',
        commands: ['random'],
        commandArgs: [
            { name: 'Chat Targets', example: 'user@domain.com', description: 'IM usernames to chat with (username@domain format). Used to initiate first chat of each activity cycle' }
        ],
        handlerArgs: {
            'RepliesMin': { description: 'Minimum number of messages to send per activity cycle', example: '2' },
            'RepliesMax': { description: 'Maximum number of messages to send per activity cycle', example: '5' },
            'EmoticonProbability': { description: 'Probability (0-100) of adding 1-4 random emojis to message', example: '50' },
            'NewChatProbability': { description: 'Probability (0-100) of starting new chat if IM window not open', example: '100' },
            'CloseChatProbability': { description: 'Probability (0-100) of closing current chat if new chat not initiated', example: '100' },
            'TimeBetweenMessagesMin': { description: 'Min delay in ms between individual messages in message loop', example: '5000' },
            'TimeBetweenMessagesMax': { description: 'Max delay in ms between individual messages in message loop', example: '10000' },
            'ErrorWindowTitles': { description: 'Array of popup window titles to automatically close during activity cycle', example: '["XMPP Message Error"]' }
        },
        prerequisites: 'Pidgin must be installed with enabled account in %APPDATA%\\.purple\\accounts.xml pointing to target server. Logged-in user must have enabled account. Preferences set in prefs.xml. Conversations must be TABBED (prefs.xml: conversations/tabs type=bool value=1).',
        notes: 'Activity cycle: pick random target, start Pidgin if needed, roll NewChatProbability to open IM to random target, else roll CloseChatProbability to close chat. If IM open, send RepliesMin-RepliesMax messages. First message to current target, then cycle through tabs. Chat target can be current user (messages echoed from server). As chats arrive from others, tab count grows but can close via CloseChatProbability. Cannot parse chat logs as Pidgin locks them - messages sent open loop with delays.'
    },
    'Notepad': {
        description: 'Creates, edits, and manages text files using Notepad. Uses probabilities to randomly delete, create, modify, or view files. Can print to PDF if default printer is configured as PDF printer.',
        commands: ['random'],
        commandArgs: [],
        handlerArgs: {
            'execution-probability': { description: 'Probability (0-100) of handler execution each cycle', example: '100' },
            'deletion-probability': { description: 'Probability (0-100) of deleting random file from output-directory', example: '0' },
            'creation-probability': { description: 'Probability (0-100) of creating new file with random text', example: '0' },
            'modification-probability': { description: 'Probability (0-100) of modifying existing file from output-directory', example: '100' },
            'view-probability': { description: 'Probability (0-100) of viewing existing file from input-directory', example: '0' },
            'pdf-probability': { description: 'Probability (0-100) of printing to PDF after create/modify. Requires default printer to be PDF printer', example: '100' },
            'input-directory': { description: 'Directory containing existing files for view operation', example: 'C:\\ghosts_data\\uploads' },
            'output-directory': { description: 'Directory for created/modified files and deletion operations', example: 'C:\\ghosts_data\\uploads' },
            'text-generation': { description: 'Text generation mode', example: 'random' },
            'min-paragraphs': { description: 'Minimum paragraphs of random text to generate', example: '4' },
            'max-paragraphs': { description: 'Maximum paragraphs of random text to generate', example: '15' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '50' }
        },
        notes: 'Activity cycle: choose action (delete/create/modify/view) based on probabilities. Delete: delete random file from output-directory. Create: open notepad, add random text, save as random new file to output-directory. View: open notepad with existing file from input-directory. Modify: open notepad with existing file from output-directory, add random text, save. Create/Modify: roll against pdf-probability to print to PDF. Default printer must be print to PDF - no checking if correct printer selected. Notepad closed at end of activity cycle. CommandArgs not used.'
    },
    'NpcSystem': {
        description: 'Controls the GHOSTS client start/stop state. Used to turn the client on and off remotely while the client binary continues running. Does not control individual handler behavior like other handlers.',
        commands: ['Start', 'Stop'],
        commandArgs: [],
        notes: 'Currently only used to toggle client on/off state. When stopped, client binary still runs but does nothing. Not used to control client behavior as other handlers do. Useful for simulating agents coming online/offline at specific times.'
    },
    'Curl': {
        description: 'Executes curl commands for HTTP/HTTPS requests, file downloads, and API interactions. Supports all standard curl command-line arguments and options.',
        commands: ['Any curl command'],
        commandArgs: [
            { name: 'Curl Arguments', example: '-X GET https://api.example.com/data', description: 'Standard curl command arguments and options' }
        ],
        notes: 'Command field contains the curl arguments. All standard curl options are supported including HTTP methods, headers, authentication, and data payloads.'
    },
    'LightWord': {
        description: 'Lightweight Word document handler that creates simple .docx files without requiring Microsoft Office. Uses the NPOI library to generate documents with random text content. Faster and more resource-efficient than full Word handler.',
        commands: ['create'],
        commandArgs: [
            { index: 0, name: 'Save Directory', example: '%homedrive%%homepath%\\Documents', description: 'Path where documents will be saved' }
        ],
        notes: 'Does not require Microsoft Office installation. Creates documents using NPOI library with random text paragraphs. Cannot open existing documents or export to PDF like full Word handler.'
    },
    'LightExcel': {
        description: 'Lightweight Excel spreadsheet handler that creates simple .xlsx files without requiring Microsoft Office. Uses the NPOI library to generate spreadsheets with random data. Faster and more resource-efficient than full Excel handler.',
        commands: ['create'],
        commandArgs: [
            { index: 0, name: 'Save Directory', example: '%homedrive%%homepath%\\Documents', description: 'Path where spreadsheets will be saved' }
        ],
        notes: 'Does not require Microsoft Office installation. Creates spreadsheets using NPOI library with random data. Cannot open existing spreadsheets or export to PDF like full Excel handler.'
    },
    'LightPowerPoint': {
        description: 'Lightweight PowerPoint handler (currently not implemented). NPOI library does not support PowerPoint presentations.',
        commands: [],
        commandArgs: [],
        notes: 'This handler is not currently functional as NPOI does not support PowerPoint file format. Use the full PowerPoint handler instead.'
    },
    'PowerShell': {
        description: 'Executes PowerShell commands and scripts. Supports variable replacement for dynamic command generation and execution probability for randomized behavior.',
        commands: ['random', 'Any PowerShell command'],
        commandArgs: [
            { name: 'PowerShell Command', example: 'Get-Process | Select-Object -First 10', description: 'PowerShell commands to execute. Can use {variable} syntax with replace HandlerArg' }
        ],
        handlerArgs: {
            'execution-probability': { description: 'Probability (0-100) of executing each command cycle', example: '100' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '50' },
            'replace': { description: 'Array of variable replacements for {variable} syntax in commands', example: '[{"verb": ["Get", "Set"]}, {"noun": ["Process", "Service"]}]' }
        },
        notes: 'Command "random" picks random CommandArg each cycle. Variable replacement syntax: use {varname} in commands, define replacements in replace HandlerArg. Example: "Get-{verb}" with replace:[{"verb":["Process","Service"]}] becomes "Get-Process" or "Get-Service".'
    },
    'Bash': {
        description: 'Executes Bash shell commands on Linux systems. Similar to Command handler but specifically for Bash shell environments.',
        commands: ['Any bash command'],
        commandArgs: [
            { name: 'Bash Command', example: 'ls -la /home', description: 'Bash commands to execute' }
        ],
        notes: 'Linux/Unix equivalent of Command handler. Executes commands through bash shell. Environment variables supported.'
    },
    'Outlookv2': {
        description: 'Advanced Outlook handler with probability-based email behaviors. Simulates realistic email usage including reading, replying, creating, and deleting emails. Supports attachments, link clicking, and complex email workflows.',
        commands: ['random'],
        commandArgs: [],
        handlerArgs: {
            'delete-probability': { description: 'Probability (0-100) of deleting an email', example: '25' },
            'create-probability': { description: 'Probability (0-100) of creating new email', example: '25' },
            'reply-probability': { description: 'Probability (0-100) of replying to existing email', example: '25' },
            'read-probability': { description: 'Probability (0-100) of reading an unread email', example: '25' },
            'attachment-probability': { description: 'Probability (0-100) of adding attachment when creating email', example: '0' },
            'saveattachment-probability': { description: 'Probability (0-100) of saving attachment to disk when reading', example: '0' },
            'click-probability': { description: 'Probability (0-100) of clicking link in email when reading', example: '0' },
            'attachments-max-size': { description: 'Maximum total size of attachments in MB', example: '10' },
            'attachments-min': { description: 'Minimum number of attachments to add', example: '0' },
            'attachments-max': { description: 'Maximum number of attachments to add', example: '3' },
            'input-directory': { description: 'Directory containing files to use as attachments', example: 'C:\\ghosts_data\\uploads' },
            'output-directory': { description: 'Directory to save downloaded attachments', example: 'C:\\ghosts_data\\downloads' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '50' },
            'domain-email-list': { description: 'JSON array of email addresses to use for sending emails', example: '["user1@domain.com", "user2@domain.com"]' }
        },
        notes: 'Uses probability-based action selection. Each cycle: rolls against probabilities to choose action (read/reply/create/delete), then executes chosen action. Attachment probability applies when creating emails. Click/save probabilities apply when reading. Requires Outlook to be installed and configured. More advanced than original Outlook handler with better error handling and realistic behavior.'
    },
    'Ftp': {
        description: 'Performs FTP file transfers including upload, download, and delete operations. Supports probability-based action selection for realistic FTP usage patterns.',
        commands: ['random'],
        commandArgs: [
            { name: 'Connection String', example: 'ftp://192.168.1.1', description: 'FTP server URL' }
        ],
        handlerArgs: {
            'CredentialsFile': { description: 'Path to FTP credentials JSON file', example: 'C:\\ghosts\\ftp_creds.json' },
            'Credentials': { description: 'Inline JSON credentials object (alternative to CredentialsFile)', example: '{"username":"user","password":"base64pw"}' },
            'UploadDirectory': { description: 'Local directory containing files for upload. Defaults to Downloads if not specified', example: 'C:\\uploads' },
            'deletion-probability': { description: 'Probability (0-100) of deleting remote file', example: '20' },
            'download-probability': { description: 'Probability (0-100) of downloading remote file', example: '40' },
            'upload-probability': { description: 'Probability (0-100) of uploading local file', example: '40' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '50' }
        },
        notes: 'Uses probability-based action selection. Each cycle: connects to FTP server, rolls against probabilities to choose action (upload/download/delete), executes action, disconnects. Downloads placed in user Downloads directory. Credentials can be inline JSON or file-based.'
    },
    'Aws': {
        description: 'Executes AWS CLI commands for interacting with Amazon Web Services. Requires AWS CLI to be installed and configured on the system.',
        commands: ['Any AWS CLI command'],
        commandArgs: [
            { name: 'AWS Command', example: 's3 ls', description: 'AWS CLI commands (without "aws" prefix). Can use {variable} syntax with HandlerArgs' }
        ],
        handlerArgs: {
            'replace': { description: 'Array of variable replacements for {variable} syntax in commands', example: '[{"bucket": ["mybucket1", "mybucket2"]}, {"region": ["us-east-1", "us-west-2"]}]' }
        },
        prerequisites: 'AWS CLI must be installed and configured with valid credentials. Commands automatically include --no-verify flag.',
        notes: 'Automatically adds --no-verify flag to all commands. Supports variable replacement like PowerShell handler. Example: "s3 ls {bucket}" with replace:[{"bucket":["bucket1","bucket2"]}]. Requires AWS CLI to be installed and credentials configured via "aws configure".'
    },
    'Azure': {
        description: 'Executes Azure CLI commands for interacting with Microsoft Azure services. Requires Azure CLI to be installed and configured on the system.',
        commands: ['Any Azure CLI command'],
        commandArgs: [
            { name: 'Azure Command', example: 'vm list', description: 'Azure CLI commands (without "az" prefix). Can use {variable} syntax with HandlerArgs' }
        ],
        handlerArgs: {
            'replace': { description: 'Array of variable replacements for {variable} syntax in commands', example: '[{"resourcegroup": ["rg1", "rg2"]}, {"location": ["eastus", "westus"]}]' }
        },
        prerequisites: 'Azure CLI (az) must be installed and configured with valid credentials.',
        notes: 'Supports variable replacement like PowerShell handler. Example: "vm list -g {resourcegroup}" with replace:[{"resourcegroup":["rg1","rg2"]}]. Requires Azure CLI to be installed and authentication configured via "az login".'
    },
    'ExecuteFile': {
        description: 'Executes files (executables, scripts, batch files) from specified directory. Supports probability-based execution and output folder configuration.',
        commands: ['random', 'execute'],
        commandArgs: [
            { name: 'File Path', example: 'C:\\scripts\\script.bat', description: 'Path to file to execute' }
        ],
        handlerArgs: {
            'execution-probability': { description: 'Probability (0-100) that file execution occurs each cycle', example: '100' },
            'execWaitTime': { description: 'Milliseconds to wait for file execution to complete', example: '5000' },
            'outFolder': { description: 'Output directory for execution results or logs', example: 'C:\\output' },
            'folderPath': { description: 'Source folder containing files to execute (used with random command)', example: 'C:\\scripts' },
            'delay-jitter': { description: 'Optional (0-50) - if specified, DelayAfter varied by ±jitter%', example: '50' }
        },
        notes: 'Command "random" selects random file from folderPath. Execution waits for execWaitTime before continuing. Useful for running scripts, tools, or executables as part of simulation.'
    }
};
