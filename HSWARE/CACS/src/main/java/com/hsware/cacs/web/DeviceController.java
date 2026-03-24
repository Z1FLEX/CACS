package com.hsware.cacs.web;

import com.hsware.cacs.dto.DeviceDTO;
import com.hsware.cacs.dto.DeviceCreateDTO;
import com.hsware.cacs.dto.DeviceUpdateDTO;
import com.hsware.cacs.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public List<DeviceDTO> list() {
        return deviceService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceDTO> get(@PathVariable Integer id) {
        return deviceService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DeviceDTO> create(@RequestBody DeviceCreateDTO body) {
        DeviceDTO created = deviceService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceDTO> update(@PathVariable Integer id, @RequestBody DeviceUpdateDTO body) {
        return deviceService.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return deviceService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
