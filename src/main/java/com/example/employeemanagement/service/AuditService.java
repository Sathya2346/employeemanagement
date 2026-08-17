package com.example.employeemanagement.service;

import com.example.employeemanagement.model.AuditLog;
import com.example.employeemanagement.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditService {

    @Autowired
    private AuditRepository auditRepository;

    public void log(String entityName, String entityId, String action, String details) {
        String user = SecurityContextHolder.getContext().getAuthentication() != null 
                      ? SecurityContextHolder.getContext().getAuthentication().getName() 
                      : "SYSTEM";

        AuditLog log = new AuditLog();
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setPerformedBy(user);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details);

        auditRepository.save(log);
    }
}
