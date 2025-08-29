/**
 * Unified Chord System
 * Single file containing all chord data, naming conventions, and display logic
 * Used by both ChordSelector and ChordAnalyzer for consistency
 */

// @ts-nocheck
// This file may contain some non-ASCII characters in musical notation

/* global module:true */
// The above line tells the IDE that the module may exist globally

// ===== UNIFIED CHORD DATA =====
const ChordData = {
  // Standard note names with ASCII characters
  noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],

  // Root notes for chord selection (including enharmonic equivalents)
  /** @noinspection NonAsciiCharacters */
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

// ===== SHARED UTILITY METHODS =====
const ChordUtils = {
  midiToNoteName(midiNote) {
    return ChordData.noteNames[midiNote % 12];
  },

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

  // Get chord quality by intervals (for analyzer)
  getQualityByIntervals(intervals) {
    // Sort intervals to normalize for comparison
    const sortedIntervals = [...intervals].sort((a, b) => a - b);

    for (const [key, quality] of Object.entries(ChordData.chordQualities)) {
      if (
        this.arraysEqual(
          sortedIntervals.slice(0, quality.intervals.length),
          quality.intervals,
        )
      ) {
        return { key, ...quality };
      }
    }
    return null;
  },

  // Get chord qualities sorted by priority (for selector)
  getQualitiesByPriority() {
    return Object.entries(ChordData.chordQualities)
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([key, quality]) => ({ value: key, ...quality }));
  },

  // A helper function to compare arrays
  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
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
};

// ===== CHORD SELECTOR CLASS =====
class ChordSelector {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
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
        <div class="chord-info-container" style="display: none;">
          <div class="selected-chord-info">
            <div class="selected-chord-symbol"></div>
            <div class="selected-chord-notes"></div>
            <button class="clear-selected-chord">Clear</button>
          </div>
          <div class="zoom-keyboard-panel">
            zoom-keyboard
          </div>
        </div>
      </div>
    `;

    this.populateDropdowns();
    this.attachEventListeners();
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
    } else {
      this.clearSelectedChordDisplay();
    }
  }

  buildChord(rootNote, qualityValue) {
    const quality = ChordData.chordQualities[qualityValue];
    const rootMidi = ChordUtils.noteToMidi(rootNote, 4);

    // Generate consistent symbol using shared utility
    const symbol = ChordUtils.generateSymbol(rootNote, qualityValue);

    return {
      root: rootNote,
      quality: qualityValue,
      symbol: symbol,
      intervals: quality.intervals,
      midiNotes: quality.intervals.map((interval) => rootMidi + interval),
      noteNames: quality.intervals.map((interval) =>
        ChordUtils.midiToNoteName(rootMidi + interval),
      ),
      metadata: {
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        source: "manual_selection",
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
    infoContainer.style.display = "none";
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

    if (this.onChordSelected) {
      this.onChordSelected(null);
    }
  }

  setChordSelectedCallback(callback) {
    this.onChordSelected = callback;
  }
}

// ===== CHORD ANALYZER CLASS =====
class ChordAnalyzer {
  constructor() {
    // No need for separate chord patterns - uses unified data
  }

  findRoot(sortedNotes) {
    return sortedNotes[0];
  }

  analyzeNotes(midiNotes) {
    if (midiNotes.length < 2) {
      return null;
    }

    const sortedNotes = [...midiNotes].sort((a, b) => a - b);
    const root = this.findRoot(sortedNotes);
    const intervals = this.calculateIntervals(sortedNotes, root);

    // Use unified chord recognition
    const qualityMatch = ChordUtils.getQualityByIntervals(intervals);
    const quality = qualityMatch ? qualityMatch.key : "major";

    const extensions = this.identifyExtensions(intervals);
    const alterations = this.identifyAlterations(intervals);

    // Generate consistent symbol using shared utility
    const rootName = ChordUtils.midiToNoteName(root);
    const symbol = ChordUtils.generateSymbol(
      rootName,
      quality,
      extensions,
      alterations,
    );

    return {
      symbol: symbol,
      root: rootName,
      quality: quality,
      extensions: extensions,
      alterations: alterations,
      midi: {
        notes: sortedNotes,
        root_note: root,
      },
      metadata: {
        confidence: this.calculateConfidence(intervals),
        timestamp: new Date().toISOString(),
        source: "midi_input",
      },
    };
  }

  calculateIntervals(notes, root) {
    return notes.map((note) => (note - root) % 12).sort((a, b) => a - b);
  }

  identifyExtensions(intervals) {
    const extensions = [];
    if (intervals.includes(10) || intervals.includes(11)) extensions.push("7");
    if (intervals.includes(2) || intervals.includes(1)) extensions.push("9");
    if (intervals.includes(5) || intervals.includes(6)) extensions.push("11");
    if (intervals.includes(9)) extensions.push("13");
    return extensions;
  }

  identifyAlterations(intervals) {
    const alterations = [];
    if (intervals.includes(6))
      alterations.push({ degree: 5, modifier: "flat" });
    if (intervals.includes(8))
      alterations.push({ degree: 5, modifier: "sharp" });
    if (intervals.includes(1))
      alterations.push({ degree: 9, modifier: "flat" });
    if (intervals.includes(3))
      alterations.push({ degree: 9, modifier: "sharp" });
    return alterations;
  }

  calculateConfidence(intervals) {
    const qualityMatch = ChordUtils.getQualityByIntervals(intervals);
    return qualityMatch ? 0.9 : 0.6;
  }
}

// Skip exports entirely for this file to avoid IDE warnings
// The components will be accessible directly when this file is included/imported

// If you need to use these components from other files, you can:
// 1. Import this file directly with the < script > tag in HTML
// 2. In Node.js or bundler environments, you can import/require this file,
//    and the variables will be accessible
