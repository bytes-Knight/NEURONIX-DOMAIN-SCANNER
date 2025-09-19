// Content script for Bug Bounty Domain Extractor
// This script runs on Bugcrowd and HackerOne pages

(function() {
    'use strict';
    
    // Only run on relevant pages
    const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
    const isHackerOne = window.location.hostname.includes('hackerone.com');
    
    if (!isBugcrowd && !isHackerOne) {
        return;
    }
    
    // Create floating action button
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'domain-extractor-fab';
        button.innerHTML = '🎯';
        button.title = 'Domain Extractor - Click to open extension popup';
        
        // Position the button
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
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
        });
        
        // Click handler
        button.addEventListener('click', () => {
            // The popup will handle the actual extraction
            // This is just a visual indicator
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
        
        document.body.appendChild(button);
    }
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
        createFloatingButton();
    }
    
    // Enhanced domain detection for content script
    function detectDomains() {
        const domains = new Set();
        
        if (isBugcrowd) {
            // Enhanced Bugcrowd selectors
            const selectors = [
                '[data-testid="target-groups"] [data-testid="in-scope-table"] td:first-child',
                '.target-group .scope-table td:first-child',
                '.bc-panel .bc-table .bc-table__row td:first-child',
                '.target-table tbody tr td:first-child',
                '.in-scope-table tbody tr td:first-child'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(cell => {
                    const text = cell.textContent.trim();
                    if (text && (text.includes('.') || text.startsWith('*.'))) {
                        domains.add(text);
                    }
                });
            });
            
        } else if (isHackerOne) {
            // Enhanced HackerOne selectors
            const selectors = [
                '[data-testid="policy-scopes"] tbody tr td:first-child',
                '.policy-scopes tbody tr td:first-child',
                '.structured-scope-list tbody tr td:first-child',
                '.scope-list tbody tr td:first-child',
                '.spec-scope-table tbody tr td:first-child'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(cell => {
                    const text = cell.textContent.trim();
                    if (text && (text.includes('.') || text.startsWith('*.'))) {
                        domains.add(text);
                    }
                });
            });
        }
        
        return Array.from(domains);
    }
    
    // Add visual indication when domains are found
    function highlightDomains() {
        const domains = detectDomains();
        if (domains.length > 0) {
            const fab = document.getElementById('domain-extractor-fab');
            if (fab) {
                fab.style.animation = 'pulse 2s infinite';
                fab.title = `Found ${domains.length} domains - Click extension icon to extract`;
            }
        }
    }
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); }
            50% { box-shadow: 0 4px 20px rgba(52, 152, 219, 0.6); }
            100% { box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3); }
        }
    `;
    document.head.appendChild(style);
    
    // Monitor for dynamic content changes
    const observer = new MutationObserver(() => {
        setTimeout(highlightDomains, 1000);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Initial highlight
    setTimeout(highlightDomains, 2000);
})();