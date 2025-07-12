export function loadTexture(gl, program) {
  const img = document.createElement('img');
  img.id = "texture";
  img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAAAVCAMAAAAn8RGpAAAAAXNSR0IArs4c6QAAAA9QTFRFAAAAAAAAOjo6UVFRbW1t/kAd+gAAAAV0Uk5TAP////8c0CZSAAABH0lEQVRIieWXAQ7DIAhFRbn/mVdBLHRaMavZzMhi5/vsi7HVNYQcAKEZ23DEprIPT01hI56qAmfr4j2fp7ijHiMAXaUd8+kJT3JfPUZIEIB6Tl6NFnFnPVoAEvw8LOb39fDCiAAxlQAXNwMs4I56yg/wFA4f+ni5GWABH9TDS4PlhGAjZCMnrwMs4oN6+B6qe0FWEPN6+rgyWsId9RwdmuA1nFwNsIQ76uGHI1KUS4xOHjs+T3FHPSLYOHeDAX8b4GE+rufDCXyf/1xBfzgBQFQacsA2nI7xa0CHy5+/qfyef89nlvN7jo56XFshgkwgfzfpEW7yu/5tH8pW+2rp9sfNN5F51ZQunR2gcOny4afTg/Bm/o1/ywdqU7E0zfwXvmIbea4eByYAAAAASUVORK5CYII=";
  document.body.appendChild(img); // Append the image to the document body
  img.onload = () => {
    const imageTextureElement = document.getElementById("texture");
    if (imageTextureElement) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageTextureElement
      );
      const textureUniformLocation = gl.getUniformLocation(
        program,
        "u_texture",
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(textureUniformLocation, 0); // Tell WebGL to use texture unit 0 for uNoise
    } else {
      console.log("No image texture found, most shaders here do not use them");
      return "";
    }
  }
}


