package com.example.employeemanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.employeemanagement.model.Settings;
import com.example.employeemanagement.model.ShiftTiming;
import com.example.employeemanagement.repository.SettingsRepository;
import com.example.employeemanagement.repository.ShiftTimingRepository;
import com.example.employeemanagement.service.NotificationService;

import java.util.List;

@Controller
@RequestMapping("/admin/settings")
public class AdminSettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private ShiftTimingRepository shiftTimingRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public String showSettings(Model model) {
        Settings settings = settingsRepository.findById("default").orElseGet(() -> {
            Settings ds = new Settings();
            return settingsRepository.save(ds);
        });

        // Ensure default email subjects and bodies are auto-populated if previously null in DB
        boolean updated = false;
        if (settings.getWelcomeEmailSubject() == null) { settings.setWelcomeEmailSubject("🎉 Welcome to Employee Management System — Your Login Credentials"); updated = true; }
        if (settings.getWelcomeEmailBody() == null) { settings.setWelcomeEmailBody("Hello,\n\nYour employee account has been created. Use the credentials below to log in:\n\n  Username  : {username}\n  Email     : {email}\n  Password  : {password}\n\nAfter logging in, please complete your onboarding profile.\n\nRegards,\nHR Team"); updated = true; }
        if (settings.getReceiptEmailSubject() == null) { settings.setReceiptEmailSubject("📋 Onboarding Details Submitted Successfully"); updated = true; }
        if (settings.getReceiptEmailBody() == null) { settings.setReceiptEmailBody("Dear {name},\n\nWe have successfully received your onboarding details. The HR/Admin team will review your submission shortly.\n\nRegards,\nHR Team"); updated = true; }
        if (settings.getRejectionEmailSubject() == null) { settings.setRejectionEmailSubject("⚠️ Onboarding — Action Required"); updated = true; }
        if (settings.getRejectionEmailBody() == null) { settings.setRejectionEmailBody("Dear {name},\n\nThe following fields in your onboarding submission need corrections:\n\n{rejections}\n\nPlease correct these and resubmit.\n\nRegards,\nHR Team"); updated = true; }
        if (settings.getApprovalEmailSubject() == null) { settings.setApprovalEmailSubject("✅ Onboarding Fully Approved!"); updated = true; }
        if (settings.getApprovalEmailBody() == null) { settings.setApprovalEmailBody("Dear {name},\n\nAll your details have been fully approved by HR. You now have complete access to the portal.\n\nRegards,\nHR Team"); updated = true; }
        if (settings.getOtpEmailSubject() == null) { settings.setOtpEmailSubject("🔐 Employee Management - Password Reset OTP"); updated = true; }
        if (settings.getOtpEmailBody() == null) { settings.setOtpEmailBody("Your password reset OTP is: {otp}. It is valid for {expiry_minutes} minutes."); updated = true; }
        if (settings.getAdminAlertEmailSubject() == null) { settings.setAdminAlertEmailSubject("📋 Onboarding Details Submitted - {name}"); updated = true; }
        if (settings.getAdminAlertEmailBody() == null) { settings.setAdminAlertEmailBody("Employee {name} ({email}) has submitted onboarding details for review.\n\nDetails Submitted:\n{summary}\n\nRegards,\nEMS System"); updated = true; }
        if (settings.getLeaveApprovedEmailSubject() == null) { settings.setLeaveApprovedEmailSubject("✅ Leave Request Approved - {leave_type}"); updated = true; }
        if (settings.getLeaveApprovedEmailBody() == null) { settings.setLeaveApprovedEmailBody("Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been approved.\n\nRegards,\nHR Team"); updated = true; }
        if (settings.getLeaveRejectedEmailSubject() == null) { settings.setLeaveRejectedEmailSubject("❌ Leave Request Rejected - {leave_type}"); updated = true; }
        if (settings.getLeaveRejectedEmailBody() == null) { settings.setLeaveRejectedEmailBody("Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been rejected.\n\nRegards,\nHR Team"); updated = true; }

        if (updated) {
            settingsRepository.save(settings);
        }
        
        // Auto-initialize default shift timings if table is empty
        if (shiftTimingRepository.count() == 0) {
            shiftTimingRepository.save(new ShiftTiming("Morning (9:00 AM - 6:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("General (10:00 AM - 7:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("Evening (2:00 PM - 11:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("Night (10:00 PM - 6:00 AM)"));
            shiftTimingRepository.save(new ShiftTiming("Rotational"));
        }

        model.addAttribute("settings", settings);
        model.addAttribute("shiftTimings", shiftTimingRepository.findAll());
        model.addAttribute("newShift", new ShiftTiming());
        model.addAttribute("adminUnreadCount", notificationService.countUnreadForAdmin());
        return "admin/settings";
    }

    @PostMapping("/save")
    public String saveSettings(@ModelAttribute("settings") Settings settingsForm, RedirectAttributes redirectAttributes) {
        settingsForm.setId("default");
        settingsRepository.save(settingsForm);
        redirectAttributes.addFlashAttribute("successMessage", "Settings updated successfully!");
        return "redirect:/admin/settings";
    }

    @PostMapping("/shifts/save")
    public String saveShift(@ModelAttribute("newShift") ShiftTiming shift, RedirectAttributes redirectAttributes) {
        shiftTimingRepository.save(shift);
        redirectAttributes.addFlashAttribute("successMessage", "Shift timing added successfully!");
        return "redirect:/admin/settings";
    }

    @PostMapping("/shifts/edit/{id}")
    public String editShift(@PathVariable("id") Long id, @RequestParam("name") String name, RedirectAttributes redirectAttributes) {
        ShiftTiming shift = shiftTimingRepository.findById(id).orElse(null);
        if (shift != null) {
            shift.setName(name);
            shiftTimingRepository.save(shift);
            redirectAttributes.addFlashAttribute("successMessage", "Shift timing updated successfully!");
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "Shift timing not found.");
        }
        return "redirect:/admin/settings";
    }

    @PostMapping("/shifts/delete/{id}")
    public String deleteShift(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        if (shiftTimingRepository.existsById(id)) {
            shiftTimingRepository.deleteById(id);
            redirectAttributes.addFlashAttribute("successMessage", "Shift timing deleted successfully!");
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "Shift timing not found.");
        }
        return "redirect:/admin/settings";
    }
}
