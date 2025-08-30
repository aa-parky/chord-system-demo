/**
 * Unified Chord System (de-duplicated v6)
 * - Removes final 19-line duplicate by abstracting a rules-based collection used for extensions/alterations
 * - Preserves public API and behavior
 *   Globals: ChordData, ChordUtils, ChordSelector, ChordAnalyzer
 */

// @ts-nocheck
/* global module:true */

// ===== CONSTANTS =====
const UCS_CONSTANTS = {
    SELECTOR_TEMPLATE: `
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
        <div class="zoom-keyboard-panel">zoom-keyboard</div>
      </div>
    </div>
  `,
};

// ===== BUILDERS (remove large duplicated literals) =====
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function buildRootNotes() {
    const enharmonic = {
        "C#": "C#/Db",
        "D#": "D#/Eb",
        "F#": "F#/Gb",
        "G#": "G#/Ab",
        "A#": "A#/Bb",
    };
    return NOTE_NAMES.map(n => ({ value: n, label: enharmonic[n] || n }));
}

// [name, label, symbol, intervals, priority]
const QUALITY_SPECS = [
    // Triads
    ["major", "Major", "",    [0,4,7],        1],
    ["minor", "Minor", "m",   [0,3,7],        1],

    // 7ths
    ["major7", "Major 7th", "maj7", [0,4,7,11], 1],
    ["minor7", "Minor 7th", "m7",   [0,3,7,10], 1],
    ["dominant7", "Dominant 7th", "7", [0,4,7,10], 1],
    ["halfDiminished", "Half-Diminished", "ø7", [0,3,6,10], 1],

    // Others
    ["diminished", "Diminished", "dim", [0,3,6], 2],
    ["diminished7", "Diminished 7th", "dim7", [0,3,6,9], 2],
    ["augmented", "Augmented", "+", [0,4,8], 2],

    // 6ths
    ["major6", "Major 6th", "6", [0,4,7,9], 2],
    ["minor6", "Minor 6th", "m6", [0,3,7,9], 2],

    // Suspended
    ["sus2", "Suspended 2nd", "sus2", [0,2,7], 2],
    ["sus4", "Suspended 4th", "sus4", [0,5,7], 2],

    // Extensions
    ["dominant9", "Dominant 9th", "9", [0,4,7,10,2], 3],
    ["major9", "Major 9th", "maj9", [0,4,7,11,2], 3],
    ["minor9", "Minor 9th", "m9", [0,3,7,10,2], 3],
    ["dominant11", "Dominant 11th", "11", [0,4,7,10,2,5], 3],
];

function buildChordQualities() {
    const obj = {};
    for (const [name, label, symbol, intervals, priority] of QUALITY_SPECS) {
        obj[name] = { name, label, symbol, intervals, priority };
    }
    return obj;
}

// [key, degree, modifier, symbol, interval]
const ALTERATION_SPECS = [
    ["flat5", 5, "flat", "b5", 6],
    ["sharp5",5, "sharp","#5", 8],
    ["flat9", 9, "flat", "b9", 1],
    ["sharp9",9, "sharp","#9", 3],
    ["sharp11",11,"sharp","#11",6],
    ["flat13",13,"flat", "b13",8],
];

function buildAlterations() {
    const obj = {};
    for (const [key, degree, modifier, symbol, interval] of ALTERATION_SPECS) {
        obj[key] = { degree, modifier, symbol, interval };
    }
    return obj;
}

// ===== UNIFIED CHORD DATA =====
const ChordData = Object.freeze({
    noteNames: NOTE_NAMES,
    rootNotes: buildRootNotes(),
    chordQualities: buildChordQualities(),
    alterations: buildAlterations(),
});

// ===== SHARED UTILITY METHODS =====
const ChordUtils = {
    midiToNoteName(midiNote) {
        return ChordData.noteNames[Math.abs(midiNote) % 12];
    },

    noteToMidi(noteName, octave = 4) {
        const noteIndex = NOTE_NAMES.indexOf(noteName);
        return (octave + 1) * 12 + (noteIndex >= 0 ? noteIndex : 0);
    },

    // Get chord quality by intervals (for analyzer)
    getQualityByIntervals(intervals) {
        const sortedIntervals = [...intervals]
            .map(n => ((n % 12) + 12) % 12)
            .sort((a, b) => a - b);

        for (const [key, quality] of Object.entries(ChordData.chordQualities)) {
            if (this.arraysEqual(sortedIntervals.slice(0, quality.intervals.length), quality.intervals)) {
                return { key, ...quality };
            }
        }
        return null;
    },

    // Get chord qualities sorted by priority (for selector)
    getQualitiesByPriority() {
        return Object.entries(ChordData.chordQualities)
            .sort(([, a], [, b]) => a.priority - b.priority)
            .map(([value, q]) => ({ value, ...q }));
    },

    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    },

    // Maps an alteration object to its string representation
    formatAlteration(alt) {
        if (typeof alt === "string") return alt;
        const modifier = alt.modifier === "flat" ? "b" : "#";
        return modifier + alt.degree;
    },

    // Generates a properly formatted chord symbol with consistent spacing
    generateSymbol(root, qualityName, extensions = [], alterations = []) {
        const quality = ChordData.chordQualities[qualityName];
        if (!quality) return root;

        let symbol = root + quality.symbol;

        if (extensions.length > 0) symbol += " " + extensions.join(" ");

        if (alterations.length > 0) {
            const altSymbols = alterations.map(this.formatAlteration);
            symbol += " " + altSymbols.join(" ");
        }

        return symbol;
    },

    // Formats a note list with proper punctuation
    formatNotesList(notes) {
        if (!notes || !notes.length) return "";
        return notes.length === 1 ? notes[0] : 
               notes.length === 2 ? `${notes[0]} & ${notes[1]}` :
               `${notes.slice(0, -1).join(", ")} & ${notes[notes.length - 1]}`;
    },

    // ===== UI HELPERS =====
    setContainerHTML(container, html) {
        if (!container) throw new Error("ChordSelector container not found");
        container.innerHTML = html;
    },

    populateSelect(selectEl, options, map = (x) => x) {
        const frag = document.createDocumentFragment();
        options.forEach((opt) => {
            const option = document.createElement("option");
            const mapped = map(opt);
            option.value = mapped.value;
            option.textContent = mapped.label ?? mapped.value;
            frag.appendChild(option);
        });
        selectEl.appendChild(frag);
    },

    showInfo(container, show) {
        const infoContainer = container.querySelector(".chord-info-container");
        infoContainer.style.display = show ? "flex" : "none";
        const sel = container.querySelector(".chord-selector");
        sel.classList.toggle("has-chord", !!show);
    },

    /**
     * Build a canonical chord descriptor in one place to avoid duplication in Selector/Analyzer.
     * @param {Object} params - Chord descriptor parameters
     * @param {string} params.rootName - Root note name
     * @param {string} params.qualityKey - Quality key
     * @param {number[]} params.intervals - Intervals
     * @param {number} params.rootMidi - Root MIDI note
     * @param {string[]} [params.extensions=[]] - Extensions
     * @param {Object[]} [params.alterations=[]] - Alterations
     * @param {string} [params.source="manual_selection"] - Source of the chord
     * @param {number[]|null} [params.midiNotes=null] - MIDI notes
     * @returns {Object} Chord descriptor
     */
    makeDescriptor({
                       rootName,
                       qualityKey,
                       intervals,
                       rootMidi,
                       extensions = [],
                       alterations = [],
                       source = "manual_selection",
                       midiNotes = null,
                   }) {
        const symbol = ChordUtils.generateSymbol(rootName, qualityKey, extensions, alterations);

        // If midiNotes not supplied, compute from rootMidi + intervals
        let midi = midiNotes;
        if (!midi && Number.isFinite(rootMidi)) {
            midi = intervals.map((i) => rootMidi + i);
        }
        const noteNames = Array.isArray(midi) ? midi.map(ChordUtils.midiToNoteName) : [];

        return {
            symbol,
            root: rootName,
            quality: qualityKey,
            extensions,
            alterations,
            intervals,
            midiNotes: midi || [],
            noteNames,
            metadata: {
                confidence: 1.0,
                timestamp: new Date().toISOString(),
                source,
            },
        };
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
        ChordUtils.setContainerHTML(this.container, UCS_CONSTANTS.SELECTOR_TEMPLATE);
        this.populateDropdowns();
        this.attachEventListeners();
    }

    populateDropdowns() {
        const rootSelect = this.container.querySelector("#root-note-select");
        const qualitySelect = this.container.querySelector("#chord-quality-select");

        ChordUtils.populateSelect(rootSelect, ChordData.rootNotes, (n) => n);
        ChordUtils.populateSelect(
            qualitySelect,
            ChordUtils.getQualitiesByPriority(),
            (q) => ({ value: q.value, label: q.label })
        );
    }

    attachEventListeners() {
        const rootSelect = this.container.querySelector("#root-note-select");
        const qualitySelect = this.container.querySelector("#chord-quality-select");
        const clearBtn = this.container.querySelector(".clear-selected-chord");

        const handler = () => this.handleSelectionChange();

        rootSelect.addEventListener("change", handler);
        qualitySelect.addEventListener("change", handler);
        clearBtn.addEventListener("click", () => this.clearSelection());
    }

    // ---- unified selection → chord → render pipeline ----
    getSelection() {
        return {
            rootNote: this.container.querySelector("#root-note-select").value,
            chordQuality: this.container.querySelector("#chord-quality-select").value,
        };
    }

    computeChordFromSelection() {
        const { rootNote, chordQuality } = this.getSelection();
        if (!rootNote || !chordQuality) return null;

        const quality = ChordData.chordQualities[chordQuality];
        const rootMidi = ChordUtils.noteToMidi(rootNote, 4);

        return ChordUtils.makeDescriptor({
            rootName: rootNote,
            qualityKey: chordQuality,
            intervals: quality.intervals,
            rootMidi,
            source: "manual_selection",
        });
    }

    handleSelectionChange() {
        const chord = this.computeChordFromSelection();
        this.render(chord);
        if (this.onChordSelected) this.onChordSelected(chord);
    }

    render(chord) {
        if (!chord) {
            ChordUtils.showInfo(this.container, false);
            return;
        }
        const symbolEl = this.container.querySelector(".selected-chord-symbol");
        const notesEl = this.container.querySelector(".selected-chord-notes");
        ChordUtils.showInfo(this.container, true);
        symbolEl.textContent = chord.symbol;
        notesEl.textContent = `Notes: ${ChordUtils.formatNotesList(chord.noteNames)}`;
    }

    clearSelection() {
        this.container.querySelector("#root-note-select").value = "";
        this.container.querySelector("#chord-quality-select").value = "";
        this.handleSelectionChange();
    }

    setChordSelectedCallback(callback) {
        this.onChordSelected = callback;
    }
}

// ===== CHORD ANALYZER CLASS =====
const ANALYZER_RULES = Object.freeze({
    extensions: [
        { pcs: [10, 11], ext: "7"  },
        { pcs: [ 2,  1], ext: "9"  },
        { pcs: [ 5,  6], ext: "11" },
        { pcs: [ 9     ], ext: "13" },
    ],
    alterations: [
        { pc: 6, degree: 5, modifier: "flat"  }, // b5
        { pc: 8, degree: 5, modifier: "sharp" }, // #5
        { pc: 1, degree: 9, modifier: "flat"  }, // b9
        { pc: 3, degree: 9, modifier: "sharp" }, // #9
    ],
});

class ChordAnalyzer {
    constructor() {}

    findRoot(sortedNotes) {
        return sortedNotes[0];
    }

    analyzeNotes(midiNotes) {
        if (!Array.isArray(midiNotes) || midiNotes.length < 2) return null;

        const sortedNotes = [...midiNotes].sort((a, b) => a - b);
        const root = this.findRoot(sortedNotes);
        const intervals = this.calculateIntervals(sortedNotes, root);

        const qualityMatch = ChordUtils.getQualityByIntervals(intervals);
        const quality = qualityMatch ? qualityMatch.key : "major";

        const intervalSet = new Set(intervals);
        const extensions  = this._collectByPresence(
            intervalSet,
            ANALYZER_RULES.extensions,
            (r, S) => r.pcs.some(pitchClass => S.has(pitchClass)),
            (r) => r.ext
        );
        const alterations = this._collectByPresence(
            intervalSet,
            ANALYZER_RULES.alterations,
            (r, S) => S.has(r.pc),
            (r) => ({ degree: r.degree, modifier: r.modifier })
        );

        const rootName = ChordUtils.midiToNoteName(root);

        // Single source of truth for a descriptor object
        const descriptor = ChordUtils.makeDescriptor({
            rootName,
            qualityKey: quality,
            intervals,
            rootMidi: root,
            extensions,
            alterations,
            source: "midi_input",
            midiNotes: sortedNotes, // Already an array, matches updated type
        });

        // Adjust confidence post-hoc
        descriptor.metadata.confidence = this.calculateConfidence(intervals);
        return descriptor;
    }

    calculateIntervals(notes, root) {
        return notes
            .map((note) => ((note - root) % 12 + 12) % 12)
            .sort((a, b) => a - b);
    }

    /**
     * Generic rules collector to avoid duplicated loop/collector logic.
     * @param {Set<number>} intervalSet
     * @param {Array<object>} rules
     * @param {(rule:object, intervalSet:Set<number>)=>boolean} predicate
     * @param {(rule:object)=>any} emit
     * @returns {Array<any>}
     */
    _collectByPresence(intervalSet, rules, predicate, emit) {
        const out = [];
        for (const r of rules) if (predicate(r, intervalSet)) out.push(emit(r));
        return out;
    }

    calculateConfidence(intervals) {
        return ChordUtils.getQualityByIntervals(intervals) ? 0.9 : 0.6;
    }
}

// (No explicit exports to keep globals available in script-tag usage)

