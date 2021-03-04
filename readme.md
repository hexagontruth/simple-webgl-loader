# WebGL Loader for Webpack

A loader for WebGL files that need to be included in your Webpack project. Allows code splitting via the custom `#include` directive, and does some basic optimisations.

## Usage

In `webpack.config.js` 

```js
...
module: {
    rules: [ {
        test: /\.(frag|vert)/,
        exclude: /node_modules/,
        use: [ {
            loader: 'webgl-loader'
        } ]
    } ]
},
....
```

If your main shader function is in the file `main.frag` and you have a function in another file called `parallax_uv.frag` then your shader code would look like:

main.frag:

```
precision highp float;
...
#include parallax_uv.frag

void main()
{
    ...
}
```

parallax_uv.frag:

```
vec2 parallax_uv( vec2 uv, vec3 view_dir )
{
    ...
    return mix( cur_uv, prev_uv, weight );
}
```

The `#include ...` directive is not scoped at all. It simply takes the contents of the file referred to, parses its contents (allowing for nested includes) and then dumps the result at the current line.

Of course, if you have all your shader code in the one file then you don't need to use `#include`.

Then, in your JavaScript:

```js
import fragSrc from '../shaders/main.frag'

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

The loader performs some basic optimisations, and returns the shader code as a single string reader for compilation. The process boils down to:

 - `#include` directive files are merged
 - Unnecessary whitespace is collapsed
 - Comments are removed
 - Semi-colons are automatically added/removed from line endings where appropriate

For example, the following shader code would be compiled to:

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

```js
"#ifdef GL_ES\nprecision highp float;\n#endif\nuniform vec3 lightDirection;\nuniform float ambientLight;\nuniform sampler2D albedo;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvoid main(){\nvec3 gray=vec3(0.4,0.4,0.4);\nvec3 tAlbedo=texture2D(albedo,vUv).rgb;\nfloat lightness=-clamp(dot(normalize(vNormal),normalize(lightDirection)),-1.0,0.0);\nlightness=ambientLight+(1.0-ambientLight)*lightness;\ngl_FragColor=vec4(tAlbedo*lightness,1.0);\n}"
```