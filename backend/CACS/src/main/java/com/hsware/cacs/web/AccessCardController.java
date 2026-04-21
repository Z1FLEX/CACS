package com.hsware.cacs.web;

import com.hsware.cacs.dto.AccessCardDTO;
import com.hsware.cacs.dto.AccessCardCreateDTO;
import com.hsware.cacs.dto.AccessCardImportResultDTO;
import com.hsware.cacs.dto.AccessCardUpdateDTO;
import com.hsware.cacs.service.AccessCardService;
import com.hsware.cacs.service.AccessCardImportService;
import com.hsware.cacs.service.CardEnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/access-cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccessCardController {

    private final AccessCardService accessCardService;
    private final AccessCardImportService accessCardImportService;
    private final CardEnrollmentService cardEnrollmentService;

    @GetMapping
    public List<AccessCardDTO> list() {
        return accessCardService.findAll();
    }

    @GetMapping("/enrollment-mode")
    public ResponseEntity<com.hsware.cacs.dto.AccessCardEnrollmentStatusDTO> enrollmentStatus() {
        return ResponseEntity.ok(cardEnrollmentService.getEnrollmentStatus());
    }

    @PostMapping("/enrollment-mode")
    public ResponseEntity<com.hsware.cacs.dto.AccessCardEnrollmentStatusDTO> armEnrollmentMode() {
        return ResponseEntity.ok(cardEnrollmentService.armEnrollmentMode());
    }

    @DeleteMapping("/enrollment-mode")
    public ResponseEntity<Void> clearEnrollmentMode() {
        cardEnrollmentService.clearEnrollmentMode();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessCardDTO> get(@PathVariable Integer id) {
        return accessCardService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AccessCardDTO> create(@Valid @RequestBody AccessCardCreateDTO body) {
        AccessCardDTO created = accessCardService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AccessCardImportResultDTO> importCards(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(accessCardImportService.importCsv(file));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccessCardDTO> update(@PathVariable Integer id, @Valid @RequestBody AccessCardUpdateDTO body) {
        return accessCardService.update(id, body)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return accessCardService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
