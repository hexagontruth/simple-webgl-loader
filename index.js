const path = require( 'path' ),
    fs = require( 'fs' )

function parse( source, p ) {
    source = source.replace( /(\s*\n\s*)+/g, '\n' )
    source = source.replace( /\s*=\s*/g, '=' )
    source = source.replace( /\s*<\s*/g, '<' )
    source = source.replace( /\s*>\s*/g, '>' )
    source = source.replace( /\s*\+\s*/g, '+' )
    source = source.replace( /\s*\-\s*/g, '-' )
    source = source.replace( /\s*\/\s*/g, '/' )
    source = source.replace( /\s*\*\s*/g, '*' )
    source = source.replace( /\s*\(\s*/g, '(' )
    source = source.replace( /\s*\)\s*/g, ')' )
    source = source.replace( /\s*,\s*/g, ',' )
    source = source.replace( /\s*;\s*/g, ';\n' )
    source = source.replace( /\/\*[\s\S]*?\*\/|\/\/.*/g, '\n' ) // comments
    source = source.replace( /(\s*\n\s*)+/g, '\n' )

    let lines = source.split( /;|\n/ ),
        formatted = []
        
    lines.forEach( line => {
        line = line.trim()
        if ( !line ) {
            return
        }

        if (
            !line.startsWith( '#' ) &&
            !line.endsWith( '}' ) &&
            !line.endsWith( '{' )
        ) {
            line += ';'
        }

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
