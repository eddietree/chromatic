//var Tone = require("tone");
var animitter = require('animitter');
var StartAudioContext = require("startaudiocontext");
var signal = require("./Signal.js");
var background = require("./Background.js");
var mathext = require("../MathExt.js");
var guihelper = require("../GuiHelper.js");
var settings = require('./../Settings.js');
var TWEEN = require("tween.js");

var synths = {};

//Tone.Transport.lookAhead = 1;

//var audioCtx = new AudioContext();
//var buffer = audioCtx.createBuffer(2, 22050, 22000);
//Tone.setContext(audioCtx);
//Tone.Transport._clock.lookAhead = 0.5;
//console.log(Tone.context);

StartAudioContext(Tone.context,"#enter360");
StartAudioContext(Tone.context,"#toggleVR");


function connectEffectsChain(chain) {
    for (let i = 0; i < chain.length - 1; i += 1) {
        chain[i].connect(chain[i + 1]);
    }

    chain[chain.length - 1].connect(Tone.Master);
}

function addMuteButton(guiParams, synth) {
    guihelper.addGuiButton(guiParams, "Mute", () => {
        synth.volume.value = -100.0;
    });
}

function addGuiLoop(guiParams, effect) {
    //guihelper.addGuiFloat(guiParams, "Arp - Progress", effect, "progress", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Arp - Humanize", effect, "humanize", 0.0, 0.2);
    guihelper.addGuiFloat(guiParams, "Arp - Probability", effect, "probability", 0.0, 1.0);
}

function addGuiFeedbackDelay(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Delay - Time", effect.delayTime, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Delay - Feedback", effect.feedback, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Delay - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiDistortion(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Distort - Amount", effect, "distortion", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Distort - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiPingPongDelay(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Delay - Time", effect.delayTime, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Delay - Feedback", effect.feedback, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Delay - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiChorus(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Chorus - Freq", effect.frequency, "value", 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Chorus - Delay", effect, "delayTime", 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Chorus - Depth", effect, "depth", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Chorus - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiReverb(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Reverb - Room", effect.roomSize, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Reverb - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiAutoPanner(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Panner - Depth", effect.depth, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Panner - Freq", effect.frequency, "value", 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Panner - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiTremolo(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "Tremolo - Depth", effect.depth, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Tremolo - Freq", effect.frequency, "value", 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Tremolo - Wet", effect.wet, "value", 0.0, 1.0);
}

function addGuiFilter(guiParams, effect) {
    guihelper.addGuiDropDown(guiParams, "Filter - Type", effect, "type", ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"]);
    guihelper.addGuiFloat(guiParams, "Filter - Q", effect.Q, "value", 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Filter - Freq", effect.frequency, "value", 1.0, 5000.0);
    guihelper.addGuiFloat(guiParams, "Filter - Gain", effect.gain, "value", 0.0, 20.0);
}

function addGuiEq(guiParams, effect) {
    guihelper.addGuiFloat(guiParams, "EQ - Low", effect.low, "value", -50.0, 50.0);
    guihelper.addGuiFloat(guiParams, "EQ - Mid", effect.mid, "value", -50.0, 50.0);
    guihelper.addGuiFloat(guiParams, "EQ - High", effect.high, "value", -50.0, 50.0);
}

let baseVolume = -30.0;

function initSynths() {
    var app = require('./../App.js');

    var synthPadIndex = 0;

    function createSynthParams(chain) {

        let lastSignalChain = chain[chain.length - 1];

        return {
            enabled: true,

            stop: function() {

                if (this.enabled !== false) {
                    this.enabled = false;
                    lastSignalChain.disconnect(Tone.Master);
                }
            },

            start: function() {

                if (this.enabled !== true) {
                    this.enabled = true;
                    lastSignalChain.connect(Tone.Master);
                }
            },
        }
    }

    function createSynthPad() {

        let synth = new Tone.DuoSynth();
        synth.set({
            "volume": baseVolume + 3.0,
            //"portamento": 0.02,
            "harmonicity": 1.5,
            "vibratoAmount": 0.2,
            "vibratoRate": "4n",

            "voice0": {
                "oscillator": {
                    "type": "sawtooth6"
                },
                "envelope": {
                    "attack": 1,
                    "decay": 1,
                    "sustain": 0.8,
                    "release": 0.1
                },
            },
            "voice1": {
                "oscillator": {
                    "type": "sine"
                },
                "envelope": {
                    "attack": 1,
                    "decay": 1,
                    "sustain": 0.8,
                    "release": 0.1
                },
            }
        });

        //var chorus = new Tone.Chorus("3n", 1.0, 0.75);
        var feedbackDelay = new Tone.FeedbackDelay("8n", 0.5);
        //var filter = new Tone.Filter(1000, "lowpass");
        //var eq = new Tone.EQ3(-30.0,-10.0,0.0);

        var chain = [
            synth,
            //eq
            //chorus,
            feedbackDelay,
            //filter,
        ];

        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        var timeDelay = mathext.randBetween(5, 7);

        let notes = ["C2", "E2", "C3", "E3", "G3", "C4", "E4", "G4"];
        let loop = new Tone.Loop(function(time) {
            if (!synthParams.enabled) {
                return;
            }

            let note = notes[mathext.randBetweenInt(0, notes.length)];
            synth.triggerAttackRelease(note, timeDelay, time);
        }, timeDelay);
        loop.start(settings.audioStartNote);

        //synth.triggerAttackRelease("C4", 0.0, 0.0);
        //synth.triggerAttackRelease("E4", 0.0, 0.0)

        let loopRingPulse = animitter(function(deltaTime, elapsedTime, frameCount) {

            if (!synthParams.enabled) {
                return;
            }

            let minVal = 0.03;
            let maxVal = 0.21;

            let centerVal = (minVal + maxVal) * 0.5;
            let width = (maxVal - minVal) * 0.5;

            var ringPulse = signal.get('ringPulse');
            let touchPulsate = signal.get("hit_touchStart") * 5.0;

            var pulseVal = mathext.pulse(centerVal, width, ringPulse);
            synth.voice0.detune.value = mathext.lerp(0.0, -15.0, pulseVal + touchPulsate);
            synth.voice1.detune.value = mathext.lerp(0.0, 25.0, pulseVal + touchPulsate);
        });
        loopRingPulse.start(settings.audioStartNotet);

        synthPadIndex += 1;

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Pad " + synthPadIndex);

            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            guihelper.addGuiFloat(guiParams, "Synth - Freq", synth.frequency, "value", 0.0, 1000.0);
            guihelper.addGuiFloat(guiParams, "Synth - Harmonic", synth.harmonicity, "value", 0.0, 3.0);
            guihelper.addGuiFloat(guiParams, "Synth - Vibrato", synth.vibratoAmount, "value", 0.0, 10.0);
            guihelper.addGuiFloat(guiParams, "Synth - VibRate", synth.vibratoRate, "value", 0.0, 10.0);
            guihelper.addGuiFloat(guiParams, "Voice 0 - Detune", synth.voice0.detune, "value", -100.0, 100.0);
            //guihelper.addGuiFloat(guiParams, "Voice 0 - Filter Q", synth.voice0.filter.Q, "value", -100.0, 100.0);
            //guihelper.addGuiFloat(guiParams, "Voice 0 - Filter Freq", synth.voice0.filter.frequency, "value", -1000.0, 1000.0);
            //guihelper.addGuiFloat(guiParams, "Voice 0 - Gain", synth.voice0.filter.gain, "value", -1000.0, 1000.0);
            guihelper.addGuiFloat(guiParams, "Voice 1 - Detune", synth.voice1.detune, "value", -100.0, 100.0);
            //addGuiChorus(guiParams, chorus);
            //addGuiFeedbackDelay(guiParams, feedbackDelay);
            //addGuiFilter(guiParams, filter);
            //addGuiEq(guiParams, eq);
        }

        //signal.map('soothingLight', filter.frequency, 'value', 1500.0, 250.0);
        //signal.map('eyeDepth', feedbackDelay.feedback, 'value', 0.7, 0.5);
        //signal.map('eyeDepth', chorus.frequency, 'value', 3.0, 1.5);

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    function createSynthArp() {

        let synth = new Tone.FMSynth();
        synth.set({
            "volume": baseVolume + 3.0,
            //"portamento": 0.02,
            "harmonicity": 1.5,
            "oscillator": {
                "type": "square4"
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.01,
                "sustain": 0.5,
                "release": 0.5,
            }
        });

        var chorus = new Tone.Chorus("4n", 1.0, 1.0);
        var feedbackDelay = new Tone.FeedbackDelay("4n", 0.7);
        var panner = new Tone.AutoPanner({
            "frequency": "1m",
            "depth": 0.5
        }).start();
        //var tremolo = new Tone.Tremolo("2n", 0.5).start();

        var chain = [
            synth,
            chorus,
            feedbackDelay,
            panner,
            //tremolo,
        ];
        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        var timeDelay = "8n";

        let notes = ["C3", "E3", "G3", "C4", "E4", "G4", "B4", "C5"];
        let loop = new Tone.Loop(function(time) {

            if (!synthParams.enabled) {
                return;
            }

            let note = notes[mathext.randBetweenInt(0, notes.length)];

            synth.triggerAttackRelease(note, timeDelay, time);

        }, timeDelay).start(settings.audioStartNote);

        loop.humanize = 0.05;
        loop.probability = 0.3;

        let loopHarmonic = new Tone.Loop(function(time) {
            synth.harmonicity.value = mathext.randBetweenInt(1, 6) * 0.5;
        }, "2m").start(settings.audioStartNote);

        //console.log(synth);

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Arpeggio");

            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            addGuiLoop(guiParams, loop);
            guihelper.addGuiFloat(guiParams, "Synth - Freq", synth.frequency, "value", 0.0, 1000.0);
            guihelper.addGuiFloat(guiParams, "Synth - Harmonic", synth.harmonicity, "value", 0.0, 3.0).step(0.5);
            guihelper.addGuiFloat(guiParams, "Synth - Slide", synth, "portamento", 0.0, 0.2);
            guihelper.addGuiFloat(guiParams, "Synth - Detune", synth.detune, "value", -100.0, 100.0);
            addGuiChorus(guiParams, chorus);
            addGuiFeedbackDelay(guiParams, feedbackDelay);
            addGuiAutoPanner(guiParams, panner);
            //addGuiTremolo(guiParams, tremolo);
        }

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    function createSynthLead() {

        var synth = new Tone.Synth({
            "volume": baseVolume,
            "portamento": 0.15,
            "oscillator": {
                "type": "amsine"
            },
            "envelope": {
                "attack": 1.0,
                "decay": 0.1,
                "sustain": 0.4,
                "release": 5.0,
            },

            "detune": 0.05,
        });

        //var chorus = new Tone.Chorus(1.0, 1.0, 0.5);
        //var pingPong = new Tone.PingPongDelay("8n", 0.6);
        //var panner = new Tone.AutoPanner("1m").start();
        //var tremolo = new Tone.Tremolo("2m", 0.5).start();

        //var eq = new Tone.EQ3(0.0,-10.0,-30.0);

        var chain = [
            synth,
            //eq
            //chorus,
            /*pingPong,
            panner,
            tremolo*/
        ];

        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        var timeDelay = "1n";
        let notes = ["C4", "D4", "E4", "F4", "G4", "C5", "D4", "E5", "F5"];
        //let notes = ["C4", "D4", "E4", "F4", "G4", "C5", "D4", "E5", "F5", "G5", "B5", "C6"];
        //let notes = ["C4", "E4", "G4", "B4", "C5", "E5", "G5", "B5", "C6"];

        let loop = new Tone.Loop(function(time) {

            if (!synthParams.enabled) {
                return;
            }

            let note = notes[mathext.randBetweenInt(0, notes.length)];
            synth.triggerAttackRelease(note, timeDelay, time);

        }, timeDelay);

        loop.start(settings.audioStartNote);
        loop.humanize = 0.1;
        loop.probability = 0.5;

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Lead");
            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            addGuiLoop(guiParams, loop);
            guihelper.addGuiFloat(guiParams, "Synth - Freq", synth.frequency, "value", 0.0, 1000.0);
            guihelper.addGuiFloat(guiParams, "Synth - Slide", synth, "portamento", 0.0, 0.2);
            guihelper.addGuiFloat(guiParams, "Synth - Detune", synth.detune, "value", -100.0, 100.0);
            //addGuiEq(guiParams, eq);
            //addGuiChorus(guiParams, chorus);
            //addGuiPingPongDelay(guiParams, pingPong);
            //addGuiAutoPanner(guiParams, panner);
            //addGuiTremolo(guiParams, tremolo);
        }

        // signal
        //signal.map('eyeDepth', tremolo.frequency, 'value', 20.0, 0.25);
        //signal.map('eyeDepth', tremolo.depth, 'value', 1.0, 0.5);
        signal.map('eyeDepth', synth.detune, 'value', -20.0, 0);

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    function createSynthPiano() {

        let synth = new Tone.Synth();
        synth.set({
            "oscillator": {
                "detune": 0,
                "type": "custom",
                "partials": [2, 1, 2, 2],
                "phase": 0,
                "volume": 0
            },
            "envelope": {
                "attack": 0.005,
                "decay": 0.3,
                "sustain": 0.2,
                "release": 1,
            },
            "portamento": 0.01,
            "volume": baseVolume - 17.0
        });

        var feedbackDelay = new Tone.FeedbackDelay("4n", 0.8);
        //var eq = new Tone.EQ3(0.0,0.0,0.0);
        /*var panner = new Tone.AutoPanner({
            "frequency": "1m",
            "depth": 0.5
        }).start();*/

        var chain = [
            synth,
            feedbackDelay,
            //eq
            //panner,   
        ];

        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        /*var meter = new Tone.Meter();
        meter.smoothing = 0.8;
        feedbackDelay.connect(meter);*/

        /*let meterLoop = animitter(function(deltaTime, elapsedTime, frameCount) {
            signal.set('meter_piano', Math.pow(mathext.clamp(meter.value * 20.0, 0.0, 1.0), 2.0));
        });
        meterLoop.start();
        */

        var timeDelay = "8n";
        let notes = ["C4", "E4", "G4", "B4", "C5", "E5", "G5", "B5", "C6"];

        let loop = new Tone.Loop(function(time) {

            if (!synthParams.enabled) {
                return;
            }

            //signal.pulsate('hit_piano');
            let note = notes[mathext.randBetweenInt(0, notes.length)];
            synth.triggerAttackRelease(note, timeDelay, time);

        }, timeDelay).start(settings.audioStartNote);

        loop.humanize = 0.05;
        loop.probability = 0.25;

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Piano");

            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            addGuiLoop(guiParams, loop);
            //guihelper.addGuiFloat(guiParams, "Synth - Freq", synth.frequency, "value", 0.0, 1000.0);
            //guihelper.addGuiFloat(guiParams, "Synth - Harmonic", synth.harmonicity, "value", 0.0, 3.0).step(0.5);
            //guihelper.addGuiFloat(guiParams, "Synth - Slide", synth, "portamento", 0.0, 0.2);
            //guihelper.addGuiFloat(guiParams, "Synth - Detune", synth.detune, "value", -100.0, 100.0);
            addGuiFeedbackDelay(guiParams, feedbackDelay);
            //addGuiEq(guiParams, eq);
            //addGuiAutoPanner(guiParams, panner);
        }

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    function createSynthBell() {
        let synth = new Tone.Synth();
        synth.set({
            "harmonicity": 8,
            "modulationIndex": 2,
            "oscillator": {
                "type": "sine"
            },
            "envelope": {
                "attack": 0.001,
                "decay": 2,
                "sustain": 0.1,
                "release": 2
            },
            "modulation": {
                "type": "triangle"
            },
            "modulationEnvelope": {
                "attack": 0.002,
                "decay": 0.2,
                "sustain": 0,
                "release": 0.2
            },
            "volume": baseVolume - 2.0
        });

        /*var panner = new Tone.AutoPanner({
            "frequency": "4n",
            "depth": 0.5,
        }).start();*/

        var chain = [
            synth,
            //panner,
        ]
        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        var timeDelay = "4m";
        //let notes = ["C4", "E4", "G4", "B4", "C5", "E5", "G5", "B5", "C6"];
        let notes = ["G5", "B5", "C6"];
        let loop = new Tone.Loop(function(time) {

            if (!synthParams.enabled) {
                return;
            }

            //signal.pulsate('hit_piano');
            let note = notes[mathext.randBetweenInt(0, notes.length)];

            synth.triggerAttackRelease(note, timeDelay, time);

            //background.pingColor(0x303030, 1.5);

        }, timeDelay).start(settings.audioStartNote);

        loop.humanize = 0.0;
        loop.probability = 1.0;

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Bell");

            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            addGuiLoop(guiParams, loop);
            //guihelper.addGuiFloat(guiParams, "Synth - Freq", synth.frequency, "value", 0.0, 1000.0);
            //guihelper.addGuiFloat(guiParams, "Synth - Harmonic", synth.harmonicity, "value", 0.0, 3.0).step(0.5);
            //guihelper.addGuiFloat(guiParams, "Synth - Slide", synth, "portamento", 0.0, 0.2);
            //guihelper.addGuiFloat(guiParams, "Synth - Detune", synth.detune, "value", -100.0, 100.0);
            //addGuiFeedbackDelay(guiParams, feedbackDelay);
            //addGuiAutoPanner(guiParams, panner);
        }

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    function createSynthPulsate() {

        //var synth = new Tone.Noise("pink");
        var synth = new Tone.PWMOscillator("C6", 5.0);
        //synth.harmonicity.value = 4.0;
        synth.start();
        synth.volume.value = -10.0;
        //var filter = new Tone.Filter(1000, "lowpass");
        //var feedbackDelay = new Tone.FeedbackDelay("4n", 0.7);

        var chain = [
            synth,
            //filter,
        ];
        connectEffectsChain(chain);
        let synthParams = createSynthParams(chain);

        let minVal = 0.05;
        let maxVal = 0.25;
        let minVol = -100.0;
        let maxVol = -55.0;

        let loop = animitter(function(deltaTime, elapsedTime, frameCount) {

            if (!synthParams.enabled) {
                return;
            }

            let centerVal = (minVal + maxVal) * 0.5;
            let width = (maxVal - minVal) * 0.5;

            var ringPulse = signal.get('ringPulse');
            synth.volume.value = mathext.lerp(minVol, maxVol, mathext.pulse(centerVal, width, ringPulse));
            //filter.frequency.value = mathext.lerp(1.0, 6000.0, mathext.pulse(maxVal, width * 2.0, ringPulse));
        });
        loop.start(settings.audioStartNotet);

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Audio - Noise");
            addMuteButton(guiParams, synth);
            guihelper.addResetButton(guiParams);
            guihelper.addGuiFloat(guiParams, "Volume", synth.volume, "value", -100.0, 0.0);
            //guihelper.addGuiDropDown(guiParams, "Noise", synth, "type", ["white", "brown", "pink"]);
            //addGuiFilter(guiParams, filter);
        }

        return {
            synth: synth,
            synthParams: synthParams
        };
    }

    synths['arp'] = createSynthArp();
    synths['pad0'] = createSynthPad();
    synths['pad1'] = createSynthPad();
    synths['lead'] = createSynthLead();
    //synths['pulsate'] = createSynthPulsate();
    synths['piano'] = createSynthPiano();
    synths['bell'] = createSynthBell();
}

function initSignals() {

    let director = require('./Director.js');

    //let sigs = ["1n", "2n", "4n", "8n", "2m", "3m", "4m"];
    let sigs = ["4m"];

    for (let i = 0; i < sigs.length; i += 1) {

        let sig = sigs[i];
        let noteId = "hit_" + sig;
        let event = new Event(noteId);

        let loop = new Tone.Loop(function(time) {

            signal.pulsate(noteId);
            director.onHitNote(noteId);
            window.dispatchEvent(event);

        }, sig);
        loop.start(settings.audioStartNote);
    }
}

function initMastering() {
    var app = require('./../App.js');

    // tone transport bpm
    Tone.Transport.bpm.value = settings.audioBPM;
    Tone.Transport.start();

    // master/mute settings
    Tone.Master.volume.value = settings.audioVolume;
    Tone.Master.mute = settings.audioMute;

    initSignals();

    if (settings.showGui) {
        var guiParams = guihelper.createGuiParamObj("Audio - Master");
        guihelper.addResetButton(guiParams);
        guihelper.addGuiFloat(guiParams, "Volume", Tone.Master.volume, "value", -100.0, 0.0);
    }

    // turn off mastering if iOS
    var isIOS = app.getMobileOperatingSystem() === "iOS";

    // muted on ios for now
    if (isIOS && settings.disableAudioIOS)
    {
        document.getElementById("desc_text").textContent = "A WebVR experiment created with realtime shaders.";
        settings.audioMasteringEnable = false;
        Tone.Master.mute = true;
        return;
    }

    if (settings.audioMasteringEnable) {

        var reverb = new Tone.JCReverb(0.9);
        //signal.map('soothingLight', reverb.wet, 'value', 0.9, 0.7);

        /*var masterCompressor = new Tone.Compressor({
            "threshold": -12,
            "ratio": 3,
            "attack": 0.1,
            "release": 0.5,
        });

        //give a little boost to the lows
        var lowBump = new Tone.Filter(200, "lowshelf");
        lowBump.gain.value = 2;*/
        //Tone.Master.chain(reverb, lowBump, masterCompressor);
        //Tone.Master.chain(lowBump, masterCompressor);
        Tone.Master.chain(reverb);

        if (settings.showGui) {
            addGuiReverb(guiParams, reverb);
            /*addGuiFilter(guiParams, lowBump);
            guihelper.addGuiFloat(guiParams, "Filter - RollOff", lowBump, "rolloff", -20.0, 20.0);
            guihelper.addGuiFloat(guiParams, "Comp - Threshold", masterCompressor.threshold, "value", masterCompressor.threshold.minValue, masterCompressor.threshold.maxValue);
            guihelper.addGuiFloat(guiParams, "Comp - Ratio", masterCompressor.ratio, "value", masterCompressor.ratio.minValue, masterCompressor.ratio.maxValue);
            guihelper.addGuiFloat(guiParams, "Comp - Knee", masterCompressor.knee, "value", masterCompressor.knee.minValue, masterCompressor.knee.maxValue);
            guihelper.addGuiFloat(guiParams, "Comp - Attack", masterCompressor.attack, "value", 0.0, 1.0);
            guihelper.addGuiFloat(guiParams, "Comp - Release", masterCompressor.release, "value", 0.0, 1.0);*/
        }
    }

    function doAudioMute() {
        Tone.Master.mute = true;
    }

    function doAudioUnmute() {
        Tone.Master.mute = false;
    }

    // mute button
    document.querySelector('button#muteAudio').addEventListener('click', () => {
        Tone.Master.mute = !Tone.Master.mute
    });

    window.addEventListener('keypress', function(key) {
        if (key.code === "KeyM") {
            Tone.Master.mute = !Tone.Master.mute
        }
    }, false);

    window.addEventListener('focus', doAudioUnmute, true);
    window.addEventListener('pageshow', doAudioUnmute, true);
    window.addEventListener('blur', doAudioMute, false);
    window.addEventListener('pagehide', doAudioMute, false);

    document.addEventListener('visibilitychange', function(e) {
        if (document.hidden) {
            doAudioMute();
        } else {
            doAudioUnmute();
        }
    }, false);
}
module.exports = {

    synths: synths,

    init: function() {
        initMastering();
        initSynths();
    },

    start: function() {

    },

    enableSynths: function(synthsArray) {
        for (var key in synths) {
            if (!synths.hasOwnProperty(key))
                continue;

            let synth = synths[key];
            let synthWillBeEnabled = synthsArray.indexOf(key) >= 0;

            // only stop if needed
            if (!synthWillBeEnabled) {

                synth.synthParams.stop();
            }
        }

        for (var i = 0; i < synthsArray.length; i += 1) {
            let synthKey = synthsArray[i];

            if (synths.hasOwnProperty(synthKey)) {
                var synth = synths[synthKey];
                synth.synthParams.start();
            }
        }
    },
};