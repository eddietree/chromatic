module.exports = {
    randBetween: function(minVal, maxVal) {
        return minVal + (maxVal - minVal) * Math.random();
    },

    randBetweenInt: function(minVal, maxVal) {
        return Math.floor(minVal + (maxVal - minVal) * Math.random());
    },

    // radius: 1
    randUnitSphere: function(radius = 1) {
        let theta = module.exports.randBetween(0.0, 2.0 * Math.PI);
        let phi = module.exports.randBetween(0.0, Math.PI);

        let vec = module.exports.sphericalCoord(theta, phi, radius);
        return vec;
    },

    sphericalCoord: function(theta, phi, radius = 1) {
        let x = radius * Math.cos(theta) * Math.sin(phi);
        let y = radius * Math.cos(phi);
        let z = radius * Math.sin(theta) * Math.sin(phi);

        return new THREE.Vector3(x, y, z);
    },

    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    wrap: function(val, minVal, maxVal) {
        val -= minVal;

        var delta = maxVal - minVal;
        if (delta < 0.0001) return val;

        return val - (delta * Math.floor(val / delta)) + minVal;
    },

    saturate: function(val) {
        return Math.max(0.0, Math.min(val, 1.0));
    },

    clamp: function(val, minVal, maxVal) {
        return Math.max(minVal, Math.min(val, maxVal));
    },

    pulse: function(center, width, val) {
        val = Math.abs(val - center);
        if (val > width) {
            return 0.0;
        }
        val /= width;

        return 1.0 - val * val * (3.0 - 2.0 * val);
    },

    // http://www.iquilezles.org/www/articles/functions/functions.htm
    impulse: function(k, x) {

        let h = k*x;
        return h*Math.exp(1.0-h);
    },
};