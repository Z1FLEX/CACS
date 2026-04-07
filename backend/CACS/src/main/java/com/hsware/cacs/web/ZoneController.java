package com.hsware.cacs.web;

import com.hsware.cacs.dto.ZoneDTO;
import com.hsware.cacs.dto.ZoneCreateDTO;
import com.hsware.cacs.dto.ZoneUpdateDTO;
import com.hsware.cacs.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ZoneController {

    private final ZoneService zoneService;

    @GetMapping
    public List<ZoneDTO> list() {
        return zoneService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZoneDTO> get(@PathVariable Integer id) {
        return zoneService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ZoneDTO> create(@RequestBody ZoneCreateDTO body) {
        ZoneDTO created = zoneService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZoneDTO> update(@PathVariable Integer id, @RequestBody ZoneUpdateDTO body) {
        return zoneService.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return zoneService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
