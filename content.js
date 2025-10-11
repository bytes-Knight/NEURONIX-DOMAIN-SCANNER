// Content script for Bug Bounty Domain Extractor - Improved with actual highlighting and tooltips

(function() {
    'use strict';
    
    // Only run on relevant pages
    const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
    const isHackerOne = window.location.hostname.includes('hackerone.com');
    
    if (!isBugcrowd && !isHackerOne) {
        return;
    }
    
    // Inject styles if not already (from manifest)
    const styleId = 'domain-extractor-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes pulse {
                0% { box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); }
                50% { box-shadow: 0 4px 20px rgba(52, 152, 219, 0.6); }
                100% { box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create floating action button - improved with better UX
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'domain-extractor-fab';
        button.innerHTML = '🎯';
        button.title = 'Domain Extractor - Click to open popup and extract domains';
        
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            z-index: 10000;
            transition: all 0.3s ease;
            user-select: none;
        `;
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1) rotate(5deg)';
            button.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1) rotate(0deg)';
            button.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
        });
        
        // Click: open extension popup via chrome.action.openPopup (MV3 compatible)
        button.addEventListener('click', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95) rotate(-5deg)';
            setTimeout(() => {
                button.style.transform = 'scale(1) rotate(0deg)';
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }, 150);
        });
        
        document.body.appendChild(button);
    }
    
    // Improved domain detection with classification
    function detectAndHighlightDomains() {
        const domains = new Set();
        const wildcards = new Set();
        const exacts = new Set();
        
        // Enhanced selectors
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
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(cell => {
                const text = cell.textContent.trim();
                if (text && (text.includes('.') || text.startsWith('*.'))) {
                    if (isValidDomain(text)) {
                        domains.add(text);
                        if (text.startsWith('*.') ) wildcards.add(text);
                        else exacts.add(text);
                        highlightElement(cell, text);
                    }
                }
            });
        });
        
        // Update button with count
        const total = domains.size;
        if (total > 0) {
            const fab = document.getElementById('domain-extractor-fab');
            if (fab) {
                fab.style.animation = 'pulse 2s infinite';
                fab.title = `Found ${total} domains (${wildcards.size} wildcards, ${exacts.size} exact) - Click to extract all`;
                showStatus(`Detected ${total} domains on page`, 'success');
            }
        }
        
        return { total, wildcards: wildcards.size, exact: exacts.size };
    }
    
    // Highlight element and add tooltip
    function highlightElement(element, domain) {
        if (element.classList.contains('domain-extractor-highlight')) return;
        
        element.classList.add('domain-extractor-highlight', 'domain-found');
        
        // Add tooltip
        let tooltip = element.querySelector('.domain-extractor-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'domain-extractor-tooltip';
            tooltip.innerHTML = `<strong>${domain}</strong><br><small>Click popup to extract</small>`;
            element.appendChild(tooltip);
        }
        
        // Show tooltip on hover
        const showTooltip = () => tooltip.classList.add('show');
        const hideTooltip = () => tooltip.classList.remove('show');
        
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    }
    
    // Validation function (shared with popup.js logic)
    function isValidDomain(domain) {
        if (!domain || domain.length < 4 || domain.length > 253) return false;
        if (!domain.includes('.')) return false;
        
        const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
        if (!domainRegex.test(domain)) return false;
        
        const excludePatterns = [
            /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|exe|dll|json|mov|mp4|avi|mkv|xml|csv|htm|html|css|js|php|asp|aspx|jsp|cgi|pl|py|rb|sh)$/i,
            /^(http|https|ftp|smtp|pop3|imap|www|file)$/i,
            /(Dashboard|assistance|date|issues|services|VerifyIframeDiscovery|Morea|Eligible|Ineligible|Sketch|Targets|Bugcrowd|HackerOne|Web|Mobile|iOS|Android|Other)$/i,
            /\d{4,}\.json$/i
        ];
        
        for (const pattern of excludePatterns) {
            if (pattern.test(domain)) return false;
        }
        
        return true;
    }
    
    // Show status message
    function showStatus(message, type = 'success') {
        let status = document.querySelector('.domain-extractor-status');
        if (!status) {
            status = document.createElement('div');
            status.className = `domain-extractor-status ${type}`;
            document.body.appendChild(status);
        }
        status.textContent = message;
        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 3000);
    }
    
    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createFloatingButton();
            setTimeout(detectAndHighlightDomains, 2000);
        });
    } else {
        createFloatingButton();
        setTimeout(detectAndHighlightDomains, 2000);
    }
    
    // Monitor for dynamic content (e.g., lazy-loaded tables)
    const observer = new MutationObserver(() => {
        setTimeout(detectAndHighlightDomains, 1500);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
})();
