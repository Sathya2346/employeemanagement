package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Settings;
import com.example.employeemanagement.model.ShiftTiming;
import com.example.employeemanagement.repository.SettingsRepository;
import com.example.employeemanagement.repository.ShiftTimingRepository;

@RestController
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "*")
public class SettingsRestController {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private ShiftTimingRepository shiftTimingRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Settings settings = settingsRepository.findById("default").orElseGet(() -> {
            Settings ds = new Settings();
            return settingsRepository.save(ds);
        });

        if (shiftTimingRepository.count() == 0) {
            shiftTimingRepository.save(new ShiftTiming("Morning (9:00 AM - 6:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("General (10:00 AM - 7:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("Evening (2:00 PM - 11:00 PM)"));
            shiftTimingRepository.save(new ShiftTiming("Night (10:00 PM - 6:00 AM)"));
            shiftTimingRepository.save(new ShiftTiming("Rotational"));
        }

        List<ShiftTiming> shiftTimings = shiftTimingRepository.findAll();

        Map<String, Object> map = new HashMap<>();
        map.put("settings", settings);
        map.put("shiftTimings", shiftTimings);
        return ResponseEntity.ok(map);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveSettings(@RequestBody Settings settingsForm) {
        settingsForm.setId("default");
        Settings saved = settingsRepository.save(settingsForm);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Configurations saved successfully");
        res.put("settings", saved);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/shift/add")
    public ResponseEntity<?> addShift(@RequestBody ShiftTiming shift) {
        ShiftTiming saved = shiftTimingRepository.save(shift);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("shift", saved);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/shift/update/{id}")
    public ResponseEntity<?> updateShift(@PathVariable Long id, @RequestBody ShiftTiming shift) {
        shift.setId(id);
        ShiftTiming saved = shiftTimingRepository.save(shift);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("shift", saved);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/shift/delete/{id}")
    public ResponseEntity<?> deleteShift(@PathVariable Long id) {
        shiftTimingRepository.deleteById(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }
}
