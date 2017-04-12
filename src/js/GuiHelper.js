var settings = require('./Settings.js');

module.exports = {

    createGuiParamObj:function(folderTitle) {

        var app = require('./App.js');

        return {
            base: {},
            gui: {},
            folder: app.addGuiFolder(folderTitle),
        };
    },

    addGuiButton: function(guiParams, guiTitle, func) {
        if (!settings.showGui) {
            return;
        }
        
        guiParams.gui[guiTitle] = func;
        guiParams.folder.add(guiParams.gui, guiTitle);
    },

    addGuiFloat: function(guiParams, guiTitle, obj, objKey, minVal = 0.0, maxVal = 1.0) {

        if (!settings.showGui) {
            return;
        }

        Object.defineProperty(guiParams.gui, guiTitle, {
            get: function() {
                return obj[objKey];
            },
            set: function(val) {
                obj[objKey] = val;
            },
        });

        guiParams.base[guiTitle] = guiParams.gui[guiTitle];

        let guiElem = guiParams.folder.add(guiParams.gui, guiTitle, minVal, maxVal);
        guiElem.listen();

        // remove signal if change manually
        guiElem.onChange((value)=>{
            let signal = require("./Scene/Signal.js");
            signal.removeFromMap(obj, objKey);
        });

        return guiElem;
    },

    addGuiColor: function(guiParams, guiTitle, obj, objKey) {

        if (!settings.showGui) {
            return;
        }

        let startColorVec4 = obj[objKey];
        let color = [startColorVec4.x * 255, startColorVec4.y*255, startColorVec4.z*255, startColorVec4.w];
        let colorNormFactor = 1.0 / 255.0;

        Object.defineProperty(guiParams.gui, guiTitle, {
            get: function() {
                return color;
            },
            set: function(val) {
                color = val;
                obj[objKey] = new THREE.Vector4(color[0] * colorNormFactor, color[1] * colorNormFactor, color[2]* colorNormFactor, color[3] );
            },
        });

        guiParams.base[guiTitle] = guiParams.gui[guiTitle];

        let guiElem = guiParams.folder.addColor(guiParams.gui, guiTitle);
        guiElem.listen();

        return guiElem;
    },

    addGuiBool: function(guiParams, guiTitle, obj, objKey) {

        if (!settings.showGui) {
            return;
        }

        Object.defineProperty(guiParams.gui, guiTitle, {
            get: function() {
                return obj[objKey];
            },
            set: function(val) {
                obj[objKey] = val;
            },
        });

        guiParams.base[guiTitle] = guiParams.gui[guiTitle];

        let guiElem = guiParams.folder.add(guiParams.gui, guiTitle);
        guiElem.listen();

        return guiElem;
    },

    addGuiDropDown: function(guiParams, guiTitle, obj, objKey, options) {

        if (!settings.showGui) {
            return;
        }

        Object.defineProperty(guiParams.gui, guiTitle, {
            get: function() {
                return obj[objKey];
            },
            set: function(val) {
                obj[objKey] = val;
            },
        });

        guiParams.base[guiTitle] = guiParams.gui[guiTitle];
        
        let guiElem = guiParams.folder.add(guiParams.gui, guiTitle, options);
        guiElem.listen();

        return guiElem;
    },

    addResetButton: function(guiParams) {
        if (!settings.showGui) {
            return;
        }

        let resetLabel = "Reset";

        guiParams[resetLabel] = function() {
            for (var key in guiParams.base) {
                if (guiParams.base.hasOwnProperty(key)) {
                    guiParams.gui[key] = guiParams.base[key];
                }
            }
        }

        let guiFolder = guiParams.folder;
        guiFolder.add(guiParams, resetLabel);
    },
};