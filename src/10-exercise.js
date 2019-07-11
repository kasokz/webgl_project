import Vector from './vector.js';
import Matrix from './matrix.js';
import {
    GroupNode,
    SphereNode,
    AABoxNode,
    TextureBoxNode
} from './nodes.js';
import {
    RasterVisitor,
    RasterSetupVisitor
} from './rastervisitor.js';
import Shader from './shader.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser");
    const gl = canvas.getContext("webgl");

    // construct scene graph
    const sg = new GroupNode(Matrix.scaling(new Vector(0.2, 0.2, 0.2)));
    const gn1 = new GroupNode(Matrix.translation(new Vector(1, 1, 0)));
    sg.add(gn1);
    const sphere = new SphereNode(new Vector(.5, -.8, 0, 1), 0.4, new Vector(.8, .4, .1, 1))
    gn1.add(sphere);
    let gn2 = new GroupNode(
        Matrix.rotation(new Vector(1, 0, 0), 20).mul(
            Matrix.translation(new Vector(-.7, -0.4, .1))));
    sg.add(gn2);
    const cube = new TextureBoxNode(
        new Vector(-1, -1, -1, 1),
        new Vector(1, 1, 1, 1),
        "hci-logo.png"
    );
    gn2.add(cube);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    const visitor = new RasterVisitor(gl);
    const camera = {
        eye: new Vector(-.5, .5, -1, 1),
        center: new Vector(0, 0, 0, 1),
        up: new Vector(0, 1, 0, 0),
        fovy: 60,
        aspect: canvas.width / canvas.height,
        near: 0.1,
        far: 100
    };
    const shader = new Shader(gl,
        "perspective-vertex-shader.glsl",
        "perspective-phong-fragment-shader.glsl"
    );
    visitor.shader = shader;
    const textureShader = new Shader(gl,
        "texture-vertex-shader.glsl",
        "texture-fragment-shader.glsl");
    visitor.textureshader = textureShader;

    function animate(timestamp) {
        camera.eye = new Vector(
            Math.cos(timestamp / 1000),
            0,
            Math.sin(timestamp / 1000),
            1
        );
        visitor.render(sg, camera);
        window.requestAnimationFrame(animate);
    }

    Promise.all([shader.load(), textureShader.load()]).then(
        x => window.requestAnimationFrame(animate));
});