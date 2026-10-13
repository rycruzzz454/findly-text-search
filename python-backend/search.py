
def utf16_length(text: str) -> int:
    """Return the number of UTF-16 code units in a string."""
    return len(text.encode("utf-16-le", errors="surrogatepass")) // 2


def search_text(
    input_text: str,
    query: str,
    case_sensitive: bool = False
) -> dict:
    """
    Find non-overlapping literal matches.

    Return positions using UTF-16 offsets so Angular can
    highlight matches correctly.
    """
    if not isinstance(input_text, str) or not isinstance(query, str):
        raise ValueError("Input and query must be strings.")

    if not input_text or not query:
        return {
            "totalHits": 0,
            "hits": [],
            "truncated": False
        }

    hits = []
    max_hits = 10000

    # Compare one character at a time so case conversions
    # don't shift the original text positions.
    if case_sensitive:
        source = input_text
        term = query
    else:
        source = input_text.lower()
        term = query.lower()

    # Map offsets in the normalized text back to the
    # original input, including case-folding expansions.
    normalized_parts = [
        char if case_sensitive else char.lower()
        for char in input_text
    ]
    normalized_source = "".join(normalized_parts)

    start_map = []
    end_map = []

    for original_index, part in enumerate(normalized_parts):
        for _ in part:
            start_map.append(original_index)
            end_map.append(original_index + 1)

    position = 0

    while position < len(normalized_source):
        index = normalized_source.find(term, position)

        if index == -1:
            break

        normalized_end = index + len(term)

        start_index = start_map[index]
        end_index = end_map[normalized_end - 1]

        matched_text = input_text[start_index:end_index]

        preceding_text = input_text[:start_index]

        line = preceding_text.count("\n") + 1
        last_newline = preceding_text.rfind("\n")
        column = utf16_length(preceding_text[last_newline + 1:]) + 1

        hits.append({
            "start": utf16_length(preceding_text),
            "end": utf16_length(input_text[:end_index]),
            "line": line,
            "column": column,
            "text": matched_text
        })

        position = normalized_end

        if len(hits) >= max_hits:
            break

    return {
        "totalHits": len(hits),
        "hits": hits,
        "truncated": len(hits) >= max_hits
    }
