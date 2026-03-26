package com.hyundai.dms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeadVolumeDTO {
    private String dealerName;
    private long count;
}
