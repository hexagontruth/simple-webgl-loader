# Webpack loader for WebGL shaders

A Webpack loader for GLSL ES shaders based on James Armitage's [webgl-loader](https://gitlab.com/jla-/webgl-loader), published under the MIT license. Much of this README is copied verbatim from there.

Allows code reuse via the custom `#include` directive.

## Usage

### In `webpack.config.js`:

```js
...
module: {
    rules: [ {
        test: /\.(fs|vs|frag|vert)/,
        exclude: /node_modules/,
        loader: 'simple-webgl-loader'
    } ]
},
....
```

### In your shader files:

The `#include ...` directive is not scoped &mdash; it simply takes the contents of the file referred to, parses it (allowing for nested includes), and dumps the result at the current line. Do not use quotes around the filename, and as with any preprocessor directive, do not add a semicolon.

If your main function is in `main.fs`, and you have a function in another file called `parallax_uv.fs`, then your shader code would look like this:

#### main.fs:

```
precision highp float;
...
#include parallax_uv.frag

void main()
{
    ...
}
```

#### parallax_uv.fs:

```
vec2 parallax_uv( vec2 uv, vec3 view_dir )
{
    ...
    return mix( cur_uv, prev_uv, weight );
}
```

### In your JavaScript:

```js
import fragSrc from '../shaders/main.fs'
...
const gl = canvas.getContext( 'webgl' )
...
const frag = gl.createShader( gl.FRAGMENT_SHADER )
gl.shaderSource( frag, fragSrc )
gl.compileShader( frag )
if ( !gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ) {
    throw new Error( `Failed to compile frag shader: ${ gl.getShaderInfoLog( frag ) }` )
}
```

## Output

The loader performs some basic optimizations, and returns the shader code as a single string ready for WebGL compilation. The process boils down to:

 - `#include` directive files are merged
 - Unnecessary whitespace is collapsed
 - Comments are removed

For example, the following shader code would be compiled from:

```
#ifdef GL_ES
precision highp float;
#endif

uniform vec3 lightDirection; // from light class
uniform float ambientLight;
uniform sampler2D albedo;
varying vec3 vNormal;
varying vec2 vUv;


void main() {
    vec3 gray = vec3( 0.4, 0.4, 0.4 );
    vec3 tAlbedo = texture2D( albedo, vUv ).rgb;
    float lightness = -clamp( dot( normalize( vNormal ), normalize( lightDirection ) ), -1.0, 0.0 );
    lightness = ambientLight + ( 1.0 - ambientLight ) * lightness;

    gl_FragColor = vec4( tAlbedo * lightness, 1.0 );
}

```

to:

```js
"#ifdef GL_ES\nprecision highp float;\n#endif\nuniform vec3 lightDirection;\nuniform float ambientLight;\nuniform sampler2D albedo;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvoid main(){\nvec3 gray=vec3(0.4,0.4,0.4);\nvec3 tAlbedo=texture2D(albedo,vUv).rgb;\nfloat lightness=-clamp(dot(normalize(vNormal),normalize(lightDirection)),-1.,0.);\nlightness=ambientLight+(1.-ambientLight)*lightness;\ngl_FragColor=vec4(tAlbedo*lightness,1.);\n}"
```
