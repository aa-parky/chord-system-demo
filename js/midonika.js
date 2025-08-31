/**
 * Midonika.js - A drop-in MIDI component for web applications
 * Provides MIDI input/output listing, live event monitoring, and API access
 */

class Midonika {
  constructor(containerId) {
    this.containerId = containerId;
    this.midiAccess = null;
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    this.ready = false;
    this.eventListeners = [];
    this.maxEvents = 50; // Maximum number of events to display
    this.events = [];

    void this.init();
  }

  async init() {
    try {
      // Request MIDI access
      this.midiAccess = await navigator.requestMIDIAccess();
      this.ready = true;

      // Set up event listeners
      this.midiAccess.onstatechange = () => {
        this.updateDeviceLists();
      };

      // Initial device list update
      this.updateDeviceLists();

      // Create and inject the UI
      this.createUI();
      this.updateUI();
    } catch (error) {
      console.error("Failed to get MIDI access:", error);
      this.createErrorUI();
    }
  }

  createUI() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID '${this.containerId}' not found`);
      return;
    }

    container.innerHTML = `
            <div class="midonika-container">
                <div class="midonika-header">
                    <span class="midonika-status" id="midonika-status">MIDI Ready</span>
                    <button class="midonika-clear-btn" id="midonika-clear">Clear</button>
                </div>
                
                <div class="midonika-section">
                    <h4>MIDI Inputs</h4>
                    <div class="midonika-device-list" id="midonika-inputs">
                        No inputs available
                    </div>
                </div>
                
                <div class="midonika-section">
                    <h4>MIDI Outputs</h4>
                    <div class="midonika-device-list" id="midonika-outputs">
                        No outputs available
                    </div>
                </div>
                
                <div class="midonika-section">
                    <h4>Live MIDI Events</h4>
                    <div class="midonika-events" id="midonika-events">
                        No events yet...
                    </div>
                </div>
            </div>
        `;

    // Add CSS styles
    this.injectCSS();

    // Set up a clear button
    document.getElementById("midonika-clear").addEventListener("click", () => {
      this.clearEvents();
    });
  }

  createErrorUI() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
            <div class="midonika-container">
                <div class="midonika-header">
                    <span class="midonika-status midonika-error">MIDI Not Available</span>
                </div>
                <div class="midonika-section">
                    <p>Web MIDI API is not supported or access was denied.</p>
                </div>
            </div>
        `;
    this.injectCSS();
  }

    injectCSS() {
        if (document.getElementById("midonika-styles")) return;

        const style = document.createElement("style");
        style.id = "midonika-styles";
        style.textContent = `
    .midonika-container {
      width: 400px;
      height: 300px;
      border: 1px solid #ccc;
      font-family: monospace;
      font-size: 12px;
      background: #f9f9f9;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .midonika-header {
      background: #333;
      color: white;
      padding: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .midonika-status {
      font-weight: bold;
    }

    .midonika-status.midonika-error {
      color: #ff6b6b;
    }

    .midonika-clear-btn {
      background: #666;
      color: white;
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 10px;
    }

    .midonika-clear-btn:hover {
      background: #888;
    }

    /* Sections */
    .midonika-section {
      padding: 8px;
      border-bottom: 1px solid #ddd;
      flex-shrink: 0;
    }

    /* FIX: Make last section grow and its child scroll */
    .midonika-container .midonika-section:last-of-type {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .midonika-container .midonika-section:last-of-type .midonika-events {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .midonika-section h4 {
      margin: 0 0 4px 0;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
    }

    .midonika-device-list {
      min-height: 20px;
      color: #333;
    }

    .midonika-device-item {
      padding: 2px 0;
      border-bottom: 1px solid #eee;
    }

    .midonika-device-item:last-child {
      border-bottom: none;
    }

    /* Scrollable Events */
    .midonika-events {
      background: #fff;
      padding: 4px;
      font-size: 10px;
      line-height: 1.2;
    }

    .midonika-event {
      padding: 1px 0;
      border-bottom: 1px solid #f0f0f0;
      word-break: break-all;
    }

    .midonika-event-time {
      color: #666;
      margin-right: 8px;
    }

    .midonika-event-data {
      color: #333;
    }

    /* Scrollbar styling */
    .midonika-events::-webkit-scrollbar {
      width: 6px;
    }

    .midonika-events::-webkit-scrollbar-track {
      background: #f0f0f0;
    }

    .midonika-events::-webkit-scrollbar-thumb {
      background: #bbb;
      border-radius: 3px;
    }

    .midonika-events::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
  `;

        document.head.appendChild(style);
    }

  updateDeviceLists() {
    if (!this.midiAccess) return;

    // Update inputs
    this.midiInputs.clear();
    for (let input of this.midiAccess.inputs.values()) {
      this.midiInputs.set(input.id, input);

      // Set up an event listener for this input
      input.onmidimessage = (event) => {
        this.handleMidiMessage(event, input.name);
      };
    }

    // Update outputs
    this.midiOutputs.clear();
    for (let output of this.midiAccess.outputs.values()) {
      this.midiOutputs.set(output.id, output);
    }

    this.updateUI();
  }

  updateUI() {
    // Update inputs list
    const inputsContainer = document.getElementById("midonika-inputs");
    if (inputsContainer) {
      if (this.midiInputs.size === 0) {
        inputsContainer.innerHTML = "No inputs available";
      } else {
        inputsContainer.innerHTML = Array.from(this.midiInputs.values())
          .map(
            (input) => `<div class="midonika-device-item">${input.name}</div>`,
          )
          .join("");
      }
    }

    // Update outputs list
    const outputsContainer = document.getElementById("midonika-outputs");
    if (outputsContainer) {
      if (this.midiOutputs.size === 0) {
        outputsContainer.innerHTML = "No outputs available";
      } else {
        outputsContainer.innerHTML = Array.from(this.midiOutputs.values())
          .map(
            (output) =>
              `<div class="midonika-device-item">${output.name}</div>`,
          )
          .join("");
      }
    }

    // Update status
    const statusElement = document.getElementById("midonika-status");
    if (statusElement) {
      statusElement.textContent = this.ready ? "MIDI Ready" : "MIDI Not Ready";
      statusElement.className = this.ready
        ? "midonika-status"
        : "midonika-status midonika-error";
    }
  }

  handleMidiMessage(event, deviceName) {
    const data = Array.from(event.data);
    const timestamp = new Date().toLocaleTimeString();

    // Create an event object
    const midiEvent = {
      timestamp: timestamp,
      device: deviceName,
      data: data,
      raw: event.data,
    };

    // Add to an events array
    this.events.unshift(midiEvent);

    // Limit events array size
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Update events display
    this.updateEventsDisplay();

    // Notify listeners
    this.notifyEventListeners(midiEvent);
  }

  updateEventsDisplay() {
    const eventsContainer = document.getElementById("midonika-events");
    if (!eventsContainer) return;

    if (this.events.length === 0) {
      eventsContainer.innerHTML = "No events yet...";
      return;
    }

    eventsContainer.innerHTML = this.events
      .map(
        (event) => `
                <div class="midonika-event">
                    <span class="midonika-event-time">${event.timestamp}</span>
                    <span class="midonika-event-data">${event.device}: [${event.data.join(", ")}]</span>
                </div>
            `,
      )
      .join("");
  }

  clearEvents() {
    this.events = [];
    this.updateEventsDisplay();
  }

  // API Methods for external components

  /**
   * Check if MIDI is ready
   * @returns {boolean}
   */
  isReady() {
    return this.ready;
  }

  /**
   * Get all MIDI inputs
   * @returns {Array} Array of input objects with id, name, and reference
   */
  getInputs() {
    return Array.from(this.midiInputs.values()).map((input) => ({
      id: input.id,
      name: input.name,
      state: input.state,
      connection: input.connection,
      reference: input,
    }));
  }

  /**
   * Get all MIDI outputs
   * @returns {Array} Array of output objects with id, name, and reference
   */
  getOutputs() {
    return Array.from(this.midiOutputs.values()).map((output) => ({
      id: output.id,
      name: output.name,
      state: output.state,
      connection: output.connection,
      reference: output,
    }));
  }

  /**
   * Get recent MIDI events
   * @param {number|null} count - Number of recent events to return (default: all)
   * @returns {Array} Array of MIDI event objects
   */
  getRecentEvents(count = null) {
    if (count === null) {
      return [...this.events];
    }
    return this.events.slice(0, count);
  }

  /**
   * Add event listener for MIDI messages
   * @param {Function} callback - Function to call when MIDI message received
   */
  addEventListener(callback) {
    this.eventListeners.push(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback - Function to remove
   */
  removeEventListener(callback) {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Send MIDI a message to output
   * @param {string} outputId - ID of the output device
   * @param {Array} data - MIDI data array
   */
  sendMessage(outputId, data) {
    const output = this.midiOutputs.get(outputId);
    if (output) {
      output.send(data);
    }
  }

  /**
   * Get MIDI access object (for advanced usage)
   * @returns {MIDIAccess|null}
   */
  getMidiAccess() {
    return this.midiAccess;
  }

  notifyEventListeners(event) {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in MIDI event listener:", error);
      }
    });
  }
}

// Export for use in other modules
if (
  typeof globalThis !== "undefined" &&
  globalThis.module &&
  globalThis.module.exports
) {
  globalThis.module.exports = Midonika;
}

// Global access
window.Midonika = Midonika;
