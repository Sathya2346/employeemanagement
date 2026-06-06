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
