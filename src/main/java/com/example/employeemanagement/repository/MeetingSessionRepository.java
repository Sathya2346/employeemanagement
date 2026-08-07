package com.example.employeemanagement.repository;

import com.example.employeemanagement.model.MeetingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingSessionRepository extends JpaRepository<MeetingSession, Long> {
    List<MeetingSession> findByAttendanceId(Long attendanceId);
    Optional<MeetingSession> findByAttendanceIdAndMeetingEndIsNull(Long attendanceId);
}
