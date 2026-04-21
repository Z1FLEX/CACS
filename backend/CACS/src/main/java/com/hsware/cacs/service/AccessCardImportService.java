package com.hsware.cacs.service;

import com.hsware.cacs.dto.AccessCardImportResultDTO;
import com.hsware.cacs.entity.AccessCard;
import com.hsware.cacs.repository.AccessCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AccessCardImportService {

    private final AccessCardRepository accessCardRepository;
    private final CardHashingService cardHashingService;

    public AccessCardImportService(AccessCardRepository accessCardRepository, CardHashingService cardHashingService) {
        this.accessCardRepository = accessCardRepository;
        this.cardHashingService = cardHashingService;
    }

    @Transactional
    public AccessCardImportResultDTO importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }

        List<String> rawUids = readRawUids(file);
        if (rawUids.isEmpty()) {
            throw new IllegalArgumentException("CSV file does not contain any card UIDs");
        }

        Map<String, String> hashesToRawUids = new LinkedHashMap<>();
        for (String rawUid : rawUids) {
            String hash = cardHashingService.hash(rawUid);
            String previous = hashesToRawUids.putIfAbsent(hash, rawUid);
            if (previous != null) {
                throw new IllegalArgumentException("Duplicate card detected in CSV import");
            }
        }

        List<String> hashes = new ArrayList<>(hashesToRawUids.keySet());
        List<AccessCard> existingCards = accessCardRepository.findByNumInAndDeletedAtIsNull(hashes);
        if (!existingCards.isEmpty()) {
            throw new IllegalArgumentException("One or more cards already exist");
        }

        List<AccessCard> cardsToCreate = hashes.stream()
            .map(hash -> AccessCard.builder()
                .uid(null)
                .num(hash)
                .status("INACTIVE")
                .build())
            .toList();

        accessCardRepository.saveAll(cardsToCreate);
        return new AccessCardImportResultDTO(cardsToCreate.size());
    }

    private List<String> readRawUids(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(
            new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            List<String> lines = reader.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .toList();

            if (lines.isEmpty()) {
                return List.of();
            }

            List<String> headers = parseCsvLine(lines.getFirst()).stream()
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .toList();
            int uidIndex = findUidColumnIndex(headers);
            if (uidIndex < 0) {
                throw new IllegalArgumentException("CSV must contain a UID column");
            }

            List<String> rawUids = new ArrayList<>();
            for (int lineIndex = 1; lineIndex < lines.size(); lineIndex++) {
                List<String> values = parseCsvLine(lines.get(lineIndex));
                if (uidIndex >= values.size()) {
                    continue;
                }

                String rawUid = values.get(uidIndex).trim();
                if (!rawUid.isBlank()) {
                    rawUids.add(rawUid);
                }
            }
            return rawUids;
        } catch (IOException exception) {
            throw new IllegalArgumentException("Unable to read CSV file", exception);
        }
    }

    private int findUidColumnIndex(List<String> headers) {
        for (int index = 0; index < headers.size(); index++) {
            String header = headers.get(index);
            if (header.contains("uid") || header.contains("card") || header.contains("number")) {
                return index;
            }
        }
        return -1;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder currentValue = new StringBuilder();
        boolean insideQuotes = false;

        for (int index = 0; index < line.length(); index++) {
            char currentChar = line.charAt(index);
            if (currentChar == '"') {
                insideQuotes = !insideQuotes;
                continue;
            }

            if (currentChar == ',' && !insideQuotes) {
                values.add(currentValue.toString());
                currentValue.setLength(0);
                continue;
            }

            currentValue.append(currentChar);
        }

        values.add(currentValue.toString());
        return values;
    }
}
