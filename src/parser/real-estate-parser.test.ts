import { describe, expect, it } from "vitest";

import { parseRealEstateMessage } from "./real-estate-parser";

describe("parseRealEstateMessage", () => {
  it("creates a listing result for a complete real estate sale message", () => {
    const result = parseRealEstateMessage(`VENDO CASA

3 quartos
Jardim Europa
Londrina - PR

R$ 320.000

Contato: (43) 99999-9999`);

    expect(result).toEqual({
      listing: {
        bedrooms: 3,
        city: "Londrina",
        contactPhone: "(43) 99999-9999",
        intent: "sale",
        locationText: "Jardim Europa, Londrina - PR",
        neighborhood: "Jardim Europa",
        priceAmount: 320000,
        propertyType: "house",
        state: "PR",
      },
      reason: null,
      status: "listing_created",
    });
  });

  it("marks real estate messages without price as unstructured", () => {
    const result = parseRealEstateMessage(`VENDO APARTAMENTO

Centro
Londrina - PR

2 quartos`);

    expect(result).toEqual({
      listing: null,
      reason: "missing_price",
      status: "unstructured",
    });
  });

  it("rejects messages outside the real estate domain", () => {
    const result = parseRealEstateMessage("Backend Developer remoto para startup");

    expect(result).toEqual({
      listing: null,
      reason: "unsupported_domain",
      status: "rejected",
    });
  });
});
