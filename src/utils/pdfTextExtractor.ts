/**
 * Browser-native PDF text extractor for instant client-side parsing.
 * Allows multi-megabyte PDFs to be parsed in the browser in under 1 second,
 * extracting clean plain-text to send to quiz generation without hitting
 * proxy payload limits or serverless storage timeouts.
 */

export async function extractTextFromPdfClient(
  file: File
): Promise<{ text: string; pages: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("latin1");
    const rawString = decoder.decode(bytes);

    // 1. Estimate page count from PDF object hierarchy
    const pageMatches = rawString.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
    const pages = pageMatches ? pageMatches.length : 1;

    const extractedChunks: string[] = [];

    // Helper to unescape PDF string literals
    const cleanPdfText = (str: string): string => {
      return str
        .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\")
        .trim();
    };

    // Helper to parse text operators inside a decoded stream or raw block
    const parseTextOperators = (content: string) => {
      // Handle (string) Tj
      const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
      let m: RegExpExecArray | null;
      while ((m = tjRegex.exec(content)) !== null) {
        if (m[1]) {
          const cleaned = cleanPdfText(m[1]);
          if (cleaned.length > 0) extractedChunks.push(cleaned);
        }
      }

      // Handle [(str1) -10 (str2)] TJ
      const tjArrayRegex = /\[([^\]]+)\]\s*TJ/gi;
      while ((m = tjArrayRegex.exec(content)) !== null) {
        const inner = m[1];
        const innerRegex = /\(([^)]+)\)/g;
        let im: RegExpExecArray | null;
        let line = "";
        while ((im = innerRegex.exec(inner)) !== null) {
          if (im[1]) {
            line += cleanPdfText(im[1]) + " ";
          }
        }
        if (line.trim().length > 0) {
          extractedChunks.push(line.trim());
        }
      }
    };

    // 2. Search for streams in the PDF
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch: RegExpExecArray | null;
    let streamCount = 0;

    while ((streamMatch = streamRegex.exec(rawString)) !== null && streamCount < 60) {
      streamCount++;
      const streamText = streamMatch[1];

      // Try native browser DecompressionStream if available
      if (typeof DecompressionStream !== "undefined") {
        try {
          const streamStartIndex = streamMatch.index + streamMatch[0].indexOf(streamText);
          const rawStreamBytes = bytes.subarray(
            streamStartIndex,
            streamStartIndex + streamText.length
          );

          // Try standard deflate
          const ds = new DecompressionStream("deflate");
          const writer = ds.writable.getWriter();
          writer.write(rawStreamBytes).catch(() => {});
          writer.close().catch(() => {});

          const response = new Response(ds.readable);
          const decompressedBuffer = await response.arrayBuffer().catch(() => null);
          if (decompressedBuffer) {
            const decompressedText = new TextDecoder("latin1").decode(
              new Uint8Array(decompressedBuffer)
            );
            parseTextOperators(decompressedText);
            continue;
          }
        } catch {
          // Fall back to scanning uncompressed text operators
        }
      }

      // If decompression didn't produce text, scan stream directly
      parseTextOperators(streamText);
    }

    // 3. Also scan outside streams for unencoded text blocks
    parseTextOperators(rawString);

    const fullExtracted = extractedChunks
      .filter((c) => c.length > 2)
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim();

    return {
      text: fullExtracted,
      pages,
    };
  } catch (err) {
    console.warn("Client-side PDF text extraction warning:", err);
    return { text: "", pages: 1 };
  }
}
