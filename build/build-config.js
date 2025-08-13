/**
 * Build configuration for the projects project
 */
module.exports = {
    // File paths
    paths: {
        entryPoint: 'js/app.js',
        cssFile: 'styles/main.css',
        htmlTemplate: 'index.html',
        outputDir: 'dist',
        devOutputDir: 'dist-dev'
    },
    
    // esbuild configuration
    esbuild: {
        target: ['es2020'],
        format: 'iife',
        bundle: true,
        sourcemap: true,
        define: {
            'process.env.NODE_ENV': '"development"'
        }
    },
    
    // Production esbuild configuration
    esbuildProd: {
        target: ['es2020'],
        format: 'iife',
        bundle: true,
        minify: true,
        sourcemap: false,
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    },
    
    // Development server configuration
    devServer: {
        port: process.env.PORT || 3000,
        servedir: 'dist-dev'
    },
    
    // HTML template replacements
    htmlReplacements: {
        cssLink: '<link rel="stylesheet" href="styles/main.css">',
        moduleScript: '<script type="module" src="js/app.js"></script>',
        mainElement: '<main></main>',
        filtersElement: '<section></section>'
    }
}; 