const fs = require('fs');
const path = require('path');

module.exports = function(source) {
  const parse = (source, resourcePath) => {
    // Use UNIX line endings
    source = source.replace(/\r\n?/g, '\n');
  
    // Remove all comments
    source = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '\n');
  
    // Remove spaces around the following operators
    source = source.replace(/\s*=\s*/g, '=');
    source = source.replace(/\s*<\s*/g, '<');
    source = source.replace(/\s*>\s*/g, '>');
    source = source.replace(/\s*<=\s*/g, '<=');
    source = source.replace(/\s*>=\s*/g, '>=');
    source = source.replace(/\s*==\s*/g, '==');
    source = source.replace(/\s*!=\s*/g, '!=');
    source = source.replace(/\s*\|\|\s*/g, '||');
    source = source.replace(/\s*\&\&\s*/g, '&&');
    source = source.replace(/\s*\^\^\s*/g, '^^');
    source = source.replace(/\s*\?\s*/g, '?');
    source = source.replace(/\s*\:\s*/g, ':');
    source = source.replace(/\s*\+=\s*/g, '+=');
    source = source.replace(/\s*\-=\s*/g, '-=');
    source = source.replace(/\s*\*=\s*/g, '*=');
    source = source.replace(/\s*\/=\s*/g, '/=');
    source = source.replace(/\s*\+\s*/g, '+');
    source = source.replace(/\s*\-\s*/g, '-');
    source = source.replace(/\s*\/\s*/g, '/');
    source = source.replace(/\s*\*\s*/g, '*');
    source = source.replace(/\s*\(\s*/g, '(');
    source = source.replace(/\s*\)\s*/g, ')');
    source = source.replace(/\s*\[\s*/g, '[');
    source = source.replace(/\s*\]\s*/g, ']');
    source = source.replace(/\s*!\s*/g, '!');
    source = source.replace(/\s*\+\+\s*/g, '++');
    source = source.replace(/\s*\-\-\s*/g, '--');
    source = source.replace(/\s*,\s*/g, ',');
  
    // Collapse multiple whitespace characters into one space
    source = source.replace(/[^\S\n]{2,}/g, ' ');
  
    const lines = source.split(/\n+/);
    let formatted = [];
  
    lines.forEach((line) => {
      line = line.trim();
  
      // No empty lines
      if (!line) {
        return;
      }
  
      // Resolve #include directives
      if (line.startsWith('#include ')) {
        const fileName = line.substring(9).trim();
        const filePath = path.resolve(path.dirname(resourcePath), fileName);
        const data = fs.readFileSync(filePath, 'utf8');
        line = parse(data, filePath);
        this.addDependency(filePath);
      }
  
      formatted.push(line);
    });
  
    return formatted.join('\n');
  };

  return `module.exports= ${JSON.stringify(parse(source, this.resourcePath))}`;
}
