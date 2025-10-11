document.addEventListener('DOMContentLoaded', function() {
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

    let currentDomains = [];
    let currentAction = '';

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
        wildcardCount.style.display = counts.wildcards > 0 ? 'inline-flex' : 'none';
        exactCount.textContent = counts.exact || 0;
        exactCount.style.display = counts.exact > 0 ? 'inline-flex' : 'none';
        allCount.textContent = counts.all || 0;
        allCount.style.display = counts.all > 0 ? 'inline-flex' : 'none';
        cleanCount.textContent = counts.clean || 0;
        cleanCount.style.display = counts.clean > 0 ? 'inline-flex' : 'none';
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
            domainPreview.value = 'No domains found. Try refreshing the page or check if you\'re on a valid program page.';
            downloadBtn.disabled = true;
            updateCounts({});
        } else {
            domainPreview.value = domains.join('\n');
            downloadBtn.disabled = false;
            updateCounts(counts);
            showStatus(`Found ${domains.length} domains. Improved filtering applied.`, 'success');
        }
    }

    async function executeAction(action) {
        try {
            downloadBtn.disabled = true;
            domainPreview.value = 'Extracting...';

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('bugcrowd.com') && !tab.url.includes('hackerone.com')) {
                showStatus('Please navigate to a Bugcrowd or HackerOne program page', 'error');
                return;
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: extractDomains,
                args: [action]
            });

            const data = results[0].result;
            currentDomains = data.domains;
            currentAction = action;
            previewDomains(currentDomains, data.counts);
            
        } catch (error) {
            console.error('Error:', error);
            showStatus('Error extracting domains. Ensure page is fully loaded and try again.', 'error');
        }
    }
    
    // Event listeners
    extractWildcardsBtn.addEventListener('click', () => executeAction('wildcards'));
    extractDomainsBtn.addEventListener('click', () => executeAction('all'));
    removeWildcardsBtn.addEventListener('click', () => executeAction('clean'));
    extractExactDomainsBtn.addEventListener('click', () => executeAction('exact'));

    downloadBtn.addEventListener('click', () => {
        if (currentDomains.length === 0) {
            showStatus('No domains to download.', 'error');
            return;
        }

        const content = currentDomains.join('\n');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
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
            }

            downloadFile(content, filename);
            showStatus(`Downloaded ${currentDomains.length} domains to ${filename}`, 'success');
        });
    });

    // Function to be injected - improved extraction logic
    function extractDomains(action) {
        const allDomains = new Set();
        const wildcards = new Set();
        const exacts = new Set();
        
        // Determine site
        const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
        const isHackerOne = window.location.hostname.includes('hackerone.com');
        
        // More specific selectors for better accuracy
        let selectors = [];
        if (isBugcrowd) {
            selectors = [
                '[data-testid="target-groups"] [data-testid="in-scope-table"] td:first-child',
                '.target-group .scope-table td:first-child',
                '.bc-panel .bc-table .bc-table__row td:first-child',
                '.target-table tbody tr td:first-child',
                '.in-scope-table tbody tr td:first-child',
                'table.in-scope td:first-child',
                '.scope-item .domain'
            ];
        } else if (isHackerOne) {
            selectors = [
                '[data-testid="policy-scopes"] tbody tr td:first-child',
                '.policy-scopes tbody tr td:first-child',
                '.structured-scope-list tbody tr td:first-child',
                '.scope-list tbody tr td:first-child',
                '.spec-scope-table tbody tr td:first-child',
                '.asset-identifier',
                '[data-scope-type="domain"]'
            ];
        }
        
        // Extract from specific cells
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(cell => {
                const text = cell.textContent.trim();
                if (text) {
                    extractAndClassify(text, allDomains, wildcards, exacts);
                }
            });
        });
        
        // Fallback: scan body text for domains (with better line filtering)
        const allText = document.body.innerText || document.body.textContent;
        const lines = allText.split('\n').filter(line => {
            const clean = line.trim();
            return clean.length > 0 && clean.length < 200 && // Increased length limit
                   !clean.match(/^\d{4,}/) && // Skip years or long numbers
                   !clean.includes('.json') &&
                   !clean.includes('.mov') &&
                   !clean.includes('Dashboard.') &&
                   !clean.includes('assistance.') &&
                   !clean.includes('date.') &&
                   !clean.includes('issues') &&
                   !clean.includes('services');
        });
        
        lines.forEach(line => extractAndClassify(line.trim(), allDomains, wildcards, exacts));
        
        function extractAndClassify(text, all, wild, exact) {
            if (!text) return;
            
            // Improved patterns: more robust domain matching
            const patterns = [
                // Wildcard exact
                /^\*\.([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                // Exact domain
                /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                // Within text with boundaries
                /(?:^|\s|[\(\[\{])(\*\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(?=\s|[\)\]\}]|$|[,;])/g,
                // URL-like
                /(https?:\/\/)?(\*\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^,\s]*)?/gi
            ];
            
            // Test exact patterns first
            if (patterns[0].test(text) || patterns[1].test(text)) {
                if (isValidDomain(text)) {
                    all.add(text);
                    if (text.startsWith('*.') && patterns[0].test(text)) wild.add(text);
                    else exact.add(text);
                }
                return;
            }
            
            // Extract from within
            patterns.slice(2).forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        let domain = match
                            .replace(/^https?:\/\//i, '')
                            .replace(/\/.*$/, '') // Remove path
                            .replace(/[,:;()[\]{}]$/, '')
                            .trim();
                        if (domain && isValidDomain(domain)) {
                            all.add(domain);
                            if (domain.startsWith('*.') && patterns[0].test(domain)) wild.add(domain);
                            else exact.add(domain);
                        }
                    });
                }
            });
        }
        
        function isValidDomain(domain) {
            if (!domain || domain.length < 4 || domain.length > 253) return false;
            if (!domain.includes('.')) return false;
            
            // Relaxed: allow numeric starts (e.g., 1password.com)
            // if (/^\d/.test(domain)) return false; // REMOVED
            
            // Improved regex: allows more valid chars, handles IDN basics
            const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
            if (!domainRegex.test(domain)) return false;
            
            // Fewer excludes: focus on clear false positives
            const excludePatterns = [
                /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|exe|dll|json|mov|mp4|avi|mkv|xml|csv|htm|html|css|js|php|asp|aspx|jsp|cgi|pl|py|rb|sh)$/i,
                /^(http|https|ftp|smtp|pop3|imap|www|file)$/i,
                /(Dashboard|assistance|date|issues|services|VerifyIframeDiscovery|Morea|Eligible|Ineligible|Sketch|Targets|Bugcrowd|HackerOne|Web|Mobile|iOS|Android|Other)$/i,
                /\d{4,}\.json$/i
            ];
            
            for (const pattern of excludePatterns) {
                if (pattern.test(domain)) return false;
            }
            
            const parts = domain.replace(/^\*\./, '').split('.');
            if (parts.length < 2) return false;
            
            // Parts validation: no empty, no leading/trailing -, allow numerics
            for (const part of parts) {
                if (!part || part.length === 0 || /^-.*|-$/.test(part) || /^[^a-zA-Z0-9]/.test(part)) return false;
            }
            
            // TLD: letters only, 2+
            const tld = parts[parts.length - 1];
            if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
            
            return true;
        }
        
        // Classify and filter
        const counts = {
            wildcards: wildcards.size,
            exact: exacts.size,
            all: allDomains.size,
            clean: wildcards.size // Same as wildcards for now
        };
        
        let filteredDomains = Array.from(allDomains).sort();
        
        if (action === 'wildcards') {
            filteredDomains = Array.from(wildcards).sort();
        } else if (action === 'clean') {
            filteredDomains = Array.from(wildcards).map(d => d.substring(2)).sort();
            counts.clean = filteredDomains.length;
        } else if (action === 'exact') {
            filteredDomains = Array.from(exacts).sort();
        }
        
        return { domains: filteredDomains, counts };
    }
});
