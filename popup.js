document.addEventListener('DOMContentLoaded', function () {
    const extractWildcardsBtn = document.getElementById('extractWildcards');
    const extractDomainsBtn = document.getElementById('extractDomains');
    const removeWildcardsBtn = document.getElementById('removeWildcards');
    const extractExactDomainsBtn = document.getElementById('extractExactDomainsBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('status');
    const domainPreview = document.getElementById('domainPreview');
    const wildcardCount = document.getElementById('wildcardCount');
    const exactCount = document.getElementById('exactCount');
    const allCount = document.getElementById('allCount');
    const cleanCount = document.getElementById('cleanCount');
    const wildcardCountChip = document.getElementById('wildcardCountChip');
    const exactCountChip = document.getElementById('exactCountChip');
    const allCountChip = document.getElementById('allCountChip');
    const cleanCountChip = document.getElementById('cleanCountChip');

    let currentDomains = [];
    let currentAction = '';
    let audioContext = null;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function playSound(frequency, duration = 0.2, type = 'sine') {
        initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    function showStatus(message, type = 'success') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 4000);
    }

    function updateCounts(counts) {
        wildcardCount.textContent = counts.wildcards || 0;
        wildcardCount.style.display = counts.wildcards > 0 ? 'flex' : 'none';
        exactCount.textContent = counts.exact || 0;
        exactCount.style.display = counts.exact > 0 ? 'flex' : 'none';
        allCount.textContent = counts.all || 0;
        allCount.style.display = counts.all > 0 ? 'flex' : 'none';
        cleanCount.textContent = counts.clean || 0;
        cleanCount.style.display = counts.clean > 0 ? 'flex' : 'none';

        if (wildcardCountChip) wildcardCountChip.textContent = counts.wildcards || 0;
        if (exactCountChip) exactCountChip.textContent = counts.exact || 0;
        if (allCountChip) allCountChip.textContent = counts.all || 0;
        if (cleanCountChip) cleanCountChip.textContent = counts.clean || 0;
    }

    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function previewDomains(domains, counts) {
        if (domains.length === 0) {
            domainPreview.textContent = '';
            domainPreview.setAttribute('data-placeholder', 'Neural scan complete: No assets detected. Recalibrate target.');
            downloadBtn.disabled = true;
            updateCounts({});
        } else {
            domainPreview.textContent = domains.join('\n');
            domainPreview.setAttribute('data-placeholder', '');
            downloadBtn.disabled = false;
            updateCounts(counts);
            showStatus(`Quantum entanglement: ${domains.length} assets captured. Enhanced filtering applied.`, 'success');
        }
    }

    async function injectContentScript(tabId) {
        try {
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['styles.css']
            });
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            return true;
        } catch (err) {
            console.error('Injection failed:', err);
            return false;
        }
    }

    async function executeAction(action) {
        try {
            downloadBtn.disabled = true;
            domainPreview.textContent = '';
            domainPreview.setAttribute('data-placeholder', 'Initiating quantum scan...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url) {
                showStatus('Target invalid: No URL detected.', 'error');
                return;
            }

            if (!tab.url.includes('bugcrowd.com') && !tab.url.includes('hackerone.com')) {
                showStatus('Target invalid: Lock onto Bugcrowd or HackerOne vector.', 'error');
                return;
            }

            const sendMessage = (retries = 1) => {
                chrome.tabs.sendMessage(tab.id, { action: 'getDomains', mode: action }, async (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Connection failed, attempting injection...', chrome.runtime.lastError);
                        // If it fails, try to inject the script and retry once
                        if (retries > 0) {
                            const injected = await injectContentScript(tab.id);
                            if (injected) {
                                // Short delay to allow script to initialize
                                setTimeout(() => sendMessage(retries - 1), 500);
                            } else {
                                showStatus('Injection failed. Refresh page manually.', 'error');
                            }
                        } else {
                            showStatus('Connection failed: Refresh page to inject neural link.', 'error');
                        }
                        return;
                    }

                    if (response) {
                        currentDomains = response.domains;
                        currentAction = action;
                        previewDomains(currentDomains, response.counts);
                    } else {
                        showStatus('Scan failed: No data received.', 'error');
                    }
                });
            };

            sendMessage();

        } catch (error) {
            console.error('Error:', error);
            showStatus('Scan disrupted: Reinitialize core.', 'error');
        }
    }

    // Event listeners with sounds
    extractWildcardsBtn.addEventListener('click', () => {
        playSound(800, 0.15, 'sine'); // High pitch for wildcards
        executeAction('wildcards');
    });
    extractDomainsBtn.addEventListener('click', () => {
        playSound(400, 0.25, 'square'); // Low rumble for full sweep
        executeAction('all');
    });
    removeWildcardsBtn.addEventListener('click', () => {
        playSound(600, 0.2, 'sawtooth'); // Warning tone for clean
        executeAction('clean');
    });
    extractExactDomainsBtn.addEventListener('click', () => {
        playSound(1000, 0.1, 'triangle'); // Sharp ping for exact
        executeAction('exact');
    });

    downloadBtn.addEventListener('click', () => {
        playSound(1200, 0.3, 'sine'); // Chime for download
        if (currentDomains.length === 0) {
            showStatus('No assets in buffer.', 'error');
            return;
        }

        const content = currentDomains.join('\n');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            const site = tab.url.includes('bugcrowd.com') ? 'bugcrowd' : 'hackerone';

            let filename;
            if (currentAction === 'wildcards') {
                filename = `${site}_wildcards_${timestamp}.txt`;
            } else if (currentAction === 'all') {
                filename = `${site}_all_domains_${timestamp}.txt`;
            } else if (currentAction === 'clean') {
                filename = `${site}_clean_wildcards_${timestamp}.txt`;
            } else if (currentAction === 'exact') {
                filename = `${site}_exact_domains_${timestamp}.txt`;
            } else {
                filename = `${site}_domains_${timestamp}.txt`;
            }

            downloadFile(content, filename);
            showStatus(`Asset dump complete: ${currentDomains.length} transferred to ${filename}`, 'success');
        });
    });
});
