package com.example.employeemanagement.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
public class MeetingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "attendance_id")
    private Attendance attendance;

    private LocalTime meetingStart;
    private LocalTime meetingEnd;
    private Long duration; // in minutes

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Attendance getAttendance() { return attendance; }
    public void setAttendance(Attendance attendance) { this.attendance = attendance; }

    public LocalTime getMeetingStart() { return meetingStart; }
    public void setMeetingStart(LocalTime meetingStart) { this.meetingStart = meetingStart; }

    public LocalTime getMeetingEnd() { return meetingEnd; }
    public void setMeetingEnd(LocalTime meetingEnd) { this.meetingEnd = meetingEnd; }

    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
}
