var textures = {};

function genRainbowTex() {

    var texWidth = 8;
    var texHeight = 1;
    var saturation = 0.6;
    var brightness = 0.7;

    //var dataMap = new Float32Array(texWidth * texHeight * 3);
    var dataMap = new Uint8Array(texWidth * texHeight * 4);

    var color = new THREE.Color();

    for (let iWidth = 0; iWidth < texWidth; iWidth += 1) {
        for (let iHeight = 0; iHeight < texHeight; iHeight += 1) {
            var offset = (iWidth + iHeight * texWidth) * 4;
            //var saturation = iHeight / (texHeight-1.0);

            color.setHSL(iWidth / (texWidth - 1.0), saturation, brightness);
            let colorHex = color.getHex();
            colorHex = colorHex << 8;

            dataMap[offset + 0] = (0xff000000 & colorHex) >> 24;
            dataMap[offset + 1] = (0x00ff0000 & colorHex) >> 16;
            dataMap[offset + 2] = (0x0000ff00 & colorHex) >> 8;
            dataMap[offset + 3] = 0xff;
        }
    }

    var texture = new THREE.DataTexture(
        dataMap,
        texWidth,
        texHeight,
        THREE.RGBAFormat,
        THREE.UnsignedByteType);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return texture;
}

function genWhiteTex() {

    var texWidth = 1;
    var texHeight = 1;
    var dataMap = new Uint8Array(texWidth * texHeight * 4);

    for (let iWidth = 0; iWidth < texWidth; iWidth += 1) {
        for (let iHeight = 0; iHeight < texHeight; iHeight += 1) {
            var offset = (iWidth + iHeight * texWidth) * 4;

            dataMap[offset + 0] = 0xff;
            dataMap[offset + 1] = 0xff;
            dataMap[offset + 2] = 0xff;
            dataMap[offset + 3] = 0xff;
        }
    }

    var texture = new THREE.DataTexture(
        dataMap,
        texWidth,
        texHeight,
        THREE.RGBAFormat,
        THREE.UnsignedByteType);

    texture.needsUpdate = true;

    return texture;
}

function genBlackTex() {

    var texWidth = 1;
    var texHeight = 1;
    var dataMap = new Uint8Array(texWidth * texHeight * 4);

    for (let iWidth = 0; iWidth < texWidth; iWidth += 1) {
        for (let iHeight = 0; iHeight < texHeight; iHeight += 1) {
            var offset = (iWidth + iHeight * texWidth) * 4;

            dataMap[offset + 0] = 0x00;
            dataMap[offset + 1] = 0x00;
            dataMap[offset + 2] = 0x00;
            dataMap[offset + 3] = 0xff;
        }
    }

    var texture = new THREE.DataTexture(
        dataMap,
        texWidth,
        texHeight,
        THREE.RGBAFormat,
        THREE.UnsignedByteType);


    texture.needsUpdate = true;

    return texture;
}

module.exports = {

    init: function() {
        textures['rainbow'] = genRainbowTex();
        textures['white'] = genWhiteTex();
        textures['black'] = genBlackTex();

        // debug texture
        if (false) {

            var scene = require('./Scene/Scene.js');
            var material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                shading: THREE.SmoothShading,
                map: textures['rainbow']
            });

            let planeWidth = 3;
            var geometry = new THREE.PlaneGeometry(planeWidth, planeWidth);
            var mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = -1.0;
            mesh.position.z = -planeWidth;
            scene.obj.add(mesh);
        }

    },

    get: function(name) {
        return textures[name];
    }
};