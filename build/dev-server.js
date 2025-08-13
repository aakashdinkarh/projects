#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
const { processCSS, processHTML, printDevServerInfo } = require('./build-utils');
const config = require('./build-config');

async function startDevServer() {
    const port = config.devServer.port;
    const outputDir = path.join(__dirname, '..', config.paths.devOutputDir);
    const shouldMinifyCSS = process.argv.includes('--minify-css');
    
    console.log('🚀 Starting development server with Hot Module Reload...');
    console.log(`🌐 Server will be available at: http://localhost:${port}`);
    if (shouldMinifyCSS) {
        console.log('🔧 CSS minification enabled');
    }
    
    try {
        // Clean and create output directory
        await fs.remove(outputDir);
        await fs.ensureDir(outputDir);
        
        // Process CSS
        const cssPath = path.join(__dirname, '..', config.paths.cssFile);
        const cssContent = await processCSS(cssPath, shouldMinifyCSS);
        
        // Process HTML
        const htmlPath = path.join(__dirname, '..', config.paths.htmlTemplate);
        const htmlContent = await processHTML(htmlPath, cssContent, '/bundle.js');
        
        // Write the HTML file
        const outputHtmlPath = path.join(outputDir, 'index.html');
        await fs.writeFile(outputHtmlPath, htmlContent);
        
        // Start esbuild dev server
        console.log('📦 Starting esbuild dev server...');
        
        const ctx = await esbuild.context({
            entryPoints: [path.join(__dirname, '..', config.paths.entryPoint)],
            outfile: path.join(outputDir, 'bundle.js'),
            ...config.esbuild
        });
        
        // Start the dev server
        await ctx.serve({
            servedir: path.join(__dirname, '..', config.devServer.servedir),
            port: port
        });
        
        // Print dev server info
        printDevServerInfo(port, shouldMinifyCSS);
        
        // Watch for file changes
        await ctx.watch();
        
    } catch (error) {
        console.error('❌ Failed to start development server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    process.exit(0);
});

startDevServer(); 