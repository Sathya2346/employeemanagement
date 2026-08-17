package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.employeemanagement.model.EmailTemplate;
import com.example.employeemanagement.service.EmailTemplateService;

@RestController
@RequestMapping("/api/admin/email-templates")
@CrossOrigin(origins = "*")
public class EmailTemplateRestController {

    @Autowired
    private EmailTemplateService emailTemplateService;

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        return ResponseEntity.ok(emailTemplateService.getAllTemplates());
    }

    @GetMapping("/{key}")
    public ResponseEntity<?> getTemplateByKey(@PathVariable String key) {
        return emailTemplateService.getTemplateByKey(key)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTemplate(@PathVariable Long id, @RequestBody EmailTemplate updatedTemplate) {
        try {
            EmailTemplate saved = emailTemplateService.updateTemplate(id, updatedTemplate);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Email template updated successfully");
            res.put("template", saved);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
