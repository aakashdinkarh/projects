#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const config = require('./build-config');
// Polyfill for Node.js environment
require('../js/polyfill');
const { renderFilteredData } = require('../js/ui');
const { renderFilterTags } = require('../js/filters');

/**
 * Simple CSS minifier function
 * @param {string} css - CSS content to minify
 * @returns {string} Minified CSS
 */
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around braces
        .replace(/\s*}\s*/g, '}') // Remove spaces around braces
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
        .trim(); // Remove leading/trailing whitespace
}

/**
 * Process CSS file and optionally minify it
 * @param {string} cssPath - Path to CSS file
 * @param {boolean} shouldMinify - Whether to minify the CSS
 * @returns {Promise<string>} Processed CSS content
 */
async function processCSS(cssPath, shouldMinify = false) {
    console.log('🎨 Processing CSS...');
    let cssContent = await fs.readFile(cssPath, 'utf8');
    
    if (shouldMinify) {
        console.log('🔧 Minifying CSS...');
        cssContent = minifyCSS(cssContent);
    }
    
    return cssContent;
}

/**
 * Process HTML template and inline CSS
 * @param {string} htmlPath - Path to HTML template
 * @param {string} cssContent - CSS content to inline
 * @param {string} scriptSrc - Script source to use
 * @returns {Promise<string>} Processed HTML content
 */
async function processHTML(htmlPath, cssContent, scriptSrc) {
    console.log('📄 Processing HTML template...');
    let htmlContent = await fs.readFile(htmlPath, 'utf8');
    
    // Inline CSS
    htmlContent = htmlContent.replace(
        config.htmlReplacements.cssLink,
        `<style>${cssContent}</style>`
    );

    // Replace the filters element with initial HTML for the page
    const filtersElement = await renderFilterTags();
    htmlContent = htmlContent.replace(
        config.htmlReplacements.filtersElement,
        filtersElement.toString()
    );

    // Replace the main element with initial HTML for the page
    const mainElement = await renderFilteredData();
    htmlContent = htmlContent.replace(
        config.htmlReplacements.mainElement,
        mainElement.toString()
    );
    
    // Replace module script with bundled script
    htmlContent = htmlContent.replace(
        config.htmlReplacements.moduleScript,
        `<script src="${scriptSrc}"></script>`
    );
    
    return htmlContent;
}

/**
 * Get file size statistics
 * @param {string} filePath - Path to file
 * @returns {Object} File stats with size in KB
 */
function getFileStats(filePath) {
    const stats = fs.statSync(filePath);
    return {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
    };
}

/**
 * Print build summary
 * @param {Object} options - Build options
 * @param {string} options.outputDir - Output directory
 * @param {string} options.htmlPath - HTML file path
 * @param {string} options.bundlePath - Bundle file path
 * @param {boolean} options.isProduction - Whether this is a production build
 * @param {boolean} options.cssMinified - Whether CSS was minified
 */
function printBuildSummary({ outputDir, htmlPath, bundlePath, isProduction, cssMinified }) {
    const bundleStats = getFileStats(bundlePath);
    const htmlStats = getFileStats(htmlPath);
    const totalSize = bundleStats.size + htmlStats.size;
    
    console.log('✅ Build completed successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📄 HTML file: ${htmlPath}`);
    console.log(`📦 Bundle size: ${bundleStats.sizeKB} KB`);
    console.log(`📄 HTML size: ${htmlStats.sizeKB} KB`);
    console.log(`📊 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    console.log('');
    console.log('📋 Build Summary:');
    console.log('   ✅ JavaScript modules bundled into bundle.js');
    console.log('   ✅ CSS inlined into HTML');
    if (isProduction || cssMinified) {
        console.log('   ✅ JavaScript and CSS minified');
    }
    console.log('   ✅ Single HTML file created');
    console.log('   ✅ Ready for deployment to any static hosting service');
}

/**
 * Print development server info
 * @param {number} port - Server port
 * @param {boolean} cssMinified - Whether CSS is minified
 */
function printDevServerInfo(port, cssMinified = false) {
    console.log('✅ Development server started successfully!');
    console.log('');
    console.log('📋 Development Features:');
    console.log('   🔄 Hot Module Reload (HMR) enabled');
    console.log('   📍 Source maps for debugging');
    console.log('   ⚡ Fast rebuilds on file changes');
    console.log(`   🌐 Live server at http://localhost:${port}`);
    if (cssMinified) {
        console.log('   🔧 CSS minified');
    }
    console.log('');
    console.log('💡 Edit your files and see changes instantly!');
    console.log('🛑 Press Ctrl+C to stop the server');
}

module.exports = {
    minifyCSS,
    processCSS,
    processHTML,
    getFileStats,
    printBuildSummary,
    printDevServerInfo
}; 