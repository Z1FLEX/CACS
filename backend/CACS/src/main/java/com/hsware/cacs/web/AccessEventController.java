package com.hsware.cacs.web;

import com.hsware.cacs.dto.AccessSwipeRequestDTO;
import com.hsware.cacs.dto.AccessSwipeResponseDTO;
import com.hsware.cacs.service.AccessDecisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/access-events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccessEventController {

    private final AccessDecisionService accessDecisionService;

    @PostMapping("/swipe")
    public ResponseEntity<AccessSwipeResponseDTO> swipe(@Valid @RequestBody AccessSwipeRequestDTO request) {
        return ResponseEntity.ok(accessDecisionService.evaluateSwipe(request));
    }
}
