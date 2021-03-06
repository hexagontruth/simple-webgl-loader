const path = require( 'path' ),
    fs = require( 'fs' )

function parse( source, p ) {
    // UNIX line endings
    source = source.replace( /\r/g, '\n' )

    // Collapse whitespace with newlines into one newline
    source = source.replace( /(\s*\n\s*)+/g, '\n' )

    // truncate trailing decimal 0s
    source = source.replace( /\.0+(?![1-9])/g, '.' )

    // Remove spaces around the following operators
    source = source.replace( /\s*=\s*/g, '=' )
    source = source.replace( /\s*<\s*/g, '<' )
    source = source.replace( /\s*>\s*/g, '>' )
    source = source.replace( /\s*<=\s*/g, '<=' )
    source = source.replace( /\s*>=\s*/g, '>=' )
    source = source.replace( /\s*==\s*/g, '==' )
    source = source.replace( /\s*!=\s*/g, '!=' )
    source = source.replace( /\s*\|\|\s*/g, '||' )
    source = source.replace( /\s*\&\&\s*/g, '&&' )
    source = source.replace( /\s*\^\^\s*/g, '^^' )
    source = source.replace( /\s*\?\s*/g, '?' )
    source = source.replace( /\s*\:\s*/g, ':' )
    source = source.replace( /\s*\+=\s*/g, '+=' )
    source = source.replace( /\s*\-=\s*/g, '-=' )
    source = source.replace( /\s*\*=\s*/g, '*=' )
    source = source.replace( /\s*\/=\s*/g, '/=' )
    source = source.replace( /\s*\+\s*/g, '+' )
    source = source.replace( /\s*\-\s*/g, '-' )
    source = source.replace( /\s*\/\s*/g, '/' )
    source = source.replace( /\s*\*\s*/g, '*' )
    source = source.replace( /\s*\(\s*/g, '(' )
    source = source.replace( /\s*\)\s*/g, ')' )
    source = source.replace( /\s*\[\s*/g, '[' )
    source = source.replace( /\s*\]\s*/g, ']' )
    source = source.replace( /\s*!\s*/g, '!' )
    source = source.replace( /\s*\+\+\s*/g, '++' )
    source = source.replace( /\s*\-\-\s*/g, '--' )
    source = source.replace( /\s*,\s*/g, ',' )
    source = source.replace( /\s*;\s*/g, ';\n' )

    // Remove all comments
    source = source.replace( /\/\*[\s\S]*?\*\/|\/\/.*/g, '\n' )

    // Collapse multiple newlines into one newline, and multiple spaces into one space
    source = source.replace( /(\s*\n\s*)+/g, '\n' )
    source = source.replace( /[^\S\n]{2,}/g, ' ' )

    let lines = source.split( /;|\n/ ),
        formatted = []

    lines.forEach( line => {
        line = line.trim()

        // No empty lines
        if ( !line ) {
            return
        }

        // Auto semicolons
        if (
            !line.startsWith( '#' ) &&
            !line.endsWith( '}' ) &&
            !line.endsWith( '{' )
        ) {
            line += ';'
        }

        // Resolve #include directives
        if ( line.startsWith( '#include ' ) ) {
            let fileName = line.substring( 9 ).trim()
            if ( fileName.endsWith( ';' ) ) {
                fileName = fileName.slice( 0,-1 )
            }
            let filePath = path.resolve( path.dirname( p ), fileName ),
                data = fs.readFileSync( filePath, 'utf8' )
            line = parse( data, filePath )
        }

        formatted.push( line )
    } )

    return formatted.join( '\n' )
}

module.exports = function( source ) {
    return 'module.exports=' + JSON.stringify( parse( source, this.resourcePath ) )
}
