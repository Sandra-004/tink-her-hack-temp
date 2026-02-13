<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# RAKSHA – The Intelligent Guardian 🎯

## Basic Details

### Team Name: Yatna

### Team Members
- Member 1: Sandra Suresh Panicker - NSS College of Engineering, Palakkad
- Member 2: Kavya S Nair - NSS College of Engineering, Palakkad

### Hosted Project Link
[mention your project hosted link here]

### Project Description
Raksha is a sensor-driven mobile safety application designed to protect women in real-time using just a smartphone. It combines psychological deterrence, instant emergency alerting, and automated location sharing through gesture-based triggers.

Raksha resides on the device the user already protects: her phone.

Raksha transforms a regular phone into an intelligent guardian!

### The Problem statement
Women frequently share live locations out of fear, not convenience.

Existing safety solutions:

Require unlocking the phone

Depend on manual button presses

Use unreliable SMS systems

Provide no deterrence or evidence

In high-stress situations, fine motor skills degrade, making small panic buttons ineffective.

There is a need for a fast, discreet, intelligent safety mechanism that works instinctively.

Prevention is better than Cure; Evidence is better than Hearsay.


### The Solution
Raksha uses built-in smartphone sensors (Accelerometer + GPS + Audio system) to:

Detect a panic shake gesture

Trigger an authoritative deterrent audio

Automatically generate and send a WhatsApp SOS with live location

Instead of reacting after violence begins, Raksha creates perceived surveillance and immediate response.
---

## Technical Details

### Technologies/Components Used

**For Software:**
- Languages used: JavaScript
- Frameworks used: React Native (Expo)
- Libraries used:
  expo-sensors (Accelerometer access)

  expo-location (GPS retrieval)

  expo-av (Audio playback)
  
- Tools used: VS Code ,Git & GitHub, Expo Go, Android Device for Testing

**For Hardware:**
None.
Raksha is a software-first safety solution that leverages built-in smartphone sensors.
---

## Features

- Feature 1: Shake-to-Trigger Deterrence
  Double shake gesture activates emergency protocol instantly.
- Feature 2: Indian Dad Protocol
  Plays a loud authoritative pre-recorded voice message to simulate live tracking and immediate guardian presence.
- Feature 3: WhatsApp SOS with Live Location
  Automatically opens WhatsApp with pre-filled emergency message including Google Maps link.
- Feature 4: Dark Cockpit Panic UI
  Panic-optimized interface with large trigger zones and high-visibility emergency state.
---

## Implementation

### For Software:

#### Installation
```bash
npx create-expo-app raksha
cd raksha
npm install
npm install expo-sensors expo-location expo-av
```

#### Run
```bash
npx expo start
```
---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

![Screenshot1](Add screenshot 1 here with proper name)
Guard Mode activated with Dark Cockpit emergency UI

![Screenshot2](Add screenshot 2 here with proper name)
Accelerometer-based shake detection triggering deterrence

![Screenshot3](Add screenshot 3 here with proper name)
Automatic WhatsApp SOS with live Google Maps link

#### Diagrams

**System Architecture:**

![Architecture Diagram](https://i.ibb.co/fYXC1Z7W/architecture.png)

User Gesture
→ Accelerometer Listener (expo-sensors)
→ Trigger Engine
→ Audio Playback (expo-av)
→ Location Fetch (expo-location)
→ WhatsApp Deep Link

All logic runs locally on device. No backend required.

**Application Workflow:**
<img width="1536" height="1024" alt="workflow_image" src="https://github.com/user-attachments/assets/7ff3087e-c697-4fe4-bfe9-5deca5f351d0" />

![Workflow](docs/workflow.png)
User → Guard Mode ON → Shake → Deterrence → GPS Captured → SOS Sent → Help Notified.


---

## Additional Documentation



### For Mobile Apps:

#### App Flow Diagram

(docs/app-flow.<img width="1536" height="1024" alt="workflow" src="https://github.com/user-attachments/assets/37dd57e0-2e22-4b5b-aef7-2faea56b8b27" />

User → Guard Mode ON → Shake → Deterrence → SOS → Help Notified


#### Installation Guide

For Android (Expo Build):

Install Expo Go

Scan QR from terminal

Grant permissions

Activate Guard Mode

Test shake trigger

**Building from Source:**
```bash
# Android
npx expo build:android


---
```

**Available Commands:**
- `command1 [args]` - Description of what command1 does
- `command2 [args]` - Description of what command2 does
- `command3 [args]` - Description of what command3 does

**Options:**
- `-h, --help` - Show help message and exit
- `-v, --verbose` - Enable verbose output
- `-o, --output FILE` - Specify output file path
- `-c, --config FILE` - Specify configuration file
- `--version` - Show version information

**Examples:**

```bash
# Example 1: Basic usage
python script.py input.txt

# Example 2: With verbose output
python script.py -v input.txt

# Example 3: Specify output file
python script.py -o output.txt input.txt

# Example 4: Using configuration
python script.py -c config.json --verbose input.txt
```

#### Demo Output

**Example 1: Basic Processing**

**Input:**
```
This is a sample input file
with multiple lines of text
for demonstration purposes
```

**Command:**
```bash
python script.py sample.txt
```

**Output:**
```
Processing: sample.txt
Lines processed: 3
Characters counted: 86
Status: Success
Output saved to: output.txt
```

**Example 2: Advanced Usage**

**Input:**
```json
{
  "name": "test",
  "value": 123
}
```

**Command:**
```bash
python script.py -v --format json data.json
```

**Output:**
```
[VERBOSE] Loading configuration...
[VERBOSE] Parsing JSON input...
[VERBOSE] Processing data...
{
  "status": "success",
  "processed": true,
  "result": {
    "name": "test",
    "value": 123,
    "timestamp": "2024-02-07T10:30:00"
  }
}
[VERBOSE] Operation completed in 0.23s
```

---

## Project Demo

### Video
[Add your demo video link here - YouTube, Google Drive, etc.]

*Explain what the video demonstrates - key features, user flow, technical highlights*

### Additional Demos
[Add any extra demo materials/links - Live site, APK download, online demo, etc.]

---

## AI Tools Used (Optional - For Transparency Bonus)

If you used AI tools during development, document them here for transparency:

**Tool Used:** ChatGPT

Tool Used: ChatGPT
Purpose:

Code debugging assistance

Architecture structuring

README documentation optimization

Percentage of AI-generated code: ~20% (boilerplate logic suggestions only)

Human Contributions:

System design & safety logic planning

Gesture detection tuning

Audio trigger integration

WhatsApp deep linking implementation

UI/UX panic psychology design



---

## Team Contributions
Sandra Panicker:

Project ideation

Sensor logic implementation

Shake detection algorithm

WhatsApp integration

Pitch design & demo strategy

Kavya S Nair:

UI/UX design (Dark Cockpit)

Guard Mode state management

Audio trigger integration

Testing & stabilization

Documentation & visuals

## License

This project is licensed under the [LICENSE_NAME] License - see the [LICENSE](LICENSE) file for details.

**Common License Options:**
- MIT License (Permissive, widely used)
- Apache 2.0 (Permissive with patent grant)
- GPL v3 (Copyleft, requires derivative works to be open source)

---

Made with ❤️ at TinkerHub
