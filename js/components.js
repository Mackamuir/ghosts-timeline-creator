        // React hooks
        const { useState, useEffect } = React;

        // Detect browser timezone
        const getBrowserTimezone = () => {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            // Check if this timezone is in our TIMEZONES list
            const found = TIMEZONES.find(t => t.value === tz);
            return found ? tz : 'UTC';
        };

        // Detect system dark mode preference
        const getSystemDarkMode = () => {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        };

        // Validate time format HH:MM:SS
        const validateTime = (timeStr) => {
            if (!timeStr) return false;
            const timeRegex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9]):([0-5][0-9])$/;
            return timeRegex.test(timeStr);
        };

        function TimelineEditor() {
            const [timeline, setTimeline] = useState({
                Id: crypto.randomUUID(),
                Status: 'Run',
                TimeLineHandlers: []
            });
            const [editingHandler, setEditingHandler] = useState(null);
            const [showJson, setShowJson] = useState(false);
            const [jsonText, setJsonText] = useState('');
            const [importError, setImportError] = useState('');
            const [darkMode, setDarkMode] = useState(getSystemDarkMode());
            const [userTimezone, setUserTimezone] = useState(getBrowserTimezone());

            // Apply dark mode on mount and when it changes
            useEffect(() => {
                if (darkMode) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }, [darkMode]);

            // Listen for system theme changes
            useEffect(() => {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleChange = (e) => {
                    setDarkMode(e.matches);
                };

                // Add listener for theme changes
                mediaQuery.addEventListener('change', handleChange);

                // Cleanup
                return () => mediaQuery.removeEventListener('change', handleChange);
            }, []);

            const addHandler = () => {
                const newHandler = {
                    HandlerType: 'Command',
                    Initial: '',
                    UtcTimeOn: '00:00:00',
                    UtcTimeOff: '24:00:00',
                    Loop: true,
                    TimeLineEvents: []
                };
                setTimeline({
                    ...timeline,
                    TimeLineHandlers: [...timeline.TimeLineHandlers, newHandler]
                });
            };

            const updateHandler = (index, updates) => {
                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers[index] = { ...newHandlers[index], ...updates };
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const deleteHandler = (index) => {
                const newHandlers = timeline.TimeLineHandlers.filter((_, i) => i !== index);
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
                if (editingHandler === index) {
                    setEditingHandler(null);
                }
            };

            const duplicateHandler = (index) => {
                const handler = JSON.parse(JSON.stringify(timeline.TimeLineHandlers[index]));
                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers.splice(index + 1, 0, handler);
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const addEvent = (handlerIndex) => {
                const handler = timeline.TimeLineHandlers[handlerIndex];
                const newEvent = {
                    Command: handler.HandlerType.includes('Browser') ? 'browse' : '',
                    CommandArgs: [],
                    DelayBefore: 0,
                    DelayAfter: 1000
                };

                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers[handlerIndex].TimeLineEvents = [
                    ...newHandlers[handlerIndex].TimeLineEvents,
                    newEvent
                ];
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const updateEvent = (handlerIndex, eventIndex, updates) => {
                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers[handlerIndex].TimeLineEvents[eventIndex] = {
                    ...newHandlers[handlerIndex].TimeLineEvents[eventIndex],
                    ...updates
                };
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const deleteEvent = (handlerIndex, eventIndex) => {
                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers[handlerIndex].TimeLineEvents =
                    newHandlers[handlerIndex].TimeLineEvents.filter((_, i) => i !== eventIndex);
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const duplicateEvent = (handlerIndex, eventIndex) => {
                const event = JSON.parse(JSON.stringify(
                    timeline.TimeLineHandlers[handlerIndex].TimeLineEvents[eventIndex]
                ));
                const newHandlers = [...timeline.TimeLineHandlers];
                newHandlers[handlerIndex].TimeLineEvents.splice(eventIndex + 1, 0, event);
                setTimeline({ ...timeline, TimeLineHandlers: newHandlers });
            };

            const exportJson = () => {
                const json = JSON.stringify(timeline, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'timeline.json';
                a.click();
                URL.revokeObjectURL(url);
            };

            const importJson = () => {
                try {
                    const parsed = JSON.parse(jsonText);
                    setTimeline(parsed);
                    setShowJson(false);
                    setImportError('');
                } catch (e) {
                    setImportError('Invalid JSON: ' + e.message);
                }
            };

            const loadTemplate = (type) => {
                let template = {};
                switch(type) {
                    case 'browser':
                        template = {
                            Status: 'Run',
                            TimeLineHandlers: [{
                                HandlerType: 'BrowserChrome',
                                HandlerArgs: {
                                    isheadless: 'false',
                                    blockimages: 'false',
                                    blockstyles: 'false',
                                    stickiness: 80,
                                    'stickiness-depth-min': 3,
                                    'stickiness-depth-max': 25
                                },
                                Initial: 'about:blank',
                                UtcTimeOn: '00:00:00',
                                UtcTimeOff: '24:00:00',
                                Loop: true,
                                TimeLineEvents: [{
                                    Command: 'random',
                                    CommandArgs: [
                                        'http://www.google.com',
                                        'http://www.wikipedia.org',
                                        'http://www.github.com'
                                    ],
                                    DelayAfter: 300000,
                                    DelayBefore: 0
                                }]
                            }]
                        };
                        break;
                    case 'command':
                        template = {
                            Status: 'Run',
                            TimeLineHandlers: [{
                                HandlerType: 'Command',
                                Initial: '',
                                UtcTimeOn: '00:00:00',
                                UtcTimeOff: '24:00:00',
                                Loop: true,
                                TimeLineEvents: [{
                                    Command: 'dir',
                                    CommandArgs: [],
                                    DelayAfter: 10,
                                    DelayBefore: 1000
                                }]
                            }]
                        };
                        break;
                    case 'office':
                        template = {
                            Status: 'Run',
                            TimeLineHandlers: [{
                                HandlerType: 'Word',
                                Initial: '',
                                UtcTimeOn: '00:00:00',
                                UtcTimeOff: '24:00:00',
                                Loop: false,
                                TimeLineEvents: [{
                                    Command: 'random',
                                    CommandArgs: [],
                                    DelayAfter: 60000,
                                    DelayBefore: 5000
                                }]
                            }]
                        };
                        break;
                }
                setTimeline(template);
            };

            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white shadow-lg">
                        <div className="container mx-auto px-4 py-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold flex items-center gap-3">
                                        <i className="fas fa-ghost"></i>
                                        GHOSTS Timeline Editor
                                    </h1>
                                    <p className="text-indigo-100 dark:text-indigo-200 mt-1">Configure realistic user simulation timelines</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                                        <i className="fas fa-clock"></i>
                                        <select
                                            value={userTimezone}
                                            onChange={(e) => setUserTimezone(e.target.value)}
                                            className="bg-transparent border-none text-white font-medium focus:outline-none cursor-pointer"
                                            title="Your timezone (times will be converted to UTC)"
                                        >
                                            {TIMEZONES.map(tz => (
                                                <option key={tz.value} value={tz.value} className="text-gray-900">{tz.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        title="Toggle dark mode"
                                    >
                                        <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
                                        {darkMode ? 'Light' : 'Dark'}
                                    </button>
                                    <button
                                        onClick={() => setShowJson(!showJson)}
                                        className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 dark:bg-white dark:text-indigo-600 dark:hover:bg-indigo-50 font-medium transition-colors flex items-center gap-2"
                                    >
                                        <i className="fas fa-code"></i>
                                        {showJson ? 'Editor' : 'JSON View'}
                                    </button>
                                    <button
                                        onClick={exportJson}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <i className="fas fa-download"></i>
                                        Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 py-6">
                        {showJson ? (
                            /* JSON View */
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">JSON Configuration</h2>
                                    <button
                                        onClick={importJson}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <i className="fas fa-file-import"></i>
                                        Import
                                    </button>
                                </div>
                                {importError && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                                        <i className="fas fa-exclamation-circle mr-2"></i>
                                        {importError}
                                    </div>
                                )}
                                <textarea
                                    value={jsonText || JSON.stringify(timeline, null, 2)}
                                    onChange={(e) => setJsonText(e.target.value)}
                                    className="w-full h-96 font-mono text-sm p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                    placeholder="Paste JSON here..."
                                />
                            </div>
                        ) : (
                            /* Visual Editor */
                            <div className="space-y-6">
                                {/* Quick Start Templates */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <i className="fas fa-rocket"></i>
                                        Quick Start Templates
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => loadTemplate('browser')}
                                            className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all text-left"
                                        >
                                            <i className="fas fa-globe text-blue-500 dark:text-blue-400 text-2xl mb-2"></i>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Browser Activity</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Simulate web browsing with Chrome/Firefox</p>
                                        </button>
                                        <button
                                            onClick={() => loadTemplate('command')}
                                            className="p-4 border-2 border-green-200 dark:border-green-700 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all text-left"
                                        >
                                            <i className="fas fa-terminal text-green-500 dark:text-green-400 text-2xl mb-2"></i>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Command Line</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Execute shell commands and scripts</p>
                                        </button>
                                        <button
                                            onClick={() => loadTemplate('office')}
                                            className="p-4 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all text-left"
                                        >
                                            <i className="fas fa-file-word text-purple-500 dark:text-purple-400 text-2xl mb-2"></i>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Office Work</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Simulate document creation/editing</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline Settings */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Timeline Settings</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeline ID</label>
                                            <input
                                                type="text"
                                                value={timeline.Id || ''}
                                                onChange={(e) => setTimeline({ ...timeline, Id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                                                placeholder="GUID for tracking timeline origin"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique identifier to track where activity originated</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                            <select
                                                value={timeline.Status}
                                                onChange={(e) => setTimeline({ ...timeline, Status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="Run">Run</option>
                                                <option value="Stop">Stop</option>
                                            </select>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current timeline execution state</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Handlers List */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                            <i className="fas fa-list"></i>
                                            Timeline Handlers ({timeline.TimeLineHandlers.length})
                                        </h2>
                                        <button
                                            onClick={addHandler}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <i className="fas fa-plus"></i>
                                            Add Handler
                                        </button>
                                    </div>

                                    {timeline.TimeLineHandlers.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            <i className="fas fa-inbox text-6xl mb-4"></i>
                                            <p className="text-lg">No handlers configured</p>
                                            <p className="text-sm">Click "Add Handler" or use a template to get started</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {timeline.TimeLineHandlers.map((handler, handlerIndex) => (
                                                <HandlerCard
                                                    key={handlerIndex}
                                                    handler={handler}
                                                    handlerIndex={handlerIndex}
                                                    userTimezone={userTimezone}
                                                    isExpanded={editingHandler === handlerIndex}
                                                    onToggle={() => setEditingHandler(editingHandler === handlerIndex ? null : handlerIndex)}
                                                    onUpdate={(updates) => updateHandler(handlerIndex, updates)}
                                                    onDelete={() => deleteHandler(handlerIndex)}
                                                    onDuplicate={() => duplicateHandler(handlerIndex)}
                                                    onAddEvent={() => addEvent(handlerIndex)}
                                                    onUpdateEvent={(eventIndex, updates) => updateEvent(handlerIndex, eventIndex, updates)}
                                                    onDeleteEvent={(eventIndex) => deleteEvent(handlerIndex, eventIndex)}
                                                    onDuplicateEvent={(eventIndex) => duplicateEvent(handlerIndex, eventIndex)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Delay Editor Component - supports both simple number and complex object format
        // allowRandom prop controls whether random mode is available (DelayAfter only)
        // TimeBlocksEditor component for managing UTC time blocks
    function TimeBlocksEditor({ blocks, onChange, userTimezone }) {
        const [localBlocks, setLocalBlocks] = React.useState([]);
        const [validations, setValidations] = React.useState([]);

        // Initialize local blocks from UTC blocks
        React.useEffect(() => {
            if (!blocks || blocks.length === 0) {
                setLocalBlocks([]);
                setValidations([]);
                return;
            }

            // Convert UTC blocks to local timezone
            const converted = [];
            for (let i = 0; i < blocks.length; i += 2) {
                if (i + 1 < blocks.length) {
                    const startUtc = blocks[i];
                    const endUtc = blocks[i + 1];
                    converted.push({
                        start: userTimezone === 'UTC' ? startUtc : convertTimeFromUTC(startUtc, userTimezone),
                        end: userTimezone === 'UTC' ? endUtc : convertTimeFromUTC(endUtc, userTimezone)
                    });
                }
            }
            setLocalBlocks(converted);
            setValidations(converted.map(() => ({ start: true, end: true })));
        }, [blocks, userTimezone]);

        const addBlock = () => {
            setLocalBlocks([...localBlocks, { start: '', end: '' }]);
            setValidations([...validations, { start: true, end: true }]);
        };

        const removeBlock = (index) => {
            const newBlocks = localBlocks.filter((_, i) => i !== index);
            const newValidations = validations.filter((_, i) => i !== index);
            setLocalBlocks(newBlocks);
            setValidations(newValidations);
            updateUtcBlocks(newBlocks, newValidations);
        };

        const updateBlock = (index, field, value) => {
            const newBlocks = [...localBlocks];
            newBlocks[index] = { ...newBlocks[index], [field]: value };

            const newValidations = [...validations];
            newValidations[index] = { ...newValidations[index], [field]: validateTime(value) };

            setLocalBlocks(newBlocks);
            setValidations(newValidations);
            updateUtcBlocks(newBlocks, newValidations);
        };

        const updateUtcBlocks = (blocks, validations) => {
            // Only convert to UTC if all times are valid
            const allValid = validations.every(v => v.start && v.end);
            if (!allValid || blocks.length === 0) {
                onChange(null);
                return;
            }

            // Convert to flat array of UTC times
            const utcArray = [];
            blocks.forEach(block => {
                if (block.start && block.end) {
                    const startUtc = userTimezone === 'UTC' ? block.start : convertTimeToUTC(block.start, userTimezone);
                    const endUtc = userTimezone === 'UTC' ? block.end : convertTimeToUTC(block.end, userTimezone);
                    utcArray.push(startUtc, endUtc);
                }
            });

            onChange(utcArray.length > 0 ? utcArray : null);
        };

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        UTC Time Blocks (Optional)
                    </label>
                    <button
                        type="button"
                        onClick={addBlock}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                        Add Block
                    </button>
                </div>

                {localBlocks.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No time blocks defined. Click "Add Block" to create time windows within the day.
                    </p>
                )}

                {localBlocks.map((block, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Start Time ({userTimezone === 'UTC' ? 'UTC' : TIMEZONES.find(t => t.value === userTimezone)?.label.split(' ')[0]})
                                    </label>
                                    <input
                                        type="text"
                                        value={block.start}
                                        onChange={(e) => updateBlock(index, 'start', e.target.value)}
                                        className={`w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            !validations[index]?.start ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="HH:MM:SS"
                                    />
                                    {!validations[index]?.start && block.start && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Invalid format</p>
                                    )}
                                    {validations[index]?.start && userTimezone !== 'UTC' && block.start && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            UTC: {convertTimeToUTC(block.start, userTimezone)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        End Time ({userTimezone === 'UTC' ? 'UTC' : TIMEZONES.find(t => t.value === userTimezone)?.label.split(' ')[0]})
                                    </label>
                                    <input
                                        type="text"
                                        value={block.end}
                                        onChange={(e) => updateBlock(index, 'end', e.target.value)}
                                        className={`w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            !validations[index]?.end ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="HH:MM:SS"
                                    />
                                    {!validations[index]?.end && block.end && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Invalid format</p>
                                    )}
                                    {validations[index]?.end && userTimezone !== 'UTC' && block.end && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            UTC: {convertTimeToUTC(block.end, userTimezone)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeBlock(index)}
                                className="mt-6 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                title="Remove block"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}

                {localBlocks.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Define time windows within the day. Example: 09:00:00 to 12:00:00 and 14:00:00 to 17:00:00 creates two active windows.
                    </p>
                )}
            </div>
        );
    }

    function DelayEditor({ value, onChange, label, allowRandom = true }) {
            // If allowRandom is false and value is an object, convert to simple number (use min value)
            const initialValue = !allowRandom && typeof value === 'object' && value !== null
                ? (value.min || 0)
                : value;

            const [mode, setMode] = useState(
                allowRandom && typeof initialValue === 'object' && initialValue !== null ? 'random' : 'simple'
            );
            const [unit, setUnit] = useState('ms');

            // Effect to convert object to number if allowRandom becomes false
            useEffect(() => {
                if (!allowRandom && typeof value === 'object' && value !== null) {
                    onChange(value.min || 0);
                }
            }, [allowRandom]);

            const convertToMs = (val, fromUnit) => {
                const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000 };
                return val * multipliers[fromUnit];
            };

            const convertFromMs = (val, toUnit) => {
                const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000 };
                return Math.round(val / multipliers[toUnit]);
            };

            const simpleValue = mode === 'simple' ? (typeof initialValue === 'number' ? initialValue : 0) : 0;
            const randomValue = mode === 'random' && typeof initialValue === 'object' ? initialValue : { random: true, min: 0, max: 0 };

            const handleModeChange = (newMode) => {
                setMode(newMode);
                if (newMode === 'simple') {
                    onChange(0);
                } else {
                    onChange({ random: true, min: 0, max: 10000 });
                }
            };

            const handleSimpleChange = (val) => {
                onChange(convertToMs(val, unit));
            };

            const handleRandomChange = (field, val) => {
                onChange({
                    ...randomValue,
                    [field]: field === 'random' ? val : convertToMs(val, unit)
                });
            };

            return (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        {allowRandom && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleModeChange('simple')}
                                    className={`px-3 py-1 text-xs rounded ${mode === 'simple' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    Fixed
                                </button>
                                <button
                                    onClick={() => handleModeChange('random')}
                                    className={`px-3 py-1 text-xs rounded ${mode === 'random' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    Random
                                </button>
                            </div>
                        )}
                    </div>

                    {mode === 'simple' ? (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={convertFromMs(simpleValue, unit)}
                                onChange={(e) => handleSimpleChange(parseInt(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="ms">ms</option>
                                <option value="s">seconds</option>
                                <option value="m">minutes</option>
                                <option value="h">hours</option>
                            </select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Min</label>
                                    <input
                                        type="number"
                                        value={convertFromMs(randomValue.min || 0, unit)}
                                        onChange={(e) => handleRandomChange('min', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Max</label>
                                    <input
                                        type="number"
                                        value={convertFromMs(randomValue.max || 0, unit)}
                                        onChange={(e) => handleRandomChange('max', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="ms">milliseconds</option>
                                <option value="s">seconds</option>
                                <option value="m">minutes</option>
                                <option value="h">hours</option>
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Outputs: {`{"random": true, "min": ${randomValue.min}, "max": ${randomValue.max}}`}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        function HandlerCard({
            handler,
            handlerIndex,
            userTimezone,
            isExpanded,
            onToggle,
            onUpdate,
            onDelete,
            onDuplicate,
            onAddEvent,
            onUpdateEvent,
            onDeleteEvent,
            onDuplicateEvent
        }) {
            // Local state for time inputs (what user types)
            const [localTimeOn, setLocalTimeOn] = useState(handler.UtcTimeOn || '00:00:00');
            const [localTimeOff, setLocalTimeOff] = useState(handler.UtcTimeOff || '24:00:00');
            const [timeOnValid, setTimeOnValid] = useState(true);
            const [timeOffValid, setTimeOffValid] = useState(true);

            const getHandlerIcon = (type) => {
                const icons = {
                    'BrowserChrome': 'fa-chrome',
                    'BrowserFirefox': 'fa-firefox',
                    'Command': 'fa-terminal',
                    'Word': 'fa-file-word',
                    'Excel': 'fa-file-excel',
                    'PowerPoint': 'fa-file-powerpoint',
                    'Outlook': 'fa-envelope',
                    'Outlookv2': 'fa-envelope',
                    'Rdp': 'fa-desktop',
                    'Notepad': 'fa-file-alt',
                    'NpcSystem': 'fa-robot',
                    'Reboot': 'fa-power-off',
                    'Curl': 'fa-download',
                    'Clicks': 'fa-mouse-pointer',
                    'Watcher': 'fa-eye',
                    'LightWord': 'fa-file-word',
                    'LightExcel': 'fa-file-excel',
                    'LightPowerPoint': 'fa-file-powerpoint',
                    'PowerShell': 'fa-terminal',
                    'Bash': 'fa-terminal',
                    'Print': 'fa-print',
                    'Ssh': 'fa-server',
                    'Sftp': 'fa-folder-open',
                    'Ftp': 'fa-folder',
                    'Pidgin': 'fa-comments',
                    'Wmi': 'fa-network-wired',
                    'Aws': 'fa-aws',
                    'Azure': 'fa-cloud'
                };
                return icons[type] || 'fa-cog';
            };

            const handlerDoc = HANDLER_DOCS[handler.HandlerType];

            return (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Handler Header */}
                    <div
                        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-colors"
                        onClick={onToggle}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <i className={`fas ${getHandlerIcon(handler.HandlerType)} text-2xl text-indigo-600 dark:text-indigo-400`}></i>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Handler #{handlerIndex + 1}: {handler.HandlerType}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {handler.TimeLineEvents.length} event(s) |
                                        Active: {localTimeOn} - {localTimeOff} {userTimezone === 'UTC' ? 'UTC' : TIMEZONES.find(t => t.value === userTimezone)?.label.split(' ')[0]} |
                                        Loop: {handler.Loop ? 'Yes' : 'No'}
                                    </p>
                                    {handlerDoc && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{handlerDoc.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Duplicate handler"
                                >
                                    <i className="fas fa-copy"></i>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Delete handler"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-600 dark:text-gray-400`}></i>
                            </div>
                        </div>
                    </div>

                    {/* Handler Details (Expanded) */}
                    {isExpanded && (
                        <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
                            {/* Handler Documentation */}
                            {handlerDoc && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                        <i className="fas fa-info-circle"></i>
                                        Handler Information
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">{handlerDoc.description}</p>
                                    {handlerDoc.prerequisites && (
                                        <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                            <strong>Prerequisites:</strong> {handlerDoc.prerequisites}
                                        </div>
                                    )}
                                    {handlerDoc.notes && (
                                        <div className="text-sm text-blue-800 dark:text-blue-200">
                                            <strong>Notes:</strong> {handlerDoc.notes}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Handler Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Handler Type</label>
                                    <select
                                        value={handler.HandlerType}
                                        onChange={(e) => onUpdate({ HandlerType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        {HANDLER_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Value</label>
                                    <input
                                        type="text"
                                        value={handler.Initial || ''}
                                        onChange={(e) => onUpdate({ Initial: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder={handler.HandlerType.includes('Browser') ? 'http://example.com or about:blank' : ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Time On ({userTimezone === 'UTC' ? 'UTC' : TIMEZONES.find(t => t.value === userTimezone)?.label.split(' ')[0]})
                                    </label>
                                    <input
                                        type="text"
                                        value={localTimeOn}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setLocalTimeOn(value);
                                            const isValid = validateTime(value);
                                            setTimeOnValid(isValid);
                                            if (isValid) {
                                                const utcValue = userTimezone === 'UTC' ? value : convertTimeToUTC(value, userTimezone);
                                                onUpdate({ UtcTimeOn: utcValue });
                                            }
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            !timeOnValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="HH:MM:SS"
                                    />
                                    {!timeOnValid && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            Invalid time format. Use HH:MM:SS (e.g., 09:30:00)
                                        </p>
                                    )}
                                    {timeOnValid && userTimezone !== 'UTC' && localTimeOn && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            UTC: {convertTimeToUTC(localTimeOn, userTimezone)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Time Off ({userTimezone === 'UTC' ? 'UTC' : TIMEZONES.find(t => t.value === userTimezone)?.label.split(' ')[0]})
                                    </label>
                                    <input
                                        type="text"
                                        value={localTimeOff}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setLocalTimeOff(value);
                                            const isValid = validateTime(value);
                                            setTimeOffValid(isValid);
                                            if (isValid) {
                                                const utcValue = userTimezone === 'UTC' ? value : convertTimeToUTC(value, userTimezone);
                                                onUpdate({ UtcTimeOff: utcValue });
                                            }
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                                            !timeOffValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="HH:MM:SS"
                                    />
                                    {!timeOffValid && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            Invalid time format. Use HH:MM:SS (e.g., 17:30:00)
                                        </p>
                                    )}
                                    {timeOffValid && userTimezone !== 'UTC' && localTimeOff && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            UTC: {convertTimeToUTC(localTimeOff, userTimezone)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loop</label>
                                    <select
                                        value={handler.Loop ? 'true' : 'false'}
                                        onChange={(e) => onUpdate({ Loop: e.target.value === 'true' })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule Type</label>
                                    <select
                                        value={handler.ScheduleType || 'Other'}
                                        onChange={(e) => onUpdate({ ScheduleType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        {SCHEDULE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use "Cron" for CRON expression scheduling</p>
                                </div>

                                {handler.ScheduleType === 'Cron' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CRON Schedule</label>
                                        <input
                                            type="text"
                                            value={handler.Schedule || ''}
                                            onChange={(e) => onUpdate({ Schedule: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                                            placeholder="0 9 * * 1-5 (Every weekday at 9am)"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CRON expression (e.g., "0 9 * * 1-5" for weekdays at 9am)</p>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <TimeBlocksEditor
                                        blocks={handler.UtcTimeBlocks || null}
                                        onChange={(blocks) => onUpdate({ UtcTimeBlocks: blocks })}
                                        userTimezone={userTimezone}
                                    />
                                </div>
                            </div>

                            {/* Handler Args */}
                            {(handler.HandlerType.includes('Browser') ||
                              handler.HandlerType === 'Pidgin' ||
                              handler.HandlerType === 'Rdp' ||
                              handler.HandlerType === 'Wmi' ||
                              handler.HandlerType === 'Ssh' ||
                              handler.HandlerType === 'Sftp' ||
                              handler.HandlerType === 'Notepad' ||
                              handler.HandlerType === 'Word' ||
                              handler.HandlerType === 'Excel' ||
                              handler.HandlerType === 'PowerPoint') && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                        <i className="fas fa-sliders-h"></i>
                                        Handler Arguments
                                    </h4>
                                    <HandlerArgsEditor
                                        handlerType={handler.HandlerType}
                                        args={handler.HandlerArgs || {}}
                                        onUpdate={(args) => onUpdate({ HandlerArgs: args })}
                                    />
                                </div>
                            )}

                            {/* Timeline Events */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <i className="fas fa-calendar-alt"></i>
                                        Timeline Events ({handler.TimeLineEvents.length})
                                    </h4>
                                    <button
                                        onClick={onAddEvent}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                                    >
                                        <i className="fas fa-plus"></i>
                                        Add Event
                                    </button>
                                </div>

                                {handler.TimeLineEvents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                        <i className="fas fa-calendar-times text-4xl mb-2"></i>
                                        <p>No events configured</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {handler.TimeLineEvents.map((event, eventIndex) => (
                                            <EventCard
                                                key={eventIndex}
                                                event={event}
                                                eventIndex={eventIndex}
                                                handlerType={handler.HandlerType}
                                                onUpdate={(updates) => onUpdateEvent(eventIndex, updates)}
                                                onDelete={() => onDeleteEvent(eventIndex)}
                                                onDuplicate={() => onDuplicateEvent(eventIndex)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        function HandlerArgsEditor({ handlerType, args, onUpdate }) {
            const updateArg = (key, value) => {
                onUpdate({ ...args, [key]: value });
            };

            const handlerDoc = HANDLER_DOCS[handlerType];

            // Generic renderer for any handler with documented HandlerArgs
            const renderGenericHandlerArgs = () => {
                if (!handlerDoc?.handlerArgs) return null;

                const argKeys = Object.keys(handlerDoc.handlerArgs);
                if (argKeys.length === 0) return null;

                return (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Handler Arguments</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {argKeys.map(key => {
                                const argDoc = handlerDoc.handlerArgs[key];
                                const currentValue = args[key] ?? argDoc.example ?? '';

                                // Determine input type based on the value
                                let inputElement;

                                // Boolean values (true/false strings)
                                if (argDoc.example === 'true' || argDoc.example === 'false') {
                                    inputElement = (
                                        <select
                                            value={currentValue}
                                            onChange={(e) => updateArg(key, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    );
                                }
                                // Numeric values (including probabilities)
                                else if (!isNaN(argDoc.example) && argDoc.example !== '') {
                                    inputElement = (
                                        <input
                                            type="number"
                                            value={currentValue}
                                            onChange={(e) => updateArg(key, parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder={argDoc.example}
                                        />
                                    );
                                }
                                // Object/JSON values (workingset, url-replace, etc)
                                else if (argDoc.example && (argDoc.example.startsWith('{') || argDoc.example.startsWith('['))) {
                                    inputElement = (
                                        <textarea
                                            value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    updateArg(key, parsed);
                                                } catch {
                                                    updateArg(key, e.target.value);
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                                            rows="3"
                                            placeholder={argDoc.example}
                                        />
                                    );
                                }
                                // Text/string values
                                else {
                                    inputElement = (
                                        <input
                                            type="text"
                                            value={currentValue}
                                            onChange={(e) => updateArg(key, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder={argDoc.example}
                                        />
                                    );
                                }

                                return (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {key}
                                        </label>
                                        {inputElement}
                                        {argDoc.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {argDoc.description}
                                                {argDoc.example && <span className="italic"> (Example: {argDoc.example})</span>}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            };

            // Use generic renderer for all handlers
            return renderGenericHandlerArgs();
        }

        function EventCard({ event, eventIndex, handlerType, onUpdate, onDelete, onDuplicate }) {
            const [expanded, setExpanded] = useState(false);

            const updateCommandArg = (index, value) => {
                const newArgs = [...(event.CommandArgs || [])];
                newArgs[index] = value;
                onUpdate({ CommandArgs: newArgs });
            };

            const addCommandArg = () => {
                const newArgs = [...(event.CommandArgs || []), ''];
                onUpdate({ CommandArgs: newArgs });
            };

            const deleteCommandArg = (index) => {
                const newArgs = event.CommandArgs.filter((_, i) => i !== index);
                onUpdate({ CommandArgs: newArgs });
            };

            const handlerDoc = HANDLER_DOCS[handlerType];

            return (
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div
                        className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full font-semibold text-sm">
                                {eventIndex + 1}
                            </span>
                            <div>
                                <span className="font-semibold text-gray-800 dark:text-gray-100">{event.Command || 'Unnamed Event'}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    ({event.CommandArgs?.length || 0} arg(s))
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                                title="Duplicate event"
                            >
                                <i className="fas fa-copy"></i>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                                title="Delete event"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-gray-600 dark:text-gray-400`}></i>
                        </div>
                    </div>

                    {expanded && (
                        <div className="p-4 border-t border-gray-300 dark:border-gray-700 space-y-4 bg-white dark:bg-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Command</label>
                                    {handlerType.includes('Browser') ? (
                                        <select
                                            value={event.Command}
                                            onChange={(e) => onUpdate({ Command: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            {BROWSER_COMMANDS.map(cmd => (
                                                <option key={cmd} value={cmd}>{cmd}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={event.Command}
                                            onChange={(e) => onUpdate({ Command: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Command to execute"
                                        />
                                    )}
                                    {handlerDoc && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available: {handlerDoc.commands.join(', ')}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trackable ID (optional)</label>
                                    <input
                                        type="text"
                                        value={event.TrackableId || ''}
                                        onChange={(e) => onUpdate({ TrackableId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="GUID for tracking"
                                    />
                                </div>

                                <DelayEditor
                                    value={event.DelayBefore}
                                    onChange={(value) => onUpdate({ DelayBefore: value })}
                                    label="Delay Before"
                                    allowRandom={false}
                                />

                                <DelayEditor
                                    value={event.DelayAfter}
                                    onChange={(value) => onUpdate({ DelayAfter: value })}
                                    label="Delay After"
                                    allowRandom={true}
                                />
                            </div>

                            {/* Command Arguments */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Command Arguments</label>
                                    <button
                                        onClick={addCommandArg}
                                        className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
                                    >
                                        <i className="fas fa-plus mr-1"></i>
                                        Add Argument
                                    </button>
                                </div>
                                {handlerDoc?.commandArgs && handlerDoc.commandArgs.length > 0 && (
                                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs text-blue-800 dark:text-blue-200">
                                        <strong>Expected arguments:</strong>
                                        <ul className="mt-1 ml-4 list-disc">
                                            {handlerDoc.commandArgs.map((arg, idx) => (
                                                <li key={idx}>
                                                    [{arg.index !== undefined ? arg.index : idx}] {arg.name}: {arg.description}
                                                    {arg.example && <div className="text-blue-600 dark:text-blue-300 mt-1">Example: {arg.example}</div>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-200">
                                    <strong>Variable Placeholders:</strong>
                                    <ul className="mt-1 ml-4 list-disc">
                                        <li><code className="bg-green-100 dark:bg-green-800 px-1 rounded">{'{guid}'}</code> - Generates new GUID</li>
                                        <li><code className="bg-green-100 dark:bg-green-800 px-1 rounded">{'{name}'}</code> - Generates filename: file_&lt;guid&gt;_&lt;datetime&gt;</li>
                                        <li><code className="bg-green-100 dark:bg-green-800 px-1 rounded">{'{random_file:~/path}'}</code> - Random file from directory</li>
                                        <li><code className="bg-green-100 dark:bg-green-800 px-1 rounded">{'{uuid}'}, {'{now}'}, {'{c}'}, {'{n}'}</code> - Built-in variables (browsers)</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    {(event.CommandArgs || []).map((arg, argIndex) => (
                                        <div key={argIndex} className="flex gap-2">
                                            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100">{argIndex}</span>
                                            <input
                                                type="text"
                                                value={arg}
                                                onChange={(e) => updateCommandArg(argIndex, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                placeholder={handlerType.includes('Browser') ? 'http://example.com' : 'Argument value'}
                                            />
                                            <button
                                                onClick={() => deleteCommandArg(argIndex)}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                    {(!event.CommandArgs || event.CommandArgs.length === 0) && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No arguments configured</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Render the app
        ReactDOM.render(<TimelineEditor />, document.getElementById('root'));
