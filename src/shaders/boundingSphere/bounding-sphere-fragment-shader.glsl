precision mediump float;

varying vec4 v_color;

void main(void){
  gl_FragColor = v_color;
  gl_FragColor.a = 0.1;
}
