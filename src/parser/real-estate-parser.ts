export type ParserResultStatus = "listing_created" | "rejected" | "unstructured";

export type ParserResultReason =
  | "insufficient_information"
  | "missing_intent"
  | "missing_location"
  | "missing_price"
  | "missing_property_type"
  | "unsupported_domain";

export type PropertyListingIntent = "rental" | "sale";

export type PropertyListingType = "apartment" | "commercial" | "house" | "land";

export type ParsedPropertyListing = {
  bedrooms: number | null;
  city: string | null;
  contactPhone: string | null;
  intent: PropertyListingIntent;
  locationText: string;
  neighborhood: string | null;
  priceAmount: number;
  propertyType: PropertyListingType;
  state: string | null;
};

export type RealEstateParserResult = {
  listing: ParsedPropertyListing | null;
  reason: ParserResultReason | null;
  status: ParserResultStatus;
};

type ExtractedRealEstateFields = {
  bedrooms: number | null;
  city: string | null;
  contactPhone: string | null;
  intent: PropertyListingIntent | null;
  locationText: string | null;
  neighborhood: string | null;
  priceAmount: number | null;
  propertyType: PropertyListingType | null;
  state: string | null;
};

const realEstateTerms = [
  "aluga-se",
  "alugo",
  "apartamento",
  "apto",
  "casa",
  "comercial",
  "imovel",
  "locacao",
  "sala comercial",
  "terreno",
  "vende-se",
  "venda",
  "vendo",
];

export function parseRealEstateMessage(text: string): RealEstateParserResult {
  if (!detectRealEstateMessage(text)) {
    return {
      listing: null,
      reason: "unsupported_domain",
      status: "rejected",
    };
  }

  return decideParserResult(extractRealEstateFields(text));
}

function detectRealEstateMessage(text: string): boolean {
  const normalizedText = normalizeText(text);

  return realEstateTerms.some((term) => normalizedText.includes(term));
}

function extractRealEstateFields(text: string): ExtractedRealEstateFields {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const location = extractLocation(lines);

  return {
    bedrooms: extractBedrooms(text),
    city: location.city,
    contactPhone: extractContactPhone(text),
    intent: extractIntent(text),
    locationText: location.locationText,
    neighborhood: location.neighborhood,
    priceAmount: extractPriceAmount(text),
    propertyType: extractPropertyType(text),
    state: location.state,
  };
}

function decideParserResult(fields: ExtractedRealEstateFields): RealEstateParserResult {
  if (!fields.intent) {
    return {
      listing: null,
      reason: "missing_intent",
      status: "unstructured",
    };
  }

  if (!fields.propertyType) {
    return {
      listing: null,
      reason: "missing_property_type",
      status: "unstructured",
    };
  }

  if (!fields.locationText) {
    return {
      listing: null,
      reason: "missing_location",
      status: "unstructured",
    };
  }

  if (!fields.priceAmount) {
    return {
      listing: null,
      reason: "missing_price",
      status: "unstructured",
    };
  }

  return {
    listing: {
      bedrooms: fields.bedrooms,
      city: fields.city,
      contactPhone: fields.contactPhone,
      intent: fields.intent,
      locationText: fields.locationText,
      neighborhood: fields.neighborhood,
      priceAmount: fields.priceAmount,
      propertyType: fields.propertyType,
      state: fields.state,
    },
    reason: null,
    status: "listing_created",
  };
}

function extractIntent(text: string): PropertyListingIntent | null {
  const normalizedText = normalizeText(text);

  if (/\b(vendo|vende-se|venda)\b/.test(normalizedText)) {
    return "sale";
  }

  if (/\b(alugo|aluga-se|aluguel|locacao)\b/.test(normalizedText)) {
    return "rental";
  }

  return null;
}

function extractPropertyType(text: string): PropertyListingType | null {
  const normalizedText = normalizeText(text);

  if (/\b(casa)\b/.test(normalizedText)) {
    return "house";
  }

  if (/\b(apartamento|apto)\b/.test(normalizedText)) {
    return "apartment";
  }

  if (/\b(terreno)\b/.test(normalizedText)) {
    return "land";
  }

  if (/\b(sala comercial|comercial)\b/.test(normalizedText)) {
    return "commercial";
  }

  return null;
}

function extractPriceAmount(text: string): number | null {
  const priceMatch = text.match(/R\$\s*([\d.]+)(?:,\d{2})?/i);

  if (!priceMatch) {
    return null;
  }

  const amount = Number.parseInt(priceMatch[1].replace(/\./g, ""), 10);

  return Number.isNaN(amount) ? null : amount;
}

function extractBedrooms(text: string): number | null {
  const normalizedText = normalizeText(text);
  const bedroomMatch = normalizedText.match(
    /\b(\d{1,2})\s*(quarto|quartos|dormitorio|dormitorios)\b/,
  );

  if (!bedroomMatch) {
    return null;
  }

  return Number.parseInt(bedroomMatch[1], 10);
}

function extractContactPhone(text: string): string | null {
  const phoneMatch = text.match(/(?:contato:\s*)?(\(?\d{2}\)?\s*\d{4,5}-?\d{4})/i);

  return phoneMatch?.[1] ?? null;
}

function extractLocation(lines: string[]) {
  const cityStateLineIndex = lines.findIndex((line) =>
    /^[A-Za-zÀ-ÿ\s]+-\s*[A-Za-z]{2}$/.test(line),
  );
  const cityStateLine = cityStateLineIndex >= 0 ? lines[cityStateLineIndex] : null;

  if (cityStateLine) {
    const [cityPart, statePart] = cityStateLine.split("-").map((part) => part.trim());
    const neighborhood = findNeighborhoodLine(lines, cityStateLineIndex);
    const locationText = neighborhood
      ? `${neighborhood}, ${cityPart} - ${statePart.toUpperCase()}`
      : `${cityPart} - ${statePart.toUpperCase()}`;

    return {
      city: cityPart,
      locationText,
      neighborhood,
      state: statePart.toUpperCase(),
    };
  }

  const fallbackLocation = lines.find((line) => isPotentialLocationLine(line)) ?? null;

  return {
    city: null,
    locationText: fallbackLocation,
    neighborhood: fallbackLocation,
    state: null,
  };
}

function findNeighborhoodLine(lines: string[], cityStateLineIndex: number): string | null {
  const previousLines = lines.slice(0, cityStateLineIndex).reverse();

  return previousLines.find((line) => isPotentialLocationLine(line)) ?? null;
}

function isPotentialLocationLine(line: string): boolean {
  const normalizedLine = normalizeText(line);

  if (normalizedLine.length < 3) {
    return false;
  }

  if (/^r\$/.test(normalizedLine)) {
    return false;
  }

  if (
    /\b(vendo|vende-se|venda|alugo|aluga-se|aluguel|contato|quarto|quartos)\b/.test(normalizedLine)
  ) {
    return false;
  }

  if (/\(?\d{2}\)?\s*\d{4,5}-?\d{4}/.test(line)) {
    return false;
  }

  return true;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
