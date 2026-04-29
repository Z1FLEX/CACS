package com.hsware.cacs.web;

import com.hsware.cacs.dto.ScheduleDTO;
import com.hsware.cacs.dto.ScheduleCreateDTO;
import com.hsware.cacs.dto.ScheduleUpdateDTO;
import com.hsware.cacs.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<ScheduleDTO> list() {
        return scheduleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleDTO> get(@PathVariable Integer id) {
        return scheduleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScheduleDTO> create(@Valid @RequestBody ScheduleCreateDTO body) {
        ScheduleDTO created = scheduleService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleDTO> update(@PathVariable Integer id, @Valid @RequestBody ScheduleUpdateDTO body) {
        return scheduleService.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return scheduleService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
