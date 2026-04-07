package com.hsware.cacs.web;

import com.hsware.cacs.dto.TimeSlotDTO;
import com.hsware.cacs.dto.TimeSlotCreateDTO;
import com.hsware.cacs.dto.TimeSlotUpdateDTO;
import com.hsware.cacs.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules/{scheduleId}/timeslots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimeSlotController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<TimeSlotDTO> getTimeSlotsBySchedule(@PathVariable Integer scheduleId) {
        return scheduleService.getTimeSlotsBySchedule(scheduleId);
    }

    @PostMapping
    public ResponseEntity<TimeSlotDTO> createTimeSlot(@PathVariable Integer scheduleId, @RequestBody TimeSlotCreateDTO body) {
        TimeSlotDTO created = scheduleService.createTimeSlot(scheduleId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

@RestController
@RequestMapping("/api/timeslots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
class TimeSlotManagementController {

    private final ScheduleService scheduleService;

    @PutMapping("/{id}")
    public ResponseEntity<TimeSlotDTO> updateTimeSlot(@PathVariable Integer id, @RequestBody TimeSlotUpdateDTO body) {
        return scheduleService.updateTimeSlot(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable Integer id) {
        return scheduleService.deleteTimeSlot(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
