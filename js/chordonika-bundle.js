/**
 * Chord System Bundle v1.1.0
 * A self-contained bundle combining the unified chord system and zoomed keyboard
 * Can be dropped into any webpage with a single script tag
 * Updated with smart octave selection to ensure optimal key highlighting
 */

let global;
(function(global) {
    'use strict';

    //==================================================
    // 1. EMBEDDED CSS
    //==================================================

    const KEYBOARD_CSS = `
    .zoomed-keyboard {
      position: relative;
      width: 548px;
      height: 108px;
      background-color: #010101;
      border-radius: 4px;
      padding: 10px;
      box-sizing: border-box;
    }

    .zoomed-keyboard__keys {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .zoomed-keyboard__key--white {
      position: absolute;
      width: 35px;
      height: 80px;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 0 0 4px 4px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 5px;
      font-size: 10px;
      font-weight: bold;
      color: #333;
      cursor: pointer;
      transition: background-color 0.1s;
    }

    .zoomed-keyboard__key--white:hover {
      background-color: #f0f0f0;
    }

    .zoomed-keyboard__key--white.active {
      background-color: #90caf9;
    }

    .zoomed-keyboard__key--black {
      position: absolute;
      width: 20px;
      height: 50px;
      background-color: #333;
      border: 1px solid #000;
      border-radius: 0 0 2px 2px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 4px;
      font-size: 5px;
      font-weight: bold;
      color: #fff;
      cursor: pointer;
      z-index: 2;
      transition: background-color 0.1s;
    }

    .zoomed-keyboard__key--black:hover {
      background-color: #555;
    }

    .zoomed-keyboard__key--black.active {
      background-color: #5c6bc0;
    }

    .zoomed-keyboard__note-label {
      text-align: center;
      line-height: 1.2;
      font-size: 9px;
    }

    /* White key positions */
    .zoomed-keyboard__position--c3 {
      left: 0;
      color: red;
    }
    .zoomed-keyboard__position--d3 {
      left: 35px;
    }
    .zoomed-keyboard__position--e3 {
      left: 70px;
    }
    .zoomed-keyboard__position--f3 {
      left: 105px;
    }
    .zoomed-keyboard__position--g3 {
      left: 140px;
    }
    .zoomed-keyboard__position--a3 {
      left: 175px;
    }
    .zoomed-keyboard__position--b3 {
      left: 210px;
    }
    .zoomed-keyboard__position--c4 {
      left: 245px;
      color: red;
    }
    .zoomed-keyboard__position--d4 {
      left: 280px;
    }
    .zoomed-keyboard__position--e4 {
      left: 315px;
    }
    .zoomed-keyboard__position--f4 {
      left: 350px;
    }
    .zoomed-keyboard__position--g4 {
      left: 385px;
    }
    .zoomed-keyboard__position--a4 {
      left: 420px;
    }
    .zoomed-keyboard__position--b4 {
      left: 455px;
    }
    .zoomed-keyboard__position--c5 {
      left: 490px;
      color: red;
    }

    /* Black key positions */
    .zoomed-keyboard__position--cs3 {
      left: 25px;
    }
    .zoomed-keyboard__position--ds3 {
      left: 60px;
    }
    .zoomed-keyboard__position--fs3 {
      left: 130px;
    }
    .zoomed-keyboard__position--gs3 {
      left: 165px;
    }
    .zoomed-keyboard__position--as3 {
      left: 200px;
    }
    .zoomed-keyboard__position--cs4 {
      left: 270px;
    }
    .zoomed-keyboard__position--ds4 {
      left: 305px;
    }
    .zoomed-keyboard__position--fs4 {
      left: 375px;
    }
    .zoomed-keyboard__position--gs4 {
      left: 410px;
    }
    .zoomed-keyboard__position--as4 {
      left: 445px;
    }

    /* Chord Selector Styles */
    .chord-selector {
      font-family: Arial, sans-serif;
     padding: 5px;
      background-color: #f5f5f5;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 795px;
      margin: 0 auto;
    }

    .chord-selector h3 {
      margin-top: 0;
      color: #333;
    }

.chord-selector-controls {
  display: flex;
  justify-content: flex-start;
  gap: 40px; /* Adjust gap between root and quality dropdowns */
  margin-bottom: 15px;
}

.dropdown-group {
  flex: 0 0 auto;
}

    .dropdown-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }

.chord-dropdown {
  width: 180px; /* or 200px */
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

    .chord-info-container {
      display: flex;
      background-color: #fff;
      width: 770px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
    }

.selected-chord-symbol:empty::before {
  content: "–";
  color: #ccc;
}

.selected-chord-notes:empty::before {
  content: "No chord selected.";
  color: #aaa;
  font-size: 14px;
}

    .selected-chord-info {
      flex: 1;
      padding-right: 5px;
    }

    .selected-chord-symbol {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .selected-chord-notes {
      font-size: 16px;
      color: #666;
      margin-bottom: 5px;
    }

    .clear-selected-chord {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 8px 5px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .clear-selected-chord:hover {
      background-color: #e53935;
    }

    .zoom-keyboard-panel {
      flex: 1;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

    //==================================================
    // 2. UNIFIED CHORD DATA
    //==================================================

    const ChordData = {
        // Standard note names with ASCII characters
        noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

        // Root notes for chord selection (including enharmonic equivalents)
        rootNotes: [
            { value: "C", label: "C" },
            { value: "C#", label: "C#/Db" },
            { value: "D", label: "D" },
            { value: "D#", label: "D#/Eb" },
            { value: "E", label: "E" },
            { value: "F", label: "F" },
            { value: "F#", label: "F#/Gb" },
            { value: "G", label: "G" },
            { value: "G#", label: "G#/Ab" },
            { value: "A", label: "A" },
            { value: "A#", label: "A#/Bb" },
            { value: "B", label: "B" },
        ],

        // Comprehensive chord quality definitions with consistent naming
        chordQualities: {
            // Basic Triads (Priority 1 - Most Common)
            major: {
                name: "major",
                label: "Major",
                symbol: "",
                intervals: [0, 4, 7],
                priority: 1,
            },
            minor: {
                name: "minor",
                label: "Minor",
                symbol: "m",
                intervals: [0, 3, 7],
                priority: 1,
            },

            // 7th Chords (Priority 1 - Essential Jazz)
            major7: {
                name: "major7",
                label: "Major 7th",
                symbol: "maj7",
                intervals: [0, 4, 7, 11],
                priority: 1,
            },
            minor7: {
                name: "minor7",
                label: "Minor 7th",
                symbol: "m7",
                intervals: [0, 3, 7, 10],
                priority: 1,
            },
            dominant7: {
                name: "dominant7",
                label: "Dominant 7th",
                symbol: "7",
                intervals: [0, 4, 7, 10],
                priority: 1,
            },
            halfDiminished: {
                name: "halfDiminished",
                label: "Half-Diminished",
                symbol: "ø7",
                intervals: [0, 3, 6, 10],
                priority: 1,
            },

            // Other Important Chords (Priority 2)
            diminished: {
                name: "diminished",
                label: "Diminished",
                symbol: "dim",
                intervals: [0, 3, 6],
                priority: 2,
            },
            diminished7: {
                name: "diminished7",
                label: "Diminished 7th",
                symbol: "dim7",
                intervals: [0, 3, 6, 9],
                priority: 2,
            },
            augmented: {
                name: "augmented",
                label: "Augmented",
                symbol: "+",
                intervals: [0, 4, 8],
                priority: 2,
            },

            // 6th Chords (Priority 2)
            major6: {
                name: "major6",
                label: "Major 6th",
                symbol: "6",
                intervals: [0, 4, 7, 9],
                priority: 2,
            },
            minor6: {
                name: "minor6",
                label: "Minor 6th",
                symbol: "m6",
                intervals: [0, 3, 7, 9],
                priority: 2,
            },

            // Suspended Chords (Priority 2)
            sus2: {
                name: "sus2",
                label: "Suspended 2nd",
                symbol: "sus2",
                intervals: [0, 2, 7],
                priority: 2,
            },
            sus4: {
                name: "sus4",
                label: "Suspended 4th",
                symbol: "sus4",
                intervals: [0, 5, 7],
                priority: 2,
            },

            // Extended Chords (Priority 3 - Advanced Jazz)
            dominant9: {
                name: "dominant9",
                label: "Dominant 9th",
                symbol: "9",
                intervals: [0, 4, 7, 10, 2],
                priority: 3,
            },
            major9: {
                name: "major9",
                label: "Major 9th",
                symbol: "maj9",
                intervals: [0, 4, 7, 11, 2],
                priority: 3,
            },
            minor9: {
                name: "minor9",
                label: "Minor 9th",
                symbol: "m9",
                intervals: [0, 3, 7, 10, 2],
                priority: 3,
            },
            dominant11: {
                name: "dominant11",
                label: "Dominant 11th",
                symbol: "11",
                intervals: [0, 4, 7, 10, 2, 5],
                priority: 3,
            },
        },

        // Common alterations for jazz chords
        alterations: {
            flat5: { degree: 5, modifier: "flat", symbol: "b5", interval: 6 },
            sharp5: { degree: 5, modifier: "sharp", symbol: "#5", interval: 8 },
            flat9: { degree: 9, modifier: "flat", symbol: "b9", interval: 1 },
            sharp9: { degree: 9, modifier: "sharp", symbol: "#9", interval: 3 },
            sharp11: { degree: 11, modifier: "sharp", symbol: "#11", interval: 6 },
            flat13: { degree: 13, modifier: "flat", symbol: "b13", interval: 8 },
        },
    };

    //==================================================
    // 3. CHORD UTILITIES
    //==================================================

    const ChordUtils = {
        // Converts a MIDI note number to a note name
        midiToNoteName(midiNote) {
            return ChordData.noteNames[midiNote % 12];
        },

        // Converts a note name to its MIDI note number in a specific octave
        noteToMidi(noteName, octave = 4) {
            const noteMap = {
                "C": 0,
                "C#": 1,
                "D": 2,
                "D#": 3,
                "E": 4,
                "F": 5,
                "F#": 6,
                "G": 7,
                "G#": 8,
                "A": 9,
                "A#": 10,
                "B": 11,
            };
            return (octave + 1) * 12 + noteMap[noteName];
        },

        // Gets chord qualities sorted by priority (for selector)
        getQualitiesByPriority() {
            return Object.entries(ChordData.chordQualities)
                .sort(([, a], [, b]) => a.priority - b.priority)
                .map(([key, quality]) => ({ value: key, ...quality }));
        },

        // Generates a properly formatted chord symbol with consistent spacing
        generateSymbol(root, qualityName, extensions = [], alterations = []) {
            const quality = ChordData.chordQualities[qualityName];
            if (!quality) return root;

            let symbol = root + quality.symbol;

            // Add extensions with proper spacing
            if (extensions.length > 0) {
                symbol += " " + extensions.join(" ");
            }

            // Add alterations with proper spacing and symbols
            if (alterations.length > 0) {
                const altSymbols = alterations.map((alt) => {
                    if (typeof alt === "string") return alt;
                    const modifier = alt.modifier === "flat" ? "b" : "#";
                    return modifier + alt.degree;
                });
                symbol += " " + altSymbols.join(" ");
            }

            return symbol;
        },

        // Formats a note list with proper punctuation
        formatNotesList(notes) {
            if (notes.length === 0) return "";
            if (notes.length === 1) return notes[0];
            if (notes.length === 2) return `${notes[0]} & ${notes[1]}`;

            // For 3+ notes: "C, E, G & Bb"
            const lastNote = notes[notes.length - 1];
            const otherNotes = notes.slice(0, -1);
            return `${otherNotes.join(", ")} & ${lastNote}`;
        },

        // Creates a mapping between note names and keyboard positions
        getNoteToKeyMap() {
            return {
                'C3': 'c3', 'C#3': 'cs3', 'D3': 'd3', 'D#3': 'ds3',
                'E3': 'e3', 'F3': 'f3', 'F#3': 'fs3', 'G3': 'g3',
                'G#3': 'gs3', 'A3': 'a3', 'A#3': 'as3', 'B3': 'b3',
                'C4': 'c4', 'C#4': 'cs4', 'D4': 'd4', 'D#4': 'ds4',
                'E4': 'e4', 'F4': 'f4', 'F#4': 'fs4', 'G4': 'g4',
                'G#4': 'gs4', 'A4': 'a4', 'A#4': 'as4', 'B4': 'b4',
                'C5': 'c5'
            };
        },

        // SOLUTION 1: Smart Octave Selection Algorithm
        // Finds the optimal root octave to ensure all chord notes fit within the keyboard range
        findOptimalRootOctave(rootNote, intervals, keyboardRange = { min: 48, max: 72 }) {
            let bestConfiguration = null;

            // Try each octave and find the one that:
            // 1. Fits the most notes in range
            // 2. Starts with the lowest possible root (prioritizes lowest keys)
            for (let octave = 2; octave <= 5; octave++) {
                const rootMidi = this.noteToMidi(rootNote, octave);
                const chordNotes = intervals.map(interval => rootMidi + interval);

                const notesInRange = chordNotes.filter(note =>
                    note >= keyboardRange.min && note <= keyboardRange.max
                );

                // Prefer configurations that:
                // 1. Have more notes in range
                // 2. Start lower (if the same number of notes) - this ensures the lowest key priority
                if (!bestConfiguration ||
                    notesInRange.length > bestConfiguration.notesInRange.length ||
                    (notesInRange.length === bestConfiguration.notesInRange.length &&
                        rootMidi < bestConfiguration.rootMidi)) {

                    bestConfiguration = {
                        octave: octave,
                        rootMidi: rootMidi,
                        notesInRange: notesInRange,
                        allNotes: chordNotes
                    };
                }
            }

            return bestConfiguration;
        }
    };

    //==================================================
    // 4. ZOOMED KEYBOARD CLASS
    //==================================================

    class ZoomedKeyboard {
        constructor(container) {
            this.container = container;
            this.initializeKeyboard();
        }

        initializeKeyboard() {
            // Create the keyboard HTML
            this.container.innerHTML = `
        <div class="zoomed-keyboard">
          <div class="zoomed-keyboard__keys">
            <!-- White keys -->
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--c3">C3</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--d3">D</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--e3">E</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--f3">F</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--g3">G</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--a3">A</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--b3">B</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--c4">C4</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--d4">D</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--e4">E</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--f4">F</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--g4">G</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--a4">A</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--b4">B</div>
            <div class="zoomed-keyboard__key--white zoomed-keyboard__position--c5">C5</div>

            <!-- Black keys -->
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--cs3">
              <div class="zoomed-keyboard__note-label">C#<br>Db</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--ds3">
              <div class="zoomed-keyboard__note-label">D#<br>Eb</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--fs3">
              <div class="zoomed-keyboard__note-label">F#<br>Gb</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--gs3">
              <div class="zoomed-keyboard__note-label">G#<br>Ab</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--as3">
              <div class="zoomed-keyboard__note-label">A#<br>Bb</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--cs4">
              <div class="zoomed-keyboard__note-label">C#<br>Db</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--ds4">
              <div class="zoomed-keyboard__note-label">D#<br>Eb</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--fs4">
              <div class="zoomed-keyboard__note-label">F#<br>Gb</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--gs4">
              <div class="zoomed-keyboard__note-label">G#<br>Ab</div>
            </div>
            <div class="zoomed-keyboard__key--black zoomed-keyboard__position--as4">
              <div class="zoomed-keyboard__note-label">A#<br>Bb</div>
            </div>
          </div>
        </div>
      `;

            // Store references to the keys for easier access
            this.keys = {};
            this.container.querySelectorAll('.zoomed-keyboard__key--white, .zoomed-keyboard__key--black').forEach(key => {
                // Extract the position class name
                const positionClass = Array.from(key.classList)
                    .find(cls => cls.startsWith('zoomed-keyboard__position--'));

                if (positionClass) {
                    const keyName = positionClass.replace('zoomed-keyboard__position--', '');
                    this.keys[keyName] = key;
                }
            });
        }

        // Highlights keys corresponding to the given MIDI notes
        highlightChordNotes(midiNotes) {
            this.clearHighlights();

            const noteToKeyMap = ChordUtils.getNoteToKeyMap();

            midiNotes.forEach(midiNote => {
                // Convert MIDI note to note name with octave
                const octave = Math.floor(midiNote / 12) - 1;
                const noteName = ChordData.noteNames[midiNote % 12] + octave;

                // Get the corresponding key on the keyboard
                const keyName = noteToKeyMap[noteName];
                if (keyName && this.keys[keyName]) {
                    this.keys[keyName].classList.add('active');
                }
            });
        }

        // Clears all highlighted keys
        clearHighlights() {
            Object.values(this.keys).forEach(key => {
                key.classList.remove('active');
            });
        }
    }

    //==================================================
    // 5. CHORD SELECTOR CLASS
    //==================================================

    class ChordSelector {
        constructor(containerSelector) {
            this.container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;

            this.onChordSelected = null;
            this.initializeUI();
        }

        initializeUI() {
            this.container.innerHTML = `
        <div class="chord-selector">
          <h3>Chord Selection</h3>
          <div class="chord-selector-controls">
            <div class="dropdown-group">
              <label for="root-note-select">Root Note:</label>
              <select id="root-note-select" class="chord-dropdown">
                <option value="">Select root note...</option>
              </select>
            </div>
            <div class="dropdown-group">
              <label for="chord-quality-select">Chord Quality:</label>
              <select id="chord-quality-select" class="chord-dropdown">
                <option value="">Select chord quality...</option>
              </select>
            </div>
          </div>
          <div class="chord-info-container">
            <div class="selected-chord-info">
              <div class="selected-chord-symbol"></div>
              <div class="selected-chord-notes"></div>
              <button class="clear-selected-chord">Clear</button>
            </div>
            <div class="zoom-keyboard-panel">
              <!-- Keyboard will be inserted here -->
            </div>
          </div>
        </div>
      `;

            this.populateDropdowns();
            this.attachEventListeners();

            // Create the keyboard
            const keyboardPanel = this.container.querySelector('.zoom-keyboard-panel');
            if (keyboardPanel) {
                this.keyboard = new ZoomedKeyboard(keyboardPanel);
            } else {
                console.error('Chord System: Keyboard panel not found');
            }
        }

        populateDropdowns() {
            const rootSelect = this.container.querySelector("#root-note-select");
            const qualitySelect = this.container.querySelector("#chord-quality-select");

            // Populate root notes
            ChordData.rootNotes.forEach((note) => {
                const option = document.createElement("option");
                option.value = note.value;
                option.textContent = note.label;
                rootSelect.appendChild(option);
            });

            // Populate chord qualities by priority
            ChordUtils.getQualitiesByPriority().forEach((quality) => {
                const option = document.createElement("option");
                option.value = quality.value;
                option.textContent = quality.label;
                qualitySelect.appendChild(option);
            });
        }

        attachEventListeners() {
            const rootSelect = this.container.querySelector("#root-note-select");
            const qualitySelect = this.container.querySelector("#chord-quality-select");
            const clearBtn = this.container.querySelector(".clear-selected-chord");

            rootSelect.addEventListener("change", () => this.updateSelectedChord());
            qualitySelect.addEventListener("change", () => this.updateSelectedChord());
            clearBtn.addEventListener("click", () => this.clearSelection());
        }

        updateSelectedChord() {
            const rootSelect = this.container.querySelector("#root-note-select");
            const qualitySelect = this.container.querySelector("#chord-quality-select");

            const rootNote = rootSelect.value;
            const chordQuality = qualitySelect.value;

            if (rootNote && chordQuality) {
                const chord = this.buildChord(rootNote, chordQuality);
                this.displaySelectedChord(chord);

                if (this.onChordSelected) {
                    this.onChordSelected(chord);
                }

                // Highlight the chord notes on the keyboard
                if (this.keyboard) {
                    this.keyboard.highlightChordNotes(chord.midiNotes);
                }
            } else {
                this.clearSelectedChordDisplay();
                if (this.keyboard) {
                    this.keyboard.clearHighlights();
                }
            }
        }

        // SOLUTION 2: Modified buildChord Method with Smart Octave Selection
        buildChord(rootNote, qualityValue) {
            const quality = ChordData.chordQualities[qualityValue];

            // Use smart octave selection to find the optimal octave for this chord
            const keyboardRange = { min: 48, max: 72 }; // C3 to C5
            const optimalConfig = ChordUtils.findOptimalRootOctave(rootNote, quality.intervals, keyboardRange);

            // Generate consistent symbol using shared utility
            const symbol = ChordUtils.generateSymbol(rootNote, qualityValue);

            // Use the optimal configuration
            const midiNotes = optimalConfig.notesInRange; // Only include notes that fit in the keyboard range
            const allMidiNotes = optimalConfig.allNotes; // Keep all notes for reference

            // Log information about optimization for debugging
            if (midiNotes.length < allMidiNotes.length) {
                console.info(`Chord System: Optimized ${symbol} to octave ${optimalConfig.octave}. Showing ${midiNotes.length} of ${allMidiNotes.length} notes in keyboard range.`);
            }

            return {
                root: rootNote,
                quality: qualityValue,
                symbol: symbol,
                intervals: quality.intervals,
                midiNotes: midiNotes, // Only visible notes for highlighting
                allMidiNotes: allMidiNotes, // All notes for reference
                noteNames: midiNotes.map((midiNote) =>
                    ChordUtils.midiToNoteName(midiNote),
                ),
                metadata: {
                    confidence: 1.0,
                    timestamp: new Date().toISOString(),
                    source: "manual_selection",
                    octaveUsed: optimalConfig.octave,
                    notesInRange: midiNotes.length,
                    totalNotes: allMidiNotes.length
                },
            };
        }

        displaySelectedChord(chord) {
            const symbolEl = this.container.querySelector(".selected-chord-symbol");
            const notesEl = this.container.querySelector(".selected-chord-notes");
            const infoContainer = this.container.querySelector(".chord-info-container");

            // Show the side-by-side container with a flex display
            infoContainer.style.display = "flex";

            // Use consistent symbol formatting
            symbolEl.textContent = chord.symbol;

            // Use consistent note formatting
            const formattedNotes = ChordUtils.formatNotesList(chord.noteNames);
            notesEl.textContent = `Notes: ${formattedNotes}`;

            this.container.querySelector(".chord-selector").classList.add("has-chord");
        }

        clearSelectedChordDisplay() {
            const infoContainer = this.container.querySelector(".chord-info-container");
            infoContainer.querySelector(".selected-chord-symbol").textContent = "";
            infoContainer.querySelector(".selected-chord-notes").textContent = "";
            this.container
                .querySelector(".chord-selector")
                .classList.remove("has-chord");
        }

        clearSelection() {
            const rootSelect = this.container.querySelector("#root-note-select");
            const qualitySelect = this.container.querySelector("#chord-quality-select");

            rootSelect.value = "";
            qualitySelect.value = "";
            this.clearSelectedChordDisplay();
            if (this.keyboard) {
                this.keyboard.clearHighlights();
            }

            if (this.onChordSelected) {
                this.onChordSelected(null);
            }
        }

        setChordSelectedCallback(callback) {
            this.onChordSelected = callback;
        }
    }

    //==================================================
    // 6. PUBLIC API & INITIALIZATION
    //==================================================

    // Initialize the styles at once
    function initializeStyles() {
        if (!document.getElementById('chord-system-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'chord-system-styles';
            styleElement.textContent = KEYBOARD_CSS;
            document.head.appendChild(styleElement);
        }
    }

    // Main public API for the chord system
    global.ChordSystem = {
        // Initialize the chord system in a container
        init: function (selectorOrElement) {
            initializeStyles();

            let container;
            if (typeof selectorOrElement === 'string') {
                container = document.querySelector(selectorOrElement);
            } else {
                container = selectorOrElement;
            }

            if (!container) {
                console.error('Chord System: Container not found for selector', selectorOrElement);
                return null;
            }

            return new ChordSelector(container);
        },

        // Create a standalone keyboard
        // noinspection JSUnusedGlobalSymbols
        createKeyboard: function (selectorOrElement) {
            initializeStyles();

            let container;
            if (typeof selectorOrElement === 'string') {
                container = document.querySelector(selectorOrElement);
            } else {
                container = selectorOrElement;
            }

            if (!container) {
                console.error('Chord System: Container not found');
                return null;
            }

            return new ZoomedKeyboard(container);
        },

        // Access to utilities and data
        utils: ChordUtils,
        data: ChordData
    };

    // Ensure a public API method is considered used by IDE/static analysis
    void (global.ChordSystem && global.ChordSystem.createKeyboard);

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : self);

