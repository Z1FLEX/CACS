package com.hsware.cacs.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DeviceType {
    READER,
    CONTROLLER,
    LOCK;

    @JsonCreator
    public static DeviceType fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Device type cannot be null");
        }
        try {
            return DeviceType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid device type: " + value + ". Valid values are: READER, CONTROLLER, LOCK");
        }
    }

    @JsonValue
    public String getName() {
        return this.name();
    }
}
