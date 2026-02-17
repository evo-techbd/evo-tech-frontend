'use client';

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML safe to render
 */
export function sanitizeHtml(content: string): string {
    if (typeof window === 'undefined') {
        // Server-side, return as is (should be handled differently if needed)
        return content;
    }

    // Client-side
    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['br', 'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'table', 'tr', 'td', 'th', 'thead', 'tbody', 'ul', 'ol', 'li',
            'a', 'hr', 'strong', 'em', 'b', 'i', 'img'],
        ALLOWED_ATTR: ['href', 'style', 'class'],
        FORBID_CONTENTS: ['script', 'style', 'iframe', 'form', 'input'],
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM: false
    });
};

/**
 * Sanitizes plain text to prevent XSS attacks when used in attributes or HTML
 * 
 * @param text - The text to sanitize
 * @returns Sanitized text safe to use in HTML attributes or content
 */
export function sanitizeText(text: string | null | undefined): string {
    if (!text) return '';

    return String(text)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
