package com.example.employeemanagement.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Holiday;
import com.example.employeemanagement.repository.HolidayRepository;
@Service
public class HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    // Initialize default holidays if DB empty
    public void initializeDefaultHolidays() {
        if (holidayRepository.count() == 0) {
            int year = LocalDate.now().getYear();
            holidayRepository.saveAll(List.of(
                new Holiday("New Year’s Day", LocalDate.of(year, 1, 1)),
                new Holiday("Republic Day", LocalDate.of(year, 1, 26)),
                new Holiday("Holi", LocalDate.of(year, 3, 17)),
                new Holiday("Independence Day", LocalDate.of(year, 8, 15)),
                new Holiday("Gandhi Jayanti", LocalDate.of(year, 10, 2)),
                new Holiday("Diwali", LocalDate.of(year, 10, 22)),
                new Holiday("Christmas", LocalDate.of(year, 12, 25))
            ));
        }
    }

    // ✅ Get all holidays in this year
    public List<Holiday> getAllHolidaysThisYear() {
        int year = LocalDate.now().getYear();
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return holidayRepository.findByHolidayDateBetween(start, end);
    }

    // ✅ Get remaining (future) holidays in this year
    public List<Holiday> getRemainingHolidays() {
        LocalDate today = LocalDate.now();
        return getAllHolidaysThisYear().stream()
                .filter(h -> !h.getHolidayDate().isBefore(today)) // remove past holidays
                .collect(Collectors.toList());
    }

    // ✅ Get count of remaining holidays
    public long getRemainingHolidayCount() {
        return getRemainingHolidays().size();
    }
}
