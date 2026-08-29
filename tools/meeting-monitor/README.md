# EMS Meeting Auto-Detect Companion

This script runs alongside the EMS web app and automatically detects when you join a Microsoft Teams or Zoom meeting on your desktop.

## How it works

1. **Process Detection**: Monitors running processes for Teams/Zoom/Google Meet activity
2. **Window Detection**: Checks if a meeting window is in focus (title contains "Meeting", "In Call", etc.)
3. **Audio Detection** (optional): Monitors microphone activity to confirm active meetings
4. **Heartbeat**: Sends periodic heartbeats to the EMS server while in a meeting
5. **Auto-Start/Stop**: Automatically starts and ends meeting tracking on the server

## Requirements

```bash
pip install psutil requests
```

## Setup

1. Make sure the EMS Spring Boot server is running on `http://localhost:8085`
2. Set your employee ID in the script or via environment variable:
   ```bash
   export EMS_EMPLOYEE_ID=2
   ```
3. Run the monitor:
   ```bash
   python meeting_monitor.py
   ```

## Supported Platforms

- **Windows**: Detects Teams, Zoom, Google Meet (browser), Webex
- **macOS**: Same detection using `psutil`
- **Linux**: Same detection using `psutil`

## How Detection Works

The script uses a multi-signal approach:

| Signal | Description | Weight |
|--------|-------------|--------|
| Process running | Teams.exe, Zoom.exe are running | 30% |
| Meeting window title | Window contains "Meeting", "In Call", etc. | 40% |
| Audio activity | Microphone is active (not muted) | 30% |

When the combined confidence exceeds 60%, it reports "in meeting" to the server.

## Configuration

Edit `config.json` or set environment variables:

```json
{
  "server_url": "http://localhost:8085",
  "employee_id": 2,
  "poll_interval_seconds": 10,
  "confidence_threshold": 0.6,
  "enable_audio_detection": true
}
```
