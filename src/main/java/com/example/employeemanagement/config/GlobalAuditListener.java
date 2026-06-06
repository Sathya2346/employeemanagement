package com.example.employeemanagement.config;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.service.AuditService;
import com.example.employeemanagement.util.BeanUtil;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;

public class GlobalAuditListener {

    @PostPersist
    public void onPostPersist(Object entity) {
        logAction(entity, "CREATE");
    }

    @PostUpdate
    public void onPostUpdate(Object entity) {
        logAction(entity, "UPDATE");
    }

    @PostRemove
    public void onPostRemove(Object entity) {
        logAction(entity, "DELETE");
    }

    private void logAction(Object entity, String action) {
        AuditService auditService = BeanUtil.getBean(AuditService.class);
        String entityName = entity.getClass().getSimpleName();
        String entityId = "N/A";
        String details = entity.toString();

        if (entity instanceof Employee) {
            entityId = String.valueOf(((Employee) entity).getId());
        } else if (entity instanceof Leave) {
            entityId = String.valueOf(((Leave) entity).getId());
        }

        auditService.log(entityName, entityId, action, details);
    }
}
