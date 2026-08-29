#!/usr/bin/env python3
"""
EMS Meeting Auto-Detect Companion
Monitors desktop meeting apps (Teams, Zoom, Google Meet) and reports
meeting status to the EMS server automatically.

Requirements: pip install psutil requests
Usage: python meeting_monitor.py
"""

import os
import sys
import json
import time
import logging
import platform
import subprocess
from datetime import datetime

try:
    import psutil
except ImportError:
    print("ERROR: psutil is required. Install with: pip install psutil")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("ERROR: requests is required. Install with: pip install requests")
    sys.exit(1)

# ─── Configuration ──────────────────────────────────────────────
CONFIG = {
    "server_url": os.getenv("EMS_SERVER_URL", "http://localhost:8085"),
    "employee_id": int(os.getenv("EMS_EMPLOYEE_ID", "2")),
    "poll_interval": int(os.getenv("EMS_POLL_INTERVAL", "10")),
    "confidence_threshold": float(os.getenv("EMS_CONFIDENCE_THRESHOLD", "0.6")),
    "heartbeat_interval": int(os.getenv("EMS_HEARTBEAT_INTERVAL", "30")),
}

# ─── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("EMS-MeetingMonitor")

# ─── Meeting App Detection ──────────────────────────────────────

# Process names (case-insensitive) that indicate a meeting app
MEETING_PROCESSES = {
    # Microsoft Teams
    "teams": ["teams.exe", "teams"],
    # Zoom
    "zoom": ["zoom.exe", "zoom", "zoommtg.exe"],
    # Google Meet (Chrome/Edge with specific URL)
    "google_meet": ["chrome.exe", "msedge.exe", "googlechrome"],
    # Webex
    "webex": ["webex.exe", "webexmtg.exe", "cisco webex meetings"],
    # Skype
    "skype": ["skype.exe", "skype"],
    # Discord (voice/video calls)
    "discord": ["discord.exe", "discord"],
}

# Window title keywords that indicate an active meeting (platform-specific)
MEETING_WINDOW_KEYWORDS = [
    "meeting",
    "in call",
    "call in progress",
    "calling",
    "video call",
    "audio call",
    "live meeting",
    "presenting",
    "sharing screen",
    "screen sharing",
    "waiting for others",
    "you're the only one",
    "invite others",
    "meeting (",
    "teams meeting",
    "zoom meeting",
    "webex meeting",
    # Teams-specific
    "microsoft teams",
    # Zoom-specific
    "zoom",
]

# Window title keywords that indicate NOT in a meeting (lobby, etc.)
NOT_IN_MEETING_KEYWORDS = [
    "sign in",
    "login",
    "loading",
    "starting",
    "connecting",
]


class MeetingDetector:
    """Detects if the user is currently in a meeting using multiple signals."""

    def __init__(self):
        self.is_windows = platform.system() == "Windows"
        self.is_macos = platform.system() == "Darwin"
        self.is_linux = platform.system() == "Linux"
        self._last_in_meeting = False

    def detect_process_signal(self) -> tuple[float, str]:
        """Check if any meeting app processes are running."""
        found_apps = []

        for app_name, process_names in MEETING_PROCESSES.items():
            for proc in psutil.process_iter(["name", "pid"]):
                try:
                    proc_name = proc.info["name"]
                    if proc_name and any(
                        pn.lower() in proc_name.lower() for pn in process_names
                    ):
                        found_apps.append(app_name)
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue

        if not found_apps:
            return 0.0, "No meeting app running"

        # Higher score if multiple meeting apps are running
        score = min(0.3 + (len(found_apps) - 1) * 0.1, 0.5)
        return score, f"Meeting apps: {', '.join(found_apps)}"

    def detect_window_signal(self) -> tuple[float, str]:
        """Check if a meeting window is active/focused."""
        if self.is_windows:
            return self._detect_windows_window()
        elif self.is_macos:
            return self._detect_macos_window()
        else:
            return self._detect_linux_window()

    def _detect_windows_window(self) -> tuple[float, str]:
        """Windows: Use PowerShell to get foreground window title."""
        try:
            # PowerShell command to get the active window title
            cmd = (
                'powershell -Command "'
                "Add-Type @' using System.Runtime.InteropServices; "
                "public class Win32 { "
                "[DllImport(\\\"user32.dll\\\")] "
                "public static extern IntPtr GetForegroundWindow(); "
                "[DllImport(\\\"user32.dll\\\")] "
                "public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count); "
                '} @'; '
                "$hwnd = [Win32]::GetForegroundWindow(); "
                "$sb = New-Object System.Text.StringBuilder 256; "
                "[Win32]::GetWindowText($hwnd, $sb, 256) | Out-Null; "
                "$sb.ToString()\""
            )
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=5
            )
            title = result.stdout.strip().lower()

            if not title:
                return 0.0, "Cannot read window title"

            # Check for NOT in meeting keywords first
            for keyword in NOT_IN_MEETING_KEYWORDS:
                if keyword in title:
                    return 0.0, f"Active window: {title[:50]}..."

            # Check for meeting keywords
            for keyword in MEETING_WINDOW_KEYWORDS:
                if keyword in title:
                    return 0.4, f"Meeting window active: {title[:50]}..."

            return 0.0, f"Active window: {title[:50]}..."

        except Exception as e:
            return 0.0, f"Window detection error: {e}"

    def _detect_macos_window(self) -> tuple[float, str]:
        """macOS: Use osascript to get frontmost app."""
        try:
            cmd = 'osascript -e "tell application \\"System Events\\" to get name of first application process whose frontmost is true"'
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=5
            )
            app_name = result.stdout.strip().lower()

            if any(pn.lower().replace(".app", "") in app_name for app_list in MEETING_PROCESSES.values() for pn in app_list):
                return 0.35, f"Meeting app focused: {app_name}"

            return 0.0, f"Front app: {app_name}"
        except Exception:
            return 0.0, "Cannot detect macOS window"

    def _detect_linux_window(self) -> tuple[float, str]:
        """Linux: Use xdotool to get active window."""
        try:
            cmd = "xdotool getactivewindow getwindowname"
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=5
            )
            title = result.stdout.strip().lower()

            for keyword in MEETING_WINDOW_KEYWORDS:
                if keyword in title:
                    return 0.4, f"Meeting window: {title[:50]}..."

            return 0.0, f"Window: {title[:50]}..."
        except Exception:
            return 0.0, "Cannot detect Linux window"

    def detect_meeting(self) -> tuple[bool, float, str]:
        """
        Multi-signal meeting detection.
        Returns: (in_meeting: bool, confidence: float, reason: str)
        """
        process_score, process_reason = self.detect_process_signal()
        window_score, window_reason = self.detect_window_signal()

        # Combined confidence
        confidence = process_score + window_score
        reasons = [process_reason, window_reason]

        in_meeting = confidence >= CONFIG["confidence_threshold"]

        # Debounce: require sustained detection to avoid flickering
        if in_meeting and not self._last_in_meeting:
            # Need at least one more check to confirm
            self._last_in_meeting = True
            return False, confidence, f"Detected (confirming): {'; '.join(reasons)}"

        self._last_in_meeting = in_meeting
        return in_meeting, confidence, "; ".join(reasons)


class MeetingMonitor:
    """Monitors meeting status and reports to EMS server."""

    def __init__(self):
        self.detector = MeetingDetector()
        self.server_url = CONFIG["server_url"]
        self.employee_id = CONFIG["employee_id"]
        self.in_meeting = False
        self.last_heartbeat = 0
        self.running = True

    def report_status(self, status: str):
        """Send meeting status to the EMS server."""
        url = f"{self.server_url}/api/attendance/meeting-status/{self.employee_id}"
        payload = {
            "status": status,
            "platform": f"desktop ({platform.system()})",
            "meetingLink": None,
        }
        try:
            resp = requests.post(url, json=payload, timeout=5)
            if resp.status_code == 200:
                log.info(f"Reported status: {status}")
            else:
                log.warning(f"Server returned {resp.status_code}: {resp.text}")
        except requests.ConnectionError:
            log.warning(f"Cannot connect to EMS server at {self.server_url}")
        except Exception as e:
            log.error(f"Failed to report status: {e}")

    def send_heartbeat(self):
        """Send heartbeat to keep meeting session alive."""
        url = f"{self.server_url}/api/attendance/meeting-heartbeat/{self.employee_id}"
        try:
            resp = requests.post(url, timeout=5)
            if resp.status_code == 200:
                log.info("Heartbeat sent")
                self.last_heartbeat = time.time()
        except Exception:
            pass  # Silent fail for heartbeat

    def run(self):
        """Main monitoring loop."""
        log.info("=" * 50)
        log.info("EMS Meeting Auto-Detect Companion")
        log.info(f"Server: {self.server_url}")
        log.info(f"Employee ID: {self.employee_id}")
        log.info(f"Poll interval: {CONFIG['poll_interval']}s")
        log.info(f"Confidence threshold: {CONFIG['confidence_threshold']}")
        log.info("=" * 50)
        log.info("Monitoring for meeting activity... Press Ctrl+C to stop.")

        while self.running:
            try:
                in_meeting, confidence, reason = self.detector.detect_meeting()

                if in_meeting and not self.in_meeting:
                    # Started a meeting
                    log.info(f"🟢 MEETING DETECTED (confidence: {confidence:.2f})")
                    log.info(f"   Reason: {reason}")
                    self.in_meeting = True
                    self.report_status("in_meeting")

                elif not in_meeting and self.in_meeting:
                    # Meeting ended
                    log.info(f"🔴 MEETING ENDED")
                    log.info(f"   Reason: {reason}")
                    self.in_meeting = False
                    self.report_status("not_in_meeting")

                elif self.in_meeting:
                    # Still in meeting — send heartbeat if needed
                    now = time.time()
                    if now - self.last_heartbeat >= CONFIG["heartbeat_interval"]:
                        self.send_heartbeat()

                # Log status periodically
                if in_meeting:
                    log.debug(
                        f"Still in meeting (confidence: {confidence:.2f}) — {reason}"
                    )

            except KeyboardInterrupt:
                log.info("\nShutting down...")
                if self.in_meeting:
                    self.report_status("not_in_meeting")
                self.running = False
                break
            except Exception as e:
                log.error(f"Monitor error: {e}")

            time.sleep(CONFIG["poll_interval"])


if __name__ == "__main__":
    # Allow overriding employee ID from command line
    if len(sys.argv) > 1:
        try:
            CONFIG["employee_id"] = int(sys.argv[1])
        except ValueError:
            print(f"Usage: python {sys.argv[0]} [employee_id]")
            sys.exit(1)

    monitor = MeetingMonitor()
    monitor.run()
