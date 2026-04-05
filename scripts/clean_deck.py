#!/usr/bin/env python3
"""
clean_deck.py — Remove duplicate phrases from src/phrases.ts
Preserves comment lines and the original order of first occurrences.
"""

import re
from pathlib import Path

PHRASES_FILE = Path(__file__).parent.parent / "src" / "phrases.ts"


def main():
    text = PHRASES_FILE.read_text(encoding="utf-8")
    lines = text.splitlines()

    seen: set[str] = set()
    cleaned_lines: list[str] = []
    duplicates: list[str] = []

    for line in lines:
        # Match a phrase line: optional whitespace, a quoted string, optional comma
        match = re.match(r"^(\s*)'(.+)'(,?\s*)$", line)
        if match:
            phrase = match.group(2)
            if phrase in seen:
                duplicates.append(phrase)
                continue  # skip duplicate
            seen.add(phrase)

        cleaned_lines.append(line)

    PHRASES_FILE.write_text("\n".join(cleaned_lines) + "\n", encoding="utf-8")

    if duplicates:
        print(f"Found and removed {len(duplicates)} duplicate(s):")
        for p in duplicates:
            print(f"  - '{p}'")
    else:
        print("No duplicates found.")


if __name__ == "__main__":
    main()
