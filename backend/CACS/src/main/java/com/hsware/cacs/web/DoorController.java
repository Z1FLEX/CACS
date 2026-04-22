package com.hsware.cacs.web;

import com.hsware.cacs.dto.DoorDTO;
import com.hsware.cacs.dto.DoorCreateDTO;
import com.hsware.cacs.dto.DoorUpdateDTO;
import com.hsware.cacs.service.DoorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoorController {

    private final DoorService doorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE')")
    public List<DoorDTO> list() {
        return doorService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RESPONSABLE')")
    public ResponseEntity<DoorDTO> get(@PathVariable Integer id) {
        return doorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoorDTO> create(@RequestBody DoorCreateDTO body) {
        DoorDTO created = doorService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoorDTO> update(@PathVariable Integer id, @RequestBody DoorUpdateDTO body) {
        return doorService.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return doorService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
