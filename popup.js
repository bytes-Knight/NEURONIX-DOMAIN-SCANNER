document.addEventListener('DOMContentLoaded', function() {
    const extractWildcardsBtn = document.getElementById('extractWildcards');
    const extractDomainsBtn = document.getElementById('extractDomains');
    const removeWildcardsBtn = document.getElementById('removeWildcards');
    const extractExactDomainsBtn = document.getElementById('extractExactDomainsBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('status');
    const domainPreview = document.getElementById('domainPreview');
    
    let currentDomains = [];
    let currentAction = '';

    function showStatus(message, type = 'success') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
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

    function previewDomains(domains) {
        if (domains.length === 0) {
            domainPreview.value = 'No domains found on this page.';
            downloadBtn.disabled = true;
        } else {
            domainPreview.value = domains.join('\n');
            downloadBtn.disabled = false;
            showStatus(`Found ${domains.length} domains. Previewing results.`, 'info');
        }
    }

    async function executeAction(action) {
        try {
            downloadBtn.disabled = true;
            domainPreview.value = '';

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

            previewDomains(currentDomains);
            
        } catch (error) {
            console.error('Error:', error);
            showStatus('Error extracting domains. Check console for details.', 'error');
        }
    }
    
    // Event listeners
    extractWildcardsBtn.addEventListener('click', () => executeAction('wildcards'));
    extractDomainsBtn.addEventListener('click', () => executeAction('domains'));
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
            } else if (currentAction === 'domains') {
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

    // This function will be injected into the page
    function extractDomains(action) {
        const domains = new Set();
        
        // Determine which site we're on
        const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
        const isHackerOne = window.location.hostname.includes('hackerone.com');
        
        if (isBugcrowd) {
            // Bugcrowd selectors - look for scope items
            const selectors = [
                '[data-testid="target-groups"] [data-testid="in-scope-table"] td',
                '.target-group .scope-table td',
                '.bc-panel .bc-table td',
                '.target-table td',
                '.in-scope-table td',
                'table td'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(cell => {
                    extractFromText(cell.textContent);
                });
            });
            
        } else if (isHackerOne) {
            // HackerOne selectors - look for scope items
            const selectors = [
                '[data-testid="policy-scopes"] td',
                '.policy-scopes td',
                '.structured-scope-list td',
                '.scope-list td',
                'table td',
                '.spec-scope-table td'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(cell => {
                    extractFromText(cell.textContent);
                });
            });
        }
        
        // Generic fallback - look for domain patterns in all text
        const allText = document.body.textContent;
        extractFromText(allText);
        
        function extractFromText(text) {
            if (!text) return;
            
            // Split text into lines and process each line
            const lines = text.split('\n');
            
            for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;
                
                // Skip obvious non-domain lines
                if (cleanLine.includes('.json') || 
                    cleanLine.includes('.mov') || 
                    cleanLine.includes('0') ||
                    cleanLine.match(/^\d+/) ||
                    cleanLine.includes('Dashboard.') ||
                    cleanLine.includes('assistance.') ||
                    cleanLine.includes('date.') ||
                    cleanLine.includes('issues') ||
                    cleanLine.includes('services') ||
                    cleanLine.length > 100) {
                    continue;
                }
                
                // Extract domains using multiple patterns
                const patterns = [
                    // Wildcard domains
                    /^\*\.([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                    // Regular domains (exact line match)
                    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                    // Domains within text (with word boundaries)
                    /(?:^|\s)(\*\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(?=\s|$)/g
                ];
                
                // Try exact line match first
                for (let i = 0; i < 2; i++) {
                    if (patterns[i].test(cleanLine)) {
                        if (isValidDomain(cleanLine)) {
                            domains.add(cleanLine);
                        }
                        break;
                    }
                }
                
                // Then try extracting from within the line
                const matches = cleanLine.match(patterns[2]);
                if (matches) {
                    matches.forEach(match => {
                        let domain = match.trim();
                        
                        // Clean up the domain
                        domain = domain.replace(/^https?:\/\//, '');
                        domain = domain.replace(/^www\./, '');
                        domain = domain.replace(/\/$/, '');
                        domain = domain.replace(/[,:;]$/, '');
                        
                        if (isValidDomain(domain)) {
                            domains.add(domain);
                        }
                    });
                }
            }
        }
        
        function isValidDomain(domain) {
            // Basic domain validation
            if (!domain || domain.length < 4 || domain.length > 253) return false;
            
            // Must contain at least one dot
            if (!domain.includes('.')) return false;
            
            // Should not contain numbers at the beginning (like file names)
            if (/^\d/.test(domain)) return false;
            
            // Should not contain consecutive numbers with dots (looks like version numbers)
            if (/\d+\.\d+/.test(domain) && !/[a-zA-Z]/.test(domain)) return false;
            
            // Should not contain the digit 0 in the middle (looks like concatenated)
            if (/[a-zA-Z]0[a-zA-Z]/.test(domain)) return false;
            
            // Check for valid characters (updated to be more strict)
            const domainRegex = /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
            if (!domainRegex.test(domain)) return false;
            
            // Exclude common false positives and file extensions
            const excludePatterns = [
                /^[0-9]+\./, // Starts with numbers
                /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|exe|dll|json|mov|mp4|avi|mkv|xml|csv)$/i, // File extensions
                /^(www|http|https|ftp|smtp|pop3|imap)$/i, // Common protocols
                /(Website|API|By|Name|Tier|Safe|More|Spot|Testing|NodeJS|Excludes|activities|assistance|capabilities|issues|possible|scope|targets|terms|vulnerabilities|Engagement|Nondisclosure|This|Unique|Dashboard|date|services|VerifyIframeDiscovery|Morea|Eligible|Ineligible|Sketch|Targets|Bugcrowd|HackerOne|Web|Mobile|iOS|Android|Other)$/i, // Noise words
                /^Dashboard\./, // Starts with Dashboard
                /^assistance\./, // Starts with assistance
                /^date\./, // Starts with date
                /^services/, // Starts with services
                /^issues/, // Starts with issues
                /\d{4}.*\.json$/, // Year followed by .json
                /0[a-zA-Z]/, // Contains 0 followed by letter (concatenated domains)
                /[a-zA-Z]0[a-zA-Z]/, // Letter-0-letter pattern (concatenated)
            ];
            
            for (const pattern of excludePatterns) {
                if (pattern.test(domain)) return false;
            }
            
            // Must have at least 2 parts after splitting by dot
            const parts = domain.replace(/^\*\./, '').split('.');
            if (parts.length < 2) return false;
            
            // Each part should be valid
            for (const part of parts) {
                if (!part || part.length === 0 || /^-|-$/.test(part)) return false;
                // Parts should not be purely numeric (except for known cases)
                if (/^\d+$/.test(part) && part !== '1') return false;
            }
            
            // TLD should be at least 2 characters and contain only letters
            const tld = parts[parts.length - 1];
            if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
            
            // Domain should have at least one alphabetic character in the main part
            const mainDomain = parts[parts.length - 2];
            if (!/[a-zA-Z]/.test(mainDomain)) return false;
            
            return true;
        }
        
        let filteredDomains = Array.from(domains);
        
        // Filter and process based on action
        if (action === 'wildcards') {
            filteredDomains = filteredDomains.filter(domain => domain.startsWith('*.'));
        } else if (action === 'clean') {
            // Filter for wildcards first, then clean them
            filteredDomains = filteredDomains
                .filter(domain => domain.startsWith('*.'))
                .map(domain => domain.substring(2));
        } else if (action === 'exact') {
            // New action: filter out wildcards
            filteredDomains = filteredDomains.filter(domain => !domain.startsWith('*.'));
        }
        
        // Remove duplicates and sort
        filteredDomains = [...new Set(filteredDomains)].sort();
        
        return { domains: filteredDomains };
    }
});
